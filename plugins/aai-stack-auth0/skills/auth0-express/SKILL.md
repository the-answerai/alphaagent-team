---
name: auth0-express
description: Auth0 integration with Express.js
user-invocable: false
---

# Auth0 Express Skill

Patterns for integrating Auth0 with Express.js applications.

## Setup

### Installation

```bash
npm install express-oauth2-jwt-bearer
# or for session-based
npm install express-openid-connect
```

### Configuration

```typescript
// Environment variables
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=your-api-audience
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_BASE_URL=http://localhost:3000
AUTH0_SECRET=session-encryption-secret
```

## JWT Authentication (API)

### Basic Setup

```typescript
import { auth, requiredScopes } from 'express-oauth2-jwt-bearer'
import express from 'express'

const app = express()

// JWT validation middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256',
})

// Public route
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public endpoint' })
})

// Protected route
app.get('/api/private', jwtCheck, (req, res) => {
  res.json({
    message: 'Protected endpoint',
    user: req.auth?.payload,
  })
})

// Route requiring specific scope
app.get(
  '/api/admin',
  jwtCheck,
  requiredScopes('admin:read'),
  (req, res) => {
    res.json({ message: 'Admin data' })
  }
)
```

### Custom Claims Access

```typescript
interface Auth0Payload {
  sub: string
  'https://myapp.com/roles': string[]
  'https://myapp.com/org_id'?: string
  permissions?: string[]
}

declare global {
  namespace Express {
    interface Request {
      auth?: {
        payload: Auth0Payload
        token: string
      }
    }
  }
}

app.get('/api/user-info', jwtCheck, (req, res) => {
  const userId = req.auth?.payload.sub
  const roles = req.auth?.payload['https://myapp.com/roles'] || []
  const orgId = req.auth?.payload['https://myapp.com/org_id']

  res.json({ userId, roles, orgId })
})
```

### Permission Middleware

```typescript
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.auth?.payload.permissions || []

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        error: 'insufficient_permissions',
        message: `Missing permission: ${permission}`,
      })
    }

    next()
  }
}

// Usage
app.delete(
  '/api/users/:id',
  jwtCheck,
  requirePermission('delete:users'),
  async (req, res) => {
    await deleteUser(req.params.id)
    res.status(204).send()
  }
)
```

### Role-Based Access

```typescript
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.auth?.payload['https://myapp.com/roles'] || []

    const hasRole = roles.some(role => userRoles.includes(role))

    if (!hasRole) {
      return res.status(403).json({
        error: 'insufficient_role',
        message: `Requires one of: ${roles.join(', ')}`,
      })
    }

    next()
  }
}

app.get('/api/admin/stats', jwtCheck, requireRole('admin'), getStats)
```

## Session-Based Authentication

### Setup with express-openid-connect

```typescript
import { auth, requiresAuth } from 'express-openid-connect'

const app = express()

app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  })
)

// Public route
app.get('/', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
})

// Protected route
app.get('/profile', requiresAuth(), (req, res) => {
  res.json(req.oidc.user)
})

// Login/logout routes are automatic:
// /login
// /logout
// /callback
```

### Custom Login Options

```typescript
import { auth, requiresAuth } from 'express-openid-connect'

app.use(
  auth({
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,

    // Custom routes
    routes: {
      login: '/auth/login',
      logout: '/auth/logout',
      callback: '/auth/callback',
    },

    // Authorization params
    authorizationParams: {
      response_type: 'code',
      scope: 'openid profile email',
      audience: process.env.AUTH0_AUDIENCE,
    },

    // Session configuration
    session: {
      absoluteDuration: 60 * 60 * 24,  // 24 hours
      rolling: true,
    },
  })
)
```

### Getting Access Token

```typescript
app.get('/api/external', requiresAuth(), async (req, res) => {
  try {
    const { access_token } = await req.oidc.accessToken.refresh()

    const response = await fetch(`${process.env.API_URL}/data`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    res.json(await response.json())
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})
```

## Error Handling

```typescript
import {
  InvalidTokenError,
  UnauthorizedError,
  InsufficientScopeError,
} from 'express-oauth2-jwt-bearer'

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof InvalidTokenError) {
    return res.status(401).json({
      error: 'invalid_token',
      message: 'The access token is invalid',
    })
  }

  if (err instanceof UnauthorizedError) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'No authorization token was found',
    })
  }

  if (err instanceof InsufficientScopeError) {
    return res.status(403).json({
      error: 'insufficient_scope',
      message: `Required scope: ${err.requiredScopes}`,
    })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})
```

## Multi-Tenancy

### Organization Validation

```typescript
function requireOrganization() {
  return (req: Request, res: Response, next: NextFunction) => {
    const orgId = req.auth?.payload['https://myapp.com/org_id']

    if (!orgId) {
      return res.status(403).json({
        error: 'no_organization',
        message: 'User must belong to an organization',
      })
    }

    // Add to request for use in handlers
    req.organizationId = orgId
    next()
  }
}

// Usage
app.get('/api/org/data', jwtCheck, requireOrganization(), async (req, res) => {
  const data = await getOrgData(req.organizationId)
  res.json(data)
})
```

### Scoped Data Access

```typescript
app.get('/api/resources', jwtCheck, async (req, res) => {
  const userId = req.auth?.payload.sub
  const orgId = req.auth?.payload['https://myapp.com/org_id']

  // Query scoped by organization
  const resources = await db.resources.findMany({
    where: {
      organizationId: orgId,
      // Optionally filter by user
      ...(req.query.mine && { userId }),
    },
  })

  res.json(resources)
})
```

## Testing

### Mock JWT Middleware

```typescript
// test/helpers/auth.ts
export function mockAuth(payload: Partial<Auth0Payload> = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.auth = {
      payload: {
        sub: 'auth0|test123',
        'https://myapp.com/roles': ['user'],
        permissions: [],
        ...payload,
      },
      token: 'mock-token',
    }
    next()
  }
}

// In tests
jest.mock('express-oauth2-jwt-bearer', () => ({
  auth: () => mockAuth({ permissions: ['read:data'] }),
}))
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
