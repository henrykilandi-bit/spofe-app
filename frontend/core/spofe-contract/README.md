# 🧊 Frontend Contract Enforcer (FCE) v1.0.0

**Version**: 1.0.0  
**Statut**: 🧊 GELÉ – CONTRACTUEL – NON RÉTRO-CASSABLE  
**Date de gel**: 30 janvier 2026  
**Portée**: Frontend SPOFE

---

## 🎯 Signification du Gel

Le Frontend Contract Enforcer v1.0.0 est **stable et contractuel**.

À partir de maintenant:

❌ **Aucun changement de mapping d'erreur**  
❌ **Aucune logique conditionnelle ajoutée**  
❌ **Aucune modification de l'injection auth**  
✅ **Toute évolution = v1.1.0 (compatible) ou v2.0.0**

> **Les modules frontend dépendent de ce comportement exact.**

---

## � API Publique v1.0.0

### Fonctions Exportées (GELÉES)

```typescript
// Commands
export function sendCommand(commandName: string, payload: unknown): Promise<unknown>

// Read Models
export function readModel(endpoint: string): Promise<unknown>

// Errors
export class FceError extends Error {
  readonly type: FceErrorType;
  readonly status: number;
  readonly payload?: unknown;
}

export type FceErrorType = 
  | 'AUTH_ERROR'        // 401
  | 'GUARDIAN_ERROR'    // 403/404/409
  | 'SYSTEM_ERROR';     // 500+
```

---

## 🔐 Injection Auth (GELÉE)

### Comportement Contractuel

```typescript
// Le FCE injecte automatiquement le token
const token = loadToken(); // depuis core/auth

if (token) {
  headers['Authorization'] = `Bearer ${token}`;
}
```

### Règles Immuables

✅ Token injecté si présent  
✅ Token **opaque** - jamais parsé  
✅ Aucune validation côté frontend  
❌ Aucune décision d'autorité  
❌ Aucun retry sur 401  

---

## 🎯 Mapping Erreurs (STRICT - GELÉ)

### 401 → AUTH_ERROR

**Signification**: Problème d'identité technique

**Cas**:
- Token absent (quand requis)
- Token invalide
- Token expiré

**Frontend reaction**:
```typescript
try {
  await sendCommand('CreateAccount', payload);
} catch (err) {
  if (err instanceof FceError && err.type === 'AUTH_ERROR') {
    // Redirect to login
    router.push('/login');
  }
}
```

### 403/404/409 → GUARDIAN_ERROR

**Signification**: Décision métier Guardian

**Cas**:
- Invariant violation (409)
- Business rule refusal (403)
- Resource not found (404)

**Frontend reaction**:
```typescript
try {
  await sendCommand('CloseAggregate', { id: '123' });
} catch (err) {
  if (err instanceof FceError && err.type === 'GUARDIAN_ERROR') {
    // Display error to user
    toast.error(err.message);
  }
}
```

### 500+ → SYSTEM_ERROR

**Signification**: Erreur infrastructure

**Frontend reaction**:
```typescript
try {
  await readModel('/api/accounts');
} catch (err) {
  if (err instanceof FceError && err.type === 'SYSTEM_ERROR') {
    // Generic error page
    showErrorPage();
  }
}
```

---

## � Usage v1.0.0

### Envoyer une Command

```typescript
import { sendCommand } from '@/core/spofe-contract';

try {
  const result = await sendCommand('CreateAccount', {
    accountCode: '411000',
    accountName: 'Clients'
  });
  
  console.log('Success:', result);
} catch (err) {
  if (err instanceof FceError) {
    switch (err.type) {
      case 'AUTH_ERROR':
        // Redirect login
        break;
      case 'GUARDIAN_ERROR':
        // Show error
        break;
      case 'SYSTEM_ERROR':
        // Error page
        break;
    }
  }
}
```

### Lire un Read Model

