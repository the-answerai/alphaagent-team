---
name: typeorm-queries
description: TypeORM query patterns
user-invocable: false
---

# TypeORM Queries Skill

Patterns for querying data with TypeORM.

## Repository Pattern

### Basic CRUD

```typescript
import { Repository } from 'typeorm'
import { AppDataSource } from './data-source'
import { User } from './entities/User'

const userRepository: Repository<User> = AppDataSource.getRepository(User)

// Create
const user = userRepository.create({
  email: 'john@example.com',
  name: 'John',
})
await userRepository.save(user)

// Or create and save
const user = await userRepository.save({
  email: 'john@example.com',
  name: 'John',
})

// Find one
const user = await userRepository.findOne({
  where: { id: '123' },
})

const user = await userRepository.findOneBy({ email: 'john@example.com' })

const user = await userRepository.findOneOrFail({
  where: { id: '123' },
})

// Find many
const users = await userRepository.find()

const users = await userRepository.find({
  where: { active: true },
  order: { createdAt: 'DESC' },
  take: 10,
  skip: 0,
})

// Update
await userRepository.update({ id: '123' }, { name: 'John Doe' })

// Or find and save
const user = await userRepository.findOneBy({ id: '123' })
user.name = 'John Doe'
await userRepository.save(user)

// Delete
await userRepository.delete({ id: '123' })

// Soft delete (requires @DeleteDateColumn)
await userRepository.softDelete({ id: '123' })
await userRepository.restore({ id: '123' })
```

### Advanced Find Options

```typescript
const users = await userRepository.find({
  // Select specific columns
  select: ['id', 'email', 'name'],

  // Where conditions
  where: {
    active: true,
    role: 'admin',
  },

  // Or conditions
  where: [
    { role: 'admin' },
    { role: 'moderator' },
  ],

  // Relations
  relations: ['profile', 'posts'],

  // Order
  order: {
    createdAt: 'DESC',
    name: 'ASC',
  },

  // Pagination
  take: 10,
  skip: 20,

  // Include soft-deleted
  withDeleted: true,

  // Cache
  cache: true,
  // or
  cache: {
    id: 'users_active',
    milliseconds: 60000,
  },
})
```

### Where Operators

```typescript
import { LessThan, MoreThan, Between, Like, In, IsNull, Not } from 'typeorm'

const users = await userRepository.find({
  where: {
    // Comparison
    age: MoreThan(18),
    age: LessThan(65),
    age: Between(18, 65),

    // String matching
    email: Like('%@example.com'),
    name: ILike('%john%'),  // Case-insensitive

    // In array
    role: In(['admin', 'moderator']),

    // Null checks
    deletedAt: IsNull(),
    deletedAt: Not(IsNull()),

    // Not
    status: Not('inactive'),

    // Raw query
    createdAt: Raw(alias => `${alias} > NOW() - INTERVAL '7 days'`),
  },
})
```

## Query Builder

### Basic Queries

```typescript
// Select
const users = await userRepository
  .createQueryBuilder('user')
  .where('user.active = :active', { active: true })
  .orderBy('user.createdAt', 'DESC')
  .getMany()

// Single result
const user = await userRepository
  .createQueryBuilder('user')
  .where('user.id = :id', { id: '123' })
  .getOne()

// Count
const count = await userRepository
  .createQueryBuilder('user')
  .where('user.active = :active', { active: true })
  .getCount()

// Raw result
const result = await userRepository
  .createQueryBuilder('user')
  .select('user.role', 'role')
  .addSelect('COUNT(*)', 'count')
  .groupBy('user.role')
  .getRawMany()
```

### Joins

```typescript
// Left join
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('user.posts', 'post')
  .getMany()

// Inner join
const users = await userRepository
  .createQueryBuilder('user')
  .innerJoinAndSelect('user.posts', 'post')
  .where('post.published = :published', { published: true })
  .getMany()

// Join without select
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoin('user.posts', 'post')
  .where('post.published = :published', { published: true })
  .getMany()

// Join with condition
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.posts', 'post', 'post.published = :published', {
    published: true,
  })
  .getMany()
```

### Complex Conditions

```typescript
const users = await userRepository
  .createQueryBuilder('user')
  .where('user.active = :active', { active: true })
  .andWhere('user.role IN (:...roles)', { roles: ['admin', 'moderator'] })
  .orWhere(
    new Brackets(qb => {
      qb.where('user.email LIKE :email', { email: '%@admin.com' })
        .andWhere('user.verified = :verified', { verified: true })
    })
  )
  .getMany()

// Subquery
const users = await userRepository
  .createQueryBuilder('user')
  .where(qb => {
    const subQuery = qb
      .subQuery()
      .select('post.authorId')
      .from(Post, 'post')
      .where('post.published = :published', { published: true })
      .getQuery()
    return 'user.id IN ' + subQuery
  })
  .getMany()
```

### Aggregations

```typescript
// Group by with aggregates
const stats = await userRepository
  .createQueryBuilder('user')
  .select('user.role', 'role')
  .addSelect('COUNT(*)', 'count')
  .addSelect('AVG(user.age)', 'avgAge')
  .groupBy('user.role')
  .having('COUNT(*) > :min', { min: 5 })
  .getRawMany()
```

### Update and Delete

```typescript
// Update
await userRepository
  .createQueryBuilder()
  .update(User)
  .set({ active: false })
  .where('lastLogin < :date', { date: thirtyDaysAgo })
  .execute()

// Delete
await userRepository
  .createQueryBuilder()
  .delete()
  .from(User)
  .where('id = :id', { id: '123' })
  .execute()

// Soft delete
await userRepository
  .createQueryBuilder()
  .softDelete()
  .where('id = :id', { id: '123' })
  .execute()
```

## Transactions

```typescript
import { AppDataSource } from './data-source'

// Using transaction manager
await AppDataSource.transaction(async (manager) => {
  const user = manager.create(User, { email: 'new@example.com' })
  await manager.save(user)

  const profile = manager.create(Profile, { userId: user.id })
  await manager.save(profile)
})

// Using query runner
const queryRunner = AppDataSource.createQueryRunner()
await queryRunner.connect()
await queryRunner.startTransaction()

try {
  await queryRunner.manager.save(user)
  await queryRunner.manager.save(profile)
  await queryRunner.commitTransaction()
} catch (err) {
  await queryRunner.rollbackTransaction()
  throw err
} finally {
  await queryRunner.release()
}
```

## Performance

### Pagination

```typescript
// Offset pagination
const [users, total] = await userRepository.findAndCount({
  skip: (page - 1) * pageSize,
  take: pageSize,
})

// Cursor pagination
const users = await userRepository
  .createQueryBuilder('user')
  .where('user.id > :cursor', { cursor: lastId })
  .orderBy('user.id', 'ASC')
  .take(pageSize)
  .getMany()
```

### Eager Loading

```typescript
// Explicit loading
const users = await userRepository.find({
  relations: ['profile', 'posts', 'posts.comments'],
})

// Or with query builder
const users = await userRepository
  .createQueryBuilder('user')
  .leftJoinAndSelect('user.profile', 'profile')
  .leftJoinAndSelect('user.posts', 'post')
  .leftJoinAndSelect('post.comments', 'comment')
  .getMany()
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
- `database-developer` agent
