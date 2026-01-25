---
name: postgres-queries
description: PostgreSQL query patterns and best practices
user-invocable: false
---

# PostgreSQL Queries Skill

Patterns for writing effective PostgreSQL queries.

## Basic Queries

### SELECT Patterns

```sql
-- Select with conditions
SELECT id, name, email
FROM users
WHERE status = 'active'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC
LIMIT 10;

-- Select with joins
SELECT
  u.id,
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total) as total_spent
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC;
```

### INSERT Patterns

```sql
-- Single insert with returning
INSERT INTO users (name, email, status)
VALUES ('John Doe', 'john@example.com', 'active')
RETURNING id, created_at;

-- Multi-row insert
INSERT INTO users (name, email, status)
VALUES
  ('User 1', 'user1@example.com', 'active'),
  ('User 2', 'user2@example.com', 'pending'),
  ('User 3', 'user3@example.com', 'active')
RETURNING *;

-- Insert with conflict handling (upsert)
INSERT INTO users (email, name, status)
VALUES ('john@example.com', 'John Doe', 'active')
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW()
RETURNING *;
```

### UPDATE Patterns

```sql
-- Update with conditions
UPDATE users
SET
  status = 'inactive',
  updated_at = NOW()
WHERE last_login_at < NOW() - INTERVAL '1 year'
RETURNING id, email;

-- Update from another table
UPDATE orders o
SET status = 'shipped'
FROM shipments s
WHERE s.order_id = o.id
  AND s.shipped_at IS NOT NULL;

-- Conditional update
UPDATE products
SET
  price = CASE
    WHEN category = 'electronics' THEN price * 0.9
    WHEN category = 'clothing' THEN price * 0.8
    ELSE price
  END,
  updated_at = NOW()
WHERE on_sale = true;
```

### DELETE Patterns

```sql
-- Delete with returning
DELETE FROM sessions
WHERE expires_at < NOW()
RETURNING id, user_id;

-- Delete using subquery
DELETE FROM users
WHERE id IN (
  SELECT user_id
  FROM inactive_users
  WHERE days_inactive > 365
);
```

## Advanced Queries

### Common Table Expressions (CTE)

```sql
-- Simple CTE
WITH active_users AS (
  SELECT * FROM users WHERE status = 'active'
)
SELECT u.*, COUNT(o.id) as order_count
FROM active_users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;

-- Recursive CTE for hierarchical data
WITH RECURSIVE category_tree AS (
  -- Base case
  SELECT id, name, parent_id, 0 as level
  FROM categories
  WHERE parent_id IS NULL

  UNION ALL

  -- Recursive case
  SELECT c.id, c.name, c.parent_id, ct.level + 1
  FROM categories c
  INNER JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY level, name;
```

### Window Functions

```sql
-- Row number
SELECT
  id,
  name,
  department,
  salary,
  ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) as rank
FROM employees;

-- Running totals
SELECT
  date,
  amount,
  SUM(amount) OVER (ORDER BY date) as running_total
FROM transactions;

-- Moving average
SELECT
  date,
  value,
  AVG(value) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as weekly_avg
FROM metrics;

-- Lead/Lag
SELECT
  id,
  sale_date,
  amount,
  amount - LAG(amount) OVER (ORDER BY sale_date) as change_from_previous
FROM sales;
```

### JSONB Operations

```sql
-- Query JSONB field
SELECT * FROM products
WHERE metadata->>'color' = 'red';

-- Query nested JSONB
SELECT * FROM products
WHERE metadata->'dimensions'->>'height' > '10';

-- JSONB contains
SELECT * FROM products
WHERE metadata @> '{"featured": true}';

-- JSONB array contains
SELECT * FROM products
WHERE metadata->'tags' ? 'sale';

-- Update JSONB
UPDATE products
SET metadata = jsonb_set(metadata, '{stock}', '100')
WHERE id = 1;

-- Aggregate to JSONB
SELECT
  user_id,
  jsonb_agg(
    jsonb_build_object(
      'id', id,
      'title', title,
      'date', created_at
    )
  ) as posts
FROM posts
GROUP BY user_id;
```

### Full-Text Search

```sql
-- Create tsvector column
ALTER TABLE articles ADD COLUMN search_vector tsvector;

UPDATE articles SET search_vector =
  to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, ''));

-- Create GIN index
CREATE INDEX idx_articles_search ON articles USING GIN(search_vector);

-- Search query
SELECT
  id,
  title,
  ts_rank(search_vector, query) as rank
FROM articles, to_tsquery('english', 'database & performance') query
WHERE search_vector @@ query
ORDER BY rank DESC;

-- Highlight results
SELECT
  id,
  ts_headline('english', body, to_tsquery('english', 'postgresql'),
    'StartSel=<mark>, StopSel=</mark>') as highlighted
FROM articles
WHERE search_vector @@ to_tsquery('english', 'postgresql');
```

## Array Operations

```sql
-- Array contains
SELECT * FROM products
WHERE 'electronics' = ANY(categories);

-- Array overlap
SELECT * FROM products
WHERE categories && ARRAY['electronics', 'computers'];

-- Unnest array
SELECT
  id,
  unnest(tags) as tag
FROM articles;

-- Aggregate to array
SELECT
  user_id,
  array_agg(DISTINCT category ORDER BY category) as categories
FROM purchases
GROUP BY user_id;
```

## Date/Time Operations

```sql
-- Date truncation
SELECT
  date_trunc('day', created_at) as day,
  COUNT(*) as count
FROM orders
GROUP BY date_trunc('day', created_at)
ORDER BY day;

-- Date ranges
SELECT * FROM events
WHERE event_date BETWEEN '2024-01-01' AND '2024-12-31';

-- Age calculation
SELECT
  name,
  birth_date,
  EXTRACT(YEAR FROM age(birth_date)) as age
FROM users;

-- Generate series
SELECT
  date::date,
  COALESCE(COUNT(o.id), 0) as order_count
FROM generate_series(
  '2024-01-01'::date,
  '2024-01-31'::date,
  '1 day'::interval
) as date
LEFT JOIN orders o ON date_trunc('day', o.created_at) = date
GROUP BY date
ORDER BY date;
```

## Integration

Used by:
- `database-developer` agent
- `fullstack-developer` agent
