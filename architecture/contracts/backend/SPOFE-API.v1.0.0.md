# 🧊 SPOFE Backend API Contract v1.0.0

**Version**: 1.0.0  
**Statut**: 🧊 GELÉ – CONTRACTUEL – NON RÉTRO-CASSABLE  
**Date de gel**: 30 janvier 2026  
**Portée**: Backend SPOFE (Cascade)

---

## 🎯 Signification du Gel

L'API backend SPOFE v1.0.0 est **stable, publique et contractuelle**.

À partir de maintenant:

❌ **Aucun breaking change silencieux**  
❌ **Aucun endpoint implicite**  
❌ **Aucune sémantique ambiguë**  
✅ **Toute évolution = nouvelle version**

> **Ce document fait foi, pas le code.**

---

## 📋 Inventaire des Endpoints

### 🔐 Authentication & Authorization

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/auth/register` | POST | Inscription utilisateur | ❌ |
| `/api/auth/login` | POST | Connexion utilisateur | ❌ |
| `/api/auth/logout` | POST | Déconnexion | ✅ |
| `/api/auth/refresh` | POST | Refresh token | ✅ |
| `/api/auth/verify` | GET | Vérifier token | ✅ |

### 👤 User Management

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/users` | GET | Liste utilisateurs | ✅ |
| `/api/users/:id` | GET | Détail utilisateur | ✅ |
| `/api/users/:id` | PUT | Modifier utilisateur | ✅ |
| `/api/users/:id` | DELETE | Supprimer utilisateur | ✅ |
| `/api/users/:id/roles` | POST | Assigner rôle | ✅ |
| `/api/users/:id/roles/:roleId` | DELETE | Révoquer rôle | ✅ |

### 📊 Chart of Accounts

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/chart-of-accounts` | GET | Liste comptes | ✅ |
| `/api/chart-of-accounts/:id` | GET | Détail compte | ✅ |
| `/api/chart-of-accounts` | POST | Créer compte | ✅ |
| `/api/chart-of-accounts/:id` | PUT | Modifier compte | ✅ |
| `/api/chart-of-accounts/:id` | DELETE | Supprimer compte | ✅ |

### 📝 Journal Entries

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/journal-entries` | GET | Liste écritures | ✅ |
| `/api/journal-entries/:id` | GET | Détail écriture | ✅ |
| `/api/journal-entries` | POST | Créer écriture | ✅ |
| `/api/journal-entries/:id` | PUT | Modifier écriture | ✅ |
| `/api/journal-entries/:id` | DELETE | Supprimer écriture | ✅ |
| `/api/journal-entries/:id/validate` | POST | Valider écriture | ✅ |

### 🏢 Third Parties

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/third-parties` | GET | Liste tiers | ✅ |
| `/api/third-parties/:id` | GET | Détail tiers | ✅ |
| `/api/third-parties` | POST | Créer tiers | ✅ |
| `/api/third-parties/:id` | PUT | Modifier tiers | ✅ |
| `/api/third-parties/:id` | DELETE | Supprimer tiers | ✅ |

### 📈 Reports

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/reports/balance-sheet` | GET | Bilan | ✅ |
| `/api/reports/income-statement` | GET | Compte de résultat | ✅ |
| `/api/reports/trial-balance` | GET | Balance générale | ✅ |
| `/api/reports/general-ledger` | GET | Grand livre | ✅ |
| `/api/reports/subsidiary-ledger` | GET | Balance auxiliaire | ✅ |

### 🔄 Business Operations

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/operations/close-period` | POST | Clôturer période | ✅ |
| `/api/operations/reopen-period` | POST | Réouvrir période | ✅ |
| `/api/operations/validate-batch` | POST | Valider lot | ✅ |

### ✅ Approvals & Workflows

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/approvals` | GET | Liste approbations | ✅ |
| `/api/approvals/:id` | GET | Détail approbation | ✅ |
| `/api/approvals/:id/approve` | POST | Approuver | ✅ |
| `/api/approvals/:id/reject` | POST | Rejeter | ✅ |

### 🏥 Health & Monitoring

| Endpoint | Méthode | Description | Auth Required |
|----------|---------|-------------|---------------|
| `/api/health` | GET | Health check | ❌ |
| `/api/health/detailed` | GET | Health détaillé | ✅ |
| `/api/metrics` | GET | Métriques Prometheus | ❌ |

---

## 🔒 Règles HTTP Contractuelles

### Codes de Statut (STRICT)

#### ✅ 2xx - Success

| Code | Signification | Usage |
|------|---------------|-------|
| 200 | OK | Opération réussie |
| 201 | Created | Ressource créée |
| 204 | No Content | Suppression réussie |

#### 🔐 401 - Authentication Error (TECHNICAL)

**Signification**: Problème d'identité technique

**Cas d'usage**:
- Token absent (quand requis)
- Token invalide (signature)
- Token expiré

**Payload**:
```json
{
  "type": "AUTH_ERROR",
  "message": "Invalid or expired token",
  "code": "TOKEN_INVALID"
}
```

**Frontend reaction**: Redirect to login

#### 🧠 403 - Forbidden (GUARDIAN DECISION)

**Signification**: Décision métier Guardian

**Cas d'usage**:
- Invariant violation
- Business rule refusal
- Insufficient authority (business)

**Payload**:
```json
{
  "type": "GUARDIAN_ERROR",
  "message": "Cannot close already closed period",
  "code": "INVARIANT_VIOLATION",
  "details": {
    "aggregateId": "period-123",
    "currentState": "CLOSED"
  }
}
```

