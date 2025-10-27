import * as vscode from 'vscode';
import { AppleMusicController, TrackInfo } from './appleMusicController';

export class MusicPanel implements vscode.WebviewViewProvider {
    private static currentPanel: MusicPanel | undefined;
    private _webview?: vscode.WebviewView;
    private controller: AppleMusicController;
    private _disposables: vscode.Disposable[] = [];
    private refreshInterval?: NodeJS.Timeout;
    private extensionUri: vscode.Uri;
    private currentSongId = '';
    private currentGradient = '';

    constructor(extensionUri: vscode.Uri) {
        this.extensionUri = extensionUri;
        this.controller = new AppleMusicController();
    }

    public static refresh() {
        if (MusicPanel.currentPanel && MusicPanel.currentPanel._webview) {
            MusicPanel.currentPanel.updateContent();
        }
    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._webview = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: []
        };

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'previousTrack':
                        vscode.commands.executeCommand('appleMusic.previousTrack');
                        break;
                    case 'togglePlayPause':
                        vscode.commands.executeCommand('appleMusic.togglePlayPause');
                        break;
                    case 'nextTrack':
                        vscode.commands.executeCommand('appleMusic.nextTrack');
                        break;
                    case 'volumeUp':
                        vscode.commands.executeCommand('appleMusic.volumeUp');
                        break;
                    case 'volumeDown':
                        vscode.commands.executeCommand('appleMusic.volumeDown');
                        break;
                }
            },
            null,
            this._disposables
        );

        MusicPanel.currentPanel = this;
        
        // Start auto-refresh
        this.startAutoRefresh();
        
        // Initial update
        this.updateContent();
    }

    private startAutoRefresh() {
        this.refreshInterval = setInterval(() => {
            this.updateContent();
        }, 2000); // Update every 2 seconds for smooth progress bar
    }

    public dispose() {
        MusicPanel.currentPanel = undefined;

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private async updateContent() {
        try {
            const trackInfo = await this.controller.getTrackInfo();
            const state = await this.controller.getPlayerState();
            const volume = await this.controller.getSystemVolume();
            
            // Check if song changed
            const songId = trackInfo ? `${trackInfo.name}|${trackInfo.artist}` : '';
            if (songId !== this.currentSongId) {
                this.currentSongId = songId;
                this.currentGradient = this.generateRandomDarkGradient();
            }
            
            const html = this.getWebviewContent(trackInfo, state, volume, this.currentGradient);
            if (this._webview) {
                this._webview.webview.html = html;
            }
        } catch (error) {
            console.error('Error updating music panel:', error);
        }
    }

    private generateRandomDarkGradient(): string {
        // Generate a random dark color
        const hues = ['purple', 'blue', 'green', 'brown', 'navy', 'maroon', 'olive', 'teal'];
        const colors = [
            'linear-gradient(135deg, #2d1b4e 0%, #1a0e2e 100%)', // Purple
            'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', // Blue
            'linear-gradient(135deg, #1a5f3f 0%, #0d3d26 100%)', // Green
            'linear-gradient(135deg, #5d4e37 0%, #3d2f1f 100%)', // Brown
            'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', // Navy
            'linear-gradient(135deg, #7d2f2f 0%, #4a1a1a 100%)', // Maroon
            'linear-gradient(135deg, #2e5a2a 0%, #1a3419 100%)', // Olive
            'linear-gradient(135deg, #1e4a4e 0%, #0f2a2d 100%)', // Teal
            'linear-gradient(135deg, #4a2c5a 0%, #2d1b36 100%)', // Dark purple
            'linear-gradient(135deg, #2c4a7d 0%, #1a2e4f 100%)', // Dark blue
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }

    private _getHtml(webview: vscode.Webview): string {
        return '<div>Loading...</div>';
    }

    private getWebviewContent(trackInfo: TrackInfo | null, state: string, volume: number, gradient: string): string {
        if (!trackInfo) {
            return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            background: #28a745;
            color: #fff;
            font-family: -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .message { text-align: center; }
    </style>
</head>
<body>
    <div class="message">No track playing</div>
</body>
</html>`;
        }

        const playPauseIcon = state === 'playing' ? '⏸' : '▶';
        
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: ${gradient || 'linear-gradient(135deg, #2d1b4e 0%, #1a0e2e 100%)'};
            background-attachment: fixed;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            height: 100vh;
            display: flex;
            flex-direction: column;
            margin: 0;
            transition: background 2.5s ease;
        }
        .content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 4px;
        }
        .track-name {
            font-size: 12px;
            font-weight: 700;
            text-align: center;
            margin: 0 0 12px 0;
            letter-spacing: -0.3px;
            line-height: 1.2;
        }
        .artist-album {
            font-size: 12px;
            text-align: center;
            margin: 0;
            opacity: 0.95;
            font-weight: 400;
            letter-spacing: 0.2px;
        }
        .controls {
            display: flex;
            flex-direction: column;
            gap: 0px;
            width: 100%;
            max-width: 400px;
            margin-top: 4px;
        }
        .buttons {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        .btn {
            background: transparent;
            border: none;
            padding: 0;
            margin: 0;
            color: #fff;
            font-size: 28px;
            cursor: pointer;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: opacity 0.2s ease;
        }
        .btn:hover {
            opacity: 0.6;
        }
        .btn:active {
            opacity: 0.4;
        }
        .btn-main {
            font-size: 32px;
            width: 72px;
            height: 72px;
        }
        .volume-controls {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
    </style>
    <script>
        const vscode = acquireVsCodeApi();
        
        function previousTrack() {
            vscode.postMessage({ command: 'previousTrack' });
        }
        
        function togglePlayPause() {
            vscode.postMessage({ command: 'togglePlayPause' });
        }
        
        function nextTrack() {
            vscode.postMessage({ command: 'nextTrack' });
        }
        
        function volumeUp() {
            vscode.postMessage({ command: 'volumeUp' });
        }
        
        function volumeDown() {
            vscode.postMessage({ command: 'volumeDown' });
        }
    </script>
</head>
<body>
    <div class="content">
        <div class="track-name">${this.escapeHtml(trackInfo.name)}</div>
        <div class="artist-album">${this.escapeHtml(trackInfo.artist)}${trackInfo.album ? ' - ' + this.escapeHtml(trackInfo.album) : ''}</div>
    </div>
    <div class="controls">
        <div class="buttons">
            <button class="btn" onclick="previousTrack()">⏮</button>
            <button class="btn btn-main" onclick="togglePlayPause()">${playPauseIcon}</button>
            <button class="btn" onclick="nextTrack()">⏭</button>
        </div>
        <div class="volume-controls">
            <button class="btn" onclick="volumeDown()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" id="Speaker-Medium-Volume--Streamline-Emojitwo-Black" height="32" width="32">
                    <desc>
                        Speaker Medium Volume Streamline Emoji: https://streamlinehq.com
                    </desc>
                    <g>
                        <path fill="#ffffff" d="M27.8802 15.99895c0 -2.86735 -1.66205 -5.3547 -4.07365 -6.549l-1.37305 1.37565c2.121 0.76255 3.64145 2.79365 3.64145 5.17335 0 2.37135 -1.50845 4.3967 -3.61635 5.1671l1.37145 1.37145c2.39905 -1.199 4.0507 -3.6785 4.0507 -6.53855Z" stroke-width="0.5"></path>
                        <path fill="#ffffff" d="M23.71925 16c0 -1.77235 -1.5356 -3.20815 -3.4292 -3.20815V1.04545c0 -0.40085 -0.34755 -0.72545 -0.77615 -0.72545 -0.42755 0 -0.7751 0.3246 -0.7751 0.72545v0.3643c-0.56605 0.45945 -9.1676 8.2205 -9.1676 8.2205h-3.5991c-1.02335 0 -1.85285 0.77515 -1.85285 1.73265v9.27265c0 0.95805 0.8295 1.73315 1.85285 1.73315h3.59965v0.00105s5.0338 3.8489 9.16755 8.20845v0.3753c0 0.4009 0.3476 0.7265 0.7751 0.7265 0.4286 0 0.7762 -0.3256 0.7762 -0.7265V19.2071c1.8936 0 3.42865 -1.4363 3.42865 -3.2071Z" stroke-width="0.5"></path>
                    </g>
                </svg>
            </button>
            <button class="btn" onclick="volumeUp()">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" id="Speaker-High-Volume--Streamline-Emojitwo-Black" height="32" width="32">
                <desc>
                    Speaker High Volume Streamline Emoji: https://streamlinehq.com
                </desc>
                    <g>
                        <path fill="#ffffff" d="M25.107 4.4615 23.868 5.7c3.2625 2.264 5.4035 6.036 5.4035 10.299 0 4.2555 -2.1335 8.021 -5.3855 10.286l1.239 1.239C28.6825 24.929 31 20.7295 31 15.999c0 -4.738 -2.325 -8.944 -5.893 -11.5375Z" stroke-width="0.5"></path>
                        <path fill="#ffffff" d="M27.3275 15.999c0 -3.728 -1.938 -7.012 -4.8605 -8.898l-1.257 1.257c2.6235 1.539 4.3885 4.387 4.3885 7.641 0 3.2465 -1.756 6.0895 -4.3675 7.63l1.255 1.2565c2.912 -1.888 4.8415 -5.166 4.8415 -8.8865Z" stroke-width="0.5"></path>
                        <path fill="#ffffff" d="M23.7305 15.999c0 -2.743 -1.59 -5.1225 -3.897 -6.265L18.52 11.05c2.029 0.7295 3.4835 2.6725 3.4835 4.949 0 2.2685 -1.443 4.206 -3.4595 4.943l1.312 1.312c2.295 -1.147 3.875 -3.519 3.875 -6.255Z" stroke-width="0.5"></path>
                        <path fill="#ffffff" d="M19.75 16c0 -1.6955 -1.469 -3.069 -3.2805 -3.069V1.694c0 -0.3835 -0.3325 -0.694 -0.7425 -0.694 -0.409 0 -0.7415 0.3105 -0.7415 0.694v0.3485c-0.5415 0.4395 -8.77 7.864 -8.77 7.864H2.7725C1.7935 9.9065 1 10.648 1 11.564v8.8705c0 0.9165 0.7935 1.658 1.7725 1.658h3.4435v0.001s4.8155 3.682 8.77 7.8525v0.359c0 0.3835 0.3325 0.695 0.7415 0.695 0.41 0 0.7425 -0.3115 0.7425 -0.695V19.068c1.8115 0 3.28 -1.374 3.28 -3.068Z" stroke-width="0.5"></path>
                    </g>
                </svg>
            </button>
        </div>
    </div>
</body>
</html>`;
    }

    private escapeHtml(text: string): string {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

