---
name: typescript-utility-types
description: Built-in TypeScript utility types and their applications
user-invocable: false
---

# TypeScript Utility Types Skill

Comprehensive guide to TypeScript's built-in utility types.

## Property Modifiers

### Partial<T>

Makes all properties optional.

```typescript
interface User {
  id: string
  name: string
  email: string
}

type PartialUser = Partial<User>
// { id?: string; name?: string; email?: string }

// Use case: Update functions
function updateUser(id: string, updates: Partial<User>): User {
  const user = getUser(id)
  return { ...user, ...updates }
}

updateUser('123', { name: 'New Name' })  // Only update name
```

### Required<T>

Makes all properties required.

```typescript
interface Config {
  host?: string
  port?: number
  timeout?: number
}

type RequiredConfig = Required<Config>
// { host: string; port: number; timeout: number }

// Use case: Ensure all config is provided
function initServer(config: RequiredConfig): void {
  // All properties guaranteed to exist
  console.log(`Server at ${config.host}:${config.port}`)
}
```

### Readonly<T>

Makes all properties readonly.

```typescript
interface State {
  count: number
  users: string[]
}

type ReadonlyState = Readonly<State>
// { readonly count: number; readonly users: string[] }

const state: ReadonlyState = { count: 0, users: [] }
// state.count = 1  // Error: Cannot assign to 'count'

// Note: Only shallow - arrays can still be mutated
// state.users.push('new')  // This still works!

// For deep readonly, use custom type or library
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}
```

## Property Selection

### Pick<T, K>

Creates type with only selected properties.

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
}

type UserPreview = Pick<User, 'id' | 'name'>
// { id: string; name: string }

// Use case: API response types
type PublicUser = Pick<User, 'id' | 'name' | 'email'>

function getPublicProfile(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}
```

### Omit<T, K>

Creates type without specified properties.

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
}

type UserWithoutPassword = Omit<User, 'password'>
// { id: string; name: string; email: string }

// Use case: Input types without auto-generated fields
type CreateUserInput = Omit<User, 'id'>

function createUser(input: CreateUserInput): User {
  return { ...input, id: generateId() }
}
```

## Union Types

### Exclude<T, U>

Removes types from a union.

```typescript
type AllStatus = 'pending' | 'active' | 'completed' | 'cancelled'

type ActiveStatus = Exclude<AllStatus, 'pending' | 'cancelled'>
// 'active' | 'completed'

// Use case: Conditional logic
function handleActiveStatus(status: ActiveStatus): void {
  // Only handles 'active' or 'completed'
}
```

### Extract<T, U>

Keeps only types that match.

```typescript
type AllTypes = string | number | boolean | object

type Primitives = Extract<AllTypes, string | number | boolean>
// string | number | boolean

// Use case: Filter function types
type AllEvents =
  | { type: 'click'; x: number; y: number }
  | { type: 'keydown'; key: string }
  | { type: 'scroll'; offset: number }

type ClickEvent = Extract<AllEvents, { type: 'click' }>
// { type: 'click'; x: number; y: number }
```

### NonNullable<T>

Removes null and undefined.

```typescript
type MaybeString = string | null | undefined

type DefiniteString = NonNullable<MaybeString>
// string

// Use case: Ensure non-null after check
function process(value: string | null): NonNullable<typeof value> {
  if (value === null) {
    throw new Error('Value cannot be null')
  }
  return value
}
```

## Function Types

### ReturnType<T>

Extracts return type of a function.

```typescript
function getUser() {
  return { id: '1', name: 'John' }
}

type User = ReturnType<typeof getUser>
// { id: string; name: string }

// Use case: Derive types from existing functions
async function fetchData(): Promise<{ items: string[] }> {
  return { items: [] }
}

type FetchResult = Awaited<ReturnType<typeof fetchData>>
// { items: string[] }
```

### Parameters<T>

Extracts parameter types as tuple.

```typescript
function createUser(name: string, age: number, email?: string): void {}

type CreateUserParams = Parameters<typeof createUser>
// [name: string, age: number, email?: string]

// Use case: Wrap functions
function withLogging<T extends (...args: any[]) => any>(
  fn: T
): (...args: Parameters<T>) => ReturnType<T> {
  return (...args) => {
    console.log('Calling with:', args)
    return fn(...args)
  }
}
```

### ConstructorParameters<T>

Extracts constructor parameter types.

```typescript
class User {
  constructor(public name: string, public age: number) {}
}

type UserConstructorParams = ConstructorParameters<typeof User>
// [name: string, age: number]

// Use case: Factory functions
function createInstance<T extends new (...args: any[]) => any>(
  ctor: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new ctor(...args)
}

const user = createInstance(User, 'John', 30)
```

### InstanceType<T>

Extracts instance type of a constructor.

```typescript
class User {
  name = 'John'
  greet() { return `Hello, ${this.name}` }
}

type UserInstance = InstanceType<typeof User>
// User

// Use case: Generic factories
function getRepository<T extends new () => any>(
  Entity: T
): Repository<InstanceType<T>> {
  return new Repository(Entity)
}
```

## String Types

### Uppercase<T> / Lowercase<T>

Transform string literal types.

```typescript
type Greeting = 'hello'

type Upper = Uppercase<Greeting>  // 'HELLO'
type Lower = Lowercase<'HELLO'>   // 'hello'
```

### Capitalize<T> / Uncapitalize<T>

Capitalize first letter.

```typescript
type Name = 'john'

type CapitalizedName = Capitalize<Name>    // 'John'
type UncapitalizedName = Uncapitalize<'John'>  // 'john'

// Use case: Event handler names
type EventHandlers<T extends string> = {
  [K in T as `on${Capitalize<K>}`]: () => void
}

type ClickHandlers = EventHandlers<'click' | 'hover'>
// { onClick: () => void; onHover: () => void }
```

## Object Types

### Record<K, V>

Creates object type with specific keys and value type.

```typescript
type Status = 'pending' | 'active' | 'completed'

type StatusCounts = Record<Status, number>
// { pending: number; active: number; completed: number }

// Use case: Lookup tables
const statusLabels: Record<Status, string> = {
  pending: 'Waiting',
  active: 'In Progress',
  completed: 'Done',
}

// Dynamic keys
type StringMap = Record<string, string>
```

### ThisParameterType<T> / OmitThisParameter<T>

Work with `this` parameter in functions.

```typescript
function greet(this: { name: string }) {
  return `Hello, ${this.name}`
}

type GreetThis = ThisParameterType<typeof greet>
// { name: string }

type GreetWithoutThis = OmitThisParameter<typeof greet>
// () => string
```

## Awaited<T>

Unwraps Promise types.

```typescript
type PromiseString = Promise<string>
type NestedPromise = Promise<Promise<number>>

type Str = Awaited<PromiseString>    // string
type Num = Awaited<NestedPromise>    // number

// Use case: Async function return types
async function fetchUser(): Promise<{ id: string }> {
  return { id: '1' }
}

type User = Awaited<ReturnType<typeof fetchUser>>
// { id: string }
```

## Combining Utility Types

```typescript
interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

// Create input type: no id, timestamps; optional password
type CreateUserInput = Omit<
  Partial<User>,
  'id' | 'createdAt' | 'updatedAt'
> & {
  name: string
  email: string
}

// Create update input: all optional except id
type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>

// Public user: no password
type PublicUser = Readonly<Omit<User, 'password'>>

// API response with subset
type UserListItem = Pick<User, 'id' | 'name' | 'email'>
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
