# 🚀 SPOFE Deployment Instructions

**Last Updated**: January 24, 2026  
**Status**: Ready for Integration & Deployment  
**Environment**: Development → Staging → Production  

---

## Pre-Deployment Checklist

### Requirements
- [ ] Node.js 14+ installed
- [ ] MySQL 8.0+ running
- [ ] Redis 6+ running
- [ ] Git repository access
- [ ] 2+ hours for integration
- [ ] 1+ hour for testing

### Team Readiness
- [ ] Backend developer assigned
- [ ] Frontend developer assigned
- [ ] QA tester assigned
- [ ] Team lead oversight
- [ ] Rollback plan reviewed

---

## Step-by-Step Deployment Process

### Phase 1: Local Integration (45 minutes)

#### Step 1: Clone/Pull Latest Code
```bash
git clone <repo> # if first time
# or
git pull origin main # if already cloned
```

#### Step 2: Create Feature Branch (Optional but Recommended)
```bash
git checkout -b feature/super-user-groupe
```

#### Step 3: Integrate Backend Models (15 min)
```bash
# File: cascade/src/models/index.js
# Add after existing imports:

const GroupeSuperUser = require('./GroupeSuperUser');
const PendingApproval = require('./PendingApproval');

# Add associations section (copy from PHASE_1_INTEGRATION_GUIDE.md)

# Add exports:
module.exports = {
  User,
  GroupeEntreprise,
  // ... existing
  GroupeSuperUser,    // ADD THIS
  PendingApproval    // ADD THIS
};
```

#### Step 4: Integrate Backend Routes (10 min)
```bash
# File: cascade/src/app.js
# Add after existing imports:

const groupeApprovalsRoutes = require('./routes/groupeApprovals.routes');
const authRegistrationRoutes = require('./routes/auth.registration.routes');

# Add after existing route registrations:
app.use('/api/admin', groupeApprovalsRoutes);
app.use('/api/auth', authRegistrationRoutes);
```

#### Step 5: Configure Environment (5 min)
```bash
# File: cascade/.env
# Add these lines:

FEATURE_SUPER_USER_APPROVAL=false
FEATURE_AUTO_REGISTRATION=true
FEATURE_GROUP_DASHBOARD=false
FRONTEND_URL=http://localhost:5173
```

#### Step 6: Execute Database Migration (10 min)
```bash
cd cascade

# Check migration status
npm run migrate:status

# Execute migration
npm run migrate:up

# Verify tables created
mysql -u root -p spofe -e "SHOW TABLES LIKE 'groupe%';"
```

#### Step 7: Integrate Frontend Router (5 min)
```bash
# File: frontend/src/router.jsx (or App.jsx)
# Add import:
import RegisterPage from './pages/RegisterPage';

# Add route:
{
  path: '/register',
  element: <RegisterPage />,
  public: true
}
```

### Phase 2: Local Testing (45 minutes)

#### Step 8: Start Services
```bash
# Terminal 1: Backend
cd cascade
npm run dev
# Should see: Server running on http://localhost:3001

# Terminal 2: Frontend
cd frontend
npm run dev
# Should see: VITE dev server running at http://localhost:5173

# Terminal 3: Check logs (optional)
cd cascade
tail -f logs/error.log
```

#### Step 9: Test Registration Flow
```bash
# Browser: http://localhost:5173/register
# Fill form:
# - Email: test.user@example.com
# - Username: testuser123
# - Password: TestPass123!
# - Prenom: Test
# - Nom: User
# Submit
# Expected: Success message + redirect to login
```

#### Step 10: Test User Login
```bash
# Browser: http://localhost:5173/login
# Use credentials from Step 9
# Expected: Successfully logged in
```

#### Step 11: Verify Database
```bash
mysql -u root -p spofe
SELECT * FROM users WHERE email='test.user@example.com';
# Should show: user record created
SHOW TABLES;
# Should show: groupe_super_users, pending_approvals tables
```

#### Step 12: Test Email Check (Optional)
```bash
curl http://localhost:3001/api/auth/check-email/test.user@example.com
# Should return: {"available":false}

curl http://localhost:3001/api/auth/check-email/unique.email@example.com
# Should return: {"available":true}
```

