---
name: nextjs-client-components
description: Client Components patterns in Next.js App Router
user-invocable: false
---

# Next.js Client Components Skill

Patterns for using Client Components in Next.js App Router.

## Declaring Client Components

### The 'use client' Directive

```tsx
'use client'

import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### Boundary Behavior

```tsx
'use client'

// Everything imported into a client component becomes client code
import { Button } from './button'      // Also becomes client
import { formatDate } from './utils'   // Also becomes client

export function MyComponent() {
  return <Button>{formatDate(new Date())}</Button>
}
```

## When to Use Client Components

### Interactive UI

```tsx
'use client'

import { useState } from 'react'

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <button onClick={() => setOpenIndex(
            openIndex === index ? null : index
          )}>
            {item.title}
          </button>
          {openIndex === index && <div>{item.content}</div>}
        </div>
      ))}
    </div>
  )
}
```

### Event Handlers

```tsx
'use client'

export function SearchInput({ onSearch }: { onSearch: (q: string) => void }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      <button type="submit">Search</button>
    </form>
  )
}
```

### Browser APIs

```tsx
'use client'

import { useEffect, useState } from 'react'

export function WindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return <div>{size.width} x {size.height}</div>
}
```

### React Hooks

```tsx
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

export function DataTable({ data }: { data: Item[] }) {
  const [sortKey, setSortKey] = useState<keyof Item>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      return sortOrder === 'asc'
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1
    })
  }, [data, sortKey, sortOrder])

  const handleSort = useCallback((key: keyof Item) => {
    if (key === sortKey) {
      setSortOrder(order => order === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }, [sortKey])

  return (
    <table>
      {/* ... */}
    </table>
  )
}
```

## Client Component Patterns

### Form with State

```tsx
'use client'

import { useState, FormEvent } from 'react'

interface FormData {
  email: string
  password: string
}

export function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    // Validate
    const newErrors: Partial<FormData> = {}
    if (!formData.email) newErrors.email = 'Email required'
    if (!formData.password) newErrors.password = 'Password required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        placeholder="Password"
      />
      {errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

### Modal Component

```tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  )
}
```

### Local Storage Hook

```tsx
'use client'

import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.error(error)
    }
    setIsHydrated(true)
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue, isHydrated] as const
}
```

## Data Fetching in Client Components

### With TanStack Query

```tsx
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function UserList() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then((res) => res.json()),
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

### With SWR

```tsx
'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function UserProfile({ id }: { id: string }) {
  const { data, error, isLoading } = useSWR(`/api/users/${id}`, fetcher)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading user</div>

  return <div>{data.name}</div>
}
```

## Server Actions in Client Components

```tsx
'use client'

import { useTransition } from 'react'
import { createPost } from '@/app/actions'

export function CreatePostForm() {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await createPost(formData)
    })
  }

  return (
    <form action={handleSubmit}>
      <input name="title" placeholder="Title" />
      <textarea name="content" placeholder="Content" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  )
}
```

## Best Practices

### 1. Keep Client Components Small

```tsx
// Bad: Too much in client component
'use client'
function ProductPage() {
  // ... lots of server-renderable content
  const [cart, setCart] = useState([])
  return (/* everything */)
}

// Good: Extract only interactive parts
function ProductPage() {
  return (
    <div>
      <ProductInfo />      {/* Server */}
      <AddToCart />        {/* Client */}
    </div>
  )
}
```

### 2. Avoid Passing Functions as Props

```tsx
// Bad: Serialization error
async function Page() {
  const handleClick = () => console.log('click')
  return <ClientButton onClick={handleClick} />  // Error!
}

// Good: Define actions in client component
'use client'
function ClientButton() {
  const handleClick = () => console.log('click')
  return <button onClick={handleClick}>Click</button>
}
```

### 3. Use Props for Initial Data

```tsx
// Server Component
async function Page() {
  const initialData = await fetchData()  // Server fetch
  return <ClientComponent initialData={initialData} />
}

// Client Component
'use client'
function ClientComponent({ initialData }: { initialData: Data }) {
  const [data, setData] = useState(initialData)
  // Can now update data client-side
}
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
