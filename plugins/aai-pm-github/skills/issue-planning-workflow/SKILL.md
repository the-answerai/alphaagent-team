---
name: issue-planning-workflow
description: Comprehensive planning methodology for GitHub issues - from analysis to implementation plan.
---

# GitHub Issue Planning Workflow Skill

This skill provides a comprehensive methodology for planning implementation of GitHub issues.

## Planning Phases

### Phase 1: Issue Intelligence

**Gather all information:**
```bash
# Get issue details
gh issue view {number} --json title,body,labels,milestone,comments,assignees

# Get comments
gh issue view {number} --comments

# Check related PRs
gh pr list --search "#{number}" --json number,title,state
```

**Extract:**
- Core problem/goal
- Acceptance criteria
- Technical hints in description
- Context from comments
- Related issues referenced

### Phase 2: Codebase Exploration

**Systematic exploration:**

1. **Find relevant files:**
```bash
# Search for keywords
rg "keyword" --type ts -l

# Find component files
ls src/components/ | grep -i "feature"
```

2. **Understand current state:**
- Read main files involved
- Note patterns and conventions
- Identify extension points
- Check test coverage

3. **Document findings:**
- File paths with line numbers
- Current implementation details
- Patterns to follow
- Potential challenges

### Phase 3: Clarification

**Ask targeted questions:**

Format:
```markdown
### Question: [Topic]

**Context**: [What you discovered]

**Options**:
A) **[Option]** - [Description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]

B) **[Option]** - [Description]
   - Pros: [Benefits]
   - Cons: [Drawbacks]

**Recommendation**: Option [X] because [reasoning]
```

**Good questions:**
- Technical approach decisions
- Scope clarifications
- Priority of edge cases
- UI/UX preferences

**Avoid:**
- Questions answered in issue
- Questions answerable from code
- Yes/no questions without context

### Phase 4: Plan Generation

**Structure:**

```markdown
## Implementation Plan: #{number}

### Overview
[1-2 sentence summary of approach]

### Architecture Changes
[New components, files, APIs]

### Implementation Steps

#### Step 1: [Title] (Complexity: Low/Medium/High)
**What**: [Description]
**Files**:
- `path/to/file.ts` - [What to change]

**Key Points**:
- [Critical detail 1]
- [Pattern to follow]

**Testing**: [How to verify]

#### Step 2: [Title]
...

### Testing Strategy
- **Unit tests**: [What to test]
- **Integration tests**: [What to test]
- **Manual verification**: [Steps]

### Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | High/Med/Low | [Strategy] |

### Success Criteria
- [ ] [Criterion from issue]
- [ ] [Additional criterion]
```

### Phase 5: Branch & Assignment

**Create branch:**
```bash
# Ensure up to date
git checkout main && git pull

# Create feature branch
git checkout -b feature/{number}-{brief-description}

# Push to remote
git push -u origin feature/{number}-{brief-description}
```

**Update issue:**
```bash
# Assign to self
gh issue edit {number} --add-assignee @me

# Add in-progress label
gh issue edit {number} --add-label "in progress"

# Add plan comment
gh issue comment {number} --body "Starting work. Plan: [brief summary]. Branch: \`feature/{number}-...\`"
```

---

## Branch Naming

**Format**: `{type}/{number}-{brief-description}`

**Types:**
- `feature/` - New functionality
- `fix/` - Bug fixes
- `chore/` - Maintenance
- `docs/` - Documentation
- `refactor/` - Code improvements
- `test/` - Test additions

**Examples:**
```
feature/123-user-notifications
fix/456-checkout-timeout
chore/789-update-deps
docs/101-api-examples
```

**Sanitization rules:**
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Keep under 50 chars

---

## Plan Quality Checklist

Before presenting plan:

- [ ] Explored all relevant code
- [ ] Identified patterns to follow
- [ ] Steps are specific and actionable
- [ ] Dependencies between steps noted
- [ ] Testing strategy defined
- [ ] Risks identified
- [ ] Success criteria from issue included
- [ ] Estimated complexity per step

---

## Step Complexity Guidelines

**Low Complexity:**
- Single file change
- Clear pattern to follow
- No new dependencies
- Minimal testing needed

**Medium Complexity:**
- Multiple related files
- Some decisions required
- New tests needed
- May need clarification

**High Complexity:**
- Architectural changes
- Multiple components
- New patterns/approaches
- Significant testing
- Potential risks

---

## Integration Notes

**Linking work:**
```bash
# In commit messages
git commit -m "feat(#123): implement notification service"

# In PR title
[#123] Add user notifications
```

**Auto-close keywords:**
- `Fixes #123`
- `Closes #123`
- `Resolves #123`

**Reference keywords:**
- `Related to #123`
- `Part of #123`
- `See #123`
