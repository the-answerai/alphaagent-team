---
name: node-performance
description: Node.js performance optimization patterns
user-invocable: false
---

# Node.js Performance Skill

Patterns for optimizing Node.js application performance.

## Memory Management

### Heap Snapshots

```typescript
import v8 from 'v8'
import fs from 'fs'

// Take heap snapshot
function takeHeapSnapshot(filename: string): void {
  const snapshotStream = v8.writeHeapSnapshot(filename)
  console.log(`Heap snapshot written to ${snapshotStream}`)
}

// Expose via endpoint
app.get('/debug/heap', (req, res) => {
  const filename = `/tmp/heap-${Date.now()}.heapsnapshot`
  takeHeapSnapshot(filename)
  res.download(filename)
})

// Memory usage
function getMemoryUsage(): object {
  const usage = process.memoryUsage()
  return {
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB',
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
  }
}
```

### Avoiding Memory Leaks

```typescript
// BAD: Growing array
const cache: any[] = []
function addToCache(item: any) {
  cache.push(item)  // Never cleared
}

// GOOD: LRU cache with limit
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 500,              // Max items
  maxSize: 50 * 1024 * 1024,  // 50MB
  sizeCalculation: (value) => JSON.stringify(value).length,
  ttl: 1000 * 60 * 5,    // 5 minutes
})

// BAD: Event listener leak
class Service {
  constructor(emitter: EventEmitter) {
    emitter.on('data', this.handleData.bind(this))
    // Never removed
  }
}

// GOOD: Cleanup listeners
class Service {
  private handler: (data: any) => void

  constructor(private emitter: EventEmitter) {
    this.handler = this.handleData.bind(this)
    emitter.on('data', this.handler)
  }

  destroy() {
    this.emitter.off('data', this.handler)
  }
}
```

## CPU Optimization

### Worker Threads

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import os from 'os'

if (isMainThread) {
  // Main thread
  const numCPUs = os.cpus().length

  async function runTask<T>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: data,
      })

      worker.on('message', resolve)
      worker.on('error', reject)
      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker exited with code ${code}`))
        }
      })
    })
  }

  // Run CPU-intensive tasks in parallel
  const results = await Promise.all(
    items.map(item => runTask(item))
  )
} else {
  // Worker thread
  const result = heavyComputation(workerData)
  parentPort?.postMessage(result)
}
```

### Worker Pool

```typescript
import { Worker } from 'worker_threads'
import os from 'os'

class WorkerPool {
  private workers: Worker[] = []
  private freeWorkers: Worker[] = []
  private queue: Array<{
    data: any
    resolve: (value: any) => void
    reject: (error: Error) => void
  }> = []

  constructor(private workerScript: string, size = os.cpus().length) {
    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerScript)
      this.workers.push(worker)
      this.freeWorkers.push(worker)
    }
  }

  exec<T>(data: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const worker = this.freeWorkers.pop()

      if (worker) {
        this.runWorker(worker, data, resolve, reject)
      } else {
        this.queue.push({ data, resolve, reject })
      }
    })
  }

  private runWorker(
    worker: Worker,
    data: any,
    resolve: (value: any) => void,
    reject: (error: Error) => void
  ) {
    const onMessage = (result: any) => {
      cleanup()
      resolve(result)
      this.releaseWorker(worker)
    }

    const onError = (error: Error) => {
      cleanup()
      reject(error)
      this.releaseWorker(worker)
    }

    const cleanup = () => {
      worker.off('message', onMessage)
      worker.off('error', onError)
    }

    worker.on('message', onMessage)
    worker.on('error', onError)
    worker.postMessage(data)
  }

  private releaseWorker(worker: Worker) {
    const next = this.queue.shift()
    if (next) {
      this.runWorker(worker, next.data, next.resolve, next.reject)
    } else {
      this.freeWorkers.push(worker)
    }
  }

  destroy() {
    for (const worker of this.workers) {
      worker.terminate()
    }
  }
}
```

## Caching

### In-Memory Caching

```typescript
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, any>({
  max: 1000,
  ttl: 1000 * 60 * 10,  // 10 minutes
})

async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = cache.get(key)
  if (cached !== undefined) {
    return cached as T
  }

  const data = await fetcher()
  cache.set(key, data)
  return data
}

// Memoization
function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyFn: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args)
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyFn(...args)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result = fn(...args)
    cache.set(key, result)
    return result
  }) as T
}
```

### Redis Caching

```typescript
import Redis from 'ioredis'

const redis = new Redis()

async function cacheWithRedis<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  const data = await fetcher()
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
  return data
}

// Cache-aside pattern
class CacheAside {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key)
    return data ? JSON.parse(data) : null
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached) return cached

    const data = await fetcher()
    await this.set(key, data, ttl)
    return data
  }
}
```

## Connection Pooling

### Database Pool

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20,              // Max connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Measure pool usage
setInterval(() => {
  console.log({
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  })
}, 10000)

// Use pool
const result = await pool.query('SELECT * FROM users')
```

### HTTP Agent Pool

```typescript
import http from 'http'
import https from 'https'

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
})

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 100,
})

// Use with fetch
const response = await fetch(url, {
  agent: url.startsWith('https') ? httpsAgent : httpAgent,
})
```

## Profiling

### CPU Profiling

```typescript
import { Session } from 'inspector'
import fs from 'fs'

async function profileCPU(
  fn: () => Promise<void>,
  outputFile: string
): Promise<void> {
  const session = new Session()
  session.connect()

  await new Promise<void>((resolve) => {
    session.post('Profiler.enable', () => {
      session.post('Profiler.start', () => resolve())
    })
  })

  await fn()

  const profile = await new Promise<object>((resolve) => {
    session.post('Profiler.stop', (err, { profile }) => {
      resolve(profile)
    })
  })

  fs.writeFileSync(outputFile, JSON.stringify(profile))
  session.disconnect()
}
```

### Benchmarking

```typescript
function benchmark(name: string, fn: () => void, iterations = 1000): void {
  // Warmup
  for (let i = 0; i < 100; i++) fn()

  const start = process.hrtime.bigint()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const end = process.hrtime.bigint()

  const totalMs = Number(end - start) / 1_000_000
  const avgMs = totalMs / iterations
  const opsPerSec = Math.round(1000 / avgMs)

  console.log(`${name}: ${avgMs.toFixed(3)}ms/op (${opsPerSec} ops/sec)`)
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
