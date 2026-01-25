---
name: sqlite-patterns
description: SQLite database patterns and best practices
user-invocable: false
---

# SQLite Patterns Skill

Patterns for using SQLite databases effectively.

## Database Setup

### Creating Database

```typescript
import Database from 'better-sqlite3'

// Open or create database
const db = new Database('app.db')

// With options
const db = new Database('app.db', {
  readonly: false,
  fileMustExist: false,
  timeout: 5000,
  verbose: console.log,
})

// In-memory database
const db = new Database(':memory:')
```

### Table Creation

```sql
-- Basic table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- With foreign key
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  user_id INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Enable foreign keys (must be done per connection)
PRAGMA foreign_keys = ON;
```

### Indexes

```sql
-- Single column index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite index
CREATE INDEX IF NOT EXISTS idx_posts_user_date ON posts(user_id, created_at);

-- Unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Partial index
CREATE INDEX IF NOT EXISTS idx_active_users
ON users(last_login)
WHERE status = 'active';
```

## Basic CRUD

### Insert

```typescript
// Single insert
const insert = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)')
const result = insert.run('john@example.com', 'John')
console.log(result.lastInsertRowid)

// Named parameters
const insert = db.prepare('INSERT INTO users (email, name) VALUES (@email, @name)')
insert.run({ email: 'john@example.com', name: 'John' })

// Insert or replace
const upsert = db.prepare(`
  INSERT INTO users (email, name)
  VALUES (@email, @name)
  ON CONFLICT(email) DO UPDATE SET name = excluded.name
`)
upsert.run({ email: 'john@example.com', name: 'John Updated' })

// Bulk insert
const insertMany = db.prepare('INSERT INTO users (email, name) VALUES (?, ?)')
const insertAll = db.transaction((users) => {
  for (const user of users) {
    insertMany.run(user.email, user.name)
  }
})
insertAll([
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' },
])
```

### Select

```typescript
// Single row
const getUser = db.prepare('SELECT * FROM users WHERE id = ?')
const user = getUser.get(1)

// Multiple rows
const getAllUsers = db.prepare('SELECT * FROM users')
const users = getAllUsers.all()

// Iterate (memory-efficient)
const stmt = db.prepare('SELECT * FROM users')
for (const user of stmt.iterate()) {
  console.log(user)
}

// With joins
const getPostsWithAuthor = db.prepare(`
  SELECT posts.*, users.name as author_name
  FROM posts
  JOIN users ON posts.user_id = users.id
  WHERE posts.user_id = ?
`)
const posts = getPostsWithAuthor.all(userId)

// Pluck (single column)
const getEmails = db.prepare('SELECT email FROM users').pluck()
const emails = getEmails.all()  // ['email1', 'email2', ...]
```

### Update

```typescript
const update = db.prepare('UPDATE users SET name = ? WHERE id = ?')
const result = update.run('New Name', 1)
console.log(result.changes)  // Number of affected rows

// Named parameters
const update = db.prepare('UPDATE users SET name = @name WHERE id = @id')
update.run({ name: 'New Name', id: 1 })
```

### Delete

```typescript
const remove = db.prepare('DELETE FROM users WHERE id = ?')
const result = remove.run(1)
console.log(result.changes)

// Soft delete pattern
const softDelete = db.prepare('UPDATE users SET deleted_at = datetime("now") WHERE id = ?')
softDelete.run(1)
```

## Transactions

### Basic Transaction

```typescript
// Using transaction()
const transfer = db.transaction((from, to, amount) => {
  db.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ?')
    .run(amount, from)
  db.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ?')
    .run(amount, to)
})

transfer(1, 2, 100)  // Automatically commits or rolls back

// Manual transaction
db.exec('BEGIN TRANSACTION')
try {
  // operations
  db.exec('COMMIT')
} catch (error) {
  db.exec('ROLLBACK')
  throw error
}
```

### Nested Transactions

```typescript
// Savepoints for nested transactions
const outerTransaction = db.transaction(() => {
  db.prepare('INSERT INTO logs (message) VALUES (?)').run('Start')

  const innerTransaction = db.transaction(() => {
    db.prepare('INSERT INTO logs (message) VALUES (?)').run('Inner')
  })

  innerTransaction()
  db.prepare('INSERT INTO logs (message) VALUES (?)').run('End')
})

outerTransaction()
```

### Deferred/Immediate Transactions

```typescript
// Immediate transaction (acquire write lock immediately)
const transaction = db.transaction(() => {
  // operations
})
transaction.immediate()

// Exclusive transaction
transaction.exclusive()

// Deferred (default)
transaction.deferred()
```

## Advanced Queries

### JSON Functions

```sql
-- Store JSON
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  data TEXT  -- JSON stored as text
);

-- Query JSON
SELECT json_extract(data, '$.theme') as theme
FROM settings
WHERE id = 1;

-- Update JSON
UPDATE settings
SET data = json_set(data, '$.theme', 'dark')
WHERE id = 1;

-- Array operations
SELECT json_each.value
FROM settings, json_each(json_extract(data, '$.tags'));
```

### Full-Text Search

```sql
-- Create FTS table
CREATE VIRTUAL TABLE posts_fts USING fts5(
  title,
  content,
  content='posts',
  content_rowid='id'
);

-- Populate
INSERT INTO posts_fts(rowid, title, content)
SELECT id, title, content FROM posts;

-- Search
SELECT posts.*
FROM posts
JOIN posts_fts ON posts.id = posts_fts.rowid
WHERE posts_fts MATCH 'search term';

-- Rank by relevance
SELECT posts.*, rank
FROM posts_fts
JOIN posts ON posts.id = posts_fts.rowid
WHERE posts_fts MATCH 'search term'
ORDER BY rank;
```

### Window Functions

```sql
-- Row number
SELECT
  id,
  name,
  ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
FROM users;

-- Rank within groups
SELECT
  user_id,
  score,
  RANK() OVER (PARTITION BY user_id ORDER BY score DESC) as rank
FROM scores;

-- Running total
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) as running_total
FROM transactions;
```

## Data Types

### Date/Time Handling

```typescript
// Store as ISO string
db.prepare('INSERT INTO events (name, date) VALUES (?, ?)')
  .run('Event', new Date().toISOString())

// Query dates
const getRecent = db.prepare(`
  SELECT * FROM events
  WHERE date >= datetime('now', '-7 days')
  ORDER BY date DESC
`)

// Date functions
const stmt = db.prepare(`
  SELECT
    date(created_at) as date,
    time(created_at) as time,
    strftime('%Y-%m', created_at) as month
  FROM events
`)
```

### Boolean Handling

```sql
-- SQLite uses 0/1 for booleans
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  active INTEGER DEFAULT 1  -- 1 = true, 0 = false
);

-- Query
SELECT * FROM items WHERE active = 1;
SELECT * FROM items WHERE active;  -- Implicit boolean
```

## Performance

### Prepared Statements

```typescript
// Prepare once, execute many
const insert = db.prepare('INSERT INTO logs (message) VALUES (?)')
const selectById = db.prepare('SELECT * FROM logs WHERE id = ?')

// Cache for reuse
const statements = {
  insert: db.prepare('INSERT INTO users (email) VALUES (?)'),
  getById: db.prepare('SELECT * FROM users WHERE id = ?'),
  getAll: db.prepare('SELECT * FROM users'),
}
```

### WAL Mode

```sql
-- Enable Write-Ahead Logging for better concurrency
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;  -- 64MB cache
PRAGMA busy_timeout = 5000;
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
