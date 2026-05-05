# Phase 06: Agentic Work

## Goal

Let Harium convert tasks into executable work, run the work through available capabilities, verify the result, and report back clearly.

This is where the AI becomes useful beyond organization.

## User Outcome

The user can dump or chat a task like "add Google auth to Awraq" and Harium can identify the project, collect context, create a detailed work spec, run the right tools, verify the change, and return a receipt or PR.

## Technical Scope

- Task intent detection.
- Project and repo matching.
- Context collection.
- Work spec generation.
- Runner job creation.
- Agent execution.
- QA and evidence collection.
- PR/issue/draft output.
- Final receipts.

## PR Slices

### PR 01: Actionable Task Detection

- Detect when an inbox item or chat message implies work.
- Distinguish vague reminders from executable work.
- Create a task with action intent and required context.

### PR 02: Project Matching

- Match tasks to Harium projects.
- Link projects to repos, docs, installation guides, and known environments.
- Ask a question if the project or target is ambiguous.

### PR 03: Work Spec Generation

- Expand the task into a detailed work spec.
- Include user goal, relevant context, repo, expected behavior, verification needs, and output format.
- Store the spec as a first-class artifact.

### PR 04: Context Collection

- Collect project notes, prior tasks, resources, repo context, relevant files, and installation guide details.
- Keep collected context visible enough for debugging bad AI decisions.

### PR 05: Agent Execution

- Create runner jobs from work specs.
- Invoke the selected coding agent provider.
- Stream status and logs back into Harium.

### PR 06: Verification

- Run relevant tests, type checks, browser QA, mobile QA, or scripted checks.
- Store evidence and failures as artifacts.
- Let the AI summarize verification honestly.

### PR 07: Output and Handoff

- Create PRs, branches, issues, patches, or detailed reports depending on the task.
- Add final receipts to the task, chat, and project timeline.
- Leave unfinished work in a clear resumable state.

## Not In This Phase

- Building every possible agent provider.
- Hardcoding one project or one workflow.
- Requiring desktop for all users.
