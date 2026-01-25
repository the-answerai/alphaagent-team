---
name: jest-patterns
description: Jest testing patterns and best practices
user-invocable: false
---

# Jest Patterns Skill

Testing patterns and best practices for Jest.

## Test Structure

### Describe Blocks

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create a user with valid data', async () => {
      // test
    })

    it('should throw error with invalid email', async () => {
      // test
    })
  })

  describe('findUser', () => {
    it('should return user by id', async () => {
      // test
    })

    it('should return null for non-existent user', async () => {
      // test
    })
  })
})
```

### AAA Pattern

```typescript
it('should calculate total with discount', () => {
  // Arrange
  const cart = new ShoppingCart()
  cart.addItem({ name: 'Widget', price: 100 })
  const discount = 0.1

  // Act
  const total = cart.calculateTotal(discount)

  // Assert
  expect(total).toBe(90)
})
```

### Setup and Teardown

```typescript
describe('DatabaseService', () => {
  let db: Database
  let testUser: User

  // Before all tests in this describe block
  beforeAll(async () => {
    db = await Database.connect()
  })

  // After all tests
  afterAll(async () => {
    await db.disconnect()
  })

  // Before each test
  beforeEach(async () => {
    testUser = await db.createUser({ name: 'Test' })
  })

  // After each test
  afterEach(async () => {
    await db.clearTestData()
  })

  it('should find user', async () => {
    const user = await db.findUser(testUser.id)
    expect(user).toEqual(testUser)
  })
})
```

## Assertions

### Basic Matchers

```typescript
// Equality
expect(value).toBe(exact)           // Strict equality (===)
expect(value).toEqual(object)       // Deep equality
expect(value).toStrictEqual(object) // Deep equality + undefined properties

// Truthiness
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()

// Numbers
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3.5)
expect(value).toBeLessThan(5)
expect(value).toBeCloseTo(0.3, 5)  // Floating point

// Strings
expect(string).toMatch(/pattern/)
expect(string).toContain('substring')

// Arrays/Iterables
expect(array).toContain(item)
expect(array).toContainEqual(object)
expect(array).toHaveLength(3)

// Objects
expect(object).toHaveProperty('key')
expect(object).toHaveProperty('nested.key', value)
expect(object).toMatchObject({ key: value })
```

### Error Assertions

```typescript
// Sync errors
expect(() => {
  throw new Error('fail')
}).toThrow()

expect(() => {
  throw new Error('fail')
}).toThrow('fail')

expect(() => {
  throw new Error('fail')
}).toThrow(Error)

// Async errors
await expect(asyncFn()).rejects.toThrow('error')
await expect(asyncFn()).rejects.toBeInstanceOf(CustomError)
```

### Custom Matchers

```typescript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling
    return {
      pass,
      message: () =>
        `expected ${received} ${pass ? 'not ' : ''}to be within range ${floor} - ${ceiling}`,
    }
  },
})

// Usage
expect(100).toBeWithinRange(90, 110)

// TypeScript declaration
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R
    }
  }
}
```

## Test Isolation

### Resetting State

```typescript
describe('Counter', () => {
  let counter: Counter

  beforeEach(() => {
    counter = new Counter()  // Fresh instance each test
  })

  it('should start at 0', () => {
    expect(counter.value).toBe(0)
  })

  it('should increment', () => {
    counter.increment()
    expect(counter.value).toBe(1)
  })
})
```

### Clearing Mocks

```typescript
afterEach(() => {
  jest.clearAllMocks()   // Clear call history
  jest.resetAllMocks()   // Clear + reset implementations
  jest.restoreAllMocks() // Restore original implementations
})
```

## Parameterized Tests

### Using test.each

```typescript
// Array format
test.each([
  [1, 1, 2],
  [1, 2, 3],
  [2, 2, 4],
])('add(%i, %i) = %i', (a, b, expected) => {
  expect(add(a, b)).toBe(expected)
})

// Object format
test.each([
  { a: 1, b: 1, expected: 2 },
  { a: 1, b: 2, expected: 3 },
  { a: 2, b: 2, expected: 4 },
])('add($a, $b) = $expected', ({ a, b, expected }) => {
  expect(add(a, b)).toBe(expected)
})

// Template literal
test.each`
  a    | b    | expected
  ${1} | ${1} | ${2}
  ${1} | ${2} | ${3}
  ${2} | ${2} | ${4}
`('add($a, $b) = $expected', ({ a, b, expected }) => {
  expect(add(a, b)).toBe(expected)
})
```

### Describe.each

```typescript
describe.each([
  { role: 'admin', canDelete: true },
  { role: 'user', canDelete: false },
  { role: 'guest', canDelete: false },
])('$role permissions', ({ role, canDelete }) => {
  it(`should ${canDelete ? '' : 'not '}allow delete`, () => {
    const user = createUser({ role })
    expect(user.canDelete()).toBe(canDelete)
  })
})
```

## Snapshot Testing

### Basic Snapshots

```typescript
it('should render correctly', () => {
  const tree = renderer.create(<Button label="Click me" />).toJSON()
  expect(tree).toMatchSnapshot()
})

// Inline snapshots
it('should format user', () => {
  const user = formatUser({ name: 'John', age: 30 })
  expect(user).toMatchInlineSnapshot(`
    {
      "displayName": "John",
      "isAdult": true,
    }
  `)
})
```

### Property Matchers

```typescript
it('should create user with id', () => {
  const user = createUser({ name: 'John' })

  expect(user).toMatchSnapshot({
    id: expect.any(String),
    createdAt: expect.any(Date),
  })
})
```

## Skip and Focus

```typescript
// Skip tests
it.skip('should be skipped', () => {})
xtest('also skipped', () => {})
describe.skip('skip entire suite', () => {})

// Focus tests (only run these)
it.only('only this runs', () => {})
fit('also only this', () => {})
describe.only('only this suite', () => {})

// Conditional skip
const isCI = process.env.CI === 'true'
it.skipIf(isCI)('skip on CI', () => {})
it.runIf(!isCI)('run only locally', () => {})
```

## Test Utilities

### Expect Utilities

```typescript
// Asymmetric matchers
expect(obj).toEqual({
  name: expect.any(String),
  id: expect.stringMatching(/^[a-z0-9-]+$/),
  items: expect.arrayContaining([{ id: 1 }]),
  meta: expect.objectContaining({ version: 2 }),
})

// Assertions count
expect.assertions(2)  // Exactly 2 assertions
expect.hasAssertions() // At least 1 assertion
```

### Fake Timers

```typescript
describe('Timer', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should call callback after delay', () => {
    const callback = jest.fn()

    setTimeout(callback, 1000)

    expect(callback).not.toHaveBeenCalled()
    jest.advanceTimersByTime(1000)
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('should run all timers', () => {
    const callback = jest.fn()

    setInterval(callback, 100)
    jest.runOnlyPendingTimers() // Run current timers only
    // or
    jest.runAllTimers()         // Run all (careful with intervals)
  })
})
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
