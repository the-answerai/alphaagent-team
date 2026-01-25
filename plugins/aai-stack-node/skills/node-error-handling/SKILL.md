---
name: node-error-handling
description: Node.js error handling patterns
user-invocable: false
---

# Node.js Error Handling Skill

Patterns for error handling in Node.js applications.

## Error Classes

### Custom Error Classes

```typescript
// Base application error
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(message: string, public fields: Record<string, string>) {
    super(message, 'VALIDATION_ERROR', 400)
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403)
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}
```

### Error with Context

```typescript
class ContextualError extends Error {
  public context: Record<string, any>

  constructor(
    message: string,
    context: Record<string, any> = {},
    public cause?: Error
  ) {
    super(message)
    this.name = 'ContextualError'
    this.context = context
  }

  static wrap(error: Error, context: Record<string, any>): ContextualError {
    return new ContextualError(error.message, context, error)
  }
}

// Usage
throw ContextualError.wrap(dbError, {
  operation: 'createUser',
  userId: '123',
})
```

## Async Error Handling

### Express Error Middleware

```typescript
// Async handler wrapper
const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id)
  if (!user) throw new NotFoundError('User')
  res.json(user)
}))

// Error middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    code: err.code,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Handle operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err instanceof ValidationError && { fields: err.fields }),
      },
    })
  }

  // Unknown errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  })
}

app.use(errorHandler)
```

### Promise Rejection Handling

```typescript
// Unhandled rejection handler
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  console.error('Unhandled Rejection:', reason)
  // Optionally exit
  process.exit(1)
})

// Uncaught exception handler
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  // Must exit - process is in undefined state
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully')
  await server.close()
  await database.disconnect()
  process.exit(0)
})
```

## Error Boundaries

### Try-Catch Patterns

```typescript
// With cleanup
async function withResource<T>(fn: (resource: Resource) => Promise<T>): Promise<T> {
  const resource = await acquireResource()
  try {
    return await fn(resource)
  } finally {
    await resource.release()
  }
}

// Multiple operations
async function transactionalOperation() {
  const tx = await db.beginTransaction()
  try {
    await tx.query('INSERT INTO users ...')
    await tx.query('INSERT INTO profiles ...')
    await tx.commit()
  } catch (error) {
    await tx.rollback()
    throw error
  }
}

// Partial success handling
async function processItems(items: Item[]): Promise<{
  successful: Result[]
  failed: Array<{ item: Item; error: Error }>
}> {
  const successful: Result[] = []
  const failed: Array<{ item: Item; error: Error }> = []

  for (const item of items) {
    try {
      const result = await processItem(item)
      successful.push(result)
    } catch (error) {
      failed.push({ item, error: error as Error })
    }
  }

  return { successful, failed }
}
```

## Result Type Pattern

### Result Type

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

function ok<T>(data: T): Result<T, never> {
  return { success: true, data }
}

function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

// Usage
async function parseJSON<T>(text: string): Result<T, SyntaxError> {
  try {
    return ok(JSON.parse(text))
  } catch (error) {
    return err(error as SyntaxError)
  }
}

const result = await parseJSON<User>(text)
if (result.success) {
  console.log('User:', result.data)
} else {
  console.error('Parse error:', result.error)
}
```

### Either Type

```typescript
class Either<L, R> {
  private constructor(
    private readonly left: L | null,
    private readonly right: R | null
  ) {}

  static left<L, R>(value: L): Either<L, R> {
    return new Either(value, null)
  }

  static right<L, R>(value: R): Either<L, R> {
    return new Either(null, value)
  }

  isLeft(): boolean {
    return this.left !== null
  }

  isRight(): boolean {
    return this.right !== null
  }

  map<T>(fn: (value: R) => T): Either<L, T> {
    if (this.isRight()) {
      return Either.right(fn(this.right!))
    }
    return Either.left(this.left!)
  }

  getOrElse(defaultValue: R): R {
    return this.isRight() ? this.right! : defaultValue
  }
}
```

## Logging Errors

### Structured Error Logging

```typescript
import pino from 'pino'

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
})

function logError(error: Error, context: Record<string, any> = {}) {
  logger.error({
    err: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error instanceof AppError && {
        code: error.code,
        isOperational: error.isOperational,
      }),
    },
    ...context,
  })
}

// Usage
try {
  await riskyOperation()
} catch (error) {
  logError(error as Error, {
    operation: 'riskyOperation',
    userId: user.id,
  })
  throw error
}
```

## Validation

### Input Validation

```typescript
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional(),
})

function validateUser(data: unknown): User {
  const result = userSchema.safeParse(data)

  if (!result.success) {
    const fields: Record<string, string> = {}
    result.error.errors.forEach((err) => {
      fields[err.path.join('.')] = err.message
    })
    throw new ValidationError('Invalid user data', fields)
  }

  return result.data
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
