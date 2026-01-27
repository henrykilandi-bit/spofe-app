# 🧪 Frontend Testing Guide - SPOFE v1.0

## Table of Contents
- [Testing Strategy](#testing-strategy)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [E2E Tests](#e2e-tests)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Coverage Goals](#coverage-goals)

## Testing Strategy

SPOFE frontend uses a **testing pyramid** approach:

```
        /\
       /E2E\          (Cypress) - Full user flows
      /------\
     /        \
    /Integration\    (Vitest) - Component + API
   /            \
  /              \
 /   Unit Tests   \  (Vitest) - Functions, utils
/________________\
```

### Test Types

| Type | Framework | Purpose | Coverage |
|------|-----------|---------|----------|
| **Unit** | Vitest | Test isolated functions | 80%+ |
| **Integration** | Vitest | Test components + API | 60%+ |
| **E2E** | Cypress | Test user workflows | Critical paths |

## Unit Tests

### What to Test

- Component rendering
- User interactions (click, type)
- State changes
- Props handling
- Conditional rendering

### File Location

Tests go in `src/__tests__/` with `.test.jsx` extension

```
src/__tests__/
├── App.test.jsx
├── components.test.jsx
├── store.test.js
└── api.test.js
```

### Example: Component Test

File: `src/__tests__/components.test.jsx`

```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with text', () => {
    render(<Button>Click Me</Button>)
    expect(screen.getByText('Click Me')).toBeTruthy()
  })

  it('handles click events', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click Me</Button>)
    fireEvent.click(screen.getByText('Click Me'))
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Example: API Test

File: `src/__tests__/api.test.js`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends login request', async () => {
    axios.post.mockResolvedValue({
      data: { token: 'abc123', user: { id: 1, email: 'test@test.com' } }
    })

    const response = await api.post('/login', { email: 'test@test.com', password: 'pass' })
    
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.any(Object)
    )
    expect(response.data.token).toBe('abc123')
  })
})
```

## Integration Tests

### What to Test

- Multiple components working together
- API calls and responses
- State management (Zustand)
- Error handling
- Loading states

### Example: App Integration Test

File: `src/__tests__/App.integration.test.jsx`

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '@/App'

vi.mock('axios')

describe('App Integration', () => {
  it('completes login flow', async () => {
    const user = userEvent.setup()
    
    render(<App />)
    
    // User enters credentials
    await user.type(screen.getByPlaceholderText(/email/i), 'admin@test.com')
    await user.type(screen.getByPlaceholderText(/password/i), 'password123')
    
    // Click login
    await user.click(screen.getByRole('button', { name: /connexion/i }))
    
    // Verify redirect
    await waitFor(() => {
      expect(screen.getByText(/Bienvenue/i)).toBeTruthy()
    })
  })
})
```

## E2E Tests

### What to Test

- Complete user workflows
- Navigation flows
- API integration
- Authentication
- Data persistence

### Test Structure

File: `cypress/e2e/auth.cy.js`

```javascript
describe('Authentication', () => {
  beforeEach(() => {
    cy.clearAuth() // Custom command
    cy.visit('http://localhost:5173')
  })

  it('should login successfully', () => {
    cy.login('admin@spofe.com', 'password123')
    cy.url().should('not.include', '/login')
  })

  it('should logout', () => {
    cy.login('admin@spofe.com', 'password123')
    cy.logout() // Custom command
    cy.url().should('include', '/login')
  })
})
```

### Custom Commands

File: `cypress/support/commands.js`

```javascript
Cypress.Commands.add('login', (email, password) => {
  cy.visit('http://localhost:5173/login')
  cy.get('input[placeholder*="email"]').type(email)
  cy.get('input[placeholder*="password"]').type(password)
  cy.get('button').contains(/connexion/i).click()
  cy.url().should('not.include', '/login')
})

Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/déconnexion/i).click()
  cy.url().should('include', '/login')
})
```

## Running Tests

### Unit & Integration Tests

```bash
# Run all tests once
npm run test -- --run

# Run in watch mode (auto-rerun on change)
npm run test

# Run with UI
npm run test:ui

# Run specific test file
npm run test -- src/__tests__/App.test.jsx

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Open Cypress UI (interactive)
npm run e2e

# Run headless (CI mode)
npm run e2e:headless

# Run specific test
npm run e2e -- --spec cypress/e2e/auth.cy.js

# Run with specific browser
npm run e2e -- --browser chrome
```

### Coverage Reports

```bash
# Generate coverage
npm run test:coverage

# View HTML report
open coverage/index.html
```

## Writing Tests

### Best Practices

#### 1. Naming
```javascript
// ✅ Good - describes what is being tested
describe('LoginForm', () => {
  it('should show error on invalid email')
  it('should submit form with valid data')
  it('should disable submit button while loading')
})

