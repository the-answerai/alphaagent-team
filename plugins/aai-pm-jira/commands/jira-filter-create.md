---
description: Create a Jira filter with guided JQL query building or from existing JQL
argument-hint: [optional jql-query]
---

# /jira-filter-create - Create Jira Filter

Create a saved Jira filter with guided query building or from an existing JQL query.

## Usage

```bash
/jira-filter-create [optional jql-query]
```

### Examples

```bash
# Interactive mode - guided query building
/jira-filter-create

# With JQL query provided
/jira-filter-create project = PROJ AND type = Bug AND status != Done

# With complex query
/jira-filter-create "project in (PROJ1, PROJ2) AND assignee = currentUser() AND status not in (Done, Closed)"
```

## Parameters

- **jql-query** (optional): Complete JQL query for the filter
  - If provided: Agent validates and creates filter
  - If omitted: Agent guides you through building the query

## What It Does

The `jira-filter-creator` agent will:

1. **Understand Your Needs**
   - If you provided JQL: Validate it
   - If no JQL: Ask questions to build one

2. **Build JQL Query** (if needed)
   - Ask about project scope
   - Ask about issue types (Stories, Bugs, Tasks, etc.)
   - Ask about status/workflow states
   - Ask about assignee/team members
   - Ask about additional criteria (priority, labels, dates)

3. **Validate the Query**
   - Test JQL query against Jira
   - Show total count of matching issues
   - Display first 5-10 sample results
   - Confirm results match your expectations

4. **Create the Filter**
   - Suggest filter name based on query
   - Ask for visibility preference (private or shared)
   - Generate helpful description
   - Create filter in Jira
   - Provide filter URL and ID

## Filter Output

After creation, you'll receive:
- ✅ Filter name
- 🔗 Filter URL (direct link to view issues)
- 🆔 Filter ID (for use with `/jira-retro` and other commands)
- 👁️ Visibility setting
- 📝 Description

## Common Use Cases

### Personal Work Queue
Find all your open tasks:
```bash
/jira-filter-create "assignee = currentUser() AND status not in (Done, Closed)"
```

### Team Bugs
Track team's open bugs:
```bash
/jira-filter-create
# Agent will ask: project? ALPHA
# Agent will ask: issue types? Bugs
# Agent will ask: statuses? Open (To Do, In Progress)
# Agent will ask: assignees? team members
```

### Unassigned High Priority
Find urgent work needing assignment:
```bash
/jira-filter-create "assignee is EMPTY AND priority in (High, Critical) AND status != Done"
```

### Sprint Issues
Current sprint work:
```bash
/jira-filter-create "sprint in openSprints() AND project = PROJ"
```

### Recently Updated
Issues active in the last week:
```bash
/jira-filter-create "project = PROJ AND updated >= -7d"
```

## Interactive Query Building

When you run `/jira-filter-create` without a query, the agent asks:

### 1. Project Scope
- Single project (e.g., PROJ)
- Multiple projects (e.g., PROJ1, PROJ2)
- All projects

### 2. Issue Types
- All types
- Specific types (Story, Bug, Task, Epic, Sub-task)

### 3. Status
- Open issues only
- Specific statuses (To Do, In Progress, Review, Done)
- Exclude certain statuses

### 4. Assignee
- All assignees
- Current user
- Specific users/team
- Unassigned

### 5. Additional Filters (if needed)
- Priority levels
- Labels or components
- Date ranges (created, updated, due)
- Text search
- Custom fields

## JQL Quick Reference

| What You Want | JQL Syntax |
|---------------|------------|
| Single project | `project = PROJ` |
| Multiple projects | `project in (PROJ1, PROJ2)` |
| Issue type | `type = Bug` |
| Multiple types | `type in (Story, Task)` |
| Specific status | `status = "In Progress"` |
| Exclude status | `status != Done` |
| Open issues | `status not in (Done, Closed)` |
| Assigned to me | `assignee = currentUser()` |
| Assigned to user | `assignee = "john.doe"` |
| Unassigned | `assignee is EMPTY` |
| High priority | `priority in (High, Critical)` |
| Has label | `labels = "backend"` |
| Created recently | `created >= -30d` |
| Updated this week | `updated >= -7d` |
| Due soon | `duedate <= 7d` |
| Text search | `text ~ "authentication"` |
| Current sprint | `sprint in openSprints()` |

## Validation Process

Before creating the filter, the agent will:

1. **Test the JQL query** against your Jira instance
2. **Show you sample results**:
   ```
   Found 23 issues matching this query:
   - PROJ-145: Fix login bug on mobile
   - PROJ-167: Update API documentation
   - PROJ-189: Add password reset flow
   - PROJ-201: Refactor authentication service
   - PROJ-223: Improve error messages
   [... and 18 more]
   ```
