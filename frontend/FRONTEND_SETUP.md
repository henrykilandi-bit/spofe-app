# 🚀 Frontend Setup Guide - SPOFE v1.0

## Table of Contents
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building](#building)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# http://localhost:5173
```

## Project Structure

```
frontend/
├── cypress/                  # E2E tests
│   ├── e2e/                 # Test scenarios
│   │   ├── auth.cy.js       # Authentication flows
│   │   ├── navigation.cy.js # Navigation tests
│   │   └── data.cy.js       # API data loading
│   └── support/             # Test helpers
│       ├── commands.js      # Custom commands
│       └── e2e.js           # Setup/teardown
├── public/                   # Static assets
├── src/
│   ├── __tests__/           # Unit tests
│   │   ├── App.test.jsx
│   │   └── components.test.jsx
│   ├── components/          # Reusable components
│   │   └── ui/
│   │       ├── button.jsx
│   │       └── card.jsx
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # React entry point
│   └── index.css            # Global styles
├── .env.example             # Environment template
├── .eslintrc.cjs            # Linting rules
├── .gitignore               # Git ignore
├── cypress.config.js        # E2E test config
├── package.json             # Dependencies
├── vite.config.js           # Build config
└── vitest.config.js         # Unit test config
```

## Installation

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm)
- **Backend API** running on http://localhost:3001

### Steps

1. **Clone and install**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local`:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_APP_NAME=SPOFE
   VITE_APP_VERSION=1.0.0
   ```

3. **Verify installation**
   ```bash
   npm run lint
   npm run test -- --run
   ```

## Configuration

### Environment Variables

**Development** (`.env.local`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=SPOFE
VITE_APP_VERSION=1.0.0
```

**Production** (set in CI/CD):
```env
VITE_API_URL=https://api.spofe.com
VITE_APP_NAME=SPOFE
VITE_APP_VERSION=1.0.0
```

### Vite Configuration

File: `vite.config.js`

Key settings:
- **Port**: 5173
- **API Proxy**: `/api` → `VITE_API_URL`
- **Source Maps**: Enabled
- **Build Output**: `dist/`

### ESLint Rules

File: `.eslintrc.cjs`

Rules enforced:
- ES2021 syntax
- React best practices
- React hooks rules
- Prop types validation (warnings)

## Development

### Available Scripts

```bash
# Development server with HMR
npm run dev

# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage

# E2E tests (interactive)
npm run e2e

# E2E tests (headless)
npm run e2e:headless

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Workflow

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Edit components** in `src/`
   - Hot Module Replacement (HMR) applies changes instantly
   - Browser refreshes automatically

3. **Run tests during development**
   ```bash
   npm run test
   ```

4. **Check code quality**
   ```bash
   npm run lint
   ```

### Code Style

- **Format**: Use ESLint rules (enforced in CI)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Imports**: Use path alias `@/` for src files
- **Comments**: Document complex logic and APIs

Example:
```javascript
// ✅ Good
import { Button } from '@/components/ui/button'

const handleLogin = async (credentials) => {
  // Validate credentials
  const response = await api.post('/login', credentials)
  return response.data
}

// ❌ Bad
import Button from '../../../components/ui/button'
const handle_login = (creds) => { ... }
```

## Building

### Production Build

```bash
# Build optimized bundle
npm run build

# Size analysis
npm run build -- --stats
```

Output: `dist/` directory

### Preview Production Build

```bash
npm run preview

# Opens http://localhost:4173
```

### Build Settings

File: `vite.config.js`

- **Minifier**: terser
- **Source Maps**: Enabled
- **Chunks**: Automatically split
- **CSS**: Extracted to separate files

## Testing

### Unit & Integration Tests (Vitest)

```bash
# Run tests
npm run test

# Run with UI
npm run test:ui

# Generate coverage
npm run test:coverage
```

Files:
- `src/__tests__/App.test.jsx` - App component
- `src/__tests__/components.test.jsx` - UI components

### E2E Tests (Cypress)

```bash
# Open Cypress UI
npm run e2e

# Run headless
npm run e2e:headless
```

Test files:
- `cypress/e2e/auth.cy.js` - Authentication flows
- `cypress/e2e/navigation.cy.js` - Navigation
- `cypress/e2e/data.cy.js` - API data loading

## Troubleshooting

### Port 5173 Already in Use

```bash
# Use different port
npm run dev -- --port 5174
```

### API Connection Errors

1. **Check backend is running**
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Verify environment variable**
   ```bash
   cat .env.local | grep VITE_API_URL
   ```

3. **Check browser console** for CORS or network errors

### Node Modules Issues

```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

### HMR Not Working

1. Check vite.config.js has dev server settings
2. Ensure no file watchers limit:
   ```bash
   # Linux/macOS
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   ```

### Tests Failing

```bash
# Clear test cache
npm run test -- --clearCache

# Run with verbose output
npm run test -- --reporter=verbose
```

## CI/CD Integration

Frontend CI/CD pipeline (`.github/workflows/frontend.yml`):

1. **Lint** - ESLint check
2. **Unit Tests** - Vitest run
3. **Build** - Production bundle
4. **E2E Tests** - Cypress suite
5. **Deploy** - Vercel/hosting

Triggers:
- Push to `develop` or `main`
- Changes in `frontend/` folder
- PRs with frontend changes

## Common Tasks

### Add New Page

1. Create component in `src/components/`
2. Add route in `App.jsx`
3. Update sidebar navigation
4. Add tests in `src/__tests__/`

Example:
```javascript
// src/components/Reports.jsx
export function Reports() {
  return <div>Reports Page</div>
}

// src/App.jsx - add route
<Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
```

### Add UI Component

1. Create in `src/components/ui/`
2. Export from `src/components/ui/index.js` (if exists)
3. Use with import

Example:
```javascript
// src/components/ui/input.jsx
export function Input({ placeholder, ...props }) {
  return <input placeholder={placeholder} {...props} />
}

// Use in component
import { Input } from '@/components/ui/input'
```

### Debug Component State

```javascript
// In component
import { useEffect } from 'react'

export function MyComponent() {
  useEffect(() => {
    console.log('Component mounted')
  }, [])
  
  return <div>...</div>
}
```

## Performance Optimization

### Code Splitting

Vite automatically splits code by route:
```javascript
// Lazy load heavy components
const Reports = lazy(() => import('@/components/Reports'))
const Chart = lazy(() => import('@/components/Chart'))
```

### Image Optimization

- Use `public/` for static images
- Use WebP format when possible
- Compress images before committing

### Bundle Analysis

```bash
npm run build -- --stats
# Open dist/stats.html
```

## Resources

- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Vitest Docs](https://vitest.dev)
- [Cypress Docs](https://docs.cypress.io)
- [Tailwind CSS](https://tailwindcss.com)

## Support

For issues:
1. Check this guide's Troubleshooting section
2. Check project issues on GitHub
3. Review backend API documentation
4. Contact development team

---

**Last Updated**: January 2024
**Version**: 1.0.0
