---
name: query-optimization
description: Patterns for optimizing database query performance
user-invocable: false
---

# Query Optimization Skill

Patterns for improving database query performance.

## Understanding Query Performance

### EXPLAIN ANALYZE

```sql
-- PostgreSQL
EXPLAIN ANALYZE
SELECT u.*, COUNT(p.id) as post_count
FROM users u
LEFT JOIN posts p ON p.author_id = u.id
WHERE u.role = 'ADMIN'
GROUP BY u.id;

-- Key metrics to watch:
-- - Seq Scan vs Index Scan
-- - Actual rows vs Estimated rows
-- - Sort operations
-- - Nested loops vs Hash joins
```

### Query Plan Reading

```
Seq Scan         -- Full table scan (often bad)
Index Scan       -- Using index (good)
Index Only Scan  -- All data from index (best)
Bitmap Scan      -- Multiple index matches
Hash Join        -- Good for large joins
Nested Loop      -- Good for small inner table
Sort             -- May use disk if large
```

## Indexing Strategies

### When to Index

```sql
-- Index: Foreign keys (always)
CREATE INDEX idx_posts_author_id ON posts(author_id);

-- Index: Frequently filtered columns
CREATE INDEX idx_users_role ON users(role);

-- Index: Columns in ORDER BY
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Index: Columns in JOIN conditions
CREATE INDEX idx_comments_post_id ON comments(post_id);
```

### Composite Indexes

```sql
-- Order matters! Most selective first
CREATE INDEX idx_posts_status_date
ON posts(published, published_at DESC);

-- Covers queries like:
SELECT * FROM posts WHERE published = true ORDER BY published_at DESC;
SELECT * FROM posts WHERE published = true AND published_at > '2024-01-01';

-- Does NOT help:
SELECT * FROM posts WHERE published_at > '2024-01-01'; -- Needs leading column
```

### Partial Indexes

```sql
-- Only index active records
CREATE INDEX idx_active_users_email
ON users(email)
WHERE deleted_at IS NULL;

-- Only index specific values
CREATE INDEX idx_pending_orders
ON orders(created_at)
WHERE status = 'pending';
```

### Covering Indexes

```sql
-- Include all needed columns to avoid table lookup
CREATE INDEX idx_users_covering
ON users(email) INCLUDE (name, role);

-- Query can be satisfied entirely from index:
SELECT email, name, role FROM users WHERE email = 'test@example.com';
```

## Query Patterns

### Avoid N+1 Queries

```typescript
// Bad: N+1 queries
const users = await prisma.user.findMany();
for (const user of users) {
  user.posts = await prisma.post.findMany({
    where: { authorId: user.id },
  });
}

// Good: Eager loading
const users = await prisma.user.findMany({
  include: { posts: true },
});

// Good: Separate batch query
const users = await prisma.user.findMany();
const posts = await prisma.post.findMany({
  where: { authorId: { in: users.map(u => u.id) } },
});
```

### Efficient Pagination

```typescript
// Offset pagination (slow for large offsets)
const users = await prisma.user.findMany({
  skip: 10000,
  take: 20,
  orderBy: { createdAt: 'desc' },
});

// Cursor pagination (consistent performance)
const users = await prisma.user.findMany({
  take: 20,
  cursor: { id: lastUserId },
  orderBy: { createdAt: 'desc' },
});

// Keyset pagination (fastest for sorted data)
const users = await prisma.user.findMany({
  where: {
    createdAt: { lt: lastCreatedAt },
  },
  take: 20,
  orderBy: { createdAt: 'desc' },
});
```

### Selective Field Loading

```typescript
// Bad: Load everything
const users = await prisma.user.findMany();

// Good: Only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### Bulk Operations

```typescript
// Bad: Individual inserts
for (const item of items) {
  await prisma.item.create({ data: item });
}

// Good: Batch insert
await prisma.item.createMany({
  data: items,
  skipDuplicates: true,
});

// Good: Batch update
await prisma.item.updateMany({
  where: { status: 'pending' },
  data: { status: 'processed' },
});
```

## Common Optimizations

### Avoid SELECT *

```sql
-- Bad
SELECT * FROM users WHERE id = 1;

-- Good
SELECT id, name, email FROM users WHERE id = 1;
```

### Use EXISTS vs IN

```sql
-- IN (loads all values into memory)
SELECT * FROM users
WHERE id IN (SELECT author_id FROM posts WHERE published = true);

-- EXISTS (stops at first match)
SELECT * FROM users u
WHERE EXISTS (SELECT 1 FROM posts p WHERE p.author_id = u.id AND p.published = true);
```

### Optimize OR Conditions

```sql
-- Bad (may not use index)
SELECT * FROM users WHERE email = 'a@b.com' OR name = 'John';

-- Better (union uses indexes)
SELECT * FROM users WHERE email = 'a@b.com'
UNION
SELECT * FROM users WHERE name = 'John';
```

### Use Appropriate JOINs

```sql
-- INNER JOIN: Only matching rows (most selective)
SELECT u.*, p.title
FROM users u
INNER JOIN posts p ON p.author_id = u.id;

-- LEFT JOIN: All from left, matching from right
SELECT u.*, p.title
FROM users u
LEFT JOIN posts p ON p.author_id = u.id;

-- Avoid: Cartesian products
SELECT * FROM users, posts; -- Bad!
```

## Caching Strategies

### Query Result Caching

```typescript
async function getPopularPosts(): Promise<Post[]> {
  const cacheKey = 'popular-posts';
  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { viewCount: 'desc' },
    take: 10,
  });

  await redis.setex(cacheKey, 300, JSON.stringify(posts)); // 5 min TTL
  return posts;
}
```

### Materialized Views

```sql
-- Create materialized view for expensive aggregations
CREATE MATERIALIZED VIEW post_stats AS
SELECT
  author_id,
  COUNT(*) as post_count,
  SUM(view_count) as total_views,
  MAX(published_at) as last_published
FROM posts
WHERE published = true
GROUP BY author_id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW post_stats;

-- Or refresh concurrently (no lock)
REFRESH MATERIALIZED VIEW CONCURRENTLY post_stats;
```

## Monitoring Queries

### Slow Query Log

```sql
-- PostgreSQL: Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s

-- View slow queries
SELECT query, calls, mean_time, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### Connection Pooling

```typescript
// Prisma with connection pool
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Pool settings
  connectionLimit = 10
}

// Or external pooler (PgBouncer)
DATABASE_URL="postgres://user:pass@pgbouncer:6432/db?pgbouncer=true"
```

## Integration

Used by:
- `database-developer` agent
- All database stack skills
