import assert from "node:assert/strict";
import test from "node:test";

import { createAccessibilityMatchers } from "../src/teams-accessibility";

test("matches language-neutral Teams accessibility identifiers", () => {
  const matchers = createAccessibilityMatchers();

  assert.match("callingButtons-showConversation", matchers.chatIdentifier);
  assert.match("meeting-openChat-button", matchers.chatIdentifier);
  assert.match("meeting-hangup-button", matchers.leaveIdentifier);
  assert.doesNotMatch("chat-pane-close-button", matchers.chatIdentifier);
  assert.doesNotMatch("conversation-history-item", matchers.chatIdentifier);
  assert.doesNotMatch("leave-reaction-button", matchers.leaveIdentifier);
});

test("supports localized label fallback configuration", () => {
  const matchers = createAccessibilityMatchers(
    "Unterhaltung anzeigen,Chat öffnen",
    "Verlassen"
  );

  assert.match("Unterhaltung anzeigen", matchers.chatLabel);
  assert.match("Chat öffnen (⌘L)", matchers.chatLabel);
  assert.match("Verlassen", matchers.leaveLabel);
  assert.doesNotMatch("Show conversation", matchers.chatLabel);
});

test("escapes punctuation in configured labels", () => {
  const matchers = createAccessibilityMatchers(
    "Chat (Besprechung)",
    "Beenden + verlassen"
  );

  assert.match("Chat (Besprechung)", matchers.chatLabel);
  assert.match("Chat (Besprechung) öffnen", matchers.chatLabel);
  assert.match("Beenden + verlassen", matchers.leaveLabel);
  assert.match("Beenden + verlassen (⌘H)", matchers.leaveLabel);
});
