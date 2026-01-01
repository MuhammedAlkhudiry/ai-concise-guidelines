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

---

## Severity Levels

| Level | Examples |
|-------|----------|
| **Blocker** | SQL injection, XSS, exposed secrets, auth bypass, unvalidated file upload |
| **Should Fix** | Missing rate limiting, overly permissive CORS, weak password policy |
| **Minor** | Could add additional headers, minor hardening opportunities |

---

## Common Issues

### SQL Injection
```php
// BAD - concatenation
$query = "SELECT * FROM users WHERE id = " . $_GET['id'];

// GOOD - parameterized
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$_GET['id']]);
```

### XSS Vulnerability
```html
<!-- BAD - unescaped -->
<div><?= $userInput ?></div>

<!-- GOOD - escaped -->
<div><?= htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8') ?></div>
```

### Exposed Secrets
```javascript
// BAD - secret in code
const API_KEY = 'sk-1234567890abcdef';

// GOOD - from environment
const API_KEY = process.env.API_KEY;
```

### Missing Auth Check
```php
// BAD - no authorization
public function deleteUser($id) {
    User::destroy($id);
}

// GOOD - authorization check
public function deleteUser($id) {
    $this->authorize('delete', User::find($id));
    User::destroy($id);
}
```

---

## Rules

1. **Never trust input** — Validate everything server-side
2. **Least privilege** — Only grant what's needed
3. **Defense in depth** — Multiple layers of protection
4. **Fail secure** — Deny by default
5. **No secrets in code** — Ever
