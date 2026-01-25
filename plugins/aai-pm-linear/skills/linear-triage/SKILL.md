---
name: linear-triage
description: Triage Linear tickets to find duplicates, check if issues are fixed, and clean up stale tickets
---

# /linear-triage - Triage Linear Tickets

Triage open Linear tickets to find duplicates, check if issues are fixed, and clean up stale tickets.

## Usage

```
/linear-triage [ticket-id]     # Triage a specific ticket
/linear-triage --batch 5       # Triage 5 tickets in parallel
```

## Single Ticket Mode

```
/linear-triage PROJ-123
```

Launches `linear-ticket-triager` agent to analyze the specified ticket.

## Batch Mode

```
/linear-triage --batch 5
```

Fetches open tickets and launches multiple `linear-ticket-triager` agents in parallel.

## What Happens

For each ticket, the agent will:

1. **Fetch ticket details** from Linear
2. **Search for duplicates** using keywords
3. **Check codebase** for fixes
4. **Classify** the ticket:
   - CLOSE_DUPLICATE - Same issue exists elsewhere
   - CLOSE_FIXED - Issue has been resolved
   - CLOSE_OUTDATED - No longer relevant
   - KEEP_OPEN - Valid issue
   - NEEDS_CLARIFICATION - Needs more info
5. **Take action** (close or keep)
6. **Report results**

## Safety Features

- Agents only modify the ticket they're triaging
- Cannot create new tickets
- Cannot delete tickets
- All actions logged with comments

## Output

Each triage produces:
```
---
TRIAGE COMPLETE
Ticket: PROJ-123
Title: {title}
Age: {X} months
Action: {action}
Result: {result}
Details: {summary}
---
```

## Parallel Execution

When triaging multiple tickets, spawn separate agents:

```python
for ticket_id in ticket_ids:
    Task(
        subagent_type="linear-ticket-triager",
        prompt=f"Triage Linear ticket {ticket_id}",
        run_in_background=True
    )
```
