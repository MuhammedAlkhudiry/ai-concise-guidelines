---
name: improve-code
description: Improve product code quality, architecture, reliability, performance, maintainability, tests, dependencies, or developer workflow. Use for anything from small cleanup to major refactors, library installation, framework changes, and codebase modernization.
---

# Improve Code

Improve the real codebase at the right scale: small cleanup, bug-prone code, tests, performance, major refactors, new libraries, framework changes, or architecture cleanup.

## Workflow

1. Inspect the relevant code, callers, tests, data model, runtime paths, dependencies, docs, and existing `PRODUCT_SETUP.md`.
2. Trace behavior before changing it: inputs, outputs, side effects, consumers, tests, migrations, jobs, API contracts, UI contracts, and deployment boundaries.
3. Search the web when current library docs, framework behavior, migration guidance, security guidance, performance recommendations, or package choices matter.
4. Identify improvements across correctness, simplicity, duplication, architecture, data assumptions, performance, dependency health, test coverage, observability, and developer workflow.
5. Match the scope to the request. It is valid to recommend or implement anything from a tiny cleanup to a major refactor or new dependency.
6. When implementing, keep changes consistent with the codebase, update related tests, and run the relevant checks.

## Result Style

- Lead with the highest-impact code improvements, not a raw file audit.
- Tie recommendations to concrete code paths, tests, runtime behavior, dependency evidence, or current external documentation.
- Explain the smallest correct implementation path for each important improvement.
- Include larger refactors, package installs, or framework changes when they are the correct answer.
- Call out weak evidence, missing access, risky contracts, or blocked verification directly.

## Rules

- Prefer the simplest correct change, but do not avoid larger refactors when the codebase needs them.
- Do not add a library only because it is popular; justify the boundary it improves and verify current package guidance first.
- Do not read, search, cite, or rely on agent memory, rollout summaries, previous-session notes, or memory-derived context unless the user explicitly asks for prior context.
- Do not create separate code-audit setup files. Extend `PRODUCT_SETUP.md` only for durable code surfaces, risks, evidence sources, or check behavior.
