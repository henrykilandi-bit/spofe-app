# SPOFE Phase 1 Integration Guide

**Objective**: Integrate newly created Phase 0 & 1 components into existing SPOFE codebase  
**Duration**: 30-45 minutes  
**Prerequisites**: Phase 0 & 1 files created (see PHASE_0_1_IMPLEMENTATION_STATUS.md)  

---

## Step 1: Integrate Database Models

### 1.1 Update `cascade/src/models/index.js`

Add these lines after existing model imports:

```javascript
const GroupeSuperUser = require('./GroupeSuperUser');
const PendingApproval = require('./PendingApproval');

// After all model requires, add associations:
// ...existing associations...

// Group Super User associations
GroupeSuperUser.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'superUser' 
});
GroupeSuperUser.belongsTo(GroupeEntreprise, { 
  foreignKey: 'groupe_id', 
  as: 'groupe' 
});
GroupeSuperUser.belongsTo(User, { 
  foreignKey: 'assigned_by', 
  as: 'assignedByUser' 
});

User.hasMany(GroupeSuperUser, { 
  foreignKey: 'user_id', 
  as: 'superUserGroups' 
});
GroupeEntreprise.hasMany(GroupeSuperUser, { 
  foreignKey: 'groupe_id', 
  as: 'superUsers' 
});

// Pending Approval associations
PendingApproval.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});
PendingApproval.belongsTo(GroupeEntreprise, { 
  foreignKey: 'groupe_id', 
  as: 'groupe' 
});
PendingApproval.belongsTo(Compagnie, { 
  foreignKey: 'company_id', 
  as: 'company',
  allowNull: true 
});
PendingApproval.belongsTo(User, { 
  foreignKey: 'approved_by', 
  as: 'approvedByUser',
  allowNull: true 
});

User.hasMany(PendingApproval, { 
  foreignKey: 'user_id', 
  as: 'pendingApprovals' 
});
GroupeEntreprise.hasMany(PendingApproval, { 
  foreignKey: 'groupe_id', 
  as: 'pendingApprovals' 
});

// At end of file, add exports:
module.exports = {
  User,
  GroupeEntreprise,
  Compagnie,
  JournalComptable,
  Entree,
  // ... existing exports ...
  GroupeSuperUser,
  PendingApproval
};
```

---

## Step 2: Register Routes in Express App

### 2.1 Update `cascade/src/app.js`

Add route imports near top of file:

```javascript
// After existing route imports:
const groupeApprovalsRoutes = require('./routes/groupeApprovals.routes');
const authRegistrationRoutes = require('./routes/auth.registration.routes');
```

Register routes in app setup (after existing route registrations):

```javascript
// Group Approvals Routes
app.use('/api/admin', groupeApprovalsRoutes);

// Registration Routes
app.use('/api/auth', authRegistrationRoutes);
```

**Important**: Place these AFTER other auth routes so they don't conflict.

---

## Step 3: Configure Backend Environment

### 3.1 Update `.env` file

Add these environment variables:

```env
# Feature Flags
FEATURE_SUPER_USER_APPROVAL=false
FEATURE_AUTO_REGISTRATION=true
FEATURE_GROUP_DASHBOARD=false

# Frontend URL for email invitations
FRONTEND_URL=http://localhost:5173

# Email Service (optional for MVP)
MAIL_SERVICE=console
# MAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=your_key_here
```

### 3.2 Verify Existing `.env` Variables

Ensure these already exist:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=spofe
JWT_SECRET=your_secret
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

---

## Step 4: Execute Database Migration

### 4.1 Run Migration

From `cascade` directory:

```bash
cd cascade

# Check migration status
npm run migrate:status

# Execute migration (UP)
npm run migrate:up

# If needed, rollback
npm run migrate:down
```

### 4.2 Verify Database Changes

```bash
# MySQL CLI
mysql -u root -p spofe

# Check new tables
SHOW TABLES LIKE 'groupe_super_users';
SHOW TABLES LIKE 'pending_approvals';

# Check table structure
DESC groupe_super_users;
DESC pending_approvals;

# Verify column added
DESC groupes_entreprises;  # Should show new super_user_id column
```

---

## Step 5: Integrate Frontend Routes

### 5.1 Update Frontend Router

Edit `frontend/src/router.jsx` or `frontend/src/App.jsx`:

```javascript
// Import RegisterPage
import RegisterPage from './pages/RegisterPage';

// Add route in your routes array:
{
  path: '/register',
  element: <RegisterPage />,
  public: true  // Allow access without authentication
}

// Optional: Add invitation acceptance page
{
  path: '/accept-invitation',
  element: <RegisterPage />,
  public: true
}
```

---

## Step 6: Verify LoginPage Integration

### 6.1 Check LoginPage Register Link

File: `frontend/src/pages/LoginPage.jsx`

Verify this link exists:

```jsx
<a href="/register" className="create-account-link">
  + Créer un compte
</a>
```

If not present, add after login form.

---

## Step 7: Configure Frontend Environment

