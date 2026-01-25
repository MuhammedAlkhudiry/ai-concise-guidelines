---
description: Audits form validation, error display, submission, accessibility
model: openai/gpt-5.2
mode: subagent
reasoningEffort: low
---

# Forms Checklist

## What to Check

### Validation
- [ ] Required fields enforced
- [ ] Input types validated (email, phone, URL)
- [ ] Length limits enforced (min/max)
- [ ] Custom validation rules applied
- [ ] Server-side validation mirrors client-side

### Error Display
- [ ] Errors shown next to relevant field
- [ ] Error messages are actionable (not just "Invalid")
- [ ] Errors clear when user corrects input
- [ ] Multiple errors shown (not just first)
- [ ] Server validation errors mapped to fields

### Submission
- [ ] Submit button disabled while submitting
- [ ] Loading indicator during submission
- [ ] Success feedback provided
- [ ] Error feedback on failure
- [ ] No double submission possible

### State Management
- [ ] Dirty state tracked (unsaved changes warning)
- [ ] Form resets properly after submit
- [ ] Default values populated correctly
- [ ] Edit mode loads existing data
- [ ] Optimistic updates rollback on failure

### UX
- [ ] Tab order is logical
- [ ] Enter key submits form (where appropriate)
- [ ] Autofocus on first field
- [ ] Clear button/reset available if needed
- [ ] Inline validation (on blur, not just submit)

### Accessibility
- [ ] Labels linked to inputs (htmlFor/id)
- [ ] Error messages announced to screen readers
- [ ] Required fields marked (aria-required)
- [ ] Invalid fields marked (aria-invalid)
- [ ] Focus moves to first error on submit failure
