import * as vscode from 'vscode';
import { AppleMusicController, TrackInfo } from './appleMusicController';

class MusicItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly iconPath?: vscode.ThemeIcon,
        public readonly command?: vscode.Command,
        public readonly collapsibleState?: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.tooltip = label;
        this.contextValue = 'musicItem';
    }
}

export class MusicTreeDataProvider implements vscode.TreeDataProvider<MusicItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<MusicItem | undefined | null | void> = new vscode.EventEmitter<MusicItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<MusicItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private controller: AppleMusicController;

    constructor() {
        this.controller = new AppleMusicController();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: MusicItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: MusicItem): Thenable<MusicItem[]> {
        if (!element) {
            // Return root items
            return this.getTrackInfo();
        }
        
        return Promise.resolve([]);
    }

    private async getTrackInfo(): Promise<MusicItem[]> {
        try {
            const trackInfo = await this.controller.getTrackInfo();
            const state = await this.controller.getPlayerState();
            
            if (!trackInfo) {
                return [
                    new MusicItem('No track playing', new vscode.ThemeIcon('info'))
                ];
            }

            const items: MusicItem[] = [
                new MusicItem(
                    'Now Playing',
                    undefined,
                    undefined,
                    vscode.TreeItemCollapsibleState.None
                ),
                new MusicItem(
                    `🎵 ${trackInfo.name}`,
                    new vscode.ThemeIcon('file-media')
                ),
                new MusicItem(
                    `🎤 ${trackInfo.artist}`,
                    new vscode.ThemeIcon('person')
                )
            ];

            if (trackInfo.album) {
                items.push(new MusicItem(
                    `💿 ${trackInfo.album}`,
                    new vscode.ThemeIcon('library')
                ));
            }

            items.push(
                new MusicItem('', undefined, undefined, undefined), // Separator
                new MusicItem(
                    'Controls',
                    undefined,
                    undefined,
                    vscode.TreeItemCollapsibleState.None
                ),
                new MusicItem(
                    state === 'playing' ? '⏸️ Pause' : '▶️ Play',
                    state === 'playing' ? new vscode.ThemeIcon('debug-pause') : new vscode.ThemeIcon('play'),
                    {
                        command: 'appleMusic.togglePlayPause',
                        title: 'Play/Pause'
                    }
                ),
                new MusicItem(
                    '⏮️ Previous Track',
                    new vscode.ThemeIcon('arrow-left'),
                    {
                        command: 'appleMusic.previousTrack',
                        title: 'Previous Track'
                    }
                ),
                new MusicItem(
                    '⏭️ Next Track',
                    new vscode.ThemeIcon('arrow-right'),
                    {
                        command: 'appleMusic.nextTrack',
                        title: 'Next Track'
                    }
                ),
                new MusicItem(
                    '🔇 Mute/Unmute',
                    new vscode.ThemeIcon('mute'),
                    {
                        command: 'appleMusic.toggleMute',
                        title: 'Mute/Unmute'
                    }
                ),
                new MusicItem(
                    '🔊 Volume Up',
                    new vscode.ThemeIcon('arrow-up'),
                    {
                        command: 'appleMusic.volumeUp',
                        title: 'Volume Up'
                    }
                ),
                new MusicItem(
                    '🔉 Volume Down',
                    new vscode.ThemeIcon('arrow-down'),
                    {
                        command: 'appleMusic.volumeDown',
                        title: 'Volume Down'
                    }
                )
            );

            return items;
        } catch (error) {
            return [
                new MusicItem('Error loading track info', new vscode.ThemeIcon('error'))
            ];
        }
    }
}

