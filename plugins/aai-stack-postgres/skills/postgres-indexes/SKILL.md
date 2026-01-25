---
name: postgres-indexes
description: PostgreSQL indexing strategies and optimization
user-invocable: false
---

# PostgreSQL Indexes Skill

Patterns for creating and optimizing PostgreSQL indexes.

## Index Types

### B-tree Index (Default)

```sql
-- Most common, good for equality and range queries
CREATE INDEX idx_users_email ON users(email);

-- Compound index
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Unique index
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

### Hash Index

```sql
-- Fast for equality comparisons only
CREATE INDEX idx_users_username_hash ON users USING HASH(username);
```

### GIN Index (Generalized Inverted)

```sql
-- For arrays
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- For JSONB
CREATE INDEX idx_products_metadata ON products USING GIN(metadata);

-- For full-text search
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);
```

### GiST Index (Generalized Search Tree)

```sql
-- For geometric types
CREATE INDEX idx_locations_point ON locations USING GIST(location);

-- For range types
CREATE INDEX idx_events_duration ON events USING GIST(duration);

-- For full-text search (alternative to GIN)
CREATE INDEX idx_articles_search_gist ON articles USING GIST(search_vector);
```

### BRIN Index (Block Range)

```sql
-- Efficient for large, naturally ordered tables
CREATE INDEX idx_logs_created ON logs USING BRIN(created_at);

-- Very compact, good for append-only tables
CREATE INDEX idx_events_timestamp ON events USING BRIN(timestamp);
```

## Partial Indexes

```sql
-- Index only active users
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';

-- Index only recent orders
CREATE INDEX idx_recent_orders ON orders(created_at)
WHERE created_at > '2024-01-01';

-- Index only non-null values
CREATE INDEX idx_users_phone ON users(phone) WHERE phone IS NOT NULL;
```

## Expression Indexes

```sql
-- Index on lower case email
CREATE INDEX idx_users_email_lower ON users(LOWER(email));

-- Index on date part
CREATE INDEX idx_orders_date ON orders(DATE(created_at));

-- Index on JSONB expression
CREATE INDEX idx_products_color ON products((metadata->>'color'));

-- Index on computed value
CREATE INDEX idx_orders_year_month ON orders(
  EXTRACT(YEAR FROM created_at),
  EXTRACT(MONTH FROM created_at)
);
```

## Covering Indexes

```sql
-- Include non-key columns in index
CREATE INDEX idx_orders_user_covering ON orders(user_id)
INCLUDE (total, status, created_at);

-- Query can use index-only scan
SELECT total, status, created_at
FROM orders
WHERE user_id = 123;
```

## Index Maintenance

### Analyze Index Usage

```sql
-- Check index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexrelid NOT IN (
    SELECT conindid FROM pg_constraint WHERE contype = 'p'
  )
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Duplicate Index Detection

```sql
-- Find duplicate indexes
SELECT
  array_agg(indexname) as duplicate_indexes,
  tablename
FROM (
  SELECT
    i.relname as indexname,
    t.relname as tablename,
    array_to_string(array_agg(a.attname ORDER BY a.attnum), ', ') as columns
  FROM pg_index ix
  JOIN pg_class i ON i.oid = ix.indexrelid
  JOIN pg_class t ON t.oid = ix.indrelid
  JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
  WHERE t.relkind = 'r'
  GROUP BY i.relname, t.relname
) sub
GROUP BY tablename, columns
HAVING COUNT(*) > 1;
```

### Index Bloat

```sql
-- Check index bloat
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE indexrelname NOT LIKE '%pkey%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Reindex bloated index
REINDEX INDEX CONCURRENTLY idx_orders_user;

-- Reindex entire table
REINDEX TABLE CONCURRENTLY orders;
```

## Concurrent Operations

```sql
-- Create index without locking table
CREATE INDEX CONCURRENTLY idx_large_table ON large_table(column);

-- Drop index without locking
DROP INDEX CONCURRENTLY idx_old_index;

-- Reindex without locking
REINDEX INDEX CONCURRENTLY idx_bloated;
```

## Index Selection Guide

| Query Pattern | Best Index Type |
|---------------|-----------------|
| Equality (WHERE x = y) | B-tree (default) |
| Range (WHERE x > y) | B-tree |
| Pattern match (LIKE 'prefix%') | B-tree |
| Array contains (x = ANY(arr)) | GIN |
| JSONB queries | GIN |
| Full-text search | GIN or GiST |
| Geometric/spatial | GiST |
| Large ordered tables | BRIN |

## Query Plan Analysis

```sql
-- Check if index is used
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 123;

-- Force index usage for testing
SET enable_seqscan = off;
EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 123;
SET enable_seqscan = on;
```

## Best Practices

```sql
-- 1. Index foreign keys
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- 2. Index columns used in WHERE clauses
CREATE INDEX idx_users_status ON users(status);

-- 3. Index columns used in ORDER BY
CREATE INDEX idx_posts_created_desc ON posts(created_at DESC);

-- 4. Compound indexes for multi-column queries
CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC);

-- 5. Use partial indexes for frequently filtered subsets
CREATE INDEX idx_pending_orders ON orders(created_at)
WHERE status = 'pending';
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
