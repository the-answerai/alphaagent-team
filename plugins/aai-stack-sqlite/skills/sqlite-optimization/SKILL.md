---
name: sqlite-optimization
description: SQLite performance optimization techniques
user-invocable: false
---

# SQLite Optimization Skill

Techniques for optimizing SQLite performance.

## PRAGMA Settings

### Performance PRAGMAs

```sql
-- Enable Write-Ahead Logging (recommended for most use cases)
PRAGMA journal_mode = WAL;

-- Synchronous mode (tradeoff: safety vs speed)
PRAGMA synchronous = NORMAL;  -- Good balance
-- PRAGMA synchronous = OFF;  -- Fastest, but risky
-- PRAGMA synchronous = FULL; -- Safest, slowest

-- Memory cache size (in KB, negative = KB)
PRAGMA cache_size = -64000;  -- 64MB

-- Memory-mapped I/O (bytes)
PRAGMA mmap_size = 268435456;  -- 256MB

-- Busy timeout
PRAGMA busy_timeout = 5000;  -- 5 seconds

-- Temp storage
PRAGMA temp_store = MEMORY;
```

### Query Analysis PRAGMAs

```sql
-- Check foreign keys
PRAGMA foreign_key_check;

-- Integrity check
PRAGMA integrity_check;

-- Quick check
PRAGMA quick_check;

-- Show table info
PRAGMA table_info(users);

-- Show index list
PRAGMA index_list(users);
```

## Query Optimization

### EXPLAIN QUERY PLAN

```sql
-- Analyze query execution plan
EXPLAIN QUERY PLAN
SELECT * FROM users WHERE email = 'test@example.com';

-- Look for:
-- "SCAN" = full table scan (often bad)
-- "SEARCH" = using index (good)
-- "USING INDEX" = covering index (best)
```

### Index Optimization

```sql
-- Covering index (includes all needed columns)
CREATE INDEX idx_users_covering
ON users(email, name, created_at);

-- Now this query uses index only, no table access:
SELECT email, name FROM users WHERE email LIKE 'test%';

-- Partial index for common queries
CREATE INDEX idx_active_users
ON users(email)
WHERE active = 1;

-- Expression index
CREATE INDEX idx_users_lower_email
ON users(lower(email));
```

### Query Patterns

```sql
-- BAD: OR conditions prevent index use
SELECT * FROM users
WHERE email = 'a@test.com' OR email = 'b@test.com';

-- GOOD: Use UNION or IN
SELECT * FROM users WHERE email IN ('a@test.com', 'b@test.com');

-- BAD: Function on indexed column
SELECT * FROM users WHERE lower(email) = 'test@example.com';

-- GOOD: Create expression index or normalize data
SELECT * FROM users WHERE email = 'test@example.com';

-- BAD: LIKE with leading wildcard
SELECT * FROM users WHERE name LIKE '%smith';

-- GOOD: LIKE without leading wildcard uses index
SELECT * FROM users WHERE name LIKE 'smith%';

-- Use LIMIT for pagination
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 0;

-- Better pagination with keyset
SELECT * FROM users WHERE id > ? ORDER BY id LIMIT 20;
```

## Bulk Operations

### Batch Inserts

```typescript
// Transaction for bulk inserts (much faster)
const insertMany = db.transaction((items) => {
  const stmt = db.prepare('INSERT INTO items (name, value) VALUES (?, ?)')
  for (const item of items) {
    stmt.run(item.name, item.value)
  }
})

// 10x-100x faster than individual inserts
insertMany(largeArray)
```

### Bulk Updates

```sql
-- Update with CASE
UPDATE products
SET price = CASE id
  WHEN 1 THEN 9.99
  WHEN 2 THEN 19.99
  WHEN 3 THEN 29.99
END
WHERE id IN (1, 2, 3);

-- Update from temp table
CREATE TEMP TABLE updates (id INTEGER, new_price REAL);
INSERT INTO updates VALUES (1, 9.99), (2, 19.99);

UPDATE products
SET price = (SELECT new_price FROM updates WHERE updates.id = products.id)
WHERE id IN (SELECT id FROM updates);

DROP TABLE updates;
```

## Memory Management

### Connection Pooling Pattern

```typescript
class SQLitePool {
  private db: Database.Database

  constructor(filename: string) {
    this.db = new Database(filename)
    this.db.pragma('journal_mode = WAL')
    this.db.pragma('cache_size = -64000')
  }

  query<T>(sql: string, params?: any[]): T[] {
    const stmt = this.db.prepare(sql)
    return params ? stmt.all(...params) : stmt.all()
  }

  run(sql: string, params?: any[]): Database.RunResult {
    const stmt = this.db.prepare(sql)
    return params ? stmt.run(...params) : stmt.run()
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)()
  }

  close(): void {
    this.db.close()
  }
}
```

### Statement Caching

```typescript
class StatementCache {
  private cache = new Map<string, Database.Statement>()
  private db: Database.Database

  constructor(db: Database.Database) {
    this.db = db
  }

  prepare(sql: string): Database.Statement {
    let stmt = this.cache.get(sql)
    if (!stmt) {
      stmt = this.db.prepare(sql)
      this.cache.set(sql, stmt)
    }
    return stmt
  }

  clear(): void {
    this.cache.clear()
  }
}
```

## Concurrency

### Read-Write Separation

```typescript
// WAL mode allows concurrent reads
const readDb = new Database('app.db', { readonly: true })
const writeDb = new Database('app.db')

writeDb.pragma('journal_mode = WAL')

// Reads don't block writes, writes don't block reads
const users = readDb.prepare('SELECT * FROM users').all()
writeDb.prepare('INSERT INTO users (email) VALUES (?)').run('new@example.com')
```

### Busy Handling

```typescript
// Automatic retry on busy
const db = new Database('app.db')
db.pragma('busy_timeout = 5000')  // Wait up to 5 seconds

// Or custom busy handler
db.function('busy_handler', (count) => {
  if (count < 10) {
    // Wait and retry
    return 1
  }
  // Give up
  return 0
})
```

## Vacuum and Maintenance

### Regular Maintenance

```sql
-- Rebuild database, reclaim space
VACUUM;

-- Analyze for query planner
ANALYZE;

-- Reindex
REINDEX;

-- Check integrity
PRAGMA integrity_check;
```

### Auto-Vacuum

```sql
-- Enable auto-vacuum (must be done before creating tables)
PRAGMA auto_vacuum = FULL;

-- Incremental auto-vacuum
PRAGMA auto_vacuum = INCREMENTAL;
PRAGMA incremental_vacuum(100);  -- Free 100 pages
```

## Benchmarking

### Simple Benchmark

```typescript
function benchmark(name: string, fn: () => void, iterations = 1000): void {
  const start = performance.now()
  for (let i = 0; i < iterations; i++) {
    fn()
  }
  const elapsed = performance.now() - start
  console.log(`${name}: ${elapsed.toFixed(2)}ms (${(elapsed/iterations).toFixed(3)}ms/op)`)
}

// Compare approaches
benchmark('Without transaction', () => {
  db.prepare('INSERT INTO test (value) VALUES (?)').run(1)
})

const insertTx = db.transaction((n) => {
  const stmt = db.prepare('INSERT INTO test (value) VALUES (?)')
  for (let i = 0; i < n; i++) {
    stmt.run(i)
  }
})

benchmark('With transaction', () => {
  insertTx(100)
}, 10)
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
