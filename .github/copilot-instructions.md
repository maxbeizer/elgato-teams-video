# GitHub Copilot Instructions for elgato-teams-video

## Project Overview

elgato-teams-video is a Stream Deck plugin that provides Microsoft Teams meeting controls directly from the Elgato Stream Deck. Based on [zerm](https://github.com/maxbeizer/zerm) (the Zoom version). The plugin includes:

1. Teams Mute Toggle — Toggle mute status in Teams even when another application is focused
2. Teams Video Toggle — Toggle camera/video status in Teams even when another application is focused
3. Teams Screen Share — Start/stop screen sharing in Teams even when another application is focused
4. Teams Focus — Bring the Teams application to the foreground instantly
5. Teams Leave Meeting — Leave the current Teams meeting even when another application is focused
6. Teams Chat Toggle — Show or hide the meeting chat pane by clicking the meeting window's Chat button (no keyboard shortcut exists)

## Key Technologies

- **Stream Deck SDK**: Elgato's Stream Deck SDK v2 for plugin development
- **TypeScript**: Written in TypeScript for type safety
- **AppleScript**: Used to interact with Teams on macOS without requiring focus
- **Rollup**: For bundling the TypeScript code

## Project Structure

- **src/**: TypeScript source code

  - **plugin.ts**: Entry point that registers all actions
  - **teams-utils.ts**: Shared utility for Teams process detection and AppleScript helpers
  - **actions/**: Individual action classes
    - **teams-mute-toggle.ts**: Mute control (⇧⌘M)
    - **teams-video-toggle.ts**: Video control (⇧⌘O)
    - **teams-share-screen.ts**: Screen sharing control (⇧⌘E)
    - **teams-focus.ts**: Focus Teams
    - **teams-leave-meeting.ts**: Leave meeting (⇧⌘H)
    - **teams-chat-toggle.ts**: Meeting chat toggle (macOS accessibility API via JXA in `toggleMeetingChat()`)

- **com.max-beizer.elgato-teams-video.sdPlugin/**: Compiled plugin

  - **manifest.json**: Plugin configuration and metadata
  - **imgs/**: Icons and images for the plugin
  - **ui/**: HTML files for property inspectors
  - **bin/**: Compiled JavaScript output

- **script/**: Utility scripts
  - **build**: Builds the plugin and restarts Stream Deck
  - **convert-icons**: Converts SVG icons to PNG format
  - **run**: Starts the plugin in watch mode for development

## Development Patterns

### Action Implementation

Each action is implemented as a TypeScript class that:

1. Is decorated with the `@action` decorator specifying the UUID
2. Extends `SingletonAction<T>` with appropriate settings type
3. Overrides the `onWillAppear` method to handle initial setup
4. Overrides the `onKeyDown` method to handle button presses

### Shared Utilities (teams-utils.ts)

Unlike zerm which duplicates AppleScript logic in every action, this project uses a shared utility module:

- `detectTeamsProcess()` — detects which Teams process name is running (handles "Microsoft Teams", "MSTeams", etc.)
- `isTeamsRunning()` — boolean check for Teams process
- `sendTeamsKeystroke(key, modifiers?)` — sends a keyboard shortcut to Teams, preserving focus
- `focusTeams()` — brings Teams to the foreground

### Optimistic State Tracking

Since Microsoft Teams may not expose menu bar items to AppleScript's `System Events` (unlike Zoom), this plugin uses **optimistic state tracking**:

- Each action maintains its own state (e.g., `isMuted`, `videoOn`, `isSharing`)
- On button press, the state is toggled optimistically
- State resets to defaults on `onWillAppear` (when the Stream Deck profile loads)
- State may drift if the user toggles controls directly in Teams

### Icon Management

The plugin follows these conventions for icons:

1. SVG files are the source of truth for all icons
2. PNG files are generated from SVGs during the build process using the `convert-icons` script
3. Each action has:
   - `icon.svg`: Main icon for the action (shown in the Stream Deck UI)
   - State-specific SVGs (e.g., `muted.svg`, `unmuted.svg`) for different button states
   - Generated PNGs: `icon.png`, `icon@2x.png`, `key_0.png`, `key_0@2x.png`, etc.
4. The conversion process uses ImageMagick's `magick` command

## Teams Keyboard Shortcuts

| Action        | Shortcut | Key in code |
|--------------|----------|-------------|
| Mute Toggle  | ⇧⌘M     | `"m"`       |
| Video Toggle | ⇧⌘O     | `"o"`       |
| Screen Share | ⇧⌘E     | `"e"`       |
| Leave Meeting| ⇧⌘H     | `"h"`       |

## Teams Process Names

The Teams process name may vary by installation type:
- `Microsoft Teams` — standard install
- `MSTeams` — alternative
- `Microsoft Teams (work or school)` — managed installations

The `detectTeamsProcess()` utility checks all of these.

## Coding Style Guidelines

1. Use clear method and variable names that describe their purpose
2. Add JSDoc comments to methods explaining their functionality
3. Handle errors gracefully with appropriate logging
4. Maintain consistent indentation (2 spaces)
5. Follow TypeScript best practices with proper typing
6. Use the shared `teams-utils.ts` module instead of duplicating AppleScript logic

## Useful Commands

- `./script/build`: Builds and restarts the plugin (automatically converts SVGs to PNGs)
- `./script/run`: Runs the plugin in watch mode for development
- `./script/convert-icons`: Manually converts SVG icons to PNG format
- `npm run build`: Builds the plugin without restarting Stream Deck
- `npm run watch`: Watches for changes and rebuilds automatically

## Important Notes

- This plugin only works on macOS due to its use of AppleScript
- The plugin requires Teams to have default keyboard shortcuts enabled
- Actions work even when Teams is not the active application
- State tracking is optimistic and may drift if controls are toggled directly in Teams
