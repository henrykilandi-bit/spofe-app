# 🔑 PRINCIPES UNIVERSELS SILC

## Edition Canonique v2.1

Ces principes ne dépendent plus de SPOFE.  
Ils sont **généralisables à toute architecture modulaire et gouvernée**.

---

## PRÉAMBULE

Les principes SILC émergent de la confrontation entre :

- **Réalité:** Les architectures réelles dérivent (évolution progressive, couches implicites, logique dispersée)
- **Ambition:** Créer un système où chaque ligne de code est vérifiable, traçable, opposable
- **Pragmatisme:** Ne pas demander plus que ce que la machine peut certifier

**Résultat:** 9 principes qui, pris ensemble, rendent une architecture **immuable tout en restant évolutive**.

---

## I. PRINCIPE DE PRIMAUTÉ CONTRACTUELLE

### Énoncé

> Le code n'est jamais une source de vérité.

### Fondement

La source de vérité doit être **externe et immuable** :

```
CONTRAT (source de vérité)
   ↓ définit
TESTS (spécifications exécutables)
   ↓ valident
CODE (mise en œuvre)
```

### Implication

**Jamais l'inverse:** "regarder le code pour comprendre ce qui doit se passer".

Si une ambiguïté existe entre contrat et code → le contrat gagne. Le code est *corrigé*.

### En Pratique

```typescript
// ❌ ANTIPATTERN
async function transferRole(userId, targetContextId) {
  // "Comment ça marche?" → lire le code
  const oldRole = await getRole(userId);
  // Vraiment atomique? Vraiment pas de race condition?
  // On ne sait qu'en exécutant
}

// ✅ PATTERN SILC
// Contrat: "TransferRoleProcess — Atomic across contexts"
async execute(params: TransferUserRoleRequest): Promise<TransferUserRoleResult> {
  // Chaque étape correspond à une clause contractuelle
  // Article 4: Déroulement gouverné
  // Vérifiable sans exécuter
}
```

### Vérifiabilité

Un contrat SILC doit être **lisible par une machine** et pouvoir être validé sans exécuter le code.

---

## II. PRINCIPE DE DÉCISION EXPLICITE

### Énoncé

> Aucun acte sans décision formelle.

### Fondement

Les systèmes implicites **cachent des bugs** :

```
Request
  ↓ (prise implicite de décision?)
Action
  ↓
Side Effects
```

Les décisions explicites **rendent l'intention claire** :

```
Request
  ↓
Validation (préc conditions)
  ↓
Decision (APPROVED | REJECTED)
  ↓ (basé sur la décision)
Execution | Rejection
  ↓
Audit Trail
```

### Implication

**Jamais de "if request.field then do X".**

Toujours : "Validate → Decide → Execute/Reject."

### En Pratique

```typescript
// ❌ ANTIPATTERN
function processUserRole(role) {
  if (role.level > 50) {
    // Décision prise implicitement
    promote(role);
  }
}

// ✅ PATTERN SILC
async execute(params: UserRoleTransferRequest) {
  // Article 2: Validation explicite
  const validation = await validateTransfer(params);
  if (!validation.isValid) throw new ContractViolationError(...);
  
  // Article 4: Décision explicite
  const decision = await makeDecision(validation); // APPROVED or REJECTED
  
  // Article 4: Exécution basée uniquement sur la décision
  if (decision === "APPROVED") {
    await revoke(oldRole);
    await assign(newRole);
  } else {
    return { status: "REJECTED", reason: decision.reason };
  }
}
```

### Vérifiabilité

Toute décision doit être **enregistrée et vérifiable** post-mortem.

---

## III. PRINCIPE DE NON-IMPLICITE

### Énoncé

> Ce qui n'est pas écrit est interdit.

### Fondement

Les systèmes implicites sont **impossibles à gouverner** :

