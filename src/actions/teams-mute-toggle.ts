/**
 * Teams Mute Toggle Action
 *
 * Toggles the audio mute status in Microsoft Teams meetings.
 * Uses keyboard shortcut ⇧⌘M (Shift+Command+M).
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
 * Action that toggles Teams mute status on or off.
 * Uses optimistic state tracking — assumes each press toggles the state.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-mute-toggle" })
export class TeamsMuteToggle extends SingletonAction<TeamsMuteSettings> {
  /** Optimistic mute state: true = muted */
  private isMuted = false;

  /**
   * When the action appears, reset to default (unmuted) state.
   */
  override async onWillAppear(
    ev: WillAppearEvent<TeamsMuteSettings>
  ): Promise<void> {
    this.isMuted = false;

    if (isTeamsRunning()) {
      await ev.action.setTitle("Unmuted");
      if ("setState" in ev.action) {
        await ev.action.setState(1);
      }
    } else {
      await ev.action.setTitle("No Teams");
      if ("setState" in ev.action) {
        await ev.action.setState(0);
      }
    }
  }

  /**
   * Toggle Teams mute state when the button is pressed.
   */
  override async onKeyDown(ev: KeyDownEvent<TeamsMuteSettings>): Promise<void> {
    try {
      if (!isTeamsRunning()) {
        await ev.action.setTitle("No Teams");
        if ("setState" in ev.action) {
          await ev.action.setState(0);
        }
        return;
      }

      sendTeamsKeystroke("m");
      this.isMuted = !this.isMuted;

      if ("setState" in ev.action) {
        await ev.action.setState(this.isMuted ? 0 : 1);
      }
      await ev.action.setTitle(this.isMuted ? "Muted" : "Unmuted");
    } catch (error) {
      console.error("Error toggling Teams mute:", error);
      await ev.action.setTitle("Error");
    }
  }
}

type TeamsMuteSettings = Record<string, never>;
