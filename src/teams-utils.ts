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
import { execSync, spawn } from "child_process";

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
 * @param key - The key character to send (e.g., "m", "o", "e", "h")
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

/** Outcome of an attempt to find (and optionally press) the meeting Chat button */
export interface MeetingChatResult {
  /** "clicked", "found", "no_teams", "no_meeting", "no_chat", "ambiguous" or "error" */
  status: string;
  /** Sanitized diagnostic lines describing the accessibility search */
  details: string[];
}

/**
 * JXA script that walks the Teams accessibility tree through the macOS
 * accessibility API. Calling the API directly is far faster than iterating
 * AppleScript "entire contents", which takes minutes on the Teams web view.
 */
function meetingChatScript(pid: number, press: boolean, debug: boolean): string {
  return `
    ObjC.import("ApplicationServices");
    ObjC.import("AppKit");

    const PID = ${pid};
    const PRESS = ${press};
    const DEBUG = ${debug};
    const MAX_NODES = 20000;
    const BUTTON_ROLES = ["AXButton", "AXCheckBox", "AXRadioButton", "AXMenuButton", "AXPopUpButton", "AXTab"];

    function attr(el, name) {
      const ref = Ref();
      const err = $.AXUIElementCopyAttributeValue(el, $(name), ref);
      return err === 0 ? ref[0] : null;
    }

    function str(el, name) {
      const value = attr(el, name);
      if (!value) return "";
      try {
        const js = ObjC.castRefToObject(value).js;
        return typeof js === "string" ? js : "";
      } catch (e) {
        return "";
      }
    }

    function children(el) {
      const value = attr(el, "AXChildren");
      if (!value) return [];
      const array = ObjC.castRefToObject(value);
      const result = [];
      for (let i = 0; i < array.count; i++) result.push(array.objectAtIndex(i));
      return result;
    }

    function run() {
      const out = [];
      const start = Date.now();
      const app = $.AXUIElementCreateApplication(PID);
      out.push("TRUSTED|" + $.AXIsProcessTrusted());

      // Chromium-based apps only build their web content tree for assistive clients
      $.AXUIElementSetAttributeValue(app, $("AXManualAccessibility"), $.kCFBooleanTrue);

      const windows = children(app).filter((el) => str(el, "AXRole") === "AXWindow");
      let meeting = null;

      for (let windowIndex = 0; windowIndex < windows.length; windowIndex++) {
        const win = windows[windowIndex];
        const queue = [win];
        const chats = [];
        let hasLeave = false;
        let visited = 0;
        let controls = 0;

        while (queue.length && visited < MAX_NODES) {
          const el = queue.shift();
          visited++;
          const role = str(el, "AXRole");
          if (BUTTON_ROLES.indexOf(role) !== -1) {
            controls++;
            const label = str(el, "AXTitle") || str(el, "AXDescription");
            if (DEBUG) {
              out.push("BUTTON|window=" + windowIndex + "|role=" + role + "|label=" + label + "|help=" + str(el, "AXHelp"));
            }
            if (/^Leave/i.test(label)) {
              hasLeave = true;
              out.push("MATCH|window=" + windowIndex + "|control=leave|role=" + role);
            }
            if (/^(Chat|Show conversation|Open chat)\\b/i.test(label)) {
              chats.push(el);
              out.push("MATCH|window=" + windowIndex + "|control=chat|role=" + role);
            }
          }
          for (const child of children(el)) queue.push(child);
        }

        out.push("WINDOW|index=" + windowIndex + "|nodes=" + visited + "|controls=" + controls + "|leave=" + hasLeave + "|chat=" + chats.length);
        if (hasLeave && !meeting) meeting = { win: win, chats: chats, index: windowIndex };
      }

      out.push("SUMMARY|windows=" + windows.length + "|meeting=" + (meeting ? meeting.index : "none") + "|chat=" + (meeting ? meeting.chats.length : 0));

      out.push("ELAPSED|" + (Date.now() - start) + "ms");

      if (!meeting) return out.concat("RESULT|no_meeting").join("\\n");
      if (meeting.chats.length === 0) return out.concat("RESULT|no_chat").join("\\n");
      if (meeting.chats.length > 1) return out.concat("RESULT|ambiguous").join("\\n");
      if (!PRESS) return out.concat("RESULT|found").join("\\n");

      $.NSRunningApplication.runningApplicationWithProcessIdentifier(PID)
        .activateWithOptions($.NSApplicationActivateIgnoringOtherApps);
      $.AXUIElementPerformAction(meeting.win, $("AXRaise"));
      const err = $.AXUIElementPerformAction(meeting.chats[0], $("AXPress"));
      return out.concat(err === 0 ? "RESULT|clicked" : "RESULT|error|AXPress " + err).join("\\n");
    }
  `;
}

/** Run a JXA script through osascript without blocking the plugin's event loop */
function runJxa(script: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("osascript", ["-l", "JavaScript", "-"]);
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error(`osascript timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (data) => (stdout += data));
    child.stderr.on("data", (data) => (stderr += data));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`osascript exited with ${code}: ${stderr.trim()}`));
      }
    });

    child.stdin.end(script);
  });
}

/**
 * Toggle the chat pane of the current Teams meeting.
 *
 * Teams has no keyboard shortcut for this, so the script uses the macOS
 * accessibility API: it finds the meeting window (the one containing a
 * "Leave" button), raises it, and presses the button labelled "Chat" in that
 * window. Teams stays in front afterwards so the chat pane can be read.
 *
 * @param press - When false, only reports what was found (read-only probe)
 * @param debug - Include button labels and help text for explicit diagnostic use
 */
export async function toggleMeetingChat(
  press = true,
  debug = false
): Promise<MeetingChatResult> {
  const pid = detectTeamsPid();

  if (pid === null) {
    return { status: "no_teams", details: [] };
  }

  try {
    const output = await runJxa(meetingChatScript(pid, press, debug), 10000);
    const lines = output.split("\n");
    const resultLine = lines.find((line) => line.startsWith("RESULT|"));

    return {
      status: resultLine ? resultLine.split("|")[1] : "unknown",
      details: lines.filter((line) => !line.startsWith("RESULT|")),
    };
  } catch (error) {
    return { status: "error", details: [String(error)] };
  }
}

/**
 * Find the process ID of the main Teams process, or null if it is not running.
 */
function detectTeamsPid(): number | null {
  for (const name of TEAMS_PROCESS_NAMES) {
    try {
      const pid = parseInt(execSync(`pgrep -x "${name}"`).toString().trim().split("\n")[0], 10);
      if (!Number.isNaN(pid)) {
        return pid;
      }
    } catch {
      // pgrep exits non-zero when nothing matches; try next name
    }
  }

  return null;
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