### 7.1 Update `frontend/.env` (if using Vite)

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_FRONTEND_URL=http://localhost:5173
```

### 7.2 Update API base URL in hooks

Check `frontend/src/hooks/useRegister.js` and `useGroupApprovals.js`:

```javascript
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
```

---

## Step 8: Start Services & Test

### 8.1 Start Backend

```bash
cd cascade
npm run dev
# Should see: Server running on http://localhost:3001
```

### 8.2 Start Frontend

```bash
cd frontend
npm run dev
# Should see: VITE dev server running at http://localhost:5173
```

### 8.3 Test Registration Flow

1. Go to http://localhost:5173/login
2. Click "Créer un compte" link
3. Fill registration form:
   - Email: test@example.com
   - Username: testuser123
   - Password: Password123!
   - Prenom: Jean
   - Nom: Dupont
4. Submit form
5. Should see success message + redirect to login

### 8.4 Test Feature Flag

```bash
# With feature DISABLED (default):
curl http://localhost:3001/api/auth/register \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test2@example.com",
    "username":"testuser2",
    "password":"Password123!",
    "prenom":"Marie",
    "nom":"Dupont"
  }'

# Should show: "Inscription réussie. Vous pouvez maintenant vous connecter."
```

---

## Step 9: Test Approval Workflow (Optional)

### 9.1 Enable Feature Flag

Update `.env`:

```env
FEATURE_SUPER_USER_APPROVAL=true
```

### 9.2 Create Test Data

```bash
# In MySQL
USE spofe;

# Get user IDs for testing
SELECT id, username, email FROM users LIMIT 5;

# Assume:
# - User 1 is super_admin
# - User 2 is regular user
# - Groupe 1 exists

# Assign super user to group
INSERT INTO groupe_super_users (groupe_id, user_id, assigned_by, createdAt, updatedAt)
VALUES (1, 2, 1, NOW(), NOW());
```

### 9.3 Test Approval Endpoint

```bash
# Get auth token first
curl http://localhost:3001/api/auth/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spofe.com","password":"password"}'

# Copy token from response

# Get pending approvals
curl http://localhost:3001/api/admin/groups/1/pending-approvals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Step 10: Enable Incremental Testing

### 10.1 Test User Registration (No Approval)

```bash
# With FEATURE_SUPER_USER_APPROVAL=false
1. Register user via UI
2. Try to login immediately
3. Should work (no approval required)
```

### 10.2 Test User Registration (With Approval)

```bash
# With FEATURE_SUPER_USER_APPROVAL=true
1. Register user via UI with groupeId
2. Try to login immediately
3. Should FAIL (requires approval)
4. Login as super user
5. Approve registration via API
6. Original user can now login
```

### 10.3 Test Email Availability Check

```bash
curl http://localhost:3001/api/auth/check-email/test@example.com
# Should return: {"available":false} if email exists
```

### 10.4 Test Invitation Flow

```bash
curl http://localhost:3001/api/auth/invite-user \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"newuser@example.com","groupeId":1}'
```

---

## Troubleshooting

### Issue: "Models not found" error

**Solution**: 
```javascript
// In routes, ensure models are required properly:
const { User, GroupeSuperUser, PendingApproval } = require('../models');
```

### Issue: Migration fails with "table already exists"

**Solution**: 
```bash
# Check existing tables:
SHOW TABLES;

# If tables exist but migration is stuck:
# 1. Rollback migration
npm run migrate:down

# 2. Check migration status
npm run migrate:status

# 3. Remove entries from sequelizemeta table
DELETE FROM sequelizemeta WHERE name='001-groupe-super-users.js';

# 4. Re-run migration
npm run migrate:up
```

### Issue: Routes not responding (404 errors)

**Solution**:
1. Verify routes registered in `app.js`
2. Check route path matches exactly
3. Verify middleware chain (auth, validation)
4. Check server logs for errors

### Issue: CORS errors in frontend

**Solution**:
```javascript
// In cascade/src/app.js, ensure CORS enabled:
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue: Password hashing errors

**Solution**:
```bash
# Verify bcrypt installed:
npm ls bcrypt

# If missing:
npm install bcrypt
```

---

## Rollback Procedure (If Needed)

### Full Rollback Steps

```bash
# 1. Stop services
# (Ctrl+C in terminals)

# 2. Rollback database
cd cascade
npm run migrate:down

# 3. Remove new files (optional):
rm cascade/src/models/GroupeSuperUser.js
rm cascade/src/models/PendingApproval.js
rm cascade/src/migrations/001-groupe-super-users.js
rm cascade/src/services/GroupApprovalService.js
# ... etc

# 4. Revert app.js changes
# (Remove route registrations)

# 5. Revert models/index.js changes
# (Remove model imports and associations)

# 6. Restart services
npm run dev
```

**Time to rollback**: ~5 minutes  
**Data loss**: None

---

## Verification Checklist

After integration, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] `/register` route accessible
- [ ] Email availability check working
- [ ] User registration form submits
- [ ] Database tables created
- [ ] Feature flag accessible in code
- [ ] Middleware functions export correctly
- [ ] LoginPage "Créer un compte" link works
- [ ] No CORS errors in browser console

---

## Next Steps After Integration

1. **Run Tests**: `npm run test` (unit & integration)
2. **Security Audit**: Review permission middleware
3. **Load Testing**: Test with multiple concurrent registrations
4. **Prepare Phase 2**: Create approval dashboard page
5. **Document API**: Generate OpenAPI/Swagger spec

---

## Support

If integration issues arise:

1. Check `cascade/logs/error.log` for backend errors
2. Check browser console for frontend errors
3. Verify all files created in correct locations
4. Review database schema with `DESC table_name;`
5. Test API endpoints directly with curl/Postman

---

*Integration Guide: SPOFE Super Utilisateur par Groupe*  
*Date: January 24, 2026*  
*Version: 1.0*
