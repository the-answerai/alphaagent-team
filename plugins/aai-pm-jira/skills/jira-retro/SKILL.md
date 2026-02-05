---
name: jira-retro
description: Patterns and templates for creating sprint/project retrospective reports from Jira data with time tracking and blocker analysis.
---

# Jira Retrospective Skill

This skill provides patterns, templates, and best practices for generating insightful retrospective reports from Jira project data.

## Overview

Retrospectives help teams reflect on completed work, identify patterns, and continuously improve. This skill focuses on data-driven retrospectives that analyze:
- Completed tickets and delivery metrics
- Time tracking and estimation accuracy
- Blockers and impediments
- Team productivity and patterns

## Report Template

### Full Retrospective Report

```markdown
# {Sprint/Project} Retrospective
**Period:** {start_date} to {end_date}
**Project:** {project_name} ({project_key})
**Generated:** {current_date}

---

## Executive Summary

{Brief overview - 2-3 paragraphs summarizing:
 - What was accomplished
 - Key metrics and trends
 - Major wins and challenges}

### Key Metrics
- **Tickets Completed:** {count}
- **Story Points Delivered:** {points} (if tracked)
- **Total Time Logged:** {hours}h
- **Average Resolution Time:** {days} days
- **Blocked Issues:** {count} ({percentage}%)
- **Estimation Accuracy:** {percentage}% within ±20%

### Highlights
- ✅ {Major achievement or success}
- ✅ {Positive trend or improvement}
- ⚠️ {Challenge or area needing attention}

---

## Completed Tickets

### Summary Table
| Ticket | Summary | Type | Assignee | Status | Time Logged | Resolved |
|--------|---------|------|----------|--------|-------------|----------|
| {KEY-1} | {title} | {type} | {name} | {status} | {hours}h | {date} |
| {KEY-2} | {title} | {type} | {name} | {status} | {hours}h | {date} |

**Total Completed:** {count} issues

### Distribution by Type
- **Stories:** {count} ({percentage}%)
- **Bugs:** {count} ({percentage}%)
- **Tasks:** {count} ({percentage}%)
- **Other:** {count} ({percentage}%)

### Distribution by Priority
- **Critical/High:** {count} ({percentage}%)
- **Medium:** {count} ({percentage}%)
- **Low:** {count} ({percentage}%)

---

## Time Analysis

### Time Logged vs Estimated

| Ticket | Summary | Original Estimate | Actual Time | Variance | % Diff | Assignee |
|--------|---------|-------------------|-------------|----------|--------|----------|
| {KEY-1} | {title} | {hours}h | {hours}h | {±hours}h | {±%}% | {name} |
| {KEY-2} | {title} | {hours}h | {hours}h | {±hours}h | {±%}% | {name} |

**Totals:**
- **Original Estimates:** {total}h
- **Actual Time Logged:** {total}h
- **Total Variance:** {±hours}h ({±percentage}%)

### Time by Team Member

| Team Member | Issues Completed | Time Logged | Avg per Issue | % of Total |
|-------------|------------------|-------------|---------------|------------|
| {Name 1} | {count} | {hours}h | {avg}h | {%}% |
| {Name 2} | {count} | {hours}h | {avg}h | {%}% |

### Estimation Accuracy

**Categories:**
- ✅ **Accurate (±20%):** {count} tickets ({percentage}%)
- ⬆️ **Over-estimated (>20%):** {count} tickets ({percentage}%)
- ⬇️ **Under-estimated (>20%):** {count} tickets ({percentage}%)
- ❓ **No estimate:** {count} tickets ({percentage}%)

**Analysis:**
{Insights about estimation patterns:
 - Which types of work are consistently over/under-estimated?
 - Are certain team members more/less accurate?
 - What factors might explain large variances?}

---

## Blocker Analysis

### Blocked Issues Detail

| Ticket | Summary | Blocked By | Date Blocked | Date Unblocked | Days Blocked | Impact |
|--------|---------|------------|--------------|----------------|--------------|--------|
| {KEY-1} | {title} | {reason} | {date} | {date} | {count} | {impact} |
| {KEY-2} | {title} | {reason} | {date} | {date} | {count} | {impact} |

**Summary Statistics:**
- **Total Blocked Issues:** {count} ({percentage}% of all issues)
- **Average Block Duration:** {days} days
- **Longest Block:** {days} days ({ticket_key})
- **Total Days Lost to Blockers:** {count} days

### Common Blocker Categories

1. **{Category 1}** - {count} issues
   - Example: {description}
   - Impact: {impact_description}

2. **{Category 2}** - {count} issues
   - Example: {description}
   - Impact: {impact_description}

3. **{Category 3}** - {count} issues
   - Example: {description}
   - Impact: {impact_description}

**Insights:**
{Analysis of blocking patterns:
 - What are the most common causes of blockers?
 - Are blockers increasing/decreasing over time?
 - Which types of issues get blocked most often?
 - Recommendations for reducing blockers}

---

## Retrospective Insights

### 🌟 What Went Well

**Wins and Successes:**
- {Specific achievement with data/metric}
- {Positive pattern observed}
- {Team strength or improvement}

**Why it worked:**
{Analysis of what contributed to success}

### 🔧 What Could Be Improved

**Challenges and Opportunities:**
- {Challenge 1 with specific example}
  - **Impact:** {how this affected the team/project}
  - **Suggestion:** {specific improvement idea}

- {Challenge 2 with specific example}
  - **Impact:** {how this affected the team/project}
  - **Suggestion:** {specific improvement idea}

- {Challenge 3 with specific example}
  - **Impact:** {how this affected the team/project}
  - **Suggestion:** {specific improvement idea}

### 📋 Action Items

**Immediate Actions (Next Sprint):**
- [ ] {Specific, measurable action item 1}
  - Owner: {name}
  - Target: {date/sprint}

- [ ] {Specific, measurable action item 2}
  - Owner: {name}
  - Target: {date/sprint}

**Long-term Improvements:**
- [ ] {Strategic improvement 1}
  - Owner: {name}
  - Timeline: {timeframe}

### 💡 Team Observations

**Velocity and Throughput:**
{Analysis of team capacity and flow}

**Collaboration Patterns:**
{Observations about teamwork, dependencies, knowledge sharing}

**Process Effectiveness:**
{Insights about workflow, ceremonies, tools}

---

## Appendix

### Methodology

**Data Collection:**
- **Source:** Jira {instance_url}
- **Project:** {project_key}
- **Query Period:** {start_date} to {end_date}
- **Completion Criteria:** Issues with status = "Done" and resolutiondate in range
- **Worklog Filter:** Logs with started date in range

**Metrics Calculated:**
- **Time Logged:** Sum of all worklog timeSpent in period
- **Estimation Variance:** (Actual - Estimate) / Estimate × 100
- **Block Duration:** Days between blocked status change and unblocked status change
- **Resolution Time:** Days from created to resolutiondate

### Data Quality Notes

{Any caveats or limitations:
 - Missing time tracking data
 - Incomplete estimates
 - Status workflow variations
 - Manual adjustments made}

### Raw Data

**JQL Queries Used:**
```
{List the actual JQL queries used to fetch data}
```

**Issues Analyzed:** {count}
**Worklogs Processed:** {count}
**Date Range Verified:** {confirmation}

---

*Generated by Claude Code with aai-pm-jira plugin*
```

