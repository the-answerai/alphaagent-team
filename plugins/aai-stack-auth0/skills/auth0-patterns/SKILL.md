---
name: auth0-patterns
description: Auth0 integration patterns
user-invocable: false
---

# Auth0 Patterns Skill

Common patterns for Auth0 authentication integration.

## Core Concepts

### Configuration

```typescript
// Environment variables
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-api-identifier
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_SECRET=a-long-random-secret-for-session-encryption
```

### Token Types

```
ID Token: Contains user identity claims (for client)
Access Token: Used to call protected APIs
Refresh Token: Used to get new access tokens
```

## Machine-to-Machine Auth

### Getting Access Token

```typescript
import { AuthenticationClient } from 'auth0'

const auth0 = new AuthenticationClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
})

async function getM2MToken(): Promise<string> {
  const response = await auth0.clientCredentialsGrant({
    audience: process.env.AUTH0_AUDIENCE,
  })
  return response.access_token
}
```

### Token Caching

```typescript
class TokenManager {
  private token: string | null = null
  private expiresAt: number = 0

  async getToken(): Promise<string> {
    if (this.token && Date.now() < this.expiresAt - 60000) {
      return this.token
    }

    const response = await auth0.clientCredentialsGrant({
      audience: process.env.AUTH0_AUDIENCE,
    })

    this.token = response.access_token
    this.expiresAt = Date.now() + (response.expires_in * 1000)

    return this.token
  }
}
```

## User Management

### Management API

```typescript
import { ManagementClient } from 'auth0'

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_M2M_CLIENT_ID,
  clientSecret: process.env.AUTH0_M2M_CLIENT_SECRET,
})

// Get user
const user = await management.users.get({ id: 'auth0|123' })

// Update user
await management.users.update(
  { id: 'auth0|123' },
  {
    name: 'John Doe',
    user_metadata: { preferences: { theme: 'dark' } },
  }
)

// Create user
const newUser = await management.users.create({
  connection: 'Username-Password-Authentication',
  email: 'new@example.com',
  password: 'SecurePassword123!',
  email_verified: true,
})

// Delete user
await management.users.delete({ id: 'auth0|123' })

// Get user roles
const roles = await management.users.getRoles({ id: 'auth0|123' })

// Assign roles
await management.users.assignRoles(
  { id: 'auth0|123' },
  { roles: ['rol_admin'] }
)
```

### Organization Management

```typescript
// Create organization
const org = await management.organizations.create({
  name: 'acme-corp',
  display_name: 'Acme Corporation',
})

// Add member
await management.organizations.addMembers(
  { id: org.id },
  { members: ['auth0|123'] }
)

// Get organization members
const members = await management.organizations.getMembers({ id: org.id })

// Assign roles in organization
await management.organizations.addMemberRoles(
  { id: org.id, user_id: 'auth0|123' },
  { roles: ['org_admin'] }
)
```

## Token Validation

### JWT Verification

```typescript
import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'

const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  cache: true,
  rateLimit: true,
})

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

async function verifyToken(token: string): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}/`,
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) reject(err)
        else resolve(decoded as jwt.JwtPayload)
      }
    )
  })
}
```

### Using jose

```typescript
import { createRemoteJWKSet, jwtVerify } from 'jose'

const JWKS = createRemoteJWKSet(
  new URL(`https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`)
)

async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://${process.env.AUTH0_DOMAIN}/`,
    audience: process.env.AUTH0_AUDIENCE,
  })
  return payload
}
```

## Custom Claims

### Adding Claims via Action

```javascript
// Auth0 Dashboard > Actions > Library > Custom

exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://myapp.com'

  // Add user roles
  const roles = event.authorization?.roles || []
  api.accessToken.setCustomClaim(`${namespace}/roles`, roles)

  // Add organization
  if (event.organization) {
    api.accessToken.setCustomClaim(`${namespace}/org_id`, event.organization.id)
    api.accessToken.setCustomClaim(`${namespace}/org_name`, event.organization.name)
  }

  // Add user metadata
  const { user } = event
  api.idToken.setCustomClaim(`${namespace}/user_id`, user.user_id)
  api.idToken.setCustomClaim(`${namespace}/email_verified`, user.email_verified)
}
```

### Reading Claims

```typescript
interface Auth0Claims {
  sub: string
  'https://myapp.com/roles': string[]
  'https://myapp.com/org_id'?: string
}

function extractClaims(token: string): Auth0Claims {
  const decoded = jwt.decode(token) as Auth0Claims
  return {
    sub: decoded.sub,
    roles: decoded['https://myapp.com/roles'] || [],
    orgId: decoded['https://myapp.com/org_id'],
  }
}
```

## RBAC

### Permission Checks

```typescript
// Middleware for Express
function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.auth?.permissions || []

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Missing permission: ${permission}`,
      })
    }

    next()
  }
}

// Usage
app.delete(
  '/users/:id',
  requireAuth,
  requirePermission('delete:users'),
  deleteUser
)
```

### Role-Based Access

```typescript
function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRoles = req.auth?.['https://myapp.com/roles'] || []

    const hasRole = roles.some(role => userRoles.includes(role))

    if (!hasRole) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Requires one of: ${roles.join(', ')}`,
      })
    }

    next()
  }
}

// Usage
app.get('/admin', requireAuth, requireRole('admin', 'superadmin'), adminDashboard)
```

## Error Handling

```typescript
// Common Auth0 errors
interface Auth0Error {
  statusCode: number
  error: string
  message: string
  errorCode: string
}

function handleAuth0Error(error: any): never {
  if (error.statusCode === 401) {
    throw new UnauthorizedError('Invalid or expired token')
  }

  if (error.statusCode === 403) {
    throw new ForbiddenError('Insufficient permissions')
  }

  if (error.errorCode === 'invalid_grant') {
    throw new UnauthorizedError('Invalid refresh token')
  }

  throw new Error(error.message || 'Authentication failed')
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
