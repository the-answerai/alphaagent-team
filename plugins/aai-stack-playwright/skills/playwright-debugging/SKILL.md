---
name: playwright-debugging
description: Playwright debugging techniques and tools
user-invocable: false
---

# Playwright Debugging Skill

Techniques for debugging Playwright tests.

## Debug Mode

### Using --debug

```bash
# Run with inspector
npx playwright test --debug

# Debug specific test
npx playwright test tests/login.spec.ts --debug

# Debug specific line
npx playwright test tests/login.spec.ts:15 --debug
```

### PWDEBUG Environment Variable

```bash
# Enable Playwright Inspector
PWDEBUG=1 npx playwright test

# Console debug mode
PWDEBUG=console npx playwright test
```

### In-Code Debugging

```typescript
test('debug this test', async ({ page }) => {
  await page.goto('/')

  // Pause and open inspector
  await page.pause()

  await page.click('button')
})
```

## Playwright Inspector

### Inspector Features

```typescript
// Inspector opens automatically with --debug
// Features:
// - Step through actions
// - View selectors
// - Record new steps
// - Explore elements
// - View console logs
```

### Recording Actions

```bash
# Start codegen to record tests
npx playwright codegen https://example.com

# With specific viewport
npx playwright codegen --viewport-size=800,600 https://example.com

# Save to file
npx playwright codegen -o tests/recorded.spec.ts https://example.com
```

## Trace Viewer

### Enabling Traces

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',  // Only on retry
    // trace: 'on',           // Always
    // trace: 'retain-on-failure', // Keep on failure
  },
})

// Or per test
test.use({ trace: 'on' })

// Or in beforeAll
test.beforeAll(async ({ browser }, testInfo) => {
  testInfo.config.use.trace = 'on'
})
```

### Viewing Traces

```bash
# Open trace viewer
npx playwright show-trace trace.zip

# View from test results
npx playwright show-report
# Click on test, then "Traces" tab
```

### Trace Contents

```
Trace includes:
- Screenshots at each action
- DOM snapshots
- Network requests
- Console logs
- Test source
- Action timeline
```

## Screenshots

### Capture Screenshots

```typescript
// Full page
await page.screenshot({ path: 'screenshot.png' })

// Full page including scrollable content
await page.screenshot({ path: 'full.png', fullPage: true })

// Element only
await page.locator('.card').screenshot({ path: 'card.png' })

// With options
await page.screenshot({
  path: 'screenshot.png',
  type: 'png',           // 'png' or 'jpeg'
  quality: 80,           // For jpeg
  clip: { x: 0, y: 0, width: 800, height: 600 },
})
```

### Auto Screenshots on Failure

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    // screenshot: 'on',  // Always
    // screenshot: 'off', // Never
  },
})
```

## Videos

### Enable Video Recording

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    video: 'on-first-retry',
    // video: 'on',           // Always record
    // video: 'retain-on-failure', // Keep on failure
  },
})

// With options
export default defineConfig({
  use: {
    video: {
      mode: 'on',
      size: { width: 1280, height: 720 },
    },
  },
})
```

### Access Video Path

```typescript
test.afterEach(async ({}, testInfo) => {
  if (testInfo.status === 'failed') {
    const videoPath = testInfo.attachments.find(a => a.name === 'video')?.path
    console.log('Video saved to:', videoPath)
  }
})
```

## Console Logs

### Capture Browser Console

```typescript
test('capture console', async ({ page }) => {
  const logs: string[] = []

  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`)
  })

  await page.goto('/')

  // Check logs
  expect(logs).not.toContain('error')
})
```

### Log Page Errors

```typescript
test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => {
    console.error('Page error:', error.message)
  })

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Console error:', msg.text())
    }
  })
})
```

## Network Debugging

### Capture Network

```typescript
test('debug network', async ({ page }) => {
  const requests: string[] = []

  page.on('request', request => {
    requests.push(`${request.method()} ${request.url()}`)
  })

  page.on('response', response => {
    if (!response.ok()) {
      console.log(`Failed: ${response.status()} ${response.url()}`)
    }
  })

  await page.goto('/')
})
```

### HAR Recording

```typescript
// Record HAR file
const context = await browser.newContext({
  recordHar: { path: 'network.har' },
})

const page = await context.newPage()
await page.goto('/')
await context.close()  // HAR saved on close

// Replay HAR in tests
await page.routeFromHAR('network.har', {
  update: false,
  notFound: 'fallback',
})
```

## Slow Motion

### Slow Down Execution

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    launchOptions: {
      slowMo: 500,  // 500ms between actions
    },
  },
})

// Or per test
test.use({
  launchOptions: {
    slowMo: 1000,
  },
})
```

## Headed Mode

### Run with Browser Window

```bash
# Run headed
npx playwright test --headed

# Keep browser open on failure
npx playwright test --headed --timeout=0
```

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    headless: false,
  },
})
```

## Test Isolation

### Debug Test Isolation

```typescript
// Run tests serially for debugging
test.describe.configure({ mode: 'serial' })

test('first', async ({ page }) => {
  // ...
})

test('second depends on first', async ({ page }) => {
  // ...
})
```

### Preserve Context

```typescript
// Keep context between tests
let context: BrowserContext
let page: Page

test.beforeAll(async ({ browser }) => {
  context = await browser.newContext()
  page = await context.newPage()
})

test.afterAll(async () => {
  await context.close()
})

test('test 1', async () => {
  await page.goto('/step1')
})

test('test 2', async () => {
  // Continues from test 1
  await page.goto('/step2')
})
```

## Verbose Logging

### Enable Verbose Output

```bash
# Debug all logs
DEBUG=pw:* npx playwright test

# Specific categories
DEBUG=pw:api npx playwright test
DEBUG=pw:browser npx playwright test
DEBUG=pw:protocol npx playwright test
```

## Interactive Commands

### In Test Commands

```typescript
test('debug', async ({ page }) => {
  await page.goto('/')

  // Evaluate in page context
  const title = await page.evaluate(() => document.title)
  console.log('Title:', title)

  // Get element properties
  const button = page.getByRole('button')
  console.log('Button text:', await button.textContent())
  console.log('Button visible:', await button.isVisible())
  console.log('Button enabled:', await button.isEnabled())

  // Pause for manual inspection
  await page.pause()
})
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