### Phase 3: Git Commit (5 minutes)

```bash
# Stage changes
git add cascade/src/models/index.js
git add cascade/src/app.js
git add cascade/.env
git add frontend/src/router.jsx

# Commit
git commit -m "feat: integrate super-user-groupe Phase 0-1

- Add GroupeSuperUser and PendingApproval models
- Register groupeApprovals and authRegistration routes
- Add feature flags (FEATURE_SUPER_USER_APPROVAL=false)
- Add /register route to frontend
- All integration tests passing"

# Push to feature branch
git push origin feature/super-user-groupe
```

### Phase 4: Staging Deployment (30 minutes)

#### Step 13: Deploy to Staging
```bash
# Assuming standard deployment pipeline

# Option A: Manual deployment
ssh staging-server
cd /path/to/spofe
git pull origin feature/super-user-groupe
cd cascade
npm install  # if needed
npm run migrate:up  # execute migration
npm run build
pm2 restart spofe-backend

cd ../frontend
npm install  # if needed
npm run build
npm run preview  # or deploy to CDN

# Option B: Automated CI/CD
# Push to staging branch (your pipeline runs tests + deploys)
git push origin staging
# Wait for CI/CD pipeline to complete
```

#### Step 14: Verify Staging Deployment
```bash
# Check services running
curl http://staging.spofe.com/api/auth/check-email/test@test.com
# Should respond with JSON

# Check database
mysql -h staging-db staging_db -e "SELECT COUNT(*) FROM users;"
# Should show user count

# Test in browser
# Visit: http://staging.spofe.com/register
# Test registration flow
# Test login
```

#### Step 15: Run Staging Tests (20 min)
```bash
cd cascade
npm run test  # unit tests
npm run test:integration  # integration tests
npm run test:e2e  # end-to-end tests (if available)

# All tests should pass
```

### Phase 5: Code Review & Approval (varies)

```bash
# Create pull request
# Go to GitHub/GitLab/Bitbucket
# Create PR from feature/super-user-groupe to main
# Add reviewers
# Wait for approval
# All CI checks must pass ✅
```

### Phase 6: Merge & Production Deployment

#### Step 16: Merge to Main
```bash
# After PR approved:
git checkout main
git pull origin main
git merge feature/super-user-groupe

# Option: Squash commits for cleaner history
git merge --squash feature/super-user-groupe
git commit -m "feat: super-user-groupe system (Phase 0-1)"

git push origin main
```

#### Step 17: Deploy to Production
```bash
# Production deployment (automated or manual)

# Check: Feature flag is DISABLED
grep FEATURE_SUPER_USER_APPROVAL /path/to/spofe/cascade/.env
# Should show: FEATURE_SUPER_USER_APPROVAL=false

# Run migration
cd cascade
npm run migrate:up
# Verify no errors

# Restart services
pm2 restart spofe-backend
pm2 restart spofe-frontend

# Monitor
pm2 logs spofe-backend
# Watch for errors in first 5 minutes
```

#### Step 18: Production Validation (30 min)
```bash
# Test production URL
curl https://spofe.com/api/auth/check-email/test@test.com
# Should respond

# Test in browser
# Visit: https://spofe.com/register
# Test registration (if feature enabled)
# Or test that /register redirects to /login if feature disabled

# Check logs
tail -f /path/to/spofe/logs/error.log
# Should be clean, no errors

# Monitor metrics
# - Server load
# - Database performance
# - Error rates
# All normal ✅
```

### Phase 7: Feature Activation (Optional - Do Later)

```bash
# Once confident in production:

# Update environment variable
# File: cascade/.env on production server
FEATURE_SUPER_USER_APPROVAL=true

# Restart backend
pm2 restart spofe-backend

# NOW users can register and get approval workflow
```

---

## Rollback Procedures

### If Something Breaks During Integration

