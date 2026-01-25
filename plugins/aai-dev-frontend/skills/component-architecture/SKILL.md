---
name: component-architecture
description: Patterns for designing component hierarchies, composition, and reusable UI elements
user-invocable: false
---

# Component Architecture Skill

Patterns for designing maintainable, reusable component architectures in React and modern frameworks.

## Component Design Principles

### Single Responsibility
Each component should do one thing well.

```typescript
// Bad: Component does too much
function UserDashboard() {
  // Fetches data, handles auth, renders UI, manages state...
}

// Good: Separate concerns
function UserDashboard() {
  return (
    <DashboardLayout>
      <UserHeader />
      <UserStats />
      <RecentActivity />
    </DashboardLayout>
  );
}
```

### Composition Over Inheritance
Build complex UIs by composing simple components.

```typescript
// Compound component pattern
<Card>
  <Card.Header>
    <Card.Title>Settings</Card.Title>
  </Card.Header>
  <Card.Body>
    <SettingsForm />
  </Card.Body>
  <Card.Footer>
    <Button>Save</Button>
  </Card.Footer>
</Card>
```

### Props Interface Design

```typescript
interface ButtonProps {
  // Required props first
  children: React.ReactNode;

  // Optional with sensible defaults
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';

  // Boolean props (default false)
  isLoading?: boolean;
  isDisabled?: boolean;

  // Event handlers
  onClick?: (event: React.MouseEvent) => void;

  // Spread native props
  ...rest: React.ButtonHTMLAttributes<HTMLButtonElement>;
}
```

## Component Patterns

### Container/Presenter Pattern

**Container** (logic):
```typescript
function UserListContainer() {
  const { data, isLoading } = useUsers();
  const handleDelete = useDeleteUser();

  return (
    <UserList
      users={data}
      isLoading={isLoading}
      onDelete={handleDelete}
    />
  );
}
```

**Presenter** (UI):
```typescript
function UserList({ users, isLoading, onDelete }) {
  if (isLoading) return <Skeleton />;

  return (
    <ul>
      {users.map(user => (
        <UserItem key={user.id} user={user} onDelete={onDelete} />
      ))}
    </ul>
  );
}
```

### Compound Components

```typescript
const Card = ({ children }) => (
  <div className="card">{children}</div>
);

Card.Header = ({ children }) => (
  <div className="card-header">{children}</div>
);

Card.Body = ({ children }) => (
  <div className="card-body">{children}</div>
);

Card.Footer = ({ children }) => (
  <div className="card-footer">{children}</div>
);
```

### Render Props

```typescript
function MouseTracker({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return render(position);
}

// Usage
<MouseTracker render={({ x, y }) => <Tooltip x={x} y={y} />} />
```

### Custom Hooks

```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

## Component Organization

### File Structure

```
components/
├── ui/                    # Primitive UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── Input/
├── features/              # Feature-specific components
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── SignupForm.tsx
│   └── dashboard/
├── layout/                # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── Footer.tsx
└── shared/                # Shared/cross-cutting
    ├── ErrorBoundary.tsx
    └── LoadingSpinner.tsx
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS.ts`)

## Reusability Guidelines

### When to Extract a Component

1. **Used in 3+ places** - Extract to shared component
2. **Complex logic** - Extract hook or container
3. **Clear abstraction** - Natural boundary exists
4. **Testing in isolation** - Easier to test separately

### When NOT to Extract

1. **Premature abstraction** - Used only once
2. **Too generic** - Prop explosion, complex API
3. **Tight coupling** - Only makes sense in context

## Performance Patterns

### Memoization

```typescript
// Memoize expensive components
const MemoizedList = React.memo(ExpensiveList);

// Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize computed values
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

### Code Splitting

```typescript
// Lazy load routes
const Dashboard = React.lazy(() => import('./Dashboard'));

// Lazy load heavy components
const Chart = React.lazy(() => import('./Chart'));

// With Suspense
<Suspense fallback={<Skeleton />}>
  <Chart data={data} />
</Suspense>
```

## Integration

Used by:
- `frontend-developer` agent
- React/Vue/Next.js stack skills
