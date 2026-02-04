---
description: Generate a sprint/project retrospective report from Jira with time tracking and blocker analysis
argument-hint: [project-key-or-account] [start-date] [end-date] [output-file]
---

# /jira-retro - Generate Retrospective Report

Generate a comprehensive retrospective report from Jira data including completed tickets, time tracking analysis, and blocker patterns.

## Usage

```bash
/jira-retro [project-key-or-account] [start-date] [end-date] [output-file]
```

### Examples

```bash
# Interactive mode - will prompt for all parameters
/jira-retro

# Project-based retro
/jira-retro PROJ 2024-01-01 2024-01-31

# Account-based retro (by email)
/jira-retro john.doe@company.com 2024-01-01 2024-01-31

# Account-based retro (by account ID)
/jira-retro 5d1234567890abcdef123456 2024-01-01 2024-01-31

# With custom output file
/jira-retro PROJ 2024-01-01 2024-01-31 sprint10-retro.md

# With just project/account (will prompt for dates)
/jira-retro PROJ
/jira-retro john.doe@company.com
```

## Parameters

All parameters are optional. If not provided, the agent will prompt for them:

- **project-key-or-account**:
  - Project key (e.g., PROJ, TEAM, DEV) - analyzes all work in that project
  - OR user email (e.g., john.doe@company.com) - analyzes all work by that user
  - OR account ID (e.g., 5d1234567890abcdef123456) - analyzes all work by that user
- **start-date**: Period start date (format: YYYY-MM-DD)
- **end-date**: Period end date (format: YYYY-MM-DD)
- **output-file**: Path for generated markdown report (default: `retro-YYYY-MM-DD.md`)

## What It Does

The `jira-retro-agent` will:

1. **Gather Parameters**
   - Prompt for project key OR account if not provided
   - Prompt for start and end dates if not provided
   - Confirm output file path

2. **Fetch Jira Data**
   - Query all completed issues in the date range
   - Retrieve worklogs for time tracking analysis
   - Collect blocker information and durations
   - Gather time estimates (original vs actual)

3. **Analyze Data**
   - Calculate completion metrics (tickets, velocity, resolution time)
   - Analyze time tracking (total logged, per ticket, per person)
   - Identify estimation accuracy patterns
   - Examine blocker patterns and impacts

4. **Generate Report**
   - Create comprehensive markdown report
   - Include executive summary with key metrics
   - Provide detailed tables for tickets, time, and blockers
   - Add actionable insights and recommendations
   - Save to specified output file

## Report Includes

### Executive Summary
- Key metrics overview
- Highlights and challenges
- Quick wins and action items

### Completed Tickets Section
- Full list of completed issues with details
- Distribution by type and priority
- Summary statistics

### Time Analysis
- Time logged vs estimated comparison
- Estimation accuracy breakdown
- Time distribution by team member
- Variance analysis and patterns

### Blocker Analysis
- Detailed list of blocked issues
- Block duration and impact
- Common blocker categories
- Recommendations for reducing blockers

### Retrospective Insights
- What went well
- What could be improved
- Specific action items with owners
- Team observations and patterns

## Output

The command generates a markdown file with:
- ✅ Data-driven insights and recommendations
- 📊 Tables with metrics and breakdowns
- 📈 Trend analysis and patterns
- 🎯 Actionable items for improvement

Example output location:
```
./retro-2024-01-31.md
```

## After Completion

The agent will:
- Provide the file path to the generated report
- Summarize 2-3 key insights from the analysis
- Offer to create action item tickets in Jira
- Suggest sharing the report with the team

## Requirements

**Jira Access:**
- Must have Jira MCP server configured
- Requires read access to the specified project
- Worklog visibility permissions needed

**Date Format:**
- Use YYYY-MM-DD format (e.g., 2024-01-15)
- End date must be after start date
- Dates can be in the past or include today

## Tips

**For Best Results:**
- Run retrospectives regularly (after each sprint)
- Compare metrics across multiple periods
- Share reports with the team for discussion
- Convert action items to actual Jira tickets

**Date Range Selection:**
- Sprint retrospective: Use sprint start/end dates
- Monthly review: Use first/last day of month
- Release retrospective: Use release planning to launch dates
- Custom period: Any date range that makes sense for your team

**Data Quality:**
- Ensure team logs time consistently
- Add issue estimates for better variance analysis
- Link blocking issues properly in Jira
- Use consistent status workflows

## Integration

This command uses:
- **Agent**: `jira-retro-agent` - Handles data fetching and analysis
- **Skill**: `jira-retro` - Provides report templates and patterns
- **MCP**: Atlassian plugin for Jira API access

## Related Commands

- `/jira-create` - Create a new Jira ticket
- `/jira-start` - Start work on a ticket
- `/jira-triage` - Triage and prioritize tickets

## Troubleshooting

**"No issues found"**
- Verify the project key or account is correct
- For accounts: ensure email format is correct or use account ID
- Check that issues were actually completed in the date range
- Try expanding the date range

**"Missing worklog data"**
- Some issues may not have time logged
- Report will note data completeness issues
- Consider team training on time tracking

**"Cannot access project"**
- Verify Jira MCP server is configured
- Check project permissions in Jira
- Confirm project key spelling

## Example Session

### Project-Based Retro

```
You: /jira-retro

Agent: I'll help you generate a retrospective report. Let me gather some information:

Would you like to analyze by project or by account?
You: project

Agent: What is the Jira project key? (e.g., PROJ, TEAM, DEV)
You: ALPHA

Agent: What is the start date for the retrospective period? (format: YYYY-MM-DD)
You: 2024-01-01

Agent: What is the end date? (format: YYYY-MM-DD)
You: 2024-01-31

Agent: Where should I save the report? (default: ./retro-2024-01-31.md)
You: [press enter for default]

Agent: Fetching data from Jira...
- Found 23 completed issues
- Analyzing 156 worklogs
- Processing blocker information

Generating retrospective report...

✅ Report generated: ./retro-2024-01-31.md

Key Insights:
1. Completed 23 tickets (18% over velocity target)
2. Estimation accuracy improved to 73% (up from 62% last sprint)
3. 4 issues blocked by API dependencies (avg 2.5 days each)

Would you like me to create action item tickets in Jira?
```

### Account-Based Retro

```
You: /jira-retro john.doe@company.com 2024-01-01 2024-01-31

Agent: Fetching data from Jira...
- Found 18 completed issues assigned to john.doe@company.com
- Analyzing 89 worklogs
- Processing blocker information

Generating retrospective report...

✅ Report generated: ./retro-2024-01-31.md

Key Insights:
1. Completed 18 tickets across 4 different projects
2. 94% estimation accuracy (excellent!)
3. 2 issues blocked by external dependencies (avg 1.5 days each)

This is a personal retrospective for John Doe's work across all projects.
```
