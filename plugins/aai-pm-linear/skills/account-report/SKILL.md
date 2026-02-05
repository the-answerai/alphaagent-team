---
name: account-report
description: Patterns for generating Gamma.app-compatible slide deck markdown from Linear data for customer-facing account management presentations
---

# Account Report Slide Deck

## Overview

This skill provides patterns and templates for generating structured markdown slide decks from Linear ticket data. The output is formatted for direct import into Gamma.app or manual use as a presentation.

## Slide Deck Format

The markdown uses `# Heading` for each slide. Gamma.app interprets each top-level heading as a new slide. Keep content concise and visual - this is a presentation, not a document.

### Formatting Rules

- Each `# Heading` creates a new slide
- Use bullet points, not paragraphs - audiences scan, they don't read
- Tables should be small (3-5 rows max per slide)
- Bold key numbers and metrics
- Keep bullet points to 3-5 per slide
- Use emoji sparingly for visual markers (✅, 🚀, 🐛, ⚙️, 📊)

## Slide Deck Template

```markdown
# [Product/Team Name] - Status Update

**Period**: [Start Date] — [End Date]
**Prepared**: [Current Date]

---

# Executive Summary

- **[X] tickets completed** across [Y] projects
- **[Z] story points delivered**
- Key highlights:
  - [Most impactful feature or change]
  - [Second highlight]
  - [Third highlight]

---

# Completed Features

| Feature | Description | Ticket |
|---------|-------------|--------|
| [Feature name] | [One-line description] | [TEAM-123] |
| [Feature name] | [One-line description] | [TEAM-456] |
| [Feature name] | [One-line description] | [TEAM-789] |

---

# Bug Fixes & Improvements

- 🐛 **[Bug title]** — [Brief description of fix] ([TEAM-123])
- 🐛 **[Bug title]** — [Brief description of fix] ([TEAM-456])
- ⚡ **[Improvement]** — [Brief description] ([TEAM-789])

---

# Infrastructure & DevOps

- ⚙️ **[Infrastructure change]** — [Impact/benefit]
- ⚙️ **[DevOps improvement]** — [Impact/benefit]
- ⚙️ **[Deployment/CI change]** — [Impact/benefit]

---

# Key Metrics

| Metric | Value |
|--------|-------|
| Tickets Completed | **[X]** |
| Story Points Delivered | **[Y]** |
| Projects Active | **[Z]** |
| Avg Cycle Time | **[N] days** |
| Bugs Resolved | **[B]** |

---

# Upcoming Work

- 🔜 **[Planned feature/task]** — [Brief description]
- 🔜 **[Planned feature/task]** — [Brief description]
- 🔜 **[Planned feature/task]** — [Brief description]

---

# Risks & Dependencies

| Risk/Dependency | Impact | Mitigation |
|----------------|--------|------------|
| [Risk description] | [High/Medium/Low] | [What we're doing about it] |

---

# Questions & Discussion

**Next meeting**: [Suggested date]
**Contact**: [Team/person contact info]
```

## Data Collection Patterns

### Linear MCP Queries

Use the Linear MCP tools to gather data:

```
# Completed tickets in date range (by team)
list_issues(team: "TEAM", state: "done", updatedAt: "YYYY-MM-DD")

# Completed tickets (by project)
list_issues(project: "Project Name", state: "done", updatedAt: "YYYY-MM-DD")

# Canceled tickets
list_issues(team: "TEAM", state: "canceled", updatedAt: "YYYY-MM-DD")

# In-progress tickets for "upcoming work"
list_issues(team: "TEAM", state: "started")

# Backlog/planned tickets for "upcoming work"
list_issues(team: "TEAM", state: "unstarted", limit: 10)

# Project progress
get_project(query: "Project Name")

# Cycle information
list_cycles(teamId: "TEAM_ID", type: "current")
```

### Ticket Categorization

Categorize completed tickets by their labels into slide sections:

| Label Pattern | Slide Section |
|--------------|---------------|
| `Feature`, `Enhancement` | Completed Features |
| `Bug`, `Fix`, `Defect` | Bug Fixes & Improvements |
| `Infrastructure`, `DevOps`, `CI/CD` | Infrastructure & DevOps |
| `Performance`, `Optimization` | Bug Fixes & Improvements |
| `Documentation` | Infrastructure & DevOps |
| No matching label | Completed Features (default) |

If a ticket has multiple labels, use the first matching category. If no labels exist, use the ticket title keywords to categorize.

### Metrics Calculation

- **Tickets Completed**: Count of tickets moved to "Done" state in date range
- **Story Points Delivered**: Sum of estimate values for completed tickets
- **Projects Active**: Count of distinct projects with completed work
- **Avg Cycle Time**: Mean of (completedAt - startedAt) for completed tickets
- **Bugs Resolved**: Count of completed tickets with Bug label

## Content Guidelines

### DO

- Lead with impact, not implementation details
- Use customer-friendly language (avoid internal jargon)
- Group related changes together under meaningful categories
- Include specific numbers and metrics
- Keep each slide focused on one topic
- Mention the business value of technical changes

### DON'T

- Include internal retrospective content (blockers, what went wrong)
- Use overly technical descriptions
- List every single ticket or minor change
- Include security vulnerability details
- Mention specific team member performance issues
- Overwhelm slides with too many items (cap at 5-7 per slide)

## Slide Variations

### Quick Update (fewer slides)

For shorter meetings, use only these slides:
1. Title
2. Executive Summary
3. Key Accomplishments (merge Features + Bug Fixes)
4. Upcoming Work
5. Q&A

### Detailed Update (more slides)

For quarterly reviews, expand with:
- Split "Completed Features" across multiple slides if >5 items
- Add a "Trends" slide with cycle-over-cycle metrics
- Add a "Roadmap" slide with longer-term project milestones
- Add per-project breakdowns if multi-project

## Anti-Patterns

- **Wall of text**: Each bullet should be one line. If you need to explain, use the notes or a separate document.
- **Internal jargon**: Replace "refactored the auth middleware" with "Improved login security and reliability."
- **Missing context**: Don't just list ticket IDs. Describe what changed and why it matters.
- **No metrics**: Always include quantitative data. "We fixed bugs" is weak. "We resolved 12 bugs, reducing error rate by 30%" is strong.
- **Stale data**: Always verify the date range is correct and data is current.
