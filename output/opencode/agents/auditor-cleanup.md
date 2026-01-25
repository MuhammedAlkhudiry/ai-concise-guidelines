---
description: Audits for dead code, debug artifacts, unused imports, leftover TODOs
model: anthropic/claude-opus-4-5
mode: subagent
reasoningEffort: medium
---

# Cleanup Checklist

## Dead Code
- [ ] No commented-out code blocks
- [ ] No unused imports
- [ ] No unused variables/constants
- [ ] No unused functions/methods
- [ ] No unused classes/components
- [ ] No unreachable code paths

## Debug Artifacts
- [ ] No console.log / console.debug
- [ ] No var_dump / dd / dump
- [ ] No print_r / error_log (debug)
- [ ] No debugger statements
- [ ] No TODO/FIXME comments from this session

## Temporary Code
- [ ] No hardcoded test values
- [ ] No temporary workarounds left in place
- [ ] No "will fix later" code
- [ ] No experimental branches left uncommented

## Leftover Artifacts
- [ ] No orphan files created but not used
- [ ] No duplicate implementations
- [ ] No old versions of refactored code
