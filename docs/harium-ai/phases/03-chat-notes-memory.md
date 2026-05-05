# Phase 03: Chat, Notes, and Memory

## Goal

Make Harium feel conversational and durable.

The user should be able to discuss anything with the AI, and the AI should remember useful context without turning every chat into a manual filing task.

## User Outcome

The user can chat with Harium, ask questions about their own context, create or refine notes, and trust that important preferences and decisions are remembered.

## Technical Scope

- Conversation and message models.
- Custom React Native chat UI.
- Streaming assistant responses.
- Note model and editor.
- Memory model with provenance and reviewability.
- Links between chat, inbox items, notes, tasks, projects, and resources.

## PR Slices

### PR 01: Conversation Model and API

- Add conversations and messages.
- Support message parts: text, attachment, action, status, and reference.
- Store assistant and user messages with timestamps and provenance.

### PR 02: Mobile Chat UI

- Build the custom React Native chat thread.
- Render message parts without depending on a full chat vendor.
- Add composer, attachments, and basic send states.

### PR 03: Streaming Responses

- Add backend streaming for assistant replies.
- Append assistant chunks to the active message.
- Handle interruption, retry, and failed responses.

### PR 04: Notes

- Add note model and APIs.
- Support simple checklist notes and Markdown-like notes.
- Let both human and AI create or update notes.

### PR 05: Memory

- Add memory entries for durable facts, preferences, decisions, relationships, and routines.
- Store why a memory exists and where it came from.
- Let the AI use memory in chat and inbox processing.

### PR 06: Cross-Linking

- Link messages, inbox items, notes, tasks, projects, resources, and receipts.
- Show references in UI so AI work remains traceable.

## Not In This Phase

- Notion/Google sync.
- Desktop local execution.
- Coding agent automation.