```typescript
import { readModel } from '@/core/spofe-contract';

try {
  const accounts = await readModel('/api/chart-of-accounts');
  
  console.log('Accounts:', accounts);
} catch (err) {
  if (err instanceof FceError) {
    // Handle typed error
  }
}
```

---

## 🚫 Breaking Changes Interdits

### ❌ Interdictions Absolues

1. **Changer le mapping d'erreur** → Interdit
   - 401 DOIT rester AUTH_ERROR
   - 403/404/409 DOIVENT rester GUARDIAN_ERROR
   - 500+ DOIT rester SYSTEM_ERROR

2. **Modifier l'injection auth** → Interdit
   - Token DOIT être injecté via `loadToken()`
   - Header DOIT être `Authorization: Bearer <token>`
   - Aucune validation frontend

3. **Ajouter logique conditionnelle** → Interdit
   - Pas de `if (user.role)`
   - Pas de filtrage de données
   - Pas de décisions d'autorité

4. **Changer la signature des fonctions** → Interdit
   - `sendCommand(commandName, payload)` est gelée
   - `readModel(endpoint)` est gelée

### ✅ Évolutions Autorisées

1. **Ajouter une fonction** → OK (non breaking)
2. **Ajouter un paramètre optionnel** → OK
3. **Améliorer les types** → OK (si compatible)
4. **Optimiser les performances** → OK (si comportement identique)

---

## 🔄 Versioning Strategy

### Version actuelle: v1.0.0

Toute évolution breaking nécessite:

1. Créer v2.0.0
2. Maintenir v1.0.0 (deprecated)
3. Documenter migration path
4. Annoncer sunset date

### Backward Compatibility

v1.0.0 reste supportée **minimum 6 mois** après v2.0.0.

---

## 🧪 CI Enforcement

### Tests Obligatoires

1. **Tests unitaires FCE**
   - Tous les mappings d'erreur testés
   - Injection auth testée
   - Comportement gelé vérifié

2. **Snapshot des erreurs**
   - Format FceError figé
   - Types d'erreur figés
   - Payload structure figée

3. **Tests d'intégration**
   - sendCommand testé E2E
   - readModel testé E2E
   - Tous les codes HTTP testés

### Checks Bloquants

```bash
# Tests unitaires
npm run test:fce

# Snapshot validation
npm run test:fce:snapshot

# Integration tests
npm run test:fce:e2e
```

---

## 📜 Immutability Principles

### Ce contrat est IMMUTABLE

- ✅ Ce README est la source de vérité
- ✅ Le code doit se conformer au README
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

Avec ce gel, le FCE garantit:

✅ **Stabilité** - Comportement prévisible  
✅ **Typage fort** - Erreurs typées  
✅ **Séparation auth/autorité** - Pas de logique métier  
✅ **Auditabilité** - Comportement documenté  
✅ **Testabilité** - Comportement gelé testable  

---

## 📚 Références

- **Security Model**: `contracts/security/SPOFE-Security-Model.v1.0.0.md`
- **Auth Contract**: `contracts/infrastructure/SPOFE-Auth-Contract.v1.md`
- **API Backend**: `contracts/backend/SPOFE-API.v1.0.0.md`
- **CI Checks**: `ci/check-fce-*.js`
- **Tests**: `frontend/core/spofe-contract/__tests__/`

---

**© 2026 SPOFE Team**  
**FCE v1.0.0 - GELÉ - CONTRACTUEL - NON RÉTRO-CASSABLE**

```typescript
// Simple
const result = await sendCommand('CreateAggregate', {
  name: 'Q1 Budget'
});

// Avec options
const result = await sendCommand('UpdateAggregate', payload, {
  skipValidation: true
});
```

**Erreurs:**
- `ContractViolation` si Command non-autorisée
- `Error` si backend refuse (avec `error.status`, `error.code`, `error.details`)

---

### `ContractEnforcer`

Classe pour inspecter le contrat.

