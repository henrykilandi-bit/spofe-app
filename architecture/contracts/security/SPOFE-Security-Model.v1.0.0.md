# 🧊 SPOFE Security Model v1.0.0

**Version**: 1.0.0  
**Statut**: 🧊 GELÉ – CONTRACTUEL – NON RÉTRO-CASSABLE  
**Date de gel**: 30 janvier 2026  
**Portée**: SPOFE complet (Frontend + Backend)

---

## 🎯 Signification du Gel

Le modèle de sécurité SPOFE v1.0.0 est **normatif et non négociable**.

À partir de maintenant:

❌ **Aucun RBAC implicite**  
❌ **Aucune décision côté frontend**  
❌ **Aucune autorisation via auth**  
❌ **Aucun court-circuit de Guardian**  
✅ **Ce modèle ne se rediscute plus dans chaque PR**

> **La CI devient l'arbitre sécurité.**

---

## 📜 Principe Fondamental

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   L'authentification identifie.                 │
│   Guardian décide.                              │
│                                                 │
│   Identité ≠ Autorité                          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Règle d'Or

**Séparation stricte entre identité technique et autorité métier**

- ✅ Auth fournit une identité minimale
- ❌ Auth ne donne AUCUN droit
- 🧠 Guardian est l'unique source d'autorité

---

## 🏗️ Architecture de Sécurité

### Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                            │
│                                                          │
│  ┌──────────────┐         ┌─────────────────┐          │
│  │  core/auth   │────────▶│      FCE        │          │
│  │  (Identity)  │         │  (Transport)    │          │
│  └──────────────┘         └─────────────────┘          │
│         │                          │                    │
│         │ Token opaque             │ Commands           │
│         │                          │ + Token            │
└─────────┼──────────────────────────┼────────────────────┘
          │                          │
          │                          ▼
┌─────────┼──────────────────────────────────────────────┐
│         │                BACKEND                       │
│         │                                              │
│         ▼                                              │
│  ┌──────────────┐         ┌─────────────────┐         │
│  │ Auth         │────────▶│    Guardian     │         │
│  │ Middleware   │ Identity│  (Authority)    │         │
│  │ (Technical)  │         │  (Business)     │         │
│  └──────────────┘         └─────────────────┘         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Composants Clés

| Composant | Rôle | Responsabilité | Interdit |
|-----------|------|----------------|----------|
| **core/auth** | Identité frontend | Stocker token, fournir isAuthenticated | Décider, parser token, filtrer |
| **FCE** | Transport | Injecter token, mapper erreurs | Valider, autoriser, décider |
| **Auth Middleware** | Validation technique | Vérifier signature/expiration | Autoriser, bloquer commands |
| **Guardian** | Autorité métier | Décider toutes les actions | Rien - il est souverain |

---

## 🔐 Contrats Référencés

Ce Security Model unifie et référence:

### 1️⃣ Auth Contract
📄 `contracts/infrastructure/SPOFE-Auth-Contract.v1.md`

**Définit**:
- Séparation identité/autorité
- Architecture frontend/core/auth
- Architecture backend auth middleware
- Flow login/logout
- Règles d'injection token
- Interdictions absolues

### 2️⃣ API Backend Contract
📄 `contracts/backend/SPOFE-API.v1.0.0.md`

**Définit**:
- Endpoints gelés
- Codes HTTP (401 vs 403/409)
- Payloads standards
- Règles d'immutabilité
- Versioning strategy

### 3️⃣ Frontend Contract Enforcer
📄 `frontend/core/spofe-contract/README.md`

**Définit**:
- API publique FCE
- Mapping erreurs (AUTH_ERROR, GUARDIAN_ERROR, SYSTEM_ERROR)
- Injection auth
- Règles d'immutabilité
- Tests obligatoires

### 4️⃣ Frontend Module Contract
📄 `architecture/workflows/WORKFLOW_CREATION_MODULE_FRONTEND.md`

**Définit**:
- Structure modules SPOFE-clean
- Interdiction auth dans modules
- Utilisation obligatoire FCE
- Manifest module

---

## 🔒 Règles de Sécurité (STRICT)

