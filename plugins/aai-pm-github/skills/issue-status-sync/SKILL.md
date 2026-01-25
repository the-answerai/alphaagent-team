---
name: issue-status-sync
description: Patterns for keeping GitHub issue status synchronized with development progress.
---

# GitHub Issue Status Sync Skill

This skill provides patterns for keeping GitHub issues synchronized with actual development progress.

## GitHub Issue Status Model

Unlike Jira, GitHub issues have simple states:
- **Open**: Active, needs work
- **Closed**: Complete or won't fix

Status is conveyed through:
- Labels (in progress, blocked, etc.)
- Milestones
- Project board columns
- Comments

---

## Status Labels

### Recommended Label Set

**Workflow:**
- `needs-triage` - Needs initial review
- `needs-info` - Waiting for reporter
- `in progress` - Being worked on
- `blocked` - Cannot proceed
- `ready for review` - PR ready
- `ready for merge` - Approved, waiting merge

**Type:**
- `bug`
- `enhancement`
- `documentation`
- `chore`

**Priority:**
- `priority: critical`
- `priority: high`
- `priority: medium`
- `priority: low`

### Status Transitions via Labels

```bash
# Starting work
gh issue edit {number} --add-label "in progress" --remove-label "needs-triage"

# Blocked
gh issue edit {number} --add-label "blocked"

# Ready for review
gh issue edit {number} --add-label "ready for review" --remove-label "in progress"

# Complete
gh issue close {number} --comment "Completed in PR #456"
```

---

## Progress Updates

### Starting Work

```bash
gh issue edit {number} --add-assignee @me --add-label "in progress"
gh issue comment {number} --body "$(cat <<'EOF'
Starting work on this issue.

**Approach:**
- [Brief description]

**Branch:** `feature/{number}-description`

**ETA:** [Rough estimate]
EOF
)"
```

### Progress Update

```bash
gh issue comment {number} --body "$(cat <<'EOF'
**Progress Update**

**Completed:**
- [What's done]

**In Progress:**
- [Current work]

**Next:**
- [What's planned]

**Blockers:** None / [Description]
EOF
)"
```

### Blocked

```bash
gh issue edit {number} --add-label "blocked"
gh issue comment {number} --body "$(cat <<'EOF'
**Blocked**

**Reason:** [Clear explanation]
**Blocked by:** #123 / [External factor]
**Action needed:** [What would unblock]
**Impact:** [What can't proceed]
EOF
)"
```

### Unblocked

```bash
gh issue edit {number} --remove-label "blocked"
gh issue comment {number} --body "$(cat <<'EOF'
**Unblocked**

**Resolution:** [How it was resolved]
**Next steps:** [Resuming work]
EOF
)"
```

### Completing Work

```bash
gh issue comment {number} --body "$(cat <<'EOF'
**Completed**

**PR:** #456
**Changes:**
- [Summary of changes]

**Testing:**
- [How it was tested]

Ready for review.
EOF
)"
gh issue edit {number} --add-label "ready for review" --remove-label "in progress"
```

---

## Linking PRs to Issues

### In PR Description

```markdown
Fixes #123

or

Closes #123

or

Resolves #123
```

This auto-closes the issue when PR merges.

### For Related (Not Closing)

```markdown
Related to #123
Part of #123
See #123
```

### In Commit Messages

```bash
git commit -m "feat(auth): add password reset (#123)"
```

---

## Project Board Integration

If using GitHub Projects:

### Move Card
```bash
# List project columns
gh api repos/{owner}/{repo}/projects/{project_id}/columns

# Move issue card
gh api projects/columns/cards/{card_id}/moves \
  -f position=top \
  -f column_id={column_id}
```

### Automated Moves

Configure in project settings:
- New issues → "To Do"
- Issues with "in progress" label → "In Progress"
- Closed issues → "Done"

---

## Milestone Tracking

### Assign to Milestone
```bash
gh issue edit {number} --milestone "v1.0"
```

### Check Milestone Progress
```bash
gh issue list --milestone "v1.0" --json number,title,state
```

---

## Automation Opportunities

### Using GitHub Actions

```yaml
# .github/workflows/issue-management.yml
name: Issue Management

on:
  issues:
    types: [opened, closed]
  pull_request:
    types: [opened, merged]

jobs:
  manage:
    runs-on: ubuntu-latest
    steps:
      - name: Add triage label to new issues
        if: github.event_name == 'issues' && github.event.action == 'opened'
        run: gh issue edit ${{ github.event.issue.number }} --add-label "needs-triage"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Status Check Commands

### My In-Progress Issues
```bash
gh issue list --assignee @me --label "in progress"
```

### Blocked Issues
```bash
gh issue list --label "blocked"
```

### Issues Without Assignee
```bash
gh issue list --state open --search "no:assignee"
```

### Stale Issues
```bash
gh issue list --state open --search "updated:<2024-01-01"
```

---

## Best Practices

### Do:
- Update status promptly
- Add context with changes
- Link related issues and PRs
- Use consistent labels
- Close with resolution summary

### Don't:
- Leave issues "in progress" when blocked
- Forget to assign yourself
- Close without explanation
- Mix up similar issues
- Ignore stale issues

---

## Quick Reference

| Event | Label Changes | Comment |
|-------|---------------|---------|
| Starting | +in progress, -needs-triage | Approach + branch |
| Blocked | +blocked | Reason + action needed |
| Unblocked | -blocked | Resolution |
| PR Ready | +ready for review, -in progress | PR link |
| Complete | Close issue | Summary of changes |
