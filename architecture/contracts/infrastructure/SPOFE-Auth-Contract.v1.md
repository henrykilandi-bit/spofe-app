# 📘 SPOFE Auth Contract v1.0.0

**Version**: 1.0.0  
**Statut**: OFFICIEL – NORMATIF  
**Date**: 30 janvier 2026  
**Portée**: Frontend + Backend SPOFE

---

## 🎯 Principe Fondamental

> **L'authentification identifie. Guardian décide.**

L'authentification dans SPOFE est **strictement technique** et **non autoritaire**.

### Règle d'Or

**Identité ≠ Autorité**

- ✅ Auth fournit une identité technique
- ❌ Auth ne donne AUCUN droit
- 🧠 Guardian est l'unique autorité métier

---

## 1️⃣ Responsabilités de l'Authentification

### ✅ Ce que l'Auth FAIT

1. **Valider techniquement** un token (signature, expiration)
2. **Extraire une identité minimale** (subject, issuer, issuedAt)
3. **Injecter l'identité** dans le contexte d'exécution
4. **Transporter l'identité** du frontend au backend

### ❌ Ce que l'Auth NE FAIT JAMAIS

1. ❌ Autoriser ou refuser une action métier
2. ❌ Interpréter des rôles ou permissions
3. ❌ Filtrer des données métier
4. ❌ Bloquer une Command avant Guardian
5. ❌ Prendre des décisions métier

---

## 2️⃣ Architecture Frontend

### Structure Canonique

```
frontend/core/auth/
├─ auth.types.ts          # Types minimaux (IdentityToken, AuthState)
├─ auth.context.ts        # React context
├─ auth.provider.tsx      # Provider React
├─ token.store.ts         # Stockage technique
├─ auth.bootstrap.ts      # Bootstrap infrastructure
└─ index.ts               # Point d'entrée public
```

### Identité Minimale

```typescript
export type IdentityToken = string;

export interface AuthState {
  token: IdentityToken | null;
  isAuthenticated: boolean;
}
```

**Interdit dans les types**:
- ❌ `roles`
- ❌ `permissions`
- ❌ `scopes`
- ❌ Toute donnée métier

### Règles Frontend

1. **Token opaque** - Jamais parsé, jamais interprété
2. **isAuthenticated** - Purement technique (présence token)
3. **Aucune logique d'autorité** - Pas de `if (user.role === ...)`
4. **Isolation stricte** - Auth vit dans `core/auth` uniquement
5. **Modules ignorent l'auth** - Aucun import de `core/auth` dans modules

---

## 3️⃣ Architecture Backend

### Structure Canonique

```
cascade/infrastructure/auth/
├─ auth.middleware.ts     # Middleware Fastify
├─ token.verify.ts        # Validation technique token
└─ guardian.context.ts    # Interface auth → Guardian
```

### Identité Backend

```typescript
export interface AuthIdentity {
  subject: string;
  issuer: string;
  issuedAt: Date;
}
```

### Guardian Context

```typescript
export interface GuardianContext {
  identity?: AuthIdentity;
}
```

**Optionnel par design** - Guardian DOIT fonctionner sans identité.

### Règles Backend

1. **Middleware technique** - Valide signature et expiration uniquement
2. **401 = technique** - Token invalide/expiré
3. **403/409 = métier** - Décision Guardian
4. **Aucun bypass Guardian** - Jamais de `if (!identity) throw Forbidden`
5. **Identité minimale** - Pas de rôles, pas de permissions

---

## 4️⃣ Frontend Contract Enforcer (FCE)

### Injection du Token

```typescript
import { loadToken } from '../auth';

export async function sendCommand(commandName: string, payload: unknown) {
  const token = loadToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // ... fetch
}
```

### Mapping Erreurs

```typescript
export type FceErrorType =
  | 'AUTH_ERROR'        // 401 - Identité invalide
  | 'GUARDIAN_ERROR'    // 403/404/409 - Décision métier
  | 'SYSTEM_ERROR';     // 500+ - Infrastructure
```

**Règles strictes**:
- 401 → `AUTH_ERROR` → Redirect login
- 403/409 → `GUARDIAN_ERROR` → Afficher erreur
- 500+ → `SYSTEM_ERROR` → Page erreur générique

---

## 5️⃣ Flow Login / Logout

### Login

1. Utilisateur fournit credentials
2. Auth Provider (IdP) valide et émet token
3. Frontend stocke token (technique)
4. `isAuthenticated = true`
5. ❌ **AUCUNE autorisation implicite**

### Logout

1. Frontend supprime token
2. `isAuthenticated = false`
3. Redirection login (technique)
4. ❌ **Aucun appel backend requis**

### Cas Normaux

