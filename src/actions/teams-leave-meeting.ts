/**
 * Teams Leave Meeting Action
 *
 * Leaves the current Microsoft Teams meeting.
 * Uses keyboard shortcut ⇧⌘B (Shift+Command+B).
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
 * Action that leaves the current Teams meeting.
 * Uses optimistic state tracking.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-leave-meeting" })
export class TeamsLeaveMeeting extends SingletonAction<TeamsLeaveMeetingSettings> {
  /** Optimistic meeting state: true = in meeting */
  private inMeeting = false;

  override async onWillAppear(
    ev: WillAppearEvent<TeamsLeaveMeetingSettings>
  ): Promise<void> {
    // Default to assuming no meeting when action first appears
    this.inMeeting = false;

    if (isTeamsRunning()) {
      await ev.action.setTitle("No Meeting");
      if ("setState" in ev.action) {
        await ev.action.setState(1);
      }
    } else {
      await ev.action.setTitle("No Teams");
      if ("setState" in ev.action) {
        await ev.action.setState(1);
      }
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<TeamsLeaveMeetingSettings>
  ): Promise<void> {
    try {
      if (!isTeamsRunning()) {
        await ev.action.setTitle("No Teams");
        if ("setState" in ev.action) {
          await ev.action.setState(1);
        }
        return;
      }

      // Send leave meeting shortcut
      sendTeamsKeystroke("b");

      // After leaving, assume we're no longer in a meeting
      this.inMeeting = false;

      if ("setState" in ev.action) {
        await ev.action.setState(1);
      }
      await ev.action.setTitle("No Meeting");
    } catch (error) {
      console.error("Error leaving Teams meeting:", error);
      await ev.action.setTitle("Error");
    }
  }
}

type TeamsLeaveMeetingSettings = Record<string, never>;
