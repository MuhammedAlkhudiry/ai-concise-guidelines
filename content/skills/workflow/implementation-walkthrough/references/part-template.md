# Part Template

Use warm, calm, compact language. The template is a menu, not a form: include only what helps with the current
learning objective. Never front-load the whole implementation.

```md
## Answer

Directly answer the user's question, challenge, requested change, or detour before returning to the walkthrough.
Omit this entire section when there is nothing separate to answer.

## Part <number>: <title> · <estimate> · <status>

<Startup outcome, progress preview, or environment status when relevant.>

**Outcome**

What the user or system can do when this part works.

**How it works**

A short plain-language behavioral explanation. Add only the technical context needed now.

**Where to look**

One focused screen, route, file, or symbol when it makes the current step easier to understand.

**Start here**

One small, exact action for inspecting or exercising the part.

**Expected**

The observable result of that action.

**Watch for**

One immediate risk, surprise, or decision worth discussing.

**Pause**

Ask one easy-to-answer question about what the user sees or wants clarified. Answer questions before offering one next
step, and never start that step in the same response.
```

Once the walkthrough has started, every final answer uses this shape until it is complete. Commentary and working
updates never use it. `Answer` is the escape hatch: handle the detour fully there, keep the current step paused, then use
the part below to preserve the user's place. Never put walkthrough prose before `Answer` or outside the template in a
final answer.

Omit any optional field when it adds no signal; most steps should not need every field. Keep every part focused on product
behavior, substantive changes, or core implementation. Environment and infrastructure preparation—including seeders,
development ports, process startup, dependencies, and test-data setup—must happen outside the part. Keep code focused
and actions runnable in the prepared environment. Continue one learning objective and one action at a time. Do not dump
the remaining sequence, repeat settled context, or answer anticipated questions unless asked.
