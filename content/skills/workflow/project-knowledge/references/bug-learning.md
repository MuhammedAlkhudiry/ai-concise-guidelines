# Bug Learning Template

Use this only for a hard-earned bug: one that took significant investigation, crossed multiple files or systems, had misleading symptoms, or revealed a durable invariant future agents should know.

```md
---
title: Hard-Earned Bug Title
feature:
related_features: []
key_files:
  - app/Actions/Example.php
fixed_in:
last_verified: YYYY-MM-DD
---

# Hard-Earned Bug Title

## What Broke

The symptom and user/system impact.

## Root Cause

The real mechanism, not just the symptom.

## Why It Was Hard

What made this take long investigation or many steps to detect.

## Durable Learning

The rule future agents should remember.

## Regression Protection

Tests, guards, monitoring, or code paths that now protect this.

## Update Related Knowledge

Feature packs, glossary terms, aliases, or index entries updated because of this.
```