```typescript
const enforcer = ContractEnforcer.getInstance();

// Initialiser
await enforcer.initialize();

// Vérifier les permissions
enforcer.isCommandAllowed('CreateAggregate'); // true
enforcer.isReadModelAllowed('/aggregates');   // true

// Lister tout
enforcer.getAllowedCommands();   // Array<string>
enforcer.getAllowedReadModels(); // Array<string>

// Inspécter
enforcer.getVersion();    // "1.0.0"
enforcer.getContract();   // Object complet
enforcer.printStatus();   // Log formaté
```

---

## 🔒 Violations & Erreurs

### Types de violations

```typescript
import { VIOLATIONS } from '@/core/spofe-contract';

VIOLATIONS.COMMAND_NOT_ALLOWED        // Command inconnue
VIOLATIONS.READ_MODEL_NOT_ALLOWED     // Read-model inconnue
VIOLATIONS.METHOD_NOT_ALLOWED         // HTTP method invalide
VIOLATIONS.INVALID_COMMAND_PAYLOAD    // Payload invalide
VIOLATIONS.MISSING_AUTHORIZATION      // Pas de token
VIOLATIONS.CONTRACT_NOT_LOADED        // Contrat non chargé
```

### Gestion des erreurs

```typescript
import { sendCommand, ContractViolation } from '@/core/spofe-contract';

try {
  await sendCommand('CloseAggregate', { id: '123' });
} catch (error) {
  // Violation de contrat
  if (error instanceof ContractViolation) {
    console.error('Contrat violé:', error.code);
    console.error('Message:', error.message);
    console.error('Détails:', error.details);
  }
  
  // Erreur du backend (Decision Guardian)
  else if (error.status === 409) {
    console.error('Conflit métier:', error.details);
  }
  
  // Erreur réseau
  else if (error instanceof TypeError) {
    console.error('Erreur réseau:', error.message);
  }
}
```

---

## 🧪 Tests

### Test simple

```typescript
import { sendCommand, ContractViolation } from '@/core/spofe-contract';

it('should not allow undeclared commands', async () => {
  await expect(
    sendCommand('HACK_SYSTEM', {})
  ).rejects.toThrow(ContractViolation);
});
```

### Test avec violation spécifique

```typescript
import { sendCommand, VIOLATIONS } from '@/core/spofe-contract';

it('should throw COMMAND_NOT_ALLOWED', async () => {
  try {
    await sendCommand('UnknownCommand', {});
    expect.fail('Should have thrown');
  } catch (error) {
    expect(error.code).toBe(VIOLATIONS.COMMAND_NOT_ALLOWED);
    expect(error.details.commandName).toBe('UnknownCommand');
  }
});
```

### Mocking le contrat

```typescript
import { resetContract, loadContract } from '@/core/spofe-contract';

beforeEach(async () => {
  resetContract();
  
  global.fetch = vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        version: '1.0.0',
        commands: [{ name: 'CreateAggregate' }]
      })
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        version: '1.0.0',
        readModels: [{ path: '/aggregates' }]
      })
    });
  
  await loadContract();
});
```

---

## 🔐 Authentification

### Méthode 1: localStorage/sessionStorage

```typescript
// Automatiquement cherchée dans:
localStorage.setItem('spofe_token', token);
// ou
sessionStorage.setItem('auth_token', token);
```

### Méthode 2: Callback personnalisé

```typescript
import { setTokenProvider } from '@/core/spofe-contract';

setTokenProvider(() => {
  return authService.getToken();
});
```

### Méthode 3: Function globale

```typescript
window.getAuthToken = () => {
  return myAuthService.getToken();
};
```

---

## 💾 Cache

### Cache automatique

```typescript
// Première lecture: depuis le backend
const data1 = await readModel('/aggregates');

// Deuxième lecture: depuis le cache (5 min par défaut)
const data2 = await readModel('/aggregates');

// Contenu identique, pas de requête réseau
```

### Contrôler le cache

