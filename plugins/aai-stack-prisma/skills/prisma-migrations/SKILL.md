---
name: prisma-migrations
description: Prisma migration workflow patterns
user-invocable: false
---

# Prisma Migrations Skill

Patterns for managing database migrations with Prisma.

## Migration Workflow

### Development Flow

```bash
# Create and apply migration
npx prisma migrate dev --name add_user_role

# Create migration without applying (for review)
npx prisma migrate dev --create-only --name add_phone

# Apply pending migrations
npx prisma migrate dev

# Reset database (drops and recreates)
npx prisma migrate reset
```

### Production Flow

```bash
# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Resolve migration issues
npx prisma migrate resolve --applied "migration_name"
npx prisma migrate resolve --rolled-back "migration_name"
```

## Schema Changes

### Adding Fields

```prisma
// Before
model User {
  id    String @id @default(uuid())
  email String @unique
}

// After - add optional field
model User {
  id    String  @id @default(uuid())
  email String  @unique
  phone String?  // Nullable, no migration issue
}

// After - add required field with default
model User {
  id     String @id @default(uuid())
  email  String @unique
  status String @default("active")  // Has default
}
```

### Renaming Fields

```prisma
// Step 1: Add new field
model User {
  id       String @id @default(uuid())
  name     String   // Old field
  fullName String?  // New field (nullable initially)
}

// Step 2: Run data migration (in code or SQL)
// UPDATE users SET full_name = name;

// Step 3: Make new field required, drop old
model User {
  id       String @id @default(uuid())
  fullName String  // Now required
}
```

### Changing Field Types

```prisma
// Be careful - may lose data!
// Before
model Product {
  price Int  // Cents
}

// After
model Product {
  price Decimal @db.Decimal(10, 2)  // Dollars
}

// Better: Add migration script to convert
// migration.sql will need manual editing
```

### Adding Relations

```prisma
// Step 1: Add optional relation
model Post {
  id         String @id @default(uuid())
  categoryId String?
  category   Category? @relation(fields: [categoryId], references: [id])
}

// Step 2: Backfill data

// Step 3: Make required (if needed)
model Post {
  id         String   @id @default(uuid())
  categoryId String
  category   Category @relation(fields: [categoryId], references: [id])
}
```

## Data Migrations

### In Migration SQL

```sql
-- migrations/20240115_add_user_role/migration.sql

-- Add column
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';

-- Backfill existing data
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" LIKE '%@admin.com';
```

### Using Prisma Script

```typescript
// prisma/seed.ts or separate migration script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Batch update
  await prisma.user.updateMany({
    where: {
      role: null,
    },
    data: {
      role: 'USER',
    },
  })

  // Complex migration with transactions
  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({
      where: { legacyField: { not: null } },
    })

    for (const user of users) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          newField: transformData(user.legacyField),
        },
      })
    }
  })
}

main()
```

## Baselining Existing Database

```bash
# Create baseline migration from existing database
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/0_init/migration.sql

# Mark as applied
npx prisma migrate resolve --applied 0_init
```

## Migration Best Practices

### Safe Migration Pattern

```bash
# 1. Pull current schema
npx prisma db pull

# 2. Make schema changes in schema.prisma

# 3. Create migration (review before applying)
npx prisma migrate dev --create-only --name descriptive_name

# 4. Review generated SQL
cat prisma/migrations/*/migration.sql

# 5. Apply if looks good
npx prisma migrate dev
```

### Handling Failed Migrations

```bash
# If migration failed partially
npx prisma migrate resolve --rolled-back "migration_name"

# Fix the migration SQL
vi prisma/migrations/*/migration.sql

# Re-apply
npx prisma migrate deploy
```

## Seeding

### Basic Seed

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN',
    },
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

```json
// package.json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

### Running Seeds

```bash
# Run seed
npx prisma db seed

# Seed runs automatically with migrate reset
npx prisma migrate reset
```

## Schema Introspection

```bash
# Pull schema from existing database
npx prisma db pull

# Push schema changes without migrations
npx prisma db push
```

## Migration File Structure

```
prisma/
├── schema.prisma
├── migrations/
│   ├── 20240101000000_init/
│   │   └── migration.sql
│   ├── 20240115120000_add_user_role/
│   │   └── migration.sql
│   └── migration_lock.toml
└── seed.ts
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
