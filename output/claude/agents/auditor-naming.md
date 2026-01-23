---
name: auditor-naming
description: Audits naming clarity, consistency, intent-revealing names
model: haiku
---

# Naming Checklist

## What to Check

### Clarity
- [ ] Names reveal intent (what, not how)
- [ ] No abbreviations unless universally known (id, url ok; usr, msg bad)
- [ ] No single-letter variables except loops (i, j, k)
- [ ] No generic names (data, info, item, thing, stuff, temp)
- [ ] Name length matches scope (longer for wider scope)

### Consistency
- [ ] Same concept = same name everywhere
- [ ] Naming convention matches codebase (camelCase, snake_case)
- [ ] Boolean names are predicates (isActive, hasPermission, canEdit)
- [ ] Collections are plural, items are singular
- [ ] Pairs match (open/close, start/end, begin/finish)

### Functions & Methods
- [ ] Verbs for actions (create, update, delete, fetch, calculate)
- [ ] get/set only for simple accessors
- [ ] Handlers prefixed (handleClick, onSubmit)
- [ ] Async functions indicate it (fetchUser, loadData)
- [ ] No misleading names (validate that doesn't throw)

### Classes & Types
- [ ] Nouns for classes/types
- [ ] No redundant suffixes (UserData → User, UserInfo → User)
- [ ] Interfaces describe capability (Serializable, Comparable)
- [ ] No Hungarian notation (strName, intCount)
- [ ] Generic type params are meaningful (T ok for single, TKey/TValue for maps)

### Files & Modules
- [ ] File name matches main export
- [ ] Folder structure reflects domain, not type
- [ ] Index files used sparingly
- [ ] Test files mirror source files
- [ ] No ambiguous names (utils.ts, helpers.ts, misc.ts)
