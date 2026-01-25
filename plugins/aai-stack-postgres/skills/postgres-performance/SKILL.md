---
name: postgres-performance
description: PostgreSQL performance tuning and optimization
user-invocable: false
---

# PostgreSQL Performance Skill

Patterns for optimizing PostgreSQL performance.

## Query Analysis

### EXPLAIN ANALYZE

```sql
-- Basic explain
EXPLAIN ANALYZE
SELECT * FROM orders WHERE user_id = 123;

-- With more detail
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 123;

-- JSON format for tools
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
SELECT * FROM orders WHERE user_id = 123;
```

### Reading Query Plans

```
Key indicators to watch:
- Seq Scan: Full table scan (often bad for large tables)
- Index Scan: Using index (good)
- Index Only Scan: All data from index (best)
- Bitmap Heap Scan: Multiple index matches
- Nested Loop: Good for small tables, bad for large
- Hash Join: Good for large tables
- Sort: Watch for "Sort Method: external" (disk sort)
```

### Slow Query Identification

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
SELECT pg_reload_conf();

-- Query pg_stat_statements (requires extension)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

SELECT
  query,
  calls,
  total_exec_time / calls as avg_time,
  rows / calls as avg_rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

## Connection Pooling

### PgBouncer Configuration

```ini
# pgbouncer.ini
[databases]
mydb = host=localhost dbname=mydb

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
auth_type = md5
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 20
```

### Application-Level Pooling

```typescript
// With pg-pool
import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  database: 'mydb',
  max: 20,                    // Max connections
  idleTimeoutMillis: 30000,   // Close idle connections
  connectionTimeoutMillis: 2000,
})

// Use pool
const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
```

## Query Optimization

### Avoid SELECT *

```sql
-- Bad
SELECT * FROM orders WHERE user_id = 123;

-- Good
SELECT id, total, status, created_at
FROM orders
WHERE user_id = 123;
```

### Efficient Pagination

```sql
-- Bad: Offset pagination (slow for large offsets)
SELECT * FROM products
ORDER BY created_at DESC
OFFSET 10000 LIMIT 20;

-- Good: Keyset pagination
SELECT * FROM products
WHERE created_at < '2024-01-15T10:00:00Z'
ORDER BY created_at DESC
LIMIT 20;

-- Good: Cursor-based with index
SELECT * FROM products
WHERE (created_at, id) < ('2024-01-15T10:00:00Z', 'last-id')
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

### Batch Operations

```sql
-- Instead of multiple single inserts
INSERT INTO orders (user_id, total) VALUES (1, 100);
INSERT INTO orders (user_id, total) VALUES (2, 200);

-- Use multi-value insert
INSERT INTO orders (user_id, total) VALUES
  (1, 100),
  (2, 200),
  (3, 300);

-- Or COPY for bulk inserts
COPY orders (user_id, total) FROM '/tmp/orders.csv' WITH CSV;
```

### EXISTS vs IN

```sql
-- IN loads all values into memory
SELECT * FROM users
WHERE id IN (SELECT user_id FROM orders WHERE total > 1000);

-- EXISTS stops at first match (often faster)
SELECT * FROM users u
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.user_id = u.id AND o.total > 1000
);
```

## Table Maintenance

### VACUUM

```sql
-- Regular vacuum (reclaims space, updates stats)
VACUUM users;

-- Vacuum with analysis
VACUUM ANALYZE users;

-- Full vacuum (locks table, reclaims all space)
VACUUM FULL users;

-- Check vacuum status
SELECT
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum,
  vacuum_count,
  autovacuum_count
FROM pg_stat_user_tables
ORDER BY last_vacuum DESC NULLS LAST;
```

### ANALYZE

```sql
-- Update statistics for query planner
ANALYZE users;

-- Analyze specific columns
ANALYZE users (email, status);

-- Check statistics
SELECT
  attname,
  null_frac,
  n_distinct,
  correlation
FROM pg_stats
WHERE tablename = 'users';
```

### Table Bloat

```sql
-- Check table bloat
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
  pg_size_pretty(pg_relation_size(schemaname || '.' || tablename)) as table_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Estimate dead tuples
SELECT
  relname,
  n_live_tup,
  n_dead_tup,
  round(n_dead_tup::numeric / nullif(n_live_tup + n_dead_tup, 0) * 100, 2) as dead_pct
FROM pg_stat_user_tables
WHERE n_dead_tup > 0
ORDER BY n_dead_tup DESC;
```

## Configuration Tuning

### Memory Settings

```sql
-- Check current settings
SHOW shared_buffers;      -- Cache for table data (25% of RAM)
SHOW effective_cache_size; -- Estimate of OS cache (50-75% of RAM)
SHOW work_mem;            -- Memory for sorts/hashes (per operation)
SHOW maintenance_work_mem; -- Memory for maintenance operations

-- Recommended settings for 16GB RAM server
ALTER SYSTEM SET shared_buffers = '4GB';
ALTER SYSTEM SET effective_cache_size = '12GB';
ALTER SYSTEM SET work_mem = '64MB';
ALTER SYSTEM SET maintenance_work_mem = '1GB';
```

### Checkpoint Settings

```sql
-- Spread checkpoint writes
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET max_wal_size = '4GB';
```

### Parallel Queries

```sql
-- Enable parallel queries
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_maintenance_workers = 2;
ALTER SYSTEM SET parallel_tuple_cost = 0.01;
ALTER SYSTEM SET parallel_setup_cost = 100;
```

## Monitoring

### Active Queries

```sql
-- View active queries
SELECT
  pid,
  age(clock_timestamp(), query_start) as duration,
  usename,
  query,
  state
FROM pg_stat_activity
WHERE state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- Kill long-running query
SELECT pg_cancel_backend(pid);  -- Gentle
SELECT pg_terminate_backend(pid); -- Force
```

### Table Statistics

```sql
-- Table access patterns
SELECT
  schemaname,
  relname,
  seq_scan,
  seq_tup_read,
  idx_scan,
  idx_tup_fetch,
  n_tup_ins,
  n_tup_upd,
  n_tup_del
FROM pg_stat_user_tables
ORDER BY seq_scan DESC;
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
