# 🔌 INTÉGRATION BACKEND - ENDPOINTS 2FA

**Date**: 23 janvier 2026  
**Version**: 2.1.0  
**Frontend Ready**: ✅  
**Backend Integration**: Prêt à implémenter

---

## 📋 Endpoints Requis

### 1️⃣ POST /auth/login (Modifié)

**Request**:
```json
{
  "email": "admin@spofe.com",
  "password": "demo123"
}
```

**Response (2FA Required)**:
```json
{
  "success": true,
  "data": {
    "token": "tempToken_xyz...",
    "user": {
      "id": 1,
      "email": "admin@spofe.com",
      "name": "Admin User",
      "role": "admin",
      "phoneNumber": "+33 6 12 34 56 78"
    },
    "requiresTwoFA": true
  },
  "message": "2FA required - please verify"
}
```

**Response (2FA Disabled)**:
```json
{
  "success": true,
  "data": {
    "token": "jwtToken_abc...",
    "user": { ... },
    "requiresTwoFA": false
  },
  "message": "Login successful"
}
```

**Frontend Handling**:
```javascript
if (response.data.data.requiresTwoFA && response.data.data.token) {
  // Redirection vers /two-factor-auth avec tempToken
  navigate('/two-factor-auth', {
    state: {
      tempToken: response.data.data.token,
      email: email,
      phoneNumber: response.data.data.user?.phoneNumber
    },
    replace: true
  });
} else if (response.data.data.token && response.data.data.user) {
  // Login direct sans 2FA
  setToken(response.data.data.token);
  setUserData(response.data.data.user);
  navigate('/dashboard');
}
```

---

### 2️⃣ POST /auth/verify-2fa (Nouveau)

**Description**: Vérifier le code 2FA et retourner le JWT final

**Request**:
```json
{
  "token": "tempToken_xyz...",
  "code": "12345",
  "method": "authenticator"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "token": "jwtToken_final...",
    "user": {
      "id": 1,
      "email": "admin@spofe.com",
      "name": "Admin User",
      "role": "admin"
    }
  },
  "message": "2FA verification successful"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "message": "Code incorrect ou expiré",
  "error": "INVALID_2FA_CODE",
  "statusCode": 401
}
```

**Frontend Integration**:
```javascript
const response = await apiClient.post('/auth/verify-2fa', {
  token: tempToken,
  code: verificationCode.join(''),
  method: verificationMethod
});

if (response.data?.data?.token && response.data?.data?.user) {
  const { token, user } = response.data.data;
  setToken(token);        // AuthContext
  setUserData(user);      // AuthContext
  navigate('/dashboard');
}
```

---

### 3️⃣ POST /auth/send-sms-code (Nouveau)

**Description**: Envoyer un code 2FA par SMS

**Request**:
```json
{
  "token": "tempToken_xyz...",
  "phone": "+33 6 12 34 56 78",
  "email": "admin@spofe.com"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Code SMS envoyé",
  "data": {
    "expiresIn": 600,
    "method": "sms"
  }
}
```

**Frontend Integration**:
```javascript
const response = await apiClient.post('/auth/send-sms-code', {
  token: tempToken,
  phone: phoneNumber,
  email: email
});

if (response.data.success) {
  setSuccess('Code envoyé par SMS');
  setResendCountdown(30);
}
```

---

### 4️⃣ POST /auth/send-email-code (Nouveau)

**Description**: Envoyer un code 2FA par Email

**Request**:
```json
{
  "token": "tempToken_xyz...",
  "email": "admin@spofe.com",
  "phone": "+33 6 12 34 56 78"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Code email envoyé",
  "data": {
    "expiresIn": 600,
    "method": "email"
  }
}
```

**Frontend Integration**:
```javascript
const response = await apiClient.post('/auth/send-email-code', {
  token: tempToken,
  phone: phoneNumber,
  email: email
});

if (response.data.success) {
  setSuccess('Code envoyé par email');
  setResendCountdown(30);
}
```

---

## 🔐 Architecture de Sécurité 2FA

### Token Temporaire vs JWT Final

