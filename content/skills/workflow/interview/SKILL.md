---
name: interview
description: >-
  Structured multi-turn interviewing for goals, experiences, requirements, decisions, constraints,
  and understanding before downstream work. Use automatically when multiple dependent, high-impact
  unknowns require sustained user input, when the user asks to be interviewed, or when another
  workflow delegates an interview; do not use for one-off clarification or discoverable facts.
---

## Entry

1. Start an interview only when all are true:
   - Multiple dependent unknowns remain.
   - Guessing could materially change the outcome.
   - Available code, documents, tools, or research cannot answer them.
   - One focused clarification would not resolve them.
2. Inspect available evidence before asking the user anything it can answer.
3. Announce the interview, name the uncertainty that triggered it, explain that questions will come one at a time, and say the original workflow will resume after confirmation.
4. Let the user skip the interview, stop it, or delegate decisions to the agent.
5. Establish the interview objective and track topics as `resolved`, `open`, `assumed`, or `deferred`.

## Interview

1. Ask one focused question per turn and wait for the answer.
2. For experiences or facts, use open, neutral questions and probe for concrete past examples.
3. For decisions or preferences, offer a small set of distinct options when useful; explain the consequential trade-off and recommend one when it clearly wins.
4. Follow meaningful answers instead of walking a rigid checklist. Close the current topic before moving to an unrelated branch unless the answer changes the interview structure.
5. Update the topic map after every answer. Summarize when a branch closes, the conversation drifts, or the user needs orientation.
6. Do not prolong the interview to eliminate harmless uncertainty. Continue only while the next answer could change the downstream outcome.

## Challenge and Teach

- Actively challenge consequential assumptions, contradictions, vague abstractions, premature solutions, and avoided trade-offs.
- Challenge by stating the evidence or tension, explaining why it matters, then asking one focused question.
- Teach only the context needed for an informed answer. Give practical alternatives, their trade-offs, and an opinionated recommendation before returning to the question.
- Do not manufacture objections, turn every answer into a debate, overwhelm the user with a lecture, or decide user-owned values without permission.
- Increase the intensity only when the user explicitly asks to be grilled or stress-tested.

## Completion and Handoff

1. Finish when the interview objective is covered and every material topic is resolved, explicitly assumed, or deferred.
2. Present a concise synthesis containing only applicable fields:
   - Objective
   - Key decisions
   - Constraints
   - Non-goals
   - Assumptions
   - Deferred or unresolved items
3. Ask the user to confirm that the synthesis is accurate. Fold corrections back into it until confirmation is explicit.
4. After confirmation, return the synthesis to the calling workflow and resume the original task automatically.
5. Do not create a spec, plan, file, or other persistent artifact unless the user or calling workflow requested it.
6. If the user stops or cancels, stop immediately and return the partial topic map without pressing for confirmation or continuing downstream work.
