---
name: node-streams
description: Node.js stream patterns
user-invocable: false
---

# Node.js Streams Skill

Patterns for working with Node.js streams.

## Stream Types

### Readable Streams

```typescript
import { Readable } from 'stream'
import { createReadStream } from 'fs'

// File read stream
const fileStream = createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024,  // 64KB chunks
})

// Event-based reading
fileStream.on('data', (chunk) => {
  console.log('Received chunk:', chunk.length)
})

fileStream.on('end', () => {
  console.log('Stream ended')
})

fileStream.on('error', (err) => {
  console.error('Error:', err)
})

// Async iteration (preferred)
async function readFile() {
  for await (const chunk of fileStream) {
    console.log('Chunk:', chunk)
  }
}
```

### Writable Streams

```typescript
import { Writable } from 'stream'
import { createWriteStream } from 'fs'

// File write stream
const writeStream = createWriteStream('output.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024,
})

writeStream.write('Hello ')
writeStream.write('World\n')
writeStream.end()

// Handle backpressure
const ok = writeStream.write(data)
if (!ok) {
  // Wait for drain before writing more
  await new Promise(resolve => writeStream.once('drain', resolve))
}

// With pipeline
import { pipeline } from 'stream/promises'
await pipeline(
  readStream,
  writeStream
)
```

### Transform Streams

```typescript
import { Transform } from 'stream'

// Custom transform
const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    this.push(chunk.toString().toUpperCase())
    callback()
  },
})

// Usage
createReadStream('input.txt')
  .pipe(upperCase)
  .pipe(createWriteStream('output.txt'))
```

### Duplex Streams

```typescript
import { Duplex } from 'stream'

const duplex = new Duplex({
  read(size) {
    // Generate data to read
    this.push('data')
    this.push(null)  // End
  },
  write(chunk, encoding, callback) {
    // Handle written data
    console.log('Received:', chunk.toString())
    callback()
  },
})
```

## Custom Streams

### Custom Readable

```typescript
import { Readable } from 'stream'

class Counter extends Readable {
  private current = 0
  private max: number

  constructor(max: number) {
    super({ objectMode: true })
    this.max = max
  }

  _read() {
    if (this.current < this.max) {
      this.push(this.current++)
    } else {
      this.push(null)
    }
  }
}

// Usage
const counter = new Counter(5)
for await (const num of counter) {
  console.log(num)  // 0, 1, 2, 3, 4
}
```

### Custom Writable

```typescript
import { Writable } from 'stream'

class LogWriter extends Writable {
  private buffer: string[] = []

  _write(chunk: Buffer, encoding: string, callback: () => void) {
    this.buffer.push(chunk.toString())
    if (this.buffer.length >= 10) {
      this.flush()
    }
    callback()
  }

  _final(callback: () => void) {
    this.flush()
    callback()
  }

  private flush() {
    console.log('Flushing:', this.buffer.join('\n'))
    this.buffer = []
  }
}
```

### Custom Transform

```typescript
import { Transform, TransformCallback } from 'stream'

class JSONParser extends Transform {
  constructor() {
    super({ objectMode: true })
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
    try {
      const data = JSON.parse(chunk.toString())
      this.push(data)
      callback()
    } catch (err) {
      callback(err as Error)
    }
  }
}

// Usage with async
class AsyncTransform extends Transform {
  constructor() {
    super({ objectMode: true })
  }

  async _transform(chunk: any, encoding: string, callback: TransformCallback) {
    try {
      const result = await processAsync(chunk)
      this.push(result)
      callback()
    } catch (err) {
      callback(err as Error)
    }
  }
}
```

## Pipeline

### Using Pipeline

```typescript
import { pipeline } from 'stream/promises'
import { createReadStream, createWriteStream } from 'fs'
import { createGzip } from 'zlib'

// Pipeline with error handling
await pipeline(
  createReadStream('input.txt'),
  createGzip(),
  createWriteStream('output.txt.gz')
)
```

### Pipeline with Transforms

```typescript
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'

const filter = new Transform({
  objectMode: true,
  transform(data, encoding, callback) {
    if (data.active) {
      this.push(data)
    }
    callback()
  },
})

const format = new Transform({
  objectMode: true,
  transform(data, encoding, callback) {
    this.push(JSON.stringify(data) + '\n')
    callback()
  },
})

await pipeline(
  dataSource,
  filter,
  format,
  createWriteStream('output.jsonl')
)
```

## Backpressure

### Handling Backpressure

```typescript
import { Readable, Writable } from 'stream'

async function writeWithBackpressure(readable: Readable, writable: Writable) {
  for await (const chunk of readable) {
    const ok = writable.write(chunk)
    if (!ok) {
      await new Promise(resolve => writable.once('drain', resolve))
    }
  }
  writable.end()
}

// Or with highWaterMark
const slowWriter = new Writable({
  highWaterMark: 1024,  // Small buffer = more frequent backpressure
  write(chunk, encoding, callback) {
    // Slow operation
    setTimeout(callback, 100)
  },
})
```

## Object Mode

### Object Streams

```typescript
import { Transform, Readable } from 'stream'

// Readable in object mode
const objectReadable = new Readable({
  objectMode: true,
  read() {
    this.push({ id: 1, name: 'Item 1' })
    this.push({ id: 2, name: 'Item 2' })
    this.push(null)
  },
})

// Transform in object mode
const mapper = new Transform({
  objectMode: true,
  transform(obj, encoding, callback) {
    this.push({
      ...obj,
      processed: true,
    })
    callback()
  },
})

// Collect objects
const objects: any[] = []
for await (const obj of objectReadable.pipe(mapper)) {
  objects.push(obj)
}
```

## Utilities

### stream/consumers

```typescript
import { text, json, buffer, arrayBuffer } from 'stream/consumers'

// Read entire stream as text
const content = await text(createReadStream('file.txt'))

// Read as JSON
const data = await json(createReadStream('data.json'))

// Read as Buffer
const buf = await buffer(createReadStream('file.bin'))
```

### stream/promises

```typescript
import { finished, pipeline } from 'stream/promises'

// Wait for stream to finish
const stream = createWriteStream('output.txt')
stream.write('data')
stream.end()
await finished(stream)

// Pipeline with cleanup
try {
  await pipeline(source, destination)
} catch (err) {
  console.error('Pipeline failed:', err)
}
```

### PassThrough

```typescript
import { PassThrough } from 'stream'

// Fork a stream
const source = createReadStream('data.txt')
const fork1 = new PassThrough()
const fork2 = new PassThrough()

source.pipe(fork1)
source.pipe(fork2)

// Process independently
fork1.pipe(createWriteStream('copy1.txt'))
fork2.pipe(createGzip()).pipe(createWriteStream('copy2.txt.gz'))
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
