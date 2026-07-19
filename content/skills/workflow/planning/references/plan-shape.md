# Plan Shape

Use the same body structure for in-chat and persisted plans. Persisted plans add frontmatter; their plan body does not use a different template.

New plans are intentionally short. Capture the decisions that define the intended change, then turn them into ordered, checkable steps.

If a plan would require an `Open Questions` section, stop and ask the user first. Finalize the plan only after the blocking decisions are answered.

Use only the relevant sections from this shape. Use bullets for decisions and numbered lists for steps. By default, make each step one short, dense line that combines the action with its important scope or outcome; do not add nested detail. Expand steps only when the user explicitly asks for a detailed plan. Keep emoji-prefixed headings for scanability, and omit sections that do not add signal. Do not add `🎯 Product Decisions` to technical-only work or `🔁 Migration Steps` just to say "none." Use `📝 Updates` only for later changes, decisions, or scope corrections.

```md
# Billing Upgrade

## 🎯 Product Decisions

### 👤 User Story

- As a workspace owner, I want to upgrade my plan without contacting support.

### ✨ UX

- Keep plan selection inside the existing billing settings page.

## 🛠️ Technical Decisions

### 🗄️ Data Model

- Store `workspace_billing.plan_code` backed by provider price IDs.

### 🧱 Architecture

- Treat `provider.subscription.updated` as the source of truth for subscription state.

## 🔁 Migration Steps

1. Backfill active paid workspaces from provider subscription metadata.
2. Add the new subscription constraints after the backfill succeeds.

## 🧭 Implementation Steps

1. **Persist the selected plan:** Add the billing fields and model mappings, keeping free workspaces on the explicit free plan.
2. **Build the upgrade path:** Connect billing settings to checkout creation and disable the currently active plan option.
3. **Apply provider state:** Update subscription state from the provider webhook and gate paid features on the persisted plan.

## ✅ Verification Steps

1. Run the focused billing tests for checkout creation and webhook updates.
2. Run the project's required checks.

## 🧪 QA Steps

1. Upgrade a free workspace and confirm the paid features unlock after the webhook arrives.
2. Reload billing settings and confirm the selected plan and renewal date remain correct.
```

Section intent:

- `🎯 Product Decisions`: user story and UX choices.
- `🛠️ Technical Decisions`: data model and architecture choices, not execution steps.
- `🔁 Migration Steps`: ordered backfill, data movement, or compatibility steps whose sequence matters independently of implementation.
- `🧭 Implementation Steps`: short, dense, ordered changes with a concrete outcome; add supporting detail only for an explicitly requested detailed plan.
- `✅ Verification Steps`: automated or structural checks that prove the implementation is sound.
- `🧪 QA Steps`: manual user flows with an observable expected result.
- `📝 Updates`: dated notes added after the plan is created, such as `2026-07-06: Dropped the separate plan comparison page; billing settings is enough for v1.`

For technical-only work, omit `🎯 Product Decisions` and keep only the technical decisions and steps that carry signal.
