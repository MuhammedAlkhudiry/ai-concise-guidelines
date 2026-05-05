# Phase 07: Product Quality

## Goal

Make Harium AI feel trustworthy, understandable, and pleasant enough for daily use.

This phase is not about slowing the AI down with approval prompts. It is about making the system visible, correctable, and resilient.

## User Outcome

The user can see what the AI did, fix wrong assumptions, understand failures, and keep using Harium without feeling lost.

## Technical Scope

- Unified activity timeline.
- Notifications.
- Dashboards.
- Error and retry handling.
- Undo/correction paths.
- Memory review.
- Connector health.
- Runner health.
- Product analytics and operational visibility.

## PR Slices

### PR 01: Activity Timeline

- Add a unified view of inbox processing, chat actions, connector syncs, runner jobs, and receipts.
- Let users filter by project, source, status, and date.

### PR 02: Notifications

- Notify users when AI work starts, finishes, fails, or needs a question answered.
- Keep notification text useful and concise.
- Route notifications to mobile, desktop, email, or in-app surfaces depending on user setup.

### PR 03: Dashboard

- Add a dashboard showing open questions, pending inbox items, active jobs, failed jobs, recent receipts, and important tasks.
- Keep it generated from structured data, not manually maintained prose.

### PR 04: Corrections

- Let users correct wrong destinations, bad summaries, mistaken memories, or task classification.
- Store corrections as training context for future AI decisions.

### PR 05: Memory Review

- Add a review surface for important memory.
- Let users edit, archive, or pin memory entries.
- Show provenance so memory does not feel mysterious.

### PR 06: Integration Health

- Show connector sync health and last successful sync.
- Show runner health and available capabilities.
- Surface failures without making users read logs first.

### PR 07: Operational Visibility

- Add product analytics for capture, processing, questions, completion, connector usage, and runner success.
- Add error monitoring around AI jobs, connectors, and runners.
- Use the data to improve the system instead of guessing.

## Not In This Phase

- New core product surfaces.
- New automation powers.
- Major data model rewrites unless prior phases reveal a real flaw.
