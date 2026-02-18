/**
 * Teams Screen Share Action
 *
 * Toggles screen sharing in Microsoft Teams meetings.
 * Uses keyboard shortcut ⇧⌘E (Shift+Command+E).
 * Employs optimistic state tracking since Teams may not expose
 * menu bar items to AppleScript.
 *
 * @see .github/copilot-instructions.md for development guidelines
 */
import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { isTeamsRunning, sendTeamsKeystroke } from "../teams-utils";

/**
 * Action that toggles Teams screen sharing on or off.
 * Uses optimistic state tracking.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-share-screen" })
export class TeamsShareScreen extends SingletonAction<TeamsShareSettings> {
  /** Optimistic sharing state: true = sharing */
  private isSharing = false;

  override async onWillAppear(
    ev: WillAppearEvent<TeamsShareSettings>
  ): Promise<void> {
    this.isSharing = false;

    if (isTeamsRunning()) {
      await ev.action.setTitle("Share");
      if ("setState" in ev.action) {
        await ev.action.setState(0);
      }
    } else {
      await ev.action.setTitle("No Teams");
      if ("setState" in ev.action) {
        await ev.action.setState(0);
      }
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<TeamsShareSettings>
  ): Promise<void> {
    try {
      if (!isTeamsRunning()) {
        await ev.action.setTitle("No Teams");
        if ("setState" in ev.action) {
          await ev.action.setState(0);
        }
        return;
      }

      sendTeamsKeystroke("e");
      this.isSharing = !this.isSharing;

      if ("setState" in ev.action) {
        await ev.action.setState(this.isSharing ? 1 : 0);
      }
      await ev.action.setTitle(this.isSharing ? "Stop Share" : "Share");
    } catch (error) {
      console.error("Error toggling Teams screen share:", error);
      await ev.action.setTitle("Error");
    }
  }
}

type TeamsShareSettings = Record<string, never>;