### Frontend

#### ✅ Autorisé

1. Stocker token (opaque)
2. Injecter token dans headers
3. Afficher erreurs Guardian
4. Rediriger sur 401

#### ❌ Interdit

1. Parser le token
2. Interpréter des rôles
3. Vérifier des permissions
4. Filtrer des données selon rôle
5. Masquer des actions selon autorité
6. Prendre des décisions métier

### Backend

#### ✅ Autorisé

1. Valider signature token
2. Vérifier expiration
3. Extraire identité minimale
4. Injecter identité dans contexte Guardian

#### ❌ Interdit

1. Autoriser avant Guardian
2. Bloquer command selon rôle
3. Filtrer read-model selon permission
4. Décider métier dans middleware
5. Court-circuiter Guardian

---

## 🎯 Flow de Sécurité

### Cas 1: Command avec Token Valide

```
1. Frontend: sendCommand('CloseAggregate', payload)
2. FCE: Injecte token depuis core/auth
3. Backend Auth Middleware: Valide signature/expiration
4. Backend Auth Middleware: Injecte identity dans context
5. Guardian: Reçoit command + identity
6. Guardian: DÉCIDE (autorise ou refuse)
7. Backend: Retourne 200 ou 403/409
8. FCE: Mappe en GUARDIAN_ERROR si refus
9. Frontend: Affiche erreur
```

### Cas 2: Command avec Token Invalide

```
1. Frontend: sendCommand('CloseAggregate', payload)
2. FCE: Injecte token depuis core/auth
3. Backend Auth Middleware: Détecte token invalide
4. Backend Auth Middleware: Retourne 401
5. FCE: Mappe en AUTH_ERROR
6. Frontend: Redirect to login
```

### Cas 3: Command sans Token

```
1. Frontend: sendCommand('PublicCommand', payload)
2. FCE: Pas de token à injecter
3. Backend Auth Middleware: Pas de token → OK
4. Guardian: Reçoit command sans identity
5. Guardian: DÉCIDE (peut autoriser ou refuser)
6. Backend: Retourne 200 ou 403
```

---

## 🧪 Enforcement CI/CD

### Checks Bloquants

#### 1. Auth Contract Checks

```bash
node ci/check-auth-contract-exists.js
node ci/check-frontend-auth-authority.js
node ci/check-auth-not-in-modules.js
node ci/check-backend-auth-guardian.js
```

**Bloque si**:
- Contrat Auth absent
- Logique d'autorité frontend détectée
- Auth dans modules frontend
- Bypass Guardian backend

#### 2. API Contract Checks

```bash
node ci/check-api-breaking-changes.js
node ci/check-openapi-alignment.js
```

**Bloque si**:
- Breaking change non versionné
- Divergence OpenAPI ↔ contrat

#### 3. FCE Contract Checks

```bash
npm run test:fce
npm run test:fce:snapshot
```

**Bloque si**:
- Mapping erreur modifié
- Comportement FCE changé
- Snapshot divergent

#### 4. E2E Security Tests

```bash
npm run test:e2e:auth-not-authority
```

**Bloque si**:
- Auth = autorité
- Frontend décide
- Backend bypass Guardian

### GitHub Actions Workflow

📄 `.github/workflows/spofe-security-enforcement.yml`

Exécute tous les checks sur chaque PR.

---

## 📊 Codes HTTP Contractuels

### 401 - Authentication Error (TECHNICAL)

**Signification**: Problème d'identité technique

**Émis par**: Auth Middleware

**Cas**:
- Token absent (quand requis)
- Token invalide (signature)
- Token expiré

**Frontend reaction**: Redirect to login

**Mapping FCE**: `AUTH_ERROR`

### 403 - Forbidden (GUARDIAN DECISION)

**Signification**: Refus métier

**Émis par**: Guardian

**Cas**:
- Invariant violation
- Business rule refusal
- Insufficient authority (business)

**Frontend reaction**: Display error

**Mapping FCE**: `GUARDIAN_ERROR`

### 404 - Not Found (BUSINESS CONTEXT)

