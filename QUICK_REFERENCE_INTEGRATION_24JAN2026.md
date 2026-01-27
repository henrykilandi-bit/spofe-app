# ⚡ QUICK REFERENCE - INTÉGRATION DES SERVICES

**Pour devs qui intègrent Solutions 1 & 2**

---

## 1️⃣ TokenManagerService

### Fichier
```
cascade/src/services/token-manager.service.js
```

### Import
```javascript
import tokenManager from '../services/token-manager.service.js';
```

### API

#### Générer tokens (après login réussi)
```javascript
const tokens = await tokenManager.generateTokenPair(user, req.ip, req.headers['user-agent']);
// Returns: { access_token, refresh_token, expires_in, token_type }

res.json({ 
  success: true, 
  data: tokens 
});
```

#### Rafraîchir token expiré
```javascript
const newTokens = await tokenManager.refreshAccessToken(req.body.refresh_token);
// Returns: { access_token, refresh_token, expires_in, token_type }

res.json({ 
  success: true, 
  data: newTokens 
});
```

#### Logout (revoke tokens)
```javascript
await tokenManager.revokeTokens(
  req.token,                      // access token
  req.body.refresh_token,         // refresh token
  req.user.id,                    // user ID
  req.ip                          // IP address
);

res.json({ 
  success: true, 
  message: 'Logged out successfully' 
});
```

#### Middleware de vérification
```javascript
app.use('/api/protected', tokenManager.verifyTokenMiddleware());
// Now req.user, req.token, req.permissions available
```

#### Rapport d'activité
```javascript
const report = await tokenManager.generateTokenActivityReport(userId, 24); // 24 heures
// Returns: { user_id, period, events, summary }
```

### Routes complètes (auth.routes.js)
```javascript
import tokenManager from '../services/token-manager.service.js';

// Login (existant, ajouter la génération de tokens)
router.post('/login', async (req, res) => {
  // ... validation
  // ... user lookup
  const tokens = await tokenManager.generateTokenPair(user, req.ip, req.headers['user-agent']);
  res.json({ success: true, data: tokens });
});

// Nouveau: Refresh endpoint
router.post('/refresh-token', async (req, res) => {
  try {
    const newTokens = await tokenManager.refreshAccessToken(req.body.refresh_token);
    res.json({ success: true, data: newTokens });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
});

// Logout endpoint
router.post('/logout', tokenManager.verifyTokenMiddleware(), async (req, res) => {
  await tokenManager.revokeTokens(req.token, req.body.refresh_token, req.user.id, req.ip);
  res.json({ success: true, message: 'Logged out' });
});
```

---

## 2️⃣ SecurityValidatorEnhanced

### Fichier
```
cascade/src/utils/security-validator-enhanced.js
```

### Import
```javascript
import SecurityValidatorEnhanced from '../utils/security-validator-enhanced.js';
```

### API

#### Option 1: Middleware (recommandé)
```javascript
router.post('/login', 
  SecurityValidatorEnhanced.middleware('login'),
  loginController
);
// req.validatedData = cleaned & validated data
// req.body = replaced with validated data (backward compat)
```

#### Option 2: Direct validation
```javascript
const validated = await SecurityValidatorEnhanced.validate('journalEntry', req.body);
// validated = { description, entry_date, lines: [...] }
```

#### Option 3: Custom options
```javascript
const validated = await SecurityValidatorEnhanced.validate('login', req.body, {
  abortEarly: true  // Stop on first error
});
```

### Schemas disponibles

#### login
```javascript
SecurityValidatorEnhanced.middleware('login')
// Valide: email, password, remember_me (optionnel)
// Sanitise: email → lowercase
```

#### twoFactorCode
```javascript
SecurityValidatorEnhanced.middleware('twoFactorCode')
// Valide: code (6 digits exactement)
```

#### journalEntry
```javascript
SecurityValidatorEnhanced.middleware('journalEntry')
// Valide: description, entry_date, lines
// Custom: montant_debit === montant_credit ± 0.01
// Sanitise: montants arrondis à 2 décimales
```

#### userCreation
```javascript
SecurityValidatorEnhanced.middleware('userCreation')
// Valide: username, email, role_id, compagnie_id
```

#### chartOfAccounts
```javascript
SecurityValidatorEnhanced.middleware('chartOfAccounts')
// Valide: numero_compte, nom_compte, type_compte, actif
```

#### thirdParty
```javascript
SecurityValidatorEnhanced.middleware('thirdParty')
// Valide: name, type, email, phone, address
```

#### reportConfig
```javascript
SecurityValidatorEnhanced.middleware('reportConfig')
// Valide: name, type, start_date, end_date, format
```

### Routes complètes (auth.routes.js)
```javascript
import SecurityValidatorEnhanced from '../utils/security-validator-enhanced.js';

// Middleware usage
router.post('/login', 
  SecurityValidatorEnhanced.middleware('login'),
  async (req, res) => {
    // req.body is now validated & cleaned
    // Email is lowercase, XSS removed, etc.
    const user = await User.findOne({ email: req.body.email });
    // ...
  }
);

// Direct validation
router.post('/journal-entry',
  async (req, res) => {
    try {
      const validated = await SecurityValidatorEnhanced.validate('journalEntry', req.body);
      
      // Now use validated data
      const entry = await JournalEntry.create(validated);
      
      res.json({ success: true, data: entry });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: 'VALIDATION_ERROR',
        details: error.errors 
      });
    }
  }
);
```

---

## 🧪 TESTING EXAMPLES

### Test login + token generation
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spofe.local",
    "password": "Admin@123456"
  }'

