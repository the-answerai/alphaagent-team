---
name: coverage-analysis
description: Code coverage analysis and improvement patterns
user-invocable: false
---

# Coverage Analysis Skill

Patterns for analyzing and improving code coverage.

## Coverage Configuration

### Jest Configuration

```typescript
// jest.config.ts
export default {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/index.ts',
    '!src/types/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90
    },
    './src/utils/': {
      branches: 85,
      functions: 85,
      lines: 85
    }
  }
}
```

### NYC (Istanbul) Configuration

```javascript
// .nycrc.json
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "all": true,
  "include": ["src/**/*.ts"],
  "exclude": [
    "**/*.test.ts",
    "**/*.spec.ts",
    "**/test/**",
    "**/types/**"
  ],
  "reporter": ["text", "lcov", "html"],
  "check-coverage": true,
  "branches": 80,
  "lines": 80,
  "functions": 80,
  "statements": 80
}
```

## Coverage Types

### Statement Coverage

```typescript
function calculate(a: number, b: number): number {
  const sum = a + b     // Line 1 - covered if function called
  const product = a * b // Line 2 - covered if function called
  return sum + product  // Line 3 - covered if function called
}

// 100% statement coverage with one test
test('calculate', () => {
  expect(calculate(2, 3)).toBe(11)
})
```

### Branch Coverage

```typescript
function getStatus(score: number): string {
  if (score >= 90) {        // Branch 1
    return 'A'
  } else if (score >= 80) { // Branch 2
    return 'B'
  } else if (score >= 70) { // Branch 3
    return 'C'
  } else {                  // Branch 4
    return 'F'
  }
}

// 100% branch coverage requires 4 tests
test('returns A for 90+', () => expect(getStatus(95)).toBe('A'))
test('returns B for 80-89', () => expect(getStatus(85)).toBe('B'))
test('returns C for 70-79', () => expect(getStatus(75)).toBe('C'))
test('returns F for below 70', () => expect(getStatus(60)).toBe('F'))
```

### Function Coverage

```typescript
class UserService {
  create() { }    // Function 1
  update() { }    // Function 2
  delete() { }    // Function 3
  findById() { }  // Function 4
}

// 50% function coverage - only 2 of 4 tested
test('create user', () => service.create())
test('find user', () => service.findById())
```

## Identifying Coverage Gaps

### Uncovered Branches Pattern

```typescript
// Before - Branch not covered
function process(data: Data | null): Result {
  if (!data) {
    return { error: 'No data' }  // ← Often missed
  }
  return processData(data)
}

// Add test for null case
test('returns error when data is null', () => {
  expect(process(null)).toEqual({ error: 'No data' })
})
```

### Error Path Coverage

```typescript
// Common uncovered paths
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`)
    return response.data
  } catch (error) {
    if (error.status === 404) {
      throw new NotFoundError('User not found')  // ← Test this
    }
    throw new ApiError('Failed to fetch user')   // ← And this
  }
}

// Tests for error paths
test('throws NotFoundError for 404', async () => {
  api.get.mockRejectedValue({ status: 404 })
  await expect(fetchUser('123')).rejects.toThrow(NotFoundError)
})

test('throws ApiError for other errors', async () => {
  api.get.mockRejectedValue({ status: 500 })
  await expect(fetchUser('123')).rejects.toThrow(ApiError)
})
```

## Coverage Reports

### Reading HTML Report

```
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------|---------|----------|---------|---------|-------------------
All files    |   85.5  |   78.2   |   82.1  |   85.5  |
 services/   |   92.3  |   88.5   |   90.0  |   92.3  |
  user.ts    |   95.0  |   90.0   |  100.0  |   95.0  | 45-47
  auth.ts    |   89.5  |   87.0   |   80.0  |   89.5  | 23,67-72
 utils/      |   78.2  |   68.0   |   74.3  |   78.2  |
  helpers.ts |   78.2  |   68.0   |   74.3  |   78.2  | 12-18,34,56-60
```

### CI Integration

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - run: npm ci
      - run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Check coverage threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below threshold"
            exit 1
          fi
```

## Coverage Anti-Patterns

### Don't Chase 100%

```typescript
// Not worth testing - simple getter
get name(): string {
  return this._name
}

// Not worth testing - trivial logic
isEmpty(): boolean {
  return this.items.length === 0
}
```

### Avoid Coverage for Coverage's Sake

```typescript
// Bad: Testing implementation, not behavior
test('calls internal method', () => {
  const spy = jest.spyOn(service, '_internalMethod')
  service.publicMethod()
  expect(spy).toHaveBeenCalled()  // Brittle, tests implementation
})

// Good: Testing behavior
test('returns processed result', () => {
  const result = service.publicMethod()
  expect(result).toMatchObject({ processed: true })
})
```

## Focus Areas

### High Coverage Priority

- Business logic and calculations
- API endpoints and handlers
- Authentication and authorization
- Data validation
- State management

### Lower Coverage Priority

- Simple CRUD operations
- Configuration files
- Type definitions
- Generated code
- Third-party integrations

## Integration

Used by:
- `unit-test-developer` agent
- `api-test-developer` agent
