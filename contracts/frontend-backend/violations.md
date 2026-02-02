# Types de violations — Détection & Prévention

**Status:** ACTIVE
**Version:** 1.0.0
**Last Updated:** 2026-01-30

---

## 🔴 Violations CRITIQUES

### V1 — Logique métier côté client

**Symptôme:** Frontend valide, calcule ou décide seul.

```typescript
// ❌ VIOLATION CRITIQUE
if (aggregate.balance < 0) {
  throw new Error("Solde insuffisant");
}
```

**Impact:** 
- Perte de gouvernance métier
- Désynchronisation frontend/backend
- Bugs impossibles à tracer

**Détection:** 
- Grep: `if.*status|balance|condition`
- AST: Patterns de logique métier
- Runtime: Erreurs métier non-originaires du backend

**Prévention:**
```typescript
// ✅ CORRECT
try {
  await command.execute();
} catch (error) {
  if (error.status === 409) {
    displayError("Solde insuffisant");
  }
}
```

---

### V2 — État métier persistant

**Symptôme:** Frontend persiste de l'état métier (localStorage, cookie, etc).

```typescript
// ❌ VIOLATION CRITIQUE
localStorage.setItem('aggregateStatus', 'closed');
localStorage.setItem('balance', 1000);
```

**Impact:**
- Désynchronisation
- Offline-first non gouverné
- Données obsolètes

**Détection:**
- Grep: `localStorage.setItem|sessionStorage|IndexedDB`
- Scan: Données métier dans storage
- Runtime: Initialisation depuis storage

**Prévention:**
```typescript
// ✅ CORRECT - UI seulement
localStorage.setItem('preferredTheme', 'dark');
localStorage.setItem('sidebarCollapsed', true);
```

---

### V3 — Contournement de Guardian

**Symptôme:** Frontend ignore une erreur Guardian (403/409/422).

```typescript
// ❌ VIOLATION CRITIQUE
if (response.status === 409) {
  await retry({ withoutValidation: true });
}

if (error.code === 'GUARDIAN_REJECTED') {
  await api.forceApply(); // Non !
}
```

**Impact:**
- Violations d'invariants
- Corruption de données
- Responsabilité non-imputable

**Détection:**
- Code review: Patterns de retry
- Grep: `forceApply|bypass|ignore.*403`
- Runtime: Tentatives après 409

**Prévention:**
```typescript
// ✅ CORRECT
try {
  await command.execute();
} catch (error) {
  if (error.status === 409) {
    displayError("Action impossible");
    // Point. Fin.
  }
}
```

---

### V4 — Lecture de tables directes

**Symptôme:** Frontend accède aux tables sans passer par read-models.

```typescript
// ❌ VIOLATION CRITIQUE
SELECT * FROM aggregates; // Direct access
SELECT * FROM events;     // Internal table
```

**Impact:**
- Exposition de structures internes
- Modification imprévisible des schémas
- Dépendance technique

**Détection:**
- SQL interceptor: Requêtes non-listées
- Network monitor: Endpoints techniques
- AST: Patterns de requête directe

**Prévention:**
```typescript
// ✅ CORRECT
const aggregates = await api.get('/aggregates');
```

---

## 🟠 Violations GRAVES

### V5 — Fetch hors client API

**Symptôme:** fetch() directement dans une vue.

```typescript
// ❌ VIOLATION GRAVE
useEffect(() => {
  fetch('/api/...')
    .then(r => r.json())
    .then(setData);
}, []);
```

**Impact:**
- Pas de validation centralisée
- Pas de gestion d'erreur uniforme
- Logique réseau dispersée

**Détection:**
- Grep: `fetch\(|axios\(|http.get\(`
- AST: Calls outside apiClient
- Linter: Custom rule

**Prévention:**
```typescript
// ✅ CORRECT
import { apiClient } from '@/api/client';
const data = await apiClient.get('/aggregates');
```

---

### V6 — Reconstruction d'état temporel

**Symptôme:** Frontend recalcule l'historique ou l'état métier.

```typescript
// ❌ VIOLATION GRAVE
const status = events.reduce((acc, e) => {
  return applyEvent(acc, e);
}, initialState);
```

**Impact:**
- Désynchronisation inévitable
- Logique duplicée
- Maintenance difficile

**Détection:**
- Code review: Patterns d'agrégation
- Grep: `reduce|accumulate|replay`
- AST: Business logic patterns

**Prévention:**
```typescript
// ✅ CORRECT
const aggregate = await api.getAggregate(id);
// Status vient du backend
```

---

### V7 — Command générique ou ambigüe

**Symptôme:** Command sans intention métier claire.

```typescript
// ❌ VIOLATION GRAVE
POST /commands/Update
{ "id": "...", "field": "status", "value": "closed" }

POST /commands/Save
{ /* payload ambigu */ }
```

**Impact:**
- Ambiguïté sémantique
- Impossible à auditer
- Contrat non-respecté

