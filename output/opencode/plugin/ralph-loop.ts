/**
 * Ralph Loop Plugin for OpenCode
 * 
 * Autonomous iterative task execution - keeps running until completion promise is found
 * or max iterations reached.
 * 
 * Usage:
 *   - Place this file in ~/.config/opencode/plugin/ or .opencode/plugin/
 *   - Start a loop: Include "<user-task>Your task here</user-task>" in your prompt
 *   - Or use template: "You are starting a Ralph Loop <user-task>Build feature X</user-task>"
 *   - Complete: Agent outputs <promise>DONE</promise> when finished
 *   - Cancel: Include "Cancel the currently active Ralph Loop" in prompt
 * 
 * Options (in task text):
 *   --max-iterations=50       Maximum loop iterations (default: 50)
 *   --completion-promise=DONE  Custom completion marker (default: DONE)
 * 
 * State file: .ralph/state.md (in project directory)
 */

import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// ============================================================================
// Constants
// ============================================================================

const HOOK_NAME = "ralph-loop";
const DEFAULT_STATE_FILE = ".ralph/state.md";
const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_COMPLETION_PROMISE = "DONE";

const CONTINUATION_PROMPT = `[RALPH LOOP - ITERATION {{ITERATION}}/{{MAX}}]

Your previous attempt did not output the completion promise. Continue working on the task.

IMPORTANT:
- Review your progress so far
- Continue from where you left off
- When FULLY complete, output: <promise>{{PROMISE}}</promise>
- Do not stop until the task is truly done

Original task:
{{PROMPT}}`;

// ============================================================================
// Types
// ============================================================================

interface RalphLoopState {
  active: boolean;
  iteration: number;
  max_iterations: number;
  completion_promise: string;
  started_at: string;
  prompt: string;
  session_id?: string;
}

interface SessionState {
  isRecovering?: boolean;
}

interface OpenCodeSessionMessage {
  info?: { role?: string };
  parts?: Array<{ type: string; text?: string }>;
}

// ============================================================================
// Storage (Markdown with Frontmatter)
// ============================================================================

function parseFrontmatter(content: string): { data: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };

  const yamlStr = match[1];
  const body = match[2] || "";
  const data: Record<string, unknown> = {};

  for (const line of yamlStr.split("\n")) {
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value: unknown = line.slice(colonIndex + 1).trim();

    if (value === "true") value = true;
    else if (value === "false") value = false;
    else if (/^\d+$/.test(value as string)) value = parseInt(value as string, 10);
    else if (typeof value === "string" && value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    data[key] = value;
  }

  return { data, body };
}

function getStateFilePath(directory: string): string {
  return join(directory, DEFAULT_STATE_FILE);
}

function readState(directory: string): RalphLoopState | null {
  const filePath = getStateFilePath(directory);

  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const { data, body } = parseFrontmatter(content);

    if (data.active === undefined || data.iteration === undefined) {
      return null;
    }

    const stripQuotes = (val: unknown): string => {
      const str = String(val ?? "");
      return str.replace(/^["']|["']$/g, "");
    };

    return {
      active: data.active === true || data.active === "true",
      iteration: typeof data.iteration === "number" ? data.iteration : Number(data.iteration),
      max_iterations: Number(data.max_iterations) || DEFAULT_MAX_ITERATIONS,
      completion_promise: stripQuotes(data.completion_promise) || DEFAULT_COMPLETION_PROMISE,
      started_at: stripQuotes(data.started_at) || new Date().toISOString(),
      prompt: body.trim(),
      session_id: data.session_id ? stripQuotes(data.session_id) : undefined,
    };
  } catch {
    return null;
  }
}

function writeState(directory: string, state: RalphLoopState): boolean {
  const filePath = getStateFilePath(directory);

  try {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    const sessionIdLine = state.session_id ? `session_id: "${state.session_id}"\n` : "";
    const content = `---
active: ${state.active}
iteration: ${state.iteration}
max_iterations: ${state.max_iterations}
completion_promise: "${state.completion_promise}"
started_at: "${state.started_at}"
${sessionIdLine}---
${state.prompt}
`;

    writeFileSync(filePath, content, "utf-8");
    return true;
  } catch {
    return false;
  }
}

function clearState(directory: string): boolean {
  const filePath = getStateFilePath(directory);

  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    return true;
  } catch {
    return false;
  }
}

