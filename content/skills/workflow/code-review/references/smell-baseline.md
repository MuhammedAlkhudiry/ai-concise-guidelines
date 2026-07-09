# Smell Baseline

Use this baseline during the Standards axis when repo standards do not already cover the issue.
Name these as possible smells, not hard violations, and tie each one to a concrete diff hunk.

- Mysterious Name: a name does not reveal the value, behavior, or domain concept.
- Duplicated Code: the same logic shape appears in multiple hunks or files.
- Feature Envy: behavior is placed away from the data or domain object it mostly depends on.
- Data Clumps: the same group of fields or parameters repeatedly travels together.
- Primitive Obsession: a primitive value stands in for a meaningful domain concept.
- Repeated Switches: repeated conditionals branch on the same type, state, or mode.
- Shotgun Surgery: one logical change forces scattered edits across unrelated owners.
- Divergent Change: one module changes for multiple unrelated reasons.
- Speculative Generality: abstraction, hooks, options, or compatibility paths exist without a present need.
- Message Chains: callers navigate through too many intermediate objects or access paths.
- Middle Man: a wrapper mostly delegates without protecting a boundary or clarifying intent.
- Refused Bequest: inheritance or interface implementation is present but most of the contract is ignored.
