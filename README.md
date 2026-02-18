# elgato-teams-video — Microsoft Teams Controls for Stream Deck

A Stream Deck plugin providing convenient Microsoft Teams meeting controls directly from your Elgato Stream Deck. Based on [zerm](https://github.com/maxbeizer/zerm) (the Zoom version).

## Features

- **Mute Toggle**: Toggle your Teams audio mute status with a single button press
- **Video Toggle**: Toggle your Teams camera/video with a single button press
- **Screen Share**: Start or stop screen sharing in Teams meetings
- **Focus Teams**: Bring the Teams application to the foreground instantly
- **Leave Meeting**: Leave the current Teams meeting with a single button press
- Works even when Teams is not the active application

## Requirements

- macOS 12+ (uses AppleScript — not supported on Windows)
- Stream Deck Software (minimum version 6.4)
- Microsoft Teams desktop client (with default keyboard shortcuts)
- Node.js v20+ (for development)

## Keyboard Shortcuts Used

| Action       | Shortcut |
|-------------|----------|
| Mute Toggle | ⇧⌘M     |
| Video Toggle| ⇧⌘O     |
| Screen Share| ⇧⌘E     |
| Leave Meeting| ⇧⌘B    |

> **Note:** These are the default Teams keyboard shortcuts. If you've customized them, the plugin will not work correctly.

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `./script/build` to build and install the plugin

### Distribution/Release

For information on packaging and releasing this plugin to the Stream Deck Store, see the [Release Documentation](docs/RELEASE.md).

## Development

For developers wanting to extend or modify this plugin:

- Run `./script/run` for development with live reloading
- Run `./script/convert-icons` to convert SVG icons to PNG format
- Check `.github/copilot-instructions.md` for detailed developer guidance

### Icons

The plugin uses SVG files as the source for all icons, which are then converted to PNG files during the build process. To modify icons:

1. Edit the SVG files in `com.max-beizer.elgato-teams-video.sdPlugin/imgs/actions/[action-name]/`
2. Run `./script/build` which automatically converts SVGs to PNGs before building using ImageMagick's `magick` command

## How It Works

The plugin uses AppleScript to:

1. Remember which application is currently active
2. Briefly activate Microsoft Teams
3. Send keyboard shortcuts to control Teams
4. Return to the original application

Since Microsoft Teams may not expose menu bar items to AppleScript's `System Events`, this plugin uses **optimistic state tracking** — it assumes each button press toggles the state and tracks it in-plugin. State resets to defaults when the Stream Deck profile loads.

> **Caveat:** If you toggle mute/video/share directly in Teams (not via Stream Deck), the button state may drift out of sync. Reloading the Stream Deck profile will reset all states.

## Project Structure

```
src/
  plugin.ts                    # Entry point — registers all actions
  teams-utils.ts               # Shared Teams process detection & AppleScript helpers
  actions/
    teams-mute-toggle.ts       # Mute toggle implementation
    teams-video-toggle.ts      # Video toggle implementation
    teams-share-screen.ts      # Screen share implementation
    teams-focus.ts             # Focus Teams implementation
    teams-leave-meeting.ts     # Leave meeting implementation
com.max-beizer.elgato-teams-video.sdPlugin/
  manifest.json                # Plugin configuration and metadata
  imgs/                        # Icons and images
  ui/                          # HTML property inspectors
script/
  build                        # Build, convert icons, restart plugin
  run                          # Watch mode for development
  convert-icons                # SVG → PNG conversion
```

## License

MIT
