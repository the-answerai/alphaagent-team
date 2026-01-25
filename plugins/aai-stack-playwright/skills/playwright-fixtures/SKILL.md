---
name: playwright-fixtures
description: Playwright fixtures and test setup patterns
user-invocable: false
---

# Playwright Fixtures Skill

Patterns for using fixtures and test setup in Playwright.

## Built-in Fixtures

### Page and Context

```typescript
import { test, expect } from '@playwright/test'

test('basic test', async ({ page }) => {
  // page is auto-created and cleaned up
  await page.goto('/')
  await expect(page).toHaveTitle(/Welcome/)
})

test('with context', async ({ context }) => {
  // Full browser context (cookies, storage)
  const page1 = await context.newPage()
  const page2 = await context.newPage()

  await page1.goto('/page1')
  await page2.goto('/page2')
})

test('with browser', async ({ browser }) => {
  // Create isolated context
  const context = await browser.newContext()
  const page = await context.newPage()

  await page.goto('/')
  await context.close()
})
```

### Request Fixture

```typescript
test('API test', async ({ request }) => {
  // Make API requests
  const response = await request.get('/api/users')
  expect(response.ok()).toBeTruthy()

  const users = await response.json()
  expect(users).toHaveLength(10)
})

test('create then verify', async ({ request, page }) => {
  // Create via API
  await request.post('/api/users', {
    data: { name: 'John', email: 'john@test.com' },
  })

  // Verify in UI
  await page.goto('/users')
  await expect(page.getByText('John')).toBeVisible()
})
```

## Custom Fixtures

### Basic Custom Fixture

```typescript
// fixtures.ts
import { test as base } from '@playwright/test'

type MyFixtures = {
  adminPage: Page
  userEmail: string
}

export const test = base.extend<MyFixtures>({
  // Simple fixture
  userEmail: async ({}, use) => {
    await use(`user-${Date.now()}@test.com`)
  },

  // Fixture with setup/teardown
  adminPage: async ({ browser }, use) => {
    // Setup
    const context = await browser.newContext()
    const page = await context.newPage()
    await page.goto('/admin/login')
    await page.fill('[name="email"]', 'admin@test.com')
    await page.fill('[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/admin/dashboard')

    // Provide to test
    await use(page)

    // Cleanup
    await context.close()
  },
})

export { expect } from '@playwright/test'

// In tests
import { test, expect } from './fixtures'

test('admin dashboard', async ({ adminPage }) => {
  await expect(adminPage.getByRole('heading')).toHaveText('Admin Dashboard')
})
```

### Fixtures with Dependencies

```typescript
type Fixtures = {
  dbConnection: Database
  testUser: User
  authenticatedPage: Page
}

export const test = base.extend<Fixtures>({
  // Database fixture
  dbConnection: async ({}, use) => {
    const db = await Database.connect()
    await use(db)
    await db.disconnect()
  },

  // Depends on dbConnection
  testUser: async ({ dbConnection }, use) => {
    const user = await dbConnection.createUser({
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
    })
    await use(user)
    await dbConnection.deleteUser(user.id)
  },

  // Depends on testUser
  authenticatedPage: async ({ page, testUser }, use) => {
    await page.goto('/login')
    await page.fill('[name="email"]', testUser.email)
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await use(page)
  },
})
```

### Worker Fixtures

```typescript
// Shared across all tests in worker
type WorkerFixtures = {
  apiServer: Server
  sharedData: SharedData
}

export const test = base.extend<{}, WorkerFixtures>({
  // Worker-scoped (shared)
  apiServer: [async ({}, use) => {
    const server = await startMockServer()
    await use(server)
    await server.close()
  }, { scope: 'worker' }],

  // Test-scoped (per test)
  sharedData: [async ({ apiServer }, use) => {
    const data = await apiServer.getData()
    await use(data)
  }, { scope: 'worker' }],
})
```

### Auto Fixtures

```typescript
export const test = base.extend<{
  setupComplete: void
}>({
  // Auto-run for every test
  setupComplete: [async ({ page }, use) => {
    // Clear local storage before each test
    await page.addInitScript(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await use()
  }, { auto: true }],
})
```

## Authentication Fixtures

### Storage State

```typescript
// global-setup.ts
import { chromium } from '@playwright/test'

async function globalSetup() {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'user@example.com')
  await page.fill('[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await page.waitForURL('/dashboard')

  // Save state
  await context.storageState({ path: './auth/user.json' })

  await browser.close()
}

export default globalSetup

// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  projects: [
    {
      name: 'authenticated',
      use: { storageState: './auth/user.json' },
    },
  ],
})
```

### Multiple Auth States

```typescript
// fixtures.ts
type AuthFixtures = {
  adminContext: BrowserContext
  userContext: BrowserContext
}

export const test = base.extend<AuthFixtures>({
  adminContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: './auth/admin.json',
    })
    await use(context)
    await context.close()
  },

  userContext: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: './auth/user.json',
    })
    await use(context)
    await context.close()
  },
})

// In tests
test('admin and user interaction', async ({ adminContext, userContext }) => {
  const adminPage = await adminContext.newPage()
  const userPage = await userContext.newPage()

  await adminPage.goto('/admin/users')
  await userPage.goto('/dashboard')
})
```

## Page Object Model

### Page Objects

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel('Email')
    this.passwordInput = page.getByLabel('Password')
    this.submitButton = page.getByRole('button', { name: 'Sign in' })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

// pages/DashboardPage.ts
export class DashboardPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async expectWelcome(name: string) {
    await expect(this.page.getByRole('heading')).toContainText(`Welcome, ${name}`)
  }
}
```

### POMs as Fixtures

```typescript
// fixtures.ts
import { test as base } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'

type PageObjects = {
  loginPage: LoginPage
  dashboardPage: DashboardPage
}

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page))
  },
})

// In tests
import { test, expect } from './fixtures'

test('login flow', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password')
  await dashboardPage.expectWelcome('User')
})
```

## Test Data Fixtures

### Factory Fixtures

```typescript
type Fixtures = {
  createUser: (overrides?: Partial<User>) => Promise<User>
  createPost: (user: User, overrides?: Partial<Post>) => Promise<Post>
}

export const test = base.extend<Fixtures>({
  createUser: async ({ request }, use) => {
    const createdUsers: User[] = []

    const factory = async (overrides = {}) => {
      const user = {
        email: `user-${Date.now()}@test.com`,
        name: 'Test User',
        ...overrides,
      }

      const response = await request.post('/api/users', { data: user })
      const created = await response.json()
      createdUsers.push(created)
      return created
    }

    await use(factory)

    // Cleanup
    for (const user of createdUsers) {
      await request.delete(`/api/users/${user.id}`)
    }
  },

  createPost: async ({ request }, use) => {
    const factory = async (user: User, overrides = {}) => {
      const post = {
        title: 'Test Post',
        content: 'Content',
        authorId: user.id,
        ...overrides,
      }

      const response = await request.post('/api/posts', { data: post })
      return await response.json()
    }

    await use(factory)
  },
})
```

## Fixture Options

```typescript
type Options = {
  locale: string
  timezone: string
}

export const test = base.extend<Options>({
  locale: ['en-US', { option: true }],
  timezone: ['America/New_York', { option: true }],
})

// Override in test file
test.use({
  locale: 'de-DE',
  timezone: 'Europe/Berlin',
})

test('german locale', async ({ page, locale }) => {
  expect(locale).toBe('de-DE')
})
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
