---
description: Start working on a GitHub issue with automated branch creation and context setup
argument-hint: <issue-number>
---

# /issue-start - Start Working on GitHub Issue

Begin implementation on a specific GitHub issue.

## Usage

```
/issue-start <issue-number>
/issue-start 123
/issue-start #123
/issue-start https://github.com/owner/repo/issues/123
```

## Workflow

1. **Fetch Issue Details**
   - Get full issue description and comments
   - Check current status and assignees
   - Review linked issues and milestones

2. **Branch Setup**
   - Create appropriately named branch: `feature/123-short-description`
   - Ensure clean working state
   - Set up issue reference in branch

3. **Context Gathering**
   - Explore codebase for relevant files
   - Identify existing patterns to follow
   - Note any technical constraints

4. **Implementation Planning**
   - Break down issue into tasks
   - Identify files to modify
   - Plan testing approach

## Notes

- Assigns issue to you automatically
- Creates branch from latest main/develop
- Will ask for clarification if issue is ambiguous