| Situation | Conforme SPOFE |
|-----------|----------------|
| Utilisateur connecté mais action refusée | ✅ |
| Même UI pour tous les utilisateurs | ✅ |
| Décision "surprenante" côté backend | ✅ |
| Frontend affiche erreur Guardian | ✅ |

---

## 6️⃣ Alignement OpenAPI

### Convention Obligatoire

Chaque endpoint DOIT documenter:

```yaml
responses:
  '200':
    description: Success
  '401':
    description: Authentication failed (technical)
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/AuthError'
  '403':
    description: Command refused by Guardian (business)
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/GuardianError'
  '409':
    description: Invariant violation (business)
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/GuardianError'
```

### Schémas Distincts

**AuthError** (401):
```yaml
type: object
properties:
  type:
    type: string
    example: AUTHENTICATION_ERROR
  message:
    type: string
    example: Invalid or expired token
```

**GuardianError** (403/409):
```yaml
type: object
properties:
  type:
    type: string
    example: INVARIANT_VIOLATION
  message:
    type: string
    example: Aggregate is already closed
```

---

## 7️⃣ Checks CI Bloquants

### 1. Présence du Contrat

```bash
node ci/check-auth-contract-exists.js
```

Vérifie que ce contrat existe et est versionné.

### 2. Frontend Sans Autorité

```bash
node ci/check-frontend-auth-authority.js
```

Détecte:
- `role ===`
- `roles.includes`
- `hasPermission`
- `isAuthorized`
- `can(`
- `.permissions`

### 3. Auth Isolée

```bash
node ci/check-auth-not-in-modules.js
```

Vérifie que `frontend/modules/*` ne contient aucune logique auth.

### 4. Backend Sans Bypass

```bash
node ci/check-backend-auth-guardian.js
```

Détecte:
- `checkPermission`
- `authorize(`
- `.isAdmin`
- `hasRole`

---

## 8️⃣ Tests E2E Obligatoires

### Test 1: Auth ≠ Autorité

```typescript
test('authenticated user can be refused by Guardian', async () => {
  const res = await api
    .post('/commands/CloseAggregate')
    .set('Authorization', 'Bearer VALID_TOKEN')
    .send({ aggregateId: 'closed-id' });

  expect(res.status).toBe(409); // Guardian refuse
});
```

### Test 2: 401 vs Guardian

```typescript
test('401 is technical, 409 is business', async () => {
  // Invalid token → 401
  const invalidToken = await api
    .post('/commands/CreateAggregate')
    .set('Authorization', 'Bearer INVALID');
  expect(invalidToken.status).toBe(401);

  // Valid token, business refusal → 409
  const validToken = await api
    .post('/commands/CloseAggregate')
    .set('Authorization', 'Bearer VALID')
    .send({ aggregateId: 'closed-id' });
  expect(validToken.status).toBe(409);
});
```

### Test 3: Guardian Sans Identité

```typescript
test('Guardian works without identity', async () => {
  const res = await api
    .post('/commands/PublicCommand')
    .send({ data: 'test' });

  expect([200, 403, 409]).toContain(res.status);
});
```

---

## 9️⃣ Interdictions Absolues

### Frontend

❌ `if (user.role === 'admin')`  
❌ `if (hasPermission('CLOSE_AGGREGATE'))`  
❌ `if (jwt.roles.includes(...))`  
❌ Masquer une action selon un rôle  
❌ Parser le token  
❌ Importer `core/auth` dans un module  

### Backend

❌ `if (!identity) throw Forbidden`  
❌ `if (identity.role !== 'admin')`  
❌ `authorize(command)`  
❌ `checkPermission(...)`  
❌ Bloquer une Command avant Guardian  
❌ Filtrer un read-model dans le middleware auth  

---

## 🔟 Garanties du Système

Avec ce contrat et les checks CI:

✅ **Impossible** d'introduire du RBAC frontend  
✅ **Impossible** de décider côté auth  
✅ **Impossible** de contourner Guardian  
✅ **Impossible** de transformer auth en module métier  
✅ **Séparation identité/autorité garantie**  

---

## 🔒 Règle Finale SPOFE

```
Se connecter n'accorde aucun droit.
Se déconnecter retire une identité.
Guardian décide.
```

---

## 📚 Références

- **Frontend Auth**: `frontend/core/auth/`
- **Backend Auth**: `cascade/infrastructure/auth/`
- **FCE**: `frontend/core/spofe-contract/`
- **CI Checks**: `ci/check-auth-*.js`
- **Tests E2E**: `cascade/tests/e2e/auth-not-authority.spec.ts`
- **GitHub Workflow**: `.github/workflows/spofe-auth-contract.yml`

---

**© 2026 SPOFE Team**  
**Auth identifie. Guardian décide.**
