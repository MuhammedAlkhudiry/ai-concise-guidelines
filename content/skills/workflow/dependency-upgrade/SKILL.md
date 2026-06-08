---
name: dependency-upgrade
description: Systematically upgrade project dependencies. Use for Composer, npm, bun, pnpm, yarn, lockfile updates, security updates, Laravel/PHP upgrades, React/JavaScript upgrades, framework bumps, package modernization, or dependency cleanup.
---

# Dependency Upgrade

Upgrade dependencies with proven coverage, controlled risk, and a clear per-package report.

## Workflow

1. Define the target set: all dependencies, direct dependencies, security-only, framework/runtime, dev tooling, named packages, or another explicit scope.
2. Inventory manifests, lockfiles, package managers, workspace boundaries, runtime versions, scripts, checks, and related source/test surfaces before changing versions.
3. Load only the relevant references: `references/php-composer.md`, `references/laravel.md`, `references/javascript.md`, and `references/react.md`.
4. Research current official release notes, changelogs, upgrade guides, or advisories for direct dependencies with meaningful behavior changes, especially major upgrades.
5. Classify each dependency by risk: low-risk tooling, leaf package, transitive/security-only, runtime/framework package, or cross-cutting application package.
6. Upgrade in small batches with the project's existing package manager and lockfile flow.
7. Apply small compatibility fixes directly, including renamed imports, option changes, config updates, simple callsite changes, type fixes, and related test updates.
8. Skip and ask for approval before broad migrations, architecture changes, many-file API rewrites, unclear behavior changes, native rebuilds, or test-suite rewrites.
9. Run the relevant checks after each risky batch and at the end.
10. Re-check the inventory so every in-scope dependency is upgraded, intentionally skipped, or still blocked with a reason.

## Unused Packages
- Search manifests, imports, config, scripts, service providers, tests, build tooling, and runtime integration before calling a package unused.
- Remove clearly unused packages with the package manager, update the lockfile, and verify affected checks.
- Ask approval before removing packages with unclear dynamic, framework, plugin, or production-only usage.
- Report removed, kept, and unclear unused-package candidates with evidence.

## Patching
- Do not patch dependencies, vendor files, installed dependency directories, generated package output, or lockfile internals as a permanent fix.
- Use temporary patches only to diagnose or unblock verification, then remove them before finishing.
- Ask approval before keeping temporary patches or adding permanent patches, forks, aliases, Composer patches, `patch-package`, or monkey patches.
- If an upgrade needs a permanent patch to work, skip it and report the approval request with cleaner alternatives.

## Report

Create a durable report file before changing versions. Keep it outside source control unless the user asks for a repo doc, share its path early, and update it after each dependency or batch.
On resume, read the report before continuing. Final answers must link the report and include the latest status; never substitute a summary for the report.
Create an entry for every in-scope dependency, including packages that were not upgraded.

Each dependency entry includes:

- Package, ecosystem, old version, new version, upgrade reason, and scan marker: 🩹 patch, ✨ minor, or 🚨 major.
- Direct dependency entry, or transitive dependency grouped under its parent package or advisory.
- Links used: changelog, release notes, upgrade guide, advisory, docs, or relevant PR/issue.
- Notable changes/features explained in plain language, including practical impact, behavior changes, removals, security notes, and why the user should care.
- Code/config/test changes made, including touched files when useful.
- Checks run and result for that dependency or batch.
- Patch status: none, temporary removed, temporary kept with approval, or permanent approved.
- Status: upgraded, skipped pending approval, blocked, or unchanged with reason.
