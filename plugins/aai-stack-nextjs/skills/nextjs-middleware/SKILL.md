---
name: nextjs-middleware
description: Next.js middleware patterns for request processing
user-invocable: false
---

# Next.js Middleware Skill

Patterns for using Next.js middleware for request interception.

## Basic Middleware

### Simple Middleware

```typescript
// middleware.ts (in project root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-custom-header', 'custom-value')

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

// Configure which paths middleware runs on
export const config = {
  matcher: '/api/:path*',
}
```

### Route Matching

```typescript
export const config = {
  matcher: [
    // Match all paths except static files and images
    '/((?!_next/static|_next/image|favicon.ico).*)',

    // Match specific paths
    '/api/:path*',
    '/dashboard/:path*',

    // Match with regex
    '/blog/:slug*',
  ],
}
```

## Authentication

### Session Check

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })

  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', request.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/account/:path*'],
}
```

### JWT Verification

```typescript
import { jwtVerify } from 'jose'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, SECRET)

    // Add user info to headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.sub as string)

    return NextResponse.next({
      request: { headers: requestHeaders },
    })
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}
```

### Role-Based Access

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const user = await getUser(request)

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes require admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
```

## Redirects and Rewrites

### Path Redirect

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect old paths to new
  if (pathname.startsWith('/old-blog')) {
    return NextResponse.redirect(
      new URL(pathname.replace('/old-blog', '/blog'), request.url)
    )
  }

  return NextResponse.next()
}
```

### URL Rewrite

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rewrite to different internal path (URL stays the same)
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/home', request.url))
  }

  // A/B testing with rewrite
  const bucket = request.cookies.get('ab-bucket')?.value || 'a'
  if (pathname === '/pricing') {
    return NextResponse.rewrite(
      new URL(`/pricing-${bucket}`, request.url)
    )
  }

  return NextResponse.next()
}
```

### Geo-Based Routing

```typescript
export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US'

  // Redirect to country-specific domain
  if (country === 'UK' && !request.url.includes('.co.uk')) {
    return NextResponse.redirect(
      new URL(request.url.replace('.com', '.co.uk'))
    )
  }

  // Or rewrite to localized content
  if (request.nextUrl.pathname === '/') {
    return NextResponse.rewrite(
      new URL(`/${country.toLowerCase()}`, request.url)
    )
  }

  return NextResponse.next()
}
```

## Headers

### Security Headers

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Security headers
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  )

  return response
}
```

### CORS Headers

```typescript
export function middleware(request: NextRequest) {
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const response = NextResponse.next()
  response.headers.set('Access-Control-Allow-Origin', '*')

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

## Rate Limiting

### Simple Rate Limiting

```typescript
const rateLimit = new Map<string, { count: number; resetTime: number }>()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 100

  const currentLimit = rateLimit.get(ip)

  if (currentLimit && now < currentLimit.resetTime) {
    if (currentLimit.count >= maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((currentLimit.resetTime - now) / 1000)),
          },
        }
      )
    }
    currentLimit.count++
  } else {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

## Internationalization

### Locale Detection

```typescript
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'es', 'fr', 'de']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  const headers = { 'accept-language': request.headers.get('accept-language') || '' }
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if locale is in pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return NextResponse.next()

  // Redirect to locale-prefixed path
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`

  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

## A/B Testing

```typescript
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Check for existing bucket assignment
  let bucket = request.cookies.get('ab-bucket')?.value

  if (!bucket) {
    // Randomly assign to bucket
    bucket = Math.random() < 0.5 ? 'a' : 'b'

    // Set cookie for consistent experience
    response.cookies.set('ab-bucket', bucket, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  // Add bucket to headers for use in components
  response.headers.set('x-ab-bucket', bucket)

  return response
}
```

## Logging

```typescript
export function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  // Log request (in production, send to logging service)
  const duration = Date.now() - start
  console.log({
    method: request.method,
    path: request.nextUrl.pathname,
    duration,
    userAgent: request.headers.get('user-agent'),
    ip: request.ip,
    country: request.geo?.country,
  })

  return response
}
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
