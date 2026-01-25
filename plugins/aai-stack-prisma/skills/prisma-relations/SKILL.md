---
name: prisma-relations
description: Prisma relation modeling patterns
user-invocable: false
---

# Prisma Relations Skill

Patterns for modeling relationships in Prisma.

## One-to-One Relations

### Basic One-to-One

```prisma
model User {
  id      String   @id @default(uuid())
  email   String   @unique
  profile Profile?
}

model Profile {
  id     String @id @default(uuid())
  bio    String?
  avatar String?
  userId String @unique
  user   User   @relation(fields: [userId], references: [id])
}
```

### Queries

```typescript
// Create with relation
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    profile: {
      create: { bio: 'Hello world' },
    },
  },
  include: { profile: true },
})

// Update nested
await prisma.user.update({
  where: { id: userId },
  data: {
    profile: {
      upsert: {
        create: { bio: 'New bio' },
        update: { bio: 'Updated bio' },
      },
    },
  },
})

// Delete relation
await prisma.user.update({
  where: { id: userId },
  data: {
    profile: { delete: true },
  },
})
```

## One-to-Many Relations

### Basic One-to-Many

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

### Queries

```typescript
// Create with multiple related
const user = await prisma.user.create({
  data: {
    email: 'author@example.com',
    posts: {
      create: [
        { title: 'Post 1' },
        { title: 'Post 2' },
      ],
    },
  },
  include: { posts: true },
})

// Add to existing relation
await prisma.post.create({
  data: {
    title: 'New Post',
    author: {
      connect: { id: userId },
    },
  },
})

// Update relation
await prisma.user.update({
  where: { id: userId },
  data: {
    posts: {
      create: { title: 'Another Post' },
      updateMany: {
        where: { published: false },
        data: { published: true },
      },
    },
  },
})

// Filter by relation
const users = await prisma.user.findMany({
  where: {
    posts: {
      some: { published: true },
    },
  },
})
```

## Many-to-Many Relations

### Implicit Many-to-Many

```prisma
model Post {
  id         String     @id @default(uuid())
  title      String
  categories Category[]
}

model Category {
  id    String @id @default(uuid())
  name  String @unique
  posts Post[]
}
```

```typescript
// Create with connections
const post = await prisma.post.create({
  data: {
    title: 'My Post',
    categories: {
      connect: [
        { id: 'category-1' },
        { id: 'category-2' },
      ],
    },
  },
})

// Connect or create
const post = await prisma.post.create({
  data: {
    title: 'My Post',
    categories: {
      connectOrCreate: [
        {
          where: { name: 'Tech' },
          create: { name: 'Tech' },
        },
      ],
    },
  },
})

// Set (replace all)
await prisma.post.update({
  where: { id: postId },
  data: {
    categories: {
      set: [{ id: 'category-1' }],
    },
  },
})

// Disconnect
await prisma.post.update({
  where: { id: postId },
  data: {
    categories: {
      disconnect: [{ id: 'category-2' }],
    },
  },
})
```

### Explicit Many-to-Many (Join Table)

```prisma
model Post {
  id   String    @id @default(uuid())
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
  createdBy String?

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([postId, tagId])
}
```

```typescript
// Create with join table data
await prisma.postTag.create({
  data: {
    post: { connect: { id: postId } },
    tag: { connect: { id: tagId } },
    createdBy: userId,
  },
})

// Query with join table data
const posts = await prisma.post.findMany({
  include: {
    tags: {
      include: { tag: true },
    },
  },
})
```

## Self-Relations

### Parent-Child (Tree)

```prisma
model Category {
  id       String     @id @default(uuid())
  name     String
  parentId String?
  parent   Category?  @relation("CategoryTree", fields: [parentId], references: [id])
  children Category[] @relation("CategoryTree")
}
```

```typescript
// Create hierarchy
const parent = await prisma.category.create({
  data: {
    name: 'Electronics',
    children: {
      create: [
        { name: 'Phones' },
        { name: 'Laptops' },
      ],
    },
  },
  include: { children: true },
})

// Get with nested children (recursive requires raw query or multiple queries)
const category = await prisma.category.findUnique({
  where: { id: categoryId },
  include: {
    children: {
      include: {
        children: true,
      },
    },
  },
})
```

### Following/Followers

```prisma
model User {
  id          String @id @default(uuid())
  name        String
  followedBy  User[] @relation("UserFollows")
  following   User[] @relation("UserFollows")
}
```

```typescript
// Follow user
await prisma.user.update({
  where: { id: currentUserId },
  data: {
    following: {
      connect: { id: targetUserId },
    },
  },
})

// Get followers
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    followedBy: { select: { id: true, name: true } },
    following: { select: { id: true, name: true } },
  },
})
```

## Cascade Operations

```prisma
model User {
  id    String @id @default(uuid())
  posts Post[]
}

model Post {
  id       String    @id @default(uuid())
  authorId String
  author   User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments Comment[]
}

model Comment {
  id     String @id @default(uuid())
  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

```typescript
// Deleting user cascades to posts, which cascade to comments
await prisma.user.delete({
  where: { id: userId },
})
```

## Relation Loading Strategies

```typescript
// Include (eager load)
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { posts: true },
})

// Select specific relation fields
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    posts: { select: { id: true, title: true } },
  },
})

// Separate queries (for large relations)
const user = await prisma.user.findUnique({ where: { id: userId } })
const posts = await prisma.post.findMany({ where: { authorId: userId } })
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
