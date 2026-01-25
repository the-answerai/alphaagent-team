---
name: state-management
description: Patterns for managing application state - local, global, server, and URL state
user-invocable: false
---

# State Management Skill

Patterns for choosing and implementing state management strategies in frontend applications.

## State Categories

### 1. Local UI State
State that only affects a single component.

```typescript
// Form input values
const [value, setValue] = useState('');

// Toggle states
const [isOpen, setIsOpen] = useState(false);

// Loading/error states
const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
```

### 2. Shared UI State
State shared between components (lift state up or use context).

```typescript
// Theme context
const ThemeContext = createContext<Theme>('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 3. Server State
Data from external sources (use TanStack Query, SWR, or similar).

```typescript
// TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

// Mutations
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### 4. URL State
State that should be shareable/bookmarkable.

```typescript
// Next.js App Router
import { useSearchParams, useRouter } from 'next/navigation';

function FilteredList() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = searchParams.get('filter') || 'all';

  const setFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', value);
    router.push(`?${params.toString()}`);
  };

  return <Filters value={filter} onChange={setFilter} />;
}
```

## State Management Libraries

### When to Use What

| Use Case | Solution |
|----------|----------|
| Simple local state | `useState` |
| Complex local state | `useReducer` |
| Cross-component state | Context API |
| Global app state | Zustand, Redux Toolkit |
| Server state | TanStack Query, SWR |
| Form state | React Hook Form, Formik |
| URL state | Router params/search params |

### Zustand (Recommended for Global State)

```typescript
import { create } from 'zustand';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}

const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [...state.notifications, notification],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

### TanStack Query (Server State)

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Custom hook for domain logic
function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    select: (data) => data.users,
  });
}
```

## State Patterns

### Derived State
Compute values instead of storing them.

```typescript
// Bad: Synced state
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);

// Good: Derived state
const [items, setItems] = useState([]);
const total = useMemo(
  () => items.reduce((sum, item) => sum + item.price, 0),
  [items]
);
```

### State Machines
For complex state transitions.

```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';

function useAsync<T>() {
  const [state, setState] = useState<{
    status: Status;
    data: T | null;
    error: Error | null;
  }>({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = async (promise: Promise<T>) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const data = await promise;
      setState({ status: 'success', data, error: null });
    } catch (error) {
      setState({ status: 'error', data: null, error: error as Error });
    }
  };

  return { ...state, execute };
}
```

### Optimistic Updates

```typescript
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos'] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos']);

    // Optimistically update
    queryClient.setQueryData(['todos'], (old) =>
      old.map((t) => (t.id === newTodo.id ? newTodo : t))
    );

    return { previousTodos };
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});
```

## Anti-Patterns

### Avoid These

1. **Prop Drilling**: Use context or state management library
2. **State Syncing**: Derive state instead of syncing
3. **Storing Derived Data**: Compute on render
4. **Global State for Local Concerns**: Keep state close
5. **Mutating State Directly**: Always use setter functions

## Decision Framework

```
Is the state...

1. Used by only this component?
   → useState/useReducer

2. Shared by a few nearby components?
   → Lift state up to common ancestor

3. Used across many unrelated components?
   → Context or global store

4. From an external API?
   → TanStack Query/SWR

5. Should be in the URL?
   → Router state (params/search)

6. Complex with many transitions?
   → State machine (XState, useReducer)
```

## Integration

Used by:
- `frontend-developer` agent
- React/Next.js stack skills
