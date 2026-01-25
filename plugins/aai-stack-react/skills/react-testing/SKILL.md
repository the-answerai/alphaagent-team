---
name: react-testing
description: React Testing Library patterns for component testing
user-invocable: false
---

# React Testing Skill

Patterns for testing React components with React Testing Library.

## Testing Philosophy

React Testing Library encourages testing components the way users interact with them, not implementation details.

### The Guiding Principles

1. Test behavior, not implementation
2. Find elements like a user would
3. Interact like a user would
4. Assert on what the user sees

## Rendering Components

### Basic Rendering

```tsx
import { render, screen } from '@testing-library/react'

test('renders greeting', () => {
  render(<Greeting name="World" />)

  expect(screen.getByText('Hello, World!')).toBeInTheDocument()
})
```

### Rendering with Providers

```tsx
function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {},
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={setupStore(preloadedState)}>
        <ThemeProvider>
          <Router>
            {children}
          </Router>
        </ThemeProvider>
      </Provider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Usage
test('renders with providers', () => {
  renderWithProviders(<UserDashboard />)
  expect(screen.getByText('Dashboard')).toBeInTheDocument()
})
```

## Queries

### Query Priority

Use queries in this order (most to least preferred):

```tsx
// 1. Accessible queries (preferred)
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email')
screen.getByText('Hello World')
screen.getByDisplayValue('current value')

// 2. Semantic queries
screen.getByAltText('Profile picture')
screen.getByTitle('Close')

// 3. Test IDs (last resort)
screen.getByTestId('custom-element')
```

### Query Variants

```tsx
// getBy* - Throws if not found (use for elements that should exist)
screen.getByRole('button')

// queryBy* - Returns null if not found (use for asserting absence)
expect(screen.queryByText('Loading')).not.toBeInTheDocument()

// findBy* - Returns promise, waits for element (use for async)
const button = await screen.findByRole('button')

// *AllBy* - Returns array of all matches
const items = screen.getAllByRole('listitem')
```

### Role-Based Queries

```tsx
// Buttons
screen.getByRole('button', { name: /submit/i })

// Links
screen.getByRole('link', { name: /home/i })

// Form elements
screen.getByRole('textbox', { name: /email/i })
screen.getByRole('checkbox', { name: /remember me/i })
screen.getByRole('combobox', { name: /country/i })

// Headings
screen.getByRole('heading', { name: /welcome/i, level: 1 })

// Navigation
screen.getByRole('navigation')

// Lists
screen.getByRole('list')
screen.getAllByRole('listitem')
```

## User Interactions

### Click Events

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

test('button click increments counter', async () => {
  const user = userEvent.setup()
  render(<Counter />)

  const button = screen.getByRole('button', { name: /increment/i })
  await user.click(button)

  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### Typing

```tsx
test('form submission', async () => {
  const user = userEvent.setup()
  const onSubmit = jest.fn()
  render(<LoginForm onSubmit={onSubmit} />)

  await user.type(screen.getByLabelText(/email/i), 'test@example.com')
  await user.type(screen.getByLabelText(/password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /sign in/i }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```

### Select and Keyboard

```tsx
test('select option', async () => {
  const user = userEvent.setup()
  render(<CountrySelect />)

  await user.selectOptions(
    screen.getByRole('combobox', { name: /country/i }),
    'US'
  )

  expect(screen.getByRole('combobox')).toHaveValue('US')
})

test('keyboard navigation', async () => {
  const user = userEvent.setup()
  render(<Form />)

  await user.tab()  // Focus first input
  await user.type(screen.getByLabelText(/name/i), 'John')
  await user.tab()  // Focus next input
  await user.keyboard('{Enter}')  // Submit form
})
```

## Async Testing

### Waiting for Elements

```tsx
test('loads user data', async () => {
  render(<UserProfile userId="123" />)

  // Wait for loading to finish
  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  // Wait for data to appear
  expect(await screen.findByText('John Doe')).toBeInTheDocument()
})
```

### waitFor

```tsx
import { waitFor } from '@testing-library/react'

test('form validation', async () => {
  const user = userEvent.setup()
  render(<Form />)

  await user.click(screen.getByRole('button', { name: /submit/i }))

  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })
})

test('disappearing element', async () => {
  render(<Notification />)

  expect(screen.getByText(/success/i)).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.queryByText(/success/i)).not.toBeInTheDocument()
  })
})
```

### waitForElementToBeRemoved

```tsx
test('loading state disappears', async () => {
  render(<DataLoader />)

  await waitForElementToBeRemoved(() => screen.queryByText(/loading/i))

  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

## Mocking

### Mocking API Calls

```tsx
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/user/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'John Doe' }))
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('fetches user data', async () => {
  render(<UserProfile userId="123" />)

  expect(await screen.findByText('John Doe')).toBeInTheDocument()
})

test('handles error', async () => {
  server.use(
    rest.get('/api/user/:id', (req, res, ctx) => {
      return res(ctx.status(500))
    })
  )

  render(<UserProfile userId="123" />)

  expect(await screen.findByText(/error loading user/i)).toBeInTheDocument()
})
```

### Mocking Hooks

```tsx
jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}))

import { useUser } from '../hooks/useUser'

test('renders user when loaded', () => {
  (useUser as jest.Mock).mockReturnValue({
    user: { name: 'John' },
    loading: false,
    error: null,
  })

  render(<UserProfile />)
  expect(screen.getByText('John')).toBeInTheDocument()
})
```

### Mocking Router

```tsx
import { MemoryRouter, Route, Routes } from 'react-router-dom'

test('navigates on click', async () => {
  const user = userEvent.setup()

  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </MemoryRouter>
  )

  await user.click(screen.getByRole('link', { name: /about/i }))

  expect(screen.getByText(/about page/i)).toBeInTheDocument()
})
```

## Component Testing Patterns

### Testing Forms

```tsx
describe('RegistrationForm', () => {
  test('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  test('submits with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<RegistrationForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.click(screen.getByRole('button', { name: /register/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    })
  })
})
```

### Testing Modals

```tsx
test('opens and closes modal', async () => {
  const user = userEvent.setup()
  render(<App />)

  // Modal not visible initially
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  // Open modal
  await user.click(screen.getByRole('button', { name: /open modal/i }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()

  // Close modal
  await user.click(screen.getByRole('button', { name: /close/i }))
  await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
})
```

### Testing Lists

```tsx
test('renders and filters list items', async () => {
  const user = userEvent.setup()
  render(<TodoList />)

  // Verify initial items
  const items = screen.getAllByRole('listitem')
  expect(items).toHaveLength(3)

  // Filter items
  await user.type(screen.getByRole('searchbox'), 'buy')

  const filteredItems = screen.getAllByRole('listitem')
  expect(filteredItems).toHaveLength(1)
  expect(filteredItems[0]).toHaveTextContent('Buy groceries')
})
```

## Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

## Debug Utilities

```tsx
test('debugging', () => {
  render(<Component />)

  // Print current DOM
  screen.debug()

  // Print specific element
  screen.debug(screen.getByRole('button'))

  // Log accessible roles
  screen.logTestingPlaygroundURL()  // Opens Testing Playground with current DOM
})
```

## Integration

Used by:
- `frontend-developer` agent
- `e2e-test-specialist` agent
- `unit-test-specialist` agent
