---
name: react-patterns
description: React component patterns, best practices, and architecture guidelines
user-invocable: false
---

# React Patterns Skill

Patterns for building well-architected React applications.

## Component Patterns

### Single Responsibility Components

```tsx
// Bad: Doing too much
function UserDashboard() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers().then(setUsers).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {loading ? <Spinner /> : users.map(user => (
        <div key={user.id}>
          <img src={user.avatar} />
          <span>{user.name}</span>
          <button onClick={() => deleteUser(user.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}

// Good: Single responsibility
function UserDashboard() {
  const { users, loading } = useUsers()

  if (loading) return <Spinner />

  return (
    <div>
      {users.map(user => (
        <UserCard key={user.id} user={user} />
      ))}
    </div>
  )
}
```

### Container/Presenter Pattern

```tsx
// Container: Handles data and logic
function UserListContainer() {
  const { users, loading, error, deleteUser } = useUsers()

  return (
    <UserList
      users={users}
      loading={loading}
      error={error}
      onDelete={deleteUser}
    />
  )
}

// Presenter: Handles rendering
interface UserListProps {
  users: User[]
  loading: boolean
  error?: Error
  onDelete: (id: string) => void
}

function UserList({ users, loading, error, onDelete }: UserListProps) {
  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <ul>
      {users.map(user => (
        <UserItem key={user.id} user={user} onDelete={onDelete} />
      ))}
    </ul>
  )
}
```

### Compound Components

```tsx
// Compound component pattern for flexible composition
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ children, defaultTab }: { children: ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

Tabs.List = function TabList({ children }: { children: ReactNode }) {
  return <div className="tab-list">{children}</div>
}

Tabs.Tab = function Tab({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)!

  return (
    <button
      className={activeTab === id ? 'active' : ''}
      onClick={() => setActiveTab(id)}
    >
      {children}
    </button>
  )
}

Tabs.Panel = function TabPanel({ id, children }: { id: string; children: ReactNode }) {
  const { activeTab } = useContext(TabsContext)!

  if (activeTab !== id) return null
  return <div className="tab-panel">{children}</div>
}

// Usage
<Tabs defaultTab="profile">
  <Tabs.List>
    <Tabs.Tab id="profile">Profile</Tabs.Tab>
    <Tabs.Tab id="settings">Settings</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="profile">Profile content</Tabs.Panel>
  <Tabs.Panel id="settings">Settings content</Tabs.Panel>
</Tabs>
```

## Render Patterns

### Render Props

```tsx
interface MousePosition {
  x: number
  y: number
}

interface MouseTrackerProps {
  render: (position: MousePosition) => ReactNode
}

function MouseTracker({ render }: MouseTrackerProps) {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return <>{render(position)}</>
}

// Usage
<MouseTracker
  render={({ x, y }) => (
    <div>Mouse at: {x}, {y}</div>
  )}
/>
```

### Higher-Order Components (HOC)

```tsx
// HOC for adding authentication check
function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>
) {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useAuth()

    if (loading) return <Spinner />
    if (!user) return <Navigate to="/login" />

    return <WrappedComponent {...props} />
  }
}

// Usage
const ProtectedDashboard = withAuth(Dashboard)
```

## Controlled vs Uncontrolled Components

### Controlled Component

```tsx
function ControlledInput() {
  const [value, setValue] = useState('')

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
```

### Uncontrolled Component

```tsx
function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    console.log(inputRef.current?.value)
  }

  return (
    <>
      <input ref={inputRef} defaultValue="" />
      <button onClick={handleSubmit}>Submit</button>
    </>
  )
}
```

### Flexible Controlled/Uncontrolled

```tsx
interface InputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
}

function FlexibleInput({ value, defaultValue, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e.target.value)
  }

  return (
    <input value={currentValue} onChange={handleChange} />
  )
}
```

## Performance Patterns

### Memoization

```tsx
// Memoize expensive computations
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name))
}, [items])

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  setSelectedId(id)
}, [])

// Memoize components
const MemoizedList = memo(function List({ items }) {
  return items.map(item => <Item key={item.id} {...item} />)
})
```

### Lazy Loading

```tsx
// Lazy load components
const HeavyComponent = lazy(() => import('./HeavyComponent'))

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

## Error Handling

### Error Boundaries

```tsx
class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback />
    }
    return this.props.children
  }
}

// Usage
<ErrorBoundary fallback={<ErrorMessage />}>
  <RiskyComponent />
</ErrorBoundary>
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
