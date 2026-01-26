---
description: Analyze test coverage and identify gaps in testing
argument-hint: [path or scope]
---

# /coverage-report - Analyze Test Coverage

Analyze test coverage and identify gaps.

## Usage

```
/coverage-report
/coverage-report src/services/
/coverage-report --threshold 80
```

## Workflow

1. **Run Coverage Analysis**
   - Execute test suite with coverage
   - Collect coverage metrics
   - Identify uncovered code

2. **Analyze Results**
   - Line coverage breakdown
   - Branch coverage analysis
   - Function coverage

3. **Identify Gaps**
   - Uncovered files/functions
   - Partially covered branches
   - Critical paths without tests

4. **Prioritize Improvements**
   - High-risk uncovered code
   - Business-critical paths
   - Easy wins

## Output

- Coverage summary by directory
- Uncovered critical paths
- Specific line/branch gaps
- Prioritized recommendations
- Commands to improve coverage
