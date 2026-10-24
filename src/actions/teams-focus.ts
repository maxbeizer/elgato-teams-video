/**
 * Teams Focus Action
 *
 * Brings Microsoft Teams to the foreground.
 * Useful for quickly accessing the Teams interface.
 *
 * @see .github/copilot-instructions.md for development guidelines
 */
import {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { isTeamsRunning, focusTeams } from "../teams-utils";

/**
 * Action that focuses the Microsoft Teams application.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-focus" })
export class TeamsFocus extends SingletonAction<TeamsFocusSettings> {
  override async onWillAppear(
    ev: WillAppearEvent<TeamsFocusSettings>
  ): Promise<void> {
    try {
      const running = isTeamsRunning();
      await ev.action.setTitle(running ? "Focus" : "No Teams");
      if ("setState" in ev.action) {
        await ev.action.setState(running ? 0 : 1);
      }
    } catch (error) {
      console.error("Error checking if Teams is running:", error);
      await ev.action.setTitle("Error");
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<TeamsFocusSettings>
  ): Promise<void> {
    try {
      const success = focusTeams();
      await ev.action.setTitle(success ? "Focus" : "No Teams");
      if ("setState" in ev.action) {
        await ev.action.setState(success ? 0 : 1);
      }
    } catch (error) {
      console.error("Error focusing Teams:", error);
      await ev.action.setTitle("Error");
    }
  }
}

type TeamsFocusSettings = Record<string, never>;
