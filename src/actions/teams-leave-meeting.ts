/**
 * Teams Leave Meeting Action
 *
 * Leaves the current Microsoft Teams meeting.
 * Uses keyboard shortcut ⇧⌘H (Shift+Command+H).
 * Teams does not expose meeting status to AppleScript, so the button
 * always shows "Leave" while Teams is running rather than guessing
 * whether a meeting is in progress.
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
 * State 0 (red hang-up) when Teams is running, state 1 (grey) when it is not.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-leave-meeting" })
export class TeamsLeaveMeeting extends SingletonAction<TeamsLeaveMeetingSettings> {
  override async onWillAppear(
    ev: WillAppearEvent<TeamsLeaveMeetingSettings>
  ): Promise<void> {
    if (isTeamsRunning()) {
      await ev.action.setTitle("Leave");
      if ("setState" in ev.action) {
        await ev.action.setState(0);
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
      sendTeamsKeystroke("h");

      // Manifest sets DisableAutomaticStates, so the button stays on state 0
      if ("setState" in ev.action) {
        await ev.action.setState(0);
      }
      await ev.action.setTitle("Leave");
    } catch (error) {
      console.error("Error leaving Teams meeting:", error);
      await ev.action.setTitle("Error");
    }
  }
}

type TeamsLeaveMeetingSettings = Record<string, never>;
