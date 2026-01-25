---
name: data-modeling
description: Patterns for entity relationship design and data modeling
user-invocable: false
---

# Data Modeling Skill

Patterns for designing effective data models.

## Entity-Relationship Design

### Identifying Entities

```
Questions to ask:
1. What are the core "things" in the system?
2. What data needs to be persisted?
3. What has its own identity/lifecycle?

Examples:
- User (has identity, persisted)
- Order (has identity, persisted)
- Session token (temporary, maybe not entity)
```

### Defining Relationships

```prisma
// One-to-One: Each user has exactly one profile
model User {
  profile Profile?
}
model Profile {
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}

// One-to-Many: User has many posts
model User {
  posts Post[]
}
model Post {
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}

// Many-to-Many: Posts have many tags, tags have many posts
model Post {
  tags Tag[]
}
model Tag {
  posts Post[]
}
```

### Cardinality Decisions

| Relationship | When to Use | Example |
|--------------|-------------|---------|
| 1:1 | Optional extension data | User -> Profile |
| 1:N | Parent owns children | Order -> OrderItems |
| M:N | Independent association | Post <-> Tag |

## Common Domain Models

### User/Auth Model

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String
  emailVerified Boolean   @default(false)

  // Profile data
  name          String?
  avatarUrl     String?

  // Auth
  sessions      Session[]
  apiKeys       ApiKey[]

  // Audit
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  userAgent String?
  ipAddress String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

### E-Commerce Model

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  sku         String   @unique

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  orderItems  OrderItem[]
  inventory   Inventory?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id         String      @id @default(uuid())
  status     OrderStatus @default(PENDING)
  total      Decimal     @db.Decimal(10, 2)

  userId     String
  user       User        @relation(fields: [userId], references: [id])

  items      OrderItem[]
  payments   Payment[]
  shipments  Shipment[]

  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
}

model OrderItem {
  id        String  @id @default(uuid())
  quantity  Int
  unitPrice Decimal @db.Decimal(10, 2)

  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])

  productId String
  product   Product @relation(fields: [productId], references: [id])

  @@unique([orderId, productId])
}
```

### Content/CMS Model

```prisma
model Post {
  id          String    @id @default(uuid())
  slug        String    @unique
  title       String
  content     String    @db.Text
  excerpt     String?
  published   Boolean   @default(false)
  publishedAt DateTime?

  authorId    String
  author      User      @relation(fields: [authorId], references: [id])

  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])

  tags        Tag[]
  comments    Comment[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([authorId])
  @@index([published, publishedAt])
}

model Comment {
  id        String   @id @default(uuid())
  content   String   @db.Text
  approved  Boolean  @default(false)

  postId    String
  post      Post     @relation(fields: [postId], references: [id])

  authorId  String
  author    User     @relation(fields: [authorId], references: [id])

  // Self-referential for replies
  parentId  String?
  parent    Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")

  createdAt DateTime @default(now())
}
```

## Design Patterns

### Polymorphic Associations

```prisma
// Activity feed for different entity types
model Activity {
  id         String   @id @default(uuid())
  action     String   // "created", "updated", "deleted"
  targetType String   // "Post", "Comment", "User"
  targetId   String

  userId     String
  user       User     @relation(fields: [userId], references: [id])

  metadata   Json?    // Flexible extra data

  createdAt  DateTime @default(now())

  @@index([targetType, targetId])
  @@index([userId])
}
```

### Event Sourcing

```prisma
model Event {
  id          String   @id @default(uuid())
  aggregateId String
  type        String
  version     Int
  data        Json
  metadata    Json?

  createdAt   DateTime @default(now())

  @@unique([aggregateId, version])
  @@index([aggregateId])
  @@index([type])
}

// Rebuild state from events
async function getOrderState(orderId: string) {
  const events = await prisma.event.findMany({
    where: { aggregateId: orderId },
    orderBy: { version: 'asc' },
  });

  return events.reduce((state, event) => {
    switch (event.type) {
      case 'OrderCreated':
        return { ...event.data, items: [] };
      case 'ItemAdded':
        return { ...state, items: [...state.items, event.data] };
      case 'OrderCompleted':
        return { ...state, status: 'completed' };
      default:
        return state;
    }
  }, {} as Order);
}
```

### Audit Trail

```prisma
model AuditLog {
  id         String   @id @default(uuid())
  tableName  String
  recordId   String
  action     String   // INSERT, UPDATE, DELETE
  oldData    Json?
  newData    Json?

  userId     String?
  user       User?    @relation(fields: [userId], references: [id])

  ipAddress  String?
  userAgent  String?

  createdAt  DateTime @default(now())

  @@index([tableName, recordId])
  @@index([userId])
  @@index([createdAt])
}
```

### Temporal Data (Slowly Changing Dimensions)

```prisma
// Type 2: Keep history
model PriceHistory {
  id        String   @id @default(uuid())
  productId String
  price     Decimal  @db.Decimal(10, 2)
  validFrom DateTime @default(now())
  validTo   DateTime?

  product   Product  @relation(fields: [productId], references: [id])

  @@index([productId, validFrom])
}

// Get current price
async function getCurrentPrice(productId: string) {
  return prisma.priceHistory.findFirst({
    where: {
      productId,
      validFrom: { lte: new Date() },
      OR: [
        { validTo: null },
        { validTo: { gt: new Date() } },
      ],
    },
    orderBy: { validFrom: 'desc' },
  });
}
```

## Anti-Patterns to Avoid

### God Tables

```prisma
// Bad: One table for everything
model Entity {
  id   String @id
  type String
  data Json   // Untyped, unindexed mess
}

// Good: Specific models
model User { ... }
model Post { ... }
model Order { ... }
```

### Too Much Normalization

```prisma
// Bad: Over-normalized address
model Street { ... }
model City { ... }
model State { ... }
model Country { ... }

// Good: Denormalized where appropriate
model Address {
  id      String @id
  line1   String
  line2   String?
  city    String
  state   String
  country String
  postal  String
}
```

### Missing Constraints

```prisma
// Bad: No constraints
model OrderItem {
  id        String @id
  orderId   String
  productId String
  quantity  Int    // Can be negative?
}

// Good: Proper constraints
model OrderItem {
  id        String @id
  orderId   String
  productId String
  quantity  Int    // Add check constraint in SQL

  @@unique([orderId, productId]) // Prevent duplicates
}
```

## Integration

Used by:
- `database-developer` agent
- All database and ORM stack skills