**Signification**: Ressource non trouvée (métier)

**Émis par**: Guardian

**Cas**:
- Aggregate inexistant
- Resource not accessible (business)

**Frontend reaction**: Display "not found"

**Mapping FCE**: `GUARDIAN_ERROR`

### 409 - Conflict (INVARIANT VIOLATION)

**Signification**: Violation d'invariant

**Émis par**: Guardian

**Cas**:
- Duplicate entry
- State conflict
- Business constraint violation

**Frontend reaction**: Display conflict error

**Mapping FCE**: `GUARDIAN_ERROR`

### 500+ - System Error

**Signification**: Erreur infrastructure

**Émis par**: Infrastructure

**Cas**:
- Database failure
- Network error
- Unexpected exception

**Frontend reaction**: Generic error page

**Mapping FCE**: `SYSTEM_ERROR`

---

## 🚫 Interdictions Absolues

### Frontend

❌ `if (user.role === 'admin')`  
❌ `if (hasPermission('CLOSE_AGGREGATE'))`  
❌ `if (jwt.roles.includes(...))`  
❌ Masquer une action selon un rôle  
❌ Parser le token  
❌ Importer `core/auth` dans un module  
❌ Utiliser `fetch` ou `axios` directement  
❌ Filtrer des données selon autorité  

### Backend

❌ `if (!identity) throw Forbidden`  
❌ `if (identity.role !== 'admin')`  
❌ `authorize(command)`  
❌ `checkPermission(...)`  
❌ Bloquer une Command avant Guardian  
❌ Filtrer un read-model dans middleware auth  
❌ Décoder le token pour décider  
❌ Implémenter RBAC hors Guardian  

---

## 🏁 Garanties du Système

Avec ce Security Model gelé, SPOFE garantit:

✅ **Impossible** d'introduire du RBAC frontend  
✅ **Impossible** de décider côté auth  
✅ **Impossible** de contourner Guardian  
✅ **Impossible** de transformer auth en module métier  
✅ **Séparation identité/autorité garantie par CI**  
✅ **Auditabilité complète** du modèle de sécurité  
✅ **Prévisibilité** des comportements  
✅ **Testabilité** E2E du modèle  

---

## 🔄 Versioning

### Version actuelle: v1.0.0

Toute évolution du modèle de sécurité nécessite:

1. Nouvelle version majeure (v2.0.0)
2. Validation architecture
3. Mise à jour de TOUS les contrats référencés
4. Migration path documentée
5. Tests E2E mis à jour
6. CI mise à jour

### Backward Compatibility

Le Security Model v1.0.0 reste **immuable**.

Aucune rétro-compatibilité n'est garantie avec v2.0.0.

---

## 📚 Références Complètes

### Contrats

- **Auth Contract**: `contracts/infrastructure/SPOFE-Auth-Contract.v1.md`
- **API Backend**: `contracts/backend/SPOFE-API.v1.0.0.md`
- **FCE**: `frontend/core/spofe-contract/README.md`
- **Frontend Module**: `architecture/workflows/WORKFLOW_CREATION_MODULE_FRONTEND.md`

### Code

- **Frontend Auth**: `frontend/core/auth/`
- **Backend Auth**: `cascade/infrastructure/auth/`
- **FCE**: `frontend/core/spofe-contract/`
- **Guardian**: `cascade/domain/guardian/`

### CI/CD

- **Auth Checks**: `ci/check-auth-*.js`
- **API Checks**: `ci/check-api-*.js`
- **FCE Tests**: `frontend/core/spofe-contract/__tests__/`
- **E2E Tests**: `cascade/tests/e2e/auth-not-authority.spec.ts`
- **Workflows**: `.github/workflows/spofe-security-enforcement.yml`

---

## 🔒 Règle Finale SPOFE

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   Se connecter n'accorde aucun droit.          │
│   Se déconnecter retire une identité.          │
│   Guardian décide.                              │
│                                                 │
│   Auth identifie. Guardian décide.              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

**© 2026 SPOFE Team**  
**Security Model v1.0.0 - GELÉ - NORMATIF - NON RÉTRO-CASSABLE**
