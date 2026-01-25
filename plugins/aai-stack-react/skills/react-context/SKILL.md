---
name: react-context
description: React Context API patterns for state sharing and prop drilling elimination
user-invocable: false
---

# React Context Skill

Patterns for using React Context API effectively.

## Basic Context Pattern

### Creating Context

```tsx
interface ThemeContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const value = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook for consuming context
function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
```

### Using Context

```tsx
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  )
}

// App structure
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
      <ThemeToggle />
    </ThemeProvider>
  )
}
```

## Context with Reducer

### Auth Context with Reducer

```tsx
interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_ERROR'; payload: string }
  | { type: 'LOGOUT' }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null }
    case 'LOGIN_SUCCESS':
      return { user: action.payload, loading: false, error: null }
    case 'LOGIN_ERROR':
      return { user: null, loading: false, error: action.payload }
    case 'LOGOUT':
      return { user: null, loading: false, error: null }
    default:
      return state
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
  })

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_START' })
    try {
      const user = await authService.login(email, password)
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: (error as Error).message })
    }
  }, [])

  const logout = useCallback(() => {
    authService.logout()
    dispatch({ type: 'LOGOUT' })
  }, [])

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state, login, logout])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

## Context Splitting

### Split State and Dispatch

```tsx
// Separate contexts for state and dispatch
const StateContext = createContext<State | null>(null)
const DispatchContext = createContext<Dispatch<Action> | null>(null)

function Provider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

// Components only re-render when their needed context changes
function Counter() {
  const count = useContext(StateContext)!.count  // Only re-renders on count change
  return <span>{count}</span>
}

function IncrementButton() {
  const dispatch = useContext(DispatchContext)!  // Never re-renders on state change
  return <button onClick={() => dispatch({ type: 'increment' })}>+</button>
}
```

### Multiple Domain Contexts

```tsx
// Avoid one giant context - split by domain
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NotificationsProvider>
          <CartProvider>
            <Routes />
          </CartProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}
```

## Performance Optimization

### Memoize Provider Value

```tsx
// Bad: Creates new object on every render
function Provider({ children }) {
  const [count, setCount] = useState(0)

  return (
    <Context.Provider value={{ count, setCount }}>  {/* New object each render! */}
      {children}
    </Context.Provider>
  )
}

// Good: Memoize the value
function Provider({ children }) {
  const [count, setCount] = useState(0)

  const value = useMemo(() => ({
    count,
    setCount,
  }), [count])  // Only new object when count changes

  return (
    <Context.Provider value={value}>
      {children}
    </Context.Provider>
  )
}
```

### Use Context Selectors

```tsx
// Using use-context-selector library for fine-grained updates
import { createContext, useContextSelector } from 'use-context-selector'

const Context = createContext<State | null>(null)

function UserName() {
  // Only re-renders when user.name changes, not on any state change
  const userName = useContextSelector(Context, state => state?.user.name)
  return <span>{userName}</span>
}
```

## Context Patterns

### Compound Components with Context

```tsx
interface AccordionContextValue {
  expandedItems: Set<string>
  toggleItem: (id: string) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function Accordion({ children }: { children: ReactNode }) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem }}>
      <div className="accordion">{children}</div>
    </AccordionContext.Provider>
  )
}

Accordion.Item = function AccordionItem({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  const { expandedItems, toggleItem } = useContext(AccordionContext)!
  const isExpanded = expandedItems.has(id)

  return (
    <div className="accordion-item">
      <button onClick={() => toggleItem(id)}>
        {title} {isExpanded ? '▼' : '▶'}
      </button>
      {isExpanded && <div className="accordion-content">{children}</div>}
    </div>
  )
}

// Usage
<Accordion>
  <Accordion.Item id="1" title="Section 1">Content 1</Accordion.Item>
  <Accordion.Item id="2" title="Section 2">Content 2</Accordion.Item>
</Accordion>
```

### Context with Async Operations

```tsx
interface DataContextValue {
  data: Record<string, unknown>
  loading: Record<string, boolean>
  errors: Record<string, Error | null>
  fetchData: (key: string, fetcher: () => Promise<unknown>) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [errors, setErrors] = useState<Record<string, Error | null>>({})

  const fetchData = useCallback(async (key: string, fetcher: () => Promise<unknown>) => {
    setLoading(prev => ({ ...prev, [key]: true }))
    setErrors(prev => ({ ...prev, [key]: null }))

    try {
      const result = await fetcher()
      setData(prev => ({ ...prev, [key]: result }))
    } catch (error) {
      setErrors(prev => ({ ...prev, [key]: error as Error }))
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  const value = useMemo(() => ({
    data,
    loading,
    errors,
    fetchData,
  }), [data, loading, errors, fetchData])

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
```

## When to Use Context

### Good Use Cases

- Theme data
- User authentication
- Locale/language
- Feature flags
- Global UI state (modals, toasts)

### When NOT to Use Context

```tsx
// Bad: Using context for frequently changing data
function LiveDataProvider({ children }) {
  const [data, setData] = useState([])

  useEffect(() => {
    const ws = new WebSocket(url)
    ws.onmessage = (e) => setData(JSON.parse(e.data))  // Updates 60x/second!
    return () => ws.close()
  }, [])

  return (
    <LiveDataContext.Provider value={data}>
      {children}  {/* All consumers re-render on every update! */}
    </LiveDataContext.Provider>
  )
}

// Better: Use a state management library or refs for high-frequency updates
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
