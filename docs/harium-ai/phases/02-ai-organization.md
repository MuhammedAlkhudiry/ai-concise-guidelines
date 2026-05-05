# Phase 02: AI Organization

## Goal

Let the AI turn clear inbox items into organized Harium objects.

The AI should process what is clear, ask about what is unclear, and leave receipts for every meaningful action.

## User Outcome

The user dumps messy life/work input. Harium turns clear items into tasks, notes, resources, project updates, reminders, or questions.

## Technical Scope

- AI processing job for inbox items.
- Structured internal output for classification and destination.
- Writers for tasks, notes, resources, memory candidates, and questions.
- Stability or debounce rules so half-written items are not processed too early.
- Clear receipts for processed, skipped, and unclear items.

## PR Slices

### PR 01: AI Processing Job

- Add backend job for processing pending inbox items.
- Select items that are old enough and not already claimed.
- Store start, success, failure, and retry receipts.

### PR 02: Organization Schema

- Define the AI output shape for processing one item.
- Support actions like create task, create note, create resource, ask question, add project update, and no-op.
- Keep the schema internal; users should write naturally.

### PR 03: Destination Writers

- Implement deterministic writers from AI output to Harium objects.
- Keep raw inbox content linked to generated objects.
- Mark processed items only after writes succeed.

### PR 04: Clarification Questions

- Add a question model or status.
- Show unresolved questions in inbox and chat.
- Let answers resume the original item processing.

### PR 05: Processing Receipts

- Write human-readable receipts for what happened.
- Include summaries like "created task", "saved resource", "asked question", or "skipped because unclear".
- Make receipts visible on mobile and desktop/web.

## Not In This Phase

- Deep chat memory.
- External integrations.
- Local runner execution.
- Actual coding work.