# Response should have:
# {
#   "success": true,
#   "data": {
#     "access_token": "eyJ...",
#     "refresh_token": "abc123...",
#     "expires_in": 86400,
#     "token_type": "Bearer"
#   }
# }
```

### Test refresh token
```bash
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "abc123..."}'

# Response: new tokens
```

### Test logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"refresh_token": "abc123..."}'

# Response: { success: true, message: "Logged out" }
```

### Test validation (email sanitization)
```bash
curl -X POST http://localhost:3001/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "  ADMIN@SPOFE.COM  <script>alert(1)</script>",
    "password": "Test@123456"
  }'

# Email will be sanitized to: "admin@spofe.com"
```

### Test validation error
```bash
curl -X POST http://localhost:3001/api/journal-entry \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Test",
    "entry_date": "2026-01-24",
    "lines": [
      {"numero_compte": "512", "montant_debit": 100, "montant_credit": 0},
      {"numero_compte": "411", "montant_debit": 0, "montant_credit": 50}
    ]
  }'

# Response: 400 with validation error (unbalanced: 100 ≠ 50)
```

---

## ⚙️ CONFIGURATION

### Environment Variables (optionnel)
```bash
# In .env
JWT_SECRET=your-secret-key                          # REQUIRED (existing)
JWT_REFRESH_SECRET=your-refresh-secret              # OPTIONAL (defaults to JWT_SECRET)
ACCESS_TOKEN_EXPIRY=24h                             # OPTIONAL (default: 24h)
REFRESH_TOKEN_EXPIRY=7d                             # OPTIONAL (default: 7d)
```

### Defaults
```javascript
// If not set in .env:
accessTokenExpiry: '24h'      // 24 hours
refreshTokenExpiry: '7d'      // 7 days
accessTokenSecret: process.env.JWT_SECRET
refreshTokenSecret: JWT_SECRET + '_refresh'
```

---

## 🐛 COMMON ISSUES & FIXES

### Issue 1: TokenManagerService not found
**Fix:**
```javascript
// Wrong:
import tokenManager from './token-manager.service.js';

// Right:
import tokenManager from '../services/token-manager.service.js';
```

### Issue 2: SecurityValidator schema not found
**Fix:**
```javascript
// Make sure schema name matches exactly:
✅ 'login'           // Correct
✅ 'journalEntry'    // Correct
❌ 'loginSchema'     // Wrong
❌ 'journal_entry'   // Wrong
```

### Issue 3: Redis connection error (non-blocking)
**Fix:**
```javascript
// TokenManagerService gracefully handles Redis failures
// Fallback to InMemoryRedis automatically
// Check logs for warnings, but app keeps working
```

### Issue 4: Validation error on valid data
**Fix:**
```javascript
// Check if schema name is correct
// Check if data matches schema structure
// Use try-catch to see exact error

try {
  const validated = await SecurityValidatorEnhanced.validate('login', data);
} catch (error) {
  console.log(error.errors);  // See detailed error list
}
```

---

## 📝 INTEGRATION CHECKLIST

### Before Integration
- [ ] Read RAPPORT_IMPLEMENTATION_SOLUTIONS_24JAN2026.md
- [ ] Review service code
- [ ] Understand backward compatibility
- [ ] Plan testing approach

### Integration Steps
- [ ] Copy token-manager.service.js to cascade/src/services/
- [ ] Copy security-validator-enhanced.js to cascade/src/utils/
- [ ] Update routes to use new services
- [ ] Update .env if needed (JWT_REFRESH_SECRET optional)
- [ ] Test each endpoint

### Testing Checklist
- [ ] Login works (returns tokens)
- [ ] Refresh token works (returns new tokens)
- [ ] Logout revokes tokens
- [ ] Validation works for login
- [ ] Validation works for journalEntry
- [ ] Sanitization works (email lowercased, XSS removed)
- [ ] Error handling works (400 on validation errors)
- [ ] Backward compatibility (existing auth still works)

### Before Deploying
- [ ] All tests pass ✅
- [ ] Code review done ✅
- [ ] Performance tested ✅
- [ ] Rollback plan ready ✅

---

## 🚀 DEPLOYMENT

### Step 1: Copy files
```bash
cp token-manager.service.js cascade/src/services/
cp security-validator-enhanced.js cascade/src/utils/
```

### Step 2: Integrate into routes
```bash
# Edit cascade/src/routes/auth.routes.js
# Add imports
# Add endpoints
```

### Step 3: Test
```bash
npm run dev
# Run test commands from TESTING EXAMPLES section
```

### Step 4: Deploy
```bash
git add cascade/src/services/token-manager.service.js
git add cascade/src/utils/security-validator-enhanced.js
git add cascade/src/routes/auth.routes.js  # if modified
git commit -m "feat: add TokenManager and SecurityValidator services"
npm run dev
# Monitor 24h
```

### Step 5: Monitor
```bash
# Check logs for errors
# Monitor Redis connections
# Watch for validation failures
# Collect user feedback
```

---

## 📞 QUICK HELP

**Q: Where to import TokenManagerService?**
A: `import tokenManager from '../services/token-manager.service.js';`

**Q: Where to use SecurityValidatorEnhanced?**
A: In routes as middleware or direct validation

**Q: What if Redis is down?**
A: InMemoryRedis fallback handles it automatically

**Q: Can I use both old and new validation?**
A: Yes, they're non-invasive and can coexist

**Q: How to test token expiration?**
A: Change ACCESS_TOKEN_EXPIRY to '10s' temporarily

**Q: How to rollback?**
A: Delete 2 files and restart - app reverts to original state

---

**Quick Reference created:** 2026-01-24  
**For:** Developers integrating Services 1 & 2  
**Time to read:** 5-10 minutes  
**Time to integrate:** 1-2 hours

