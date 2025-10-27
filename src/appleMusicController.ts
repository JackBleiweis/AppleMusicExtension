import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface TrackInfo {
    name: string;
    artist: string;
    album?: string;
    duration?: string;
    position?: string;
}

export class AppleMusicController {
    private previousVolume = 50; // Store previous volume for unmute
    
    /**
     * Execute an AppleScript command
     */
    private async runScript(script: string): Promise<string> {
        try {
            // Properly escape the script for shell execution
            const escapedScript = script.replace(/'/g, "'\"'\"'");
            const command = `osascript -e '${escapedScript}'`;
            const { stdout } = await execAsync(command);
            return stdout.trim();
        } catch (error: any) {
            console.error('Error executing AppleScript:', error);
            if (error.stderr) {
                console.error('AppleScript error:', error.stderr);
            }
            return '';
        }
    }

    /**
     * Get current track information
     */
    async getTrackInfo(): Promise<TrackInfo | null> {
        try {
            const script = `
                if application "Music" is running then
                    tell application "Music"
                        if player state is playing then
                            set trackName to name of current track
                            set trackArtist to artist of current track
                            set trackAlbum to album of current track
                            return trackArtist & "|" & trackName & "|" & trackAlbum
                        else
                            return ""
                        end if
                    end tell
                else
                    return ""
                end if
            `;
            
            const result = await this.runScript(script);
            
            if (!result || result === '') {
                return null;
            }
            
            const parts = result.split('|');
            if (parts.length >= 3) {
                const [artist, name, album] = parts;
                return { 
                    artist, 
                    name, 
                    album: album || undefined
                };
            } else {
                // Fallback
                const [artist, name] = parts;
                return { artist, name };
            }
        } catch (error) {
            console.error('Error getting track info:', error);
            return null;
        }
    }

    /**
     * Toggle play/pause
     */
    async togglePlayPause(): Promise<void> {
        const script = `
            tell application "Music"
                playpause
            end tell
        `;
        await this.runScript(script);
    }

    /**
     * Play next track
     */
    async nextTrack(): Promise<void> {
        const script = `
            tell application "Music"
                next track
            end tell
        `;
        await this.runScript(script);
    }

    /**
     * Play previous track
     */
    async previousTrack(): Promise<void> {
        const script = `
            tell application "Music"
                previous track
            end tell
        `;
        await this.runScript(script);
    }

    /**
     * Get system volume level (0-100)
     */
    async getSystemVolume(): Promise<number> {
        const script = `
            output volume of (get volume settings)
        `;
        
        try {
            const result = await this.runScript(script);
            const volume = parseInt(result, 10);
            return isNaN(volume) ? 0 : volume;
        } catch {
            return 0;
        }
    }

    /**
     * Set system volume (0-100)
     */
    async setSystemVolume(volume: number): Promise<void> {
        const clampedVolume = Math.max(0, Math.min(100, volume));
        const script = `
            set volume output volume ${clampedVolume}
        `;
        await this.runScript(script);
    }

    /**
     * Increase system volume by 5%
     */
    async volumeUp(): Promise<void> {
        const currentVolume = await this.getSystemVolume();
        const newVolume = Math.min(100, currentVolume + 5);
        await this.setSystemVolume(newVolume);
    }

    /**
     * Decrease system volume by 5%
     */
    async volumeDown(): Promise<void> {
        const currentVolume = await this.getSystemVolume();
        const newVolume = Math.max(0, currentVolume - 5);
        await this.setSystemVolume(newVolume);
    }

    /**
     * Check if system is currently muted
     */
    async isMuted(): Promise<boolean> {
        const currentVolume = await this.getSystemVolume();
        return currentVolume === 0;
    }

    /**
     * Toggle mute/unmute system volume
     */
    async toggleMute(): Promise<void> {
        const currentVolume = await this.getSystemVolume();
        
        if (currentVolume === 0) {
            // Unmute: restore previous volume
            await this.setSystemVolume(this.previousVolume || 50);
        } else {
            // Mute: store current volume and set to 0
            this.previousVolume = currentVolume;
            await this.setSystemVolume(0);
        }
    }

    /**
     * Get player state (playing/paused/stopped)
     */
    async getPlayerState(): Promise<'playing' | 'paused' | 'stopped'> {
        const script = `
            tell application "Music"
                return player state as string
            end tell
        `;
        
        const result = await this.runScript(script);
        const state = result.toLowerCase();
        
        if (state === 'playing') {
            return 'playing';
        } else if (state === 'paused') {
            return 'paused';
        }
        return 'stopped';
    }
}

