---
name: nextjs-api-routes
description: Next.js App Router API route patterns
user-invocable: false
---

# Next.js API Routes Skill

Patterns for building API routes in Next.js App Router.

## Route Handlers

### Basic Route Handler

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const users = await db.user.findMany()
  return NextResponse.json(users)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}
```

### Dynamic Routes

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(user)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const user = await db.user.update({
    where: { id: params.id },
    data: body,
  })
  return NextResponse.json(user)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await db.user.delete({ where: { id: params.id } })
  return new NextResponse(null, { status: 204 })
}
```

## Request Handling

### Query Parameters

```tsx
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const search = searchParams.get('search') || ''

  const users = await db.user.findMany({
    where: {
      name: { contains: search, mode: 'insensitive' },
    },
    skip: (page - 1) * limit,
    take: limit,
  })

  const total = await db.user.count({
    where: {
      name: { contains: search, mode: 'insensitive' },
    },
  })

  return NextResponse.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}
```

### Headers

```tsx
export async function GET(request: NextRequest) {
  // Read headers
  const authHeader = request.headers.get('authorization')
  const contentType = request.headers.get('content-type')

  // Set response headers
  return NextResponse.json(
    { data: 'example' },
    {
      headers: {
        'Cache-Control': 'max-age=3600',
        'X-Custom-Header': 'value',
      },
    }
  )
}
```

### Cookies

```tsx
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  return NextResponse.json({ token: token?.value })
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true })

  // Set cookie
  response.cookies.set('token', 'abc123', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })

  return response
}
```

### Request Body

```tsx
// JSON body
export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json(body)
}

// Form data
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const name = formData.get('name')
  const file = formData.get('file') as File

  return NextResponse.json({ name, fileName: file.name })
}

// Text body
export async function POST(request: NextRequest) {
  const text = await request.text()
  return NextResponse.json({ text })
}
```

## Response Types

### JSON Response

```tsx
export async function GET() {
  return NextResponse.json({
    success: true,
    data: { message: 'Hello' },
  })
}
```

### Streaming Response

```tsx
export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 0; i < 10; i++) {
        controller.enqueue(encoder.encode(`data: ${i}\n\n`))
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### File Download

```tsx
export async function GET() {
  const file = await readFile('./files/document.pdf')

  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
    },
  })
}
```

### Redirect

```tsx
import { redirect } from 'next/navigation'

export async function GET() {
  redirect('/new-location')
}

// Or with NextResponse
export async function GET() {
  return NextResponse.redirect(new URL('/new-location', request.url))
}
```

## Error Handling

### Structured Errors

```tsx
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: params.id },
    })

    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
    }

    return NextResponse.json(user)
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      )
    }

    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

## Authentication

### JWT Verification

```tsx
import { jwtVerify } from 'jose'

async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    )
    return payload
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const user = await verifyAuth(request)

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return NextResponse.json({ user })
}
```

### Middleware Helper

```tsx
// lib/api-auth.ts
export function withAuth(
  handler: (
    request: NextRequest,
    context: { params: Record<string, string>; user: User }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: { params: Record<string, string> }
  ) => {
    const user = await verifyAuth(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(request, { ...context, user })
  }
}

// Usage
export const GET = withAuth(async (request, { params, user }) => {
  // user is available here
  return NextResponse.json({ user })
})
```

## Validation

### With Zod

```tsx
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()

  const result = createUserSchema.safeParse(body)

  if (!result.success) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const user = await db.user.create({ data: result.data })
  return NextResponse.json(user, { status: 201 })
}
```

## Caching

### Static Routes

```tsx
// Force static (default for GET without dynamic data)
export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json({ message: 'Static response' })
}
```

### Dynamic Routes

```tsx
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ time: new Date().toISOString() })
}
```

### Revalidation

```tsx
export const revalidate = 60  // Revalidate every 60 seconds

export async function GET() {
  const data = await fetchData()
  return NextResponse.json(data)
}
```

## CORS

```tsx
export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin')

  const response = NextResponse.json({ data: 'example' })

  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  return response
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
