---
name: jest-coverage
description: Jest code coverage configuration and analysis
user-invocable: false
---

# Jest Coverage Skill

Patterns for configuring and analyzing code coverage in Jest.

## Configuration

### Basic Coverage Config

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
  ],
}
```

### Coverage Thresholds

```javascript
// jest.config.js
module.exports = {
  coverageThreshold: {
    // Global thresholds
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Per-directory thresholds
    './src/utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Per-file thresholds
    './src/critical-module.ts': {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
}
```

### Coverage Reporters

```javascript
// jest.config.js
module.exports = {
  coverageReporters: [
    'text',           // Console output
    'text-summary',   // Condensed console output
    'lcov',           // For CI tools (Codecov, Coveralls)
    'html',           // Browser-viewable report
    'json',           // Machine-readable
    'json-summary',   // Condensed JSON
    'cobertura',      // XML format for CI
    'clover',         // Clover XML format
  ],
}
```

## Running Coverage

### CLI Commands

```bash
# Run with coverage
jest --coverage

# Run specific files with coverage
jest --coverage --collectCoverageFrom='src/utils/**/*.ts' src/utils

# Update snapshots with coverage
jest --coverage --updateSnapshot

# Watch mode with coverage
jest --coverage --watch

# Coverage with verbose output
jest --coverage --verbose

# Coverage threshold check only
jest --coverage --coverageThreshold='{"global":{"lines":80}}'
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:coverage:watch": "jest --coverage --watch",
    "test:coverage:ci": "jest --coverage --ci --runInBand",
    "test:coverage:check": "jest --coverage --coverageThreshold='{\"global\":{\"lines\":80}}'",
    "coverage:report": "open coverage/lcov-report/index.html"
  }
}
```

## Coverage Metrics

### Understanding Metrics

```
Metric          | Description
----------------|--------------------------------------------
Lines           | Percentage of executable lines run
Statements      | Percentage of statements executed
Branches        | Percentage of conditional branches covered
Functions       | Percentage of functions called
```

### Reading Coverage Report

```
----------|---------|----------|---------|---------|-------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines
----------|---------|----------|---------|---------|-------------------
All files |   85.71 |    75.00 |   83.33 |   85.71 |
 index.ts |   85.71 |    75.00 |   83.33 |   85.71 | 15,23-25
----------|---------|----------|---------|---------|-------------------
```

## Improving Coverage

### Identifying Gaps

```typescript
// File with coverage gaps
export function processUser(user: User | null) {
  if (!user) {          // ← Branch: need null case test
    return null
  }

  if (user.role === 'admin') {  // ← Branch: need admin case
    return { ...user, permissions: 'all' }
  }

  if (user.role === 'user') {   // ← Branch: need user case
    return { ...user, permissions: 'limited' }
  }

  return { ...user, permissions: 'none' }  // ← Uncovered line
}

// Tests to achieve full coverage
describe('processUser', () => {
  it('returns null for null user', () => {
    expect(processUser(null)).toBeNull()
  })

  it('gives admin all permissions', () => {
    const admin = { role: 'admin', name: 'Admin' }
    expect(processUser(admin)).toMatchObject({ permissions: 'all' })
  })

  it('gives user limited permissions', () => {
    const user = { role: 'user', name: 'User' }
    expect(processUser(user)).toMatchObject({ permissions: 'limited' })
  })

  it('gives unknown role no permissions', () => {
    const guest = { role: 'guest', name: 'Guest' }
    expect(processUser(guest)).toMatchObject({ permissions: 'none' })
  })
})
```

### Branch Coverage

```typescript
// Function with multiple branches
function getStatus(value: number): string {
  if (value < 0) {           // Branch 1
    return 'negative'
  } else if (value === 0) {  // Branch 2
    return 'zero'
  } else if (value < 10) {   // Branch 3
    return 'small'
  } else {                   // Branch 4 (default)
    return 'large'
  }
}

// Tests for 100% branch coverage
test.each([
  [-1, 'negative'],
  [0, 'zero'],
  [5, 'small'],
  [100, 'large'],
])('getStatus(%i) = %s', (value, expected) => {
  expect(getStatus(value)).toBe(expected)
})
```

### Edge Cases

```typescript
// Function with edge cases
function divide(a: number, b: number): number {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

// Cover edge cases
describe('divide', () => {
  it('divides positive numbers', () => {
    expect(divide(10, 2)).toBe(5)
  })

  it('handles negative numbers', () => {
    expect(divide(-10, 2)).toBe(-5)
  })

  it('handles decimal results', () => {
    expect(divide(1, 3)).toBeCloseTo(0.333, 2)
  })

  it('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero')
  })
})
```

## Excluding Code

### Istanbul Comments

```typescript
// Exclude next line
/* istanbul ignore next */
if (process.env.DEBUG) {
  console.log('Debug info')
}

// Exclude block
/* istanbul ignore if */
if (typeof window === 'undefined') {
  // Server-only code
}

// Exclude else branch
if (condition) {
  // covered
} /* istanbul ignore else */ else {
  // not covered in tests
}

// Exclude entire file (at top)
/* istanbul ignore file */
```

### Coverage Path Ignoring

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',      // Exclude barrel files
    '!src/**/*.stories.ts',  // Exclude Storybook
    '!src/mocks/**',         // Exclude mocks
    '!src/types/**',         // Exclude type definitions
    '!src/test/**',          // Exclude test utilities
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__fixtures__/',
    '/dist/',
  ],
}
```

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage --ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true
```

### Codecov Configuration

```yaml
# codecov.yml
coverage:
  status:
    project:
      default:
        target: 80%
        threshold: 2%
    patch:
      default:
        target: 80%

ignore:
  - "**/*.test.ts"
  - "**/test/**"
  - "**/mocks/**"
```

### Coverage Badge

```markdown
<!-- README.md -->
[![codecov](https://codecov.io/gh/owner/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/owner/repo)
```

## Best Practices

### Meaningful Coverage

```typescript
// BAD: High coverage, low value
test('covers function', () => {
  const result = complexFunction({})
  expect(result).toBeDefined()  // Weak assertion
})

// GOOD: Meaningful tests with good coverage
test('processes valid input correctly', () => {
  const result = complexFunction({ value: 42 })
  expect(result.computed).toBe(84)
  expect(result.valid).toBe(true)
})

test('handles invalid input', () => {
  const result = complexFunction({ value: -1 })
  expect(result.valid).toBe(false)
  expect(result.error).toBe('Value must be positive')
})
```

### Prioritizing Coverage

```
Priority | Area                 | Target
---------|----------------------|--------
High     | Business logic       | 90%+
High     | Utility functions    | 90%+
Medium   | API integrations     | 80%+
Medium   | React components     | 75%+
Low      | Configuration files  | 50%+
Low      | Type definitions     | N/A
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
