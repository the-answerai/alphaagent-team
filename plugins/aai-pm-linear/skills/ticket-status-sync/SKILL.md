---
name: ticket-status-sync
description: Synchronizes Linear ticket status with git workflow events. Reference skill for agents.
user-invocable: false
---

# Ticket Status Sync Skill

Synchronizes Linear ticket status with git workflow events, keeping tickets up-to-date with development progress.

## Purpose

Automatically update Linear tickets when:
- Branch is created -> "In Progress"
- PR is created -> "In Review"
- PR is merged -> "Done"
- PR is closed without merge -> Back to "Todo"

**Important:** Always ask user permission before updating Linear.

## Status Mapping

```
Git Event          -> Linear Status
-----------------------------------------
Branch created     -> In Progress
PR created         -> In Review
PR merged          -> Done
PR closed (no merge) -> Todo
PR draft           -> In Progress
```

## Workflow

### 1. Detect Git Event

**Branch Creation:**
```bash
# After creating branch
# Example: feature/PROJ-123-add-oauth-support
```

**PR Creation:**
```bash
gh pr view [number] --json number,state,isDraft,headRefName
```

**PR Status Change:**
```bash
gh pr view [number] --json state,merged,mergedAt,closedAt
```

### 2. Extract Ticket ID

**From branch name:**
```bash
git branch --show-current
# Pattern: {type}/{ticket-id}-{description}
# Extract: PROJ-123
```

**From PR:**
```bash
gh pr view [number] --json headRefName
```

### 3. Verify Ticket Exists

```bash
mcp__linear__get_issue --id PROJ-123
```

If ticket not found:
```
Warning: Ticket PROJ-123 not found in Linear.
Skip status update? (yes/no)
```

### 4. Ask User Permission

**Format:**
```
Linear Ticket Update

Ticket: PROJ-123 - Add OAuth2 support
Current Status: In Progress
Proposed Status: In Review

Reason: PR #456 created

Update ticket? (yes/no/never)
```

### 5. Update Ticket Status

```bash
mcp__linear__update_issue \
  --id PROJ-123 \
  --state "In Review"
```

### 6. Add Comment to Ticket

**Branch created:**
```
Started work in branch: `feature/PROJ-123-add-oauth-support`
Base: main
```

**PR created:**
```
Pull request created: [#456](PR_URL)
Branch: `feature/PROJ-123-add-oauth-support`
Target: main
```

**PR merged:**
```
Pull request merged: [#456](PR_URL)
Merged to: main
```

### 7. Confirm Success

```
Linear ticket updated

Ticket: PROJ-123
Status: Todo -> In Review
Comment: Added PR link #456
URL: https://linear.app/team/issue/PROJ-123
```

## Error Handling

**Linear API error:**
```
Error: Failed to update Linear ticket
Details: {error}

Actions:
  [1] Retry
  [2] Skip for now
  [3] Update manually: {ticket_url}
```

**Invalid state transition:**
```
Error: Cannot transition from "Done" to "In Progress"

Skip update? (yes/no)
```

## Integration

This skill is invoked by:
- `/ticket-start` - When creating branch
- `/push` - When creating PR
- Merge hooks (if configured)

Used by agents:
- `linear-ticket-planner` - Updates status when starting work
- `git-pr-manager` - Updates status when creating PR

## Safe Defaults

- Branch created: Always ask
- PR created: Auto-update (common operation)
- PR merged: Auto-update
- PR closed: Always ask (reason needed)

## Special Cases

**Multiple PRs for one ticket:**
```
Notice: Multiple PRs found for PROJ-123

PRs:
  - #456 (open, in review)
  - #789 (merged)

Which PR triggered this update?
```

**Ticket already Done:**
```
Notice: Ticket PROJ-123 is already marked Done

Actions:
  [1] Keep ticket as Done
  [2] Reopen ticket (-> In Progress)
  [3] Create new follow-up ticket
```

**Draft PR:**
```
Notice: PR #456 is in draft mode

Status: In Progress (not In Review)

Mark as In Review when PR is ready:
  gh pr ready
```

## Quality Checks

Before updating ticket:
- [ ] Ticket ID is valid
- [ ] Ticket exists in Linear
- [ ] User has permission to update
- [ ] Status transition is valid
- [ ] User confirmed update
- [ ] Comment added with context
