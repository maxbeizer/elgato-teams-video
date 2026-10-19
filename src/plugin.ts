/**
 * elgato-teams-video - A Stream Deck plugin for controlling Microsoft Teams
 *
 * This plugin provides controls for Microsoft Teams meetings directly from the
 * Elgato Stream Deck, allowing users to toggle mute, video, screen share, meeting
 * chat, leave meetings, and focus Teams even when it is not the active application.
 *
 * Based on maxbeizer/zerm (Zoom version).
 *
 * For development guidance, see: .github/copilot-instructions.md
 */
import streamDeck, { LogLevel } from "@elgato/streamdeck";

import { TeamsMuteToggle } from "./actions/teams-mute-toggle";
import { TeamsVideoToggle } from "./actions/teams-video-toggle";
import { TeamsShareScreen } from "./actions/teams-share-screen";
import { TeamsFocus } from "./actions/teams-focus";
import { TeamsLeaveMeeting } from "./actions/teams-leave-meeting";
import { TeamsChatToggle } from "./actions/teams-chat-toggle";

streamDeck.logger.setLevel(LogLevel.TRACE);

// Register all actions
streamDeck.actions.registerAction(new TeamsMuteToggle());
streamDeck.actions.registerAction(new TeamsVideoToggle());
streamDeck.actions.registerAction(new TeamsShareScreen());
streamDeck.actions.registerAction(new TeamsFocus());
streamDeck.actions.registerAction(new TeamsLeaveMeeting());
streamDeck.actions.registerAction(new TeamsChatToggle());

// Connect to the Stream Deck.
streamDeck.connect();
