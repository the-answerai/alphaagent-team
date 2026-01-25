---
name: jira-status-sync
description: Patterns for keeping Jira ticket status synchronized with actual work progress.
---

# Jira Status Sync Skill

This skill provides patterns for keeping Jira tickets synchronized with actual development progress, ensuring accurate tracking and reporting.

## Why Status Sync Matters

- Accurate sprint burndowns
- Realistic progress visibility
- Better blockers identification
- Improved team coordination
- Reliable velocity metrics

---

## Status Update Triggers

### When to Update Status

| Event | Status Change | Comment |
|-------|--------------|---------|
| Assigned to you | → In Progress (or keep Open) | Note approach |
| Started coding | → In Progress | Brief plan |
| PR created | → Code Review | Link to PR |
| PR approved | → Ready for QA (if applicable) | Note reviewer |
| Tests passed | → Done | Summary of changes |
| Blocked | Keep current + add Blocker flag | Blocker details |
| Unblocked | Remove Blocker flag | Resolution note |

### When to Add Comments

- Starting work (approach/plan)
- Significant progress milestones
- Encountering blockers
- Scope changes or discoveries
- Questions needing answers
- PR ready for review
- Work completed

---

## Status Transitions

### Common Workflow

```
To Do ─────────────────────────────────────────────────────┐
   │                                                        │
   ▼                                                        │
In Progress ──► Code Review ──► QA ──► Done                │
   │                │           │                          │
   │ (blocked)      │           │                          │
   ▼                ▼           ▼                          │
Blocked ────────────────────────────────────────────────────┘
   (returns to previous status when unblocked)
```

### Transition Comments

**To In Progress**:
```
Starting implementation. Approach:
- [Key step 1]
- [Key step 2]

Estimated completion: [Date]
```

**To Code Review**:
```
PR ready for review: [PR Link]

Changes:
- [Summary of changes]

Testing done:
- [Tests written/run]
```

**To Done**:
```
Completed and merged. Changes:
- [Summary]

Tested by: [Who tested]
Deployed to: [Environment]
```

**To Blocked**:
```
⚠️ BLOCKED

Reason: [Clear explanation]
Blocked by: [PROJ-XXX] or [External dependency]
Impact: [What can't proceed]
Action needed: [What would unblock]
ETA to unblock: [If known]
```

---

## Jira API Patterns

### Get Available Transitions
```javascript
// GET /rest/api/3/issue/{issueKey}/transitions
// Response includes available transitions with IDs
```

### Execute Transition
```javascript
// POST /rest/api/3/issue/{issueKey}/transitions
{
  "transition": {
    "id": "21"  // Get ID from available transitions
  },
  "update": {
    "comment": [{
      "add": {
        "body": {
          "type": "doc",
          "version": 1,
          "content": [{
            "type": "paragraph",
            "content": [{
              "type": "text",
              "text": "Starting implementation"
            }]
          }]
        }
      }
    }]
  }
}
```

### Add Comment Only
```javascript
// POST /rest/api/3/issue/{issueKey}/comment
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [{
      "type": "paragraph",
      "content": [{
        "type": "text",
        "text": "Progress update: Completed API endpoint"
      }]
    }]
  }
}
```

### Update Fields
```javascript
// PUT /rest/api/3/issue/{issueKey}
{
  "fields": {
    "assignee": { "id": "user-id" },
    "labels": ["in-progress", "backend"]
  }
}
```

---

## Blocker Management

### Adding Blocker Flag
1. Add "blocked" label
2. Set Flagged = true (if available)
3. Add blocker comment with details
4. Link to blocking ticket
5. Notify relevant parties

### Blocker Comment Template
```
⚠️ BLOCKED

*Reason*: Waiting for design approval on new notification UI

*Blocked by*: [PROJ-456|PROJ-456] (Design: Notification Templates)

*Impact*: Cannot implement email templates without approved designs

*Action needed*: Design team to complete and approve PROJ-456

*ETA*: Expected by Friday based on design team's sprint

@designer - Please prioritize when possible
```

### Removing Blocker
1. Remove "blocked" label
2. Set Flagged = false
3. Add resolution comment
4. Update status if was paused

```
✅ UNBLOCKED

*Resolution*: Design approved in PROJ-456

*Next steps*: Resuming implementation, will complete by EOD tomorrow
```

---

## Progress Updates

### Daily Update Pattern

For tickets in progress > 1 day:
```
📊 Progress Update - [Date]

*Completed*:
- [What was done]

*In Progress*:
- [What you're working on]

*Next*:
- [What's planned next]

*Blockers*: None / [Description]

*ETA*: On track for [Date]
```

### Sprint Progress Pattern

For sprint reviews:
```
📋 Sprint Progress - PROJ-123

*Status*: 70% complete

*Completed*:
- ✅ Backend API endpoint
- ✅ Database migrations
- ✅ Unit tests

*Remaining*:
- ⏳ Frontend integration (in progress)
- 🔜 E2E tests
- 🔜 Documentation

*Risk*: Low - On track for completion this sprint
```

---

## Automation Opportunities

### Auto-Transition Triggers

| Trigger | Action |
|---------|--------|
| PR opened | → Code Review |
| PR merged | → Done (or QA) |
| Branch created | → In Progress |
| Build failed | Add "build-failed" label |
| Deploy to staging | Add "on-staging" label |

### Smart Commits (if enabled)

```bash
# In commit message:
PROJ-123 #time 2h #comment Implemented notification service

# Transitions:
PROJ-123 #in-progress Starting work
PROJ-123 #done Completed implementation

# Multiple actions:
PROJ-123 #time 1h 30m #comment Added tests #done
```

---

## Status Hygiene

### Daily Checks
- Update any ticket you actively worked on
- Note blockers immediately
- Keep comments current

### Weekly Checks
- Review all assigned "In Progress" tickets
- Update stale tickets
- Close completed work

### Sprint Checks
- Verify all sprint items have accurate status
- Update estimates if scope changed
- Document carry-over reasons

---

## Common Sync Issues

### Problem: Forgot to Update
**Solution**: Add retroactive comment with dates
```
Retroactive update:
- Started: [Date]
- Completed: [Date]
- Forgot to update status during work
```

### Problem: Status Out of Sync with Reality
**Solution**: Audit and correct
```
Status correction:
- Old status: In Progress
- New status: Done
- Reason: Work completed [Date], status update missed
```

### Problem: Multiple People Working
**Solution**: Clear ownership in comments
```
@developer1 working on backend
@developer2 working on frontend

Updates:
- Backend: Complete
- Frontend: In progress, ETA tomorrow
```

---

## Quick Reference

### Status Meanings

| Status | Means |
|--------|-------|
| To Do | Not started, in backlog |
| In Progress | Actively being worked |
| Code Review | PR open, awaiting review |
| QA | Ready for testing |
| Done | Completed and verified |
| Blocked | Cannot proceed |

### Comment Types

| Situation | Comment |
|-----------|---------|
| Starting | Brief plan/approach |
| Progress | What's done/remaining |
| Blocked | Details + action needed |
| Completed | Summary + verification |
| Questions | Clear question + context |