**Frontend reaction**: Display error to user

#### 🔍 404 - Not Found (BUSINESS CONTEXT)

**Signification**: Ressource non trouvée (contexte métier)

**Cas d'usage**:
- Aggregate inexistant
- Resource not accessible (business)

**Payload**:
```json
{
  "type": "GUARDIAN_ERROR",
  "message": "Aggregate not found",
  "code": "AGGREGATE_NOT_FOUND",
  "details": {
    "aggregateId": "acc-999"
  }
}
```

**Frontend reaction**: Display "not found" message

#### ⚠️ 409 - Conflict (INVARIANT VIOLATION)

**Signification**: Violation d'invariant métier

**Cas d'usage**:
- Duplicate entry
- State conflict
- Business constraint violation

**Payload**:
```json
{
  "type": "GUARDIAN_ERROR",
  "message": "Account code already exists",
  "code": "DUPLICATE_ACCOUNT_CODE",
  "details": {
    "accountCode": "411000"
  }
}
```

**Frontend reaction**: Display conflict error

#### 🧱 5xx - System Error

**Signification**: Erreur infrastructure

**Cas d'usage**:
- Database failure
- Network error
- Unexpected exception

**Payload**:
```json
{
  "type": "SYSTEM_ERROR",
  "message": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

**Frontend reaction**: Generic error page

---

## 🔐 Authentication Rules

### Token Format

```
Authorization: Bearer <JWT_TOKEN>
```

### Token Validation (Technical)

Le middleware auth valide:
- ✅ Signature JWT
- ✅ Expiration
- ✅ Format

Le middleware auth NE valide PAS:
- ❌ Permissions
- ❌ Rôles
- ❌ Business rules

### Identity Injection

```typescript
interface AuthIdentity {
  subject: string;
  issuer: string;
  issuedAt: Date;
}
```

Guardian reçoit cette identité et décide.

---

## 📦 Payload Standards

### Command Payloads

Tous les commands suivent ce format:

```json
{
  "commandName": "CreateAccount",
  "payload": {
    "accountCode": "411000",
    "accountName": "Clients",
    "accountType": "ASSET"
  },
  "metadata": {
    "requestId": "uuid-v4",
    "timestamp": "2026-01-30T14:27:00Z"
  }
}
```

### Read Model Responses

Tous les read-models suivent ce format:

```json
{
  "data": [...],
  "metadata": {
    "timestamp": "2026-01-30T14:27:00Z",
    "version": "1.0.0"
  }
}
```

### Error Responses

Format uniforme:

```json
{
  "type": "AUTH_ERROR | GUARDIAN_ERROR | SYSTEM_ERROR",
  "message": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {
    "key": "value"
  }
}
```

---

## 🚫 Breaking Changes Interdits

### ❌ Interdictions Absolues

1. **Supprimer un endpoint** → Interdit
2. **Changer un code HTTP** → Interdit
3. **Modifier un payload obligatoire** → Interdit
4. **Changer la sémantique d'un endpoint** → Interdit
5. **Modifier le format d'erreur** → Interdit

### ✅ Évolutions Autorisées

1. **Ajouter un endpoint** → OK (non breaking)
2. **Ajouter un champ optionnel** → OK
3. **Déprécier avec warning** → OK (avec migration path)
4. **Créer /v2** → OK (nouvelle version)

---

## 🔄 Versioning Strategy

### Version actuelle: v1.0.0

Toute évolution breaking nécessite:

1. Créer `/api/v2/...`
2. Maintenir `/api/v1/...` (deprecated)
3. Documenter migration path
4. Annoncer sunset date

### Backward Compatibility

v1.0.0 reste supportée **minimum 6 mois** après v2.0.0.

---

## 🧪 CI Enforcement

### Checks Obligatoires

1. **OpenAPI Diff Check**
   - Détecte breaking changes
   - Bloque si diff non autorisé

2. **Contract Compliance**
   - Vérifie alignement code ↔ contrat
   - Bloque si divergence

3. **E2E Tests**
   - Tous les endpoints testés
   - Tous les codes HTTP testés

4. **Error Format Validation**
   - Vérifie format erreurs
   - Vérifie mapping 401/403/409

---

## 📜 Immutability Principles

### Ce contrat est IMMUTABLE

- ✅ Ce document est la source de vérité
- ✅ Le code doit se conformer au contrat
- ✅ Toute divergence = bug
- ✅ CI enforce le contrat

### Évolution

Pour évoluer:
1. Proposer nouvelle version (v1.1.0 ou v2.0.0)
2. Documenter breaking changes
3. Créer migration path
4. Obtenir validation architecture
5. Merger avec bump de version

---

## 🏁 Garanties Contractuelles

Avec ce gel, SPOFE garantit:

✅ **Stabilité API** - Pas de surprises  
✅ **Prévisibilité** - Comportement documenté  
✅ **Évolutivité** - Versioning clair  
✅ **Auditabilité** - Contrat fait foi  
✅ **Industrialisation** - CI enforce  

---

## 📚 Références

- **Security Model**: `contracts/security/SPOFE-Security-Model.v1.0.0.md`
- **Auth Contract**: `contracts/infrastructure/SPOFE-Auth-Contract.v1.md`
- **FCE**: `frontend/core/spofe-contract/README.md`
- **OpenAPI Spec**: `cascade/docs/openapi.yaml`
- **CI Checks**: `ci/check-api-*.js`

---

**© 2026 SPOFE Team**  
**API v1.0.0 - GELÉE - CONTRACTUELLE - NON RÉTRO-CASSABLE**
