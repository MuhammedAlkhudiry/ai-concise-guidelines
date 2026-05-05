---
name: write-installation-guide
description: Write or refresh a simple repo installation guide at ~/installation-guides/<project>.md. Use when the user asks to write an installation guide, document setup steps, or prepare install/run/verify steps for a project.
---

# Write Installation Guide

Create a short, command-focused guide for installing and running one repo.

## Workflow

1. Resolve the project name and repo path from the user request.
2. Inspect the repo setup sources: `AGENTS.md`, `README.md`, package scripts, Makefile/mise/just files, Docker/DDEV files, env examples, mobile configs, and existing docs.
3. Detect only the surfaces that exist: backend, frontend, mobile, database, services, and verification.
4. Write or update `~/installation-guides/<project>.md`.
5. Use real commands from the repo. Do not invent missing commands.
6. Do not start servers, install apps, or edit the project repo unless the user explicitly asks.

## Guide Shape

Use simple numbered steps. Omit sections that do not apply.

```md
# <Project> Installation Guide

## Backend

1. ...

## Frontend

1. ...

## Mobile

1. ...

## Verification

1. ...
