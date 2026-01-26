---
name: test-data-management
description: Test data creation and management patterns
---

# Test Data Management Skill

Patterns for creating and managing test data.

## Factory Pattern

### Basic Factory

```typescript
// factories/user.factory.ts
import { faker } from '@faker-js/faker'

interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: Date
}

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'user',
    createdAt: faker.date.past(),
    ...overrides
  }
}

// Create multiple
export function createUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUser(overrides))
}
```

### Factory with Traits

```typescript
// factories/user.factory.ts
type UserTrait = 'admin' | 'verified' | 'unverified' | 'premium'

const traits: Record<UserTrait, Partial<User>> = {
  admin: { role: 'admin' },
  verified: { emailVerified: true, verifiedAt: new Date() },
  unverified: { emailVerified: false, verifiedAt: null },
  premium: { plan: 'premium', planExpiresAt: faker.date.future() }
}

export function createUser(
  overrides: Partial<User> = {},
  ...userTraits: UserTrait[]
): User {
  const traitOverrides = userTraits.reduce(
    (acc, trait) => ({ ...acc, ...traits[trait] }),
    {}
  )

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: 'user',
    emailVerified: false,
    createdAt: faker.date.past(),
    ...traitOverrides,
    ...overrides
  }
}

// Usage
const adminUser = createUser({}, 'admin', 'verified')
const premiumUser = createUser({ name: 'John' }, 'premium', 'verified')
```

### Related Factories

```typescript
// factories/order.factory.ts
import { createUser } from './user.factory'
import { createProduct } from './product.factory'

export function createOrder(overrides: Partial<Order> = {}): Order {
  const user = overrides.user || createUser()
  const items = overrides.items || [
    { product: createProduct(), quantity: 1 }
  ]

  return {
    id: faker.string.uuid(),
    user,
    items,
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    status: 'pending',
    createdAt: new Date(),
    ...overrides
  }
}

// Usage
const order = createOrder({
  user: createUser({}, 'premium'),
  items: [
    { product: createProduct({ price: 100 }), quantity: 2 }
  ]
})
```

## Fixture Pattern

### Static Fixtures

```typescript
// fixtures/users.ts
export const fixtures = {
  validUser: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user'
  },

  adminUser: {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin'
  },

  invalidUsers: {
    missingEmail: { name: 'No Email' },
    invalidEmail: { email: 'not-an-email', name: 'Bad' }
  }
}
```

### Database Seeding

```typescript
// fixtures/seed.ts
import { AppDataSource } from '../data-source'
import { User } from '../entities/User'
import { createUser, createUsers } from './factories/user.factory'

export async function seedDatabase() {
  const userRepository = AppDataSource.getRepository(User)

  // Create admin
  const admin = createUser({}, 'admin', 'verified')
  await userRepository.save(admin)

  // Create regular users
  const users = createUsers(10, {}, 'verified')
  await userRepository.save(users)

  return { admin, users }
}

export async function clearDatabase() {
  const entities = AppDataSource.entityMetadatas

  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name)
    await repository.query(`TRUNCATE "${entity.tableName}" CASCADE`)
  }
}
```

## Builder Pattern

```typescript
// builders/user.builder.ts
class UserBuilder {
  private user: Partial<User> = {}

  withEmail(email: string): this {
    this.user.email = email
    return this
  }

  withName(name: string): this {
    this.user.name = name
    return this
  }

  asAdmin(): this {
    this.user.role = 'admin'
    return this
  }

  verified(): this {
    this.user.emailVerified = true
    this.user.verifiedAt = new Date()
    return this
  }

  withPlan(plan: 'free' | 'premium'): this {
    this.user.plan = plan
    return this
  }

  build(): User {
    return createUser(this.user)
  }
}

export const userBuilder = () => new UserBuilder()

// Usage
const user = userBuilder()
  .withEmail('john@example.com')
  .asAdmin()
  .verified()
  .build()
```

## Database Test Helpers

### Transaction Rollback

```typescript
// helpers/database.ts
import { DataSource, QueryRunner } from 'typeorm'

export class DatabaseTestHelper {
  private queryRunner: QueryRunner

  constructor(private dataSource: DataSource) {}

  async startTransaction() {
    this.queryRunner = this.dataSource.createQueryRunner()
    await this.queryRunner.connect()
    await this.queryRunner.startTransaction()
  }

  async rollback() {
    await this.queryRunner.rollbackTransaction()
    await this.queryRunner.release()
  }

  get manager() {
    return this.queryRunner.manager
  }
}

// Usage in tests
describe('UserService', () => {
  let dbHelper: DatabaseTestHelper

  beforeEach(async () => {
    dbHelper = new DatabaseTestHelper(dataSource)
    await dbHelper.startTransaction()
  })

  afterEach(async () => {
    await dbHelper.rollback()
  })

  it('should create user', async () => {
    const user = await dbHelper.manager.save(User, createUser())
    expect(user.id).toBeDefined()
  })
})
```

## API Response Mocking

```typescript
// mocks/api-responses.ts
export const mockResponses = {
  users: {
    list: {
      data: createUsers(5),
      pagination: { page: 1, limit: 10, total: 5 }
    },
    single: {
      data: createUser()
    },
    error: {
      error: { code: 'NOT_FOUND', message: 'User not found' }
    }
  }
}

// Usage with MSW
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/users', (req, res, ctx) => {
    return res(ctx.json(mockResponses.users.list))
  })
)
```

## Integration

Used by:
- `unit-test-developer` agent
- `api-test-developer` agent
- `e2e-test-developer` agent
