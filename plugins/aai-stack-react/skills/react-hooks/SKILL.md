---
name: react-hooks
description: React hooks patterns including custom hooks, useEffect, useMemo, and more
user-invocable: false
---

# React Hooks Skill

Patterns for using and creating React hooks effectively.

## Core Hooks

### useState Patterns

```tsx
// Basic state
const [count, setCount] = useState(0)

// Lazy initialization (expensive computation)
const [data, setData] = useState(() => {
  return computeExpensiveInitialValue()
})

// Previous value pattern
const [value, setValue] = useState('')
const prevValue = useRef(value)
useEffect(() => {
  prevValue.current = value
}, [value])

// Object state (spread pattern)
const [form, setForm] = useState({ name: '', email: '' })
const updateField = (field: string, value: string) => {
  setForm(prev => ({ ...prev, [field]: value }))
}
```

### useEffect Patterns

```tsx
// Mount/unmount
useEffect(() => {
  console.log('Component mounted')
  return () => console.log('Component unmounted')
}, [])

// Dependency tracking
useEffect(() => {
  document.title = `Count: ${count}`
}, [count])

// Cleanup pattern
useEffect(() => {
  const controller = new AbortController()

  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') throw err
    })

  return () => controller.abort()
}, [url])

// Event listener pattern
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }

  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}, [onClose])
```

### useMemo and useCallback

```tsx
// Memoize expensive computation
const sortedList = useMemo(() => {
  return items.sort((a, b) => a.value - b.value)
}, [items])

// Memoize object/array references
const config = useMemo(() => ({
  api: apiUrl,
  timeout: 5000,
}), [apiUrl])

// Memoize callbacks for child components
const handleClick = useCallback((id: string) => {
  selectItem(id)
}, [selectItem])

// Memoize with dependencies
const filteredItems = useMemo(() => {
  return items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  )
}, [items, query])
```

### useRef Patterns

```tsx
// DOM reference
const inputRef = useRef<HTMLInputElement>(null)
const focusInput = () => inputRef.current?.focus()

// Mutable value that doesn't trigger re-render
const renderCount = useRef(0)
useEffect(() => {
  renderCount.current++
})

// Store previous props/state
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

// Callback ref for dynamic refs
const [height, setHeight] = useState(0)
const measuredRef = useCallback((node: HTMLDivElement | null) => {
  if (node !== null) {
    setHeight(node.getBoundingClientRect().height)
  }
}, [])
```

### useReducer Patterns

```tsx
interface State {
  count: number
  step: number
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'setStep'; payload: number }
  | { type: 'reset' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + state.step }
    case 'decrement':
      return { ...state, count: state.count - state.step }
    case 'setStep':
      return { ...state, step: action.payload }
    case 'reset':
      return { count: 0, step: 1 }
    default:
      return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, step: 1 })

  return (
    <div>
      <span>{state.count}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
    </div>
  )
}
```

## Custom Hooks

### Data Fetching Hook

```tsx
interface UseFetchResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Fetch failed')
      const json = await response.json()
      setData(json)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
```

### Form Hook

```tsx
interface UseFormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit: (values: T) => void | Promise<void>
}

function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const handleBlur = (name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const validationErrors = validate?.(values) ?? {}
    setErrors(validationErrors)
    setTouched(Object.keys(values).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {} as Record<keyof T, boolean>))

    if (Object.keys(validationErrors).length === 0) {
      setSubmitting(true)
      await onSubmit(values)
      setSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  }
}
```

### Local Storage Hook

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
}
```

### Debounce Hook

```tsx
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}

// Usage
const [search, setSearch] = useState('')
const debouncedSearch = useDebounce(search, 300)

useEffect(() => {
  fetchResults(debouncedSearch)
}, [debouncedSearch])
```

### Media Query Hook

```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [query])

  return matches
}

// Usage
const isMobile = useMediaQuery('(max-width: 768px)')
```

### Intersection Observer Hook

```tsx
function useIntersectionObserver(
  ref: RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref, options])

  return isIntersecting
}

// Usage
const ref = useRef<HTMLDivElement>(null)
const isVisible = useIntersectionObserver(ref, { threshold: 0.5 })
```

## Hook Rules

### 1. Only Call Hooks at the Top Level

```tsx
// Bad: Conditional hook
function Component({ condition }) {
  if (condition) {
    const [value, setValue] = useState(0) // Error!
  }
}

// Good: Always call hooks
function Component({ condition }) {
  const [value, setValue] = useState(0)

  if (!condition) return null
  return <div>{value}</div>
}
```

### 2. Only Call Hooks from React Functions

```tsx
// Bad: Regular function
function calculate() {
  const [result, setResult] = useState(0) // Error!
}

// Good: Custom hook
function useCalculation() {
  const [result, setResult] = useState(0)
  // ...
  return result
}
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