3. **Ask for confirmation** that results match expectations
4. **Proceed with creation** only after confirmation

## Filter Naming

The agent suggests names following this pattern:
```
[Project] [Type/Criteria] - [Status/Context]
```

Examples:
- "PROJ High Priority Bugs - Open"
- "ALPHA Team Tasks - Current Sprint"
- "Backend Stories - Unassigned"
- "My Work - This Week"

You can accept the suggestion or provide your own name.

## Visibility Options

**Private** (default recommendation):
- Only you can see and use this filter
- Safer for personal work queues
- Can always share later

**Shared**:
- All users with project access can see it
- Good for team filters
- Appears in shared filters list

The agent will ask for your preference before creating.

## After Creation

### Use Your New Filter

**In Jira UI:**
- Click the provided URL
- Find it in "Filters" → "View all filters"

**With Other Commands:**
```bash
# Use filter for retrospectives
/jira-retro 12345 2024-01-01 2024-01-31

# Reference by ID in other tools
```

**In JQL:**
```jql
# Combine with other criteria
filter = 12345 AND updated >= -7d
```

## Tips

**Start Simple:**
- Build basic query first
- Add complexity gradually
- Test after each addition

**Use Saved Filters:**
- Create filters for recurring queries
- Share with team for consistency
- Reference by ID in automation

**Naming Conventions:**
- Use clear, descriptive names
- Include project and key criteria
- Follow team naming standards

**Maintenance:**
- Update filters as needs change
- Remove unused filters
- Document complex queries in description

## Troubleshooting

**"Invalid JQL syntax"**
- Check field names are correct
- Ensure quotes around values with spaces
- Verify operators (=, !=, in, not in)

**"No results found"**
- Broaden criteria (remove some filters)
- Check date ranges
- Verify project keys are correct

**"Too many results"**
- Add more specific criteria
- Narrow date ranges
- Filter by status or priority

**"Permission denied"**
- Check project access
- For shared filters, ensure proper permissions
- Contact Jira admin if needed

## Requirements

**Jira Access:**
- Must have Jira MCP server configured
- Requires permission to create filters
- For shared filters, need appropriate project permissions

## Integration

This command uses:
- **Agent**: `jira-filter-creator` - Guides query building and filter creation
- **MCP**: Atlassian plugin for Jira API access

## Related Commands

- `/jira-retro` - Generate retrospectives (can use filter IDs)
- `/jira-create` - Create a new Jira ticket
- `/jira-triage` - Triage tickets

## Example Session

```
You: /jira-filter-create

Agent: I'll help you create a Jira filter. Let me ask some questions to build the perfect query.

What project(s) should this filter include?
  1. Single project
  2. Multiple projects
  3. All projects you have access to

You: 1

Agent: What's the project key? (e.g., PROJ, TEAM, ALPHA)

You: ALPHA

Agent: Great! Now, which issue types should be included?
  1. All types
  2. Stories only
  3. Bugs only
  4. Tasks only
  5. Custom selection

You: 3

Agent: Perfect! For bugs in project ALPHA, which statuses?
  1. Open only (To Do, In Progress)
  2. All statuses
  3. Specific statuses

You: 1

Agent: And for assignees?
  1. All bugs (any assignee)
  2. Assigned to me
  3. Assigned to specific team members
  4. Unassigned bugs

You: 3

Agent: Which team members? (comma-separated usernames or emails)

You: john.doe, jane.smith

Agent: Excellent! Here's the JQL query I built:

```jql
project = ALPHA AND type = Bug AND status in ("To Do", "In Progress") AND assignee in (john.doe, jane.smith)
```

Let me validate this query...

✅ Query is valid!

Found 8 issues:
- ALPHA-123: Login fails on Safari
- ALPHA-145: API timeout on large requests
- ALPHA-167: Mobile layout broken on iOS
- ALPHA-189: Password reset email not sending
- ALPHA-201: 404 error on user profile page
[... and 3 more]

Does this match what you're looking for?

You: Yes!

Agent: Great! What should we name this filter?

Suggested name: "ALPHA Open Bugs - Team"

You: [press enter to accept]

Agent: Should this filter be private (only you) or shared (everyone with ALPHA access)?

You: shared

Agent: Creating filter...

✅ Filter created successfully!

📋 Name: ALPHA Open Bugs - Team
🆔 ID: 12345
🔗 URL: https://your-company.atlassian.net/issues/?filter=12345
👁️ Visibility: Shared with project
📝 Description: Shows open bugs in ALPHA project assigned to john.doe or jane.smith

You can now use this filter in Jira or reference it by ID (12345) in other commands like /jira-retro.
```
