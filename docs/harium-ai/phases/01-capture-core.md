# Phase 01: Capture Core

## Goal

Make Harium the fastest place to dump anything.

The inbox must work as both a place the user can inspect and a pipe the user can mostly forget after capture.

## User Outcome

The user can capture text, checklist items, links, screenshots, files, thoughts, chores, ideas, and "work on this" items from mobile first, then review them later without losing context.

## Technical Scope

- Inbox item data model.
- Basic resource and attachment model.
- Mobile quick capture UI.
- Inbox list and item detail UI.
- Simple status model: raw, processed, needs question, archived.
- Receipt surface for visible AI/system activity.

## PR Slices

### PR 01: Inbox Data Model

- Add backend tables/models for inbox items.
- Store raw text, source, capture device, status, timestamps, and optional metadata.
- Add create/list/detail/update APIs.

### PR 02: Mobile Quick Capture

- Add a fast dump screen or composer.
- Support plain text and checklist-style input.
- Send items to the backend with minimal friction.

### PR 03: Inbox Review UI

- Add inbox list.
- Add item detail view.
- Show status, source, creation time, and any receipts.

### PR 04: Attachments and Resources

- Support files, images, and links as first-class resources.
- Attach resources to inbox items.
- Preserve original source data for later AI processing.

### PR 05: Receipts Foundation

- Add a generic receipt model.
- Show receipts on inbox items.
- Store system/AI activity without requiring chat messages for every background action.

## Not In This Phase

- AI digestion.
- Chat.
- External connectors.
- Local runners.
- Coding automation.