function incrementIteration(directory: string): RalphLoopState | null {
  const state = readState(directory);
  if (!state) return null;

  state.iteration += 1;
  if (writeState(directory, state)) {
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

function log(message: string, data?: Record<string, unknown>): void {
  console.log(`[${HOOK_NAME}] ${message}`, data ? JSON.stringify(data) : "");
}

// ============================================================================
// Plugin
// ============================================================================

export const RalphLoopPlugin: Plugin = async (ctx) => {
  const sessions = new Map<string, SessionState>();
  const API_TIMEOUT = 3000;

  function getSessionState(sessionID: string): SessionState {
    let state = sessions.get(sessionID);
    if (!state) {
      state = {};
      sessions.set(sessionID, state);
    }
    return state;
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
    } catch (err) {
      log("Session messages check failed", { sessionID, error: String(err) });
      return false;
    }
  }

  function startLoop(
    sessionID: string,
    prompt: string,
    options?: { maxIterations?: number; completionPromise?: string }
  ): boolean {
    const state: RalphLoopState = {
      active: true,
      iteration: 1,
      max_iterations: options?.maxIterations ?? DEFAULT_MAX_ITERATIONS,
      completion_promise: options?.completionPromise ?? DEFAULT_COMPLETION_PROMISE,
      started_at: new Date().toISOString(),
      prompt,
      session_id: sessionID,
    };

    const success = writeState(ctx.directory, state);
    if (success) {
      log("Loop started", {
        sessionID,
        maxIterations: state.max_iterations,
        completionPromise: state.completion_promise,
      });
    }
    return success;
  }

  function cancelLoop(sessionID: string): boolean {
    const state = readState(ctx.directory);
    if (!state || state.session_id !== sessionID) {
      return false;
    }

    const success = clearState(ctx.directory);
    if (success) {
      log("Loop cancelled", { sessionID, iteration: state.iteration });
    }
    return success;
  }

  // Parse task from prompt text
  function parseTaskFromPrompt(promptText: string): {
    isStart: boolean;
    isCancel: boolean;
    prompt?: string;
    maxIterations?: number;
    completionPromise?: string;
  } {
    const isRalphLoopTemplate =
      promptText.includes("You are starting a Ralph Loop") ||
      promptText.includes("<user-task>");
    const isCancelTemplate = promptText.includes("Cancel the currently active Ralph Loop");

    if (isCancelTemplate) {
      return { isStart: false, isCancel: true };
    }

    if (isRalphLoopTemplate) {
      const taskMatch = promptText.match(/<user-task>\s*([\s\S]*?)\s*<\/user-task>/i);
      const rawTask = taskMatch?.[1]?.trim() || "";

      const quotedMatch = rawTask.match(/^["'](.+?)["']/);
      const prompt = quotedMatch?.[1] || rawTask.split(/\s+--/)[0]?.trim() || "Complete the task";

      const maxIterMatch = rawTask.match(/--max-iterations=(\d+)/i);
      const promiseMatch = rawTask.match(/--completion-promise=["']?([^"'\s]+)["']?/i);

      return {
        isStart: true,
        isCancel: false,
        prompt,
        maxIterations: maxIterMatch ? parseInt(maxIterMatch[1], 10) : undefined,
        completionPromise: promiseMatch?.[1],
      };
    }

    return { isStart: false, isCancel: false };
  }

  return {
    // Handle incoming chat messages to detect loop start/cancel
    "chat.message": async (input, output) => {
      const parts = (output as { parts?: Array<{ type: string; text?: string }> }).parts;
      const promptText = parts
        ?.filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("\n")
        .trim() || "";

      const parsed = parseTaskFromPrompt(promptText);

      if (parsed.isStart && parsed.prompt) {
        log("Starting loop from chat.message", { sessionID: input.sessionID, prompt: parsed.prompt });
        startLoop(input.sessionID, parsed.prompt, {
          maxIterations: parsed.maxIterations,
          completionPromise: parsed.completionPromise,
        });
      } else if (parsed.isCancel) {
        log("Cancelling loop from chat.message", { sessionID: input.sessionID });
        cancelLoop(input.sessionID);
      }
    },

    // Core loop mechanism - fires when session goes idle
    event: async ({ event }) => {
      const props = event.properties as Record<string, unknown> | undefined;

      // === session.idle - The main loop trigger ===
      if (event.type === "session.idle") {
        const sessionID = props?.sessionID as string | undefined;
        if (!sessionID) return;

        const sessionState = getSessionState(sessionID);
        if (sessionState.isRecovering) {
          log("Skipped: in recovery", { sessionID });
          return;
        }

        const state = readState(ctx.directory);
        if (!state || !state.active) return;

        // Only process for the session that started the loop
        if (state.session_id && state.session_id !== sessionID) return;

        // Check completion via session messages API
        const completionDetected = await detectCompletionInSessionMessages(
          sessionID,
          state.completion_promise
        );

        if (completionDetected) {
          log("Completion detected!", {
            sessionID,
            iteration: state.iteration,
            promise: state.completion_promise,
          });
          clearState(ctx.directory);

          // Show success toast
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Ralph Loop Complete!",
                message: `Task completed after ${state.iteration} iteration(s)`,
                variant: "success",
                duration: 5000,
              },
            });
          } catch { /* ignore */ }

          return;
        }

        // Check max iterations
        if (state.iteration >= state.max_iterations) {
          log("Max iterations reached", {
            sessionID,
            iteration: state.iteration,
            max: state.max_iterations,
          });
          clearState(ctx.directory);

          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Ralph Loop Stopped",
                message: `Max iterations (${state.max_iterations}) reached`,
                variant: "warning",
                duration: 5000,
              },
            });
          } catch { /* ignore */ }

          return;
        }

        // Increment and continue
        const newState = incrementIteration(ctx.directory);
        if (!newState) {
          log("Failed to increment iteration", { sessionID });
          return;
        }

        log("Continuing loop", {
          sessionID,
          iteration: newState.iteration,
          max: newState.max_iterations,
        });

        const continuationPrompt = CONTINUATION_PROMPT
          .replace("{{ITERATION}}", String(newState.iteration))
          .replace("{{MAX}}", String(newState.max_iterations))
          .replace("{{PROMISE}}", newState.completion_promise)
          .replace("{{PROMPT}}", newState.prompt);

        try {
          await ctx.client.tui.showToast({
            body: {
              title: "Ralph Loop",
              message: `Iteration ${newState.iteration}/${newState.max_iterations}`,
              variant: "info",
              duration: 2000,
            },
          });
        } catch { /* ignore */ }

        // Inject continuation prompt
        try {
          await ctx.client.session.prompt({
            path: { id: sessionID },
            body: { parts: [{ type: "text", text: continuationPrompt }] },
            query: { directory: ctx.directory },
          });
        } catch (err) {
          log("Failed to inject continuation", { sessionID, error: String(err) });
        }
      }

      // === session.deleted - Cleanup ===
      if (event.type === "session.deleted") {
        const sessionInfo = props?.info as { id?: string } | undefined;
        if (sessionInfo?.id) {
          const state = readState(ctx.directory);
          if (state?.session_id === sessionInfo.id) {
            clearState(ctx.directory);
            log("Session deleted, loop cleared", { sessionID: sessionInfo.id });
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
            const state = readState(ctx.directory);
            if (state?.session_id === sessionID) {
              clearState(ctx.directory);
              log("User aborted, loop cleared", { sessionID });
            }
            sessions.delete(sessionID);
          }
          return;
        }

        // Mark as recovering to skip idle events during error handling
        if (sessionID) {
          const sessionState = getSessionState(sessionID);
          sessionState.isRecovering = true;
          setTimeout(() => {
            sessionState.isRecovering = false;
          }, 5000);
        }
      }
    },
  };
};

// Default export for compatibility
export default RalphLoopPlugin;
