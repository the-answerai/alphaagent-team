---
name: express-error-handling
description: Error handling patterns for Express.js applications
user-invocable: false
---

# Express Error Handling Skill

Patterns for comprehensive error handling in Express.js.

## Error Class Hierarchy

### Base Application Error

```typescript
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}
```

### Specific Error Classes

```typescript
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with ID ${id} not found`
      : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
  }
}

export class ValidationError extends AppError {
  public readonly details: Record<string, string[]>

  constructor(message: string, details: Record<string, string[]> = {}) {
    super(message, 400, 'VALIDATION_ERROR')
    this.details = details
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
    this.retryAfter = retryAfter
  }
}
```

## Error Handler Middleware

### Main Error Handler

```typescript
import { Request, Response, NextFunction } from 'express'

interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: unknown
    stack?: string
  }
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  console.error({
    timestamp: new Date().toISOString(),
    requestId: req.id,
    path: req.path,
    method: req.method,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  })

  // Handle AppError
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
      },
    }

    if (error instanceof ValidationError) {
      response.error.details = error.details
    }

    if (error instanceof RateLimitError) {
      res.setHeader('Retry-After', error.retryAfter)
    }

    if (process.env.NODE_ENV === 'development') {
      response.error.stack = error.stack
    }

    return res.status(error.statusCode).json(response)
  }

  // Handle unexpected errors
  const response: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : error.message,
    },
  }

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = error.stack
  }

  res.status(500).json(response)
}
```

### Async Handler Wrapper

```typescript
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>

export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id)
  if (!user) {
    throw new NotFoundError('User', req.params.id)
  }
  res.json({ data: user })
}))
```

## Error Handling Patterns

### Controller Error Handling

```typescript
// Without asyncHandler
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.findById(req.params.id)
    if (!user) {
      throw new NotFoundError('User', req.params.id)
    }
    res.json({ data: user })
  } catch (error) {
    next(error)
  }
}

// With asyncHandler
export const getUser = asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id)
  if (!user) {
    throw new NotFoundError('User', req.params.id)
  }
  res.json({ data: user })
})
```

### Service Error Handling

```typescript
export class UserService {
  async findById(id: string): Promise<User> {
    const user = await this.repository.findById(id)
    if (!user) {
      throw new NotFoundError('User', id)
    }
    return user
  }

  async create(data: CreateUserInput): Promise<User> {
    // Check for duplicate email
    const existing = await this.repository.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('Email already in use')
    }

    try {
      return await this.repository.create(data)
    } catch (error) {
      // Handle database-specific errors
      if (isDuplicateKeyError(error)) {
        throw new ConflictError('User already exists')
      }
      throw error
    }
  }
}
```

## Database Error Handling

### Prisma Errors

```typescript
import { Prisma } from '@prisma/client'

function handlePrismaError(error: unknown): AppError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        const field = (error.meta?.target as string[])?.[0] || 'field'
        return new ConflictError(`${field} already exists`)
      case 'P2025':
        return new NotFoundError('Record')
      case 'P2003':
        return new ValidationError('Invalid reference')
      default:
        return new AppError('Database error', 500, 'DATABASE_ERROR')
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return new ValidationError('Invalid data format')
  }

  throw error
}

// Usage in service
async function createUser(data: CreateUserInput): Promise<User> {
  try {
    return await prisma.user.create({ data })
  } catch (error) {
    throw handlePrismaError(error)
  }
}
```

## Not Found Handler

```typescript
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
}

// Register after all routes
app.use(notFoundHandler)
```

## Unhandled Rejection Handler

```typescript
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('Unhandled Rejection:', reason)
  // Optionally send to error tracking service
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error)
  // Perform graceful shutdown
  process.exit(1)
})
```

## Error Logging

### Structured Logging

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
})

export function errorLogger(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logger.error({
    message: error.message,
    stack: error.stack,
    request: {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type'],
      },
    },
    user: req.user?.id,
    requestId: req.id,
  })

  next(error)
}

// Use before error handler
app.use(errorLogger)
app.use(errorHandler)
```

## Graceful Shutdown

```typescript
import http from 'http'

const server = http.createServer(app)

function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`)

  server.close(() => {
    console.log('HTTP server closed')

    // Close database connections
    prisma.$disconnect().then(() => {
      console.log('Database connection closed')
      process.exit(0)
    })
  })

  // Force shutdown after timeout
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
