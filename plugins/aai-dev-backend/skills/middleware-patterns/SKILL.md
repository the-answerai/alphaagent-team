---
name: middleware-patterns
description: Patterns for designing and implementing Express middleware
user-invocable: false
---

# Middleware Patterns Skill

Patterns for designing reusable middleware in Express applications.

## Middleware Basics

```typescript
import { Request, Response, NextFunction } from 'express';

// Basic middleware signature
type Middleware = (req: Request, res: Response, next: NextFunction) => void | Promise<void>;

// Middleware types
// 1. Application-level: app.use(middleware)
// 2. Router-level: router.use(middleware)
// 3. Route-level: app.get('/path', middleware, handler)
// 4. Error-handling: (err, req, res, next) => {}
```

## Common Middleware Patterns

### Request Logging

```typescript
function requestLogger(options: { level?: string } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.log({
        level: options.level || 'info',
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userAgent: req.get('user-agent'),
      });
    });

    next();
  };
}

app.use(requestLogger());
```

### Request ID

```typescript
import { v4 as uuid } from 'uuid';

function requestId() {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.headers['x-request-id'] as string || uuid();
    req.id = id;
    res.setHeader('X-Request-ID', id);
    next();
  };
}

// Extend Request type
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
```

### Response Time

```typescript
function responseTime() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = process.hrtime();

    res.on('finish', () => {
      const [seconds, nanoseconds] = process.hrtime(start);
      const ms = seconds * 1000 + nanoseconds / 1000000;
      res.setHeader('X-Response-Time', `${ms.toFixed(2)}ms`);
    });

    next();
  };
}
```

### Validation Middleware

```typescript
import { z } from 'zod';

interface ValidationSchemas {
  body?: z.ZodSchema;
  query?: z.ZodSchema;
  params?: z.ZodSchema;
}

function validate(schemas: ValidationSchemas) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
        });
      }
      next(error);
    }
  };
}

// Usage
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

app.post('/users',
  validate({ body: createUserSchema }),
  userController.create
);
```

### Authentication

```typescript
interface AuthOptions {
  required?: boolean;
  roles?: string[];
}

function authenticate(options: AuthOptions = { required: true }) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      if (options.required) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        });
      }
      return next();
    }

    try {
      const payload = verifyToken(token);
      const user = await userService.findById(payload.userId);

      if (!user) {
        return res.status(401).json({
          error: { code: 'UNAUTHORIZED', message: 'User not found' },
        });
      }

      // Check roles if specified
      if (options.roles && !options.roles.includes(user.role)) {
        return res.status(403).json({
          error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
        });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid token' },
      });
    }
  };
}

// Usage
app.get('/profile', authenticate(), profileController.get);
app.get('/admin', authenticate({ roles: ['admin'] }), adminController.dashboard);
```

### Rate Limiting

```typescript
interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

function rateLimit(options: RateLimitOptions) {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator?.(req) || req.ip;
    const now = Date.now();

    const record = requests.get(key);

    if (!record || now > record.resetTime) {
      requests.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    if (record.count >= options.max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: options.message || 'Too many requests',
          retryAfter,
        },
      });
    }

    record.count++;
    next();
  };
}
```

### Caching

```typescript
interface CacheOptions {
  ttl: number;
  key?: (req: Request) => string;
}

function cache(options: CacheOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = options.key?.(req) || `cache:${req.originalUrl}`;

    try {
      const cached = await redis.get(key);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json to cache response
      res.json = (body: any) => {
        redis.setex(key, options.ttl, JSON.stringify(body));
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    } catch (error) {
      next(); // Fail open - continue without cache
    }
  };
}

// Usage
app.get('/products', cache({ ttl: 300 }), productController.list);
```

### Request Timeout

```typescript
function timeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(503).json({
          error: { code: 'TIMEOUT', message: 'Request timeout' },
        });
      }
    }, ms);

    res.on('finish', () => clearTimeout(timer));
    next();
  };
}

app.use(timeout(30000)); // 30 second timeout
```

## Middleware Organization

```typescript
// middleware/index.ts
export { requestId } from './requestId';
export { requestLogger } from './requestLogger';
export { authenticate } from './authenticate';
export { validate } from './validate';
export { rateLimit } from './rateLimit';
export { errorHandler } from './errorHandler';

// app.ts
import * as middleware from './middleware';

// Order matters!
app.use(middleware.requestId());
app.use(middleware.requestLogger());
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Error handler last
app.use(middleware.errorHandler());
```

## Conditional Middleware

```typescript
function conditionalMiddleware(
  condition: (req: Request) => boolean,
  middleware: Middleware
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return middleware(req, res, next);
    }
    next();
  };
}

// Only authenticate API routes
app.use(conditionalMiddleware(
  (req) => req.path.startsWith('/api'),
  authenticate()
));
```

## Composing Middleware

```typescript
function compose(...middlewares: Middleware[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const dispatch = (index: number): void => {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index];
      middleware(req, res, (err?: any) => {
        if (err) return next(err);
        dispatch(index + 1);
      });
    };

    dispatch(0);
  };
}

// Usage
const secureRoute = compose(
  authenticate(),
  rateLimit({ windowMs: 60000, max: 10 }),
  validate({ body: schema })
);

app.post('/sensitive', secureRoute, handler);
```

## Integration

Used by:
- `backend-developer` agent
- Express/Node.js stack skills
