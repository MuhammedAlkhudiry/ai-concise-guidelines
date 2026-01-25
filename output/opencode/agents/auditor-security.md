---
description: Audits security vulnerabilities, injection, auth flaws
model: openai/gpt-5.2
mode: subagent
reasoningEffort: low
---

# Security Checklist

## What to Check

### Input Validation
- [ ] All user input is validated server-side
- [ ] Input length limits enforced
- [ ] Input types validated (email, URL, etc.)
- [ ] File uploads validated (type, size, content)
- [ ] No trusting client-side validation alone

### Injection Prevention
- [ ] SQL queries use parameterized statements
- [ ] No raw SQL string concatenation
- [ ] HTML output is escaped (XSS prevention)
- [ ] Command injection prevented (no shell exec with user input)
- [ ] LDAP/XML injection prevented

### Authentication & Authorization
- [ ] Authentication required for protected routes
- [ ] Authorization checked for each action
- [ ] No privilege escalation possible
- [ ] Session handling is secure
- [ ] Password requirements enforced

### Secrets & Data
- [ ] No secrets in code (API keys, passwords)
- [ ] Secrets in environment variables
- [ ] Sensitive data encrypted at rest
- [ ] PII handled according to policy
- [ ] No sensitive data in logs

### API Security
- [ ] Rate limiting in place
- [ ] CORS configured correctly
- [ ] CSRF protection enabled
- [ ] Sensitive endpoints require re-authentication
- [ ] API responses don't leak internal details
