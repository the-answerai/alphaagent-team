---
name: pr-review
description: Conduct comprehensive pull request reviews with security, architecture, and quality checks. Use when user wants to review a PR.
disable-model-invocation: true
---

# /pr-review - Pull Request Review

Conducts comprehensive code review of a pull request using the `git-pr-reviewer` agent.

## Workflow

### 1. Identify PR to Review

If user provided PR number/URL:
```bash
gh pr view <number> --json title,body,author,files
```

If no argument provided:
```bash
# Find PR for current branch
gh pr list --head $(git branch --show-current)
```

If no PR found: Error and suggest using `/push` first.

### 2. Launch git-pr-reviewer Agent

Use the Task tool to launch `git-pr-reviewer` agent with the PR number.

### 3. The Agent Will

Fetch PR details and diff:
```bash
gh pr view <number> --json title,body,author,files,additions,deletions
gh pr diff <number>
```

Analyze changes for:
- **Security**: secrets, SQL injection, XSS, authentication gaps
- **Correctness**: null safety, error handling, edge cases
- **Performance**: N+1 queries, complexity, memory leaks
- **Maintainability**: readability, naming, DRY violations
- **Test coverage**: adequate tests for changes

Generate structured review:
- Critical issues (must fix)
- Major concerns (should address)
- Minor suggestions (nice to have)
- Positive observations (good practices)

Post review to GitHub (with permission).

### 4. After Review

Provide:
- Summary of findings
- Review status (Approve/Request Changes/Comment)
- Suggested next steps

## Usage

```
/pr-review         # Review PR for current branch
/pr-review 123     # Review specific PR number
/pr-review #456    # Review specific PR
```

## Review Categories

### Critical Issues
- Security vulnerabilities
- Data loss risks
- Authentication/authorization gaps
- Breaking changes

### Major Concerns
- Logic errors
- Missing error handling
- Performance problems
- Incomplete implementation

### Minor Suggestions
- Code style improvements
- Refactoring opportunities
- Documentation gaps
- Test coverage

### Positive Observations
- Clean code patterns
- Good error handling
- Comprehensive tests
- Clear documentation
