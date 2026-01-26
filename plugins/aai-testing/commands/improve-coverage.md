---
description: Improve test coverage by writing tests for uncovered code paths
argument-hint: [file or function]
---

# /improve-coverage - Improve Test Coverage

Write tests to improve coverage for specific code paths.

## Usage

```
/improve-coverage
/improve-coverage src/services/auth.ts
/improve-coverage --target 80%
```

## Workflow

1. **Identify Gaps**
   - Analyze current coverage
   - Find uncovered functions
   - Identify missing branch coverage

2. **Prioritize**
   - Critical business logic first
   - Error handling paths
   - Edge cases

3. **Write Tests**
   - Unit tests for uncovered functions
   - Branch coverage for conditionals
   - Error path testing

4. **Verify Improvement**
   - Run coverage again
   - Confirm gaps are filled
   - Check for regressions

## Test Types Written

- Unit tests for pure functions
- Integration tests for services
- Mock-based tests for dependencies
- Error scenario tests

## Output

- New test files
- Coverage improvement summary
- Remaining gaps (if any)
- Suggestions for further improvement
