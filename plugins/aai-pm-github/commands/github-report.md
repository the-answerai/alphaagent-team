---
description: Generate a customer-facing slide deck report from GitHub data for account management meetings
argument-hint: [date-range] [output-file]
---

# /github-report - Generate Account Report Slide Deck

Generate a Gamma.app-compatible markdown slide deck from GitHub issues and pull requests for customer-facing account management presentations.

## Usage

```
/github-report
/github-report last 2 weeks
/github-report last month
/github-report 2024-01-01 2024-01-31
/github-report 2024-01-01 2024-01-31 ./slides/january-report.md
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `date-range` | Time period for the report. Explicit dates (YYYY-MM-DD YYYY-MM-DD) or shortcuts (`last 2 weeks`, `last month`, `last quarter`) | Interactive prompt |
| `output-file` | Path to write the markdown file | `./report-YYYY-MM-DD.md` |

## Workflow

Launch the `github-report-generator` agent with any provided arguments.

The agent will:
1. Gather date range and optional parameters (repo, team name)
2. Query GitHub for closed issues, merged PRs, and releases in the date range
3. Categorize work into Features, Bug Fixes, and Infrastructure sections
4. Calculate key metrics (issues closed, PRs merged, contributors, avg close time)
5. Identify upcoming work from open high-priority issues
6. Flag risks from blocked or overdue issues
7. Generate a structured markdown slide deck
8. Write the output file

## Report Includes

- **Title Slide** with product name, date range, and preparation date
- **Executive Summary** with 3 key highlights
- **Completed Features** grouped in a table
- **Bug Fixes & Improvements** as a categorized bullet list
- **Infrastructure & DevOps** changes
- **Key Metrics** table (issues closed, PRs merged, contributors, avg close time, releases)
- **Upcoming Work** from open high-priority issues
- **Risks & Dependencies** from blocked issues

## Output

The generated markdown file uses `# Heading` for each slide, which Gamma.app interprets as slide breaks when imported. The file can also be used directly as a readable status report.

## After Completion

The agent will provide:
- Path to the generated markdown file
- Summary of key findings
- Total slide count
- Reminder to import into Gamma.app

## Requirements

- **GitHub CLI**: Must be authenticated (`gh auth login`)
- **Repository access**: Must have read access to the target repository

## Tips

### Date Range Selection
- Use `last 2 weeks` for biweekly meetings
- Use `last month` for monthly account reviews
- Use explicit dates for custom periods or quarterly reviews
- If unsure, start with `last month` and adjust

### Multi-Repository Reports
- Run the command from within the target repo, or specify repos when prompted
- For org-wide reports, the agent will ask which repos to include

### Customization
- The agent will ask for a product/team name for the title slide
- You can request a "quick" format (fewer slides) or "detailed" format (more slides)
- Sections with no data are automatically omitted

## Related Commands

- `/issue-triage` - Triage and prioritize GitHub issues
- `/issue-create` - Create a new GitHub issue

## Example Session

```
User: /github-report last month

Agent: I'll generate a slide deck report for last month.

Gathering data...
- Found 23 closed issues
- Found 31 merged PRs
- Found 2 releases
- 8 active contributors

Generating slide deck...

✅ Report generated: ./report-2024-02-04.md
- 8 slides
- 12 features delivered
- 7 bugs fixed
- 4 infrastructure improvements

Key highlights:
1. New user dashboard feature shipped
2. 7 bugs resolved, including critical checkout fix
3. CI/CD pipeline improvements reduced deploy time by 40%

The markdown file is ready for import into Gamma.app.
```
