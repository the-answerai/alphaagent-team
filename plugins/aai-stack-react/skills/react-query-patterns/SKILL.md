---
name: react-query-patterns
description: TanStack Query (React Query) patterns for data fetching and caching
user-invocable: false
---

# React Query Patterns Skill

Patterns for using TanStack Query effectively for server state management.

## Basic Queries

### Simple Query

```tsx
import { useQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <Spinner />
  if (error) return <Error error={error} />

  return <div>{data.name}</div>
}
```

### Query with Options

```tsx
const { data, isLoading, isError, refetch, isFetching } = useQuery({
  queryKey: ['users', { status: 'active' }],
  queryFn: () => fetchUsers({ status: 'active' }),
  staleTime: 5 * 60 * 1000,       // Data fresh for 5 minutes
  gcTime: 30 * 60 * 1000,         // Cache for 30 minutes (formerly cacheTime)
  refetchOnWindowFocus: false,    // Don't refetch on window focus
  refetchOnMount: true,           // Refetch when component mounts
  retry: 3,                       // Retry failed requests 3 times
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
})
```

### Dependent Queries

```tsx
function UserPosts({ userId }: { userId: string }) {
  // First query
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  // Dependent query - only runs when user exists
  const { data: posts } = useQuery({
    queryKey: ['posts', user?.id],
    queryFn: () => fetchUserPosts(user!.id),
    enabled: !!user,  // Only run when user is defined
  })

  return <PostList posts={posts} />
}
```

## Mutations

### Basic Mutation

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query'

function CreateTodo() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (newTodo: CreateTodoInput) => createTodo(newTodo),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      mutation.mutate({ title: 'New Todo' })
    }}>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create Todo'}
      </button>
    </form>
  )
}
```

### Optimistic Updates

```tsx
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['todos', newTodo.id] })

    // Snapshot previous value
    const previousTodo = queryClient.getQueryData(['todos', newTodo.id])

    // Optimistically update
    queryClient.setQueryData(['todos', newTodo.id], newTodo)

    // Return context with snapshot
    return { previousTodo }
  },
  onError: (err, newTodo, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos', newTodo.id], context?.previousTodo)
  },
  onSettled: (data, error, variables) => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['todos', variables.id] })
  },
})
```

### Mutation with Callbacks

```tsx
const mutation = useMutation({
  mutationFn: deleteTodo,
  onSuccess: (data, variables, context) => {
    toast.success('Todo deleted!')
  },
  onError: (error, variables, context) => {
    toast.error(`Failed to delete: ${error.message}`)
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] })
  },
})

// Per-mutation callbacks
mutation.mutate(todoId, {
  onSuccess: () => {
    navigate('/todos')  // Override or extend mutation callbacks
  },
})
```

## Query Keys

### Structured Query Keys

```tsx
// Factory pattern for query keys
const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: TodoFilters) => [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: string) => [...todoKeys.details(), id] as const,
}

// Usage
useQuery({
  queryKey: todoKeys.detail(todoId),
  queryFn: () => fetchTodo(todoId),
})

// Invalidation is easy
queryClient.invalidateQueries({ queryKey: todoKeys.lists() })  // All lists
queryClient.invalidateQueries({ queryKey: todoKeys.all })      // Everything todo-related
```

## Pagination

### Offset Pagination

```tsx
function PaginatedPosts() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching, isPreviousData } = useQuery({
    queryKey: ['posts', page],
    queryFn: () => fetchPosts(page),
    placeholderData: keepPreviousData,  // Show previous data while loading
  })

  return (
    <div>
      {isLoading ? (
        <Spinner />
      ) : (
        <div style={{ opacity: isFetching ? 0.5 : 1 }}>
          {data.posts.map(post => <Post key={post.id} {...post} />)}
        </div>
      )}

      <button
        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
        disabled={page === 1}
      >
        Previous
      </button>
      <span>Page {page}</span>
      <button
        onClick={() => setPage(prev => prev + 1)}
        disabled={!data?.hasMore}
      >
        Next
      </button>
    </div>
  )
}
```

### Infinite Queries

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

function InfinitePosts() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: ({ pageParam }) => fetchPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined
    },
  })

  if (status === 'pending') return <Spinner />
  if (status === 'error') return <Error />

  return (
    <div>
      {data.pages.map((group, i) => (
        <Fragment key={i}>
          {group.posts.map(post => <Post key={post.id} {...post} />)}
        </Fragment>
      ))}

      <button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
      >
        {isFetchingNextPage
          ? 'Loading more...'
          : hasNextPage
          ? 'Load More'
          : 'Nothing more to load'}
      </button>
    </div>
  )
}
```

