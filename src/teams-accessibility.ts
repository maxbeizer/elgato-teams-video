export interface AccessibilityMatchers {
  chatIdentifier: RegExp;
  leaveIdentifier: RegExp;
  chatLabel: RegExp;
  leaveLabel: RegExp;
}

const DEFAULT_CHAT_LABELS = ["Chat", "Show conversation", "Open chat"];
const DEFAULT_LEAVE_LABELS = ["Leave"];

function configuredLabels(value: string | undefined, defaults: string[]): string[] {
  const labels = value
    ?.split(",")
    .map((label) => label.trim())
    .filter(Boolean);
  return labels?.length ? labels : defaults;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function labelMatcher(labels: string[]): RegExp {
  return new RegExp(
    `^(?:${labels.map(escapeRegExp).join("|")})(?=$|[^\\p{L}\\p{N}_])`,
    "iu"
  );
}

/**
 * Build matchers for Teams meeting controls. Accessibility/DOM identifiers are
 * preferred because Teams does not localize them. Labels are a fallback and can
 * be configured for a localized Teams installation.
 */
export function createAccessibilityMatchers(
  chatLabels = process.env.TEAMS_CHAT_LABELS,
  leaveLabels = process.env.TEAMS_LEAVE_LABELS
): AccessibilityMatchers {
  return {
    chatIdentifier:
      /(?:^|[-_.:])(?:show[-_.:]?conversation|open[-_.:]?chat|toggle[-_.:]?chat|chat)(?:[-_.:]?(?:button|control))?$/i,
    leaveIdentifier:
      /(?:^|[-_.:])(?:leave|hangup|end[-_.:]?call)(?:[-_.:]?(?:button|control))?$/i,
    chatLabel: labelMatcher(configuredLabels(chatLabels, DEFAULT_CHAT_LABELS)),
    leaveLabel: labelMatcher(configuredLabels(leaveLabels, DEFAULT_LEAVE_LABELS)),
  };
}
