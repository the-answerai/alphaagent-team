---
description: Perform a comprehensive code review of changes with security, quality, and standards checking
argument-hint: [--staged | --branch <branch> | <file-path>]
allowed-tools: Bash, Read, Grep, Glob, AskUserQuestion
---

# Code Review Command

Perform a comprehensive code review of code changes.

## Context

- Current branch: !`git branch --show-current`
- Staged changes: !`git diff --cached --name-only | head -20`

## Review Target

Target: $ARGUMENTS (defaults to staged changes if empty)

---

## Review Process

### Phase 1: Gather Changes

Determine what to review based on arguments:

```bash
# Staged changes (default)
git diff --cached

# Specific branch comparison
git diff main...feature-branch

# Specific files
# Review provided file paths
```

### Phase 2: High-Level Analysis

1. **Understand the change**:
   - What is the purpose of this change?
   - What components are affected?
   - Is the scope appropriate?

2. **Check for completeness**:
   - Are all necessary files included?
   - Are tests included for new functionality?
   - Is documentation updated if needed?

### Phase 3: Security Review

**Critical - Check for OWASP Top 10 vulnerabilities:**

| Vulnerability | What to Look For |
|---------------|------------------|
| Injection | User input in SQL, commands, queries |
| Broken Auth | Missing auth checks, weak tokens |
| Sensitive Data | Secrets in code, unencrypted data |
| XXE | XML parsing without protection |
| Access Control | Missing authorization checks |
| Misconfiguration | Debug mode, default credentials |
| XSS | Unescaped user content |
| Deserialization | Untrusted data deserialization |
| Components | Outdated/vulnerable dependencies |
| Logging | Insufficient logging, exposed secrets |

**Scan Commands**:
```bash
# Find potential SQL injection
grep -rn "query.*\${" <files>

# Find hardcoded secrets
grep -rn "password\s*=\s*['\"]" <files>

# Find command execution
grep -rn "exec\|spawn\|execSync" <files>
```

### Phase 4: Quality Review

**Code Quality Checklist**:

- [ ] **Readability**: Code is clear and self-documenting
- [ ] **Naming**: Variables/functions have meaningful names
- [ ] **DRY**: No unnecessary duplication
- [ ] **SOLID**: Follows design principles where applicable
- [ ] **Error Handling**: Errors are caught and handled appropriately
- [ ] **Edge Cases**: Boundary conditions are handled
- [ ] **Comments**: Complex logic is documented
- [ ] **Types**: Types are appropriate and accurate (if TypeScript)

### Phase 5: Standards Review

**Project Standards**:

- [ ] **Formatting**: Code follows project style (Prettier, ESLint)
- [ ] **File Structure**: Files are in correct locations
- [ ] **Naming Conventions**: Follows project conventions
- [ ] **Import Order**: Imports are organized correctly
- [ ] **Test Coverage**: New code has appropriate tests

### Phase 6: Architecture Review

**For significant changes**:

- [ ] **Separation of Concerns**: Logic is properly organized
- [ ] **Dependencies**: New dependencies are justified
- [ ] **Performance**: No obvious performance issues
- [ ] **Scalability**: Solution scales appropriately
- [ ] **Maintainability**: Code is easy to maintain

---

## Review Output Format

```markdown
# Code Review: [Brief Description]

## Summary

**Overall Assessment**: ✅ Approve / ⚠️ Request Changes / ❌ Block

**Files Reviewed**: X files, Y lines changed

## Findings

### 🔴 Critical (Must Fix)
1. **[File:Line]** - [Issue description]
   - Why: [Explanation]
   - Fix: [Suggested fix]

### 🟡 Important (Should Fix)
1. **[File:Line]** - [Issue description]
   - Why: [Explanation]
   - Suggestion: [Recommended approach]

### 🟢 Suggestions (Consider)
1. **[File:Line]** - [Suggestion]
   - Benefit: [Why this would improve the code]

### ✅ Good Practices Observed
- [Positive observation 1]
- [Positive observation 2]

## Security Scan Results

- [ ] No injection vulnerabilities
- [ ] No hardcoded secrets
- [ ] Authentication checks present
- [ ] Authorization verified

## Test Coverage

- [ ] Unit tests included
- [ ] Edge cases tested
- [ ] Error scenarios covered

## Recommendations

1. [High-level recommendation]
2. [High-level recommendation]

## Questions for Author

1. [Clarifying question]
```

---

## Severity Levels

| Level | Description | Action |
|-------|-------------|--------|
| 🔴 Critical | Security vulnerability, data loss risk, major bug | Must fix before merge |
| 🟡 Important | Code quality issue, potential bugs, missing tests | Should fix before merge |
| 🟢 Suggestion | Style improvement, optimization, enhancement | Consider for future |

---

## Anti-Patterns to Flag

1. **Large functions** (>50 lines)
2. **Deep nesting** (>3 levels)
3. **Magic numbers/strings**
4. **Console.log in production code**
5. **Commented-out code**
6. **TODO without tracking**
7. **Catch without handling**
8. **Any type (in TypeScript)**
9. **Hardcoded credentials**
10. **Missing error handling**

---

## Success Criteria

- [ ] All critical issues identified
- [ ] Security scan completed
- [ ] Quality assessment provided
- [ ] Clear feedback for author
- [ ] Approval/changes requested decision made
