---
description: Start working on a Linear ticket with automated branch creation and context setup
argument-hint: <ticket-id-or-url>
---

# /ticket-start - Start Working on Linear Ticket

Begin implementation on a specific Linear ticket.

## Usage

```
/ticket-start <ticket-id>
/ticket-start LIN-123
/ticket-start https://linear.app/team/issue/LIN-123
```

## Workflow

1. **Fetch Ticket Details**
   - Get full ticket description and acceptance criteria
   - Check current status and assignee
   - Review linked tickets and dependencies

2. **Branch Setup**
   - Create appropriately named branch: `feature/LIN-123-short-description`
   - Ensure clean working state
   - Set up ticket reference in branch

3. **Context Gathering**
   - Explore codebase for relevant files
   - Identify existing patterns to follow
   - Note any technical constraints

4. **Implementation Planning**
   - Break down ticket into tasks
   - Identify files to modify
   - Plan testing approach

## Notes

- Updates ticket status to "In Progress" automatically
- Creates branch from latest main/develop
- Will ask for clarification if ticket is ambiguous
