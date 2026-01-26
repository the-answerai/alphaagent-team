---
description: Triage and prioritize GitHub issues, identify duplicates, and organize the backlog
argument-hint: [filter or issue-numbers]
---

# /issue-triage - Triage GitHub Issues

Review, categorize, and prioritize GitHub issues.

## Usage

```
/issue-triage
/issue-triage backlog
/issue-triage 123 124 125
```

## Workflow

1. **Fetch Issues**
   - Get issues from specified filter or numbers
   - Include issue details and comments

2. **Analyze Each Issue**
   - Check for duplicates against existing issues
   - Verify issue completeness
   - Assess priority based on impact and urgency

3. **Recommend Actions**
   - Close/reference duplicates
   - Add missing information
   - Suggest labels and milestones
   - Recommend assignments

4. **Generate Report**
   - Summary of reviewed issues
   - Actions taken
   - Recommendations for follow-up

## Options

- `backlog` - Review all open issues without milestones
- `unlabeled` - Review issues without labels
- Specific issue numbers - Review only those issues
