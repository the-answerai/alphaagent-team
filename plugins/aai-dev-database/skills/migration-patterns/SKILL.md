---
name: migration-patterns
description: Patterns for safe database migrations in production environments
user-invocable: false
---

# Migration Patterns Skill

Patterns for safe, reversible database migrations.

## Migration Principles

1. **Always reversible**: Every migration should have a down/rollback
2. **Atomic changes**: One logical change per migration
3. **Non-blocking**: Avoid long locks on production tables
4. **Tested**: Run on production-like data before deploying
5. **Versioned**: Track all migrations in source control

## Prisma Migrations

### Basic Workflow

```bash
# Create migration from schema changes
npx prisma migrate dev --name add_user_role

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only!)
npx prisma migrate reset
```

### Migration File Structure

```
prisma/
├── schema.prisma
└── migrations/
    ├── 20240101000000_init/
    │   └── migration.sql
    ├── 20240102000000_add_user_role/
    │   └── migration.sql
    └── migration_lock.toml
```

## Safe Migration Patterns

### Adding Columns

```sql
-- Safe: Add nullable column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Safe: Add column with default
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';

-- Then backfill if needed
UPDATE users SET role = 'admin' WHERE is_admin = true;
```

### Removing Columns

```sql
-- Step 1: Stop reading the column in code
-- Step 2: Stop writing to the column
-- Step 3: Deploy code changes
-- Step 4: Drop the column

ALTER TABLE users DROP COLUMN legacy_field;
```

### Renaming Columns

```sql
-- Step 1: Add new column
ALTER TABLE users ADD COLUMN full_name VARCHAR(255);

-- Step 2: Backfill data
UPDATE users SET full_name = name;

-- Step 3: Update code to read/write both
-- Step 4: Deploy and verify
-- Step 5: Drop old column
ALTER TABLE users DROP COLUMN name;
```

### Adding NOT NULL Constraint

```sql
-- Step 1: Add nullable column
ALTER TABLE users ADD COLUMN email VARCHAR(255);

-- Step 2: Backfill existing rows
UPDATE users SET email = 'unknown@example.com' WHERE email IS NULL;

-- Step 3: Add constraint
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### Adding Foreign Keys

```sql
-- Step 1: Add column without constraint
ALTER TABLE posts ADD COLUMN author_id UUID;

-- Step 2: Backfill data
UPDATE posts SET author_id = (SELECT id FROM users WHERE users.name = posts.author_name);

-- Step 3: Add foreign key (with NOT VALID for large tables)
ALTER TABLE posts
ADD CONSTRAINT fk_posts_author
FOREIGN KEY (author_id) REFERENCES users(id)
NOT VALID;

-- Step 4: Validate in background
ALTER TABLE posts VALIDATE CONSTRAINT fk_posts_author;
```

### Adding Indexes

```sql
-- CONCURRENTLY prevents table lock (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- For large tables, do this during low traffic
-- Index creation can take time but won't block reads/writes
```

### Removing Indexes

```sql
-- Always CONCURRENTLY in production
DROP INDEX CONCURRENTLY idx_old_index;
```

## Large Table Migrations

### Batched Updates

```typescript
async function backfillInBatches(batchSize = 1000) {
  let lastId = '';
  let updated = 0;

  while (true) {
    const result = await prisma.$executeRaw`
      UPDATE users
      SET status = 'active'
      WHERE id > ${lastId}
        AND status IS NULL
      ORDER BY id
      LIMIT ${batchSize}
      RETURNING id
    `;

    if (result === 0) break;

    updated += result;
    console.log(`Updated ${updated} rows`);

    // Get last ID for next batch
    const lastRow = await prisma.user.findFirst({
      where: { status: 'active' },
      orderBy: { id: 'desc' },
    });
    lastId = lastRow?.id || '';

    // Small delay to reduce load
    await sleep(100);
  }
}
```

### Online Schema Changes (pt-online-schema-change)

```bash
# For MySQL large table changes
pt-online-schema-change \
  --alter "ADD COLUMN new_field VARCHAR(255)" \
  --execute \
  D=mydb,t=users
```

## Data Migrations

### Separate from Schema Migrations

```typescript
// migrations/20240101_add_user_status.sql
ALTER TABLE users ADD COLUMN status VARCHAR(20);

// data_migrations/20240101_backfill_user_status.ts
async function up() {
  await prisma.user.updateMany({
    where: { status: null },
    data: { status: 'active' },
  });
}

async function down() {
  // Usually no-op or set back to null
}
```

### Idempotent Migrations

```sql
-- Check before inserting
INSERT INTO settings (key, value)
SELECT 'feature_flag', 'enabled'
WHERE NOT EXISTS (
  SELECT 1 FROM settings WHERE key = 'feature_flag'
);

-- Use upsert
INSERT INTO settings (key, value)
VALUES ('feature_flag', 'enabled')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

## Rollback Strategies

### Automatic Rollbacks

```typescript
// Transaction-based rollback
async function migrate() {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`ALTER TABLE users ADD COLUMN temp VARCHAR(20)`;
    await tx.$executeRaw`UPDATE users SET temp = 'value'`;
    // If anything fails, entire transaction rolls back
  });
}
```

### Manual Rollback Scripts

```sql
-- migrations/20240101_add_feature/up.sql
ALTER TABLE users ADD COLUMN feature_enabled BOOLEAN DEFAULT false;

-- migrations/20240101_add_feature/down.sql
ALTER TABLE users DROP COLUMN feature_enabled;
```

## Migration Testing

### Test with Production Data

```bash
# 1. Create sanitized copy of production
pg_dump production_db | pg_restore -d test_db

# 2. Run migration
npx prisma migrate deploy

# 3. Verify
psql test_db -c "SELECT COUNT(*) FROM users"
```

### Migration Dry Run

```bash
# Prisma: Create migration without applying
npx prisma migrate dev --create-only

# Review generated SQL before applying
cat prisma/migrations/*/migration.sql
```

## Deployment Checklist

- [ ] Migration tested on production-like data
- [ ] Rollback script exists and tested
- [ ] No long-running locks (use CONCURRENTLY)
- [ ] Backup taken before migration
- [ ] Monitoring in place for errors
- [ ] Low-traffic window for major changes
- [ ] Code deployed before/after as needed

## Integration

Used by:
- `database-developer` agent
- Prisma/TypeORM stack skills
