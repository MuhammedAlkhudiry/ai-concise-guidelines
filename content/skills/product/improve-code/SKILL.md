---
name: improve-code
description: Improve product code quality, architecture, reliability, performance, maintainability, tests, dependencies, or developer workflow. Use for anything from small cleanup to major refactors, library installation, framework changes, and codebase modernization.
---

# Improve Code

Improve the real codebase at the right scale: small cleanup, bug-prone code, tests, performance, major refactors, new libraries, framework changes, or architecture cleanup.

## Workflow

1. For open-ended requests, do not ask what to improve. Inspect first, choose the highest-impact code target, and explain the choice.
2. Use `product-setup` for durable product setup, approved evidence sources, and any needed `PRODUCT_SETUP.md` updates.
3. Inspect broadly before choosing: sample multiple relevant modules, callers, tests, runtime paths, dependencies, docs, and data-model boundaries. Do not stop at the first file, first smell, first failing test, or first easy cleanup when the codebase has deeper evidence available.
4. Trace behavior before changing it: inputs, outputs, side effects, consumers, tests, migrations, jobs, API contracts, UI contracts, and deployment boundaries.
5. Search the web when current library docs, framework behavior, migration guidance, security guidance, performance recommendations, or package choices matter.
6. Identify candidate improvements across correctness, simplicity, duplication, architecture, data assumptions, performance, dependency health, test coverage, observability, and developer workflow.
7. Compare candidates by user impact, defect risk, runtime frequency, confidence, implementation size, and deployment risk. Recommend the strongest target, not merely the first target found.
8. Match the scope to the request. It is valid to recommend anything from a tiny cleanup to a major refactor or new dependency.
9. Suggest the change only. Include enough detail for a later execution pass.

## Result Style

- Lead with the highest-impact code improvements, not a raw file audit.
- Briefly state what areas were sampled and why the chosen target outranks the other candidates.
- Tie recommendations to concrete code paths, tests, runtime behavior, dependency evidence, or current external documentation.
- Explain the smallest correct execution path for each important suggestion.
- Include larger refactors, package installs, or framework changes when they are the correct answer.
- Call out weak evidence, missing access, risky contracts, or blocked verification directly.

## Rules

- Prefer the simplest correct change, but do not avoid larger refactors when the codebase needs them.
- Never edit files, install packages, run migrations, or implement the suggestion from this skill.
- Ask for clarification only when the target codebase is unknown or multiple unrelated targets make inspection impossible.
- Do not add a library only because it is popular; justify the boundary it improves and verify current package guidance first.
- Do not read, search, cite, or rely on agent memory, rollout summaries, previous-session notes, or memory-derived context unless the user explicitly asks for prior context.
- Do not create separate code-audit setup files.
