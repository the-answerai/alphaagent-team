---
name: nextjs-auth
description: NextAuth.js / Auth.js authentication patterns
user-invocable: false
---

# Next.js Auth Skill

Patterns for implementing authentication with NextAuth.js / Auth.js.

## Setup

### Basic Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

```typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await verifyCredentials(
          credentials?.email,
          credentials?.password
        )
        if (user) return user
        return null
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      return session
    },
  },
  session: {
    strategy: 'jwt',
  },
}
```

### Type Extensions

```typescript
// types/next-auth.d.ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession['user']
  }

  interface User {
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
  }
}
```

## Server-Side Auth

### Getting Session in Server Components

```tsx
// app/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div>
      <h1>Welcome, {session.user.name}</h1>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

### Auth in API Routes

```typescript
// app/api/protected/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // User is authenticated
  return NextResponse.json({
    user: session.user,
    data: await getProtectedData(session.user.id),
  })
}
```

## Client-Side Auth

### Session Provider

```tsx
// app/providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}

// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

### useSession Hook

```tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react'

export function AuthButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (session) {
    return (
      <div>
        <span>Welcome, {session.user.name}</span>
        <button onClick={() => signOut()}>Sign Out</button>
      </div>
    )
  }

  return <button onClick={() => signIn()}>Sign In</button>
}
```

### Protected Client Component

```tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ProtectedComponent({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'authenticated') {
    return <>{children}</>
  }

  return null
}
```

## Middleware Protection

```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Role-based access control
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/account/:path*'],
}
```

## Custom Sign In Page

```tsx
// app/auth/signin/page.tsx
'use client'

import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SignIn() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const error = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await signIn('credentials', {
      email,
      password,
      callbackUrl,
    })
  }

  return (
    <div className="signin-page">
      <h1>Sign In</h1>

      {error && <div className="error">Authentication failed</div>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">Sign In</button>
      </form>

      <div className="divider">or</div>

      <button onClick={() => signIn('google', { callbackUrl })}>
        Sign in with Google
      </button>
    </div>
  )
}
```

## Database Sessions

```typescript
// lib/auth.ts
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',  // Store sessions in database
  },
  providers: [...],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      session.user.role = user.role
      return session
    },
  },
}
```

## Callbacks

### JWT Callback

```typescript
callbacks: {
  async jwt({ token, user, account, trigger, session }) {
    // Initial sign in
    if (user) {
      token.id = user.id
      token.role = user.role
    }

    // Update triggered from client
    if (trigger === 'update' && session) {
      token.name = session.name
    }

    // Refresh token
    if (account?.provider === 'google') {
      token.accessToken = account.access_token
    }

    return token
  },
}
```

### Session Callback

```typescript
callbacks: {
  async session({ session, token, user }) {
    // JWT strategy
    if (token) {
      session.user.id = token.id
      session.user.role = token.role
    }

    // Database strategy
    if (user) {
      session.user.id = user.id
      session.user.role = user.role
    }

    return session
  },
}
```

### Sign In Callback

```typescript
callbacks: {
  async signIn({ user, account, profile }) {
    // Block certain emails
    if (user.email?.endsWith('@blocked.com')) {
      return false
    }

    // Allow OAuth but verify email for credentials
    if (account?.provider === 'credentials') {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      })
      if (!dbUser?.emailVerified) {
        return '/auth/verify-email'  // Redirect
      }
    }

    return true
  },
}
```

## Events

```typescript
events: {
  async signIn({ user, account, isNewUser }) {
    if (isNewUser) {
      await sendWelcomeEmail(user.email)
    }
    await logSignIn(user.id, account?.provider)
  },

  async signOut({ token }) {
    await logSignOut(token.id)
  },

  async createUser({ user }) {
    await initializeUserDefaults(user.id)
  },
}
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
