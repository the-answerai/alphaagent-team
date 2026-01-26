---
name: linear-ticket-analysis
description: Methodology for analyzing Linear tickets to find duplicates, check relevance, and determine if issues have been fixed.
user-invocable: false
---

# Linear Ticket Analysis Skill

Methodology for analyzing Linear tickets to find duplicates, check relevance, and determine if issues have been fixed.

## Analysis Steps

### 1. Extract Key Information

From each Linear ticket, identify:
- **Title and description** - Core problem statement
- **Keywords** - Component names, error messages, feature names
- **Labels** - Bug, Feature, product area
- **Created date** - Age of ticket
- **Status** - Current workflow state
- **Related tickets** - Already linked duplicates/relations
- **GitHub links** - Associated GitHub issues

### 2. Duplicate Detection

Search for potential duplicates:

```
mcp__claude_ai_Linear__list_issues with:
  query="{keywords}"
  team="{team_key}"
  limit=20
```

**Duplicate indicators:**
- Same error message or component
- Similar title (>70% word overlap)
- Same root cause described differently
- Created within days of each other
- Same reporter

**NOT duplicates:**
- Related but distinct issues
- Same component, different bugs
- Follow-up issues with new scope

### 3. Codebase Investigation

For bugs, search for fixes:

```bash
# Search git history for ticket references
git log --oneline --all --since="2025-01-01" --grep="{ticket_id}"

# Search for keyword-related commits
git log --oneline --all --since="2025-01-01" --grep="{keyword}"

# Check if error pattern still exists
rg "{error_pattern}" --type ts
```

For features, check implementation status:

```bash
# Search for component/feature implementation
rg "{feature_keyword}" --type ts

# Check for related PRs
gh pr list --state merged \
  --search "{ticket_id}" --json number,title,mergedAt
```

### 4. Classification Criteria

#### CLOSE_DUPLICATE
- Another ticket covers same issue
- Original ticket is more complete/active
- Link to original before closing

#### CLOSE_FIXED
- Found PR/commit addressing the issue
- Error pattern no longer in codebase
- Feature has been implemented

#### CLOSE_OUTDATED
- Ticket is 6+ months old with no activity
- Component/feature no longer exists
- Requirements have fundamentally changed

#### KEEP_OPEN
- Issue still exists in codebase
- Feature not yet implemented
- Clear path to resolution

#### NEEDS_CLARIFICATION
- Insufficient detail to investigate
- Unclear requirements
- Add comment requesting more info

### 5. Status Transitions

When closing tickets, use appropriate status:
- `Done` - For fixed/implemented issues
- `Canceled` - For duplicates, outdated, won't fix

## Output Format

For each analyzed ticket:

```
TICKET: {ticket_id}
TITLE: {title}
AGE: {months} months
STATUS: {current_status}
LABELS: {labels}

ANALYSIS:
- Duplicate check: {result}
- Codebase check: {result}
- Relevance: {assessment}

RECOMMENDATION: {classification}
REASON: {brief explanation}
ACTION: {what to do}
```

## Integration

Used by:
- `linear-ticket-triager` agent
- `/linear-triage` command
