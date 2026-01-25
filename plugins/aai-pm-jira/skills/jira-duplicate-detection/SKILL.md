---
name: jira-duplicate-detection
description: Patterns for detecting duplicate Jira tickets before creating new ones and handling existing duplicates.
---

# Jira Duplicate Detection Skill

This skill provides patterns for detecting and handling duplicate tickets in Jira to maintain a clean backlog.

## Why Duplicate Detection Matters

- Prevents wasted effort on already-reported issues
- Consolidates discussion and context
- Improves reporting accuracy
- Reduces backlog clutter
- Ensures fixes address all related reports

---

## Detection Process

### Step 1: Extract Key Terms

From the potential new ticket, identify:
- Core functionality/feature area
- Error messages or codes
- Affected components
- User actions/scenarios

### Step 2: Build Search Queries

Create multiple JQL queries with different approaches:

**Exact phrase search**:
```
project = PROJ AND text ~ "exact error message"
```

**Keyword combination**:
```
project = PROJ AND text ~ "payment" AND text ~ "timeout"
```

**Component-based**:
```
project = PROJ AND component = Checkout AND text ~ "error"
```

**Reporter-based** (same person might report twice):
```
project = PROJ AND reporter = currentUser() AND created >= -30d
```

### Step 3: Review Results

For each potential match:
- Compare descriptions in detail
- Check acceptance criteria overlap
- Review comments for additional context
- Consider different descriptions of same issue

### Step 4: Present Findings

```markdown
## Potential Duplicates Found

### High Confidence (likely same issue)
| Key | Summary | Created | Status | Similarity |
|-----|---------|---------|--------|------------|
| PROJ-123 | Payment timeout on large orders | 2024-01-10 | Open | 90% |

### Medium Confidence (possibly related)
| Key | Summary | Created | Status | Similarity |
|-----|---------|---------|--------|------------|
| PROJ-456 | Checkout errors intermittently | 2024-01-05 | In Progress | 60% |

### Recommendation
PROJ-123 appears to describe the same issue. Recommend:
1. Add any new context to PROJ-123 as a comment
2. Link your report as a duplicate
3. Watch PROJ-123 for updates
```

---

## Search Strategies

### Strategy 1: Error Message Search

Best for bugs with specific error text:

```
project = PROJ AND
text ~ "TypeError: Cannot read property" AND
created >= -90d
ORDER BY created DESC
```

### Strategy 2: Feature Area Search

Best for feature requests:

```
project = PROJ AND
text ~ "notification" AND text ~ "email" AND
type in (Story, Task, Improvement)
ORDER BY created DESC
```

### Strategy 3: Component + Keyword

Best when you know the affected area:

```
project = PROJ AND
component = "User Management" AND
text ~ "password reset"
ORDER BY created DESC
```

### Strategy 4: Synonym Search

Search for alternative descriptions:

```
# If searching for "slow performance"
project = PROJ AND (
  text ~ "slow" OR
  text ~ "performance" OR
  text ~ "latency" OR
  text ~ "timeout" OR
  text ~ "hang"
)
```

### Strategy 5: Recent + Same Area

Best for ongoing issues:

```
project = PROJ AND
labels in (checkout, payment) AND
created >= -14d
ORDER BY created DESC
```

---

## Similarity Assessment

### High Confidence (80-100%)
Indicators:
- Same error message/code
- Same steps to reproduce
- Same component and behavior
- Different wording, same issue

**Action**: Recommend closing as duplicate

### Medium Confidence (50-79%)
Indicators:
- Related symptoms
- Same area, different specifics
- Could be same root cause
- Needs investigation to confirm

**Action**: Recommend linking as "relates to"

### Low Confidence (< 50%)
Indicators:
- Same component but different issue
- Superficially similar only
- Different user flows

**Action**: Note similarity, proceed with new ticket

---

## Handling Duplicates

### When You Find a Duplicate

1. **Don't create new ticket**
2. **Add context to existing ticket**:
   ```
   Additional report from [reporter]:

   [New context, steps, or information not in original]

   Confirming this is still an issue as of [date].
   ```
3. **Update existing ticket** if new info changes understanding
4. **Watch existing ticket** to stay informed

### When Your Ticket IS the Duplicate

1. **Link tickets**: "duplicates" → original ticket
2. **Add comment**: "Closing as duplicate of PROJ-123"
3. **Close duplicate**: Status = Duplicate/Closed
4. **Notify reporter**: If different from original

### When Tickets Are Related But Not Duplicates

1. **Link as "relates to"**
2. **Cross-reference in descriptions**
3. **Consider creating Epic** if they're part of larger issue
4. **Note differences** in comments

---

## Preventing Future Duplicates

### When Creating Tickets

1. **Always search first**
2. **Use standard terminology**
3. **Include searchable keywords**
4. **Reference error codes/messages**
5. **Tag with appropriate components/labels**

### When Writing Descriptions

Good for searchability:
```
h2. Error Details
Error message: "TypeError: Cannot read property 'id' of undefined"
Error code: ERR_CHECKOUT_001
Affected endpoint: POST /api/checkout

h2. Steps to Reproduce
1. Add item to cart
2. Go to checkout
3. Click "Place Order"
4. Error appears
```

### Team Practices

- Run duplicate detection during triage
- Review "resolved" tickets before creating new ones
- Use consistent labeling
- Document known issues in wiki

---

## Common Duplicate Patterns

### Same Bug, Different Reports
- Users report same error differently
- QA and user find same issue
- Regression creates new reports

### Feature Requests
- Multiple users request same feature
- Same idea with different framing
- Related features that should be one

### Environment-Specific
- Same issue in different environments
- Staging bug reported separately from production
- Mobile vs desktop same root cause

---

## Queries for Duplicate Hunting

### Recent Potential Duplicates
```
project = PROJ AND
created >= -7d AND
status = Open
ORDER BY created DESC
```

### Tickets with "Duplicate" in Title/Description
```
project = PROJ AND
(summary ~ "duplicate" OR description ~ "duplicate")
```

### Unlinked Similar Tickets
```
project = PROJ AND
component = [Component] AND
created >= -30d AND
issueLink IS EMPTY
ORDER BY created DESC
```

### Closed as Duplicate (Reference)
```
project = PROJ AND
resolution = Duplicate AND
resolved >= -90d
ORDER BY resolved DESC
```

---

## Duplicate Detection Checklist

Before creating a new ticket:

- [ ] Searched for exact error message
- [ ] Searched for key feature terms
- [ ] Checked component-specific tickets
- [ ] Reviewed recent tickets in same area
- [ ] Checked reporter's recent tickets
- [ ] Verified no duplicate exists
- [ ] OR found duplicate and added context there
