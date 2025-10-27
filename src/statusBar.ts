import * as vscode from 'vscode';
import { AppleMusicController } from './appleMusicController';

export class NowPlayingStatusBar {
    private nowPlayingItem: vscode.StatusBarItem;
    private playPauseItem: vscode.StatusBarItem;
    private previousItem: vscode.StatusBarItem;
    private nextItem: vscode.StatusBarItem;
    private volumeDownItem: vscode.StatusBarItem;
    private volumeUpItem: vscode.StatusBarItem;
    private muteItem: vscode.StatusBarItem;
    
    private controller: AppleMusicController;
    private updateTimeout?: NodeJS.Timeout;

    constructor() {
        this.controller = new AppleMusicController();

        // Control buttons (positioned to the left)
        this.muteItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            201
        );
        this.muteItem.command = 'appleMusic.toggleMute';
        this.muteItem.text = '$(unmute)';
        this.muteItem.tooltip = 'Mute/Unmute';
        
        this.volumeUpItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            202
        );
        this.volumeUpItem.command = 'appleMusic.volumeUp';
        this.volumeUpItem.text = '$(arrow-up)';
        this.volumeUpItem.tooltip = 'System Volume Up';
        
        this.volumeDownItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            203
        );
        this.volumeDownItem.command = 'appleMusic.volumeDown';
        this.volumeDownItem.text = '$(arrow-down)';
        this.volumeDownItem.tooltip = 'System Volume Down';
        
        this.nextItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            204
        );
        this.nextItem.command = 'appleMusic.nextTrack';
        this.nextItem.text = '⏭';
        this.nextItem.tooltip = 'Next Track';
        
        this.playPauseItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            205
        );
        this.playPauseItem.command = 'appleMusic.togglePlayPause';
        this.playPauseItem.tooltip = 'Play/Pause';
        
        this.previousItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            206
        );
        this.previousItem.command = 'appleMusic.previousTrack';
        this.previousItem.text = '⏮';
        this.previousItem.tooltip = 'Previous Track';



        // Now Playing display (far right)
        this.nowPlayingItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            207
        );
        this.nowPlayingItem.command = 'appleMusic.showNowPlaying';
        this.nowPlayingItem.tooltip = 'Click for full track info';
                
        
        // Show all control buttons
        this.muteItem.show();
        this.previousItem.show();
        this.playPauseItem.show();
        this.nextItem.show();
        this.volumeDownItem.show();
        this.volumeUpItem.show();
    }

    /**
     * Update the status bar with current track info
     */
    async update(): Promise<void> {
        try {
            const trackInfo = await this.controller.getTrackInfo();
            const state = await this.controller.getPlayerState();
            
            console.log('Status bar update - trackInfo:', trackInfo, 'state:', state);
            
            // Update play/pause icon
            if (state === 'playing') {
                this.playPauseItem.text = '$(debug-pause)';
            } else {
                this.playPauseItem.text = '$(play)';
            }
            
            // Update now playing display
            if (trackInfo && trackInfo.artist && trackInfo.name) {
                const icon = state === 'playing' ? '▶️' : '⏸️';
                const displayText = `${icon} ${trackInfo.artist} - ${trackInfo.name}`;
                this.nowPlayingItem.text = this.truncateText(displayText, 50);
            } else if (state === 'playing') {
                this.nowPlayingItem.text = '🎵 Playing...';
            } else {
                this.nowPlayingItem.text = '🎵 Apple Music';
            }
            
            // Update mute icon
            const isMuted = await this.controller.isMuted();
            this.muteItem.text = isMuted ? '$(mute)' : '$(unmute)';
            
            this.nowPlayingItem.show();
        } catch (error) {
            console.error('Error updating status bar:', error);
            this.nowPlayingItem.text = '🎵 Apple Music';
            this.nowPlayingItem.show();
        }
    }

    /**
     * Truncate text to fit in status bar
     */
    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - 3) + '...';
    }

    /**
     * Dispose of all status bar items
     */
    dispose(): void {
        this.nowPlayingItem.dispose();
        this.playPauseItem.dispose();
        this.previousItem.dispose();
        this.nextItem.dispose();
        this.volumeDownItem.dispose();
        this.volumeUpItem.dispose();
        this.muteItem.dispose();
        
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }
}

