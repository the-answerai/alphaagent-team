---
name: node-async-patterns
description: Node.js async/await patterns
user-invocable: false
---

# Node.js Async Patterns Skill

Patterns for asynchronous programming in Node.js.

## Promise Patterns

### Creating Promises

```typescript
// Basic promise
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Promise with value
function fetchData(): Promise<Data> {
  return new Promise((resolve, reject) => {
    // async operation
    if (success) {
      resolve(data)
    } else {
      reject(new Error('Failed'))
    }
  })
}

// Promisifying callbacks
import { promisify } from 'util'
import { readFile } from 'fs'

const readFileAsync = promisify(readFile)
const content = await readFileAsync('file.txt', 'utf8')
```

### Promise Combinators

```typescript
// All (parallel, all must succeed)
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
])

// All with error handling
const results = await Promise.allSettled([
  fetchUsers(),
  fetchPosts(),
  fetchComments(),
])

results.forEach((result, i) => {
  if (result.status === 'fulfilled') {
    console.log(`Result ${i}:`, result.value)
  } else {
    console.error(`Error ${i}:`, result.reason)
  }
})

// Race (first to complete)
const result = await Promise.race([
  fetchFromServer1(),
  fetchFromServer2(),
])

// Any (first to succeed)
const result = await Promise.any([
  fetchFromServer1(),
  fetchFromServer2(),
])
```

### Promise Utilities

```typescript
// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), ms)
  )
  return Promise.race([promise, timeout])
}

// Retry wrapper
async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await new Promise(r => setTimeout(r, delay * Math.pow(2, i)))
    }
  }
  throw new Error('Should not reach')
}

// Usage
const data = await retry(() => fetchData(), 3, 1000)
```

## Async/Await Patterns

### Sequential Execution

```typescript
async function processItems(items: Item[]): Promise<Result[]> {
  const results: Result[] = []
  for (const item of items) {
    const result = await processItem(item)
    results.push(result)
  }
  return results
}
```

### Parallel Execution

```typescript
// Parallel with Promise.all
async function processItems(items: Item[]): Promise<Result[]> {
  return Promise.all(items.map(item => processItem(item)))
}

// Parallel with concurrency limit
async function processWithLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = []
  const executing: Promise<void>[] = []

  for (const item of items) {
    const p = fn(item).then(result => {
      results.push(result)
    })

    executing.push(p)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(
        executing.findIndex(e => e === p),
        1
      )
    }
  }

  await Promise.all(executing)
  return results
}
```

### Error Handling

```typescript
// Try-catch with async
async function fetchWithFallback(): Promise<Data> {
  try {
    return await fetchFromPrimary()
  } catch (err) {
    console.error('Primary failed:', err)
    return await fetchFromFallback()
  }
}

// Error aggregation
async function fetchAll(): Promise<Result[]> {
  const results = await Promise.allSettled([
    fetch1(),
    fetch2(),
    fetch3(),
  ])

  const errors = results
    .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
    .map(r => r.reason)

  if (errors.length) {
    console.error('Some requests failed:', errors)
  }

  return results
    .filter((r): r is PromiseFulfilledResult<Result> => r.status === 'fulfilled')
    .map(r => r.value)
}
```

## Event Loop Patterns

### Yielding to Event Loop

```typescript
// Allow other tasks to run
function setImmediatePromise(): Promise<void> {
  return new Promise(resolve => setImmediate(resolve))
}

async function processLargeArray(items: Item[]): Promise<void> {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i])

    // Yield every 100 items
    if (i % 100 === 0) {
      await setImmediatePromise()
    }
  }
}
```

### Batching

```typescript
class Batcher<T, R> {
  private queue: Array<{
    item: T
    resolve: (value: R) => void
    reject: (error: Error) => void
  }> = []
  private timer: NodeJS.Timeout | null = null

  constructor(
    private batchFn: (items: T[]) => Promise<R[]>,
    private maxSize: number = 10,
    private delay: number = 10
  ) {}

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push({ item, resolve, reject })

      if (this.queue.length >= this.maxSize) {
        this.flush()
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flush(), this.delay)
      }
    })
  }

  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const batch = this.queue.splice(0)
    if (batch.length === 0) return

    try {
      const results = await this.batchFn(batch.map(b => b.item))
      batch.forEach((b, i) => b.resolve(results[i]))
    } catch (err) {
      batch.forEach(b => b.reject(err as Error))
    }
  }
}
```

## Async Iterators

### Creating Async Iterators

```typescript
async function* generateNumbers(max: number): AsyncGenerator<number> {
  for (let i = 0; i < max; i++) {
    await delay(100)
    yield i
  }
}

// Usage
for await (const num of generateNumbers(5)) {
  console.log(num)
}
```

### Transforming Async Iterators

```typescript
async function* map<T, R>(
  iterable: AsyncIterable<T>,
  fn: (item: T) => R | Promise<R>
): AsyncGenerator<R> {
  for await (const item of iterable) {
    yield await fn(item)
  }
}

async function* filter<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => boolean | Promise<boolean>
): AsyncGenerator<T> {
  for await (const item of iterable) {
    if (await predicate(item)) {
      yield item
    }
  }
}

// Usage
const doubled = map(generateNumbers(5), n => n * 2)
const evens = filter(doubled, n => n % 2 === 0)

for await (const num of evens) {
  console.log(num)
}
```

## Queue Patterns

### Simple Queue

```typescript
class AsyncQueue<T> {
  private queue: T[] = []
  private waiting: ((item: T) => void)[] = []

  push(item: T): void {
    const waiter = this.waiting.shift()
    if (waiter) {
      waiter(item)
    } else {
      this.queue.push(item)
    }
  }

  async pop(): Promise<T> {
    const item = this.queue.shift()
    if (item !== undefined) {
      return item
    }
    return new Promise(resolve => {
      this.waiting.push(resolve)
    })
  }
}
```

### Worker Pool

```typescript
class WorkerPool<T, R> {
  private queue: Array<() => Promise<void>> = []
  private running = 0

  constructor(private concurrency: number) {}

  async execute(fn: () => Promise<R>): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn())
        } catch (err) {
          reject(err)
        }
      })
      this.runNext()
    })
  }

  private async runNext(): Promise<void> {
    if (this.running >= this.concurrency) return
    const task = this.queue.shift()
    if (!task) return

    this.running++
    await task()
    this.running--
    this.runNext()
  }
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
