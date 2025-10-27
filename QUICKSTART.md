# Quick Start Guide

## How to Run the Extension

### Method 1: Test in Extension Development Host (Recommended)

1. **Open the project in Cursor/VS Code**

   ```bash
   code /Library/Projects/AppleMusicExtension
   ```

2. **Start debugging** using ONE of these methods:

   - **Press Fn+F5** (Fn key + F5 on Mac)
   - **OR go to**: Run → Start Debugging from menu
   - **OR press**: Cmd+Shift+P → type "Debug: Start Debugging"

   This will compile the extension and open a new window called "Extension Development Host"

   - The extension will be active in that new window

3. **Open Apple Music** (if not already running) and start playing a song

4. **Look at the bottom-right corner** of the Extension Development Host window

   - You should see the current track info (e.g., "▶️ Artist - Song Name")
   - It updates automatically every 5 seconds

5. **Try the commands**:
   - Click the status bar item to see track info
   - Press `Cmd+Shift+P` and type "Apple Music" to see all commands
   - You can bind keyboard shortcuts if desired

### Method 2: Install as a Package

1. **Package the extension**:

   ```bash
   npm install -g vsce
   vsce package
   ```

2. **Install in VS Code/Cursor**:
   - Open Command Palette (`Cmd+Shift+P`)
   - Type "Extensions: Install from VSIX..."
   - Select the generated `.vsix` file

## Troubleshooting

- **Nothing appears in status bar?**
  - Make sure Apple Music is playing a track
  - Check that the extension is loaded (check the Output panel)
- **Commands not working?**
  - Make sure Apple Music app is running on your Mac
  - Check Console for errors

## Development Mode

While testing, you can keep the extension running and edit the code. Changes will require:

- Stopping the debug session (Shift+F5)
- Pressing F5 again to restart

Or use `npm run watch` in a terminal to auto-compile on changes (then just reload the window).
