---
name: jira-ticket-start
description: Patterns for starting work on a Jira ticket - status transitions, branch creation, and work tracking.
---

# Jira Ticket Start Skill

This skill provides patterns for properly starting work on a Jira ticket, including status transitions, branch creation, and work logging.

## Starting Work Checklist

Before starting implementation:

- [ ] Ticket has clear acceptance criteria
- [ ] Priority and estimates are set
- [ ] Dependencies are identified and unblocked
- [ ] Design/specs are available (if needed)
- [ ] Questions are answered in comments
- [ ] Ticket is assigned to you

---

## Status Transitions

### Common Jira Workflows

**Simple Workflow**:
```
To Do → In Progress → Done
```

**Standard Workflow**:
```
To Do → In Progress → Code Review → QA → Done
```

**Agile Workflow**:
```
Backlog → Selected for Development → In Progress → In Review → Done
```

### Transition Best Practices

1. **Check available transitions** before attempting
2. **Add transition comment** explaining the change
3. **Verify transition succeeded** in response
4. **Update related tickets** if blocking/blocked

### API Transition Pattern
```javascript
// GET available transitions
// GET /rest/api/3/issue/{issueKey}/transitions

// Execute transition
// POST /rest/api/3/issue/{issueKey}/transitions
{
  "transition": {
    "id": "21"  // "In Progress" transition ID
  },
  "update": {
    "comment": [{
      "add": {
        "body": "Starting implementation"
      }
    }]
  }
}
```

---

## Branch Creation

### Branch Naming Convention

Format: `{type}/{ticket-key}-{brief-description}`

**Types**:
- `feature/` - New functionality
- `fix/` - Bug fixes
- `chore/` - Maintenance, refactoring
- `docs/` - Documentation
- `test/` - Test additions/fixes

**Examples**:
```
feature/PROJ-123-add-user-notifications
fix/PROJ-456-payment-timeout-error
chore/PROJ-789-upgrade-dependencies
```

### Branch Creation Steps

1. Ensure you're on the correct base branch:
   ```bash
   git checkout main  # or develop
   git pull origin main
   ```

2. Create and checkout new branch:
   ```bash
   git checkout -b feature/PROJ-123-add-notifications
   ```

3. Push branch to remote:
   ```bash
   git push -u origin feature/PROJ-123-add-notifications
   ```

### Sanitizing Ticket Summary for Branch Name

Rules:
- Lowercase everything
- Replace spaces with hyphens
- Remove special characters
- Keep under 50 characters
- Keep it meaningful

```
"Add Email Notifications for Orders!" → "add-email-notifications-for-orders"
"Fix: User can't login (SSO)" → "fix-user-cant-login-sso"
```

---

## Time Tracking

### Logging Work

If time tracking is enabled:

```javascript
// POST /rest/api/3/issue/{issueKey}/worklog
{
  "timeSpent": "2h 30m",
  "comment": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          { "type": "text", "text": "Initial implementation" }
        ]
      }
    ]
  }
}
```

### Time Formats
- `1w` = 1 week (5 days)
- `1d` = 1 day (8 hours)
- `1h` = 1 hour
- `1m` = 1 minute

### Updating Remaining Estimate

```javascript
// PUT /rest/api/3/issue/{issueKey}
{
  "update": {
    "timetracking": [{
      "set": {
        "remainingEstimate": "4h"
      }
    }]
  }
}
```

---

## Work Logging Best Practices

### Daily Updates
- Log work at end of each day
- Update remaining estimate
- Add blockers as comments

### Status Comments
When transitioning status, add context:
```
Starting implementation. Approach:
1. Add notification service in src/services/
2. Create email template
3. Hook into order status webhook
4. Add tests

ETA: 2 days
```

### Blocker Documentation
If blocked, update ticket:
```javascript
// Add blocker flag/label
// Add comment explaining blocker
// Link to blocking ticket
// Notify relevant people via @mention
```

---

## Integration with Development

### Commit Message Convention

Include ticket key in commits:
```
feat(PROJ-123): add email notification service

- Create NotificationService class
- Add email template for shipped orders
- Wire up to order status events
```

### PR Title Convention
```
[PROJ-123] Add email notifications for shipped orders
```

### Smart Commits (if enabled)

Jira can parse special commit syntax:
```
PROJ-123 #time 2h #comment Implemented notification service
PROJ-123 #done #time 30m Final testing and cleanup
```

---

## Quick Reference

### Starting Work
1. Assign ticket to yourself
2. Transition to "In Progress"
3. Create feature branch
4. Add "starting work" comment with approach

### During Work
1. Log time daily
2. Update remaining estimate
3. Comment on progress/blockers
4. Keep linked tickets updated

### Completing Work
1. Push final commits
2. Create PR with ticket reference
3. Transition to "Code Review" or appropriate status
4. Add PR link to ticket
