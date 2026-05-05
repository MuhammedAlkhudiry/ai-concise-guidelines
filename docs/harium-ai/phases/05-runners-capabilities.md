# Phase 05: Runners and Capabilities

## Goal

Give Harium hands when work requires tools outside the backend.

Runners are optional execution environments. A desktop runner is one kind of runner, not a requirement for every user.

## User Outcome

Users who install a runner can let Harium act on local or specialized environments. Users who do not install a runner still get inbox, chat, notes, memory, connectors, and cloud-side automation.

## Technical Scope

- Job model with required capabilities.
- Runner identity, heartbeat, and claim flow.
- Capability registry.
- Log and artifact streaming.
- Desktop app runner mode.
- Cloud/server runner option.
- Provider adapters for shell, files, Git, GitHub, browser QA, mobile QA, and coding agents.

## PR Slices

### PR 01: Job and Capability Model

- Add jobs with status, priority, required capabilities, input payload, and result payload.
- Add capability registry.
- Add runner eligibility rules.

### PR 02: Runner Registration and Heartbeat

- Let a runner register itself.
- Store available capabilities.
- Add heartbeat and stale-runner detection.

### PR 03: Claim and Log Streaming

- Let runners claim jobs atomically.
- Stream status, logs, artifacts, and receipts back to the backend.
- Handle success, failure, timeout, and cancellation.

### PR 04: Desktop Runner Shell

- Add Electron desktop app foundation or runner mode.
- Authenticate the local runner.
- Show runner status, active jobs, logs, and recent receipts.

### PR 05: Basic Providers

- Add provider adapters for shell, local files, Git, GitHub CLI/API, and installation guides.
- Keep provider outputs structured enough for receipts and follow-up work.

### PR 06: QA Providers

- Add browser QA provider using Playwright.
- Add mobile QA provider using agent-device or the chosen mobile automation tool.
- Store screenshots, logs, and evidence as job artifacts.

### PR 07: Coding Agent Providers

- Add provider adapter for Codex first.
- Keep the interface open for OpenCode, Pi, Claude Code, or other future workers.
- Treat coding agents as providers, not as the product architecture.

## Not In This Phase

- Full autonomous project planning.
- Multi-task project execution.
- Rich desktop UI beyond runner visibility.