```
┌─────────────────────────────────────┐
│ User submits email/password         │
└──────────────┬──────────────────────┘
               │
        ✅ Credentials valides
               │
               ▼
┌──────────────────────────────────────┐
│ Backend génère tempToken             │
│ - Valide 10 minutes                  │
│ - Contient userId + email            │
│ - JWT sign avec expiration           │
│ - Retourné au frontend               │
└──────────────┬───────────────────────┘
               │
     User saisit code 2FA
               │
               ▼
┌──────────────────────────────────────┐
│ Frontend envoie verify-2fa avec:     │
│ - tempToken (validation)             │
│ - code (vérification)                │
│ - method (authenticator/sms/email)   │
└──────────────┬───────────────────────┘
               │
        ✅ Code valide + tempToken OK
               │
               ▼
┌──────────────────────────────────────┐
│ Backend génère JWT final             │
│ - Valide 7 jours (refresh possible)  │
│ - Contient userId + perms + 2FA OK   │
│ - Sécurisé en localStorage/sessionStorage
│ - Retourné au frontend               │
└──────────────┬───────────────────────┘
               │
               ▼
    ✅ Dashboard (route protégée)
```

---

## 🗄️ Schema Base de Données Recommandé

### Table: 2FA Tokens
```sql
CREATE TABLE two_fa_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  code VARCHAR(10) NOT NULL,
  method ENUM('authenticator', 'sms', 'email') DEFAULT 'authenticator',
  temp_token VARCHAR(500) NOT NULL UNIQUE,
  is_verified BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_temp_token (temp_token),
  INDEX idx_expires_at (expires_at)
);
```

### Table: 2FA User Settings
```sql
ALTER TABLE users ADD COLUMN (
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_method ENUM('authenticator', 'sms', 'email') DEFAULT 'authenticator',
  two_fa_phone VARCHAR(20),
  authenticator_secret VARCHAR(255),
  backup_codes JSON,
  last_2fa_at TIMESTAMP NULL
);
```

---

## 🔄 Flux de Vérification du Code

### Authenticator (Time-based)
```
Backend:
1. Récupérer authenticator_secret de l'utilisateur
2. Générer code actuel basé sur TOTP (30s window)
3. Comparer avec code soumis
4. Accepter code actuel + précédents (±1 window)
5. Retourner token JWT si OK

Frontend:
- Utilisateur ouvre son app (Google/Microsoft Authenticator)
- Entre le code à 6 chiffres
- Code actuel change toutes les 30 secondes
```

### SMS
```
Backend:
1. Générer code aléatoire 5 chiffres
2. Envoyer via Twilio/Nexmo/SMS API
3. Sauvegarder en base avec expiration 10min
4. Comparer code soumis
5. Retourner token JWT si OK

Frontend:
- Changement vers SMS déclenche envoi
- Bouton "Renvoyer" après 30s
- Max 3 tentatives
```

### Email
```
Backend:
1. Générer code aléatoire 5 chiffres
2. Envoyer via SMTP (Sendgrid/AWS SES)
3. Sauvegarder en base avec expiration 10min
4. Comparer code soumis
5. Retourner token JWT si OK

Frontend:
- Changement vers Email déclenche envoi
- Bouton "Renvoyer" après 30s
- Max 3 tentatives
```

---

## ⚠️ Validation Backend Requise

### Sécurité:
```javascript
✅ Vérifier tempToken valide et pas expiré
✅ Vérifier code pas expiré (10 minutes max)
✅ Limiter tentatives (3 max) avant blocage
✅ Loguer toutes tentatives pour audit
✅ Signature JWT pour intégrité
✅ Pas de code en plain text en logs
✅ Rate limiting sur endpoints
✅ HTTPS obligatoire en production
```

### Validation:
```javascript
✅ Code: 5 chiffres exactement
✅ Token: Format JWT valide
✅ Méthode: 'authenticator' | 'sms' | 'email'
✅ Email: Format RFC 5322
✅ Phone: Format E.164
✅ Pas de injection SQL/XSS
```

---

## 🔗 Connexion avec Frontend

### AuthContext (Côté Frontend)
```javascript
const { setToken, setUserData } = useAuthContext();

// Après verify-2fa réussi
setToken(response.data.data.token);        // Stocke JWT
setUserData(response.data.data.user);      // Stocke user info

// AuthContext sauvegarde:
localStorage.setItem('authToken', token);
localStorage.setItem('user', JSON.stringify(user));
```

