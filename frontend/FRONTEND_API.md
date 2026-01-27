# 🌍 Frontend API Integration Guide - SPOFE v1.0

## Table of Contents
- [API Configuration](#api-configuration)
- [Authentication](#authentication)
- [API Client](#api-client)
- [Making Requests](#making-requests)
- [Error Handling](#error-handling)
- [Interceptors](#interceptors)
- [Best Practices](#best-practices)
- [Available Endpoints](#available-endpoints)

## API Configuration

### Base URL Setup

The API client is configured in `src/App.jsx`:

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
})
```

### Environment Variables

Set in `.env.local`:

```env
# Development
VITE_API_URL=http://localhost:3001/api

# Production
VITE_API_URL=https://api.spofe.com/api
```

## Authentication

### Auth Store (Zustand)

Located in `src/App.jsx`:

```javascript
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  logout: () => {
    set({ user: null, token: null })
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}), {
  name: 'auth-storage' // localStorage key
})
```

### Login Flow

1. **User submits credentials**
   ```javascript
   const response = await api.post('/auth/login', {
     email: 'admin@spofe.com',
     password: 'password123'
   })
   ```

2. **API returns token & user**
   ```json
   {
     "token": "eyJhbGc...",
     "user": {
       "id": 1,
       "email": "admin@spofe.com",
       "name": "Admin",
       "role": "admin"
     }
   }
   ```

3. **Store token & user**
   ```javascript
   const store = useAuthStore.getState()
   store.setToken(response.data.token)
   store.setUser(response.data.user)
   ```

4. **Token persisted in localStorage**
   - Key: `auth-storage`
   - Format: JSON string

### Token Usage

Token is automatically sent in all requests:

```javascript
// Request Interceptor
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## API Client

### Creating Instance

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})
```

### Configuration Options

| Option | Value | Purpose |
|--------|-------|---------|
| `baseURL` | http://localhost:3001/api | Prepended to all URLs |
| `timeout` | 10000ms | Request timeout |
| `Content-Type` | application/json | Request format |
| `Authorization` | Bearer token | Authentication header |

## Making Requests

### GET Request (Fetch Data)

```javascript
// Simple GET
const response = await api.get('/chartsofaccounts')

// With query parameters
const response = await api.get('/chartsofaccounts', {
  params: {
    page: 1,
    limit: 20,
    sort: 'code'
  }
})

// Response structure
console.log(response.data) // { accounts: [...] }
console.log(response.status) // 200
```

### POST Request (Create Data)

```javascript
const response = await api.post('/chartsofaccounts', {
  code: '1010',
  name: 'Bank Account',
  type: 'asset',
  category: 'current_asset'
})

// Response
console.log(response.data.id) // Newly created ID
```

### PUT Request (Update Data)

```javascript
const response = await api.put(`/chartsofaccounts/${id}`, {
  name: 'Updated Account Name',
  category: 'fixed_asset'
})
```

### DELETE Request (Remove Data)

```javascript
const response = await api.delete(`/chartsofaccounts/${id}`)
console.log(response.status) // 204 (No Content)
```

## Error Handling

### Response Interceptor

Handles errors globally in `src/App.jsx`:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    
    if (status === 401) {
      // Unauthorized - auto logout
      const store = useAuthStore.getState()
      store.logout()
      window.location.href = '/login'
    }
    
    // Return error to caller
    return Promise.reject(error)
  }
)
```

### Try-Catch Pattern

```javascript
try {
  const response = await api.get('/chartsofaccounts')
  setAccounts(response.data.accounts)
} catch (error) {
  const message = error.response?.data?.message || 'Network error'
  setError(message)
  console.error('API Error:', error)
}
```

### Error Object Structure

```javascript
error.response = {
  status: 404,
  data: {
    message: 'Account not found',
    errors: { id: ['Invalid ID'] }
  }
}

error.request // XMLHttpRequest (no response)
error.message // 'Network error'
```

### Common Status Codes

| Status | Meaning | Action |
|--------|---------|--------|
| **200** | OK | Success |
| **201** | Created | Resource created |
| **400** | Bad Request | Invalid input |
| **401** | Unauthorized | Token invalid/expired |
| **403** | Forbidden | No permission |
| **404** | Not Found | Resource doesn't exist |
| **500** | Server Error | Backend issue |

## Interceptors

### Request Interceptor

Runs before sending request:

```javascript
api.interceptors.request.use(
  (config) => {
    // Add token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateId()
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

### Response Interceptor

Runs after receiving response:

```javascript
api.interceptors.response.use(
  (response) => {
    // Log successful request
    console.log('API Success:', response.config.url, response.status)
    return response
  },
  (error) => {
    // Log error
    console.error('API Error:', error.response?.status, error.message)
    
    // Handle 401
    if (error.response?.status === 401) {
      // Redirect to login
    }
    
    return Promise.reject(error)
  }
)
```

## Best Practices

### 1. Always Use Try-Catch

```javascript
// ✅ Good
async function fetchAccounts() {
  try {
    const response = await api.get('/chartsofaccounts')
    setAccounts(response.data)
  } catch (error) {
    setError('Failed to load accounts')
  }
}

// ❌ Bad
async function fetchAccounts() {
  const response = await api.get('/chartsofaccounts') // May crash
  setAccounts(response.data)
}
```

### 2. Show Loading State

```javascript
// ✅ Good
function ChartOfAccounts() {
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState([])
  
  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const response = await api.get('/chartsofaccounts')
        setAccounts(response.data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  
  if (loading) return <div>Loading...</div>
  return <table>...</table>
}
```

### 3. Cache Data

```javascript
// ✅ Use state to cache
const [accounts, setAccounts] = useState([])
const [lastFetch, setLastFetch] = useState(null)

async function fetchAccounts() {
  // Only fetch if not already loaded
  if (accounts.length > 0) return
  
  const response = await api.get('/chartsofaccounts')
  setAccounts(response.data)
  setLastFetch(new Date())
}
```

### 4. Validate Input

```javascript
// ✅ Validate before sending
async function createAccount(data) {
  if (!data.code || !data.name) {
    setError('Code and name are required')
    return
  }
  
  const response = await api.post('/chartsofaccounts', data)
  return response.data
}
```

### 5. Use Proper Status Codes

```javascript
// ✅ Good error messages
if (error.response?.status === 409) {
  setError('Account code already exists')
} else if (error.response?.status === 400) {
  setError('Invalid account data')
} else {
  setError('Server error, please try again')
}
```

## Available Endpoints

### Authentication

```
POST   /auth/login              Login user
POST   /auth/logout             Logout user
POST   /auth/refresh            Refresh token
POST   /auth/register           Create account
```

### Chart of Accounts

```
GET    /chartsofaccounts        List all accounts
GET    /chartsofaccounts/:id    Get specific account
POST   /chartsofaccounts        Create new account
PUT    /chartsofaccounts/:id    Update account
DELETE /chartsofaccounts/:id    Delete account
```

### Users

```
GET    /users                   List users
GET    /users/:id               Get user details
PUT    /users/:id               Update user
DELETE /users/:id               Delete user
```

### Dashboard

```
GET    /dashboard/stats         Get dashboard statistics
GET    /dashboard/summary       Get financial summary
```

### Health

```
GET    /health                  API health check
```

## Example: Complete Flow

### 1. Setup API Client

File: `src/App.jsx`

```javascript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export { api }
```

### 2. Use in Component

```javascript
import { api } from '@/App'

export function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setLoading(true)
        const response = await api.get('/chartsofaccounts')
        setAccounts(response.data.accounts || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load accounts')
      } finally {
        setLoading(false)
      }
    }

    fetchAccounts()
  }, [])

  if (loading) return <div>Chargement...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <table>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.id}>
            <td>{account.code}</td>
            <td>{account.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

### 3. Test API Call

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

describe('ChartOfAccounts', () => {
  it('should fetch and display accounts', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: {
        accounts: [
          { id: 1, code: '1010', name: 'Bank Account' }
        ]
      }
    })

    render(<ChartOfAccounts />)

    await waitFor(() => {
      expect(screen.getByText('Bank Account')).toBeTruthy()
    })
  })
})
```

## Debugging API Issues

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Make API request
4. Check Request/Response headers

### Log All Requests

```javascript
api.interceptors.request.use((config) => {
  console.log('➤ Request:', config.method.toUpperCase(), config.url, config.data)
  return config
})

api.interceptors.response.use(
  (response) => {
    console.log('✓ Response:', response.status, response.data)
    return response
  },
  (error) => {
    console.error('✗ Error:', error.response?.status, error.response?.data)
    return Promise.reject(error)
  }
)
```

### Test API Health

```bash
# Check backend is running
curl -X GET http://localhost:3001/api/health

# Test login endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spofe.com","password":"password123"}'
```

## Resources

- [Axios Docs](https://axios-http.com)
- [Backend API Docs](../cascade/README.md)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)
- [RESTful API Best Practices](https://restfulapi.net)

---

**Last Updated**: January 2024
**Version**: 1.0.0
