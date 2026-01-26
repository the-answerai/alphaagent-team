---
description: Run tests with smart filtering, watch mode, and failure analysis
argument-hint: [test pattern or path]
---

# /run-tests - Run Tests

Run tests with smart filtering and analysis of failures.

## Usage

```
/run-tests
/run-tests auth
/run-tests src/services/payment.test.ts
/run-tests --watch
/run-tests --failed-only
```

## Workflow

1. **Detect Test Framework**
   - Jest, Vitest, Mocha, etc.
   - Find configuration
   - Identify test patterns

2. **Run Tests**
   - Execute matching tests
   - Capture output and results
   - Track timing

3. **Analyze Failures**
   - Parse error messages
   - Identify root causes
   - Suggest fixes

4. **Report Results**
   - Pass/fail summary
   - Slow test identification
   - Coverage if enabled

## Options

- `--watch` - Watch mode for development
- `--failed-only` - Re-run only failed tests
- `--coverage` - Include coverage report
- `--verbose` - Detailed output

## Output

- Test results summary
- Failure analysis with suggestions
- Slow test warnings
- Coverage summary (if enabled)
