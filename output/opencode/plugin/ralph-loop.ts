/**
 * Ralph Loop Plugin for OpenCode
 * 
 * Autonomous iterative task execution until completion.
 * 
 * Usage:
 *   /ralph "Build a REST API" --max=10
 *   /ralph-cancel
 * 
 * How it works:
 *   1. /ralph command triggers the loop
 *   2. Agent works on the task
 *   3. When agent stops, plugin checks for <promise>DONE</promise>
 *   4. If not found, injects continuation prompt
 *   5. Repeats until done or max iterations
 * 
 * State file: .ralph/state.md
 */

import type { Plugin } from "@opencode-ai/plugin";
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_STATE_FILE = ".ralph/state.md";
const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_COMPLETION_PROMISE = "DONE";

const CONTINUATION_PROMPT = `[RALPH LOOP - ITERATION {{ITERATION}}/{{MAX}}]

Your previous attempt did not output the completion promise. Continue working on the task.

**Before continuing:**
1. Re-read any plan files (.plan.md, plan.md, etc.)
2. Review AGENTS.md for project rules
3. Check todo list — what's done vs pending?
4. Read changes.log to see what was already modified

**Rules:**
- Don't repeat completed work
- Update todo status as you progress
- Follow all AGENTS.md rules strictly
- Run quality checks after changes

**Completion:**
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
    } catch {
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

    return writeState(ctx.directory, state);
  }

  function cancelLoop(sessionID: string): { success: boolean; iteration?: number } {
    const state = readState(ctx.directory);
    if (!state || state.session_id !== sessionID) {
      return { success: false };
    }

    const success = clearState(ctx.directory);
    return { success, iteration: state.iteration };
  }

  // Parse command output from /ralph and /ralph-cancel
  function parseCommandOutput(promptText: string): {
    isStart: boolean;
    isCancel: boolean;
    prompt?: string;
    maxIterations?: number;
  } {
    // Detect /ralph-cancel command output
    if (promptText.includes("Cancel the currently active Ralph Loop")) {
      return { isStart: false, isCancel: true };
    }

    // Detect /ralph command output (contains <user-task> tag)
    const taskMatch = promptText.match(/<user-task>\s*([\s\S]*?)\s*<\/user-task>/i);
    if (taskMatch) {
      const rawTask = taskMatch[1].trim();
      const prompt = rawTask.split(/\s+--/)[0]?.trim() || "Complete the task";
      const maxIterMatch = rawTask.match(/--max-iterations=(\d+)/i);

      return {
        isStart: true,
        isCancel: false,
        prompt,
        maxIterations: maxIterMatch ? parseInt(maxIterMatch[1], 10) : undefined,
      };
    }

    return { isStart: false, isCancel: false };
  }

  return {
    // Detect /ralph and /ralph-cancel command outputs
    "chat.message": async (input, output) => {
      const parts = (output as { parts?: Array<{ type: string; text?: string }> }).parts;
      const promptText = parts
        ?.filter((p) => p.type === "text" && p.text)
        .map((p) => p.text)
        .join("\n")
        .trim() || "";

      const parsed = parseCommandOutput(promptText);

      if (parsed.isStart && parsed.prompt) {
        const success = startLoop(input.sessionID, parsed.prompt, {
          maxIterations: parsed.maxIterations,
        });
        if (success) {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Ralph Loop Started",
                message: `Max ${parsed.maxIterations ?? DEFAULT_MAX_ITERATIONS} iterations`,
                variant: "info",
                duration: 3000,
              },
            });
          } catch { /* ignore */ }
        }
      } else if (parsed.isCancel) {
        const { success, iteration } = cancelLoop(input.sessionID);
        if (success) {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Ralph Loop Cancelled",
                message: `Stopped at iteration ${iteration}`,
                variant: "info",
                duration: 3000,
              },
            });
          } catch { /* ignore */ }
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

        const sessionState = getSessionState(sessionID);
        if (sessionState.isRecovering) {
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
          clearState(ctx.directory);
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
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Ralph Loop Error",
                message: "Failed to increment iteration",
                variant: "error",
                duration: 3000,
              },
            });
          } catch { /* ignore */ }
          return;
        }

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
        } catch {
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Ralph Loop Error",
                message: "Failed to inject continuation prompt",
                variant: "error",
                duration: 3000,
              },
            });
          } catch { /* ignore */ }
        }
      }

      // === session.deleted - Cleanup ===
      if (event.type === "session.deleted") {
        const sessionInfo = props?.info as { id?: string } | undefined;
        if (sessionInfo?.id) {
          const state = readState(ctx.directory);
          if (state?.session_id === sessionInfo.id) {
            clearState(ctx.directory);
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
              try {
                await ctx.client.tui.showToast({
                  body: {
                    title: "Ralph Loop Cancelled",
                    message: "User aborted, loop cleared",
                    variant: "info",
                    duration: 3000,
                  },
                });
              } catch { /* ignore */ }
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
