---
description: Start working on a Jira ticket with automated branch creation and context setup
argument-hint: <ticket-key>
---

# /jira-start - Start Working on Jira Ticket

Begin implementation on a specific Jira ticket.

## Usage

```
/jira-start <ticket-key>
/jira-start PROJ-123
/jira-start https://company.atlassian.net/browse/PROJ-123
```

## Workflow

1. **Fetch Ticket Details**
   - Get full ticket description and acceptance criteria
   - Check current status and assignee
   - Review linked issues and epic

2. **Branch Setup**
   - Create appropriately named branch: `feature/PROJ-123-short-description`
   - Ensure clean working state
   - Set up ticket reference in branch

3. **Context Gathering**
   - Explore codebase for relevant files
   - Identify existing patterns to follow
   - Note any technical constraints

4. **Implementation Planning**
   - Break down ticket into subtasks
   - Identify files to modify
   - Plan testing approach

## Notes

- Updates ticket status to "In Progress" automatically
- Creates branch from latest main/develop
- Will ask for clarification if ticket is ambiguous