---

## Metrics Guide

### Essential Metrics

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Tickets Completed** | Count of issues with status = Done in period | Throughput |
| **Total Time Logged** | Sum of worklog timeSpent in period | Effort tracking |
| **Avg Resolution Time** | Average of (resolutiondate - created) | Cycle time |
| **Estimation Variance** | (Actual - Estimate) / Estimate | Estimation accuracy |
| **Blocked Issues %** | (Blocked issues / Total issues) × 100 | Flow efficiency |

### Advanced Metrics

| Metric | Calculation | Purpose |
|--------|-------------|---------|
| **Lead Time** | Time from created to done | Full delivery time |
| **Cycle Time** | Time from in progress to done | Active work time |
| **Throughput** | Issues completed per time period | Team capacity |
| **WIP** | Issues in progress at period end | Work in progress |
| **Flow Efficiency** | (Active time / Total time) × 100 | Process efficiency |

---

## JQL Patterns for Retrospectives

### Basic Queries

```jql
# All completed issues in date range (by project)
project = PROJ AND status = Done AND resolutiondate >= "2024-01-01" AND resolutiondate <= "2024-01-31"

# All completed issues in date range (by filter ID)
filter = 12345 AND status = Done AND resolutiondate >= "2024-01-01" AND resolutiondate <= "2024-01-31"

# All completed issues in date range (by filter name)
filter = "My Sprint Issues" AND status = Done AND resolutiondate >= "2024-01-01" AND resolutiondate <= "2024-01-31"

# Issues by sprint
project = PROJ AND sprint = "Sprint 10"

# Issues by assignee
project = PROJ AND assignee = "john.doe" AND status = Done AND resolutiondate >= "2024-01-01"
```

