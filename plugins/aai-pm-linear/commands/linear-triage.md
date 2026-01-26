---
description: Triage and prioritize Linear tickets, identify duplicates, and organize the backlog
argument-hint: [filter or ticket-ids]
---

# /linear-triage - Triage Linear Tickets

Review, categorize, and prioritize Linear tickets.

## Usage

```
/linear-triage
/linear-triage backlog
/linear-triage LIN-123 LIN-124 LIN-125
```

## Workflow

1. **Fetch Tickets**
   - Get tickets from specified view or IDs
   - Include ticket details and history

2. **Analyze Each Ticket**
   - Check for duplicates against existing tickets
   - Verify ticket completeness
   - Assess priority based on impact and urgency

3. **Recommend Actions**
   - Merge duplicates
   - Add missing information
   - Adjust priorities
   - Suggest labels and assignments

4. **Generate Report**
   - Summary of reviewed tickets
   - Actions taken
   - Recommendations for follow-up

## Options

- `backlog` - Review all backlog tickets
- `inbox` - Review new/unsorted tickets
- Specific ticket IDs - Review only those tickets
