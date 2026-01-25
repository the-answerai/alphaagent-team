---
name: nextjs-server-components
description: React Server Components patterns in Next.js
user-invocable: false
---

# Next.js Server Components Skill

Patterns for using React Server Components effectively.

## Server Components (Default)

### Basic Server Component

```tsx
// This is a Server Component by default
async function UserProfile({ userId }: { userId: string }) {
  // Direct database access
  const user = await db.user.findUnique({ where: { id: userId } })

  // No client JavaScript shipped
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

### Data Fetching

```tsx
// Fetch data directly in component
async function ProductList() {
  const products = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 },  // Cache for 1 hour
  }).then((res) => res.json())

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### Database Access

```tsx
import { prisma } from '@/lib/prisma'

async function RecentOrders() {
  // Direct Prisma queries
  const orders = await prisma.order.findMany({
    where: { status: 'completed' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { user: true, items: true },
  })

  return (
    <table>
      <tbody>
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </tbody>
    </table>
  )
}
```

## What Can Server Components Do

### Access Backend Resources

```tsx
// File system
import { readFile } from 'fs/promises'

async function MarkdownPage({ slug }: { slug: string }) {
  const content = await readFile(`./content/${slug}.md`, 'utf-8')
  return <Markdown content={content} />
}

// Environment variables (including server-only)
async function Config() {
  const apiKey = process.env.SECRET_API_KEY  // Not exposed to client
  const data = await fetchWithKey(apiKey)
  return <div>{data}</div>
}
```

### Heavy Dependencies

```tsx
// Large libraries only run on server
import { highlight } from 'shiki'

async function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const html = await highlight(code, { lang })
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

## What Server Components Cannot Do

```tsx
// These are NOT allowed in Server Components:

// ❌ useState, useReducer
const [count, setCount] = useState(0)

// ❌ useEffect, useLayoutEffect
useEffect(() => { ... })

// ❌ Browser APIs
window.localStorage.getItem('key')

// ❌ Event handlers (onClick, onChange, etc.)
<button onClick={() => {}}>Click</button>

// ❌ Custom hooks that use client features
const data = useQuery(...)
```

## Composing Server and Client

### Pass Server Data to Client

```tsx
// Server Component
async function ProductPage({ id }: { id: string }) {
  const product = await getProduct(id)  // Server-side fetch

  return (
    <div>
      <h1>{product.name}</h1>
      <ProductPrice price={product.price} />  {/* Server */}
      <AddToCartButton productId={id} />       {/* Client */}
    </div>
  )
}

// Client Component
'use client'

function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  return (
    <button onClick={() => addToCart(productId)}>
      Add to Cart
    </button>
  )
}
```

### Children Pattern

```tsx
// Client Component wrapping Server content
'use client'

function Modal({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && (
        <div className="modal">
          {children}  {/* Server-rendered content */}
        </div>
      )}
    </>
  )
}

// Page using the pattern
async function Page() {
  const data = await fetchData()  // Server

  return (
    <Modal>
      <ServerContent data={data} />  {/* Server */}
    </Modal>
  )
}
```

## Streaming and Suspense

### Streaming with Suspense

```tsx
import { Suspense } from 'react'

async function SlowData() {
  const data = await fetchSlowEndpoint()  // 3s delay
  return <div>{data}</div>
}

async function FastData() {
  const data = await fetchFastEndpoint()  // 100ms delay
  return <div>{data}</div>
}

export default function Dashboard() {
  return (
    <div>
      {/* Fast content appears immediately */}
      <Suspense fallback={<Skeleton />}>
        <FastData />
      </Suspense>

      {/* Slow content streams in when ready */}
      <Suspense fallback={<Skeleton />}>
        <SlowData />
      </Suspense>
    </div>
  )
}
```

### Parallel Data Fetching

```tsx
async function Dashboard() {
  // Parallel fetching - don't await sequentially
  const userPromise = getUser()
  const postsPromise = getPosts()
  const statsPromise = getStats()

  const [user, posts, stats] = await Promise.all([
    userPromise,
    postsPromise,
    statsPromise,
  ])

  return (
    <div>
      <UserCard user={user} />
      <PostList posts={posts} />
      <StatsChart stats={stats} />
    </div>
  )
}

// Or use Suspense for independent streaming
async function Dashboard() {
  return (
    <div>
      <Suspense fallback={<UserSkeleton />}>
        <UserSection />  {/* Streams independently */}
      </Suspense>
      <Suspense fallback={<PostsSkeleton />}>
        <PostsSection />  {/* Streams independently */}
      </Suspense>
    </div>
  )
}
```

## Caching Patterns

### Request Deduplication

```tsx
// Same fetch in multiple components is automatically deduplicated
async function Layout({ children }) {
  const user = await getUser()  // Cached
  return <div>{children}</div>
}

async function Sidebar() {
  const user = await getUser()  // Same cache, no duplicate fetch
  return <div>{user.name}</div>
}
```

### cache() for Functions

```tsx
import { cache } from 'react'

// Cache function results for the request
const getUser = cache(async (id: string) => {
  const user = await db.user.findUnique({ where: { id } })
  return user
})

// Multiple calls return same result
async function Page() {
  const user1 = await getUser('1')
  const user2 = await getUser('1')  // Same cached result
}
```

### unstable_cache for Cross-Request

```tsx
import { unstable_cache } from 'next/cache'

const getCachedUser = unstable_cache(
  async (id: string) => {
    return await db.user.findUnique({ where: { id } })
  },
  ['user'],  // Cache key
  {
    revalidate: 3600,  // Revalidate every hour
    tags: ['user'],    // For on-demand revalidation
  }
)
```

## Best Practices

### 1. Default to Server Components

```tsx
// Start with Server Components
async function ProductPage({ id }) {
  const product = await getProduct(id)
  return <ProductDetails product={product} />
}

// Only add 'use client' when needed
```

### 2. Push Client Boundary Down

```tsx
// Bad: Large client component
'use client'
function ProductPage() {
  const [quantity, setQuantity] = useState(1)
  return (
    <div>
      <ProductInfo />  {/* Could be Server */}
      <ProductImage /> {/* Could be Server */}
      <QuantitySelector value={quantity} onChange={setQuantity} />
    </div>
  )
}

// Good: Small client component
function ProductPage() {
  return (
    <div>
      <ProductInfo />   {/* Server */}
      <ProductImage />  {/* Server */}
      <QuantitySelector />  {/* Client */}
    </div>
  )
}
```

### 3. Pre-render What You Can

```tsx
// Generate static pages for known data
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }) {
  const product = await getProduct(params.id)
  return <Product product={product} />
}
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
