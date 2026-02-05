---
name: account-report
description: Patterns for generating Gamma.app-compatible slide deck markdown from GitHub data for customer-facing account management presentations
---

# Account Report Slide Deck

## Overview

This skill provides patterns and templates for generating structured markdown slide decks from GitHub issue and pull request data. The output is formatted for direct import into Gamma.app or manual use as a presentation.

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

- **[X] issues closed** across [Y] repositories
- **[Z] pull requests merged** with [W] contributors
- Key highlights:
  - [Most impactful feature or change]
  - [Second highlight]
  - [Third highlight]

---

# Completed Features

| Feature | Description | PR/Issue |
|---------|-------------|----------|
| [Feature name] | [One-line description] | #[number] |
| [Feature name] | [One-line description] | #[number] |
| [Feature name] | [One-line description] | #[number] |

---

# Bug Fixes & Improvements

- 🐛 **[Bug title]** — [Brief description of fix] (#[number])
- 🐛 **[Bug title]** — [Brief description of fix] (#[number])
- ⚡ **[Improvement]** — [Brief description] (#[number])

---

# Infrastructure & DevOps

- ⚙️ **[Infrastructure change]** — [Impact/benefit]
- ⚙️ **[DevOps improvement]** — [Impact/benefit]
- ⚙️ **[Deployment/CI change]** — [Impact/benefit]

---

# Key Metrics

| Metric | Value |
|--------|-------|
| Issues Closed | **[X]** |
| Pull Requests Merged | **[Y]** |
| Contributors Active | **[Z]** |
| Avg Time to Close | **[N] days** |
| Releases Published | **[R]** |

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

### GitHub CLI Queries

```bash
# Closed issues in date range
gh issue list --state closed --search "closed:>=YYYY-MM-DD closed:<=YYYY-MM-DD" --limit 200 --json number,title,labels,closedAt,assignees,stateReason

# Merged PRs in date range
gh pr list --state merged --search "merged:>=YYYY-MM-DD merged:<=YYYY-MM-DD" --limit 200 --json number,title,labels,mergedAt,author,additions,deletions

# Releases in date range
gh release list --limit 50

# Open issues for "upcoming work"
gh issue list --state open --label "priority:high" --limit 10 --json number,title,labels,assignees

# Contributors
gh pr list --state merged --search "merged:>=YYYY-MM-DD" --json author --jq '.[].author.login' | sort -u
```

### Issue Categorization

Categorize closed issues by their labels into slide sections:

| Label Pattern | Slide Section |
|--------------|---------------|
| `feature`, `enhancement`, `feat` | Completed Features |
| `bug`, `fix`, `defect` | Bug Fixes & Improvements |
| `infrastructure`, `devops`, `ci`, `cd`, `deploy` | Infrastructure & DevOps |
| `performance`, `optimization` | Bug Fixes & Improvements |
| `documentation`, `docs` | Infrastructure & DevOps |
| No matching label | Completed Features (default) |

If an issue has multiple labels, use the first matching category. If no labels exist, categorize by the PR title keywords or default to "Completed Features."

### Metrics Calculation

- **Issues Closed**: Count of issues closed in date range
- **PRs Merged**: Count of PRs merged in date range
- **Active Contributors**: Unique PR authors in date range
- **Avg Time to Close**: Mean of (closedAt - createdAt) for closed issues
- **Releases Published**: Count of releases created in date range

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
- List every single commit or minor change
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
- Add a "Trends" slide with month-over-month metrics
- Add a "Roadmap" slide with longer-term plans
- Add individual repository breakdowns if multi-repo

## Anti-Patterns

- **Wall of text**: Each bullet should be one line. If you need to explain, use the notes or a separate document.
- **Internal jargon**: Replace "refactored the auth middleware" with "Improved login security and reliability."
- **Missing context**: Don't just list PR numbers. Describe what changed and why it matters.
- **No metrics**: Always include quantitative data. "We fixed bugs" is weak. "We resolved 12 bugs, reducing error rate by 30%" is strong.
- **Stale data**: Always verify the date range is correct and data is current.
