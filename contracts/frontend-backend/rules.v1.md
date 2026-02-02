# SPOFE Frontend ↔ Backend Rules (v1)

**Status:** ACTIVE
**Version:** 1.0.0
**Last Updated:** 2026-01-30

---

## R1 — Le frontend n'est jamais une autorité

**Règle stricte:** Toute validation métier est interdite côté frontend.

### ❌ Interdit

```typescript
// ❌ Frontend calcule le statut
if (aggregate.closedDate && new Date() > aggregate.closedDate) {
  // Frontend déduit "fermé"
}

// ❌ Frontend valide une règle métier
if (balance < 0) {
  reject("Solde insuffisant"); // C'est au backend de décider
}

// ❌ Frontend "répare" une erreur
if (response.status === 409) {
  await retry(); // Non ! Erreur est finale
}
```

### ✅ Obligatoire

```typescript
// ✅ Frontend affiche ce que le backend dit
const aggregate = await readModel.getAggregate(id);
display(aggregate.status); // Accepte "closed" ou "open" du backend

// ✅ Frontend déclenche une intention explicite
await command.createAggregate({ name: "..." });

// ✅ Frontend affiche l'erreur sans l'interpréter
if (response.status === 409) {
  displayError("Cette action n'est pas possible actuellement");
}
```

---

## R2 — Toute écriture est une Command

**Règle stricte:** Aucune écriture ne peut être déclenchée sans passer par une Command déclarée.

### ❌ Interdit

```typescript
// ❌ CRUD générique
PATCH /aggregates/123
{ "status": "closed" }

// ❌ Update implicite
PUT /aggregates/123
{ "field": "value" }

// ❌ Auto-save métier
onInputChange(() => {
  api.patch(`/data/${id}`, formState);
});

// ❌ Endpoint technique
POST /internal/update-state
```

### ✅ Obligatoire

```typescript
// ✅ Command explicite et nommée
POST /commands/CloseAggregate
{
  "aggregateId": "123"
}

// ✅ Commands déclarées
POST /commands/CreateAggregate
{
  "name": "...",
  "owner": "..."
}

POST /commands/UpdateAggregate
{
  "aggregateId": "123",
  "newValue": "..."
}
```

---

## R3 — Les read-models ne sont pas des vérités

**Règle stricte:** Le frontend ne reconstruit jamais un état métier.

### ❌ Interdit

```typescript
// ❌ Recalcul du statut
const status = aggregate.createdAt 
  ? (aggregate.closedAt ? "closed" : "open")
  : "pending";

// ❌ Reconstruction temporelle
const history = events.reduce((acc, e) => {
  // Frontend reconstruit l'état historique
  return apply(acc, e);
}, initialState);

// ❌ Agrégation côté client
const total = items.reduce((sum, item) => sum + item.amount, 0);
```

### ✅ Obligatoire

```typescript
// ✅ Affichage tel que fourni
const readModel = await api.getAggregate(id);
display(readModel.status); // C'est VRAI

// ✅ Read-models pré-calculés
const total = await api.getAggregateTotal(id); // Backend l'a calculé

// ✅ Tri/filtre purement UI
const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
const filtered = items.filter(item => item.visible);
```

---

## R4 — Une erreur backend est finale

**Règle stricte:** Le frontend n'interprète ni ne corrige une décision refusée.

### ❌ Interdit

```typescript
// ❌ Retry avec modification
if (response.status === 409) {
  await retry({ ...payload, withoutValidation: true });
}

// ❌ Contourner l'erreur
if (error.code === "INSUFFICIENT_BALANCE") {
  await api.increaseBalance(); // Bricolage
}

// ❌ Masquer l'erreur
try {
  await command.execute();
} catch (e) {
  // Silent failure — non !
}
```

### ✅ Obligatoire

```typescript
// ✅ Afficher sans interpréter
try {
  await command.close(aggregateId);
} catch (error) {
  displayError(error.message); // Message fourni par backend
}

// ✅ Laisser l'utilisateur décider
displayError("Cette action n'est pas possible");
displayHint(error.reason); // "Solde insuffisant", "Période fermée", etc.

// ✅ Rafraîchir l'état
await readModel.refresh();
```

---

## R5 — Un module frontend = un module SPOFE

**Règle stricte:** Pas de dépendance cachée entre modules.

### ❌ Interdit

```typescript
// ❌ Module journal appelle des données de budget
const journal = await api.getJournal();
const budget = await api.getBudget(); // Couplage !

// ❌ Logique transverse côté client
function syncAllModules() {
  journal.refresh();
  budget.refresh();
  // À faire au backend
}
```

### ✅ Obligatoire

```typescript
// ✅ Chaque module indépendant
const journal = await api.getJournal();

// ✅ Commands intra-module
await command.createJournalEntry({ ... });

// ✅ Si coordination métier = Command backend
await command.syncPeriod({ periodId: "..." });
```

---

## R6 — Client API unique

**Règle stricte:** Pas de fetch() hors du client API centralisé.

### ❌ Interdit

```typescript
// ❌ Fetch dans une vue
const data = await fetch('/api/...');

// ❌ Fetch dans un composant
useEffect(() => {
  fetch('/api/...')
    .then(r => r.json())
    .then(d => setState(d));
}, []);
```

### ✅ Obligatoire

```typescript
// ✅ Client API unique
import { apiClient } from '@/api/client';

const data = await apiClient.get('/aggregates');

// ✅ Client gère :
// - Headers (Authorization, Content-Type)
// - Erreurs globales
// - Retry logic
// - Request/Response validation
```

---

## R7 — Pas de logique réseau dans les vues

