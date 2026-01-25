---
name: postgres-migrations
description: PostgreSQL migration patterns and best practices
user-invocable: false
---

# PostgreSQL Migrations Skill

Patterns for safe PostgreSQL schema migrations.

## Safe Migration Patterns

### Adding Columns

```sql
-- Safe: Add nullable column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Safe: Add column with default (instant in PG 11+)
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active';

-- Backfill if needed (in batches)
UPDATE users SET phone = '' WHERE phone IS NULL;

-- Then add NOT NULL if required
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
```

### Removing Columns

```sql
-- Step 1: Stop reading/writing column in application
-- Step 2: Deploy application changes
-- Step 3: Drop column

ALTER TABLE users DROP COLUMN legacy_field;
```

### Renaming Columns

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(100);

-- Step 2: Backfill (in batches)
UPDATE users SET full_name = name WHERE full_name IS NULL;

-- Step 3: Update app to read/write both
-- Step 4: Deploy app changes
-- Step 5: Drop old column

ALTER TABLE users DROP COLUMN name;
```

### Adding Constraints

```sql
-- Add NOT NULL with default (safe)
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user' NOT NULL;

-- Add NOT NULL to existing column (requires data check)
-- First ensure no nulls exist
UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET NOT NULL;

-- Add check constraint (blocks writes during validation)
ALTER TABLE users ADD CONSTRAINT chk_age CHECK (age >= 0);

-- Add check NOT VALID (doesn't validate existing rows)
ALTER TABLE users ADD CONSTRAINT chk_age CHECK (age >= 0) NOT VALID;
-- Validate later
ALTER TABLE users VALIDATE CONSTRAINT chk_age;
```

### Adding Foreign Keys

```sql
-- Add column first
ALTER TABLE orders ADD COLUMN customer_id UUID;

-- Backfill data
UPDATE orders SET customer_id = users.id
FROM users WHERE users.legacy_id = orders.legacy_user_id;

-- Add foreign key NOT VALID (no lock)
ALTER TABLE orders
ADD CONSTRAINT fk_orders_customer
FOREIGN KEY (customer_id) REFERENCES customers(id)
NOT VALID;

-- Validate in background
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_customer;
```

### Adding Indexes

```sql
-- ALWAYS use CONCURRENTLY in production
CREATE INDEX CONCURRENTLY idx_orders_user ON orders(user_id);

-- For unique indexes
CREATE UNIQUE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Handle failure (concurrent index creation can fail)
-- Check for invalid indexes
SELECT * FROM pg_indexes WHERE indexname LIKE '%invalid%';
-- Drop invalid and retry
DROP INDEX CONCURRENTLY idx_orders_user_invalid;
CREATE INDEX CONCURRENTLY idx_orders_user ON orders(user_id);
```

### Dropping Indexes

```sql
-- ALWAYS use CONCURRENTLY
DROP INDEX CONCURRENTLY idx_old_index;
```

### Table Restructuring

```sql
-- Create new table
CREATE TABLE users_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy data
INSERT INTO users_new (id, email, name, created_at)
SELECT id, email, full_name, created_at FROM users_old;

-- Rename tables
ALTER TABLE users_old RENAME TO users_archive;
ALTER TABLE users_new RENAME TO users;

-- Update foreign keys
ALTER TABLE orders DROP CONSTRAINT fk_orders_user;
ALTER TABLE orders ADD CONSTRAINT fk_orders_user
  FOREIGN KEY (user_id) REFERENCES users(id);
```

## Batched Updates

```sql
-- Update in batches to avoid long locks
DO $$
DECLARE
  batch_size INT := 10000;
  total_updated INT := 0;
BEGIN
  LOOP
    WITH batch AS (
      SELECT id FROM users
      WHERE migrated = false
      LIMIT batch_size
      FOR UPDATE SKIP LOCKED
    )
    UPDATE users u
    SET
      migrated = true,
      new_field = calculate_value(u.old_field)
    FROM batch b
    WHERE u.id = b.id;

    GET DIAGNOSTICS total_updated = ROW_COUNT;

    IF total_updated = 0 THEN
      EXIT;
    END IF;

    COMMIT;
    PERFORM pg_sleep(0.1);  -- Small delay to reduce load
  END LOOP;
END $$;
```

## Transaction Patterns

```sql
-- Wrap DDL in transaction (PostgreSQL supports transactional DDL)
BEGIN;
  ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  CREATE INDEX idx_users_phone ON users(phone);
COMMIT;

-- Rollback if something goes wrong
BEGIN;
  ALTER TABLE users ADD COLUMN temp_field TEXT;
  -- Oops, wrong type
ROLLBACK;
```

## Lock Monitoring

```sql
-- Check for blocking locks
SELECT
  blocked.pid AS blocked_pid,
  blocked.query AS blocked_query,
  blocking.pid AS blocking_pid,
  blocking.query AS blocking_query
FROM pg_stat_activity blocked
JOIN pg_locks blocked_locks ON blocked.pid = blocked_locks.pid
JOIN pg_locks blocking_locks ON blocked_locks.locktype = blocking_locks.locktype
  AND blocked_locks.database IS NOT DISTINCT FROM blocking_locks.database
  AND blocked_locks.relation IS NOT DISTINCT FROM blocking_locks.relation
  AND blocked_locks.pid != blocking_locks.pid
JOIN pg_stat_activity blocking ON blocking_locks.pid = blocking.pid
WHERE blocked_locks.granted = false
  AND blocking_locks.granted = true;

-- Set statement timeout to prevent long locks
SET statement_timeout = '30s';
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
RESET statement_timeout;
```

## Migration Scripts

### Up/Down Pattern

```sql
-- 001_add_users_phone.up.sql
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- 001_add_users_phone.down.sql
ALTER TABLE users DROP COLUMN phone;
```

### Idempotent Migrations

```sql
-- Check before adding column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  END IF;
END $$;

-- Check before adding index
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Check before adding constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_users_age'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT chk_users_age CHECK (age >= 0);
  END IF;
END $$;
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
