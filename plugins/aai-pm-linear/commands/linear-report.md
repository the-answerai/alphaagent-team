---
description: Generate a customer-facing slide deck report from Linear data for account management meetings
argument-hint: [date-range] [output-file]
---

# /linear-report - Generate Account Report Slide Deck

Generate a Gamma.app-compatible markdown slide deck from Linear tickets for customer-facing account management presentations.

## Usage

```
/linear-report
/linear-report last 2 weeks
/linear-report last month
/linear-report last cycle
/linear-report 2024-01-01 2024-01-31
/linear-report 2024-01-01 2024-01-31 ./slides/january-report.md
```

## Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `date-range` | Time period for the report. Explicit dates (YYYY-MM-DD YYYY-MM-DD) or shortcuts (`last 2 weeks`, `last month`, `last quarter`, `last cycle`) | Interactive prompt |
| `output-file` | Path to write the markdown file | `./report-YYYY-MM-DD.md` |

## Workflow

Launch the `linear-report-generator` agent with any provided arguments.

The agent will:
1. Gather date range and optional parameters (team, project, name)
2. Query Linear for completed tickets in the date range
3. Categorize work into Features, Bug Fixes, and Infrastructure sections
4. Calculate key metrics (tickets completed, story points, cycle time)
5. Identify upcoming work from in-progress and backlog tickets
6. Flag risks from blocked tickets
7. Generate a structured markdown slide deck
8. Write the output file

## Report Includes

- **Title Slide** with product name, date range, and preparation date
- **Executive Summary** with 3 key highlights
- **Completed Features** grouped in a table
- **Bug Fixes & Improvements** as a categorized bullet list
- **Infrastructure & DevOps** changes
- **Key Metrics** table (tickets completed, story points, projects active, avg cycle time, bugs resolved)
- **Upcoming Work** from in-progress and high-priority backlog tickets
- **Risks & Dependencies** from blocked tickets

## Output

The generated markdown file uses `# Heading` for each slide, which Gamma.app interprets as slide breaks when imported. The file can also be used directly as a readable status report.

## After Completion

The agent will provide:
- Path to the generated markdown file
- Summary of key findings
- Total slide count
- Reminder to import into Gamma.app

## Requirements

- **Linear MCP**: The Linear MCP server must be configured and connected

## Tips

### Date Range Selection
- Use `last 2 weeks` for biweekly meetings
- Use `last month` for monthly account reviews
- Use `last cycle` to match your Linear cycle exactly
- Use explicit dates for custom periods or quarterly reviews

### Scoping
- The agent will ask which team to report on if not obvious
- You can scope to a specific project for project-level reports
- All teams/projects are included by default unless you specify

### Customization
- The agent will ask for a product/team name for the title slide
- You can request a "quick" format (fewer slides) or "detailed" format (more slides)
- Sections with no data are automatically omitted

## Related Commands

- `/linear-triage` - Triage and prioritize Linear tickets
- `/linear-create` - Create a new Linear ticket
- `/linear-start` - Start working on a Linear ticket

## Example Session

```
User: /linear-report last cycle

Agent: I'll generate a slide deck report for the last cycle.

Fetching cycle data...
- Cycle: Sprint 14 (Jan 15 - Jan 29)

Gathering completed tickets...
- Found 18 completed tickets
- 45 story points delivered
- 3 projects with activity

Generating slide deck...

✅ Report generated: ./report-2024-02-04.md
- 8 slides
- 10 features delivered
- 5 bugs fixed
- 3 infrastructure improvements

Key highlights:
1. New API integration for partner dashboard
2. 5 customer-reported bugs resolved
3. Database migration completed for improved query performance

The markdown file is ready for import into Gamma.app.
```
