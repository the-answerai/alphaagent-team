---
name: better-sqlite3-patterns
description: better-sqlite3 library patterns
user-invocable: false
---

# better-sqlite3 Patterns Skill

Patterns for using the better-sqlite3 library in Node.js.

## Installation and Setup

### Installation

```bash
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3
```

### Database Connection

```typescript
import Database from 'better-sqlite3'

// Basic connection
const db = new Database('database.db')

// With options
const db = new Database('database.db', {
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log,  // Log all queries
})

// In-memory database
const db = new Database(':memory:')

// Close connection
db.close()
```

### Initial Configuration

```typescript
function initDatabase(path: string): Database.Database {
  const db = new Database(path)

  // Performance settings
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('cache_size = -64000')
  db.pragma('foreign_keys = ON')
  db.pragma('temp_store = MEMORY')

  return db
}
```

## Prepared Statements

### Creating Statements

```typescript
// Prepare a statement
const stmt = db.prepare('SELECT * FROM users WHERE id = ?')

// Execute methods
const user = stmt.get(1)           // Single row
const users = stmt.all()           // All rows as array
for (const row of stmt.iterate()) { // Iterator
  console.log(row)
}

// Run for INSERT/UPDATE/DELETE
const insert = db.prepare('INSERT INTO users (email) VALUES (?)')
const info = insert.run('test@example.com')
console.log(info.lastInsertRowid)
console.log(info.changes)
```

### Parameter Binding

```typescript
// Positional parameters
const stmt = db.prepare('SELECT * FROM users WHERE id = ? AND active = ?')
stmt.get(1, true)

// Named parameters with @ prefix
const stmt = db.prepare('SELECT * FROM users WHERE id = @id')
stmt.get({ id: 1 })

// Named parameters with $ prefix
const stmt = db.prepare('SELECT * FROM users WHERE id = $id')
stmt.get({ id: 1 })

// Named parameters with : prefix
const stmt = db.prepare('SELECT * FROM users WHERE id = :id')
stmt.get({ id: 1 })

// Bind permanently
const stmt = db.prepare('SELECT * FROM users WHERE status = ?')
const activeUsersStmt = stmt.bind('active')
activeUsersStmt.all()  // No need to pass parameter
```

### Statement Methods

```typescript
const stmt = db.prepare('SELECT id, name FROM users')

// Get column names
console.log(stmt.columns())
// [{ name: 'id', type: 'INTEGER', ... }, { name: 'name', type: 'TEXT', ... }]

// Pluck first column
const ids = stmt.pluck().all()  // [1, 2, 3, ...]

// Expand rows to arrays
const rows = stmt.expand().all()
// [{ users: { id: 1, name: 'John' } }, ...]

// Raw mode (arrays instead of objects)
const rows = stmt.raw().all()
// [[1, 'John'], [2, 'Jane'], ...]
```

## Transactions

### Transaction Helper

```typescript
// Create transaction function
const insertUsers = db.transaction((users) => {
  const insert = db.prepare('INSERT INTO users (email, name) VALUES (@email, @name)')

  for (const user of users) {
    insert.run(user)
  }

  return users.length
})

// Execute transaction
const count = insertUsers([
  { email: 'a@test.com', name: 'Alice' },
  { email: 'b@test.com', name: 'Bob' },
])
```

### Transaction Modes

```typescript
const transfer = db.transaction((from, to, amount) => {
  db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?').run(amount, from)
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?').run(amount, to)
})

// Different modes
transfer(1, 2, 100)            // Deferred (default)
transfer.deferred(1, 2, 100)   // Explicit deferred
transfer.immediate(1, 2, 100)  // Immediate lock
transfer.exclusive(1, 2, 100)  // Exclusive lock
```

### Nested Transactions

```typescript
const outer = db.transaction(() => {
  db.prepare('INSERT INTO logs (msg) VALUES (?)').run('outer start')

  const inner = db.transaction(() => {
    db.prepare('INSERT INTO logs (msg) VALUES (?)').run('inner')
  })

  try {
    inner()
  } catch (e) {
    // Inner rolled back, outer continues
  }

  db.prepare('INSERT INTO logs (msg) VALUES (?)').run('outer end')
})

outer()
```

