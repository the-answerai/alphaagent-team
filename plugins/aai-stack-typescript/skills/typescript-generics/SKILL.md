---
name: typescript-generics
description: TypeScript generics patterns for reusable type-safe code
user-invocable: false
---

# TypeScript Generics Skill

Patterns for using generics to create flexible, type-safe code.

## Basic Generics

### Generic Functions

```typescript
// Simple generic function
function identity<T>(value: T): T {
  return value
}

const str = identity('hello')   // type: string
const num = identity(42)        // type: number

// Multiple type parameters
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

const result = pair('name', 42)  // type: [string, number]

// Default type parameter
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value)
}

const strings = createArray(3, 'a')     // type: string[]
const numbers = createArray<number>(3, 0)  // type: number[]
```

### Generic Interfaces

```typescript
// Generic interface
interface Container<T> {
  value: T
  getValue(): T
  setValue(value: T): void
}

// Generic class implementing interface
class Box<T> implements Container<T> {
  constructor(public value: T) {}

  getValue(): T {
    return this.value
  }

  setValue(value: T): void {
    this.value = value
  }
}

const stringBox = new Box('hello')
const numberBox = new Box(42)
```

### Generic Types

```typescript
// Generic type alias
type Nullable<T> = T | null | undefined
type AsyncResult<T> = Promise<T>
type KeyValuePair<K, V> = { key: K; value: V }

// Generic mapped type
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

// Generic conditional type
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
```

## Constraints

### Basic Constraints

```typescript
// Constrain to objects with specific property
function getLength<T extends { length: number }>(item: T): number {
  return item.length
}

getLength('hello')      // OK
getLength([1, 2, 3])    // OK
getLength({ length: 5 }) // OK
// getLength(42)        // Error: number doesn't have length

// Constrain to specific types
interface Identifiable {
  id: string
}

function findById<T extends Identifiable>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id)
}
```

### keyof Constraint

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'John', age: 30 }
const name = getProperty(user, 'name')  // type: string
const age = getProperty(user, 'age')    // type: number
// getProperty(user, 'email')           // Error: 'email' is not a key

// Setting properties
function setProperty<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value
}
```

### Multiple Constraints

```typescript
// Intersection constraint
interface Named {
  name: string
}

interface Aged {
  age: number
}

function greet<T extends Named & Aged>(entity: T): string {
  return `Hello ${entity.name}, you are ${entity.age} years old`
}

// Generic constraint on another type parameter
function merge<T, U extends T>(base: T, override: Partial<U>): T {
  return { ...base, ...override }
}
```

## Advanced Patterns

### Conditional Types

```typescript
// Basic conditional
type IsString<T> = T extends string ? true : false

type A = IsString<string>  // true
type B = IsString<number>  // false

// Distributive conditional types
type ToArray<T> = T extends unknown ? T[] : never

type C = ToArray<string | number>  // string[] | number[]

// Non-distributive (wrap in tuple)
type ToArrayNonDist<T> = [T] extends [unknown] ? T[] : never

type D = ToArrayNonDist<string | number>  // (string | number)[]
```

### infer Keyword

```typescript
// Extract return type
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Fn = () => string
type Result = ReturnType<Fn>  // string

// Extract array element type
type ElementType<T> = T extends (infer E)[] ? E : never

type Elem = ElementType<string[]>  // string

// Extract Promise type
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T

type P = Awaited<Promise<Promise<string>>>  // string

// Extract function parameter types
type Parameters<T> = T extends (...args: infer P) => any ? P : never

type Params = Parameters<(a: string, b: number) => void>  // [string, number]
```

### Mapped Types with Generics

```typescript
// Make all properties optional
type Partial<T> = {
  [P in keyof T]?: T[P]
}

// Make all properties required
type Required<T> = {
  [P in keyof T]-?: T[P]
}

// Transform property types
type Stringify<T> = {
  [P in keyof T]: string
}

// Rename properties
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P]
}

interface Person {
  name: string
  age: number
}

type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }
```

### Template Literal Types

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`

type ClickEvent = EventName<'click'>  // 'onClick'
type HoverEvent = EventName<'hover'>  // 'onHover'

// Dynamic property names
type PropEventSource<T> = {
  on<K extends string & keyof T>(
    eventName: `${K}Changed`,
    callback: (newValue: T[K]) => void
  ): void
}

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>

const person = makeWatchedObject({
  name: 'John',
  age: 30,
})

person.on('nameChanged', (newName) => {
  // newName is string
})

person.on('ageChanged', (newAge) => {
  // newAge is number
})
```

## Generic Classes

### Repository Pattern

```typescript
interface Entity {
  id: string
}

class Repository<T extends Entity> {
  private items: Map<string, T> = new Map()

  findById(id: string): T | undefined {
    return this.items.get(id)
  }

  findAll(): T[] {
    return Array.from(this.items.values())
  }

  save(item: T): void {
    this.items.set(item.id, item)
  }

  delete(id: string): boolean {
    return this.items.delete(id)
  }

  findWhere(predicate: (item: T) => boolean): T[] {
    return this.findAll().filter(predicate)
  }
}

interface User extends Entity {
  name: string
  email: string
}

const userRepo = new Repository<User>()
userRepo.save({ id: '1', name: 'John', email: 'john@example.com' })
```

### Builder Pattern

```typescript
class QueryBuilder<T> {
  private query: Partial<T> = {}

  where<K extends keyof T>(key: K, value: T[K]): this {
    this.query[key] = value
    return this
  }

  build(): Partial<T> {
    return { ...this.query }
  }
}

interface User {
  name: string
  age: number
  email: string
}

const query = new QueryBuilder<User>()
  .where('name', 'John')
  .where('age', 30)
  .build()
// { name: 'John', age: 30 }
```

## Factory Patterns

### Generic Factory Function

```typescript
interface Constructor<T> {
  new (...args: any[]): T
}

function createInstance<T>(ctor: Constructor<T>, ...args: any[]): T {
  return new ctor(...args)
}

class User {
  constructor(public name: string) {}
}

const user = createInstance(User, 'John')  // type: User
```

### Abstract Factory

```typescript
interface Animal {
  speak(): string
}

class Dog implements Animal {
  speak() { return 'Woof!' }
}

class Cat implements Animal {
  speak() { return 'Meow!' }
}

function createAnimalFactory<T extends Animal>(AnimalClass: new () => T) {
  return (): T => new AnimalClass()
}

const createDog = createAnimalFactory(Dog)
const createCat = createAnimalFactory(Cat)

const dog = createDog()  // type: Dog
const cat = createCat()  // type: Cat
```

## Utility Type Implementations

```typescript
// Pick implementation
type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// Omit implementation
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

// Exclude implementation
type Exclude<T, U> = T extends U ? never : T

// Extract implementation
type Extract<T, U> = T extends U ? T : never

// NonNullable implementation
type NonNullable<T> = T extends null | undefined ? never : T

// Record implementation
type Record<K extends keyof any, T> = {
  [P in K]: T
}
```

## Integration

Used by:
- `frontend-developer` agent
- `backend-developer` agent
- `fullstack-developer` agent
