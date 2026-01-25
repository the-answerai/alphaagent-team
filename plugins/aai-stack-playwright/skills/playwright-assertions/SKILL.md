---
name: playwright-assertions
description: Playwright assertion patterns and matchers
user-invocable: false
---

# Playwright Assertions Skill

Patterns for assertions in Playwright tests.

## Auto-Retrying Assertions

### Element Visibility

```typescript
// Visible (default)
await expect(page.getByRole('button')).toBeVisible()
await expect(page.getByRole('button')).not.toBeVisible()

// Hidden
await expect(page.getByRole('dialog')).toBeHidden()

// Attached to DOM (even if not visible)
await expect(page.locator('#loading')).toBeAttached()
await expect(page.locator('#loading')).not.toBeAttached()
```

### Element State

```typescript
// Enabled/Disabled
await expect(page.getByRole('button')).toBeEnabled()
await expect(page.getByRole('button')).toBeDisabled()

// Editable
await expect(page.getByRole('textbox')).toBeEditable()
await expect(page.getByRole('textbox')).not.toBeEditable()

// Focused
await expect(page.getByRole('textbox')).toBeFocused()

// Checked (checkboxes/radio)
await expect(page.getByRole('checkbox')).toBeChecked()
await expect(page.getByRole('checkbox')).not.toBeChecked()
```

### Element Content

```typescript
// Text content
await expect(page.locator('.message')).toHaveText('Hello World')
await expect(page.locator('.message')).toHaveText(/hello/i)
await expect(page.locator('.message')).toContainText('Hello')

// Multiple elements
await expect(page.locator('.item')).toHaveText([
  'First',
  'Second',
  'Third',
])

// Input value
await expect(page.getByRole('textbox')).toHaveValue('test@example.com')
await expect(page.getByRole('textbox')).toHaveValue(/test/)
await expect(page.getByRole('textbox')).not.toBeEmpty()

// Select value
await expect(page.getByRole('combobox')).toHaveValue('option1')
await expect(page.getByRole('combobox')).toHaveValues(['opt1', 'opt2'])
```

### Element Attributes

```typescript
// Attribute presence
await expect(page.locator('input')).toHaveAttribute('required')

// Attribute value
await expect(page.locator('a')).toHaveAttribute('href', '/home')
await expect(page.locator('a')).toHaveAttribute('href', /\/home/)

// ID
await expect(page.locator('button')).toHaveId('submit-btn')

// Class
await expect(page.locator('div')).toHaveClass('card active')
await expect(page.locator('div')).toHaveClass(/active/)

// CSS property
await expect(page.locator('.box')).toHaveCSS('background-color', 'rgb(255, 0, 0)')
await expect(page.locator('.box')).toHaveCSS('display', 'flex')
```

### Element Count

```typescript
// Exact count
await expect(page.locator('.item')).toHaveCount(5)
await expect(page.locator('.item')).toHaveCount(0)

// Empty
await expect(page.locator('.list .item')).not.toHaveCount(0)
```

## Page Assertions

### URL

```typescript
// Exact URL
await expect(page).toHaveURL('https://example.com/dashboard')

// URL pattern
await expect(page).toHaveURL(/dashboard/)
await expect(page).toHaveURL(/\/users\/\d+/)

// URL with query params
await expect(page).toHaveURL('https://example.com?page=2')
```

### Title

```typescript
// Exact title
await expect(page).toHaveTitle('Dashboard - MyApp')

// Pattern
await expect(page).toHaveTitle(/Dashboard/)
```

## Response Assertions

```typescript
// Wait for response
const response = await page.waitForResponse('**/api/users')

// Status code
expect(response.status()).toBe(200)

// Response body
const body = await response.json()
expect(body.users).toHaveLength(10)
```

## Soft Assertions

```typescript
// Continue after failure (collect multiple failures)
await expect.soft(page.getByRole('heading')).toHaveText('Title')
await expect.soft(page.getByRole('button')).toBeVisible()
await expect.soft(page.locator('.count')).toHaveText('5')

// Check for any soft assertion failures
expect(test.info().errors).toHaveLength(0)
```

## Custom Timeouts

```typescript
// Per assertion timeout
await expect(page.locator('.loading')).toBeHidden({ timeout: 10000 })
await expect(page.locator('.data')).toHaveText('Loaded', { timeout: 5000 })

// Global timeout in config
// playwright.config.ts
export default defineConfig({
  expect: {
    timeout: 10000,
  },
})
```

## Negation

```typescript
// Not assertions
await expect(page.locator('.error')).not.toBeVisible()
await expect(page.locator('input')).not.toBeDisabled()
await expect(page.locator('.items')).not.toHaveCount(0)
await expect(page.locator('.status')).not.toHaveText('Error')
```

## Polling Assertions

```typescript
// Custom polling condition
await expect.poll(async () => {
  const response = await page.request.get('/api/status')
  return response.json()
}).toEqual({ status: 'ready' })

// With options
await expect.poll(async () => {
  return await page.locator('.count').textContent()
}, {
  timeout: 30000,
  intervals: [100, 250, 500, 1000],
}).toBe('10')
```

## Snapshot Assertions

```typescript
// Text snapshot
await expect(page.locator('.data')).toHaveText(
  await page.locator('.data').textContent()
)

// Screenshot comparison
await expect(page).toHaveScreenshot('homepage.png')
await expect(page.locator('.card')).toHaveScreenshot('card.png')

// With options
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
})
```

## Accessibility Assertions

```typescript
// Check ARIA attributes
await expect(page.getByRole('button')).toHaveAccessibleName('Submit form')
await expect(page.getByRole('textbox')).toHaveAccessibleDescription('Enter email')

// Combined with role
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled()
```

## Multiple Assertions Pattern

```typescript
// Group related assertions
test('user profile displays correctly', async ({ page }) => {
  await page.goto('/profile')

  const profileCard = page.locator('.profile-card')

  // Assert multiple aspects
  await expect(profileCard).toBeVisible()
  await expect(profileCard.locator('.name')).toHaveText('John Doe')
  await expect(profileCard.locator('.email')).toHaveText('john@example.com')
  await expect(profileCard.locator('.avatar')).toHaveAttribute('src', /avatar/)
  await expect(profileCard.getByRole('button', { name: 'Edit' })).toBeEnabled()
})
```

## Async Assertion Patterns

```typescript
// Wait for condition then assert
await page.getByRole('button', { name: 'Load' }).click()
await expect(page.locator('.data')).toHaveText('Loaded')

// Assert API response triggered by action
await Promise.all([
  page.waitForResponse('**/api/data'),
  page.getByRole('button', { name: 'Fetch' }).click(),
])

// Assert navigation
await page.getByRole('link', { name: 'Dashboard' }).click()
await expect(page).toHaveURL('/dashboard')
```

## Best Practices

### Use Auto-Retrying

```typescript
// GOOD: Auto-retrying (waits up to timeout)
await expect(page.locator('.result')).toHaveText('Success')

// BAD: Non-retrying (snapshot in time)
const text = await page.locator('.result').textContent()
expect(text).toBe('Success')  // May fail during loading
```

### Assert User-Visible State

```typescript
// GOOD: Assert what user sees
await expect(page.getByRole('alert')).toHaveText('Saved successfully')
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled()

// BAD: Assert implementation details
await expect(page.locator('[data-loading="false"]')).toBeVisible()
```

### Specific Assertions

```typescript
// GOOD: Specific assertion
await expect(page.getByRole('heading')).toHaveText('Welcome, John')

// BAD: Overly broad assertion
await expect(page.getByRole('heading')).toBeVisible()
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
