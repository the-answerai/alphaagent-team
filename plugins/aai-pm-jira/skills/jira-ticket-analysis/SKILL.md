---
name: jira-ticket-analysis
description: Patterns for analyzing Jira ticket quality and identifying improvement opportunities.
---

# Jira Ticket Analysis Skill

This skill provides methodology for analyzing Jira ticket quality and identifying areas for improvement.

## Quality Dimensions

### 1. Clarity
**Questions to assess**:
- Is the goal obvious from the summary?
- Is the description free of jargon?
- Would a new team member understand this?
- Are acronyms explained?

**Scoring**:
- 5: Crystal clear, no questions needed
- 4: Clear with minor ambiguity
- 3: Understandable but needs context
- 2: Confusing, multiple interpretations
- 1: Cannot understand the request

### 2. Completeness
**Questions to assess**:
- Are acceptance criteria defined?
- Is the scope clear (what's in/out)?
- Are dependencies listed?
- Is technical context provided?

**Scoring**:
- 5: All information present, ready to implement
- 4: Minor details missing
- 3: Key information missing but discoverable
- 2: Significant gaps
- 1: Missing most required information

### 3. Actionability
**Questions to assess**:
- Can work start immediately?
- Are blockers identified and addressed?
- Is the scope achievable?
- Are success criteria measurable?

**Scoring**:
- 5: Can start now with confidence
- 4: One small clarification needed
- 3: Some research/clarification needed
- 2: Blocked or unclear how to proceed
- 1: Cannot start without major discovery

### 4. Context
**Questions to assess**:
- Is the "why" explained?
- Is user impact described?
- Are related tickets linked?
- Is there technical background?

**Scoring**:
- 5: Full context, understand importance
- 4: Good context, minor gaps
- 3: Basic context provided
- 2: Little context, unclear importance
- 1: No context, don't know why this matters

---

## Analysis Process

### Step 1: Initial Read
- Read summary and description
- Note first impressions
- Identify obvious issues

### Step 2: Score Dimensions
Rate each dimension 1-5 and note specific issues:

```markdown
| Dimension | Score | Issues |
|-----------|-------|--------|
| Clarity | 3 | Acronyms undefined, vague scope |
| Completeness | 2 | No acceptance criteria |
| Actionability | 2 | Blocked by design |
| Context | 4 | Good background |
| **Overall** | **2.75** | Needs refinement |
```

### Step 3: Identify Improvements
For each issue, provide:
- What's wrong
- How to fix it
- Example improved text

### Step 4: Provide Recommendations
Prioritize fixes by impact:
1. Critical (blocks understanding)
2. Important (delays work)
3. Nice-to-have (polish)

---

## Common Issues and Fixes

### Issue: Vague Summary

**Before**: "Fix the thing"
**After**: "Fix payment processing timeout for orders over $1000"

**Pattern**: `[Action] [specific thing] [condition/context]`

### Issue: Missing Acceptance Criteria

**Before**:
```
Make the page faster
```

**After**:
```
h2. Acceptance Criteria
* Page load time < 2 seconds on 3G connection
* Lighthouse performance score > 80
* No layout shift during load
* Images lazy-loaded below fold
```

### Issue: No Context/Why

**Before**:
```
Add retry logic to API calls
```

**After**:
```
h2. Context
Users are experiencing intermittent failures when the payment service is slow to respond. This causes checkout abandonment and support tickets.

h2. Problem
When the payment API times out (typically 2-3 times per day during peak hours), the user sees an error with no recovery path.

h2. Solution
Add retry logic with exponential backoff to handle transient failures gracefully.
```

### Issue: Code-Heavy Description

**Before**:
```
Change this:
function processOrder(order) {
  // 50 lines of code
}

To this:
function processOrder(order) {
  // 50 different lines of code
}
```

**After**:
```
h2. Change Required
Modify {{src/services/orderProcessor.ts}} to validate order totals before processing.

h2. Technical Notes
* Add validation in processOrder function
* Throw OrderValidationError for invalid totals
* Log validation failures for monitoring
```

### Issue: Scope Creep

**Before**:
```
Add user notifications. Also we should probably redo the entire notification system and add email preferences and maybe webhooks too.
```

**After**:
```
h2. Scope
Add email notification when order ships.

h2. Out of Scope (Future Tickets)
* Notification preferences UI
* Webhook integrations
* Push notifications
```

---

## Analysis Report Template

```markdown
## Ticket Quality Analysis: PROJ-123

### Summary
[Brief description of the ticket]

### Quality Scores

| Dimension | Score | Status |
|-----------|-------|--------|
| Clarity | X/5 | [Good/Needs Work/Poor] |
| Completeness | X/5 | [Good/Needs Work/Poor] |
| Actionability | X/5 | [Good/Needs Work/Poor] |
| Context | X/5 | [Good/Needs Work/Poor] |
| **Overall** | **X/5** | |

### Issues Found

#### Critical Issues
1. [Issue description]
   - Impact: [Why this matters]
   - Fix: [How to resolve]

#### Important Issues
1. [Issue description]
   - Impact: [Why this matters]
   - Fix: [How to resolve]

#### Minor Issues
1. [Issue description]

### Recommended Improvements

1. **[Most Important Fix]**
   Current: [What it says now]
   Improved: [What it should say]

2. **[Second Fix]**
   [Details]

### Readiness Assessment
- [ ] Ready for sprint planning
- [x] Needs refinement first
- [ ] Needs product clarification
- [ ] Needs technical discovery
```

---

## Batch Analysis Patterns

### Finding Low-Quality Tickets

```
# Missing description
project = PROJ AND description IS EMPTY

# Short descriptions (< 100 chars approximation)
project = PROJ AND description ~ "[a-zA-Z]" AND NOT description ~ "*\\n*"

# No acceptance criteria pattern
project = PROJ AND description !~ "acceptance" AND description !~ "criteria" AND type = Story

# Old unrefined tickets
project = PROJ AND status = "To Do" AND created <= -60d AND labels NOT IN ("refined", "ready")
```

### Quality Dashboard Metrics

Track over time:
- % tickets with acceptance criteria
- Average quality score
- Tickets needing refinement
- Time from creation to ready status

---

## Integration with Refinement

### Pre-Refinement Analysis
1. Run batch analysis on sprint candidates
2. Generate quality report
3. Prioritize tickets needing work
4. Estimate refinement effort

### During Refinement
1. Review analysis findings
2. Discuss improvements with team
3. Update tickets in real-time
4. Re-score after improvements

### Post-Refinement Verification
1. Verify all critical issues addressed
2. Confirm acceptance criteria added
3. Check technical context included
4. Mark tickets as "refined"
