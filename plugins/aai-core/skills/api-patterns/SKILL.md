---
name: api-patterns
description: REST API best practices including request validation, error handling, authentication, rate limiting, and documentation. Use when building backend APIs.
---

# API Patterns Skill

## Quick Reference

**Use when**: Building REST APIs, implementing authentication, handling errors, validating inputs

**Key Patterns**:
- Request validation
- Standardized error responses
- Authentication middleware
- Rate limiting
- Pagination
- API documentation

---

## 1. Request Validation

**Always validate incoming requests at the boundary.**

Pattern with schema validation:
```typescript
// Define schema for expected input
const CreateUserSchema = {
  email: 'string, email format, required',
  password: 'string, min 12 chars, required',
  name: 'string, 2-100 chars, required',
  age: 'number, integer, min 18, optional'
};

// Validate in route handler
function createUserHandler(req, res) {
  const validation = validateSchema(CreateUserSchema, req.body);

  if (!validation.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: validation.errors
    });
  }

  // Proceed with validated data
  const user = await createUser(validation.data);
  res.status(201).json(user);
}
```

**Key Points**:
- Validate at API boundary, not deep in business logic
- Return specific error messages
- Use 400 status code for validation failures

---

## 2. Standardized Error Responses

**Use consistent error format across all endpoints.**

```typescript
// Error response structure
interface ErrorResponse {
  error: string;        // Human-readable message
  code?: string;        // Machine-readable error code
  details?: unknown;    // Additional context (validation errors, etc.)
}

// Custom error class
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// Usage
throw new AppError('User not found', 404, 'USER_NOT_FOUND');
throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors);
```

**Error Handler Pattern**:
```typescript
function errorHandler(err, req, res, next) {
  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details
    });
  }

  // Log unexpected errors (don't expose to user)
  console.error('Unexpected error:', err);

  res.status(500).json({
    error: 'Internal server error'
  });
}
```

---

## 3. Authentication Middleware

**Protect routes with authentication middleware.**

```typescript
// Auth middleware pattern
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError('Authentication required', 401, 'NO_TOKEN');
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
  }
}

// Optional auth (for routes that work with or without auth)
function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.userId;
    } catch {
      // Ignore invalid tokens in optional auth
    }
  }

  next();
}

// Usage
router.get('/api/profile', requireAuth, getProfileHandler);
router.get('/api/posts', optionalAuth, getPostsHandler);
```

---

## 4. Rate Limiting

**Protect endpoints from abuse.**

```typescript
// General rate limit
const generalLimiter = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests per window
};

// Strict limit for auth endpoints
const authLimiter = {
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,                     // Only 5 attempts
  skipSuccessfulRequests: true
};

// Apply to routes
app.use('/api/', rateLimitMiddleware(generalLimiter));
router.post('/api/auth/login', rateLimitMiddleware(authLimiter), loginHandler);
```

---

## 5. Pagination

**Standard pagination for list endpoints.**

```typescript
// Pagination parameters
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

// Response format
function paginatedResponse(data, total, page, limit) {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1
    }
  };
}

// Usage in handler
async function listUsersHandler(req, res) {
  const { page, limit, offset } = parsePagination(req.query);

  const [users, total] = await Promise.all([
    db.users.findMany({ skip: offset, take: limit }),
    db.users.count()
  ]);

  res.json(paginatedResponse(users, total, page, limit));
}
```

---

## 6. API Response Format

**Use consistent response structure.**

```typescript
// Success response
{
  data: T,                    // The requested resource(s)
  meta?: {
    pagination?: {...},       // For lists
    timestamp: string         // ISO timestamp
  }
}

// Error response
{
  error: string,              // Human-readable message
  code?: string,              // Machine-readable code
  details?: unknown           // Additional context
}
```

---

## 7. HTTP Status Codes

Use appropriate status codes:

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate, etc.) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Unexpected server error |

---

## 8. RESTful Resource Naming

Follow conventions:
- `GET /api/resources` - List all (with pagination)
- `GET /api/resources/:id` - Get one
- `POST /api/resources` - Create new
- `PUT /api/resources/:id` - Replace entirely
- `PATCH /api/resources/:id` - Partial update
- `DELETE /api/resources/:id` - Delete

Nested resources:
- `GET /api/users/:userId/posts` - User's posts
- `POST /api/users/:userId/posts` - Create post for user

---

## Checklist for New Endpoints

- [ ] Input validation with schema
- [ ] Authentication check (if protected)
- [ ] Authorization check (if resource-specific)
- [ ] Rate limiting configured
- [ ] Error handling with appropriate codes
- [ ] Consistent response format
- [ ] Pagination for lists
- [ ] Documentation/comments
- [ ] Tests covering success and error cases
