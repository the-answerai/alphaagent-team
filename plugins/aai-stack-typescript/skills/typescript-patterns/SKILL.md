---
name: typescript-patterns
description: TypeScript best practices and common patterns
user-invocable: false
---

# TypeScript Patterns Skill

Best practices and patterns for writing type-safe TypeScript code.

## Type Definitions

### Interfaces vs Types

```typescript
// Use interfaces for object shapes (can be extended)
interface User {
  id: string
  name: string
  email: string
}

interface AdminUser extends User {
  permissions: string[]
}

// Use types for unions, intersections, and complex types
type Status = 'pending' | 'active' | 'inactive'
type Nullable<T> = T | null
type UserOrAdmin = User | AdminUser
```

### Readonly and Immutability

```typescript
// Readonly properties
interface Config {
  readonly apiUrl: string
  readonly timeout: number
}

// Readonly arrays
const items: readonly string[] = ['a', 'b', 'c']
// items.push('d')  // Error!

// Deep readonly
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

const config: DeepReadonly<Config> = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
}
```

### Optional vs Required

```typescript
interface UserInput {
  name: string              // Required
  email: string             // Required
  phone?: string            // Optional
  age?: number              // Optional
}

// Make all properties required
type RequiredUser = Required<UserInput>

// Make all properties optional
type PartialUser = Partial<UserInput>

// Pick specific properties
type UserContact = Pick<UserInput, 'email' | 'phone'>

// Omit specific properties
type UserWithoutAge = Omit<UserInput, 'age'>
```

## Discriminated Unions

### Pattern Matching with Unions

```typescript
interface LoadingState {
  status: 'loading'
}

interface SuccessState {
  status: 'success'
  data: unknown
}

interface ErrorState {
  status: 'error'
  error: Error
}

type AsyncState = LoadingState | SuccessState | ErrorState

function handleState(state: AsyncState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return `Data: ${JSON.stringify(state.data)}`
    case 'error':
      return `Error: ${state.error.message}`
  }
}

// Exhaustiveness checking
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`)
}

function handleStateExhaustive(state: AsyncState) {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return `Data: ${JSON.stringify(state.data)}`
    case 'error':
      return `Error: ${state.error.message}`
    default:
      return assertNever(state)  // Compile error if case is missing
  }
}
```

### Result Types

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E }

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { ok: false, error: 'Division by zero' }
  }
  return { ok: true, value: a / b }
}

const result = divide(10, 2)
if (result.ok) {
  console.log(result.value)  // TypeScript knows value exists
} else {
  console.log(result.error)  // TypeScript knows error exists
}
```

## Type Guards

### Custom Type Guards

```typescript
interface Dog {
  kind: 'dog'
  bark(): void
}

interface Cat {
  kind: 'cat'
  meow(): void
}

type Animal = Dog | Cat

// Type guard function
function isDog(animal: Animal): animal is Dog {
  return animal.kind === 'dog'
}

function handleAnimal(animal: Animal) {
  if (isDog(animal)) {
    animal.bark()  // TypeScript knows it's a Dog
  } else {
    animal.meow()  // TypeScript knows it's a Cat
  }
}
```

### Type Assertions

```typescript
// Type assertion (use sparingly)
const value = someFunction() as string

// Non-null assertion (use sparingly)
const element = document.getElementById('root')!

// Const assertion (preferred for literals)
const config = {
  endpoint: '/api',
  method: 'GET',
} as const
// config.method is type 'GET', not string
```

## Nullability Handling

### Optional Chaining

```typescript
interface Response {
  data?: {
    user?: {
      name?: string
    }
  }
}

function getUserName(response: Response): string {
  // Optional chaining
  return response.data?.user?.name ?? 'Unknown'
}
```

### Nullish Coalescing

```typescript
// ?? only uses fallback for null/undefined
const value = someValue ?? 'default'

// Different from || which uses fallback for all falsy
const count = 0
const result1 = count || 10    // 10 (0 is falsy)
const result2 = count ?? 10    // 0 (0 is not null/undefined)
```

### Non-nullable

```typescript
type Nullable<T> = T | null | undefined

function process<T>(value: Nullable<T>): NonNullable<T> {
  if (value == null) {
    throw new Error('Value is null or undefined')
  }
  return value
}
```

## Function Types

### Function Signatures

```typescript
// Function type
type Comparator<T> = (a: T, b: T) => number

// Function with overloads
function format(value: string): string
function format(value: number): string
function format(value: string | number): string {
  return String(value)
}

// Arrow function with type
const add: (a: number, b: number) => number = (a, b) => a + b

// Generic function
function identity<T>(value: T): T {
  return value
}
```

### Rest Parameters

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0)
}

// Typed rest parameters with tuple
function log(level: string, ...messages: string[]): void {
  console.log(`[${level}]`, ...messages)
}
```

## Class Patterns

### Abstract Classes

```typescript
abstract class BaseService {
  abstract fetchData(): Promise<unknown>

  protected log(message: string): void {
    console.log(`[${this.constructor.name}] ${message}`)
  }
}

class UserService extends BaseService {
  async fetchData(): Promise<User[]> {
    this.log('Fetching users')
    return fetch('/api/users').then(r => r.json())
  }
}
```

### Constructor Parameter Properties

```typescript
class User {
  constructor(
    public readonly id: string,
    public name: string,
    private password: string,
    protected email: string
  ) {}
}

// Equivalent to:
class UserExplicit {
  public readonly id: string
  public name: string
  private password: string
  protected email: string

  constructor(id: string, name: string, password: string, email: string) {
    this.id = id
    this.name = name
    this.password = password
    this.email = email
  }
}
```

## Module Patterns

### Barrel Exports

```typescript
// components/index.ts
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'

// types/index.ts
export type { User, UserInput } from './user'
export type { Config } from './config'
```

### Type-Only Imports

```typescript
// Import only types (erased at runtime)
import type { User, Config } from './types'

// Mixed import
import { createUser, type User } from './user'
```

## Best Practices

### Avoid `any`

```typescript
// Bad
function process(data: any): any {
  return data.value
}

// Good
function process<T extends { value: unknown }>(data: T): T['value'] {
  return data.value
}

// If you truly need escape hatch, use `unknown`
function processUnknown(data: unknown): string {
  if (typeof data === 'string') {
    return data
  }
  throw new Error('Expected string')
}
```

### Strict Mode Settings

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
