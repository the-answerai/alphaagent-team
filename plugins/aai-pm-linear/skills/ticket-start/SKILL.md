---
name: ticket-start
description: Begin work on a Linear ticket with full context, codebase exploration, and implementation planning
---

# /ticket-start - Start Work on Linear Ticket

Begin work on a Linear ticket using the `linear-ticket-planner` agent.

## Usage

```
/ticket-start [ticket-id]
```

## Workflow

Launch the `linear-ticket-planner` agent with the ticket ID.

The agent will:
1. Fetch complete ticket details from Linear
2. Explore the codebase for relevant context
3. Create a detailed implementation plan
4. Create a properly named git branch
5. Update the Linear ticket status to "In Progress"

## Branch Naming

Branches are created with the format:
```
{type}/{ticket-id}-{sanitized-description}
```

Examples:
- `feature/PROJ-123-add-oauth-support`
- `fix/PROJ-456-null-pointer-error`
- `chore/PROJ-789-update-dependencies`

## After Completion

Provide:
- Branch name created
- Implementation plan summary
- Key files to work on
- Next steps
