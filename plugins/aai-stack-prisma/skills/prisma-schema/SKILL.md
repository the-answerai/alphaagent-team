---
name: prisma-schema
description: Prisma schema design patterns
user-invocable: false
---

# Prisma Schema Skill

Patterns for designing Prisma schemas.

## Basic Schema Structure

### Model Definition

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts    Post[]
  profile  Profile?
  sessions Session[]

  @@index([email])
  @@map("users")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Field Types

```prisma
model Example {
  // Scalar types
  id        String   @id @default(uuid())
  name      String
  bio       String?  // Optional
  age       Int
  price     Float
  active    Boolean  @default(true)
  count     BigInt

  // Dates
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime?

  // Database-specific
  data      Json
  content   String   @db.Text
  amount    Decimal  @db.Decimal(10, 2)
  metadata  Bytes
}
```

### ID Strategies

```prisma
// UUID (recommended for distributed systems)
model User {
  id String @id @default(uuid())
}

// CUID (shorter, URL-safe)
model Post {
  id String @id @default(cuid())
}

// Auto-increment
model Legacy {
  id Int @id @default(autoincrement())
}

// Composite ID
model OrderItem {
  orderId   String
  productId String

  @@id([orderId, productId])
}
```

## Relationships

### One-to-One

```prisma
model User {
  id      String   @id @default(uuid())
  profile Profile?
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### One-to-Many

```prisma
model User {
  id    String @id @default(uuid())
  posts Post[]
}

model Post {
  id       String @id @default(uuid())
  title    String
  authorId String
  author   User   @relation(fields: [authorId], references: [id])

  @@index([authorId])
}
```

### Many-to-Many (Implicit)

```prisma
model Post {
  id         String     @id @default(uuid())
  title      String
  categories Category[]
}

model Category {
  id    String @id @default(uuid())
  name  String
  posts Post[]
}
```

### Many-to-Many (Explicit)

```prisma
model Post {
  id   String     @id @default(uuid())
  tags PostTag[]
}

model Tag {
  id    String    @id @default(uuid())
  name  String    @unique
  posts PostTag[]
}

model PostTag {
  postId    String
  tagId     String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}
```

### Self-Relations

```prisma
model Category {
  id       String     @id @default(uuid())
  name     String
  parentId String?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
}

model User {
  id          String @id @default(uuid())
  followedBy  User[] @relation("UserFollows")
  following   User[] @relation("UserFollows")
}
```

## Constraints and Indexes

### Unique Constraints

```prisma
model User {
  id    String @id @default(uuid())
  email String @unique

  // Compound unique
  @@unique([organizationId, email])
}
```

### Indexes

```prisma
model Post {
  id        String   @id @default(uuid())
  authorId  String
  status    String
  createdAt DateTime @default(now())

  // Single column index
  @@index([authorId])

  // Compound index
  @@index([status, createdAt])

  // Named index
  @@index([authorId], name: "post_author_idx")
}
```

### Full-Text Search Index

```prisma
model Article {
  id      String @id @default(uuid())
  title   String
  content String

  @@fulltext([title, content])
}
```

## Referential Actions

```prisma
model Post {
  id       String @id @default(uuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  // Options:
  // Cascade - Delete related records
  // SetNull - Set FK to null (requires optional field)
  // Restrict - Prevent deletion
  // NoAction - Database handles it
  // SetDefault - Set to default value
}
```

## Multi-Tenancy

```prisma
model Organization {
  id    String @id @default(uuid())
  name  String
  users User[]
  posts Post[]
}

model User {
  id             String       @id @default(uuid())
  email          String
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, email])
  @@index([organizationId])
}

model Post {
  id             String       @id @default(uuid())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
}
```

## Soft Delete Pattern

```prisma
model Post {
  id        String    @id @default(uuid())
  title     String
  deletedAt DateTime?
  isDeleted Boolean   @default(false)

  @@index([isDeleted])
}
```

## Audit Fields

```prisma
model Resource {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy String?
  updatedBy String?
}
```

## Enum Patterns

```prisma
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

model Order {
  id     String      @id @default(uuid())
  status OrderStatus @default(PENDING)
}
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
