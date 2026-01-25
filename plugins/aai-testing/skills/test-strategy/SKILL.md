---
name: test-strategy
description: Test planning and strategy patterns
user-invocable: false
---

# Test Strategy Skill

Patterns for planning and organizing test suites.

## Testing Pyramid

```
        ┌─────────┐
        │   E2E   │  Few - Slow, Expensive
        ├─────────┤
        │  Integ  │  Some - Medium
        ├─────────┤
        │  Unit   │  Many - Fast, Cheap
        └─────────┘
```

### Recommended Ratios

- **Unit Tests**: 70% - Fast, isolated, cheap
- **Integration Tests**: 20% - API and service integration
- **E2E Tests**: 10% - Critical user flows only

## Test Organization

### By Feature

```
tests/
├── auth/
│   ├── login.test.ts
│   ├── logout.test.ts
│   ├── register.test.ts
│   └── password-reset.test.ts
├── users/
│   ├── create-user.test.ts
│   ├── update-user.test.ts
│   └── delete-user.test.ts
└── orders/
    ├── create-order.test.ts
    └── order-flow.e2e.ts
```

### By Type

```
tests/
├── unit/
│   ├── services/
│   ├── utils/
│   └── models/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    ├── flows/
    └── pages/
```

## What to Test

### Always Test

- Public API methods
- Business logic and calculations
- Error handling and edge cases
- Security-sensitive operations
- Data validation
- State transitions

### Consider Testing

- Complex private methods
- Performance-critical code
- Integration points
- Configuration loading

### Avoid Testing

- Third-party library internals
- Simple getters/setters
- Framework code
- Auto-generated code

## Test Prioritization

### P0 - Critical Path

Tests that must never fail:

- Authentication/authorization
- Payment processing
- Core business workflows
- Data integrity operations

### P1 - High Priority

Tests for important features:

- CRUD operations
- Search and filtering
- Notifications
- User preferences

### P2 - Normal Priority

Tests for auxiliary features:

- UI customization
- Report generation
- Export/import

## Test Naming

### Pattern

```typescript
// should [expected behavior] when [condition]
it('should return empty array when no users exist')
it('should throw ValidationError when email is invalid')
it('should update user when data is valid')
```

### Grouping

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    describe('with valid data', () => {
      it('should create user')
      it('should send welcome email')
    })

    describe('with invalid data', () => {
      it('should throw ValidationError for missing email')
      it('should throw ValidationError for invalid email format')
    })
  })
})
```

## Test Data Management

### Fixtures

```typescript
// fixtures/users.ts
export const validUser = {
  email: 'test@example.com',
  name: 'Test User',
  role: 'user'
}

export const adminUser = {
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin'
}

export const invalidUsers = {
  missingEmail: { name: 'No Email' },
  invalidEmail: { email: 'not-an-email', name: 'Bad Email' }
}
```

### Factories

```typescript
// factories/user.factory.ts
import { faker } from '@faker-js/faker'

export function createUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: faker.date.past(),
    ...overrides
  }
}

// Usage
const user = createUser({ role: 'admin' })
const users = Array.from({ length: 10 }, () => createUser())
```

## Coverage Strategy

### Minimum Thresholds

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "./src/services/": {
      "branches": 90,
      "lines": 90
    }
  }
}
```

### Focus Areas

- Business logic: 90%+
- API handlers: 80%+
- Utilities: 80%+
- UI components: 60%+

## Integration

Used by:
- `unit-test-developer` agent
- `api-test-developer` agent
- `e2e-test-developer` agent
