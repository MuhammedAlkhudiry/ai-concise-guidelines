# Codex Thread Management

Use this workflow when setting up or refining Codex thread hygiene, especially scheduled cleanup of titles, archived threads, pinned threads, and daily summaries.

## Workflow

1. Confirm whether the user wants a one-off cleanup or a recurring automation.
2. For recurring cleanup that should continue the same conversation, use a heartbeat automation attached to the current thread.
3. Prefer archiving over deletion; Codex thread tools support archiving as the normal cleanup action.
4. Keep the automation prompt self-sufficient and action-oriented.
5. Inspect Codex threads broadly; do not use a fixed thread-count cap unless the tool requires one.
6. Normalize vague, low-signal, or unprefixed titles only when the better title and category are obvious from the conversation. Read the latest relevant message context before renaming; this usually means more than the last 2-3 messages when the thread is long or has changed direction. Use recent activity and outcome as the source of truth, not the first message or initial title seed. Every normalized title must start with `[emoji TYPE]`, where `TYPE` is exactly one of `FEAT`, `BUG`, `REF`, `PLAN`, or `OTHER`, and `emoji` is chosen to match the specific thread topic.
7. Archive only unpinned threads that have been inactive for at least 7 days and whose latest messages reasonably suggest completed, stale, or no-longer-useful work.
8. Archive unpinned threads that have been inactive for at least 30 days even when completion is not obvious.
9. Never archive pinned threads.
10. Do not archive ambiguous 7-day stale threads; summarize them as deferred archive decisions.
11. Pin or unpin threads only when recent activity and importance make the choice obvious.
12. Automatically run `ai-suggest-improvements` for qualifying completed or stale work threads that reveal durable agent-workflow friction; fork each target thread in the same directory and do not append meta-analysis to the original target thread.
13. Do not create database or filesystem backup files during routine cleanup. Use Codex thread tools first; when a local-index fallback is unavoidable, limit it to exact known thread IDs and report the fallback.
14. After changes, reply in the management thread with a short summary of renamed threads, archived threads, pin changes, aggregate improvement-review results, and deferred archive decisions.

## Large Rename Batches

For large rename batches, delegate the title decision work instead of forcing the management thread to hold every thread's context. Spawn low-reasoning subagents, preferably `gpt-5.4` with low reasoning when available, and assign each subagent 5-10 candidate threads.

Each subagent should:

- Read enough latest message context to understand the actual recent subject and outcome, not just the title, first message, or final 2-3 messages.
- Propose a concise `[emoji TYPE] Title` for each assigned thread.
- Mark whether each proposal is high confidence, best-effort, or should be left untouched.
- Rename directly only if the subagent has the Codex thread title tool available in its own session and was explicitly assigned to rename. If the tool is unavailable, return high-confidence proposals for the management thread to apply.
- Avoid archiving, pinning, unpinning, forking, sending messages, or editing anything unless explicitly assigned that action.

The management thread should collect subagent results, review them as a batch, and apply high-confidence rename proposals with the Codex thread tools. For best-effort title proposals, make the strongest safe call from the available latest context instead of asking the user to decide; keep the current title only when the proposed title is clearly worse or unsupported. Group rename tool calls where practical instead of applying proposals one by one in a long manual loop.

## Improvement Reviews

Use this only when the thread shows reusable workflow friction such as missing docs, stale instructions, slow checks, hidden setup, repeated manual steps, brittle automation, or tool pain that would affect nearby future tasks.

Do not run improvement reviews for every completed or archived thread. Most completed threads should be renamed or archived without a meta-review. Once a thread shows a concrete lesson likely to improve future nearby tasks, the review should be automatic rather than needing user approval.

Age alone is not a review signal. Trivial threads such as greetings, simple list commands, one-off title normalization runs, or age-only archive candidates should not get an improvement fork.

Do not review the management thread itself unless the user explicitly asks. The targets are the completed or stale work threads found during cleanup.

For each qualifying target thread, fork that target in the same directory, send the fork the follow-up prompt, wait for all review forks to finish, and archive completed review forks unless the user needs to keep them visible.

Cap automatic improvement reviews at 5 target threads per cleanup run. Prefer the highest-signal threads: repeated tool failures, stale or missing instructions, hidden setup, slow/noisy checks, brittle automation, or repeated manual steps.

Summarize improvement reviews as an expanded aggregate, not as a single compressed theme sentence. Include:

- Review count: number requested, completed, skipped, failed, and archived.
- Reviewed targets: short titles or categories of the source threads reviewed.
- Key themes: 2-5 bullets. Each theme should include the durable lesson and why it matters for future agent work.
- Concrete follow-ups: specific docs, skills, checks, scripts, automations, or repo rules worth creating or tightening.
- No-suggestion results: count any review that found no meaningful improvements.
- Fork status: note whether review forks were archived, left visible, pending, or failed.

Do not paste each fork's full suggestion report into the management thread. The summary should be expanded enough that the user can understand the lessons without opening the forks.

