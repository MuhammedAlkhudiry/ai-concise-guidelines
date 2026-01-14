/**
 * Loop Plugin for OpenCode
 *
 * Autonomous iterative task execution until completion.
 * Requires an existing session - uses session's state.md for loop state.
 *
 * Usage:
 *   /loop docs/ai/sessions/2026-01-14-feature-name
 *
 * Cancel: Press Ctrl+C or abort the message to cancel the loop.
 *
 * How it works:
 *   1. /loop command triggers the loop with a session path
 *   2. Agent works on the task using session context
 *   3. When agent stops, plugin checks for <promise>DONE</promise>
 *   4. If not found, injects continuation prompt
 *   5. Repeats until done or max iterations
 *
 * State: Stored in session's state.md (YAML frontmatter)
 */

import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_COMPLETION_PROMISE = "DONE";

const CONTINUATION_PROMPT = `[LOOP - ITERATION {{ITERATION}}/{{MAX}}]

Your previous attempt did not output the completion promise. Continue working on the task.

**Before continuing:**
1. Re-read session files: README.md, plan.md, state.md
2. Review AGENTS.md for project rules
3. Check todo list — what's done vs pending?

**Rules:**
- Don't repeat completed work
- Update todo status as you progress
- Follow all AGENTS.md rules strictly
- Run quality checks after changes

**Completion:**
- When FULLY complete, output: <promise>{{PROMISE}}</promise>
- Do not stop until the task is truly done

Session: {{SESSION_PATH}}`;

// ============================================================================
// Types
// ============================================================================

interface LoopState {
  active: boolean;
  iteration: number;
  max_iterations: number;
  completion_promise: string;
  started_at: string;
  session_path: string;
}

interface SessionTracking {
  sessionPath?: string;
  isRecovering?: boolean;
}

interface OpenCodeSessionMessage {
  info?: { role?: string };
  parts?: Array<{ type: string; text?: string }>;
}

// ============================================================================
// Session State Storage (in session's state.md)
// ============================================================================

function parseStateMdFrontmatter(content: string): {
  frontmatter: Record<string, unknown>;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const yamlStr = match[1];
  const body = match[2] || "";
  const frontmatter: Record<string, unknown> = {};

  // Simple YAML parsing for our loop structure
  let currentKey = "";
  let inLoop = false;
  const loopData: Record<string, unknown> = {};

  for (const line of yamlStr.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "loop:") {
      inLoop = true;
      continue;
    }

    if (inLoop && line.startsWith("  ")) {
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) continue;
      const key = trimmed.slice(0, colonIndex).trim();
      let value: unknown = trimmed.slice(colonIndex + 1).trim();

      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (/^\d+$/.test(value as string)) value = parseInt(value as string, 10);
      else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      loopData[key] = value;
    } else if (!line.startsWith(" ")) {
      inLoop = false;
      const colonIndex = trimmed.indexOf(":");
      if (colonIndex === -1) continue;
      currentKey = trimmed.slice(0, colonIndex).trim();
      let value: unknown = trimmed.slice(colonIndex + 1).trim();

      if (value === "true") value = true;
      else if (value === "false") value = false;
      else if (/^\d+$/.test(value as string)) value = parseInt(value as string, 10);
      else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }

      if (value !== "") {
        frontmatter[currentKey] = value;
      }
    }
  }

  if (Object.keys(loopData).length > 0) {
    frontmatter.loop = loopData;
  }

  return { frontmatter, body };
}

function getStateFilePath(sessionPath: string): string {
  return join(sessionPath, "state.md");
}

function readLoopState(sessionPath: string): LoopState | null {
  const filePath = getStateFilePath(sessionPath);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const { frontmatter } = parseStateMdFrontmatter(content);

    const loop = frontmatter.loop as Record<string, unknown> | undefined;
    if (!loop || loop.active === undefined) {
      return null;
    }

    const stripQuotes = (val: unknown): string => {
      const str = String(val ?? "");
      return str.replace(/^["']|["']$/g, "");
    };

    return {
      active: loop.active === true || loop.active === "true",
      iteration: typeof loop.iteration === "number" ? loop.iteration : Number(loop.iteration) || 1,
      max_iterations: Number(loop.max_iterations) || DEFAULT_MAX_ITERATIONS,
      completion_promise: stripQuotes(loop.completion_promise) || DEFAULT_COMPLETION_PROMISE,
      started_at: stripQuotes(loop.started_at) || new Date().toISOString(),
      session_path: sessionPath,
    };
  } catch {
    return null;
  }
}

function writeLoopState(sessionPath: string, state: LoopState): boolean {
  const filePath = getStateFilePath(sessionPath);

  try {
    let body = "";

    // Read existing content to preserve body
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, "utf-8");
      const parsed = parseStateMdFrontmatter(content);
      body = parsed.body;
    } else {
      // Create initial state.md body
      body = `# Execution State

## Current Step
Starting loop execution...

## Progress
<!-- Updated by execution -->

## Blockers
None
`;
    }

    const content = `---
loop:
  active: ${state.active}
  iteration: ${state.iteration}
  max_iterations: ${state.max_iterations}
  completion_promise: "${state.completion_promise}"
  started_at: "${state.started_at}"
---
${body}`;

    writeFileSync(filePath, content, "utf-8");
    return true;
  } catch {
    return false;
  }
}

