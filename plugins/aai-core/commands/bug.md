---
description: Investigate, diagnose, and fix a bug with thorough research and validation
argument-hint: <bug-description>
allowed-tools: Task, Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# Bug Investigation & Fix Workflow

Thoroughly investigate a bug report, trace the code path, and implement a validated fix.

## Context

- Current branch: !`git branch --show-current`
- Uncommitted changes: !`git status --short`

## Bug Reference

Investigate: $ARGUMENTS

## Workflow

Execute these phases in order:

### Phase 1: Bug Intake & Clarification

1. **Parse the bug report** - Extract:
   - What is the expected behavior?
   - What is the actual behavior?
   - Steps to reproduce
   - Affected component(s)

2. **Clarify ambiguities** - Use AskUserQuestion if:
   - Reproduction steps are unclear
   - Expected behavior has multiple interpretations
   - Scope of the fix needs definition

### Phase 2: Research & Wire Tracing

Perform deep investigation by "following the wire":

1. **Trace the data flow**:
   - Component/function that triggers the action
   - API endpoint called (if applicable)
   - Server-side handler
   - Database operations
   - Response flow back
   - State updates

2. **Identify each connection point**:
   - Where does data enter the system?
   - What transformations occur?
   - Where could the bug be introduced?
   - What assumptions does each layer make?

3. **Gather evidence**:
   - Read relevant source files
   - Search for related code patterns
   - Check test coverage for the affected path
   - Look for similar bugs/fixes in git history

### Phase 3: Hypothesis Formation

1. **Challenge assumptions**:
   - Is the reported behavior actually a bug or expected?
   - Could this be a symptom of a deeper issue?
   - Are there edge cases not considered?

2. **Form hypotheses**:
   - List 2-3 possible root causes
   - Rank by likelihood
   - Identify how to test each hypothesis

3. **Design validation approach**:
   - How will we know the fix works?
   - What tests should pass/fail?
   - What manual verification steps are needed?

### Phase 4: Fix Implementation

Based on investigation:

1. Make the minimal fix that addresses root cause
2. Follow existing code patterns
3. Add appropriate error handling
4. Consider edge cases

**Provide with implementation**:
1. Root cause analysis summary
2. Specific files modified
3. Validation criteria (how to prove it's fixed)

### Phase 5: Validation

**CRITICAL - Do not skip this phase**

1. **Run automated checks**:
   ```bash
   # Build must succeed
   # Tests must pass
   ```

2. **Verify the specific fix**:
   - Can you reproduce the original bug? (Should fail before fix)
   - Does the fix resolve it? (Should pass after fix)
   - Are there regression risks?

3. **Add regression test**:
   - Write a test that would have caught this bug
   - Verify no regressions in related functionality

### Phase 6: Documentation & Closure

1. **Summarize for user**:
   - What was the root cause?
   - What was changed?
   - How was it validated?
   - Any follow-up items?

## Investigation Checklist

Use this checklist to ensure thorough investigation:

### Frontend Path
- [ ] Component that renders the affected UI
- [ ] Event handlers (onClick, onChange, etc.)
- [ ] State management (useState, context, etc.)
- [ ] API call construction
- [ ] Response handling and error states

### API Path
- [ ] Route definition
- [ ] Request validation
- [ ] Business logic / service layer
- [ ] Database queries
- [ ] Response construction

### Data Path
- [ ] Database schema
- [ ] Data transformations
- [ ] Type definitions
- [ ] Null/undefined handling

### State Path
- [ ] Initial state
- [ ] State updates
- [ ] Side effects
- [ ] Cache/stale data issues

## Anti-Patterns to Avoid

1. **Jumping to conclusions** - Always trace the full path first
2. **Fixing symptoms** - Address root cause, not just visible issue
3. **Untested fixes** - Every fix must be validated
4. **Breaking other things** - Check for regressions
5. **Missing documentation** - Add test to prevent regression

## Success Criteria

- [ ] Bug root cause identified with evidence
- [ ] Fix implemented following project patterns
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Manual reproduction confirms fix
- [ ] Regression test added
- [ ] User informed of fix and any follow-up items
