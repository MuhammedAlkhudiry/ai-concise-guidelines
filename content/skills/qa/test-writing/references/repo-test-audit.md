# Repo Test Audit

Use this reference when the request is to audit all tests in a repo, directory, suite, feature area, or other broad test surface.

## Start

1. If goal tracking is available and the user asked for exhaustive completion, create a goal for the audit and keep working until the inventory is fully handled or genuinely blocked.
2. Load `deep-work` systematic mode and define the exact test set in scope.
3. Build a durable inventory from the repo's test discovery sources: test commands, framework listings, filesystem search, naming conventions, and any generated test indexes.
4. Split large inventories into non-overlapping slices by suite, package, module, feature, or test layer.

When the user explicitly grants approval to audit and repair the whole set, proceed through classification, edits, deletion, movement, profiling, and verification without pausing for each individual test unless the decision is product-sensitive or genuinely unclear.

Passing tests, lint, typecheck, or build are verification signals only. They do not satisfy a repo test audit, because they prove the current assertions run, not that the test suite is valid, complete, maintainable, or well-shaped.

## Deep Work Contract

Treat `deep-work` systematic mode as mandatory for broad test audits:

1. Define the exact set the user asked about: whole repo, directory, package, suite, feature, test layer, or changed branch.
2. Prove the inventory with commands or indexes that enumerate the target set. Search manually only to supplement, not replace, the inventory.
3. Mark every discovered test file or case as `in scope`, `out of scope`, or `unclear` before changing broad areas.
4. Classify every in-scope item with the statuses below. Do not skip green tests.
5. Work through the confirmed set slice by slice until each item has a final disposition.
6. Re-run inventory checks after moving, deleting, or renaming tests to catch missed files and stale references.
7. Finish by reporting what was included, what was excluded, what stayed uncertain, and why the coverage is complete enough to trust.

Do not sample a few files, run passing commands, and call it complete. If the full set cannot be proven, state the missing evidence and continue with the strongest proven inventory.

## Classification

Track every test file or test case with one status:

- `keep`: valid behavior contract, healthy implementation, acceptable runtime.
- `rewrite`: useful contract, but brittle, overfit, shallow, misplaced, or at the wrong layer.
- `merge`: duplicates another test or splits one contract into branch-shaped fragments.
- `move`: valid test living in a stale or misleading file, suite, or layer.
- `delete`: invalid, redundant, stale, or only written to inflate coverage.
- `investigate`: test outcome depends on app behavior, product intent, external services, or unclear ownership.
- `unclear`: cannot safely decide without user input or missing project evidence.

## Quality Checks

For each item, name the contract it protects before accepting it.
Reject tests that mainly mirror implementation, private helpers, incidental call order, framework wiring already covered elsewhere, broad snapshots, mock choreography, or exact internal data shapes that are not observable contracts.

Flag and fix tests that are:

- overfit to one historical bug without protecting the broader behavior;
- too narrow to catch the regression they claim to cover;
- shallow coverage padding with weak assertions;
- stale after renamed, moved, or removed app code;
- copied from app implementation instead of user-visible or boundary behavior;
- dependent on uncontrolled randomness, time, ordering, network, or shared state;
- duplicated across layers without a clear reason.

Prefer rewrite or merge when the behavior matters. Delete only when the test is invalid, redundant, stale, or non-contractual, and either equivalent coverage exists elsewhere or the final report names the remaining gap.

## File and Suite Shape

Check that test files mirror app code when that improves navigation and ownership: `ExampleController` should usually map to `ExampleControllerTest`, and a feature or workflow should usually have a test name that exposes the feature or workflow.
Allow exceptions for cross-cutting integration tests, public API contract suites, regression collections, generated tests, framework conventions, or cases where feature-oriented naming is clearer than class mirroring.

When names are stale, move or rename the test if doing so improves future maintenance and the repo's test runner supports it cleanly.

## Slow and Flaky Tests

Run the normal focused or full test command when feasible, then identify slow tests using framework timing output, profiler flags, repeated runs, or repo-specific tooling.
Classify slowness before changing anything:

- fixture or factory bloat;
- repeated setup that should be shared safely;
- unnecessary integration layer;
- external boundary not mocked or faked at the right level;
- polling, sleeps, retries, or time control misuse;
- real product performance issue surfaced by the test.

Refactor, fix, split, or delete slow tests according to the same contract standard. Do not hide real product slowness by weakening a valid test.

## Final Report

Finish with coverage evidence, not a vague summary. Include the inventory source, total files or cases reviewed, counts by status, important rewrites/deletions/moves, slow-test findings, commands run, and any skipped or uncertain items that affect trust in the audit.
