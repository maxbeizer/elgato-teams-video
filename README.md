# elgato-teams-video — Microsoft Teams Controls for Stream Deck

A Stream Deck plugin providing convenient Microsoft Teams meeting controls directly from your Elgato Stream Deck. Based on [zerm](https://github.com/maxbeizer/zerm) (the Zoom version).

## Features

- **Mute Toggle**: Toggle your Teams audio mute status with a single button press
- **Video Toggle**: Toggle your Teams camera/video with a single button press
- **Screen Share**: Start or stop screen sharing in Teams meetings
- **Focus Teams**: Bring the Teams application to the foreground instantly
- **Leave Meeting**: Leave the current Teams meeting with a single button press
- **Chat Toggle**: Show or hide the chat pane in the current Teams meeting
- Works even when Teams is not the active application

## Requirements

- macOS 12+ (uses AppleScript — not supported on Windows)
- Stream Deck Software (minimum version 6.4)
- Microsoft Teams desktop client (with default keyboard shortcuts)
- Node.js v20+ (for development)
- ImageMagick (`brew install imagemagick`) for converting the SVG icons

## Keyboard Shortcuts Used

| Action       | Shortcut |
|-------------|----------|
| Mute Toggle | ⇧⌘M     |
| Video Toggle| ⇧⌘O     |
| Screen Share| ⇧⌘E     |
| Leave Meeting| ⇧⌘H    |

Chat Toggle has no Teams shortcut. It brings the meeting window (the one with a **Leave** button) to the front and presses its **Chat** button through the macOS accessibility API, and leaves Teams in front. Each press writes the buttons it found to `com.max-beizer.elgato-teams-video.sdPlugin/logs/`, which helps if a Teams update renames the button.

> **Note:** These are the default Teams keyboard shortcuts. If you've customized them, the plugin will not work correctly.

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Set up the ImageMagick font map (one time only, see [ImageMagick fonts](#imagemagick-fonts))
4. Link the plugin into Stream Deck (one time only):
   ```sh
   npx streamdeck link com.max-beizer.elgato-teams-video.sdPlugin
   ```
   This symlinks the `.sdPlugin` folder into `~/Library/Application Support/com.elgato.StreamDeck/Plugins/`, so later builds update the installed plugin in place. Without it, the build fails with `Plugin not found: com.max-beizer.elgato-teams-video`. To remove it, run `npx streamdeck unlink com.max-beizer.elgato-teams-video`.
5. Run `./script/build` to convert icons, build, and restart the plugin
6. Quit and reopen the Stream Deck application so the Teams actions appear in the action list

### ImageMagick fonts

Some icons (`teams-focus`) draw text in Arial. ImageMagick's built-in SVG renderer only finds fonts listed in its own font map, which is empty by default on macOS, so icon conversion fails with:

```
magick: unable to read font `' @ error/annotate.c/RenderFreetype/1704.
```

Installing `librsvg` does not help, because ImageMagick keeps using its built-in renderer. To fix it, map Arial to the font files that ship with macOS by creating `~/.config/ImageMagick/type.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<typemap>
  <type name="Arial" fullname="Arial" family="Arial" style="Normal" stretch="Normal" weight="400" format="truetype" glyphs="/System/Library/Fonts/Supplemental/Arial.ttf"/>
  <type name="Arial-Bold" fullname="Arial Bold" family="Arial" style="Normal" stretch="Normal" weight="700" format="truetype" glyphs="/System/Library/Fonts/Supplemental/Arial Bold.ttf"/>
  <type name="Arial-Italic" fullname="Arial Italic" family="Arial" style="Italic" stretch="Normal" weight="400" format="truetype" glyphs="/System/Library/Fonts/Supplemental/Arial Italic.ttf"/>
  <type name="Arial-BoldItalic" fullname="Arial Bold Italic" family="Arial" style="Italic" stretch="Normal" weight="700" format="truetype" glyphs="/System/Library/Fonts/Supplemental/Arial Bold Italic.ttf"/>
</typemap>
```

Run `magick -list font` to confirm. It should list the four Arial fonts. If a new SVG uses a different font, add a `<type>` entry for it.

> **Note:** Each run of `./script/convert-icons` rewrites every PNG with new metadata, so `git status` shows them as modified even when the images are unchanged.

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
    teams-chat-toggle.ts       # Meeting chat toggle implementation
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