```text
Use ai-suggest-improvements for this completed session.

Review the full thread path: goals, constraints, decisions, delays, verification, and instruction gaps.
Suggest only durable repo, tooling, docs, automation, skill, or process improvements that would help future nearby agent sessions.
Do not edit files, install packages, run mutating scripts, or implement the suggestions.
If there are no meaningful improvements, say so directly.
```

## Thread Title Prefixes

Use a stable category word with a topic-specific emoji:

- `[emoji FEAT]`: feature work, product changes, UI additions, integrations, or new behavior.
- `[emoji BUG]`: bug reports, investigations, regressions, fixes, production issues, or failing checks.
- `[emoji REF]`: refactors, simplification, cleanup, architecture, tests/coverage cleanup, or code-quality passes.
- `[emoji PLAN]`: planning, workshops, research, options, strategy, reviews without edits, or design exploration.
- `[emoji OTHER]`: administrative, personal, setup, automation, device/browser tasks, simple questions, or anything useful that does not fit the other prefixes.

Choose the emoji per thread from the concrete topic, not from the category. Prefer colorful, readable emoji. Avoid black, dark, or visually heavy icons when a lighter/colorful alternative can represent the topic. For example, use a payment emoji for payment work, a phone emoji for mobile work, a tree emoji for family-tree or paper-tree work, a chart emoji for analytics, a shield emoji for auth/security, a document emoji for docs, a gear emoji for setup/tooling, or another clear symbol when it better represents the thread.

Do not use fixed category icons such as always using the same emoji for every `FEAT`, `BUG`, `REF`, `PLAN`, or `OTHER` title. Keep the category word stable and uppercase so titles remain scannable.

Treat a missing prefix, a wrong category word, or a generic/fixed emoji as a title-cleanup signal. Add or correct a prefix when the category and topic emoji are reasonably supported by the latest context. If multiple reasonable titles exist, choose the clearest one instead of asking the user to decide.

When renaming, inspect the latest available message context first. Do not limit this to only the final 2-3 messages when the thread is long, compacted, or has a lot of tool output; read enough recent turns to understand the actual current subject, outcome, and any direction changes. If the first message says one thing but later messages changed the task, completed it, narrowed it, or revealed the real topic, title the thread from the latest clear state. Do not rename from the first message alone unless the latest messages are unavailable or add no new meaning.

## Default Automation Prompt

Use this shape when the user asks for active daily thread cleanup and does not need custom wording:

```text
Manage Codex threads once per day.

- Inspect Codex threads broadly; do not use a fixed thread-count cap unless the tool requires one.
- Normalize vague, low-signal, or unprefixed thread titles into concise, useful titles when the correct title and category are obvious from the conversation. Read enough latest message context before renaming, especially for long threads; use recent activity and outcome as the source of truth, not the first message, initial title seed, or only the final 2-3 messages. Every normalized title must start with `[emoji TYPE]`, where `TYPE` is exactly one of `FEAT`, `BUG`, `REF`, `PLAN`, or `OTHER`, and `emoji` is chosen to match the specific thread topic rather than the category. Prefer colorful, readable emoji and avoid black, dark, or visually heavy icons when a lighter/colorful alternative fits.
- For large rename batches, use low-reasoning subagents in groups of 5-10 candidate threads to inspect latest context and return structured title suggestions. Collect the suggestions, batch-review them, and batch-apply high-confidence renames from this management thread with the Codex thread tools. For best-effort suggestions, make the strongest safe call from the available context instead of asking the user to decide. Let a subagent rename directly only if its session exposes the Codex thread title tool and the assignment explicitly allows renaming.
- Archive unpinned threads only when they have been inactive for at least 7 days and their latest messages reasonably suggest the work is completed, stale, or no longer useful.
- Archive unpinned threads that have been inactive for at least 30 days even when completion is not obvious.
- Never archive pinned threads.
- Do not archive ambiguous threads; include them in the summary as deferred archive decisions instead.
- Pin or unpin threads only when the need is obvious from recent activity and thread importance.
- Automatically run ai-suggest-improvements for up to 5 qualifying completed or stale work threads that reveal durable agent-workflow friction; fork each target thread in the same directory, wait for all review forks, aggregate the results, and archive completed review forks unless they should stay visible.
- Do not create database or filesystem backup files during routine cleanup. Use Codex thread tools first; when a local-index fallback is unavoidable, limit it to exact known thread IDs and report the fallback.
- After making changes, reply in this thread with a short daily summary of renamed threads, archived threads, any pin changes, aggregate improvement-review results, and deferred archive decisions.
```

## Rules

- Ask before making the automation more aggressive than the user requested.
- Keep stale thresholds explicit.
- Treat pinned threads as protected unless the user explicitly changes that rule.
- Use the thread-management tools for thread actions and the automation tool for schedules; do not describe unsupported hard-delete behavior as available.