**Règle stricte:** Pas de fetch() dans le rendu, pas de await directs.

### ❌ Interdit

```typescript
// ❌ Fetch dans le rendu
function AggregateDetail() {
  const [data, setData] = useState(null);
  
  // ❌ Data fetching côté render
  useEffect(() => {
    fetch(`/api/aggregates/${id}`)
      .then(r => r.json())
      .then(setData);
  }, [id]);
  
  return <div>{data?.name}</div>;
}

// ❌ Await directement
const handleClick = async () => {
  const data = await api.get('/...');
  // Données non-préparées
};
```

### ✅ Obligatoire

```typescript
// ✅ Data fetching séparé (hook ou store)
function useAggregate(id) {
  return useQuery(['aggregate', id], () => api.get(`/aggregates/${id}`));
}

// ✅ Vue reçoit des props
function AggregateDetail({ aggregate }) {
  return <div>{aggregate.name}</div>;
}

// ✅ Commandes préparées et validées
const handleClick = async () => {
  try {
    await command.execute(preparedPayload);
    await readModel.refresh();
  } catch (error) {
    displayError(error.message);
  }
};
```

---

## R8 — État UI uniquement

**Règle stricte:** Pas d'état métier persistant côté frontend.

### ❌ Interdit

```typescript
// ❌ localStorage pour le métier
localStorage.setItem('aggregateStatus', 'closed');

// ❌ État persistant deduit
useState(() => JSON.parse(localStorage.getItem('state')));

// ❌ Offline-first non-gouverné
const syncQueue = []; // À faire au backend
```

### ✅ Obligatoire

```typescript
// ✅ État UI uniquement
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedTab, setSelectedTab] = useState('details');
const [isLoading, setIsLoading] = useState(false);

// ✅ localStorage pour UI
localStorage.setItem('preferredLanguage', 'fr');
localStorage.setItem('theme', 'dark');

// ✅ Mettre en cache temporaire si besoin
const cache = useRef(new Map());
```

---

## R9 — Authentification : transmettre l'identité, pas l'autorité

**Règle stricte:** Frontend ne choisit jamais son rôle.

### ❌ Interdit

```typescript
// ❌ Frontend choisit son rôle
const headers = {
  'Authorization': `Bearer ${token}`,
  'X-User-Role': 'admin' // ❌ Frontend ne décide pas
};

// ❌ Frontend déduit une permission
if (userRole === 'admin') {
  showButton(); // ❌ Backend décide
}

// ❌ Frontend crée son propre token
const fakeToken = encode({ role: 'admin' });
```

### ✅ Obligatoire

```typescript
// ✅ Transmettre l'identité
const headers = {
  'Authorization': `Bearer ${jwtToken}`, // Token backend seulement
  'X-Subject': subject // Subject du backend
};

// ✅ Backend dit ce qu'on peut faire
if (await api.canExecute('CreateAggregate')) {
  showButton();
}

// ✅ Backend décide de l'affichage
const actions = await api.getAvailableActions();
```

---

## R10 — Vocabulaire métier

**Règle stricte:** Le nom des Commands reflète le vocabulaire métier.

### ❌ Interdit

```typescript
// ❌ Générique CRUD
SaveForm
UpdateField
SetStatus

// ❌ Technique
PersistObject
ExecuteDelta
ApplyPatch
```

### ✅ Obligatoire

```typescript
// ✅ Métier explicite
CreateAggregate
CloseAggregate
UpdateAggregateValue
ApproveTransaction
RejectEntry

// ✅ Le vocabulaire frontend = vocabulaire backend
```

---

## R11 — Guardian est invisible mais souverain

**Règle stricte:** Frontend ne connaît pas Guardian, ne le contourne pas.

### ❌ Interdit

```typescript
// ❌ Frontend sait ce qu'est Guardian
if (guardianApproved) {
  showConfirmation();
}

// ❌ Frontend contourne une invariant
if (error.code === 'GUARDIAN_REJECTED') {
  await api.forceApply(); // Non !
}
```

### ✅ Obligatoire

```typescript
// ✅ Guardian est transparent
await command.execute(payload);
// Si Guardian rejette → erreur explicite

// ✅ Frontend respecte la décision
if (response.status === 403 || 409 || 422) {
  displayError("Action non possible");
  // Point. Pas d'interprétation.
}
```

---

## R12 — Règle d'or (affichable dans le frontend)

```
┌─────────────────────────────────────────┐
│  Le frontend ne valide rien.            │
│  Il reflète.                            │
│  Il déclenche.                          │
│  Il respecte.                           │
└─────────────────────────────────────────┘
```

---

## Violations détectables en CI

| Violation | Détection | Failure |
|-----------|-----------|---------|
| Fetch hors client API | Grep `fetch(` | ❌ BUILD FAIL |
| Logique métier | Patterns AST | ❌ BUILD FAIL |
| State métier | localStorage/sessionStorage | ❌ BUILD FAIL |
| Endpoint non-listé | Runtime check | ❌ RUNTIME ERROR |
| Méthode interdite | Validation | ❌ API REJECT |
| Guardian contourné | Business logic | ❌ 403/409/422 |

---

## Référence rapide

| Règle | ✅ Autorisé | ❌ Interdit |
|-------|------------|-----------|
| **Validation** | Affichage | Vérification métier |
| **Écriture** | Commands | CRUD, PUT, DELETE |
| **Lecture** | Read-models | Tables directes |
| **État** | UI, Navigation | Métier, Business |
| **Erreurs** | Affichage | Correction |
| **Auth** | Transmettre | Choisir |
| **Réseau** | Client API | fetch() direct |