## Prefetching

### Hover Prefetch

```tsx
function TodoList({ todos }: { todos: Todo[] }) {
  const queryClient = useQueryClient()

  const prefetchTodo = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: ['todo', id],
      queryFn: () => fetchTodo(id),
      staleTime: 60 * 1000,  // Only prefetch if data is older than 1 minute
    })
  }

  return (
    <ul>
      {todos.map(todo => (
        <li
          key={todo.id}
          onMouseEnter={() => prefetchTodo(todo.id)}
        >
          <Link to={`/todo/${todo.id}`}>{todo.title}</Link>
        </li>
      ))}
    </ul>
  )
}
```

### Preload on Route

```tsx
// Route loader
export async function loader({ params }: LoaderFunctionArgs) {
  await queryClient.ensureQueryData({
    queryKey: ['todo', params.id],
    queryFn: () => fetchTodo(params.id!),
  })
  return null
}
```

## Suspense

### Query with Suspense

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

function UserProfile({ userId }: { userId: string }) {
  // No loading state needed - Suspense handles it
  const { data } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  return <div>{data.name}</div>
}

// Wrap with Suspense boundary
<Suspense fallback={<Spinner />}>
  <UserProfile userId="123" />
</Suspense>
```

### Parallel Suspense Queries

```tsx
import { useSuspenseQueries } from '@tanstack/react-query'

function Dashboard({ userId }: { userId: string }) {
  const [userQuery, postsQuery, statsQuery] = useSuspenseQueries({
    queries: [
      { queryKey: ['user', userId], queryFn: () => fetchUser(userId) },
      { queryKey: ['posts', userId], queryFn: () => fetchUserPosts(userId) },
      { queryKey: ['stats', userId], queryFn: () => fetchUserStats(userId) },
    ],
  })

  return (
    <div>
      <UserInfo user={userQuery.data} />
      <PostList posts={postsQuery.data} />
      <Stats stats={statsQuery.data} />
    </div>
  )
}
```

## Cache Management

### Manual Cache Updates

```tsx
// Set data directly
queryClient.setQueryData(['todo', todoId], updatedTodo)

// Update with function
queryClient.setQueryData(['todos'], (old: Todo[] | undefined) => {
  return old ? [...old, newTodo] : [newTodo]
})

// Get cached data
const cachedTodo = queryClient.getQueryData(['todo', todoId])

// Remove from cache
queryClient.removeQueries({ queryKey: ['todo', todoId] })
```

### Invalidation Strategies

```tsx
// Invalidate exact key
queryClient.invalidateQueries({ queryKey: ['todos', { status: 'done' }], exact: true })

// Invalidate all matching
queryClient.invalidateQueries({ queryKey: ['todos'] })

// Invalidate with predicate
queryClient.invalidateQueries({
  predicate: (query) =>
    query.queryKey[0] === 'todos' &&
    (query.queryKey[1] as TodoFilters)?.status === 'done',
})

// Refetch immediately
queryClient.refetchQueries({ queryKey: ['todos'] })
```

## Error Handling

### Global Error Handler

```tsx
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (error instanceof UnauthorizedError) {
        navigate('/login')
      } else {
        toast.error(`Query failed: ${error.message}`)
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(`Mutation failed: ${error.message}`)
    },
  }),
})
```

### Error Boundaries

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

function App() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div>
              <p>Error: {error.message}</p>
              <button onClick={resetErrorBoundary}>Try again</button>
            </div>
          )}
        >
          <TodoList />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
