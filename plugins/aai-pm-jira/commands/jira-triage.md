---
description: Triage and prioritize Jira tickets, identify duplicates, and organize the backlog
argument-hint: [filter or ticket-keys]
---

# /jira-triage - Triage Jira Tickets

Review, categorize, and prioritize Jira tickets.

## Usage

```
/jira-triage
/jira-triage backlog
/jira-triage PROJ-123 PROJ-124 PROJ-125
```

## Workflow

1. **Fetch Tickets**
   - Get tickets from specified filter or JQL query
   - Include ticket details and history

2. **Analyze Each Ticket**
   - Check for duplicates against existing tickets
   - Verify ticket completeness
   - Assess priority based on impact and urgency

3. **Recommend Actions**
   - Link duplicates
   - Add missing information
   - Adjust priorities
   - Suggest labels, components, and assignments

4. **Generate Report**
   - Summary of reviewed tickets
   - Actions taken
   - Recommendations for follow-up

## Options

- `backlog` - Review all backlog tickets
- `sprint` - Review current sprint tickets
- Specific ticket keys - Review only those tickets
