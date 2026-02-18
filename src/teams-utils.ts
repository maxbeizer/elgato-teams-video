/**
 * Teams Process Detection Utility
 *
 * Shared utility for detecting the Microsoft Teams process on macOS.
 * Teams may use different process names depending on the version:
 * - "Microsoft Teams" (new Teams app)
 * - "MSTeams" (alternative name)
 * - "Microsoft Teams (work or school)" (managed installations)
 *
 * This module also provides AppleScript helpers for sending keystrokes
 * to Teams while preserving the user's current application focus.
 */
import { execSync } from "child_process";

/** Possible Teams process names, checked in order */
const TEAMS_PROCESS_NAMES = [
  "Microsoft Teams",
  "MSTeams",
  "Microsoft Teams (work or school)",
];

/**
 * Detect which Teams process name is running.
 * Returns the process name if found, or null if Teams is not running.
 */
export function detectTeamsProcess(): string | null {
  for (const name of TEAMS_PROCESS_NAMES) {
    const script = `osascript -e '
      tell application "System Events"
        if exists (process "${name}") then
          return "found"
        end if
      end tell
      return "not_found"
    '`;

    try {
      const result = execSync(script).toString().trim();
      if (result === "found") {
        return name;
      }
    } catch {
      // Process not found, try next name
    }
  }

  return null;
}

/**
 * Check if Microsoft Teams is running.
 */
export function isTeamsRunning(): boolean {
  return detectTeamsProcess() !== null;
}

/**
 * Send a keyboard shortcut to Teams, preserving focus on the current app.
 *
 * @param key - The key character to send (e.g., "m", "o", "e", "b")
 * @param modifiers - AppleScript modifier string (default: "{shift down, command down}")
 */
export function sendTeamsKeystroke(
  key: string,
  modifiers = "{shift down, command down}"
): void {
  const processName = detectTeamsProcess();

  if (!processName) {
    console.log("Teams is not running");
    return;
  }

  const script = `osascript -e '
    set currentApp to (path to frontmost application as text)

    tell application "${processName}"
      activate
      delay 0.1

      tell application "System Events"
        keystroke "${key}" using ${modifiers}
      end tell

      delay 0.2
      tell application currentApp
        activate
      end tell
    end tell
  '`;

  execSync(script);
}

/**
 * Bring Microsoft Teams to the foreground.
 * Returns true if Teams was successfully focused.
 */
export function focusTeams(): boolean {
  const processName = detectTeamsProcess();

  if (!processName) {
    return false;
  }

  const script = `osascript -e '
    tell application "${processName}"
      activate
    end tell
    return "success"
  '`;

  try {
    const result = execSync(script).toString().trim();
    return result === "success";
  } catch {
    return false;
  }
}
