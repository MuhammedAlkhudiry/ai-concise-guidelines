# Plan Files

Plan files are Markdown scratchpads with memory. Keep them short.

The AI authors plan files directly: create files, edit content, archive plans, and update the project index.

## Layout

```text
~/plans/
  project-name/
    INDEX.md
    2026-06-21-auth-feature.md
    2026-06-21-editor-rebuild/
      PLAN.md
      notes.md
      ui-image.png
      useful-script.ts
      some-pdf.pdf
      some-doc.docx
    archive/
      2026-06-01-old-plan.md
```

- Keep active plans directly in the project folder.
- Keep retired plans in `archive/`.
- Use `INDEX.md` as the active-plan entry point.
- Use a folder only when a plan needs supporting notes, screenshots, research, or separate phase files.

## Metadata

Every plan main file starts with frontmatter:

```md
---
created: YYYY-MM-DD
updated: YYYY-MM-DD
project: project-name
description: Short list-view summary
---
```

A plan is archived only when it is moved into `archive/`.

Update `updated` whenever changing the plan body.

## New Plans

New plans are intentionally short. They capture the current shared thinking without turning early planning into a detailed document.

If a plan would require an `Open Questions` section, stop and ask the user first. Create the plan only after the blocking decisions are answered.

Use the relevant sections from this shape. Every non-empty section uses bullets. Use the emoji-prefixed headings for scanability, but omit sections that do not add signal. Do not add `🎯 Product Decisions` to a refactor or backend cleanup plan unless there is a real product or UX decision. Do not add `🔁 Migration Steps` just to say "none." Use `📝 Updates` only when there are later plan changes, decisions, or scope corrections.

```md
# Billing Upgrade

## 🎯 Product Decisions

### 👤 User Story

- As a workspace owner, I want to upgrade my plan without contacting support so I can unlock paid features immediately.

### ✨ UX

- Keep plan selection inside the existing billing settings page.
- Disable the currently active plan option.
- Show the confirmed renewal date after the webhook updates subscription state.

## 🛠️ Technical Decisions

### 🗄️ Data Model

- Represent plans with `workspace_billing.plan_code`, a non-null string enum backed by provider price IDs.
- Store `workspace_billing.renews_at` as the provider subscription period end.
- Enforce one active provider subscription per workspace with a unique `provider_subscription_id`.

### 🧱 Architecture

- Route checkout creation through `BillingService::createUpgradeCheckout(workspace, planCode)`.
- Treat `provider.subscription.updated` as the source of truth for persisted subscription state.
- Gate paid feature access on `workspace_billing.plan_code`, not checkout return params.

## 🔁 Migration Steps

- Backfill active paid workspaces from provider subscription metadata.
- Set free workspaces to `plan_code = free` and keep subscription-specific fields null.
- Add the unique subscription index only after duplicate legacy IDs are resolved.
```

Use `📝 Updates` for later plan changes, decisions, or scope corrections. Examples:

- `2026-07-06: Confirmed provider webhooks already include renewal period end.`
- `2026-07-06: Dropped separate plan comparison page; billing settings is enough for v1.`

Section intent:

- `🎯 Product Decisions`: user story and UX choices.
- `🛠️ Technical Decisions`: data model and architecture choices, not execution steps.
- `🔁 Migration Steps`: ordered backfill, data movement, or compatibility steps.
- `📝 Updates`: dated notes added after the plan is created.

For technical-only work, keep the plan technical-only:

```md
# React Component Refactor

## 🛠️ Technical Decisions

### 🗄️ Data Model

- No application data changes.

### 🧱 Architecture

- Split large mixed-behavior components into focused child components, hooks, and helpers.
- Preserve current behavior and visual output unless a target component explicitly requires a UI change.
```

If new information invalidates a plan, preserve useful content, prune stale detail, revise the wrong parts, and show the updated plan.

## Helper CLI

The `plan` CLI helps find, view, index, and archive plans. It does not author plans.

```bash
plan list --project=<project-name>
plan show --project=<project-name>
plan show auth --project=<project-name>
plan path auth --project=<project-name>
plan archive auth --project=<project-name>
plan index --project=<project-name> --write
```

- `plan show` without a query prints the latest active plan.
- `plan path` prints the path to a matching plan file.
- `plan archive` moves a plan into `archive/` and refreshes `INDEX.md`.
