---
name: security-analysis
description: Security vulnerability scanning and OWASP Top 10 compliance checking. Use when reviewing code for security issues, validating authentication/authorization, or ensuring security best practices.
---

# Security Analysis Skill

## Quick Reference

Use this skill when:
- Reviewing code for security vulnerabilities
- Implementing authentication/authorization
- Validating input handling
- Checking for common security flaws
- Ensuring OWASP Top 10 compliance

---

## Security Checklist (OWASP Top 10)

### 1. Broken Access Control

**Check for**:
- Missing authorization checks on protected routes
- Insecure direct object references (IDOR)
- Privilege escalation vulnerabilities

**Pattern**:
```
# Find routes without auth middleware - adjust pattern for your framework
grep -rn "router\.\(get\|post\|put\|delete\|patch\)" src/routes/ | \
  grep -v "requireAuth\|isAuthenticated\|checkPermission" | \
  grep -v "public"
```

---

### 2. Cryptographic Failures

**Check for**:
- Passwords stored in plain text
- Weak hashing algorithms (MD5, SHA1)
- Hardcoded secrets or API keys
- Insufficient bcrypt rounds (<10)

**Patterns to Scan**:
```bash
# Find weak crypto usage
grep -rn "md5\|sha1\|createHash('sha1')" src/

# Find hardcoded secrets
grep -rn "api[_-]?key\s*=\s*['\"][a-zA-Z0-9]" src/

# Find potential password issues
grep -rn "password\s*=\s*['\"]" src/
```

---

### 3. Injection Vulnerabilities

**Check for**:
- SQL injection (unparameterized queries)
- NoSQL injection (unvalidated queries)
- Command injection (shell commands with user input)
- XSS (unescaped user content)

**Patterns to Scan**:
```bash
# Find potential SQL injection (template literals in queries)
grep -rn "query.*\${" src/

# Find command execution
grep -rn "exec\|spawn\|execSync" src/

# Find eval usage
grep -rn "eval(" src/
```

---

### 4. Insecure Design

**Check for**:
- Missing rate limiting on sensitive endpoints
- No CSRF protection
- Insecure session management
- Missing security headers

---

### 5. Security Misconfiguration

**Check for**:
- Debug mode enabled in production
- Default credentials
- Verbose error messages exposing internals

**Patterns to Scan**:
```bash
# Find debug code
grep -rn "console\.log\|debugger" src/

# Find exposed secrets in errors
grep -rn "throw.*password\|throw.*token\|throw.*secret" src/
```

---

### 6. Vulnerable Components

**Check for**:
- Outdated packages with known vulnerabilities

**Scan Commands**:
```bash
# NPM
npm audit --audit-level=moderate

# PNPM
pnpm audit --audit-level=moderate

# Yarn
yarn audit --level moderate
```

---

### 7. Authentication Failures

**Check for**:
- Weak password requirements
- Session fixation vulnerabilities
- Insufficient session timeout

---

### 8. Data Integrity Failures

**Check for**:
- Unsigned/unverified packages
- No integrity checks on uploaded files
- Insecure deserialization

---

### 9. Logging Failures

**Check for**:
- No audit logging for sensitive operations
- Logging sensitive data (passwords, tokens)

---

### 10. SSRF Vulnerabilities

**Check for**:
- Unvalidated URL fetching
- Internal network access from user input
- Open redirects

---

## Automated Security Scan

Create a security scan script appropriate for your project:

```bash
#!/bin/bash
echo "Running Security Scan..."

# 1. Check dependencies
echo "1. Checking dependencies..."
npm audit --audit-level=moderate 2>/dev/null || \
  pnpm audit --audit-level=moderate 2>/dev/null || \
  yarn audit --level moderate 2>/dev/null

# 2. Find hardcoded secrets
echo "2. Scanning for hardcoded secrets..."
grep -rn "password\s*=\s*['\"]" src/ --exclude-dir=node_modules || echo "No hardcoded passwords found"

# 3. Find weak crypto
echo "3. Checking for weak cryptography..."
grep -rn "md5\|sha1" src/ --exclude-dir=node_modules || echo "No weak crypto found"

# 4. Find SQL injection risks
echo "4. Checking for SQL injection risks..."
grep -rn "query.*\${" src/ --exclude-dir=node_modules || echo "No obvious injection risks"

# 5. Check for eval
echo "5. Checking for eval usage..."
grep -rn "eval(" src/ --exclude-dir=node_modules || echo "No eval usage found"

echo "Security scan complete"
```

---

## Secure Code Patterns

### Input Validation

Always validate and sanitize user input:
- Use schema validation (Zod, Yup, Joi)
- Escape HTML for display
- Parameterize database queries

### Authentication

- Hash passwords with bcrypt (12+ rounds)
- Use secure session configuration (httpOnly, secure, sameSite)
- Implement rate limiting on auth endpoints

### Authorization

- Check permissions on every protected endpoint
- Use principle of least privilege
- Log access attempts

### Error Handling

- Never expose stack traces in production
- Log errors with context but without secrets
- Return generic error messages to users

---

## Key Principles

1. **Trust nothing from users** - Validate all input
2. **Defense in depth** - Multiple security layers
3. **Least privilege** - Minimal permissions
4. **Audit everything** - Log security events
5. **Keep updated** - Regular dependency audits
6. **HTTPS everywhere** - Encrypt in transit
7. **Hash, don't encrypt passwords** - Use bcrypt
