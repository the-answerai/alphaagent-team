---
name: nextjs-app-router
description: Next.js App Router patterns and conventions
user-invocable: false
---

# Next.js App Router Skill

Patterns for building applications with Next.js App Router.

## File-Based Routing

### Basic Routes

```
app/
├── page.tsx              # / (home)
├── about/
│   └── page.tsx          # /about
├── blog/
│   └── page.tsx          # /blog
├── blog/
│   └── [slug]/
│       └── page.tsx      # /blog/:slug
└── shop/
    └── [...slug]/
        └── page.tsx      # /shop/* (catch-all)
```

### Special Files

```
app/
├── layout.tsx            # Shared layout
├── page.tsx              # Page content
├── loading.tsx           # Loading UI
├── error.tsx             # Error UI
├── not-found.tsx         # 404 UI
├── template.tsx          # Re-mount on navigation
├── default.tsx           # Parallel route fallback
└── route.ts              # API route
```

### Route Groups

```
app/
├── (auth)/               # Group without affecting URL
│   ├── login/
│   │   └── page.tsx      # /login
│   └── register/
│       └── page.tsx      # /register
├── (dashboard)/
│   ├── layout.tsx        # Shared dashboard layout
│   ├── settings/
│   │   └── page.tsx      # /settings
│   └── profile/
│       └── page.tsx      # /profile
```

## Layouts

### Root Layout

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
```

### Nested Layouts

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <Sidebar />
      <div className="content">{children}</div>
    </div>
  )
}
```

### Parallel Routes

```tsx
// app/layout.tsx with parallel routes
export default function Layout({
  children,
  modal,
  analytics,
}: {
  children: React.ReactNode
  modal: React.ReactNode      // @modal slot
  analytics: React.ReactNode  // @analytics slot
}) {
  return (
    <>
      {children}
      {modal}
      {analytics}
    </>
  )
}

// app/@modal/(..)photo/[id]/page.tsx
// Intercepts /photo/[id] and shows in modal
```

## Data Fetching

### Server Component Fetching

```tsx
// app/users/page.tsx
async function getUsers() {
  const res = await fetch('https://api.example.com/users', {
    next: { revalidate: 60 },  // Revalidate every 60 seconds
  })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### Caching Options

```tsx
// No cache
fetch(url, { cache: 'no-store' })

// Force cache
fetch(url, { cache: 'force-cache' })

// Revalidate
fetch(url, { next: { revalidate: 60 } })

// Tag-based
fetch(url, { next: { tags: ['users'] } })
```

### Dynamic Data

```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Or use dynamic functions
import { cookies, headers } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const headersList = headers()

  return <div>Dynamic content</div>
}
```

## Loading and Error States

### Loading UI

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return (
    <div className="loading">
      <Spinner />
      <p>Loading dashboard...</p>
    </div>
  )
}
```

### Streaming with Suspense

```tsx
import { Suspense } from 'react'

async function SlowComponent() {
  const data = await fetchSlowData()
  return <div>{data}</div>
}

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />
      </Suspense>
    </div>
  )
}
```

### Error Handling

```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Not Found

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Page Not Found</h2>
      <Link href="/">Return Home</Link>
    </div>
  )
}

// Trigger programmatically
import { notFound } from 'next/navigation'

async function getPost(id: string) {
  const post = await fetchPost(id)
  if (!post) notFound()
  return post
}
```

## Metadata

### Static Metadata

```tsx
// app/about/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn more about our company',
  openGraph: {
    title: 'About Us',
    description: 'Learn more about our company',
    images: ['/og-image.png'],
  },
}
```

### Dynamic Metadata

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)

  return {
    title: post.title,
    description: post.excerpt,
  }
}
```

## Navigation

### Link Component

```tsx
import Link from 'next/link'

export default function Navigation() {
  return (
    <nav>
      <Link href="/">Home</Link>
      <Link href="/about">About</Link>
      <Link href="/blog" prefetch={false}>Blog</Link>
      <Link href={{ pathname: '/user', query: { id: '1' } }}>
        User
      </Link>
    </nav>
  )
}
```

### Programmatic Navigation

```tsx
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function Navigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleClick = () => {
    router.push('/dashboard')
    // router.replace('/dashboard')
    // router.refresh()
    // router.back()
  }

  return (
    <button onClick={handleClick}>
      Go to Dashboard
    </button>
  )
}
```

### Redirect

```tsx
import { redirect } from 'next/navigation'

async function Page() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return <div>Protected content</div>
}
```

## Route Handlers

### API Route

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('query')

  const users = await getUsers(query)
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await createUser(body)

  return NextResponse.json(user, { status: 201 })
}
```

### Dynamic Route Handler

```tsx
// app/api/users/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser(params.id)

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(user)
}
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
