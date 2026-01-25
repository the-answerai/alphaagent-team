---
name: playwright-selectors
description: Playwright selector strategies and patterns
user-invocable: false
---

# Playwright Selectors Skill

Strategies for selecting elements in Playwright tests.

## Recommended Selectors

### By Role (Preferred)

```typescript
// Buttons
await page.getByRole('button', { name: 'Submit' })
await page.getByRole('button', { name: /submit/i })

// Links
await page.getByRole('link', { name: 'Home' })
await page.getByRole('link', { name: 'Learn more' }).first()

// Form elements
await page.getByRole('textbox', { name: 'Email' })
await page.getByRole('checkbox', { name: 'Accept terms' })
await page.getByRole('combobox', { name: 'Country' })
await page.getByRole('radio', { name: 'Option A' })

// Headings
await page.getByRole('heading', { name: 'Welcome' })
await page.getByRole('heading', { level: 1 })

// Navigation
await page.getByRole('navigation')
await page.getByRole('main')
await page.getByRole('dialog')

// Lists
await page.getByRole('list')
await page.getByRole('listitem')

// Tables
await page.getByRole('table')
await page.getByRole('row')
await page.getByRole('cell', { name: 'Value' })
```

### By Test ID (Reliable)

```typescript
// Single element
await page.getByTestId('submit-button')
await page.getByTestId('user-profile')

// In HTML
<button data-testid="submit-button">Submit</button>

// Configure attribute name
// playwright.config.ts
export default defineConfig({
  use: {
    testIdAttribute: 'data-test-id',
  },
})
```

### By Label (Forms)

```typescript
// Text inputs
await page.getByLabel('Email')
await page.getByLabel('Password')

// With exact match
await page.getByLabel('Email', { exact: true })

// Associated label
<label for="email">Email</label>
<input id="email" type="email" />
```

### By Placeholder

```typescript
await page.getByPlaceholder('Enter your email')
await page.getByPlaceholder('Search...')
```

### By Text

```typescript
// Contains text
await page.getByText('Welcome')

// Exact match
await page.getByText('Welcome', { exact: true })

// Regex
await page.getByText(/welcome/i)

// In specific element
await page.locator('h1').getByText('Welcome')
```

### By Alt Text

```typescript
// Images
await page.getByAltText('Company logo')
await page.getByAltText(/product image/i)
```

### By Title

```typescript
await page.getByTitle('Close dialog')
await page.getByTitle(/tooltip/i)
```

## CSS Selectors

### Basic CSS

```typescript
// By class
await page.locator('.submit-button')
await page.locator('.card.featured')

// By ID
await page.locator('#main-content')

// By attribute
await page.locator('[data-state="active"]')
await page.locator('input[type="email"]')
await page.locator('[aria-expanded="true"]')

// Descendant
await page.locator('.card .title')
await page.locator('#form input')

// Child
await page.locator('.list > li')

// Sibling
await page.locator('.label + input')
```

### Pseudo Selectors

```typescript
// First/last
await page.locator('.item:first-child')
await page.locator('.item:last-child')
await page.locator('.item:nth-child(2)')

// State
await page.locator('button:enabled')
await page.locator('input:disabled')
await page.locator('input:focus')
await page.locator('input:checked')

// Content
await page.locator('button:has-text("Submit")')
await page.locator('div:has(.icon)')
```

## XPath Selectors

```typescript
// Basic XPath
await page.locator('xpath=//button[@id="submit"]')
await page.locator('xpath=//div[contains(@class, "card")]')

// Text content
await page.locator('xpath=//button[text()="Submit"]')
await page.locator('xpath=//h1[contains(text(), "Welcome")]')

// Axes
await page.locator('xpath=//div[@class="card"]//button')
await page.locator('xpath=//label[text()="Email"]/following-sibling::input')
```

## Chaining and Filtering

### Chaining Locators

```typescript
// Chain methods
const row = page.getByRole('row', { name: 'John' })
const editButton = row.getByRole('button', { name: 'Edit' })

// Nested locators
const card = page.locator('.card').filter({ hasText: 'Featured' })
const title = card.locator('.title')
```

### Filtering

```typescript
// Filter by text
await page.locator('.item').filter({ hasText: 'Active' })

// Filter by not having text
await page.locator('.item').filter({ hasNotText: 'Deleted' })

// Filter by child element
await page.locator('.card').filter({ has: page.locator('.badge') })

// Filter by not having child
await page.locator('.card').filter({ hasNot: page.locator('.error') })
```

### Multiple Elements

```typescript
// First match
await page.locator('.item').first()

// Last match
await page.locator('.item').last()

// By index
await page.locator('.item').nth(2)

// Count
const count = await page.locator('.item').count()

// All elements
const items = await page.locator('.item').all()
for (const item of items) {
  await item.click()
}
```

## Frame Selectors

```typescript
// By name/id
const frame = page.frame('frame-name')

// By URL
const frame = page.frame({ url: /embedded/ })

// Frame locator
const frameLocator = page.frameLocator('iframe.embed')
await frameLocator.getByRole('button').click()

// Nested frames
const nestedFrame = page.frameLocator('iframe').frameLocator('iframe')
```

## Shadow DOM

```typescript
// Playwright automatically pierces open shadow DOM
await page.locator('custom-element').locator('.inner-element')

// Explicit shadow piercing
await page.locator('custom-element >> .inner-element')
```

## Layout Selectors

```typescript
// Position-based
await page.locator('.button').locator(':near(.icon)')
await page.locator('.button').locator(':left-of(.other)')
await page.locator('.button').locator(':right-of(.other)')
await page.locator('.button').locator(':above(.other)')
await page.locator('.button').locator(':below(.other)')
```

## Waiting Strategies

```typescript
// Auto-waiting (built-in)
await page.getByRole('button').click()  // Waits for element

// Custom wait
await page.getByRole('button').waitFor()
await page.getByRole('button').waitFor({ state: 'visible' })
await page.getByRole('button').waitFor({ state: 'hidden' })
await page.getByRole('button').waitFor({ state: 'attached' })
await page.getByRole('button').waitFor({ state: 'detached' })

// With timeout
await page.getByRole('button').waitFor({ timeout: 5000 })
```

## Best Practices

### Selector Priority

```
1. getByRole()       - Most resilient, tests accessibility
2. getByTestId()     - Explicit, decoupled from UI
3. getByLabel()      - Good for forms
4. getByPlaceholder()- When label not available
5. getByText()       - For unique visible text
6. CSS selectors     - When semantic selectors not available
7. XPath             - Complex traversal only
```

### Avoiding Brittle Selectors

```typescript
// BAD: Brittle selectors
await page.locator('.btn-primary.ml-2.mt-3')  // Styling classes
await page.locator('div > div > div > button') // Structure-dependent
await page.locator('[class*="Button-module"]')  // Generated classes

// GOOD: Resilient selectors
await page.getByRole('button', { name: 'Submit' })
await page.getByTestId('submit-form')
await page.getByLabel('Email address')
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
