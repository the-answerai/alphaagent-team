---
name: push
description: Intelligent workflow orchestrator that commits, pushes, and creates/updates PRs automatically. Use when user wants to save their work or create a PR.
disable-model-invocation: true
---

# /push - Git Workflow Orchestrator

Handles the complete git workflow: commit → push → create/update PR.

## Workflow

### 1. Validate Current Branch (CRITICAL - do first)
```bash
git branch --show-current
```

- If on staging/main/production/master: **STOP and error** - cannot commit to protected branches
- If on feature branch: Continue

### 2. Handle Uncommitted Changes

Check for changes:
```bash
git status
```

If changes exist:
1. Review what files changed
2. Stage appropriate files (prefer specific files over `git add .`)
3. Create commit with conventional format:
   - `feat(scope): description` - new feature
   - `fix(scope): description` - bug fix
   - `chore(scope): description` - maintenance
   - `docs(scope): description` - documentation
   - `refactor(scope): description` - code restructure
   - `test(scope): description` - tests

Run pre-commit checks:
- No secrets/API keys in code
- No debug console.log statements
- No commented-out code blocks

### 3. Push to Remote
```bash
# Check for unpushed commits
git log origin/$(git branch --show-current)..HEAD

# Push (set upstream if new branch)
git push origin $(git branch --show-current)
# or for new branches:
git push -u origin $(git branch --show-current)
```

### 4. Handle Pull Request

Check if PR exists:
```bash
gh pr list --head $(git branch --show-current)
```

**If no PR exists**: Launch `git-pr-manager` agent to create PR
- Target staging/develop (not main/master)
- Generate description from commits
- Include summary and test instructions

**If PR exists**: Report that PR was updated with new commits

### 5. Provide Summary

Report:
- What was committed
- What was pushed
- PR status (created/updated)
- PR URL
- Next steps

## Usage

```
/push                    # Commit all changes with auto-generated message
/push "add auth feature" # Commit with specific message
```

## Important Rules

- **NEVER commit to protected branches** (staging, main, production, master)
- Always validate branch first
- Use conventional commit format
- Target staging/develop for PRs (not main)
- Don't stage sensitive files (.env, credentials)
