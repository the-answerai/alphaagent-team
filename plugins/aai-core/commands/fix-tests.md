---
description: Comprehensive test fixing workflow that analyzes, categorizes, and fixes all failing tests
argument-hint: [unit|api|e2e|all] [--report-only]
allowed-tools: Task, Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# /fix-tests - Comprehensive Test Fixing Workflow

Fix all failing tests through intelligent analysis and systematic repair.

## Context

- Current branch: !`git branch --show-current`

## Scope

Test scope: $ARGUMENTS (defaults to `all` if empty)

---

## Phase 1: Test Discovery & Initial Run

### 1.1 Run Tests and Capture Results

First, detect the project's test framework and commands, then execute tests:

```bash
# Detect package manager and test command
# Run tests and capture output
```

### 1.2 Parse Failure Count

Extract from each test run:
- Total tests
- Passed tests
- Failed tests
- Skipped tests
- Test duration

### 1.3 Create Fix Plan

List each failing test for systematic fixing.

---

## Phase 2: Failure Analysis & Categorization

For EACH failing test, analyze and categorize:

### Category A: Test Setup Problems

**Indicators:**
- `Cannot find module` errors
- `is not a function` on setup utilities
- Missing mocks or fixtures
- Database connection errors
- Missing environment variables

**Analysis approach:**
1. Check imports and module resolution
2. Verify mock files exist
3. Check test setup configuration
4. Verify database initialization

### Category B: Mocking Problems

**Indicators:**
- `TypeError: X is not a function` on mocked modules
- Unexpected real API calls
- Mock not being applied
- Mock ordering issues

**Analysis approach:**
1. Check mock implementation matches interface
2. Verify mock is hoisted correctly
3. Check for ESM vs CJS mock issues
4. Review test configuration

### Category C: Business Logic Issues

#### C1: Bug in Application Code
**Indicators:**
- Test expectations match requirements but code fails
- Multiple tests fail on same functionality
- Recent code change broke existing tests

#### C2: Bug in Test Code
**Indicators:**
- Test expectations don't match documented behavior
- Test uses wrong selectors/assertions
- Test has race conditions
- Test data doesn't match schema

### Category D: Outdated Tests

**Indicators:**
- Feature was refactored/removed
- API endpoint changed
- Component renamed or restructured
- Schema migration changed data shape

---

## Phase 3: Systematic Fixing

### Fixing Order

Fix tests in this order (fastest feedback first):

1. **Category A** (Setup) - Fixes often unblock multiple tests
2. **Category B** (Mocking) - Module-level fixes cascade
3. **Category D** (Outdated) - Quick deletions or updates
4. **Category C** (Logic) - Requires most investigation

### Fix-Verify Loop

For EACH failing test:

```
1. Identify ONE specific failure
2. Hypothesize root cause
3. Make minimal fix
4. Run the specific test immediately
5. Verify result:
   - PASS → Document and move to next
   - FAIL → New hypothesis, repeat
```

### Investigation Protocol for Logic Bugs

When encountering Category C (logic) failures:

1. **Read the failing test** - Understand what it expects
2. **Read the implementation** - Understand what it does
3. **Compare with requirements** - Check documentation
4. **Determine truth**:
   - Is the test correct and code wrong? → Fix code
   - Is the code correct and test wrong? → Fix test
   - Both ambiguous? → Ask user for clarification

```
Use AskUserQuestion when:
- Test and code disagree, both seem valid
- Requirements are ambiguous
- Fix would change user-facing behavior
- Multiple valid interpretations exist
```

---

## Phase 4: Skipped Test Audit

### Find All Skipped Tests

```bash
# Jest/Vitest skipped tests
grep -rn "\.skip\|xit\|xdescribe\|it\.todo\|test\.todo" src/ tests/ --include="*.test.ts" --include="*.test.tsx"

# Playwright skipped tests
grep -rn "\.skip\|test\.fixme" tests/ --include="*.spec.ts"
```

### Categorize Each Skip

For each skipped test, determine:

1. **Skip Reason**:
   - `FLAKY` - Test is non-deterministic
   - `BLOCKED` - Waiting on external dependency
   - `WIP` - Work in progress
   - `DEPRECATED` - Feature removed
   - `UNKNOWN` - No documented reason

2. **Action Required**:
   - `UNSKIP` - Fix and enable
   - `DELETE` - Remove deprecated test
   - `DOCUMENT` - Add reason comment
   - `ESCALATE` - Needs user decision

---

## Phase 5: Continuous Fixing Loop

**Continue until all tests pass:**

```
while (failing_tests > 0) {
  1. Run full test suite
  2. Pick highest-impact failure
  3. Analyze and categorize
  4. Apply fix
  5. Verify fix works
  6. Loop
}
```

### Exit Criteria

**Success** (can stop):
- All tests pass (100% pass rate)
- No failing tests remain
- Skipped tests documented with reasons

**Blocked** (need user input):
- Ambiguous requirements
- External dependency unavailable
- Breaking change needs approval

---

## Phase 6: Final Report

Generate comprehensive report:

```markdown
# Test Fix Report

**Final Status**: [PASS/FAIL/BLOCKED]

## Summary

| Category | Before | After | Fixed |
|----------|--------|-------|-------|
| Tests | X/Y | A/B | Z |

## Fixes Applied

### Category A: Test Setup
1. [Description]

### Category B: Mocking
1. [Description]

### Category C: Business Logic
1. [Description]

### Category D: Outdated
1. [Description]

## Skipped Tests Audit

[Summary of skipped tests and their status]

## Recommendations

1. [Recommendation]
```

---

## Anti-Patterns to Avoid

1. **Skipping tests to pass** - Never add `.skip` to make suite pass
2. **Deleting tests without analysis** - Understand why before removing
3. **Fixing tests without verification** - Always run after changes
4. **Ignoring root causes** - Fix underlying issue, not symptoms
5. **Mass changes** - Fix one test at a time, verify each

## Success Criteria

- [ ] All tests pass
- [ ] No new skipped tests added
- [ ] All skipped tests documented with reasons
- [ ] Final report generated
- [ ] User informed of any blocking issues