// ❌ Bad - too vague
describe('tests', () => {
  it('test 1')
  it('works')
})
```

#### 2. Arrange-Act-Assert (AAA)
```javascript
it('should update user name', () => {
  // ARRANGE - Setup
  const store = useAuthStore.getState()
  
  // ACT - Do something
  store.setUser({ id: 1, name: 'John' })
  
  // ASSERT - Verify
  expect(store.user.name).toBe('John')
})
```

#### 3. Avoid Test Interdependence
```javascript
// ✅ Good - each test is independent
describe('UserStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null })
  })

  it('test 1', () => { ... })
  it('test 2', () => { ... })
})

// ❌ Bad - tests depend on order
let user = null
describe('UserStore', () => {
  it('test 1', () => {
    user = { id: 1 } // Test 2 depends on this
  })
  it('test 2', () => {
    expect(user).toBeDefined() // Fails if test 1 skipped
  })
})
```

#### 4. Mock External Dependencies
```javascript
import { vi } from 'vitest'

// Mock API
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn().mockResolvedValue({ data: {...} })
    }))
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
}
global.localStorage = localStorageMock
```

### Testing Common Scenarios

#### Testing Forms
```javascript
it('should submit form with values', async () => {
  const user = userEvent.setup()
  const handleSubmit = vi.fn()
  
  render(<LoginForm onSubmit={handleSubmit} />)
  
  await user.type(screen.getByPlaceholderText(/email/i), 'test@test.com')
  await user.type(screen.getByPlaceholderText(/password/i), 'pass123')
  await user.click(screen.getByRole('button', { name: /login/i }))
  
  expect(handleSubmit).toHaveBeenCalledWith({
    email: 'test@test.com',
    password: 'pass123'
  })
})
```

#### Testing API Calls
```javascript
it('should fetch data from API', async () => {
  axios.get.mockResolvedValue({
    data: { accounts: [...] }
  })
  
  render(<ChartOfAccounts />)
  
  await waitFor(() => {
    expect(screen.getByText(/plan comptable/i)).toBeTruthy()
  })
  
  expect(axios.get).toHaveBeenCalledWith('/chartsofaccounts')
})
```

#### Testing Error Handling
```javascript
it('should show error message on API failure', async () => {
  axios.get.mockRejectedValue(new Error('Network error'))
  
  render(<ChartOfAccounts />)
  
  await waitFor(() => {
    expect(screen.getByText(/erreur|error/i)).toBeTruthy()
  })
})
```

#### Testing Navigation
```javascript
it('should navigate on link click', async () => {
  const user = userEvent.setup()
  render(<App />)
  
  await user.click(screen.getByText(/plan comptable/i))
  
  expect(window.location.pathname).toBe('/accounts')
})
```

## Coverage Goals

### Target Coverage

| Metric | Target | Priority |
|--------|--------|----------|
| **Statements** | 80% | High |
| **Branches** | 75% | High |
| **Functions** | 80% | High |
| **Lines** | 80% | High |

### Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View coverage
npm run test:coverage -- --ui

# Coverage thresholds (in vitest.config.js)
coverage: {
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80
}
```

### Improve Coverage

```bash
# Find uncovered lines
npm run test:coverage

# View HTML report
open coverage/index.html

# Check specific file
npm run test -- src/App.jsx --coverage
```

## Debugging Tests

### Console Logging
```javascript
it('should work', () => {
  const element = screen.getByText('Hello')
  console.log(element) // View element
  screen.debug() // Print DOM
})
```

### Pause Tests
```javascript
it('should work', async () => {
  const user = userEvent.setup()
  render(<App />)
  
  await user.pause() // Stops here, interact manually
})
```

### Visual Debugging (Cypress)
```javascript
cy.get('button').click().pause() // Pauses after click
cy.debug() // Pauses execution
```

## CI/CD Testing

Frontend tests run automatically on:
- **Push** to `develop` or `main`
- **Pull requests** with frontend changes
- **Manual** trigger (GitHub Actions)

### Test Status Badge

Add to README:
```markdown
![Frontend Tests](https://github.com/spofe/spofe-app/workflows/Frontend%20CI%2FCD/badge.svg)
```

## Common Issues

### Tests Timing Out
```bash
# Increase timeout
npm run test -- --testTimeout=10000

# Or in test
it('should work', async () => {
  // test code
}, 10000) // 10 second timeout
```

### Cannot Find Module
```bash
# Check alias in vite.config.js
# Use: import { Button } from '@/components/ui/button'
# NOT: import { Button } from '../components/ui/button'
```

### localStorage Errors
```javascript
// Ensure setup file is loaded
// Check vitest.config.js setupFiles includes vitest.setup.js
```

## Resources

- [Vitest Docs](https://vitest.dev)
- [Testing Library](https://testing-library.com/react)
- [Cypress Docs](https://docs.cypress.io)
- [Jest Matchers](https://vitest.dev/api/expect.html)

---

**Last Updated**: January 2024
**Version**: 1.0.0