function clearLoopState(sessionPath: string): boolean {
  const filePath = getStateFilePath(sessionPath);

  if (!existsSync(filePath)) {
    return true;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const { body } = parseStateMdFrontmatter(content);

    // Remove loop frontmatter, keep body
    const newContent = body.trim() ? body : "# Execution State\n\nLoop completed.\n";
    writeFileSync(filePath, newContent, "utf-8");
    return true;
  } catch {
    return false;
  }
}

function incrementIteration(sessionPath: string): LoopState | null {
  const state = readLoopState(sessionPath);
  if (!state) return null;

  state.iteration += 1;
  if (writeLoopState(sessionPath, state)) {
    return state;
  }
  return null;
}

// ============================================================================
// Helpers
// ============================================================================

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateSessionPath(sessionPath: string): boolean {
  // Check if session path exists and has README.md
  const readmePath = join(sessionPath, "README.md");
  return existsSync(readmePath);
}

// ============================================================================
// Plugin
// ============================================================================

export const LoopPlugin: Plugin = async (ctx) => {
  // Track session paths per OpenCode session
  const sessions = new Map<string, SessionTracking>();
  const API_TIMEOUT = 3000;

  function getSessionTracking(sessionID: string): SessionTracking {
    let tracking = sessions.get(sessionID);
    if (!tracking) {
      tracking = {};
      sessions.set(sessionID, tracking);
    }
    return tracking;
  }

  async function detectCompletionInSessionMessages(
    sessionID: string,
    promise: string
  ): Promise<boolean> {
    try {
      const response = await Promise.race([
        ctx.client.session.messages({
          path: { id: sessionID },
          query: { directory: ctx.directory },
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), API_TIMEOUT)
        ),
      ]);

      const messages = (response as { data?: unknown[] }).data ?? [];
      if (!Array.isArray(messages)) return false;

      const assistantMessages = (messages as OpenCodeSessionMessage[]).filter(
        (msg) => msg.info?.role === "assistant"
      );
      const lastAssistant = assistantMessages[assistantMessages.length - 1];
      if (!lastAssistant?.parts) return false;

      const pattern = new RegExp(`<promise>\\s*${escapeRegex(promise)}\\s*</promise>`, "is");
      const responseText = lastAssistant.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join("\n");

      return pattern.test(responseText);
    } catch {
      return false;
    }
  }

  function startLoop(
    sessionID: string,
    sessionPath: string,
    options?: { maxIterations?: number; completionPromise?: string }
  ): boolean {
    // Validate session exists
    if (!validateSessionPath(sessionPath)) {
      return false;
    }

    const state: LoopState = {
      active: true,
      iteration: 1,
      max_iterations: options?.maxIterations ?? DEFAULT_MAX_ITERATIONS,
      completion_promise: options?.completionPromise ?? DEFAULT_COMPLETION_PROMISE,
      started_at: new Date().toISOString(),
      session_path: sessionPath,
    };

    // Track session path for this OpenCode session
    const tracking = getSessionTracking(sessionID);
    tracking.sessionPath = sessionPath;

    return writeLoopState(sessionPath, state);
  }

  function cancelLoop(sessionID: string): { success: boolean; iteration?: number } {
    const tracking = getSessionTracking(sessionID);
    if (!tracking.sessionPath) {
      return { success: false };
    }

    const state = readLoopState(tracking.sessionPath);
    if (!state || !state.active) {
      return { success: false };
    }

    const success = clearLoopState(tracking.sessionPath);
    if (success) {
      tracking.sessionPath = undefined;
    }
    return { success, iteration: state.iteration };
  }

  // Parse command output from /loop
  function parseCommandOutput(promptText: string): {
    isStart: boolean;
    sessionPath?: string;
    maxIterations?: number;
  } {
    // Detect /loop command output (contains <session-path> tag)
    const sessionMatch = promptText.match(/<session-path>\s*([\s\S]*?)\s*<\/session-path>/i);
    if (sessionMatch) {
      const rawSession = sessionMatch[1].trim();
      const sessionPath = rawSession.split(/\s+--/)[0]?.trim();
      const maxIterMatch = rawSession.match(/--max(?:-iterations)?=(\d+)/i);

      if (!sessionPath) {
        return { isStart: false };
      }

      return {
        isStart: true,
        sessionPath,
        maxIterations: maxIterMatch ? parseInt(maxIterMatch[1], 10) : undefined,
      };
    }

    return { isStart: false };
  }

  return {
    // Detect /loop command output
    "chat.message": async (input, output) => {
      const parts = (output as { parts?: Array<{ type: string; text?: string }> }).parts;
      const promptText =
        parts
          ?.filter((p) => p.type === "text" && p.text)
          .map((p) => p.text)
          .join("\n")
          .trim() || "";

      const parsed = parseCommandOutput(promptText);

      if (parsed.isStart && parsed.sessionPath) {
        // Resolve session path relative to project directory
        const absoluteSessionPath = parsed.sessionPath.startsWith("/")
          ? parsed.sessionPath
          : join(ctx.directory, parsed.sessionPath);

        if (!validateSessionPath(absoluteSessionPath)) {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Failed",
                message: `Session not found: ${parsed.sessionPath}`,
                variant: "error",
                duration: 5000,
              },
            });
          } catch {
            /* ignore */
          }
          return;
        }

        const success = startLoop(input.sessionID, absoluteSessionPath, {
          maxIterations: parsed.maxIterations,
        });

        if (success) {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Started",
                message: `Max ${parsed.maxIterations ?? DEFAULT_MAX_ITERATIONS} iterations`,
                variant: "info",
                duration: 3000,
              },
            });
          } catch {
            /* ignore */
          }
        }
      }
    },

    // Core loop mechanism - fires when session goes idle
    event: async ({ event }) => {
      const props = event.properties as Record<string, unknown> | undefined;

      // === session.idle - The main loop trigger ===
      if (event.type === "session.idle") {
        const sessionID = props?.sessionID as string | undefined;
        if (!sessionID) return;

        const tracking = getSessionTracking(sessionID);
        if (tracking.isRecovering || !tracking.sessionPath) {
          return;
        }

        const state = readLoopState(tracking.sessionPath);
        if (!state || !state.active) return;

        // Check completion via session messages API
        const completionDetected = await detectCompletionInSessionMessages(
          sessionID,
          state.completion_promise
        );

        if (completionDetected) {
          clearLoopState(tracking.sessionPath);
          tracking.sessionPath = undefined;
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Complete!",
                message: `Task completed after ${state.iteration} iteration(s)`,
                variant: "success",
                duration: 5000,
              },
            });
          } catch {
            /* ignore */
          }
          return;
        }

        // Check max iterations
        if (state.iteration >= state.max_iterations) {
          clearLoopState(tracking.sessionPath);
          tracking.sessionPath = undefined;
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Stopped",
                message: `Max iterations (${state.max_iterations}) reached`,
                variant: "warning",
                duration: 5000,
              },
            });
          } catch {
            /* ignore */
          }
          return;
        }

        // Increment and continue
        const newState = incrementIteration(tracking.sessionPath);
        if (!newState) {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Error",
                message: "Failed to increment iteration",
                variant: "error",
                duration: 3000,
              },
            });
          } catch {
            /* ignore */
          }
          return;
        }

        const continuationPrompt = CONTINUATION_PROMPT.replace(
          "{{ITERATION}}",
          String(newState.iteration)
        )
          .replace("{{MAX}}", String(newState.max_iterations))
          .replace("{{PROMISE}}", newState.completion_promise)
          .replace("{{SESSION_PATH}}", tracking.sessionPath);

        try {
          await ctx.client.tui.showToast({
            body: {
              title: "Loop",
              message: `Iteration ${newState.iteration}/${newState.max_iterations}`,
              variant: "info",
              duration: 2000,
            },
          });
        } catch {
          /* ignore */
        }

        // Inject continuation prompt
        try {
          await ctx.client.session.prompt({
            path: { id: sessionID },
            body: { parts: [{ type: "text", text: continuationPrompt }] },
            query: { directory: ctx.directory },
          });
        } catch {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Error",
                message: "Failed to inject continuation prompt",
                variant: "error",
                duration: 3000,
              },
            });
          } catch {
            /* ignore */
          }
        }
      }

      // === session.deleted - Cleanup ===
      if (event.type === "session.deleted") {
        const sessionInfo = props?.info as { id?: string } | undefined;
        if (sessionInfo?.id) {
          const tracking = sessions.get(sessionInfo.id);
          if (tracking?.sessionPath) {
            clearLoopState(tracking.sessionPath);
          }
          sessions.delete(sessionInfo.id);
        }
      }

      // === session.error - Handle abort and errors ===
      if (event.type === "session.error") {
        const sessionID = props?.sessionID as string | undefined;
        const error = props?.error as { name?: string } | undefined;

        // User abort - cancel the loop
        if (error?.name === "MessageAbortedError") {
          if (sessionID) {
            const tracking = sessions.get(sessionID);
            if (tracking?.sessionPath) {
              clearLoopState(tracking.sessionPath);
              try {
                await ctx.client.tui.showToast({
                  body: {
                    title: "Loop Cancelled",
                    message: "User aborted, loop cleared",
                    variant: "info",
                    duration: 3000,
                  },
                });
              } catch {
                /* ignore */
              }
            }
            sessions.delete(sessionID);
          }
          return;
        }

        // Mark as recovering to skip idle events during error handling
        if (sessionID) {
          const tracking = getSessionTracking(sessionID);
          tracking.isRecovering = true;
          setTimeout(() => {
            tracking.isRecovering = false;
          }, 5000);
        }
      }
    },
  };
};

// Default export for compatibility
export default LoopPlugin;
