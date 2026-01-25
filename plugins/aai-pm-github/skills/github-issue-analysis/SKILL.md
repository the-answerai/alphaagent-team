---
name: github-issue-analysis
description: Patterns for analyzing GitHub issues to determine if they are still relevant or have been fixed. Reference skill for agents.
user-invocable: false
---

# GitHub Issue Analysis Skill

Systematic methodology for analyzing GitHub issues to determine current relevance and appropriate action.

## Purpose

Analyze GitHub issues to determine:
- Is the issue still reproducible/relevant?
- Has it been fixed (find the PR/commit)?
- Does context need updating?
- Should it become a Linear ticket?

## Analysis Methodology

### Phase 1: Issue Data Collection

```bash
# Fetch complete issue details
gh issue view {issue_number} --json \
  title,body,labels,comments,createdAt,updatedAt,state,author
```

Extract from issue:
- **Title**: Main topic/symptom
- **Body**: Detailed description, steps to reproduce
- **Labels**: bug, enhancement, documentation, etc.
- **Comments**: Additional context, workarounds mentioned
- **Created Date**: Age of issue (older = more likely fixed)
- **Updated Date**: Last activity

### Phase 2: Keyword Extraction

From issue title and body, extract:

1. **Component Keywords**: UI elements, features mentioned
   - Example: "drawer", "sidebar", "modal", "canvas"

2. **Error Keywords**: Error messages, stack traces
   - Example: "undefined", "null", "404", "500"

3. **File/Function Keywords**: Specific code references
   - Example: "buildWidget", "AppDrawer.jsx"

4. **Behavior Keywords**: What's happening vs expected
   - Example: "redirects", "crashes", "freezes", "disappears"

### Phase 3: Codebase Search

Search for evidence the issue was addressed:

#### Search for Related Commits

```bash
# Search commit messages for issue keywords
git log --oneline --all --since="2025-01-01" --grep="{keyword}"

# Search for GitHub issue references in commits
git log --oneline --all --grep="#{issue_number}"

# Search for related file changes
git log --oneline --all --since="2025-01-01" -- "**/path/to/component*"
```

#### Search for Code Changes

```bash
# Check if the problematic code pattern still exists
rg "{error_pattern}" --type ts

# Check if fix patterns were added
rg "stopPropagation|preventDefault" --type tsx

# Check if component was refactored/deleted
ls -la src/components/{component}/
```

#### Search for Related PRs

```bash
# Find PRs that mention the issue
gh pr list --state all --search "#{issue_number}" --json number,title,state,mergedAt

# Find PRs that touched related files
gh pr list --state merged --search "{component_name}" --json number,title,mergedAt
```

### Phase 4: Issue Classification

Based on analysis, classify the issue:

#### Classification: CLOSE_FIXED

**Criteria:**
- Found commit/PR that explicitly addresses the issue
- Error message/pattern no longer exists in code
- Component was refactored with new implementation
- Issue is very old (6+ months) and core feature works

**Action:**
```bash
gh issue close {number} --comment "$(cat <<'EOF'
Closing this issue - it has been addressed.

**Resolution:**
- Fixed in PR #{pr_number} / commit {commit_hash}
- The {component} was refactored in {month}
- The original error pattern no longer exists

If you're still experiencing this issue, please open a new issue with current reproduction steps.
EOF
)"
```

#### Classification: CLOSE_OUTDATED

**Criteria:**
- Feature/component no longer exists
- Architecture has fundamentally changed
- Issue references deprecated functionality
- Context is too old to be actionable (12+ months, no activity)

**Action:**
```bash
gh issue close {number} --comment "$(cat <<'EOF'
Closing this issue as outdated.

**Reason:**
- {component/feature} has been significantly refactored since this was reported
- The original context no longer applies to current architecture
- This issue is {age} old with no recent activity

If this is still a problem, please open a new issue with:
1. Current reproduction steps
2. Expected vs actual behavior
3. Screenshots/logs if applicable
EOF
)"
```

#### Classification: CLOSE_CANNOT_REPRODUCE

**Criteria:**
- Issue lacks sufficient detail to investigate
- No reproduction steps provided
- Reporter hasn't responded to questions
- Appears to be one-off or environment-specific

#### Classification: CREATE_TICKET

**Criteria:**
- Issue is clearly still relevant
- Codebase search shows problem likely still exists
- Clear reproduction steps or obvious bug
- Feature request is still applicable

**Action:**
Create Linear ticket and link back to GitHub issue.

### Phase 5: Linear Ticket Creation

When creating a ticket, use this template:

```markdown
## GitHub Issue: #{issue_number}

**Original Report:** {github_url}
**Reported:** {created_date}
**Reporter:** {author}

## Summary
{Updated summary based on current codebase understanding}

## Current State
{What exists in the codebase today}

## Problem
{Clear description of what's wrong}

## Expected Behavior
{What should happen}

## Steps to Reproduce
{Updated steps if original are outdated}

## Technical Notes
- Relevant files: {file_paths}
- Related components: {components}
- Potential approach: {suggestions}

## Original Description
{Include original issue body for reference}
```

### Phase 6: Link GitHub to Linear

After creating Linear ticket:

```bash
gh issue comment {github_issue_number} --body "$(cat <<'EOF'
Linear ticket created: [{ticket_id}]({linear_url})

This issue is now being tracked in Linear for prioritization and implementation.
EOF
)"
```

## Decision Tree

```
START: Analyze GitHub Issue #{number}
  |
  +-- Is issue < 3 months old?
  |   +-- YES: Higher priority to investigate thoroughly
  |   +-- NO: Check if still relevant to current architecture
  |
  +-- Does issue reference existing component/feature?
  |   +-- YES: Search for related fixes
  |   +-- NO: CLOSE_OUTDATED (component removed)
  |
  +-- Found related PR/commit that fixes it?
  |   +-- YES: CLOSE_FIXED (cite the PR)
  |   +-- NO: Continue investigation
  |
  +-- Does error pattern still exist in code?
  |   +-- YES: Likely still an issue
  |   +-- NO: CLOSE_FIXED (pattern removed)
  |
  +-- Is issue clearly described with reproduction steps?
  |   +-- YES: CREATE_TICKET
  |   +-- NO: Can we infer the problem?
  |       +-- YES: UPDATE_AND_CREATE
  |       +-- NO: CLOSE_CANNOT_REPRODUCE
  |
  +-- END: Take appropriate action
```

## Age-Based Heuristics

| Issue Age | Default Assumption | Override If |
|-----------|-------------------|-------------|
| 0-3 months | Likely still relevant | Clear fix found |
| 3-6 months | Investigate carefully | Component unchanged |
| 6-12 months | Likely outdated | Critical bug, still reproducible |
| 12+ months | Probably outdated | Security issue, data loss |

## Integration

Used by:
- `github-issue-triager` agent - Primary consumer
- `/issue-triage` command - Via agent

## Quality Checklist

Before taking action on an issue:
- [ ] Fetched complete issue details
- [ ] Searched codebase for related code
- [ ] Searched git history for fixes
- [ ] Checked if component still exists
- [ ] Classified issue appropriately
- [ ] Prepared appropriate comment/ticket
- [ ] Included relevant evidence (PRs, commits)
