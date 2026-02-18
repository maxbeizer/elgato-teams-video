/**
 * Teams Video Toggle Action
 *
 * Toggles the camera/video status in Microsoft Teams meetings.
 * Uses keyboard shortcut ⇧⌘O (Shift+Command+O).
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
 * Action that toggles Teams video on or off.
 * Uses optimistic state tracking.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-video-toggle" })
export class TeamsVideoToggle extends SingletonAction<Record<string, never>> {
  /** Optimistic video state: true = video on */
  private videoOn = false;

  override async onWillAppear(
    ev: WillAppearEvent<Record<string, never>>
  ): Promise<void> {
    this.videoOn = false;

    if (isTeamsRunning()) {
      await ev.action.setTitle("Video Off");
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
    ev: KeyDownEvent<Record<string, never>>
  ): Promise<void> {
    try {
      if (!isTeamsRunning()) {
        await ev.action.setTitle("No Teams");
        if ("setState" in ev.action) {
          await ev.action.setState(0);
        }
        return;
      }

      sendTeamsKeystroke("o");
      this.videoOn = !this.videoOn;

      if ("setState" in ev.action) {
        await ev.action.setState(this.videoOn ? 1 : 0);
      }
      await ev.action.setTitle(this.videoOn ? "Video On" : "Video Off");
    } catch (error) {
      console.error("Error toggling Teams video:", error);
      await ev.action.setTitle("Error");
    }
  }
}
