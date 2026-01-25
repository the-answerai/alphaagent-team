---
name: schema-design
description: Patterns for designing database schemas with proper normalization and relationships
user-invocable: false
---

# Schema Design Skill

Patterns for designing effective database schemas.

## Core Principles

### 1. Choose Appropriate Primary Keys

```sql
-- UUID (recommended for distributed systems)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- ULID (sortable, URL-safe)
CREATE TABLE posts (
  id CHAR(26) PRIMARY KEY,
  ...
);

-- Auto-increment (simple, sequential)
CREATE TABLE logs (
  id SERIAL PRIMARY KEY,
  ...
);
```

### 2. Define Clear Relationships

```prisma
// One-to-One
model User {
  id      String   @id @default(uuid())
  profile Profile?
}

model Profile {
  id     String @id @default(uuid())
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

// One-to-Many
model User {
  id    String @id @default(uuid())
  posts Post[]
}

model Post {
  id       String @id @default(uuid())
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}

// Many-to-Many
model Post {
  id   String @id @default(uuid())
  tags Tag[]
}

model Tag {
  id    String @id @default(uuid())
  posts Post[]
}

// Explicit join table (when you need extra fields)
model PostTag {
  postId    String
  tagId     String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])

  @@id([postId, tagId])
}
```

### 3. Use Appropriate Data Types

```sql
-- Text
VARCHAR(255)  -- Names, emails, short text
TEXT          -- Long content, descriptions
CHAR(2)       -- Country codes, fixed-length

-- Numbers
INTEGER       -- Counts, IDs
BIGINT        -- Large numbers, timestamps
DECIMAL(10,2) -- Money, precise decimals
REAL/FLOAT    -- Scientific (avoid for money!)

-- Date/Time
TIMESTAMP     -- Date + time with timezone
DATE          -- Date only
INTERVAL      -- Time periods

-- Binary
BYTEA         -- Binary data, files
UUID          -- Universally unique identifiers

-- JSON
JSONB         -- Flexible data, preferences
```

### 4. Add Standard Fields

```prisma
model BaseEntity {
  // Primary key
  id        String   @id @default(uuid())

  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Soft delete
  deletedAt DateTime?

  // Audit (optional)
  createdBy String?
  updatedBy String?
}
```

## Normalization

### First Normal Form (1NF)
- No repeating groups
- Atomic values in each column

```sql
-- Bad: Multiple values in one column
CREATE TABLE users (
  id INT,
  phone_numbers VARCHAR(255) -- "123-456, 789-012"
);

-- Good: Separate table
CREATE TABLE users (
  id INT PRIMARY KEY
);

CREATE TABLE user_phones (
  id INT PRIMARY KEY,
  user_id INT REFERENCES users(id),
  phone_number VARCHAR(20)
);
```

### Second Normal Form (2NF)
- Must be in 1NF
- No partial dependencies on composite keys

```sql
-- Bad: Partial dependency
CREATE TABLE order_items (
  order_id INT,
  product_id INT,
  product_name VARCHAR(255), -- Depends only on product_id
  quantity INT,
  PRIMARY KEY (order_id, product_id)
);

-- Good: Separate tables
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE order_items (
  order_id INT,
  product_id INT REFERENCES products(id),
  quantity INT,
  PRIMARY KEY (order_id, product_id)
);
```

### Third Normal Form (3NF)
- Must be in 2NF
- No transitive dependencies

```sql
-- Bad: Transitive dependency
CREATE TABLE employees (
  id INT PRIMARY KEY,
  department_id INT,
  department_name VARCHAR(255) -- Depends on department_id, not employee
);

-- Good: Separate tables
CREATE TABLE departments (
  id INT PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE employees (
  id INT PRIMARY KEY,
  department_id INT REFERENCES departments(id)
);
```

### When to Denormalize

- **Read-heavy workloads**: Cache computed values
- **Reporting**: Pre-aggregate data
- **Performance**: Avoid expensive joins
- **Audit trails**: Snapshot data at point in time

```sql
-- Denormalized for performance
CREATE TABLE orders (
  id INT PRIMARY KEY,
  user_id INT,
  -- Snapshot at order time
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  -- Cached totals
  item_count INT,
  total_amount DECIMAL(10,2)
);
```

## Common Patterns

### Polymorphic Relations

```prisma
// Option 1: Separate tables
model Comment {
  id        String @id @default(uuid())
  content   String
  postId    String?
  articleId String?

  post    Post?    @relation(fields: [postId], references: [id])
  article Article? @relation(fields: [articleId], references: [id])
}

// Option 2: Type column + ID
model Comment {
  id            String @id @default(uuid())
  content       String
  targetType    String // "post" | "article"
  targetId      String

  @@index([targetType, targetId])
}
```

### Self-Referential Relations

```prisma
// Hierarchical data (categories, org chart)
model Category {
  id       String     @id @default(uuid())
  name     String
  parentId String?
  parent   Category?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children Category[] @relation("CategoryHierarchy")
}

// User relationships (followers)
model User {
  id        String @id @default(uuid())
  following Follow[] @relation("Following")
  followers Follow[] @relation("Followers")
}

model Follow {
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("Following", fields: [followerId], references: [id])
  following User @relation("Followers", fields: [followingId], references: [id])

  @@id([followerId, followingId])
}
```

### Enums vs Lookup Tables

```prisma
// Enum (fixed, small set)
enum Role {
  USER
  ADMIN
  MODERATOR
}

model User {
  role Role @default(USER)
}

// Lookup table (dynamic, many values)
model Status {
  id   Int    @id @default(autoincrement())
  name String @unique
  orders Order[]
}

model Order {
  statusId Int
  status   Status @relation(fields: [statusId], references: [id])
}
```

## Multi-Tenant Patterns

### Column-Based Isolation

```prisma
model Tenant {
  id   String @id @default(uuid())
  name String
}

model User {
  id       String @id @default(uuid())
  tenantId String

  tenant Tenant @relation(fields: [tenantId], references: [id])

  @@index([tenantId])
}

// Always filter by tenant
const users = await prisma.user.findMany({
  where: { tenantId: currentTenant.id },
});
```

### Schema-Based Isolation

```sql
-- One schema per tenant
CREATE SCHEMA tenant_123;
CREATE TABLE tenant_123.users (...);

-- Dynamic schema selection
SET search_path TO tenant_123;
SELECT * FROM users;
```

## Integration

Used by:
- `database-developer` agent
- Prisma/TypeORM stack skills
