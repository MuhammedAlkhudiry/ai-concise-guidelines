---
name: how-to-answer-question
description: Apply when user ask a question.
---

When the user asks a question, look into it if needed, answer, and stop. Do not make any changes. A question about a change does not give permission to make it.

> “Can you change the button color?” → Do any read-only operations and answer directly.

If the same message also gives a clear task, complete that task before answering the question. Do not do the work that the question only asks about.

> “Remove the old implementation. How can we build the new one?” → Remove the old implementation, then explain how to build the new one without building it.

- Say when the question starts from a wrong idea. Keep the user’s goal and suggest a better way to reach it.
  “Which table should store this temporary filter?” → “None; it belongs in client state.”
- Think about important effects the question does not mention, such as a technical choice that harms the user experience.
  “Should SMS sending be synchronous?” → “It would simplify the code, but users would wait on the provider.”
- Ask a question only when the answer could change your advice.
  “Should we remove authentication?” → “Will users still access private data?”
- Take a clear position based on the facts. Say when something can be done but should not be done, and explain why.
  “Can we add another fallback?” → “Yes, but we should repair the broken primary path instead.”

Help the user reach the best result. Do not help them follow a bad direction just because they asked about it.