```typescript
import { readModel, invalidateCache, clearCache } from '@/core/spofe-contract';

// Désactiver le cache pour cette lecture
const fresh = await readModel('/aggregates', { useCache: false });

// Invalider un pattern
await command.execute();
invalidateCache('/aggregates'); // Tout ce qui commence par /aggregates

// Vider le cache entièrement
clearCache();
```

---

## 📊 Structure des fichiers

```
frontend/core/spofe-contract/
├─ index.js                 # Point d'entrée principal
├─ contractLoader.js        # Chargement & cache du contrat
├─ commandClient.js         # Client pour Commands
├─ readModelClient.js       # Client pour Read-models
├─ violations.js            # Définitions des violations
├─ enforcer.js              # Inspection du contrat
├─ __tests__.js             # Tests unitaires
└─ README.md                # Cette documentation
```

---

## ⚠️ Pièges courants

### ❌ Oublier d'initialiser

```typescript
// ❌ MAUVAIS
import { readModel } from '@/core/spofe-contract';
const data = await readModel('/aggregates'); // Erreur!

// ✅ BON
import { loadContract, readModel } from '@/core/spofe-contract';
await loadContract();
const data = await readModel('/aggregates');
```

### ❌ Fetch direct

```typescript
// ❌ ÉVITER
const data = await fetch('/api/aggregates').then(r => r.json());

// ✅ OBLIGATOIRE
import { readModel } from '@/core/spofe-contract';
const data = await readModel('/aggregates');
```

### ❌ Pas de token

```typescript
// ❌ MAUVAIS - Pas de token défini
await sendCommand('CreateAggregate', {});

// ✅ BON - Token disponible
localStorage.setItem('spofe_token', token);
await sendCommand('CreateAggregate', {});
```

---

## 🚨 Monitoring & Audit

### Log automatique des violations

```typescript
// Les violations sont loggées automatiquement
// Si SPOFE_CONFIG.auditTrailEnabled = true, elles sont envoyées au backend

window.SPOFE_CONFIG = {
  auditTrailEnabled: true
};
```

### Inspection du contrat en console

```typescript
import { ContractEnforcer } from '@/core/spofe-contract';

const enforcer = ContractEnforcer.getInstance();
enforcer.printStatus();

// Output:
// [SPOFE Contract Status]
// Version: 1.0.0
// Status: ACTIVE
// Last Updated: 2026-01-30T...
// Commands: 3
// Read-models: 5
```

---

## 📝 Intégration en CI/CD

### Vérifier les violations

```bash
# Reject toute violation
npm run test -- --coverage

# Scanner statique (grep)
grep -r "fetch(" src/ | grep -v "apiClient" && exit 1
grep -r "localStorage\|sessionStorage" src/ | grep -E "balance|status" && exit 1
```

---

## 🔄 Migration vers une nouvelle version du contrat

```typescript
// Si le contrat passe de v1.0.0 à v1.1.0
// Les deux versions coexistent pendant 1 sprint

// Avant (v1)
await sendCommand('CreateAggregate', payload);

// Après (v1.1 - nouveau command optionnel)
await sendCommand('CreateAggregatev2', payload);

// Deprecated (v1) sera retiré après 1 sprint
```

---

## 🆘 Dépannage

### "Contract not loaded"

```typescript
// ✅ FIX
const contract = await loadContract();
```

### "Command not allowed"

```typescript
// Vérifier allowed-commands.v1.json
// Ajouter la Command au backend et au contrat

import { ContractEnforcer } from '@/core/spofe-contract';
const enforcer = ContractEnforcer.getInstance();
console.log(enforcer.getAllowedCommands());
```

### Problèmes de cache

```typescript
// Vider le cache
import { clearCache } from '@/core/spofe-contract';
clearCache();

// Ou désactiver
const data = await readModel('/aggregates', { useCache: false });
```

---

## 📞 Support

Toute question sur le contrat → Consulter le tech lead
Violation détectée → Créer une issue GitHub

---

**Frontend Contract Enforcer** © 2026 SPOFE Team
