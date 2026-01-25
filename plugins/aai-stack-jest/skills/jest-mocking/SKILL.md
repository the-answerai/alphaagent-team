---
name: jest-mocking
description: Jest mocking patterns and techniques
user-invocable: false
---

# Jest Mocking Skill

Patterns for mocking in Jest tests.

## Function Mocks

### Creating Mocks

```typescript
// Basic mock function
const mockFn = jest.fn()

// With implementation
const mockFn = jest.fn((x) => x + 1)

// With return value
const mockFn = jest.fn().mockReturnValue(42)

// With different return values
const mockFn = jest.fn()
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(99)  // Default after exhausted

// Async return
const mockFn = jest.fn().mockResolvedValue({ id: 1 })
const mockFn = jest.fn().mockRejectedValue(new Error('fail'))
```

### Mock Implementations

```typescript
// Replace implementation
const mockFn = jest.fn()
  .mockImplementation((a, b) => a + b)

// Different implementation each call
const mockFn = jest.fn()
  .mockImplementationOnce(() => 'first')
  .mockImplementationOnce(() => 'second')
  .mockImplementation(() => 'default')

// Access call arguments in implementation
const mockFn = jest.fn((callback) => callback('result'))
```

### Mock Assertions

```typescript
const mockFn = jest.fn()

// Call assertions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(2)
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
expect(mockFn).toHaveBeenLastCalledWith('final')
expect(mockFn).toHaveBeenNthCalledWith(1, 'first')

// Return assertions
expect(mockFn).toHaveReturnedWith(value)
expect(mockFn).toHaveLastReturnedWith(value)

// Access mock data
expect(mockFn.mock.calls).toEqual([['arg1'], ['arg2']])
expect(mockFn.mock.results[0].value).toBe('result')
expect(mockFn.mock.instances).toHaveLength(1)
```

## Module Mocks

### Auto Mocking

```typescript
// Mock entire module
jest.mock('./userService')

import { createUser, findUser } from './userService'

// All exports are now mock functions
(createUser as jest.Mock).mockResolvedValue({ id: 1 })

test('uses mocked module', async () => {
  const user = await createUser({ name: 'John' })
  expect(user).toEqual({ id: 1 })
})
```

### Partial Mocking

```typescript
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),  // Keep original
  formatDate: jest.fn(() => '2024-01-01'),  // Mock specific
}))

import { formatDate, formatNumber } from './utils'

test('formatDate is mocked', () => {
  expect(formatDate()).toBe('2024-01-01')  // Mocked
})

test('formatNumber is real', () => {
  expect(formatNumber(1000)).toBe('1,000')  // Original
})
```

### Factory Functions

```typescript
// Mock with factory
jest.mock('./config', () => ({
  __esModule: true,
  default: {
    apiUrl: 'http://test.api',
    timeout: 1000,
  },
  getConfig: jest.fn(() => ({ debug: true })),
}))
```

### Manual Mocks

```typescript
// Create __mocks__/axios.ts
const mockAxios = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  create: jest.fn(() => mockAxios),
}

export default mockAxios

// In test file
jest.mock('axios')
import axios from 'axios'

test('uses mock axios', async () => {
  (axios.get as jest.Mock).mockResolvedValue({ data: { id: 1 } })

  const response = await axios.get('/users/1')
  expect(response.data).toEqual({ id: 1 })
})
```

## Class Mocks

### Mocking Classes

```typescript
// userService.ts
export class UserService {
  async create(data: UserData): Promise<User> { ... }
  async find(id: string): Promise<User> { ... }
}

// test file
jest.mock('./userService')

import { UserService } from './userService'

const MockUserService = UserService as jest.MockedClass<typeof UserService>

beforeEach(() => {
  MockUserService.mockClear()
})

test('uses mocked class', async () => {
  const mockCreate = jest.fn().mockResolvedValue({ id: '1' })
  MockUserService.prototype.create = mockCreate

  const service = new UserService()
  const user = await service.create({ name: 'John' })

  expect(user).toEqual({ id: '1' })
  expect(mockCreate).toHaveBeenCalledWith({ name: 'John' })
})
```

### Mocking Constructors

```typescript
jest.mock('./Logger', () => {
  return jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  }))
})
```

## Spying

### Spy on Methods

```typescript
const video = {
  play() { return true },
  pause() { return false },
}

// Spy without changing implementation
const playSpy = jest.spyOn(video, 'play')

video.play()

expect(playSpy).toHaveBeenCalled()
expect(video.play()).toBe(true)  // Original still works

playSpy.mockRestore()  // Restore original
```

### Spy with Mock Implementation

```typescript
const api = {
  fetchUser(id: string) { /* real implementation */ }
}

const spy = jest.spyOn(api, 'fetchUser')
  .mockResolvedValue({ id: '1', name: 'John' })

const user = await api.fetchUser('1')
expect(user.name).toBe('John')

spy.mockRestore()  // Restore original
```

### Spy on Getters/Setters

```typescript
const obj = {
  _value: 0,
  get value() { return this._value },
  set value(v) { this._value = v },
}

const getSpy = jest.spyOn(obj, 'value', 'get').mockReturnValue(42)
expect(obj.value).toBe(42)

const setSpy = jest.spyOn(obj, 'value', 'set')
obj.value = 100
expect(setSpy).toHaveBeenCalledWith(100)
```

## Mock Utilities

### Clearing and Resetting

```typescript
const mockFn = jest.fn()

// Clear call history (keeps implementation)
mockFn.mockClear()
jest.clearAllMocks()

// Reset to initial state (no implementation)
mockFn.mockReset()
jest.resetAllMocks()

// Restore original implementation (for spies)
mockFn.mockRestore()
jest.restoreAllMocks()
```

### Mock Names

```typescript
const mockFn = jest.fn().mockName('myMockFunction')

// Better error messages
expect(mockFn).toHaveBeenCalled()
// Error: expect(myMockFunction).toHaveBeenCalled()
```

## Advanced Patterns

### Mocking Node Modules

```typescript
// __mocks__/fs.ts
export const readFileSync = jest.fn()
export const writeFileSync = jest.fn()

// test file
jest.mock('fs')

import { readFileSync } from 'fs'

test('reads file', () => {
  (readFileSync as jest.Mock).mockReturnValue('content')
  expect(readFileSync('test.txt')).toBe('content')
})
```

### Mocking Date

```typescript
const mockDate = new Date('2024-01-15T12:00:00Z')

beforeAll(() => {
  jest.useFakeTimers()
  jest.setSystemTime(mockDate)
})

afterAll(() => {
  jest.useRealTimers()
})

test('uses mocked date', () => {
  expect(new Date().toISOString()).toBe('2024-01-15T12:00:00.000Z')
  expect(Date.now()).toBe(mockDate.getTime())
})
```

### Mocking Environment Variables

```typescript
const originalEnv = process.env

beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
})

afterAll(() => {
  process.env = originalEnv
})

test('uses env variable', () => {
  process.env.API_URL = 'http://test.api'

  const { config } = require('./config')
  expect(config.apiUrl).toBe('http://test.api')
})
```

### Mocking Fetch

```typescript
global.fetch = jest.fn()

beforeEach(() => {
  (fetch as jest.Mock).mockClear()
})

test('fetches data', async () => {
  (fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: async () => ({ id: 1, name: 'John' }),
  })

  const response = await fetch('/api/users/1')
  const data = await response.json()

  expect(data).toEqual({ id: 1, name: 'John' })
  expect(fetch).toHaveBeenCalledWith('/api/users/1')
})
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
