# Harium AI Architecture

## Core Vocabulary

Harium AI should avoid user-visible configuration rituals. The user writes naturally, and the system turns that into structured internal work.

- **Inbox item:** raw input from the user or an integration.
- **Resource:** link, file, image, document, repo, email, or external object worth keeping.
- **Note:** human or AI-written context.
- **Task:** something that should be done.
- **Project:** a durable area of work with context, tasks, and resources.
- **Memory:** durable fact, preference, relationship, routine, or prior decision.
- **Question:** clarification the AI needs before processing an unclear item.
- **Receipt:** visible record of what the AI did or did not do.
- **Job:** executable work item created by the backend.
- **Capability:** something an execution environment can do.
- **Runner:** an execution environment that can claim jobs requiring matching capabilities.

## System Roles

```txt
Harium Backend
  source of truth, AI reasoning, jobs, memory, sync, receipts

Mobile App
  capture, chat, notes, review, notifications, lightweight actions

Web/Desktop UI
  wider Harium UI for chat, review, notes, and work monitoring

Cloud Connectors
  Notion, Gmail, Calendar, Drive, GitHub, and other SaaS APIs

Optional Runners
  local desktop runner, cloud runner, server runner, or CLI daemon

Tool Providers
  Codex, OpenCode, Pi, Playwright, agent-device, shell, GitHub CLI, scripts
```

## Main Principle

Harium is the mind and memory.

Connectors are eyes and ears.

Runners are hands.

Tool providers are specialist workers.

The desktop runner must stay optional. Many users will only use mobile, web, backend AI, and cloud connectors. A local runner is only needed when work depends on a specific machine, local repo, simulator, browser session, filesystem, or installed tool.

## Capability Model

Jobs should be matched to capabilities instead of specific apps.

Examples:

- `ai_organize`: backend can process inbox content.
- `cloud_sync`: backend can read or write cloud integrations.
- `repo_access`: local runner, cloud runner, or GitHub integration can provide repo access.
- `coding_agent`: Codex, OpenCode, Pi, Claude Code, or future providers can implement.
- `browser_qa`: Playwright provider can implement.
- `mobile_qa`: agent-device or similar provider can implement.
- `local_files`: local runner can implement.
- `shell`: local runner can implement.

This keeps Codex as one provider, not the architecture.

## Job Flow

```txt
1. User dumps input or sends a chat message.
2. Backend stores the raw item.
3. AI classifies intent and required context.
4. Backend creates notes, tasks, memory, questions, resources, or jobs.
5. If a job is executable, a runner with matching capabilities claims it.
6. Runner invokes the right provider.
7. Provider returns logs, artifacts, links, diffs, QA evidence, or failures.
8. Backend stores receipts and updates the user-facing state.
9. User sees the result in chat, notifications, inbox, task views, or project views.
```

## Connector Model

External integrations should normalize into Harium events:

```txt
External object changed
  -> connector reads webhook or polling change
  -> Harium stores raw source event
  -> AI or deterministic mapper creates Harium objects
  -> optional writeback updates the external system
```

Every imported object should preserve provenance:

- source system
- external id
- external url
- last synced version or hash
- last seen time
- writeback policy

## Product Guardrails

The system can act automatically, but it should always leave visible receipts.

Receipts are not approval prompts. They are how the user understands what changed, corrects wrong assumptions, and builds trust without babysitting.

Unclear items should become questions instead of being forced into the wrong place.

Automated work should prefer reversible, inspectable outputs: notes, tasks, drafts, branches, PRs, and receipts.