```bash
# Stop changes immediately
# Don't push to main

# Option 1: Discard changes
git checkout -- cascade/src/models/index.js
git checkout -- cascade/src/app.js
git checkout -- cascade/.env
git checkout -- frontend/src/router.jsx

# Option 2: Reset to before migration
cd cascade
npm run migrate:down

# Option 3: Completely reset
rm cascade/src/models/GroupeSuperUser.js
rm cascade/src/models/PendingApproval.js
rm cascade/src/migrations/001-groupe-super-users.js
# etc (remove all 14 files)

# Restart
npm run dev

# Back to original state ✅
```

### If Something Breaks in Production

```bash
# EMERGENCY ROLLBACK

# 1. Disable feature flag
Edit: cascade/.env
Change: FEATURE_SUPER_USER_APPROVAL=true → false

# 2. Restart backend
pm2 restart spofe-backend

# 3. Rollback code (if needed)
git revert <commit-hash>
git push origin main
# Pipeline automatically deploys rollback

# 4. Monitor
pm2 logs spofe-backend

# Time to rollback: ~5 minutes
# User impact: None (feature was just disabled)
```

### Complete Database Rollback

```bash
# If migration causes issues:

cd cascade

# Down (rollback)
npm run migrate:down

# Verify tables removed
mysql -u root spofe -e "SHOW TABLES;"
# Should NOT show: groupe_super_users, pending_approvals

# All data preserved in users, groupes_entreprises, etc. ✅
```

---

## Environment Configuration

### Development (.env.local or .env)
```env
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=spofe
JWT_SECRET=dev_secret_key_change_in_production
REDIS_URL=redis://localhost:6379

# NEW - Feature Flags
FEATURE_SUPER_USER_APPROVAL=false
FEATURE_AUTO_REGISTRATION=true
FEATURE_GROUP_DASHBOARD=false
FRONTEND_URL=http://localhost:5173
```

### Staging (.env.staging)
```env
NODE_ENV=staging
DB_HOST=staging-db.internal
DB_USER=spofe_user
DB_PASSWORD=${DB_PASSWORD_STAGING}
DB_NAME=spofe_staging
JWT_SECRET=${JWT_SECRET_STAGING}
REDIS_URL=redis://staging-cache:6379

# NEW - Feature Flags (Testing enabled)
FEATURE_SUPER_USER_APPROVAL=true
FEATURE_AUTO_REGISTRATION=true
FEATURE_GROUP_DASHBOARD=false
FRONTEND_URL=http://staging.spofe.com
MAIL_SERVICE=sendgrid
SENDGRID_API_KEY=${SENDGRID_API_KEY}
```

### Production (.env.production)
```env
NODE_ENV=production
DB_HOST=prod-db.internal
DB_USER=spofe_prod
DB_PASSWORD=${DB_PASSWORD_PROD}
DB_NAME=spofe
JWT_SECRET=${JWT_SECRET_PROD}
REDIS_URL=redis://prod-cache:6379

# NEW - Feature Flags (Keep disabled until needed)
FEATURE_SUPER_USER_APPROVAL=false  # ← Enable when ready
FEATURE_AUTO_REGISTRATION=true
FEATURE_GROUP_DASHBOARD=false
FRONTEND_URL=https://spofe.com
MAIL_SERVICE=sendgrid
SENDGRID_API_KEY=${SENDGRID_API_KEY}
LOG_LEVEL=info
```

---

## Monitoring & Observability

### Metrics to Watch

**After Deployment**:
```
├─ Server CPU: <50%
├─ Server Memory: <70%
├─ Database Connections: <50% of max
├─ Redis Memory: <50% of max
├─ Error Rate: <0.1%
├─ Response Time: <500ms (95th percentile)
└─ Database Query Time: <100ms (95th percentile)
```

### Logs to Monitor

```bash
# Backend errors
tail -f cascade/logs/error.log

# Slow queries
tail -f cascade/logs/slow-query.log

# Security events
tail -f cascade/logs/security.log

# General logs
tail -f cascade/logs/combined.log
```

### Key Events to Watch For

```
✅ Good signs:
├─ Registration requests successful (200)
├─ Email checks working (200)
├─ Approval endpoints responding (200)
├─ No migration errors
└─ Database size stable

❌ Bad signs:
├─ 500 errors in logs
├─ "Model not found" errors
├─ Migration stuck
├─ Database connection errors
├─ Unexpected spikes in errors
```