**Détection:**
- Code review: Noms génériques
- Backend: Rejet des commands non-listées
- CI: Scan des endpoints /commands/*

**Prévention:**
```typescript
// ✅ CORRECT
POST /commands/CloseAggregate
{ "aggregateId": "..." }
```

---

### V8 — État métier dans React state

**Symptôme:** État métier (balance, status) dans useState.

```typescript
// ❌ VIOLATION GRAVE
const [balance, setBalance] = useState(0);
const [status, setStatus] = useState('open');

// Frontend synchronise "manuellement"
useEffect(() => {
  setBalance(aggregate.balance);
}, [aggregate]);
```

**Impact:**
- Duplication de vérité
- Synchronisation fragile
- Source de bugs

**Détection:**
- Code review: Patterns de sync
- Grep: `setBalance|setStatus` (métier)
- Runtime: Désynchronisation

**Prévention:**
```typescript
// ✅ CORRECT
const aggregate = useQuery(['aggregate', id], 
  () => api.getAggregate(id)
);

// Utiliser directement aggregate.balance, aggregate.status
```

---

## 🟡 Violations MINEURES

### V9 — Logique réseau dans les vues

**Symptôme:** await ou loading dans le rendu.

```typescript
// ❌ VIOLATION MINEURE
function Detail() {
  const handleClick = async () => {
    const data = await api.get('...'); // Non-préparé
    setState(data);
  };
  
  return <button onClick={handleClick}>Load</button>;
}
```

**Prévention:**
```typescript
// ✅ CORRECT
function useDetail(id) {
  return useQuery(['detail', id], () => api.get(`/aggregates/${id}`));
}

function Detail({ id }) {
  const { data } = useDetail(id);
  return <div>{data?.name}</div>;
}
```

---

### V10 — Endpoint non-documenté

**Symptôme:** GET/POST vers un endpoint absent du contrat.

```typescript
// ❌ VIOLATION MINEURE
GET /internal/debug-state
POST /admin/update-user
```

**Prévention:**
```typescript
// ✅ CORRECT
GET /aggregates/{id} // Listé dans allowed-read-models.v1.json
POST /commands/CreateAggregate // Listé dans allowed-commands.v1.json
```

---

### V11 — Méthode HTTP interdite

**Symptôme:** PUT, DELETE au lieu de PATCH/POST.

```typescript
// ❌ VIOLATION MINEURE
PUT /aggregates/123
DELETE /aggregates/123
```

**Prévention:**
```typescript
// ✅ CORRECT
POST /commands/UpdateAggregate
POST /commands/CloseAggregate
```

---

## 🟢 Checks automatiques en CI

### Frontend Checks

```bash
# 1. Pas de fetch() hors apiClient
grep -r "fetch(" src/ | grep -v "apiClient"

# 2. Pas de localStorage métier
grep -r "localStorage\|sessionStorage" src/ | grep -E "balance|status|aggregate"

# 3. Pas de logique métier
grep -r "if.*status|if.*balance|if.*closed" src/components/

# 4. Contrat chargé au startup
grep -r "loadAllowedCommands\|loadAllowedReadModels" src/
```

### Backend Checks

```bash
# 1. Tout endpoint documenté
grep -r "@Route\|@Get\|@Post" src/ | check against allowed-*.json

# 2. Guardian présent
grep -r "@Validate\|Guardian" src/commands/

# 3. Erreurs explicites
grep -r "throw.*Error" src/ | verify message non-technique
```

---

## 📋 Matrice de gravité

| Violatiom | Gravité | Detection | Fail Build | Fail Runtime |
|-----------|---------|-----------|------------|--------------|
| Logique métier | CRITIQUE | Manual | ❌ | ✅ |
| État persistant | CRITIQUE | Automated | ✅ | ✅ |
| Contournement Guardian | CRITIQUE | Manual | ❌ | ✅ |
| Lecture directe | CRITIQUE | Automated | ✅ | ✅ |
| Fetch hors API | GRAVE | Automated | ✅ | ✅ |
| Reconstruction état | GRAVE | Manual | ❌ | ✅ |
| Command ambigüe | GRAVE | Manual | ❌ | ✅ |
| État métier React | GRAVE | Manual | ❌ | ❓ |
| Logique dans vue | MINEURE | Manual | ❌ | ❌ |
| Endpoint non-doc | MINEURE | Automated | ✅ | ✅ |
| Méthode HTTP | MINEURE | Automated | ✅ | ✅ |

---

## 🛠️ Patterns d'anti-violation

### Pattern 1: Validation centralisée (non-distribuée)

```typescript
// ❌ Anti-pattern
if (payload.amount < 0) throw Error("..."); // Frontend
if (payload.amount < 0) throw Error("..."); // Backend
```

```typescript
// ✅ Pattern
// Backend SEUL valide
await api.post('/commands/UpdateAmount', payload);
// Si invalide → 422 avec message explicite
```

---

### Pattern 2: Read-models pré-calculés

```typescript
// ❌ Anti-pattern
const total = items.reduce((sum, item) => sum + item.amount, 0);
```

```typescript
// ✅ Pattern
const summary = await api.get('/read/aggregate-summary');
display(summary.total); // Backend l'a calculé
```

---

### Pattern 3: Cache avec invalidation

```typescript
// ❌ Anti-pattern
localStorage.setItem('aggregates', JSON.stringify(data));
```

```typescript
// ✅ Pattern
const { data, refetch } = useQuery(['aggregates'], () => api.get('/aggregates'));
// Après command
await command.execute();
await refetch();
```

---

## 📞 Escalade

| Situation | Action |
|-----------|--------|
| Violation mineure détectée | Avertissement en PR |
| Violation grave détectée | Demande de refactor |
| Violation critique détectée | Bloc merge + escalade Tech Lead |
| Pattern d'anti-violation identifié | Refactor immédiat |
