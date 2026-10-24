/**
 * Teams Chat Toggle Action
 *
 * Shows or hides the chat pane of the current Microsoft Teams meeting.
 * Teams has no keyboard shortcut for this, so the action presses the
 * meeting window's Chat button through the macOS accessibility API.
 *
 * @see .github/copilot-instructions.md for development guidelines
 */
import streamDeck, {
  action,
  KeyDownEvent,
  SingletonAction,
  WillAppearEvent,
} from "@elgato/streamdeck";
import { isTeamsRunning, toggleMeetingChat } from "../teams-utils";

const accessibilityDebug = process.env.ELGATO_TEAMS_CHAT_DEBUG === "1";

/**
 * Action that toggles the meeting chat pane.
 * State 0 when Teams is running, state 1 (grey) when it is not.
 */
@action({ UUID: "com.max-beizer.elgato-teams-video.teams-chat-toggle" })
export class TeamsChatToggle extends SingletonAction<TeamsChatToggleSettings> {
  override async onWillAppear(
    ev: WillAppearEvent<TeamsChatToggleSettings>
  ): Promise<void> {
    const running = isTeamsRunning();
    await ev.action.setTitle(running ? "Chat" : "No Teams");
    if ("setState" in ev.action) {
      await ev.action.setState(running ? 0 : 1);
    }
  }

  override async onKeyDown(
    ev: KeyDownEvent<TeamsChatToggleSettings>
  ): Promise<void> {
    try {
      const started = Date.now();
      const result = await toggleMeetingChat(true, accessibilityDebug);

      streamDeck.logger.info(
        `Chat toggle: ${result.status} in ${Date.now() - started}ms`
      );
      for (const line of result.details) {
        streamDeck.logger.info(`Chat toggle: ${line}`);
      }

      if (result.status === "no_teams") {
        await ev.action.setTitle("No Teams");
        if ("setState" in ev.action) {
          await ev.action.setState(1);
        }
        return;
      }

      if ("setState" in ev.action) {
        await ev.action.setState(0);
      }

      if (result.status === "no_meeting") {
        await ev.action.setTitle("No Meeting");
      } else {
        await ev.action.setTitle("Chat");
        if (result.status !== "clicked") {
          await ev.action.showAlert();
        }
      }
    } catch (error) {
      streamDeck.logger.error(`Error toggling Teams chat: ${error}`);
      await ev.action.setTitle("Error");
    }
  }
}

type TeamsChatToggleSettings = Record<string, never>;