### PrivateRoute (Côté Frontend)
```javascript
function PrivateRoute({ children }) {
  const { token } = useAuthContext();
  const localToken = localStorage.getItem('authToken');
  
  if (!token && !localToken) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

---

## 📝 Exemple d'Implémentation Backend

### Express Endpoint pour verify-2fa
```javascript
// cascade/src/routes/auth.routes.js
router.post('/verify-2fa', async (req, res, next) => {
  try {
    const { token: tempToken, code, method } = req.body;
    
    // 1. Vérifier tempToken
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET_TEMP);
    const userId = decoded.userId;
    
    // 2. Récupérer le code stocké
    const storedCode = await TwoFACode.findOne({
      where: {
        user_id: userId,
        temp_token: tempToken,
        is_verified: false,
        expires_at: { [Op.gt]: new Date() }
      }
    });
    
    // 3. Vérifier le code
    if (!storedCode || storedCode.code !== code) {
      throw new Error('Code incorrect');
    }
    
    // 4. Vérifier tentatives
    if (storedCode.attempts >= storedCode.max_attempts) {
      throw new Error('Trop de tentatives - accès refusé');
    }
    
    // 5. Marquer comme vérifié
    storedCode.is_verified = true;
    await storedCode.save();
    
    // 6. Récupérer user
    const user = await User.findByPk(userId);
    
    // 7. Générer JWT final
    const finalToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        verified2FA: true 
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 8. Retourner
    return success(res, { token: finalToken, user }, 200);
    
  } catch (error) {
    return error(res, error.message, 401);
  }
});
```

---

## 🧪 Tests E2E (Playwright)

```javascript
// tests/auth-2fa.spec.js
import { test, expect } from '@playwright/test';

test('2FA flow - authenticator', async ({ page }) => {
  // 1. Login
  await page.goto('http://127.0.0.1:5173/login');
  await page.fill('input[type="email"]', 'admin@spofe.com');
  await page.fill('input[type="password"]', 'demo123');
  await page.click('button:has-text("Se connecter")');
  
  // 2. Attendre redirection 2FA
  await expect(page).toHaveURL(/two-factor-auth/);
  
  // 3. Vérifier UI
  await expect(page.locator('text=Vérification en deux étapes')).toBeVisible();
  await expect(page.locator('text=Authenticator')).toHaveClass(/active/);
  
  // 4. Entrer code
  const inputs = await page.locator('.code-input');
  await inputs.nth(0).fill('1');
  await inputs.nth(1).fill('2');
  await inputs.nth(2).fill('3');
  await inputs.nth(3).fill('4');
  await inputs.nth(4).fill('5');
  
  // 5. Attendre vérification
  await page.waitForNavigation();
  
  // 6. Vérifier redirection dashboard
  await expect(page).toHaveURL(/dashboard/);
});
```

---

## ✅ Checklist d'Implémentation Backend

| Élément | Status | Notes |
|---------|--------|-------|
| POST /auth/login (2FA) | ⏳ | Ajouter `requiresTwoFA`, `tempToken` |
| POST /auth/verify-2fa | ⏳ | Nouveau endpoint complet |
| POST /auth/send-sms-code | ⏳ | Nouveau endpoint |
| POST /auth/send-email-code | ⏳ | Nouveau endpoint |
| Table 2FA Codes | ⏳ | Schema SQL |
| Authenticator TOTP | ⏳ | speakeasy ou similar |
| SMS API | ⏳ | Twilio/Nexmo |
| Email SMTP | ⏳ | Sendgrid/AWS SES |
| Rate Limiting | ⏳ | Endpoint protection |
| Logging Audit | ⏳ | 2FA attempts |
| JWT Signatures | ⏳ | Temp vs Final |
| Error Handling | ⏳ | Messages clairs |

---

## 🚀 Prochaines Étapes

1. **Phase 1: Backend Implémentation**
   - Créer endpoints 2FA
   - Ajouter logique TOTP/SMS/Email
   - Tests unitaires

2. **Phase 2: Intégration**
   - Connecter frontend ↔ backend
   - Tests E2E Playwright
   - Gestion des cas d'erreur

3. **Phase 3: Production**
   - Déploiement Docker
   - Configuration HTTPS
   - Monitoring & Alertes

---

**Version**: 2.1.0 | **Date**: 23 Jan 2026 | **Status**: ⏳ EN ATTENTE BACKEND
