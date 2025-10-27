# Apple Music Extension for VS Code/Cursor

Control Apple Music playback directly from your IDE! This extension lets you view what's currently playing and control playback, volume, and track navigation.

## Features

- 🎵 **View Now Playing**: See the current track and artist in your status bar
- ▶️ **Play/Pause**: Toggle playback with a single command
- ⏭️ **Track Navigation**: Skip to next or previous tracks
- 🔊 **Volume Control**: Adjust volume up or down in 5% increments
- 📊 **Status Bar Integration**: Always visible track information

## Commands

- `appleMusic.togglePlayPause` - Play/Pause playback
- `appleMusic.nextTrack` - Play next track
- `appleMusic.previousTrack` - Play previous track
- `appleMusic.volumeUp` - Increase volume by 5%
- `appleMusic.volumeDown` - Decrease volume by 5%
- `appleMusic.showNowPlaying` - Display current track information

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press `F5` to launch the Extension Development Host

Or package it as a `.vsix` file:

```bash
npm run package
# Then install the .vsix file through VS Code/Cursor
```

## Requirements

- macOS (Apple Music integration)
- VS Code or Cursor IDE version 1.74.0 or higher

## Usage

Once installed, the extension will:

- Display current track information in your status bar
- Update automatically every 5 seconds
- Provide keyboard shortcuts for all playback controls

You can click on the status bar item to see full track information, or right-click to access commands.

## Development

- Source files are in the `src` directory
- Run `npm run watch` to automatically compile on changes
- Run tests with `npm test`

## License

MIT
