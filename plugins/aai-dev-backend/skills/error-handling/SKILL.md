---
name: error-handling
description: Patterns for consistent error handling in backend applications
user-invocable: false
---

# Error Handling Skill

Patterns for implementing robust error handling in backend applications.

## Error Class Hierarchy

```typescript
// Base application error
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public isOperational = true,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

// Specific error types
class ValidationError extends AppError {
  constructor(details: Record<string, string[]>) {
    super(400, 'Validation failed', 'VALIDATION_ERROR', true, details);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(404, message, 'NOT_FOUND', true);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, message, 'UNAUTHORIZED', true);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(403, message, 'FORBIDDEN', true);
  }
}

class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message, 'CONFLICT', true);
  }
}

class RateLimitError extends AppError {
  constructor(retryAfter: number) {
    super(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED', true, { retryAfter });
  }
}

class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR', false);
  }
}
```

## Error Handler Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    requestId?: string;
  };
}

function errorHandler(
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) {
  // Generate request ID for tracking
  const requestId = req.headers['x-request-id'] || generateRequestId();

  // Log error
  if (err instanceof AppError && err.isOperational) {
    logger.warn({
      type: 'operational_error',
      requestId,
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.error({
      type: 'unexpected_error',
      requestId,
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      ...err.toJSON(),
      error: {
        ...err.toJSON().error,
        requestId,
      },
    });
  }

  // Handle known library errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid authentication token',
        requestId,
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Authentication token has expired',
        requestId,
      },
    });
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;

    if (prismaError.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'A record with this value already exists',
          requestId,
        },
      });
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Record not found',
          requestId,
        },
      });
    }
  }

  // Generic error (don't expose details in production)
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
      requestId,
    },
  });
}

export { errorHandler };
```

## Async Handler Wrapper

```typescript
// Wrap async route handlers to catch errors
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Usage
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await userService.findById(req.params.id);

  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }

  res.json({ data: user });
}));
```

## Validation Error Handling

```typescript
import { z } from 'zod';

function validateRequest(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const details: Record<string, string[]> = {};

        error.errors.forEach((err) => {
          const path = err.path.join('.');
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(err.message);
        });

        throw new ValidationError(details);
      }
      next(error);
    }
  };
}
```

## Error Response Format

```typescript
// Standard error response
interface ErrorResponse {
  error: {
    code: string;        // Machine-readable error code
    message: string;     // Human-readable message
    details?: {          // Optional validation details
      [field: string]: string[];
    };
    requestId?: string;  // For support/debugging
  };
}

// Examples
// 400 Bad Request
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid email format"],
      "password": ["Must be at least 8 characters"]
    },
    "requestId": "req_abc123"
  }
}

// 404 Not Found
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User with id 'xyz' not found",
    "requestId": "req_abc123"
  }
}

// 401 Unauthorized
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required",
    "requestId": "req_abc123"
  }
}
```

## Logging Best Practices

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty' }
    : undefined,
});

// Request logging middleware
function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || generateRequestId();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info({
      type: 'http_request',
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      userId: req.user?.id,
    });
  });

  next();
}
```

## Graceful Shutdown

```typescript
function setupGracefulShutdown(server: http.Server) {
  const shutdown = async (signal: string) => {
    logger.info({ type: 'shutdown', signal }, 'Received shutdown signal');

    // Stop accepting new connections
    server.close(() => {
      logger.info('HTTP server closed');
    });

    // Close database connections
    await prisma.$disconnect();
    logger.info('Database connections closed');

    // Close Redis
    await redisClient.quit();
    logger.info('Redis connection closed');

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.fatal({ type: 'uncaught_exception', error }, 'Uncaught exception');
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ type: 'unhandled_rejection', reason }, 'Unhandled rejection');
    process.exit(1);
  });
}
```

## Integration

Used by:
- `backend-developer` agent
- All backend stack skills
