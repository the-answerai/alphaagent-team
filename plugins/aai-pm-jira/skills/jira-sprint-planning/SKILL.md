---
name: jira-sprint-planning
description: Patterns for sprint planning with Jira - capacity planning, ticket selection, and sprint organization.
---

# Jira Sprint Planning Skill

This skill provides patterns for effective sprint planning using Jira, including capacity planning, ticket prioritization, and sprint organization.

## Sprint Planning Process

### Pre-Planning (Before Meeting)

1. **Backlog Grooming**
   - Ensure tickets are refined and estimated
   - Clear acceptance criteria on all candidates
   - Dependencies identified
   - Tech debt and bug tickets included

2. **Capacity Calculation**
   ```
   Team Velocity: [average points completed per sprint]
   Available Days: [total team days - PTO - meetings]
   Capacity: ~80% of velocity (buffer for unknowns)
   ```

3. **Priority Review**
   - Product priorities aligned
   - Critical bugs identified
   - Tech debt allocation (typically 10-20%)

### During Planning

1. **Review Sprint Goal**
   - Define 1-2 key objectives
   - Align with roadmap/OKRs
   - Communicate to stakeholders

2. **Select Tickets**
   - Start with highest priority
   - Check dependencies
   - Balance feature/bug/tech-debt
   - Don't exceed capacity

3. **Validate Commitments**
   - Team agrees on selection
   - Dependencies confirmed
   - Risks identified
   - Sprint goal achievable

---

## Jira Sprint Operations

### Creating a Sprint

```javascript
// POST /rest/agile/1.0/sprint
{
  "name": "Sprint 42",
  "startDate": "2024-01-15T09:00:00.000Z",
  "endDate": "2024-01-29T17:00:00.000Z",
  "originBoardId": 123,
  "goal": "Complete user notification system"
}
```

### Moving Tickets to Sprint

```javascript
// POST /rest/agile/1.0/sprint/{sprintId}/issue
{
  "issues": ["PROJ-123", "PROJ-124", "PROJ-125"]
}
```

### Sprint Queries (JQL)

```
# Current sprint tickets
sprint in openSprints() AND project = PROJ

# Sprint backlog
sprint = "Sprint 42" AND project = PROJ ORDER BY rank

# Unassigned in sprint
sprint in openSprints() AND assignee IS EMPTY

# Blocked tickets
sprint in openSprints() AND labels = blocked

# Carry-over candidates
sprint in closedSprints() AND status != Done AND
  updatedDate > startOfWeek(-1)
```

---

## Capacity Planning

### Team Capacity Template

| Team Member | Days Available | Focus Areas | Notes |
|-------------|----------------|-------------|-------|
| Developer 1 | 10 | Backend, API | |
| Developer 2 | 8 | Frontend | PTO: 2 days |
| Developer 3 | 10 | Full-stack | |
| **Total** | **28 days** | | |

### Point Capacity Calculation

```
Historical Velocity: 40 points/sprint (average of last 3)
Team Availability: 90% this sprint
Adjusted Capacity: 36 points

Allocation:
- Features: 25 points (70%)
- Bugs: 7 points (20%)
- Tech Debt: 4 points (10%)
```

### Sprint Loading Guidelines

| Load Level | Description | Risk |
|------------|-------------|------|
| < 70% | Under-committed | Low, may add mid-sprint |
| 70-85% | Optimal | Low |
| 85-95% | Full | Medium |
| > 95% | Over-committed | High, likely carry-over |

---

## Ticket Selection Criteria

### Must Include
- [ ] P1 bugs (production issues)
- [ ] Committed dependencies for other teams
- [ ] Regulatory/compliance deadlines
- [ ] Items blocking other work

### Should Include
- [ ] Highest priority features
- [ ] Tech debt with clear ROI
- [ ] P2 bugs affecting users
- [ ] Sprint goal supporting items

### Consider Including
- [ ] Quick wins (low effort, high value)
- [ ] Research spikes for future work
- [ ] Documentation updates
- [ ] Developer experience improvements

### Avoid Including
- [ ] Poorly defined tickets
- [ ] Items with unresolved dependencies
- [ ] "Stretch goals" beyond capacity
- [ ] Tickets requiring unavailable team members

---

## Sprint Goal Framework

### Good Sprint Goals
- Specific and measurable
- Achievable within sprint
- Aligned with product objectives
- Valuable to users/business

**Examples**:
- "Launch beta of notification system to 10% of users"
- "Reduce checkout error rate from 5% to 1%"
- "Complete API migration for mobile team"

### Bad Sprint Goals
- "Work on notifications" (too vague)
- "Fix bugs" (not specific)
- "Finish everything" (not realistic)

---

## Sprint Board Setup

### Columns (Example)
```
To Do | In Progress | Code Review | QA | Done
```

### Swimlanes
- By assignee
- By epic
- By priority (expedite lane for urgent)

### WIP Limits
| Column | Limit | Reason |
|--------|-------|--------|
| In Progress | 2 per person | Focus |
| Code Review | 5 | Keep reviews flowing |
| QA | 3 | Prevent bottleneck |

---

## Sprint Ceremonies

### Sprint Planning (2-4 hours)
- Review sprint goal
- Select and commit to tickets
- Identify dependencies and risks
- Assign initial owners

### Daily Standup (15 min)
- Progress since yesterday
- Plan for today
- Blockers

### Sprint Review (1-2 hours)
- Demo completed work
- Stakeholder feedback
- Acceptance of stories

### Sprint Retrospective (1-1.5 hours)
- What went well
- What to improve
- Action items for next sprint

---

## Mid-Sprint Adjustments

### Adding Work
Criteria for adding:
- Critical bug in production
- Blocking another team
- Takes less time than available slack
- Team agrees to adjustment

Process:
1. Discuss in standup
2. Evaluate capacity impact
3. Consider removing equal-sized item
4. Document reason for addition

### Removing Work
Criteria for removal:
- Blocked and won't unblock this sprint
- Scope grew significantly
- Higher priority item needs space
- Team member unexpectedly unavailable

Process:
1. Communicate early
2. Move to backlog (not delete)
3. Document reason
4. Adjust sprint goal if needed

---

## Sprint Metrics

### Key Metrics to Track
- **Velocity**: Points completed per sprint
- **Planned vs Completed**: Commitment accuracy
- **Carry-over**: Items not finished
- **Scope Change**: Items added/removed mid-sprint
- **Bug Ratio**: Bugs vs features completed

### Health Indicators

| Metric | Healthy | Warning | Action Needed |
|--------|---------|---------|---------------|
| Completion | > 85% | 70-85% | < 70% |
| Carry-over | < 10% | 10-20% | > 20% |
| Scope Change | < 15% | 15-25% | > 25% |
| Blocked Time | < 10% | 10-20% | > 20% |
