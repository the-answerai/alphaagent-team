---
name: issue-triage
description: Triage GitHub issues - analyze relevance, close fixed/outdated issues, or create Linear tickets
---

# /issue-triage - GitHub Issue Triage

Analyze GitHub issues to determine if they're still relevant. Close resolved issues or create Linear tickets for valid ones.

## Usage

```bash
# Triage a single issue
/issue-triage 278

# Triage multiple issues (processed in parallel)
/issue-triage 278 316 331 343
```

## What This Command Does

For each issue:
1. **Fetches issue details** from GitHub
2. **Searches codebase** for related code and fixes
3. **Determines relevance** based on code changes and age
4. **Takes action**:
   - Close if fixed (with PR/commit reference)
   - Close if outdated (architecture changed)
   - Create Linear ticket if still valid

## Single Issue Mode

```bash
/issue-triage 278
```

Launches `github-issue-triager` agent to analyze issue #278.

**Output:**
```
TRIAGE COMPLETE
Issue: #278
Title: [BUG] Clone Widget Redirects Incorrectly
Action: CREATE_TICKET
Result: Created PROJ-650
Details: Click event propagation bug still present in component
```

## Batch Mode (Parallel)

```bash
/issue-triage 278 316 331 343
```

Launches multiple `github-issue-triager` agents in parallel, one per issue.

**Output:**
```
Triaging 4 issues in parallel...

Issue #278: Created PROJ-650 (bug still exists)
Issue #316: Closed (feature implemented in PR #567)
Issue #331: Created PROJ-651 (UX improvement valid)
Issue #343: Closed (outdated - component refactored)

Summary: 2 tickets created, 2 issues closed
```

## Integration

This command uses:
- **Agent**: `github-issue-triager` - Autonomous issue analysis
- **Skills**:
  - `github-issue-analysis` - Analysis methodology
  - `ticket-duplicate-detection` - Avoid duplicate tickets

## Parallel Execution

When triaging multiple issues, spawn separate agents:

```python
for issue_number in issue_numbers:
    Task(
        subagent_type="github-issue-triager",
        prompt=f"Triage GitHub issue #{issue_number}",
        run_in_background=True  # Parallel execution
    )
```

This allows processing many issues simultaneously.
