---
name: typeorm-entities
description: TypeORM entity definition patterns
user-invocable: false
---

# TypeORM Entities Skill

Patterns for defining TypeORM entities.

## Basic Entities

### Simple Entity

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ unique: true })
  email: string

  @Column({ nullable: true })
  name: string

  @Column({ default: true })
  active: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

### Column Types

```typescript
@Entity()
export class Example {
  @PrimaryGeneratedColumn('uuid')
  id: string

  // Strings
  @Column()
  name: string

  @Column({ length: 500 })
  description: string

  @Column('text')
  longText: string

  // Numbers
  @Column('int')
  count: number

  @Column('decimal', { precision: 10, scale: 2 })
  price: number

  @Column('bigint')
  largeNumber: string  // bigint stored as string

  // Boolean
  @Column('boolean', { default: false })
  isActive: boolean

  // Dates
  @Column('timestamp')
  eventDate: Date

  @Column('date')
  birthDate: Date

  // JSON
  @Column('jsonb')
  metadata: Record<string, any>

  // Arrays (PostgreSQL)
  @Column('text', { array: true })
  tags: string[]

  // Enum
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole
}

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}
```

### Primary Keys

```typescript
// UUID (recommended)
@PrimaryGeneratedColumn('uuid')
id: string

// Auto-increment
@PrimaryGeneratedColumn()
id: number

// Identity (PostgreSQL)
@PrimaryGeneratedColumn('identity')
id: number

// Custom primary key
@PrimaryColumn()
id: string

// Composite primary key
@Entity()
export class OrderItem {
  @PrimaryColumn()
  orderId: string

  @PrimaryColumn()
  productId: string

  @Column()
  quantity: number
}
```

## Relations

### One-to-One

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToOne(() => Profile, profile => profile.user, {
    cascade: true,
    eager: false,
  })
  profile: Profile
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  bio: string

  @OneToOne(() => User, user => user.profile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User

  @Column()
  userId: string
}
```

### One-to-Many / Many-to-One

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @OneToMany(() => Post, post => post.author)
  posts: Post[]
}

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @ManyToOne(() => User, user => user.posts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'author_id' })
  author: User

  @Column({ name: 'author_id' })
  authorId: string
}
```

### Many-to-Many

```typescript
// Implicit join table
@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable({
    name: 'post_categories',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[]
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToMany(() => Post, post => post.categories)
  posts: Post[]
}

// Explicit join table (with extra columns)
@Entity()
export class PostTag {
  @PrimaryColumn()
  postId: string

  @PrimaryColumn()
  tagId: string

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ManyToOne(() => Post, post => post.tags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: Post

  @ManyToOne(() => Tag, tag => tag.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tagId' })
  tag: Tag
}
```

### Self-Referencing

```typescript
@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ nullable: true })
  parentId: string

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parentId' })
  parent: Category

  @OneToMany(() => Category, category => category.parent)
  children: Category[]
}
```

## Indexes

```typescript
@Entity()
@Index(['email'])
@Index(['organizationId', 'email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Index()
  @Column()
  email: string

  @Index()
  @Column()
  organizationId: string

  // Partial index (PostgreSQL)
  @Index({ where: '"active" = true' })
  @Column()
  active: boolean
}
```

## Entity Inheritance

### Single Table Inheritance

```typescript
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class Content {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string
}

@ChildEntity()
export class Article extends Content {
  @Column()
  body: string
}

@ChildEntity()
export class Video extends Content {
  @Column()
  url: string

  @Column()
  duration: number
}
```

### Embedded Entities

```typescript
export class Address {
  @Column()
  street: string

  @Column()
  city: string

  @Column()
  country: string
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column(() => Address)
  address: Address
}
```

## Entity Listeners

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  password: string

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10)
    }
  }

  @AfterLoad()
  async loadRelatedData() {
    // Called after entity is loaded
  }

  @AfterInsert()
  logInsert() {
    console.log('User inserted:', this.id)
  }
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
- `database-developer` agent
