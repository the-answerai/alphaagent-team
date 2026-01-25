---
name: vite-hmr
description: Vite Hot Module Replacement patterns
user-invocable: false
---

# Vite HMR Skill

Patterns for Hot Module Replacement in Vite.

## HMR API

### Basic Usage

```typescript
// Check if HMR is available
if (import.meta.hot) {
  // HMR code here
}

// Accept updates to this module
if (import.meta.hot) {
  import.meta.hot.accept()
}

// Accept updates to dependencies
if (import.meta.hot) {
  import.meta.hot.accept('./module.js', (newModule) => {
    console.log('Module updated:', newModule)
  })
}

// Accept multiple dependencies
if (import.meta.hot) {
  import.meta.hot.accept(['./a.js', './b.js'], ([a, b]) => {
    // Handle updates
  })
}
```

### Module Disposal

```typescript
if (import.meta.hot) {
  // Cleanup before module is replaced
  import.meta.hot.dispose((data) => {
    // data can be used to pass state to the new module
    data.savedState = getCurrentState()

    // Cleanup side effects
    clearInterval(intervalId)
    socket.disconnect()
  })
}

// Access disposed data in new module
if (import.meta.hot) {
  import.meta.hot.accept()

  // Restore state from previous version
  if (import.meta.hot.data.savedState) {
    restoreState(import.meta.hot.data.savedState)
  }
}
```

### Decline Updates

```typescript
// Decline HMR, trigger full reload
if (import.meta.hot) {
  import.meta.hot.decline()
}
```

### Invalidate

```typescript
if (import.meta.hot) {
  // Force parent module to re-import this module
  import.meta.hot.invalidate()
}
```

## State Preservation

### Preserving Component State

```typescript
// Custom state preservation
let state = { count: 0 }

if (import.meta.hot) {
  // Restore state from previous version
  if (import.meta.hot.data.state) {
    state = import.meta.hot.data.state
  }

  import.meta.hot.accept()

  // Save state before disposal
  import.meta.hot.dispose((data) => {
    data.state = state
  })
}

export function increment() {
  state.count++
}
```

### Store Preservation

```typescript
// For global stores like Zustand
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}))

// Preserve store across HMR
if (import.meta.hot) {
  if (import.meta.hot.data.store) {
    useStore.setState(import.meta.hot.data.store.getState())
  }

  import.meta.hot.dispose((data) => {
    data.store = useStore
  })
}

export default useStore
```

## Custom Events

### Sending Events

```typescript
// From server/plugin
server.ws.send({
  type: 'custom',
  event: 'my-event',
  data: { message: 'Hello' },
})
```

### Receiving Events

```typescript
if (import.meta.hot) {
  import.meta.hot.on('my-event', (data) => {
    console.log('Received:', data.message)
  })
}
```

### Full Page Reload

```typescript
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeFullReload', (payload) => {
    console.log('About to full reload:', payload)
  })
}
```

## React Fast Refresh

### Setup

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,  // Enabled by default
    }),
  ],
})
```

### Preserving State

```tsx
// State is automatically preserved in function components

function Counter() {
  const [count, setCount] = useState(0)
  // count value is preserved during HMR
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

### Opt-Out of Fast Refresh

```tsx
// Add this comment to prevent Fast Refresh
// @refresh reset

function Component() {
  // Component will fully remount on changes
}
```

## HMR Boundaries

### Understanding Boundaries

```typescript
// Parent.tsx imports Child.tsx
// When Child.tsx changes:
// 1. Vite tries to apply HMR to Child.tsx
// 2. If Child accepts, only Child updates
// 3. If not, Parent is checked
// 4. Chain continues until boundary is found
// 5. If no boundary, full reload

// React Fast Refresh creates boundaries at component level
```

### Custom Boundaries

```typescript
// Mark module as HMR boundary
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Handle update manually
    updateComponent(newModule.default)
  })
}
```

## Debugging HMR

### Verbose Logging

```typescript
// In browser console
localStorage.debug = 'vite:*'

// Or specific
localStorage.debug = 'vite:hmr'
```

### HMR Events

```typescript
if (import.meta.hot) {
  // Before update is applied
  import.meta.hot.on('vite:beforeUpdate', (payload) => {
    console.log('Before update:', payload)
  })

  // After update is applied
  import.meta.hot.on('vite:afterUpdate', (payload) => {
    console.log('After update:', payload)
  })

  // Before full reload
  import.meta.hot.on('vite:beforeFullReload', (payload) => {
    console.log('Before reload:', payload)
  })

  // Before prune (unused modules removed)
  import.meta.hot.on('vite:beforePrune', (payload) => {
    console.log('Before prune:', payload)
  })

  // Invalidate
  import.meta.hot.on('vite:invalidate', (payload) => {
    console.log('Invalidate:', payload)
  })

  // Error
  import.meta.hot.on('vite:error', (payload) => {
    console.error('HMR error:', payload)
  })
}
```

## Common Issues

### State Reset

```typescript
// Issue: State resets on save
// Solution: Ensure proper HMR boundaries

// BAD: Anonymous arrow functions
export default () => <div />

// GOOD: Named function components
export default function MyComponent() {
  return <div />
}
```

### Side Effects

```typescript
// Issue: Side effects run multiple times
// Solution: Cleanup in dispose

let interval: number

function startPolling() {
  interval = setInterval(fetchData, 1000)
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(interval)
  })
}

startPolling()
```

### CSS Not Updating

```typescript
// Issue: CSS changes not reflecting
// Vite handles CSS HMR automatically
// If issues, check for:
// 1. CSS modules naming
// 2. PostCSS config errors
// 3. Imported in multiple places
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
