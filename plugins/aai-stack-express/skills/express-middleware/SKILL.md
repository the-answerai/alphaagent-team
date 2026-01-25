---
name: express-middleware
description: Express.js middleware patterns and implementation
user-invocable: false
---

# Express Middleware Skill

Patterns for creating and using middleware in Express.js.

## Middleware Basics

### Middleware Structure

```typescript
import { Request, Response, NextFunction } from 'express'

// Basic middleware
function middleware(req: Request, res: Response, next: NextFunction) {
  // Do something
  next()  // Pass to next middleware
}

// Middleware with error
function middlewareWithError(req: Request, res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next(new Error('No authorization header'))
  }
  next()
}

// Async middleware
async function asyncMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await fetchSomething()
    req.data = data
    next()
  } catch (error) {
    next(error)
  }
}
```

### Middleware Order

```typescript
import express from 'express'

const app = express()

// Order matters! Middleware runs top to bottom

// 1. Body parsing (run early)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 2. Logging (run early)
app.use(morgan('dev'))

// 3. Security headers
app.use(helmet())

// 4. CORS
app.use(cors())

// 5. Authentication (before routes)
app.use(authenticate)

// 6. Routes
app.use('/api', routes)

// 7. 404 handler (after routes)
app.use(notFoundHandler)

// 8. Error handler (last)
app.use(errorHandler)
```

## Request Processing

### Request Logging

```typescript
function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now()

  // Log on response finish
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })
  })

  next()
}
```

### Request ID

```typescript
import { v4 as uuid } from 'uuid'

function requestId(req: Request, res: Response, next: NextFunction) {
  const id = req.headers['x-request-id'] || uuid()
  req.id = id as string
  res.setHeader('X-Request-ID', id)
  next()
}
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)

// Different limits for different routes
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
})

app.use('/api/auth/login', strictLimiter)
```

## Validation

### Body Validation

```typescript
import { z } from 'zod'

function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      })
    }

    req.body = result.data
    next()
  }
}

// Usage
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

router.post('/users', validateBody(createUserSchema), createUser)
```

### Query Validation

```typescript
function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        details: result.error.flatten().fieldErrors,
      })
    }

    req.query = result.data
    next()
  }
}

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['asc', 'desc']).default('desc'),
})

router.get('/posts', validateQuery(paginationSchema), listPosts)
```

## Authentication

### JWT Authentication

```typescript
import jwt from 'jsonwebtoken'

interface JWTPayload {
  userId: string
  email: string
  role: string
}

function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' })
  }

  const token = authHeader.substring(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// Optional authentication
function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next()  // Continue without user
  }

  const token = authHeader.substring(7)

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    req.user = payload
  } catch (error) {
    // Invalid token, continue without user
  }

  next()
}
```

### Role-Based Access

```typescript
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

// Usage
router.delete('/users/:id', authenticate, requireRole('admin'), deleteUser)
router.get('/reports', authenticate, requireRole('admin', 'manager'), getReports)
```

## Error Handling

### Error Handler

```typescript
import { Request, Response, NextFunction } from 'express'

interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: unknown
}

function errorHandler(
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  })

  const statusCode = error.statusCode || 500
  const code = error.code || 'INTERNAL_ERROR'

  res.status(statusCode).json({
    error: {
      code,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  })
}
```

### Async Handler Wrapper

```typescript
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Usage
router.get('/users', asyncHandler(async (req, res) => {
  const users = await userService.findAll()
  res.json({ data: users })
}))
```

### 404 Handler

```typescript
function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  })
}

// Use after all routes
app.use(notFoundHandler)
```

## Response Helpers

### Response Wrapper

```typescript
function wrapResponse(req: Request, res: Response, next: NextFunction) {
  res.success = function(data: unknown, status = 200) {
    return this.status(status).json({ success: true, data })
  }

  res.error = function(message: string, status = 400, code?: string) {
    return this.status(status).json({
      success: false,
      error: { code, message },
    })
  }

  next()
}

// Extend Response type
declare global {
  namespace Express {
    interface Response {
      success(data: unknown, status?: number): Response
      error(message: string, status?: number, code?: string): Response
    }
  }
}

// Usage
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id)
  if (!user) {
    return res.error('User not found', 404, 'USER_NOT_FOUND')
  }
  res.success(user)
}))
```

## Middleware Factory

```typescript
interface MiddlewareOptions {
  logger?: boolean
  cache?: number
  transform?: (data: unknown) => unknown
}

function createMiddleware(options: MiddlewareOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (options.logger) {
      console.log(`${req.method} ${req.path}`)
    }

    if (options.cache) {
      res.setHeader('Cache-Control', `max-age=${options.cache}`)
    }

    if (options.transform) {
      const originalJson = res.json.bind(res)
      res.json = (data) => originalJson(options.transform!(data))
    }

    next()
  }
}

// Usage
app.use(createMiddleware({ logger: true, cache: 3600 }))
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
