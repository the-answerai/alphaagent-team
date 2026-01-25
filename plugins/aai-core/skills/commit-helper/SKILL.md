---
name: commit-helper
description: Patterns for creating conventional commits with proper formatting and validation. Used by git-pr-manager agent.
user-invocable: false
---

# Commit Helper Patterns

Reference patterns for creating semantic, conventional commits.

## Conventional Commit Format

```
type(scope): short description

[optional body]

[optional footer]

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Commit Types

| Type | Description | Semver Impact |
|------|-------------|---------------|
| `feat` | New feature | MINOR |
| `fix` | Bug fix | PATCH |
| `docs` | Documentation only | - |
| `style` | Formatting, no code change | - |
| `refactor` | Code restructure, no behavior change | - |
| `perf` | Performance improvement | PATCH |
| `test` | Adding/updating tests | - |
| `chore` | Build process, dependencies | - |
| `ci` | CI/CD configuration | - |
| `build` | Build system changes | - |

## Rules

### Subject Line
- Use imperative mood: "add" not "added" or "adds"
- Start with lowercase
- Maximum 72 characters
- No period at end

### Scope (optional)
- Lowercase
- Use component/area name: `auth`, `api`, `ui`, `db`
- Keep consistent within project

### Body (optional)
- Explain what and why, not how
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (optional)
- Reference issues: `Closes #123`
- Note breaking changes: `BREAKING CHANGE: description`

## Examples

### Feature
```
feat(auth): add OAuth2 token refresh

Implement automatic token refresh when access token expires.
Uses refresh token stored in secure cookie.

Closes #234
```

### Bug Fix
```
fix(api): handle null response from external service

The weather API sometimes returns null for temperature.
Added null check with fallback to cached value.
```

### Chore
```
chore(deps): update dependencies to latest versions

- Updated React to 18.2.0
- Updated TypeScript to 5.3.0
- Updated ESLint to 8.56.0
```

## Pre-Commit Checks

Before committing, verify:

1. **No secrets**: No API keys, passwords, or tokens
2. **No debug code**: No console.log, debugger statements
3. **No TODOs for critical paths**: Address or create ticket
4. **Tests pass**: Run test suite if available
5. **Lint passes**: No linting errors
6. **Proper staging**: Only intended files staged

## Anti-Patterns

- "WIP" or "work in progress" commits
- "Fixed stuff" or vague messages
- Mixing unrelated changes in one commit
- Committing generated/build files
- Committing .env or credentials
