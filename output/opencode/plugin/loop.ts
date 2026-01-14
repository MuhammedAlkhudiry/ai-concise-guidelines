/**
 * Loop Plugin for OpenCode
 *
 * Autonomous iterative task execution until completion.
 *
 * Usage:
 *   /loop
 *
 * Cancel: Press Ctrl+C or abort the message to cancel the loop.
 *
 * How it works:
 *   1. /loop command triggers the loop
 *   2. Agent works on the task
 *   3. When agent stops, plugin checks for <promise>DONE</promise>
 *   4. If not found, injects continuation prompt
 *   5. Repeats until done or max iterations
 */

import type { Plugin } from "@opencode-ai/plugin";

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_COMPLETION_PROMISE = "DONE";

const CONTINUATION_PROMPT = `[LOOP - ITERATION {{ITERATION}}/{{MAX}}]

Your previous attempt did not output the completion promise. Continue working on the task.

**Before continuing:**
1. Re-read session files if available: README.md, plan.md, state.md
2. Review AGENTS.md for project rules
3. Check todo list — what's done vs pending?

**Rules:**
- Don't repeat completed work
- Update todo status as you progress
- Follow all AGENTS.md rules strictly
- Run quality checks after changes

**Completion:**
- When FULLY complete, output: <promise>{{PROMISE}}</promise>
- Do not stop until the task is truly done`;

// ============================================================================
// Types
// ============================================================================

interface LoopState {
  active: boolean;
  iteration: number;
  maxIterations: number;
  completionPromise: string;
  isRecovering?: boolean;
}

interface OpenCodeSessionMessage {
  info?: { role?: string };
  parts?: Array<{ type: string; text?: string }>;
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

export const LoopPlugin: Plugin = async (ctx) => {
  // Track loop state per OpenCode session (in memory only)
  const loops = new Map<string, LoopState>();
  const API_TIMEOUT = 3000;

  function getLoopState(sessionID: string): LoopState {
    let state = loops.get(sessionID);
    if (!state) {
      state = {
        active: false,
        iteration: 0,
        maxIterations: DEFAULT_MAX_ITERATIONS,
        completionPromise: DEFAULT_COMPLETION_PROMISE,
      };
      loops.set(sessionID, state);
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

  // Detect /loop command in prompt
  function detectLoopCommand(promptText: string): { isLoop: boolean; maxIterations?: number } {
    // Look for loop trigger marker
    if (promptText.includes("<loop-trigger>")) {
      const maxMatch = promptText.match(/--max(?:-iterations)?=(\d+)/i);
      return {
        isLoop: true,
        maxIterations: maxMatch ? parseInt(maxMatch[1], 10) : undefined,
      };
    }
    return { isLoop: false };
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

      const { isLoop, maxIterations } = detectLoopCommand(promptText);

      if (isLoop) {
        const state = getLoopState(input.sessionID);
        state.active = true;
        state.iteration = 1;
        state.maxIterations = maxIterations ?? DEFAULT_MAX_ITERATIONS;

        try {
          await ctx.client.tui.showToast({
            body: {
              title: "Loop Started",
              message: `Max ${state.maxIterations} iterations`,
              variant: "info",
              duration: 3000,
            },
          });
        } catch {
          /* ignore */
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

        const state = getLoopState(sessionID);
        if (!state.active || state.isRecovering) {
          return;
        }

        // Check completion via session messages API
        const completionDetected = await detectCompletionInSessionMessages(
          sessionID,
          state.completionPromise
        );

        if (completionDetected) {
          const iterations = state.iteration;
          state.active = false;
          state.iteration = 0;
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Complete!",
                message: `Task completed after ${iterations} iteration(s)`,
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
        if (state.iteration >= state.maxIterations) {
          state.active = false;
          state.iteration = 0;
          try {
            await ctx.client.tui.showToast({
              body: {
                title: "Loop Stopped",
                message: `Max iterations (${state.maxIterations}) reached`,
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
        state.iteration += 1;

        const continuationPrompt = CONTINUATION_PROMPT.replace(
          "{{ITERATION}}",
          String(state.iteration)
        )
          .replace("{{MAX}}", String(state.maxIterations))
          .replace("{{PROMISE}}", state.completionPromise);

        try {
          await ctx.client.tui.showToast({
            body: {
              title: "Loop",
              message: `Iteration ${state.iteration}/${state.maxIterations}`,
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
          loops.delete(sessionInfo.id);
        }
      }

      // === session.error - Handle abort and errors ===
      if (event.type === "session.error") {
        const sessionID = props?.sessionID as string | undefined;
        const error = props?.error as { name?: string } | undefined;

        // User abort - cancel the loop
        if (error?.name === "MessageAbortedError") {
          if (sessionID) {
            const state = loops.get(sessionID);
            if (state?.active) {
              state.active = false;
              state.iteration = 0;
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
          }
          return;
        }

        // Mark as recovering to skip idle events during error handling
        if (sessionID) {
          const state = getLoopState(sessionID);
          state.isRecovering = true;
          setTimeout(() => {
            state.isRecovering = false;
          }, 5000);
        }
      }
    },
  };
};