- Dérive progressive (chaque dev ajoute "juste une petite chose")
- Comportement émergeant (interaction entre couches implicites)
- Non-testabilité (qu'est-ce qui est censé se passer?)

### Implication

Principe du **white-list, pas de black-list** :

```
✅ White-List (SILC)
├─ UserRoleQuery can: read roles by context
├─ UserRoleTransfer can: move role between contexts (atomic)
├─ AuditTrail can: expose 10 explicit fields
└─ Anything else: FORBIDDEN

❌ Black-List (antipattern)
├─ UserRoleQuery can do anything except:
│  ├─ "don't modify things"
│  ├─ "don't expose secret data"
│  └─ (what if we forget something?)
```

### En Pratique

```typescript
// ❌ ANTIPATTERN — Black-list
const exposedFields = allFields.filter(f => !forbiddenFields.includes(f));

// ✅ PATTERN SILC — White-list
const allowedFields = ["roleId", "userId", "contextId", "companyId", 
                       "decision", "sourceContextId", "targetContextId",
                       "sourceUserRoleId", "targetUserRoleId", "reason"];
const exposedFields = allowedFields.filter(f => details[f] !== undefined);
```

### Vérifiabilité

Le Guardian doit pouvoir **lister exhaustivement** ce qui est autorisé.

---

## IV. PRINCIPE DE SÉPARATION DES NATURES

### Énoncé

> Lecture, écriture, décision et validation ne se mélangent jamais.

### Fondement

Les systèmes où ces natures sont mélangées sont **sujets aux race conditions et aux incohérences**.

### Séparations Imposées

```
1. Lecture ↔ Écriture
   ├─ Query process: lecture uniquement
   └─ Command process: décision + écriture

2. Validation ↔ Exécution
   ├─ Validation: préconditions + inspection (pas d'effet de bord)
   └─ Exécution: mutations (basée sur décision)

3. Décision ↔ Implémentation
   ├─ Décision: "Approuvé ou rejeté?" (responsabilité métier)
   └─ Implémentation: "Comment revenir en arrière?" (technique)

4. Autorité ↔ Capacité
   ├─ Autorité: "ai-je le droit?" (contrat + contexte)
   └─ Capacité: "peux-je techniquement?" (repository)

5. Public ↔ Internal
   ├─ Public: ce qui est exposé au client
   └─ Internal: implémentation, état intermédiaire
```

### En Pratique

```typescript
// ❌ ANTIPATTERN — Lecture + Écriture mélangées
async findAndUpdate(userId) {
  const user = await db.findUser(userId);
  user.lastQueried = Date.now();  // ⚠️ write during read
  await db.update(user);
  return user;
}

// ✅ PATTERN SILC
async executeQuery(userId) {
  const user = await userRepository.findUser(userId);
  // Pas de modification during read
  return { userId: user.id, role: user.role };
  // Audit trail enregistre la lecture si nécessaire
}
```

### Vérifiabilité

Le Guardian peut vérifier par AST :
- Query processes n'appellent jamais repository.create/update/delete
- Validation n'a pas d'effet de bord
- Exécution suit toujours une décision

---

## V. PRINCIPE D'IRRÉVERSIBILITÉ GOUVERNÉE

### Énoncé

> Toute mutation est traçable, justifiée et auditée.

### Fondement

Les mutations **définissent le comportement du système** :

- Une mutation oubliée → état incohérent
- Une mutation sans justification → impossible à auditer
- Une mutation sans audit → non-compliante

### Implication

Chaque mutation doit avoir :

```
1. Point d'entrée unique (un processus gouverné)
2. Justification explicite (une décision approuvée)
3. Traçabilité (audit trail enregistre l'acteur, le moment, le pourquoi)
4. Réversibilité contrôlée (rollback si erreur)
```

### En Pratique

```typescript
// ❌ ANTIPATTERN — Mutation implicite
userRole.isActive = false; // Qui a dit de faire ça? Quand? Pourquoi?

// ✅ PATTERN SILC
// Article 4: Déroulement gouverné
await userRoleRepository.revoke(userRoleId);
// Mutation tracée à:
//  - Un processus spécifique (Revocation, Transfer, etc.)
//  - Une décision explicite (APPROVED)
//  - Un acteur enregistré (audit trail)
//  - Un timestamp (when)
//  - Un contexte (why/from which process)
```

### Vérifiabilité

L'audit trail doit pouvoir **reconstructir l'État complet** de l'application à tout moment.

---

## VI. PRINCIPE D'ÉCHEC SÛR

### Énoncé

> Un échec ne modifie jamais l'état.

### Fondement

Les opérations partielles sont **la source de tous les problèmes** :

```
"Transfer role"
  ├─ Step 1: Revoke old role ✅
  ├─ Step 2: Assign new role ❌ ERROR
  ├─ Step 3: Audit trail ???
  └─ RÉSULTAT: Rôle disparu, utilisateur brisé
```

### Implication

**Atomicité garantie** : tout-ou-rien.

```
Option A: Succès complet
└─ Toutes les mutations ont eu lieu

Option B: Échec total
└─ Aucune mutation n'a eu lieu (rollback)

Option C: JAMAIS autorisé
└─ Mutations partielles
```

### En Pratique

```typescript
// ✅ PATTERN SILC — Atomicity
try {
  const revokedRole = await repository.revoke(oldRoleId);
  if (!revokedRole) throw new Error("Revoke failed");
  
  const newRole = await repository.create(newRoleParams);
  if (!newRole) {
    // Rollback: réactiver l'ancien rôle
    await repository.activate(oldRoleId);
    throw new ContractViolationError("Create failed, rolled back");
  }
  
  await auditTrail.record({ action: "TRANSFER", ...details });
  return { status: "TRANSFERRED", ...details };
  
} catch (error) {
  // Garanti: aucune mutation stable
  return { status: "REJECTED", reason: error.message };
}
```

### Vérifiabilité

Les tests doivent valider :
- Succès complet
- Échec sans mutation partielle
- Rollback automatique si étape intermédiaire échoue

---

## VII. PRINCIPE DE LISIBILITÉ SOUVERAINE

### Énoncé

> Un système doit être compréhensible sans exécution.

### Fondement

La compréhension ne doit pas nécessiter d'exécution :

```
❌ "Comment savoir ce que ça fait?"
   → Faut lancer le code
   → Puis débugguer
   → Puis trouver le problème

✅ "Comment savoir ce que ça fait?"
   → Lire le contrat
   → Lire les tests
   → Vérifier l'implémentation
   → Tout match
```

### Implication

L'architecture doit être **statiquement lisible** :

- Contrats clairs
- Tests exhaustifs (spécifications exécutables)
- Code structuré (pas de logique cachée)
- Noms explicites

### En Pratique

```typescript
// ❌ ANTIPATTERN — Lisibilité faible
async process(req) {
  const u = await db.q("select * from users where id=?", [req.i]);
  if (u) {
    const ctx = computeContext(u);
    if (shouldAllow(ctx, req.p)) {
      await doStuff(u, req.p);
    }
  }
}

// ✅ PATTERN SILC — Lisibilité souveraine
async execute(params: QueryUserRolesRequest): Promise<QueryUserRolesResult[]> {
  // Article 2: Vérifier préconditions
  const context = await contextRepository.findById(params.contextId);
  if (!context) throw new ContractViolationError("Context does not exist");
  
  // Article 2: Vérifier autorisation
  if (!context.isReadableBy(params.requesterId)) {
    throw new ContractViolationError("Not authorized to read");
  }
  
  // Article 1: Lecture pure
  const roles = await userRoleRepository.findByUserAndContext({
    userId: params.userId,
    contextId: params.contextId
  });
  
  // Article 4: Projection contractuelle
  return roles.map(role => ({
    roleId: role.roleId,
    contextId: role.contextId,
    isActive: role.isActive ?? true
  }));
}
```

### Vérifiabilité

Le Guardian peut valider **par inspection statique** (AST, pattern matching) que la structure est claire.

---

## VIII. PRINCIPE D'OPPOSABILITÉ

### Énoncé

> Toute règle doit être vérifiable par une machine.

### Fondement

Les règles humaines **ne passent pas à l'échelle** :

```
"Le code ne doit pas avoir de logique implicite"
  └─ Qu'est-ce que c'est "implicite"? (débat humain)

"Le code ne doit pas appeler repository.update() en dehors d'un processus"
  └─ Machine: scan pour tout appel de update()
  └─ Machine: vérifie context (inside process ou pas)
  └─ Machine: génère rapport
```

### Implication

Les règles SILC doivent être **exécutables**:

```
Contrat → Spécification formelle
Tests → Cas de test exécutables
Guardian → Validation par machine
Audit Trail → Vérification post-mortem par machine
```

### En Pratique

```typescript
// RÈGLE: "Mutations uniquement dans process"
// IMPLÉMENTATION: Guardian scanne AST
for (const call of scanFor("repository.*Mutation()")) {
  const enclosingMethod = findEnclosingMethod(call.position);
  if (!isContractualStep(enclosingMethod.name)) {
    violations.push({
      type: "UNCONTRACTUAL_MUTATION",
      location: call.position
    });
  }
}
```

### Vérifiabilité

Le Guardian produit un rapport machine-lisible :
- `SILC_COMPLIANCE.json` (score)
- `SILC_FLOW_GRAPH.json` (graphe décisionnel)
- `SILC_AST_REPORT.json` (violations structurelles)

---

## IX. PRINCIPE DE FERMETURE ARCHITECTURALE

### Énoncé

> Une architecture complète empêche toute dérive future.

### Fondement

Les architectures "ouvertes" **permettent la dérive** :

```
"Le système est extensible"
  └─ Mais comment? Pas de règles
  └─ Donc chaque nouveau dev invente sa propre approche
  └─ Résultat: architecture hybride et imprévisible
```

Les architectures "fermées" **forcent la conformité** :

```
"Pour ajouter un nouveau processus:"
1. Écrire un contrat (pas d'implémentation avant)
2. Écrire tests exhaustifs (doit passer avant le code)
3. Implémenter (doit être conforme)
4. Guardian valide (blocage automatique sinon)
5. Signature SILC mise à jour

Résultat: AUCUNE dérive possible
```

### Implication

La fermeture architecturale est **facilitée par** :

- Contrats immuables
- Tests comme barrière CI/CD
- Guardian avec veto
- Audit trail obligatoire
- Manifeste officiel (opposable)

### En Pratique

```typescript
// POINT D'ENTRÉE UNIQUE
export interface IProcess {
  execute(params: any): Promise<any>;
}

// TOUS les processus DOIVENT implémenter IProcess
// Guardian vérifie que AUCUNE autre classe n'expose execute()
// Tests DOIVENT couvrir 100% des articles du contrat
// CI/CD bloque si tests < 100% PASSING

// Résultat: Impossible d'ajouter une logique métier en dehors d'un processus
```

### Vérifiabilité

Le Guardian valide que :
- Tous les processus héritent/implémentent l'interface standard
- Aucun processus non-contractuel n'existe
- Aucun contrat non-implémenté n'existe
- Tous les tests couvrent 100% des articles

---

## TABLEAU SYNTHÉTIQUE

| Principe | Énoncé | Vérification |
|----------|--------|-------------|
| **I** | Primauté contractuelle | Contrat = source vérité |
| **II** | Décision explicite | Request → Validation → Decision → Execution |
| **III** | Non-implicite | White-list, pas black-list |
| **IV** | Séparation des natures | Lecture ↔ Écriture, Validation ↔ Exécution |
| **V** | Irréversibilité gouvernée | Traçabilité complète de chaque mutation |
| **VI** | Échec sûr | Atomicité: tout-ou-rien |
| **VII** | Lisibilité souveraine | Compréhensible sans exécution |
| **VIII** | Opposabilité | Vérifiable par machine |
| **IX** | Fermeture architecturale | Dérive future impossible |

---

## APPLICATION AUX 5 SPHÈRES

### 1. Code

```typescript
// Principe I: Code conforme au contrat
// Principe II: Décision explicite dans execute()
// Principe IV: Séparation (query vs command)
// Principe V: Chaque mutation enregistrée
// Principe VI: Atomicité (rollback si erreur)
// Principe VII: Lisible par structure
```

### 2. Tests

```typescript
// Principe II: Tests couvrent request → decision → execution
// Principe III: Test chaque cas (white-list)
// Principe VIII: Tests exécutables (vérifiables)
// Principe IX: Tests bloquent si incomplets
```

### 3. Contrats

```
// Principe I: Source de vérité
// Principe II: Articles définissent décision explicite
// Principe VII: Lisible sans code
// Principe VIII: Formellement vérifiable
// Principe IX: Immuables (nouvelle version pour changer)
```

### 4. Guardian

```typescript
// Principe I: Valide code ↔ contrat
// Principe III: Whitelist des mutations autorisées
// Principe IV: Valide séparation lecture/écriture
// Principe VIII: Produit rapport machine-lisible
// Principe IX: Veto automatique si violation
```

### 5. Audit Trail

```
// Principe II: Enregistre décision prise
// Principe V: Traçabilité irréversible
// Principe VI: Permet vérification post-mortem
// Principe VII: Reconstructible sans code
// Principe VIII: Vérifiable par machine
```

---

## CONCLUSION

Les 9 principes SILC forment une **totalité cohérente** :

```
Si tous les 9 sont appliqués:
  ✅ Architecture immuable (Principes I, IX)
  ✅ Comportement prévisible (Principes II, III, VII)
  ✅ Récupération garantie (Principles VI)
  ✅ Traçabilité complète (Principles V, VIII)
  ✅ Vérification possible (Principle VIII)

Si l'un manque:
  ❌ Faille dans la gouvernance
  ❌ Dérive possible
  ❌ Incohérence
```

**SILC n'est complet que si tous les 9 principes sont appliqués.**

---

**PRINCIPES UNIVERSELS SILC v2.1 — SCELLÉS**

*Applicables à toute architecture gouvernée*  
*Indépendants de SPOFE, généralisables à tout projet*
