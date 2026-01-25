---
name: api-design
description: Patterns for designing RESTful and GraphQL APIs
user-invocable: false
---

# API Design Skill

Patterns for designing clean, consistent, and developer-friendly APIs.

## REST API Design

### URL Structure

```
# Collection endpoints
GET    /api/v1/users           # List users
POST   /api/v1/users           # Create user

# Resource endpoints
GET    /api/v1/users/:id       # Get user
PUT    /api/v1/users/:id       # Update user
DELETE /api/v1/users/:id       # Delete user

# Nested resources
GET    /api/v1/users/:id/posts # Get user's posts
POST   /api/v1/users/:id/posts # Create post for user

# Actions (when CRUD doesn't fit)
POST   /api/v1/users/:id/activate
POST   /api/v1/orders/:id/cancel
```

### HTTP Methods

| Method | Usage | Idempotent | Safe |
|--------|-------|------------|------|
| GET | Read resource | Yes | Yes |
| POST | Create resource | No | No |
| PUT | Replace resource | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |

### Status Codes

```typescript
// Success
200 OK              // Successful GET, PUT, PATCH, DELETE
201 Created         // Successful POST (resource created)
204 No Content      // Successful DELETE (no body)

// Redirection
301 Moved Permanently
304 Not Modified    // Cache valid

// Client Errors
400 Bad Request     // Invalid input
401 Unauthorized    // Not authenticated
403 Forbidden       // Not authorized
404 Not Found       // Resource doesn't exist
409 Conflict        // State conflict (duplicate)
422 Unprocessable   // Validation failed
429 Too Many Requests // Rate limited

// Server Errors
500 Internal Error  // Unexpected error
502 Bad Gateway     // Upstream error
503 Unavailable     // Temporarily down
```

### Request/Response Format

```typescript
// Standard response envelope
interface ApiResponse<T> {
  data: T;
  meta?: {
    pagination?: Pagination;
    timestamp: string;
  };
}

// List response with pagination
interface ListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Error response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

### Query Parameters

```
# Pagination
GET /api/v1/users?page=1&limit=20

# Filtering
GET /api/v1/users?status=active&role=admin

# Sorting
GET /api/v1/users?sort=createdAt&order=desc

# Field selection
GET /api/v1/users?fields=id,name,email

# Search
GET /api/v1/users?q=john

# Complex filters
GET /api/v1/products?price[gte]=10&price[lte]=100
GET /api/v1/orders?createdAt[gte]=2024-01-01
```

### Versioning

```typescript
// URL versioning (recommended)
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// Header versioning
// Accept: application/vnd.myapp.v1+json

// Query parameter
// GET /api/users?version=1
```

## GraphQL Design

### Schema Design

```graphql
type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: PaginationInput): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): CreateUserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UpdateUserPayload!
  deleteUser(id: ID!): DeleteUserPayload!
}

type User {
  id: ID!
  email: String!
  name: String!
  posts(first: Int, after: String): PostConnection!
  createdAt: DateTime!
}

input CreateUserInput {
  email: String!
  name: String!
  password: String!
}

type CreateUserPayload {
  user: User
  errors: [Error!]
}

type Error {
  field: String
  message: String!
}
```

### Pagination (Relay-style)

```graphql
type UserConnection {
  edges: [UserEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type UserEdge {
  node: User!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### Error Handling

```graphql
# Return errors in payload, not as GraphQL errors
type CreateUserPayload {
  user: User
  userErrors: [UserError!]!
}

type UserError {
  field: [String!]
  message: String!
  code: ErrorCode!
}

enum ErrorCode {
  INVALID_INPUT
  NOT_FOUND
  UNAUTHORIZED
  CONFLICT
}
```

## API Documentation

### OpenAPI (Swagger)

```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0

paths:
  /users:
    get:
      summary: List users
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserListResponse'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string
      required:
        - id
        - email
        - name
```

## Rate Limiting

```typescript
// Express rate limiter
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

// Per-user rate limiting
const userLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
});
```

## Caching

```typescript
// Cache headers
res.set({
  'Cache-Control': 'public, max-age=300', // 5 minutes
  'ETag': generateETag(data),
});

// Conditional requests
app.get('/users/:id', (req, res) => {
  const user = getUser(req.params.id);
  const etag = generateETag(user);

  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }

  res.set('ETag', etag);
  res.json({ data: user });
});
```

## Integration

Used by:
- `backend-developer` agent
- Express/Node.js stack skills
