---
name: jira-ticket-create
description: Patterns for creating well-structured Jira tickets with proper formatting, fields, and Jira-specific best practices.
---

# Jira Ticket Creation Skill

This skill provides patterns and templates for creating high-quality Jira tickets.

## Jira Markup Format

Jira uses its own wiki markup, not Markdown:

### Headings
```
h1. Heading 1
h2. Heading 2
h3. Heading 3
```

### Text Formatting
```
*bold*
_italic_
-strikethrough-
+underline+
{{monospace}}
```

### Lists
```
* Bullet point
** Nested bullet

# Numbered list
## Nested numbered
```

### Code Blocks
```
{code:java}
// Code here
{code}

{code:javascript}
// JavaScript code
{code}

{noformat}
Plain text, no formatting
{noformat}
```

### Links
```
[Link text|http://example.com]
[PROJ-123] - links to ticket
```

### Tables
```
||Header 1||Header 2||Header 3||
|Cell 1|Cell 2|Cell 3|
|Cell 4|Cell 5|Cell 6|
```

### Panels
```
{panel:title=Panel Title}
Panel content here
{panel}

{info}
Information callout
{info}

{warning}
Warning callout
{warning}
```

---

## Ticket Templates

### Bug Report Template

```
h2. Bug Summary
[One sentence description of the bug]

h2. Environment
* *Browser/OS*: [e.g., Chrome 120 / macOS]
* *Environment*: [Production/Staging/Development]
* *Version*: [App version if applicable]

h2. Steps to Reproduce
# Step 1
# Step 2
# Step 3

h2. Expected Behavior
[What should happen]

h2. Actual Behavior
[What actually happens]

h2. Screenshots/Logs
[Attach or describe]

h2. Additional Context
[Any other relevant information]
```

### User Story Template

```
h2. User Story
*As a* [type of user]
*I want* [goal/desire]
*So that* [benefit/value]

h2. Context
[Background on why this is needed]

h2. Acceptance Criteria
* Given [context]
* When [action]
* Then [expected result]

h2. Out of Scope
* [What this story does NOT include]

h2. Technical Notes
* [Any technical considerations]
* [Related files or systems]

h2. Design
[Link to designs or describe UI requirements]
```

### Technical Task Template

```
h2. Objective
[Clear statement of what needs to be done]

h2. Background
[Why this task is needed]

h2. Requirements
* Requirement 1
* Requirement 2
* Requirement 3

h2. Technical Approach
[High-level approach, not implementation details]

h2. Files to Modify
* {{path/to/file1.ts}}
* {{path/to/file2.ts}}

h2. Testing
* Unit tests: [What to test]
* Integration tests: [What to test]

h2. Definition of Done
* [ ] Code complete
* [ ] Tests passing
* [ ] Code reviewed
* [ ] Documentation updated
```

### Epic Template

```
h2. Epic Overview
[High-level description of the initiative]

h2. Goals
* Goal 1
* Goal 2
* Goal 3

h2. Success Metrics
||Metric||Target||Current||
|[Metric 1]|[Target]|[Baseline]|
|[Metric 2]|[Target]|[Baseline]|

h2. Scope
h3. In Scope
* Feature 1
* Feature 2

h3. Out of Scope
* Feature X
* Feature Y

h2. Dependencies
* Dependency 1 [PROJ-XXX]
* Dependency 2

h2. Timeline
||Phase||Target Date||
|Design|[Date]|
|Development|[Date]|
|Testing|[Date]|
|Release|[Date]|

h2. Stories
[Link child stories here as they're created]
```

---

## Field Guidelines

### Summary (Title)
- Keep under 80 characters
- Be specific and action-oriented
- Include relevant context
- Avoid generic descriptions

**Good**: "Add email notification when order ships"
**Bad**: "Email feature"

### Priority
| Priority | When to Use |
|----------|-------------|
| Blocker | System down, data loss |
| Critical | Major feature broken |
| High | Significant impact |
| Medium | Moderate impact |
| Low | Nice to have |

### Labels
- Use existing labels when possible
- Create new labels sparingly
- Common labels: `tech-debt`, `security`, `performance`, `documentation`

### Components
- Assign all affected components
- Helps with team routing
- Enables better reporting

### Story Points
| Points | Complexity |
|--------|------------|
| 1 | Trivial change |
| 2 | Small, well-understood |
| 3 | Medium, some unknowns |
| 5 | Large, multiple parts |
| 8 | Very large, significant unknowns |
| 13 | Epic-sized, consider splitting |

---

## Best Practices

### DO
- Write for the implementer, not yourself
- Include the "why" not just the "what"
- Reference file paths, not code snippets
- Link related tickets
- Set appropriate priority
- Add acceptance criteria

### DON'T
- Paste large code blocks
- Use vague descriptions
- Leave priority unset
- Forget acceptance criteria
- Create duplicate tickets
- Over-specify implementation details

---

## Jira API Patterns

### Creating a Ticket
```javascript
// POST /rest/api/3/issue
{
  "fields": {
    "project": { "key": "PROJ" },
    "issuetype": { "name": "Story" },
    "summary": "Add email notifications for shipped orders",
    "description": {
      "type": "doc",
      "version": 1,
      "content": [/* ADF content */]
    },
    "priority": { "name": "Medium" },
    "labels": ["notifications", "email"],
    "components": [{ "name": "Backend" }]
  }
}
```

### Adding Comments
```javascript
// POST /rest/api/3/issue/{issueKey}/comment
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [/* ADF content */]
  }
}
```

Note: Newer Jira API uses Atlassian Document Format (ADF) for rich text instead of wiki markup.
