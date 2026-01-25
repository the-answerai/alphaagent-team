---
name: defensive-api-handling
description: Safely handles API responses to prevent crashes from malformed JSON, HTML error pages, or unexpected response types. Use any time calling API endpoints.
---

# Defensive API Handling

**Purpose**: Safely handle API responses to prevent crashes

**When to Use**: Any time you call an API endpoint (in tests or production code)

---

## Never Assume API Returns JSON

APIs can return:
- JSON (expected)
- HTML error pages
- Empty responses
- Malformed JSON
- Non-200 status codes

**Your code must handle ALL of these safely.**

---

## Pattern 1: Safe JSON Parsing

```typescript
async function safeJsonParse(response: Response): Promise<unknown | null> {
  // 1. Check status code
  if (!response.ok) {
    console.warn(`API returned ${response.status} ${response.statusText}`);
    return null;
  }

  // 2. Check content type
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    console.warn(`Expected JSON, got ${contentType}`);
    const text = await response.text();
    console.warn(`Response body: ${text.slice(0, 200)}`);
    return null;
  }

  // 3. Try to parse
  try {
    return await response.json();
  } catch (error) {
    console.warn('Failed to parse JSON:', error.message);
    return null;
  }
}
```

---

## Pattern 2: Fetch with Timeout

```typescript
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}
```

---

## Pattern 3: Retry Logic

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<Response | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Retry on 5xx errors
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`Attempt ${attempt} failed with ${response.status}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        continue;
      }

      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(`All ${maxRetries} attempts failed:`, error.message);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  return null;
}
```

---

## Pattern 4: Type-Safe API Responses

```typescript
// Define expected response types
interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// Type guard function
function isApiResponse<T>(
  value: unknown,
  dataGuard: (v: unknown) => v is T
): value is ApiResponse<T> {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  if ('error' in obj && typeof obj.error !== 'string') return false;
  if ('data' in obj && !dataGuard(obj.data)) return false;

  return true;
}

// Safe API call with type checking
async function safeApiCall<T>(
  url: string,
  dataGuard: (v: unknown) => v is T
): Promise<T | null> {
  const response = await fetchWithRetry(url);
  if (!response) return null;

  const json = await safeJsonParse(response);
  if (!json) return null;

  if (!isApiResponse(json, dataGuard)) {
    console.warn('Unexpected response structure:', json);
    return null;
  }

  if (json.error) {
    console.warn('API returned error:', json.error);
    return null;
  }

  return json.data ?? null;
}
```

---

## Pattern 5: Error Boundary for API Calls

```typescript
async function withApiErrorBoundary<T>(
  operation: () => Promise<T>,
  context: string,
  fallback: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`[${context}] API error:`, error.message);

    // Log additional context
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error(`Network error - check connectivity`);
    }

    return fallback;
  }
}

// Usage
const users = await withApiErrorBoundary(
  () => fetchUsers(),
  'fetchUsers',
  [] // fallback to empty array
);
```

---

## Anti-Patterns to Avoid

```typescript
// ❌ BAD: Assumes JSON, no error handling
const data = await fetch('/api/users').then(r => r.json());

// ❌ BAD: No timeout
const response = await fetch('/api/slow-endpoint');

// ❌ BAD: Trusts response structure
const users = data.users.map(u => u.name);

// ❌ BAD: Silent failures
try {
  return await fetch('/api/users').then(r => r.json());
} catch {
  return [];  // Caller doesn't know it failed
}
```

---

## Success Criteria

- Zero `SyntaxError: Unexpected token '<'` errors
- Zero `Cannot read property of undefined` errors
- Cleanup hooks never cause test suite to crash
- Tests skip gracefully when API unavailable
- All API calls have timeouts
- Errors are logged with context
