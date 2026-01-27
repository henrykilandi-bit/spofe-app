# SPOFE Accounting Application - AI Agent Instructions

## Project Overview
SPOFE is a comprehensive accounting management system handling multi-company general ledgers, chart of accounts (OHADA standard), financial statements, and audittools. The architecture uses **Express.js + Node.js backend** with Sequelize ORM, Redis caching, and MySQL database.

## Core Architecture

### Backend Structure (Express.js)
- **Entry**: `cascade/src/server.js` - HTTP server with graceful shutdown
- **App Setup**: `cascade/src/app.js` - Middleware, routes, and error handling
- **MVC Pattern**:
  - Controllers: `cascade/src/controllers/` - Business logic (e.g., `auth.controller.js`)
  - Models: `cascade/src/models/` - Sequelize ORM (User model)
  - Routes: `cascade/src/routes/` - Endpoint definitions
  - Middleware: `cascade/src/middleware/` - Auth, validation, error handling

### Key Patterns
1. **Response Format**: All responses use utility functions from `cascade/src/utils/response.js`:
   ```javascript
   success(res, data, 200, 'Message')
   error(res, 'message', 400, errors)
   unauthorized(res, 'Auth required')
   ```

2. **Validation Pipeline**: Joi schemas in `cascade/src/validators/` validated via middleware
   - Schemas exported: `registerSchema`, `loginSchema`, `resetPasswordSchema`
   - Middleware: `cascade/src/middleware/validation.middleware.js`

3. **Error Handling**: Centralized in `cascade/src/middleware/error.middleware.js`
   - Async errors wrapped in try-catch, passed to `next(error)`
   - Global handler converts to standardized responses

4. **Logging**: Winston-based logger at `cascade/src/utils/logger.js`
   - Methods: `logInfo()`, `logError()`, `logSecurity()`
   - Outputs: `logs/combined.log`, `logs/error.log`, `logs/security.log`

## Developer Workflows

### Quick Start
```bash
npm install
npm run dev          # Start with nodemon (port 3001)
npm run test         # Jest with watch mode (ES modules enabled)
npm run lint         # ESLint check
```

### Testing Approach
- **Unit Tests**: `cascade/tests/auth.controller.test.js` - Jest with mocked dependencies
- **Integration Tests**: `cascade/tests/integration/`
- **Coverage**: `npm run test:all` with NYC reporting
- **Key setup**: Mock `User` model, redis, logger, jsonwebtoken

### Security Checks
```bash
# Run security audit endpoint (requires auth)
curl -X GET http://localhost:3001/api/security/audit \
  -H "Authorization: Bearer $TOKEN"
```

## Important Conventions

### Authentication & Authorization
- JWT tokens (secret in `.env` as `JWT_SECRET`)
- BCrypt password hashing (10 salt rounds)
- Refresh token strategy with `tokenBlacklist.middleware.js`
- Rate limiting: `cascade/src/middleware/rateLimit.middleware.js` protects auth endpoints

### Database
- **ORM**: Sequelize with MySQL 8.0+
- **Migrations**: Via Sequelize CLI (not yet implemented in codebase)
- **User Model**: `cascade/src/models/user.model.js` - id, username, email, password, role, isActive

### Environment Variables
See `.env.example`: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `REDIS_URL`, `NODE_ENV`

## Critical Files for Understanding
1. **STRUCTURE ARCHITECTURALE.txt** - 6 functional modules (accounts, entry, statements, third-party, budget, admin)
2. **CAHIER UI - Standards d'Interface.txt** - UI components, status colors, interaction patterns
3. **LISTE DES ÉCRANS PRINCIPAUX.txt** - 11 main screens (dashboard, entries, GL, balance, statements, etc.)
4. **cascade/QUICK_START.md** - Auth flow examples, security audit, test commands

## Common Tasks

**Adding new endpoints**: Create controller method → Export in controller → Define route in `cascade/src/routes/` → Register in `cascade/src/app.js`

**Fixing auth issues**: Check `cascade/src/middleware/auth.middleware.js` and token validation in controllers

**Database queries**: Use Sequelize User model methods (findOne, create, update, destroy) with `where` clauses

**Error responses**: Always use response utilities, never raw `res.json()` for consistency
