---
name: issue-create
description: Patterns for creating well-structured GitHub issues with proper formatting and templates.
---

# GitHub Issue Creation Skill

This skill provides patterns for creating high-quality GitHub issues.

## GitHub Markdown Format

GitHub uses standard markdown with some extensions:

### Task Lists
```markdown
- [ ] Unchecked task
- [x] Completed task
```

### Mentions
```markdown
@username - Mention user
@org/team - Mention team
```

### References
```markdown
#123 - Issue reference
org/repo#123 - Cross-repo reference
SHA - Commit reference
```

### Code Blocks
````markdown
```javascript
const example = "code";
```

Inline `code` here
````

### Tables
```markdown
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
```

### Details/Summary (Collapsible)
```markdown
<details>
<summary>Click to expand</summary>

Hidden content here

</details>
```

---

## Issue Templates

### Bug Report

```markdown
## Bug Description
[Clear, concise description]

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots
[If applicable]

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.2.3]

## Additional Context
[Any other relevant information]

## Possible Fix
[If you have ideas on how to fix]
```

### Feature Request

```markdown
## Feature Summary
[One-sentence description]

## Problem Statement
[What problem does this solve?]

## Proposed Solution
[How should this work?]

## User Story
As a [type of user], I want [goal] so that [benefit].

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

## Alternatives Considered
[Other approaches you've thought about]

## Additional Context
[Mockups, examples, related issues]
```

### Technical Task

```markdown
## Objective
[What needs to be done]

## Background
[Why this is needed]

## Scope
### In Scope
- Item 1
- Item 2

### Out of Scope
- Item 3

## Technical Approach
[High-level approach]

## Files to Modify
- `path/to/file1.ts`
- `path/to/file2.ts`

## Testing Requirements
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual verification

## Definition of Done
- [ ] Code complete
- [ ] Tests passing
- [ ] PR reviewed
- [ ] Documentation updated
```

### Documentation

```markdown
## Documentation Needed
[What needs to be documented]

## Current State
[What exists now]

## Proposed Changes
[What should be added/changed]

## Affected Docs
- [ ] README.md
- [ ] API docs
- [ ] User guide

## Audience
[Who will read this]
```

---

## CLI Commands

### Create Basic Issue
```bash
gh issue create \
  --title "Clear, concise title" \
  --body "Description here"
```

### Create with Labels and Assignee
```bash
gh issue create \
  --title "Title" \
  --body "Body" \
  --label "bug,priority: high" \
  --assignee "@me"
```

### Create with Milestone
```bash
gh issue create \
  --title "Title" \
  --body "Body" \
  --milestone "v1.0"
```

### Create with HEREDOC Body
```bash
gh issue create --title "Title" --body "$(cat <<'EOF'
## Summary
Description here

## Details
More details

## Acceptance Criteria
- [ ] Item 1
- [ ] Item 2
EOF
)"
```

### Create from File
```bash
# Create issue body in file
cat > /tmp/issue.md << 'EOF'
## Summary
...
EOF

gh issue create --title "Title" --body-file /tmp/issue.md
```

---

## Best Practices

### Titles
- Start with action verb (Add, Fix, Update, Remove)
- Be specific, not vague
- Include affected component/area
- Keep under 72 characters

**Good:**
- "Add email notification when order ships"
- "Fix login failure with special characters in password"
- "Update API rate limiting documentation"

**Bad:**
- "Bug fix"
- "New feature"
- "Update stuff"

### Descriptions
- Start with context/problem
- Explain the "why" not just "what"
- Include acceptance criteria
- Reference related issues
- Add technical context if helpful

### Labels
- Always add type label (bug, enhancement, etc.)
- Add priority if known
- Add area/component labels
- Use "good first issue" for newcomers

### Linking
- Reference related issues: "Related to #123"
- Reference PRs: "Addressed by #456"
- Use keywords for auto-closing: "Fixes #123"

---

## Quality Checklist

Before creating issue:

- [ ] Searched for duplicates
- [ ] Title is clear and specific
- [ ] Description explains problem/goal
- [ ] Acceptance criteria defined
- [ ] Appropriate labels selected
- [ ] Related issues linked
- [ ] No sensitive information included