## User-Defined Functions

### Scalar Functions

```typescript
// Simple function
db.function('double', (x) => x * 2)
db.prepare('SELECT double(value) FROM numbers').all()

// With options
db.function('uuid', {
  deterministic: false,
  varargs: false,
}, () => crypto.randomUUID())

// Multiple arguments
db.function('concat_ws', {
  varargs: true,
}, (separator, ...args) => args.join(separator))
```

### Aggregate Functions

```typescript
db.aggregate('json_array_agg', {
  start: () => [],
  step: (array, value) => {
    array.push(value)
    return array
  },
  result: (array) => JSON.stringify(array),
})

db.prepare('SELECT json_array_agg(name) FROM users').pluck().get()
// '["Alice","Bob","Charlie"]'
```

### Table-Valued Functions

```typescript
db.table('generate_series', {
  columns: ['value'],
  parameters: ['start', 'stop', 'step'],
  *rows(start, stop, step = 1) {
    for (let i = start; i <= stop; i += step) {
      yield [i]
    }
  },
})

db.prepare('SELECT * FROM generate_series(1, 10, 2)').all()
// [{ value: 1 }, { value: 3 }, { value: 5 }, ...]
```

## Backup and Restore

### Online Backup

```typescript
// Backup to file
await db.backup('backup.db')

// With progress callback
await db.backup('backup.db', {
  progress({ totalPages, remainingPages }) {
    console.log(`Progress: ${totalPages - remainingPages}/${totalPages}`)
    return 200  // Pages per step (0 = all at once)
  }
})
```

### Serialize/Deserialize

```typescript
// Serialize to buffer
const buffer = db.serialize()

// Create from buffer
const db2 = new Database(buffer)

// Or write to file
fs.writeFileSync('backup.db', buffer)
```

## Type Safety

### TypeScript Patterns

```typescript
interface User {
  id: number
  email: string
  name: string | null
  created_at: string
}

// Typed query function
function getUser(id: number): User | undefined {
  return db.prepare<[number], User>('SELECT * FROM users WHERE id = ?').get(id)
}

function getAllUsers(): User[] {
  return db.prepare<[], User>('SELECT * FROM users').all()
}

function createUser(email: string, name?: string): number {
  const result = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)')
    .run(email, name ?? null)
  return Number(result.lastInsertRowid)
}
```

### Repository Pattern

```typescript
class UserRepository {
  private db: Database.Database

  private statements = {
    getById: this.db.prepare<[number], User>('SELECT * FROM users WHERE id = ?'),
    getByEmail: this.db.prepare<[string], User>('SELECT * FROM users WHERE email = ?'),
    insert: this.db.prepare('INSERT INTO users (email, name) VALUES (@email, @name)'),
    update: this.db.prepare('UPDATE users SET name = @name WHERE id = @id'),
    delete: this.db.prepare('DELETE FROM users WHERE id = ?'),
  }

  constructor(db: Database.Database) {
    this.db = db
  }

  findById(id: number): User | undefined {
    return this.statements.getById.get(id)
  }

  findByEmail(email: string): User | undefined {
    return this.statements.getByEmail.get(email)
  }

  create(user: Omit<User, 'id' | 'created_at'>): number {
    const result = this.statements.insert.run(user)
    return Number(result.lastInsertRowid)
  }

  update(id: number, data: Partial<User>): boolean {
    const result = this.statements.update.run({ id, ...data })
    return result.changes > 0
  }

  delete(id: number): boolean {
    const result = this.statements.delete.run(id)
    return result.changes > 0
  }
}
```

## Error Handling

```typescript
import Database from 'better-sqlite3'

try {
  db.exec('INVALID SQL')
} catch (error) {
  if (error instanceof Database.SqliteError) {
    console.error('SQLite error:', error.code, error.message)
    // Common codes: SQLITE_CONSTRAINT, SQLITE_BUSY, SQLITE_LOCKED
  }
}

// Check if database is open
if (db.open) {
  // Safe to use
}

// Check if in transaction
if (db.inTransaction) {
  // Currently in a transaction
}
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
