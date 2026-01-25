---
name: playwright-visual-testing
description: Playwright visual comparison and screenshot testing
user-invocable: false
---

# Playwright Visual Testing Skill

Patterns for visual regression testing with Playwright.

## Screenshot Assertions

### Basic Screenshot Comparison

```typescript
import { test, expect } from '@playwright/test'

test('visual comparison', async ({ page }) => {
  await page.goto('/')

  // Compare full page
  await expect(page).toHaveScreenshot()

  // With custom name
  await expect(page).toHaveScreenshot('homepage.png')
})

// Element screenshot
test('component visual test', async ({ page }) => {
  await page.goto('/components')

  const card = page.locator('.card').first()
  await expect(card).toHaveScreenshot('card-component.png')
})
```

### Screenshot Options

```typescript
await expect(page).toHaveScreenshot('name.png', {
  // Comparison options
  maxDiffPixels: 100,           // Allow N different pixels
  maxDiffPixelRatio: 0.05,      // Allow 5% difference
  threshold: 0.2,                // Color difference threshold (0-1)

  // Capture options
  fullPage: true,                // Capture entire scrollable page
  clip: { x: 0, y: 0, width: 800, height: 600 },
  scale: 'css',                  // 'css' or 'device'
  animations: 'disabled',        // Disable animations
  mask: [page.locator('.dynamic')],  // Mask dynamic content
  maskColor: '#FF00FF',          // Mask overlay color
})
```

### Updating Snapshots

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific test
npx playwright test visual.spec.ts --update-snapshots
```

## Handling Dynamic Content

### Masking Elements

```typescript
test('mask dynamic content', async ({ page }) => {
  await page.goto('/dashboard')

  await expect(page).toHaveScreenshot('dashboard.png', {
    mask: [
      page.locator('.timestamp'),
      page.locator('.user-avatar'),
      page.locator('.random-ad'),
    ],
  })
})
```

### Waiting for Stability

```typescript
test('wait for animations', async ({ page }) => {
  await page.goto('/animated-page')

  // Wait for animations to complete
  await page.waitForTimeout(500)

  // Or wait for specific state
  await page.locator('.loading').waitFor({ state: 'hidden' })

  await expect(page).toHaveScreenshot()
})
```

### Disabling Animations

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Disable CSS animations and transitions
    // JS animations need manual handling
  },
})

// In test
test('no animations', async ({ page }) => {
  await page.goto('/')

  // Add CSS to disable animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  })

  await expect(page).toHaveScreenshot()
})
```

### Replacing Dynamic Content

```typescript
test('replace dynamic dates', async ({ page }) => {
  await page.goto('/orders')

  // Replace dynamic dates with static text
  await page.evaluate(() => {
    document.querySelectorAll('.date').forEach(el => {
      el.textContent = 'FIXED_DATE'
    })
  })

  await expect(page).toHaveScreenshot()
})
```

## Responsive Testing

### Multiple Viewports

```typescript
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
]

for (const viewport of viewports) {
  test(`homepage - ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')

    await expect(page).toHaveScreenshot(`homepage-${viewport.name}.png`)
  })
}
```

### Using Projects

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },
    {
      name: 'tablet-portrait',
      use: {
        ...devices['iPad Pro 11'],
      },
    },
  ],
})
```

## Theming and States

### Dark Mode

```typescript
test('dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.goto('/')

  await expect(page).toHaveScreenshot('homepage-dark.png')
})

test('light mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' })
  await page.goto('/')

  await expect(page).toHaveScreenshot('homepage-light.png')
})
```

### Component States

```typescript
test('button states', async ({ page }) => {
  await page.goto('/components/button')

  const button = page.getByRole('button', { name: 'Submit' })

  // Default state
  await expect(button).toHaveScreenshot('button-default.png')

  // Hover state
  await button.hover()
  await expect(button).toHaveScreenshot('button-hover.png')

  // Focus state
  await button.focus()
  await expect(button).toHaveScreenshot('button-focus.png')

  // Disabled state
  await page.evaluate(() => {
    (document.querySelector('button') as HTMLButtonElement).disabled = true
  })
  await expect(button).toHaveScreenshot('button-disabled.png')
})
```

## Configuration

### Global Config

```typescript
// playwright.config.ts
export default defineConfig({
  expect: {
    toHaveScreenshot: {
      // Default comparison options
      maxDiffPixels: 50,
      threshold: 0.3,
      animations: 'disabled',
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  // Snapshot directory
  snapshotDir: './screenshots',

  // Platform-specific snapshots
  snapshotPathTemplate: '{testDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-projectName}{ext}',
})
```

### Platform Handling

```typescript
// Separate snapshots per platform
// playwright.config.ts
export default defineConfig({
  snapshotPathTemplate: '{testDir}/__snapshots__/{testFileName}/{arg}-{projectName}-{platform}{ext}',
})

// Or ignore platform differences
test('cross-platform visual', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixelRatio: 0.1,  // Allow platform font differences
  })
})
```

## CI Integration

### GitHub Actions

```yaml
# .github/workflows/visual.yml
name: Visual Tests

on: [push, pull_request]

jobs:
  visual:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npx playwright install --with-deps

      - run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: visual-test-results
          path: test-results/
          retention-days: 7
```

### Updating in CI

```bash
# Update snapshots in CI (usually PR)
npx playwright test --update-snapshots

# Commit updated snapshots
git add **/*.png
git commit -m "Update visual snapshots"
```

## Best Practices

### Stable Screenshots

```typescript
test('stable visual test', async ({ page }) => {
  // 1. Use consistent viewport
  await page.setViewportSize({ width: 1280, height: 720 })

  // 2. Load page and wait
  await page.goto('/', { waitUntil: 'networkidle' })

  // 3. Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready)

  // 4. Disable animations
  await page.addStyleTag({
    content: '* { animation: none !important; transition: none !important; }'
  })

  // 5. Mask dynamic content
  await expect(page).toHaveScreenshot('page.png', {
    mask: [page.locator('.timestamp'), page.locator('.ad')],
  })
})
```

### Organizing Snapshots

```
tests/
├── visual/
│   ├── homepage.spec.ts
│   ├── dashboard.spec.ts
│   └── components.spec.ts
├── __snapshots__/
│   ├── homepage.spec.ts-snapshots/
│   │   ├── homepage-desktop-chromium.png
│   │   └── homepage-mobile-webkit.png
│   └── components.spec.ts-snapshots/
│       ├── button-default.png
│       └── button-hover.png
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
