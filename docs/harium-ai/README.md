# Harium AI Plan

Harium AI is the product direction for turning Harium into an AI-native life and work system.

The user should be able to dump anything into Harium, talk with the AI about it, let the AI organize clear items, and let the AI work on actionable items when the required tools are available.

This plan is intentionally phase-based. Each phase should be expanded only when work reaches it, but every phase is already split into PR-sized slices.

## Product Shape

Harium owns the core experience:

- Inbox for dumping anything.
- Chat for discussing, clarifying, and directing the AI.
- Notes for human and AI-written context.
- Tasks for personal work, projects, chores, reminders, and delegated work.
- Memory for durable facts, preferences, decisions, and context.
- Receipts for what the AI did, changed, skipped, or needs clarified.

External tools are adapters, not the source of truth. Notion, Google, GitHub, email, calendar, desktop runners, and coding agents can feed Harium or act for Harium, but the product should still make sense when any one integration is missing.

## Technical Shape

The backend is the source of truth for users, inbox items, notes, tasks, resources, memory, conversations, jobs, and receipts.

The mobile app is the fastest capture and review surface.

The desktop app is optional. It can provide the same Harium UI as mobile, and it can also run a local capability host for machine-local actions like repos, shell, browser QA, mobile QA, files, and coding agents.

Cloud connectors handle external SaaS systems when official APIs are available.

## Phase Map

1. [Capture Core](phases/01-capture-core.md): make the inbox real, fast, and reliable.
2. [AI Organization](phases/02-ai-organization.md): process clear inbox items into structured Harium objects.
3. [Chat, Notes, and Memory](phases/03-chat-notes-memory.md): make the AI discuss, remember, and write useful context.
4. [Connectors](phases/04-connectors.md): integrate Notion, Google, GitHub, and other external systems as optional adapters.
5. [Runners and Capabilities](phases/05-runners-capabilities.md): add optional local/cloud execution for actions that need tools.
6. [Agentic Work](phases/06-agentic-work.md): let Harium turn tasks into detailed work specs, execute them, verify them, and report results.
7. [Product Quality](phases/07-product-quality.md): make the system observable, correctable, and pleasant enough to trust daily.

## Architecture

See [architecture.md](architecture.md) for the shared vocabulary and system boundaries.

## Vision Images

- [Harium AI Ecosystem](assets/images/harium-ai-ecosystem.png)
- [Mobile Experience](assets/images/harium-ai-mobile-experience.png)
- [Desktop Runner](assets/images/harium-ai-desktop-runner.png)