---

## Success Criteria

After deployment, verify:

- [ ] `/register` route loads (if feature enabled)
- [ ] Email validation works in real-time
- [ ] User registration successful
- [ ] User can login with new account
- [ ] Database tables exist
- [ ] No errors in logs
- [ ] Performance metrics normal
- [ ] Feature flag toggles work
- [ ] Approval endpoints accessible (if enabled)

---

## Troubleshooting During Deployment

### "Migration failed"
```bash
# Check what went wrong
npm run migrate:status

# Check database connectivity
mysql -u root -p spofe -e "SELECT 1;"

# If migration stuck midway:
# Manually clean up in database:
DELETE FROM sequelizemeta WHERE name='001-groupe-super-users.js';
npm run migrate:up
```

### "Routes returning 404"
```bash
# Verify routes registered
grep "groupeApprovals\|authRegistration" cascade/src/app.js

# Restart backend
npm run dev

# Test endpoint
curl http://localhost:3001/api/auth/check-email/test@test.com
```

### "Models not found"
```bash
# Verify imports in models/index.js
grep "GroupeSuperUser\|PendingApproval" cascade/src/models/index.js

# Verify exports
grep -A 5 "module.exports" cascade/src/models/index.js

# Restart backend
npm run dev
```

### "Feature flag not working"
```bash
# Check environment variable
grep FEATURE_SUPER_USER cascade/.env

# Verify it's loaded in app
grep featureFlags cascade/src/app.js

# Restart backend (must restart to read new .env values)
npm run dev
```

---

## Post-Deployment Tasks

### Day 1 (Immediately After)
- [ ] Monitor error logs
- [ ] Test all critical paths
- [ ] Verify no user complaints
- [ ] Check performance metrics

### Day 2-3 (First Few Days)
- [ ] Monitor for issues
- [ ] Gather user feedback
- [ ] Check database growth
- [ ] Verify backups running

### Week 1 (First Week)
- [ ] Analyze usage metrics
- [ ] Identify bottlenecks
- [ ] Plan Phase 2 timeline
- [ ] Document lessons learned

### Phase 2 (Next 2-3 Days)
- [ ] Build admin dashboard pages
- [ ] Write unit tests
- [ ] Plan approvals workflow testing

---

## Support & Communication

### During Deployment
```
Team members available: 
├─ Backend dev (handles integration)
├─ Frontend dev (handles routing)
├─ QA tester (handles testing)
├─ DevOps/Tech lead (handles deployment)
└─ Team lead (coordinates)
```

### Rollback Decision
```
Rollback if ANY of:
├─ 500 errors appearing
├─ Migration failed
├─ Database corruption detected
├─ Major regression found
└─ Business decision
```

### Communication Channels
```
├─ During integration: Slack #development
├─ Issues found: Escalate to tech lead
├─ After deployment: Post status in #announcements
└─ Users notified: Per your comms plan
```

---

## Next Steps After Successful Deployment

1. **Document Lessons Learned**
   - What went well?
   - What took longer than expected?
   - What to improve next time?

2. **Plan Phase 2**
   - Admin approval dashboard (2-3 days)
   - Super user management page (1-2 days)
   - Estimated total: 3-5 days

3. **Gather User Feedback**
   - Usability of /register page
   - Approval workflow (if enabled)
   - Feature requests

4. **Plan Gradual Rollout**
   - When to enable FEATURE_SUPER_USER_APPROVAL?
   - Which groups pilot first?
   - When full rollout?

---

## Contacts & Escalation

```
Issue Type              │ Contact
───────────────────────┼──────────────────
Integration errors     │ Backend Developer
Frontend routing       │ Frontend Developer
Database issues        │ DBA / Tech Lead
Deployment issues      │ DevOps / Tech Lead
User-facing issues     │ Product Manager
Urgent/Critical        │ Engineering Manager
```

---

*Deployment Instructions*  
*SPOFE Super Utilisateur par Groupe*  
*Version: 1.0 | January 24, 2026*

✅ **Ready to deploy!**

Next: Assign tasks to team and follow Phase 1 Integration (45 min)
