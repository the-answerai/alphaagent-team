---
name: typeorm-migrations
description: TypeORM migration patterns
user-invocable: false
---

# TypeORM Migrations Skill

Patterns for managing database migrations with TypeORM.

## Configuration

### Data Source Configuration

```typescript
// data-source.ts
import { DataSource } from 'typeorm'
import { User } from './entities/User'
import { Post } from './entities/Post'

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Post],
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
  logging: process.env.NODE_ENV === 'development',
})
```

### CLI Configuration

```javascript
// typeorm.config.js (for CLI)
module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['dist/entities/**/*.js'],
  migrations: ['dist/migrations/**/*.js'],
  cli: {
    migrationsDir: 'src/migrations',
  },
}
```

## Creating Migrations

### Generate Migration

```bash
# Generate migration from entity changes
npx typeorm migration:generate -d src/data-source.ts src/migrations/AddUserRole

# Create empty migration
npx typeorm migration:create src/migrations/SeedInitialData
```

### Migration Structure

```typescript
import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm'

export class AddUserRole1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migration logic
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback logic
  }
}
```

### Table Operations

```typescript
export class CreateUsersTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    )

    // Create index
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USERS_EMAIL',
      columnNames: ['email'],
    }))
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users', 'IDX_USERS_EMAIL')
    await queryRunner.dropTable('users')
  }
}
```

### Column Operations

```typescript
export class AddUserRole1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add column
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role',
        type: 'varchar',
        default: "'user'",
      })
    )

    // Change column
    await queryRunner.changeColumn(
      'users',
      'name',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: false,
        default: "''",
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'role')
  }
}
```

### Foreign Keys

```typescript
export class AddPostsTable1700000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'author_id',
            type: 'uuid',
          },
        ],
      }),
      true
    )

    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey({
        columnNames: ['author_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('posts')
    const foreignKey = table.foreignKeys.find(
      fk => fk.columnNames.indexOf('author_id') !== -1
    )
    await queryRunner.dropForeignKey('posts', foreignKey)
    await queryRunner.dropTable('posts')
  }
}
```

## Running Migrations

### CLI Commands

```bash
# Run pending migrations
npx typeorm migration:run -d src/data-source.ts

# Revert last migration
npx typeorm migration:revert -d src/data-source.ts

# Show migrations status
npx typeorm migration:show -d src/data-source.ts
```

### Programmatic Execution

```typescript
import { AppDataSource } from './data-source'

async function runMigrations() {
  await AppDataSource.initialize()

  // Run pending migrations
  await AppDataSource.runMigrations()

  // Or run specific migration
  await AppDataSource.runMigrations({ transaction: 'all' })

  // Revert
  await AppDataSource.undoLastMigration()

  await AppDataSource.destroy()
}
```

## Data Migrations

### Seed Data

```typescript
export class SeedRoles1700000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO roles (id, name, permissions)
      VALUES
        ('admin', 'Administrator', '["read", "write", "delete"]'),
        ('user', 'User', '["read"]'),
        ('guest', 'Guest', '[]')
      ON CONFLICT (id) DO NOTHING
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM roles WHERE id IN ('admin', 'user', 'guest')
    `)
  }
}
```

### Data Transformation

```typescript
export class MigrateUserNames1700000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add new columns
    await queryRunner.addColumns('users', [
      new TableColumn({ name: 'first_name', type: 'varchar', isNullable: true }),
      new TableColumn({ name: 'last_name', type: 'varchar', isNullable: true }),
    ])

    // Migrate data
    await queryRunner.query(`
      UPDATE users
      SET
        first_name = split_part(name, ' ', 1),
        last_name = CASE
          WHEN position(' ' in name) > 0
          THEN substring(name from position(' ' in name) + 1)
          ELSE NULL
        END
    `)

    // Drop old column
    await queryRunner.dropColumn('users', 'name')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({ name: 'name', type: 'varchar', isNullable: true })
    )

    await queryRunner.query(`
      UPDATE users
      SET name = CONCAT(first_name, ' ', COALESCE(last_name, ''))
    `)

    await queryRunner.dropColumns('users', ['first_name', 'last_name'])
  }
}
```

## Best Practices

### Transaction Handling

```typescript
export class SafeMigration1700000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Migrations run in transaction by default
    // For operations that can't be in transaction (e.g., CREATE INDEX CONCURRENTLY)
    // use queryRunner.connection.query() instead
  }
}
```

### Idempotent Migrations

```typescript
export class IdempotentMigration implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column exists
    const table = await queryRunner.getTable('users')
    const columnExists = table?.columns.find(c => c.name === 'new_column')

    if (!columnExists) {
      await queryRunner.addColumn(
        'users',
        new TableColumn({ name: 'new_column', type: 'varchar' })
      )
    }
  }
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
- `database-developer` agent
