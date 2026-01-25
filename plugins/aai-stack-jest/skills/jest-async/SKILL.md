---
name: jest-async
description: Jest async testing patterns
user-invocable: false
---

# Jest Async Testing Skill

Patterns for testing asynchronous code in Jest.

## Async/Await

### Basic Async Tests

```typescript
// Async function test
test('fetches user data', async () => {
  const user = await fetchUser('1')
  expect(user.name).toBe('John')
})

// Return promise
test('fetches user data', () => {
  return fetchUser('1').then(user => {
    expect(user.name).toBe('John')
  })
})
```

### Async Assertions

```typescript
// Resolves
test('resolves to user', async () => {
  await expect(fetchUser('1')).resolves.toEqual({
    id: '1',
    name: 'John',
  })
})

// Rejects
test('rejects with error', async () => {
  await expect(fetchUser('invalid')).rejects.toThrow('Not found')
})

test('rejects with specific error', async () => {
  await expect(fetchUser('invalid')).rejects.toMatchObject({
    code: 'NOT_FOUND',
    message: 'User not found',
  })
})
```

### Multiple Async Operations

```typescript
test('processes multiple items', async () => {
  const results = await Promise.all([
    processItem('a'),
    processItem('b'),
    processItem('c'),
  ])

  expect(results).toHaveLength(3)
  expect(results.every(r => r.success)).toBe(true)
})

test('handles parallel requests', async () => {
  const [user, posts] = await Promise.all([
    fetchUser('1'),
    fetchPosts('1'),
  ])

  expect(user.id).toBe('1')
  expect(posts).toHaveLength(10)
})
```

## Callbacks

### Done Callback

```typescript
test('calls callback with data', done => {
  function callback(data) {
    try {
      expect(data).toBe('result')
      done()
    } catch (error) {
      done(error)
    }
  }

  fetchDataWithCallback(callback)
})
```

### Converting Callbacks to Promises

```typescript
// Utility for callback-based APIs
function promisify<T>(fn: (callback: (err: Error | null, data: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })
}

test('converts callback to promise', async () => {
  const data = await promisify(cb => readFile('test.txt', cb))
  expect(data).toBeDefined()
})
```

## Timers

### Fake Timers

```typescript
describe('Timer functions', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('setTimeout', () => {
    const callback = jest.fn()

    setTimeout(callback, 1000)

    expect(callback).not.toHaveBeenCalled()

    jest.advanceTimersByTime(1000)

    expect(callback).toHaveBeenCalledTimes(1)
  })

  test('setInterval', () => {
    const callback = jest.fn()

    setInterval(callback, 100)

    jest.advanceTimersByTime(250)

    expect(callback).toHaveBeenCalledTimes(2)
  })
})
```

### Timer Control Methods

```typescript
// Advance by specific time
jest.advanceTimersByTime(1000)

// Run only pending timers (not new ones scheduled)
jest.runOnlyPendingTimers()

// Run all timers (careful with intervals)
jest.runAllTimers()

// Run next scheduled timer
jest.runNextTimer()

// Get count of pending timers
jest.getTimerCount()

// Clear all timers
jest.clearAllTimers()
```

### Async with Timers

```typescript
test('debounce function', async () => {
  jest.useFakeTimers()

  const callback = jest.fn()
  const debounced = debounce(callback, 100)

  debounced()
  debounced()
  debounced()

  expect(callback).not.toHaveBeenCalled()

  jest.advanceTimersByTime(100)

  expect(callback).toHaveBeenCalledTimes(1)

  jest.useRealTimers()
})

test('polling function', async () => {
  jest.useFakeTimers()

  const checkStatus = jest.fn()
    .mockResolvedValueOnce('pending')
    .mockResolvedValueOnce('pending')
    .mockResolvedValueOnce('complete')

  const promise = pollUntilComplete(checkStatus, 100)

  // Wait for each poll cycle
  await jest.advanceTimersByTimeAsync(100)
  await jest.advanceTimersByTimeAsync(100)
  await jest.advanceTimersByTimeAsync(100)

  const result = await promise
  expect(result).toBe('complete')

  jest.useRealTimers()
})
```

## Event Emitters

### Testing Events

```typescript
import { EventEmitter } from 'events'

test('emits events', done => {
  const emitter = new EventEmitter()

  emitter.on('data', data => {
    expect(data).toBe('test')
    done()
  })

  emitter.emit('data', 'test')
})

// Promise-based
test('waits for event', async () => {
  const emitter = new EventEmitter()

  const eventPromise = new Promise(resolve => {
    emitter.once('complete', resolve)
  })

  // Trigger after delay
  setTimeout(() => emitter.emit('complete', 'done'), 100)

  jest.useFakeTimers()
  jest.advanceTimersByTime(100)
  jest.useRealTimers()

  const result = await eventPromise
  expect(result).toBe('done')
})
```

## Streams

### Testing Readable Streams

```typescript
import { Readable } from 'stream'

test('reads stream data', async () => {
  const chunks: Buffer[] = []

  const stream = Readable.from(['hello', ' ', 'world'])

  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk))
  }

  expect(Buffer.concat(chunks).toString()).toBe('hello world')
})
```

### Testing Writable Streams

```typescript
import { Writable, PassThrough } from 'stream'

test('writes to stream', done => {
  const chunks: string[] = []

  const writable = new Writable({
    write(chunk, encoding, callback) {
      chunks.push(chunk.toString())
      callback()
    },
  })

  writable.on('finish', () => {
    expect(chunks).toEqual(['hello', 'world'])
    done()
  })

  writable.write('hello')
  writable.write('world')
  writable.end()
})
```

## Retry and Polling

### Testing Retry Logic

```typescript
test('retries on failure', async () => {
  const operation = jest.fn()
    .mockRejectedValueOnce(new Error('fail'))
    .mockRejectedValueOnce(new Error('fail'))
    .mockResolvedValueOnce('success')

  const result = await retryOperation(operation, { retries: 3 })

  expect(result).toBe('success')
  expect(operation).toHaveBeenCalledTimes(3)
})
```

### Testing Polling

```typescript
test('polls until condition met', async () => {
  jest.useFakeTimers()

  let callCount = 0
  const checkFn = jest.fn(async () => {
    callCount++
    return callCount >= 3 ? { status: 'ready' } : { status: 'pending' }
  })

  const promise = pollUntil(checkFn, result => result.status === 'ready', {
    interval: 100,
    timeout: 1000,
  })

  await jest.advanceTimersByTimeAsync(300)

  const result = await promise
  expect(result.status).toBe('ready')
  expect(checkFn).toHaveBeenCalledTimes(3)

  jest.useRealTimers()
})
```

## Timeouts

### Test Timeout

```typescript
// Increase timeout for slow tests
test('slow operation', async () => {
  const result = await slowOperation()
  expect(result).toBeDefined()
}, 10000)  // 10 second timeout

// Configure in describe block
describe('slow tests', () => {
  jest.setTimeout(30000)  // 30 seconds for all tests

  test('very slow', async () => {
    // ...
  })
})
```

### Timeout Assertions

```typescript
test('operation times out', async () => {
  const operation = new Promise(resolve => {
    setTimeout(resolve, 5000)
  })

  jest.useFakeTimers()

  const timeoutPromise = Promise.race([
    operation,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 1000)
    ),
  ])

  jest.advanceTimersByTime(1000)

  await expect(timeoutPromise).rejects.toThrow('Timeout')

  jest.useRealTimers()
})
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
