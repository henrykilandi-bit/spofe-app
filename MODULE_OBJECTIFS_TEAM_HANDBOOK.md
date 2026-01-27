# SPOFE - MODULE OBJECTIFS
## Team Handbook v2.2

**Version**: 2.2  
**Last Updated**: 2026-01-25  
**Audience**: Development & Operations Teams  
**Status**: Production Ready

---

## TABLE OF CONTENTS

1. [Quick Start Guide](#quick-start-guide)
2. [Architecture Overview](#architecture-overview)
3. [Development Workflows](#development-workflows)
4. [Common Patterns](#common-patterns)
5. [API Reference](#api-reference)
6. [Testing & Quality](#testing--quality)
7. [Deployment](#deployment)
8. [Support & Escalation](#support--escalation)

---

## QUICK START GUIDE

### Prerequisites
```bash
- Node.js 16.x or higher
- MySQL 8.0+
- Redis 6.0+ (optional, for caching)
- npm 8.x+
```

### Installation
```bash
# Clone repository
git clone <repository-url>
cd SPOFE-APP

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure database
nano .env  # Set DB_HOST, DB_USER, DB_PASSWORD

# Run migrations
npm run migrate

# Start development server
npm run dev
```

### First Request
```bash
# Login to get JWT token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'

# Create an objective (save token from above)
curl -X POST http://localhost:3001/api/objectives \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "compagnieId": 1,
    "titre": "Augmenter les ventes de 20%",
    "description": "Objectif stratégique pour Q1 2026",
    "type": "vente",
    "dateDebut": "2026-01-25",
    "dateFin": "2026-03-31"
  }'
```

### Verify Installation
```bash
# Health check
curl http://localhost:3001/api/health

# Run tests
npm test

# Expected: All 120+ tests passing
```

---

## ARCHITECTURE OVERVIEW

### Module Structure
```
cascade/
├── src/
│   ├── controllers/           # Business logic (12 methods/controller)
│   │   ├── objectives.controller.js
│   │   ├── indicators.controller.js
│   │   └── strategicAI.controller.js
│   ├── routes/                # HTTP endpoints (30+)
│   │   ├── objectives.routes.js
│   │   ├── indicators.routes.js
│   │   └── ai.routes.js
│   ├── models/                # Sequelize ORM (4 models)
│   │   ├── strategicObjective.js
│   │   ├── performanceIndicator.js
│   │   ├── objectiveAction.js
│   │   └── externalDataSource.js
│   ├── validators/            # Joi schemas (12+)
│   │   └── objectiveSchemas.js
│   ├── utils/                 # Services & helpers
│   │   ├── strategicAIEngine.js
│   │   ├── objectiveAccountingIntegration.js
│   │   ├── intelligentAlerts.js
│   │   ├── intelligentReporting.js
│   │   ├── response.js
│   │   ├── logger.js
│   │   └── ... (other utilities)
│   ├── middleware/            # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   └── error.middleware.js
│   ├── app.js                 # Express app setup
│   └── server.js              # HTTP server entry
└── tests/
    └── integration/
        ├── objectives.test.js
        ├── indicators.test.js
        └── strategicAI.test.js
```

### Data Flow Diagram
```
HTTP Request
    ↓
[Auth Middleware] → Verify JWT token
    ↓
[Validation Middleware] → Validate input (Joi schema)
    ↓
[Controller] → Execute business logic
    ├─ [Models] → Query database (Sequelize)
    ├─ [Services] → Process data (IA, accounting, etc.)
    └─ [Middleware] → Handle errors
    ↓
[Response Utility] → Format response
    ↓
HTTP Response (JSON)
```

### Database Schema
```
strategic_objectives (40 columns)
├─ id, compagnieId, titre, description, type
├─ dateDebut, dateFin, progression, statut
├─ ... (25+ other fields)

performance_indicators (25 columns)
├─ id, objectifId, type, titre
├─ seuilVERT, seuilJAUNE, seuilROUGE
├─ statut, valeurActuelle
└─ ... (15+ other fields)

objective_actions (20 columns)
├─ id, objectifId, titre, description
├─ responsable, dateDebut, dateFin, progression

external_data_sources (15 columns)
├─ id, objectifId, source, url
├─ fréquenceMAJ, dernièreMAJ
```

### Key Services

**StrategicAIEngine** (strategicAIEngine.js)
- Predictions: Goal achievement probability
- Correlations: KPI relationship analysis
- Anomalies: Outlier detection (Z-score)
- Recommendations: Smart optimization
- Probabilities: Machine learning integration

**ObjectiveAccountingIntegration** (objectiveAccountingIntegration.js)
- GL Linking: Connect objectives to chart of accounts
- Expense Tracking: Track objective-related spending
- Reconciliation: Match budgets vs actuals
- Impact Analysis: Financial impact assessment
- Variance Monitoring: Budget variance tracking

**IntelligentAlerts** (intelligentAlerts.js)
- Real-time monitoring
- Multi-channel routing (dashboard, email, SMS)
- Threshold-based triggering
- Risk detection

**IntelligentReporting** (intelligentReporting.js)
- Strategic reports (executive summaries)
- Benchmark reports (sector comparison)
- Analytics generation
- Visualization metadata

---

## DEVELOPMENT WORKFLOWS

### Feature Development (Adding Endpoints)

**Step 1: Create Controller Method**
```javascript
// cascade/src/controllers/objectives.controller.js

export const getObjectiveStatus = async (req, res, next) => {
  try {
    const objective = await StrategicObjective.findByPk(
      req.params.id,
      { include: [...] }
    );

    if (!objective) {
      return error(res, 'Objective not found', 404);
    }

    const status = calculateStatus(objective);
    return success(res, { status }, 200, 'Status calculated');
  } catch (err) {
    next(err);
  }
};
```

**Step 2: Define Route**
```javascript
// cascade/src/routes/objectives.routes.js

router.get('/:id/status',
  authenticate,
  async (req, res, next) => {
    getObjectiveStatus(req, res, next);
  }
);
```

**Step 3: Add to app.js**
```javascript
// cascade/src/app.js
import objectivesRoutes from './routes/objectives.routes.js';

app.use('/api/objectives', objectivesRoutes);
```

**Step 4: Create Tests**
```javascript
// cascade/tests/integration/objectives.test.js

describe('GET /api/objectives/:id/status', () => {
  test('should return objective status', async () => {
    const res = await request(app)
      .get('/api/objectives/1/status')
      .set('Authorization', `Bearer ${generateToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('status');
  });
});
```

### Bug Fix Workflow

1. **Identify Issue**
   ```bash
   # Check logs
   tail -f logs/error.log
   
   # Run tests to isolate
   npm test -- --testNamePattern="specific test"
   ```

2. **Debug with Breakpoints**
   ```bash
   # Add debugger statements
   debugger;
   
   # Run in debug mode
   node --inspect-brk src/server.js
   
   # Open chrome://inspect in browser
   ```

3. **Fix Code**
   ```javascript
   // Modify controller/model/service
   // Follow existing patterns
   // Use proper error handling
   ```

4. **Test Fix**
   ```bash
   # Run affected tests
   npm test objectives.test.js
   
   # Run full test suite
   npm test
   ```

5. **Verify in Staging**
   ```bash
   # Deploy to staging
   npm run deploy:staging
   
   # Run smoke tests
   npm run smoke-test:staging
   ```

### Performance Optimization

**Identify Bottlenecks**
```bash
# Enable request logging
LOG_LEVEL=debug npm run dev

# Check response times
curl -w "Total time: %{time_total}s\n" \
  http://localhost:3001/api/objectives
```

**Common Optimizations**

1. **Database Query Optimization**
   ```javascript
   // Bad: N+1 query
   const objectives = await StrategicObjective.findAll();
   objectives.forEach(obj => {
     const indicators = obj.getPerformanceIndicators(); // Extra queries
   });

   // Good: Eager loading
   const objectives = await StrategicObjective.findAll({
     include: [PerformanceIndicator]
   });
   ```

2. **Caching**
   ```javascript
   import redis from 'redis';
   
   const cache = redis.createClient();
   const cached = await cache.get(`objective:${id}`);
   if (cached) return JSON.parse(cached);
   ```

3. **Batch Operations**
   ```javascript
   // Instead of updating one by one
   const ids = [1, 2, 3, 4, 5];
   await StrategicObjective.update(
     { progression: 50 },
     { where: { id: ids } }
   );
   ```

---

## COMMON PATTERNS

### Response Format
```javascript
// Success response
{
  success: true,
  code: 200,
  message: "Operation successful",
  data: {
    id: 1,
    titre: "...",
    ...
  }
}

// Error response
{
  success: false,
  code: 400,
  message: "Validation failed",
  errors: {
    titre: ["Title is required"]
  }
}
```

### Error Handling
```javascript
// Controller pattern
export const myMethod = async (req, res, next) => {
  try {
    // Validate
    if (!req.body.required) {
      return error(res, 'Field required', 400);
    }

    // Check authorization
    if (resource.userId !== req.user.id) {
      return unauthorized(res, 'Not authorized');
    }

    // Process
    const result = await Model.findByPk(id);
    if (!result) {
      return error(res, 'Not found', 404);
    }

    // Respond
    return success(res, result, 200, 'Success');
  } catch (err) {
    next(err); // Pass to error middleware
  }
};
```

### Authentication
```javascript
// All protected routes use authenticate middleware
router.post('/protected',
  authenticate,  // Verify JWT
  validate(schema),  // Validate input
  controller  // Execute endpoint
);

// Token generation
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

### Logging Pattern
```javascript
import logger from '../utils/logger.js';

logger.logInfo('Objective created', { objectiveId: 1 });
logger.logError('Database error', error);
logger.logSecurity('Failed login attempt', { username: 'user' });
```

### Soft Delete Pattern
```javascript
// Mark as deleted, don't remove
await objective.update({ deletedAt: new Date() });

// Exclude deleted in queries
const objectives = await StrategicObjective.findAll({
  where: { deletedAt: null }
});

// Restore
await objective.update({ deletedAt: null });
```

---

## API REFERENCE

### Authentication Endpoints

**POST /api/auth/login**
```
Request:
  {
    "username": "admin",
    "password": "password123"
  }

Response (200):
  {
    "success": true,
    "data": {
      "token": "eyJhbGc...",
      "expiresIn": 86400,
      "user": { id, username, role }
    }
  }
```

### Objectives Endpoints

**POST /api/objectives** - Create objective
**GET /api/objectives** - List objectives (with filters)
**GET /api/objectives/:id** - Get objective detail
**PATCH /api/objectives/:id** - Update objective
**DELETE /api/objectives/:id** - Delete objective
**POST /api/objectives/:id/restore** - Restore deleted

### Indicators Endpoints

**POST /api/objectives/:id/indicators** - Create indicator
**GET /api/objectives/:id/indicators** - List indicators
**POST /api/indicators/:id/record** - Record KPI value
**GET /api/indicators/:id/status** - Get current status
**GET /api/indicators/:id/history** - Get historical trend

### AI Endpoints

**POST /api/objectives/:id/ai/predict** - Predict achievement
**GET /api/objectives/:id/ai/correlations** - Analyze correlations
**GET /api/objectives/:id/ai/anomalies** - Detect anomalies
**POST /api/objectives/ai/generate-smart** - Generate SMART goals
**POST /api/objectives/ai/report-strategic** - Generate strategic report

---

## TESTING & QUALITY

### Running Tests
```bash
# All tests
npm test

# Specific suite
npm test objectives.test.js

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Single test
npm test -- -t "should create objective"
```

### Test Structure
```javascript
describe('Feature', () => {
  beforeAll(async () => {
    // Setup (database, mocks)
  });

  test('should do something', async () => {
    // Arrange
    const data = { ... };

    // Act
    const res = await request(app)
      .post('/api/endpoint')
      .send(data);

    // Assert
    expect(res.status).toBe(200);
  });

  afterAll(async () => {
    // Cleanup
  });
});
```

### Code Quality Tools
```bash
# Linting
npm run lint

# Fix lint errors
npm run lint:fix

# Type checking (if TypeScript)
npm run type-check
```

---

## DEPLOYMENT

### Development Environment
```bash
# Start with hot reload
npm run dev

# Runs on http://localhost:3001
```

### Staging Deployment
```bash
# Build
npm run build

# Deploy to staging
npm run deploy:staging

# Verify
npm run smoke-test:staging

# Check logs
tail -f logs/error.log
```

### Production Deployment
```bash
# Pre-deployment checks
npm run pre-deploy

# Build production bundle
npm run build:prod

# Deploy
npm run deploy:prod

# Verify
curl http://api.spofe.prod/api/health

# Monitor
tail -f logs/combined.log
```

### Rollback Procedure
```bash
# If deployment fails
npm run rollback

# This reverts to previous version
# Check status
npm run status:prod
```

---

## SUPPORT & ESCALATION

### Common Issues

**Issue: "Database connection refused"**
- Check MySQL is running: `systemctl status mysql`
- Verify credentials in .env
- Check network connectivity

**Issue: "Invalid token"**
- Token may have expired (24h lifetime)
- Request new login
- Verify JWT_SECRET in .env

**Issue: "Validation error"**
- Check request payload matches schema
- Verify date format (ISO 8601)
- Check decimal precision

**Issue: Test failures**
- Clear database: `npm run db:reset`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version: `node -v` (should be 16+)

### Getting Help

1. **Check logs**
   ```bash
   tail -f logs/error.log
   tail -f logs/combined.log
   ```

2. **Run diagnostics**
   ```bash
   npm run diagnose
   ```

3. **Contact team**
   - Slack: #spofe-development
   - Email: development@spofe.com
   - On-call: See roster in shared drive

### Escalation Path

```
Level 1: Self-service (docs, logs, FAQ)
   ↓
Level 2: Team help (Slack, code review)
   ↓
Level 3: Senior developer (complex issues)
   ↓
Level 4: Architecture team (design changes)
   ↓
Level 5: Executive (business impact)
```

### Performance Monitoring

**Key Metrics to Track**
- Response time (p50, p95, p99)
- Error rate (target: < 0.1%)
- Database query time (target: < 100ms)
- Memory usage (target: < 500MB)
- CPU usage (target: < 70%)

**Alerting Thresholds**
- Response time > 500ms → Warning
- Error rate > 1% → Critical
- Memory > 700MB → Critical
- CPU > 85% → Warning

---

## VERSIONING & RELEASES

### Version Numbers
Format: `MAJOR.MINOR.PATCH` (e.g., 2.2.1)

- **MAJOR**: Breaking changes, architectural shifts
- **MINOR**: New features, new endpoints
- **PATCH**: Bug fixes, performance improvements

### Release Process
1. Create feature branch from `main`
2. Develop and test (npm test)
3. Create pull request with description
4. Code review (at least 2 reviewers)
5. Merge to `main`
6. Tag release: `git tag v2.2.0`
7. Deploy to production
8. Update changelog

---

## BEST PRACTICES

### Code Style
- Use meaningful variable names
- Keep functions < 50 lines
- Add comments for complex logic
- Use async/await (not callbacks)
- Handle errors explicitly

### Database
- Always use Sequelize methods (not raw SQL)
- Use proper indexes on frequently queried columns
- Implement soft-delete for important data
- Use transactions for multi-step operations

### Security
- Validate all inputs (use Joi schemas)
- Never store passwords in logs
- Use environment variables for secrets
- Implement rate limiting on auth endpoints
- Sanitize error messages in responses

### Performance
- Use eager loading for relationships
- Implement caching for read-heavy operations
- Batch database operations when possible
- Monitor and optimize slow queries
- Use pagination for large result sets

---

## ADDITIONAL RESOURCES

- **Documentation**: See [MODULE_OBJECTIFS_PHASE_*_DELIVERY.md](.)
- **API Docs**: [Swagger/OpenAPI Spec](../swagger.json)
- **Database Schema**: [Schema Diagram](../docs/schema.md)
- **Architecture**: [ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md)
- **Changelog**: [CHANGELOG.md](../CHANGELOG.md)

---

**Handbook Version**: 2.2  
**Last Updated**: 2026-01-25  
**Maintained by**: Development Team  
**Questions?** Check the FAQ or contact #spofe-development on Slack
