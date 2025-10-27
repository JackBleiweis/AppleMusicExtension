import * as vscode from 'vscode';
import { AppleMusicController } from './appleMusicController';
import { NowPlayingStatusBar } from './statusBar';
import { MusicPanel } from './musicPanel';

export function activate(context: vscode.ExtensionContext) {
    console.log('Apple Music Extension is now active');

    const controller = new AppleMusicController();
    const statusBar = new NowPlayingStatusBar();

    // Register the webview view provider for the sidebar
    const provider = new MusicPanel(context.extensionUri);
    
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('appleMusicView', provider)
    );

    // Register commands
    const togglePlayPause = vscode.commands.registerCommand('appleMusic.togglePlayPause', async () => {
        await controller.togglePlayPause();
        statusBar.update();
        MusicPanel.refresh();
    });

    const nextTrack = vscode.commands.registerCommand('appleMusic.nextTrack', async () => {
        await controller.nextTrack();
        statusBar.update();
        MusicPanel.refresh();
    });

    const previousTrack = vscode.commands.registerCommand('appleMusic.previousTrack', async () => {
        await controller.previousTrack();
        statusBar.update();
        MusicPanel.refresh();
    });

    const volumeUp = vscode.commands.registerCommand('appleMusic.volumeUp', async () => {
        await controller.volumeUp();
    });

    const volumeDown = vscode.commands.registerCommand('appleMusic.volumeDown', async () => {
        await controller.volumeDown();
    });

    const toggleMute = vscode.commands.registerCommand('appleMusic.toggleMute', async () => {
        await controller.toggleMute();
        statusBar.update();
        MusicPanel.refresh();
    });

    const showNowPlaying = vscode.commands.registerCommand('appleMusic.showNowPlaying', async () => {
        const trackInfo = await controller.getTrackInfo();
        if (!trackInfo) {
            vscode.window.showWarningMessage('No track is currently playing');
            return;
        }

        // Create and show webview panel with track info and artwork
        const panel = vscode.window.createWebviewPanel(
            'appleMusicInfo',
            'Now Playing',
            vscode.ViewColumn.Beside,
            {}
        );

        panel.webview.html = getWebviewContent(trackInfo);
    });

    // Register tree view refresh command

    context.subscriptions.push(
        togglePlayPause,
        nextTrack,
        previousTrack,
        toggleMute,
        volumeUp,
        volumeDown,
        showNowPlaying,
        statusBar
    );

    // Start updating the status bar
    const updateInterval = setInterval(() => {
        statusBar.update();
    }, 5000); // Update every 5 seconds

    context.subscriptions.push({
        dispose: () => clearInterval(updateInterval)
    });

    // Initial update
    statusBar.update();
}


function getWebviewContent(trackInfo: any): string {
    // Extract values safely
    const trackName = trackInfo?.name || 'Unknown';
    const trackArtist = trackInfo?.artist || 'Unknown';
    const trackAlbum = trackInfo?.album || '';
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Now Playing</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 48px;
            background: #1e1e1e;
            color: #cccccc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            text-align: center;
            max-width: 600px;
        }
        .music-icon {
            font-size: 100px;
            margin-bottom: 24px;
        }
        h1 {
            font-size: 28px;
            margin: 0 0 8px;
            color: #ffffff;
            font-weight: 600;
        }
        .artist {
            font-size: 20px;
            margin: 0 0 8px;
            color: #adadad;
            font-weight: 400;
        }
        .album {
            font-size: 16px;
            margin: 0;
            color: #808080;
            font-weight: 400;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="music-icon">🎵</div>
        <h1>${escapeHtml(trackName)}</h1>
        <div class="artist">${escapeHtml(trackArtist)}</div>
        ${trackAlbum ? `<div class="album">${escapeHtml(trackAlbum)}</div>` : ''}
    </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

