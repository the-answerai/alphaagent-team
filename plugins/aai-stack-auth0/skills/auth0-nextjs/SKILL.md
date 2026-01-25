---
name: auth0-nextjs
description: Auth0 integration with Next.js
user-invocable: false
---

# Auth0 Next.js Skill

Patterns for integrating Auth0 with Next.js applications.

## Setup

### Installation

```bash
npm install @auth0/nextjs-auth0
```

### Configuration

```typescript
// .env.local
AUTH0_SECRET=use-openssl-rand-base64-32
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_AUDIENCE=your-api-audience  # Optional
```

### API Route Handler

```typescript
// app/api/auth/[auth0]/route.ts
import { handleAuth } from '@auth0/nextjs-auth0'

export const GET = handleAuth()

// With custom handlers
export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email',
    },
    returnTo: '/dashboard',
  }),
  callback: handleCallback({
    afterCallback: async (req, session) => {
      // Custom logic after login
      await createUserIfNotExists(session.user)
      return session
    },
  }),
  logout: handleLogout({
    returnTo: '/',
  }),
})
```

## Client-Side Auth

### UserProvider

```tsx
// app/layout.tsx
import { UserProvider } from '@auth0/nextjs-auth0/client'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  )
}
```

### useUser Hook

```tsx
'use client'

import { useUser } from '@auth0/nextjs-auth0/client'

export default function Profile() {
  const { user, error, isLoading } = useUser()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  if (!user) {
    return (
      <div>
        <a href="/api/auth/login">Login</a>
      </div>
    )
  }

  return (
    <div>
      <img src={user.picture} alt={user.name} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <a href="/api/auth/logout">Logout</a>
    </div>
  )
}
```

### Protected Client Component

```tsx
'use client'

import { withPageAuthRequired } from '@auth0/nextjs-auth0/client'

function Dashboard() {
  const { user } = useUser()

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}</p>
    </div>
  )
}

export default withPageAuthRequired(Dashboard, {
  onRedirecting: () => <div>Loading...</div>,
  onError: (error) => <div>Error: {error.message}</div>,
})
```

## Server-Side Auth

### getSession

```tsx
// app/profile/page.tsx
import { getSession } from '@auth0/nextjs-auth0'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect('/api/auth/login')
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>Email: {session.user.email}</p>
      <p>User ID: {session.user.sub}</p>
    </div>
  )
}
```

### withPageAuthRequired (Server)

```tsx
// app/dashboard/page.tsx
import { withPageAuthRequired } from '@auth0/nextjs-auth0'

export default withPageAuthRequired(
  async function Dashboard() {
    const session = await getSession()

    return (
      <div>
        <h1>Dashboard</h1>
        <p>Welcome, {session?.user.name}</p>
      </div>
    )
  },
  { returnTo: '/dashboard' }
)
```

### API Route Protection

```typescript
// app/api/protected/route.ts
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export const GET = withApiAuthRequired(async function handler(req) {
  const session = await getSession()

  return NextResponse.json({
    user: session?.user,
    message: 'Protected data',
  })
})
```

## Access Tokens

### Getting Access Token

```typescript
// app/api/external/route.ts
import { getAccessToken } from '@auth0/nextjs-auth0'
import { NextResponse } from 'next/server'

export async function GET() {
  const { accessToken } = await getAccessToken({
    scopes: ['read:data'],
  })

  const response = await fetch(`${process.env.API_URL}/data`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await response.json()
  return NextResponse.json(data)
}
```

### Token Refresh

```typescript
import { getAccessToken } from '@auth0/nextjs-auth0'

export async function GET() {
  const { accessToken } = await getAccessToken({
    refresh: true,  // Force refresh if expired
  })

  // Use accessToken
}
```

## Middleware Protection

```typescript
// middleware.ts
import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge'

export default withMiddlewareAuthRequired()

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/protected/:path*',
  ],
}

// With custom logic
import { NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0/edge'

export default withMiddlewareAuthRequired(async function middleware(req) {
  const res = NextResponse.next()
  const session = await getSession(req, res)

  // Add custom headers
  res.headers.set('x-user-id', session?.user.sub || '')

  // Role-based redirect
  const roles = session?.user['https://myapp.com/roles'] || []
  if (req.nextUrl.pathname.startsWith('/admin') && !roles.includes('admin')) {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return res
})
```

## Organization Support

### Organization Login

```typescript
// app/api/auth/[auth0]/route.ts
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      organization: 'org_123',  // Specific org
      // or
      // organization: req.query.org,  // Dynamic org
    },
  }),
})
```

### Checking Organization

```tsx
import { getSession } from '@auth0/nextjs-auth0'

export default async function OrgPage() {
  const session = await getSession()
  const orgId = session?.user.org_id

  if (!orgId) {
    return <div>Please select an organization</div>
  }

  return <div>Organization: {session?.user.org_name}</div>
}
```

## Custom Session Handling

```typescript
// app/api/auth/[auth0]/route.ts
import { handleAuth, handleCallback } from '@auth0/nextjs-auth0'

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: async (req, session, state) => {
      // Modify session
      session.user.customClaim = 'value'

      // Add to database
      await upsertUser({
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name,
      })

      return session
    },
  }),
})
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
