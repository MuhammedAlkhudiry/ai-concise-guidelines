# Part Template

Use calm, compact language. Orient the user without front-loading the whole implementation, then use this shape:

```md
## Part <number>: <title> · <estimate> · <status>

**Outcome:** What the user or system can do when this part works.

**How it works:** A plain-language behavioral explanation, followed by only the technical context needed now.

**Where to look:** The focused screens, routes, files, or symbols that make this part understandable.

**Start here:** One small, exact action for inspecting or exercising the part.

**Expected:** The observable result of that action.

**Watch for:** Immediate risks, surprises, or decisions worth discussing.

**Pause:** Ask what the user sees, answer questions, then offer the next step without starting it.
```

Omit a field when it adds no signal. Keep every part focused on product behavior, substantive changes, or core implementation. Environment and infrastructure preparation—including seeders, development ports, process startup, dependencies, and test-data setup—must happen outside the part. Keep code focused and actions runnable in the prepared environment. Continue one step at a time; do not dump the remaining sequence unless asked.
