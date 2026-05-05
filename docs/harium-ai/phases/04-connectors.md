# Phase 04: Connectors

## Goal

Let Harium read from and write to external systems without becoming dependent on them.

Notion, Google, GitHub, email, calendar, and similar services are adapters. Harium remains the source of truth for its own objects.

## User Outcome

The user can connect external tools and have Harium pull useful context into the inbox, notes, resources, tasks, memory, or projects. When useful, Harium can write back drafts, tasks, comments, or updates.

## Technical Scope

- Connector framework.
- OAuth/account connection storage.
- Source event model.
- Polling and webhook ingestion.
- Import mappers into Harium objects.
- Optional writeback.
- Connector receipts.

## PR Slices

### PR 01: Connector Framework

- Add connector account model.
- Add source event model.
- Add common sync status and error receipts.
- Keep connector output normalized before AI processing.

### PR 02: Notion Connector

- Connect Notion workspace/account.
- Read selected pages/databases.
- Convert pages or database entries into Harium resources, notes, tasks, or inbox items.
- Preserve Notion page IDs and URLs.

### PR 03: Google Account Foundation

- Connect Google account.
- Store scopes per service.
- Add shared OAuth refresh and revocation flow.

### PR 04: Gmail, Calendar, and Drive

- Ingest selected Gmail threads, Calendar events, and Drive files/changes.
- Map them into Harium resources, inbox items, reminders, or context.
- Keep source links and external IDs.

### PR 05: GitHub Connector

- Connect GitHub.
- Read repositories, issues, PRs, and notifications.
- Create Harium resources/tasks from selected GitHub activity.

### PR 06: Writeback

- Add writeback policy per connector.
- Support writing comments, tasks, drafts, or updates where the connector allows it.
- Leave receipts showing exactly what was written back.

## Keep Specific Note

Google Keep should not be treated as a foundation dependency.

If official access is available for a user or organization, it can be a connector. If not, Harium should still work through its own inbox and notes.

## Not In This Phase

- Local repo execution.
- Browser/mobile QA.
- Full autonomous project work.