### Advanced Queries

```jql
# Issues that were blocked (by project)
project = PROJ AND status changed to "Blocked" during ("2024-01-01", "2024-01-31")

# Issues that were blocked (by filter)
filter = 12345 AND status changed to "Blocked" during ("2024-01-01", "2024-01-31")

# Issues with time logged (by project)
project = PROJ AND timespent > 0 AND updated >= "2024-01-01"

# Issues with time logged (by filter)
filter = 12345 AND timespent > 0 AND updated >= "2024-01-01"

# Issues by type and priority
project = PROJ AND type = Bug AND priority in (High, Critical) AND resolutiondate >= "2024-01-01"

# Issues with estimation variance
project = PROJ AND originalEstimate is not EMPTY AND timespent > 0 AND status = Done

# Combining filter with additional criteria
filter = "Team Backlog" AND assignee = currentUser() AND status = Done AND resolutiondate >= startOfWeek()
```

---

## Best Practices

### DO

✅ **Focus on data-driven insights**
- Use actual metrics, not impressions
- Compare to previous periods when possible
- Identify trends over single data points

✅ **Be balanced**
- Celebrate wins alongside challenges
- Frame problems as opportunities
- Acknowledge context and external factors

✅ **Make it actionable**
- Specific, measurable action items
- Assign owners and deadlines
- Follow up on previous actions

✅ **Include the team**
- Validate findings with team members
- Incorporate qualitative feedback
- Make it collaborative, not top-down

### DON'T

❌ **Avoid blame or finger-pointing**
- Focus on process, not people
- Frame as system issues, not individual failures
- Create psychological safety

❌ **Don't overwhelm with data**
- Highlight key metrics, not everything
- Use visualizations when helpful
- Keep executive summary concise

❌ **Don't ignore context**
- Account for holidays, team changes, incidents
- Note external dependencies
- Acknowledge unique circumstances

❌ **Don't make assumptions**
- Verify data accuracy
- Ask questions when patterns are unclear
- Get team input on interpretations

---

## Report Variations

### Quick Retro (Light Version)

For shorter retrospectives or weekly reviews:

```markdown
# Week of {date} - Quick Retro

**Completed:** {count} tickets
**Time Logged:** {hours}h
**Blockers:** {count}

### Wins
- {win}

### Challenges
- {challenge}

### Next Week Focus
- {focus_area}
```

### Epic/Feature Retro

For analyzing a specific epic or feature:

```markdown
# {Epic Name} Retrospective

**Epic:** {KEY-123}
**Timeline:** {start} to {end}
**Team:** {members}

### Delivery Summary
- **Total Stories:** {count}
- **Total Time:** {hours}h
- **Original Estimate:** {hours}h

### What We Learned
{Insights specific to this epic}

### Technical Debt Identified
{Debt items to address}
```

### Filter-Based Retro

For analyzing issues from a saved filter:

```markdown
# Retrospective - {Filter Name}
**Period:** {start} to {end}
**Filter:** {filter_name} (ID: {filter_id})

### Filter Scope
{Brief description of what the filter includes}

### Delivery Summary
- **Issues Completed:** {count}
- **Total Time Logged:** {hours}h
- **Estimation Accuracy:** {percentage}%

### Analysis
{Insights specific to the filtered set of issues}
```

---

## Integration Points

### After Generation

**Share the report:**
- Upload to Confluence for team visibility
- Post summary in team chat
- Present in retrospective meeting

**Create follow-ups:**
- Convert action items to Jira tickets
- Schedule follow-up reviews
- Track improvements over time

**Archive for trends:**
- Compare with previous retrospectives
- Track metric improvements
- Identify recurring patterns

---

## Anti-Patterns

### What to Avoid

❌ **Data dump without insights**
- Raw data alone isn't helpful
- Always interpret and contextualize
- Answer "so what?" for each metric

❌ **Focusing only on negatives**
- Balance is crucial for morale
- Acknowledge progress and wins
- Frame challenges constructively

❌ **Vague action items**
- "Communicate better" is not actionable
- Be specific about who, what, when
- Make items measurable

❌ **Ignoring time tracking gaps**
- Note when data is incomplete
- Don't draw conclusions from bad data
- Highlight data quality issues

❌ **One-time analysis**
- Retrospectives are most valuable over time
- Track trends across multiple periods
- Learn from patterns, not single events
