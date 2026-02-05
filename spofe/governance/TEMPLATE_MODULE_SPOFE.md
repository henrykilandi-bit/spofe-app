# 🧱 TEMPLATE OFFICIEL — MODULE SPOFE

**Version:** v1.1.0  
**Source:** Golden Module Immobilisation  
**Autorité:** Gouvernance SPOFE  
**Statut:** NORMATIF (P0) — Doit être respecté pour toute validation SPOFE  
**Date:** 2026-02-03

> ⚠️ **Ce template est normatif : si un module ne respecte pas ce template, il ne peut pas être validé SPOFE.**

---

## 📁 Arborescence Standard (OBLIGATOIRE)

```
<module-name>/
├── contract/                     # 📜 Contrats normatifs
│   ├── CONTRACT.md
│   ├── SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   ├── API_READ_ONLY.md
│   └── <module>.openapi.json
│
├── src/                          # 🧠 Code contractuel
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── <module>-read.controller.ts
│   │   │   ├── <module>-write.controller.ts
│   │   │   └── <module>-<integration>.controller.ts
│   │   └── dto/
│   │
│   ├── application/
│   │   ├── commands/
│   │   ├── handlers/
│   │   └── events/
│   │
│   ├── domain/
│   │   ├── aggregates/
│   │   ├── value-objects/
│   │   ├── invariants/
│   │   └── guardian/
│   │
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   ├── write/
│   │   │   └── read/
│   │   └── db/
│   │
│   └── sql/
│       ├── migrations/
│       └── read-models.sql
│
├── tests/                        # 🧪 Tests contractuels
│   ├── unit/                     # Guardian (table-driven)
│   ├── integration/              # Guardian ↔ DB
│   ├── e2e/                      # API GET
│   └── contract/                 # Inter-modules
│
├── experimental/                 # ⚠️ Hors périmètre
│   ├── README.md
│   ├── legacy/
│   ├── drafts/
│   ├── poc/
│   └── disabled-tests/
│
├── BUILD_PROOF.md                # 🔐 Preuve de build
├── BUILD_PROOF.sig               # 🔏 Signature
├── tsconfig.module.json
├── package.json
└── README.md
```

---

## 📜 1️⃣ CONTRACT.md — Contrat Fonctionnel

```markdown
# <Module> — Contract v1.0.0

## Objectif
Décrire le périmètre fonctionnel du module <Module>.

## Responsabilités
- [Responsabilité 1]
- [Responsibilité 2]
- [Responsibilité 3]

## Hors périmètre
- [Ce qui est exclu 1]
- [Ce qui est exclu 2]

## Dépendances inter-modules
- [Module dépendant 1] : [Contrat]
- [Module dépendant 2] : [Contrat]

## Version
v1.0.0
```

---

## 🎯 2️⃣ SCOPE.md — Frontière Contractuelle (OBLIGATOIRE)

```markdown
# <Module> — Contractual Scope (SPOFE)

## IN SCOPE
- src/**
- tests/**
- contract/**
- sql/**
- BUILD_PROOF.md
- BUILD_PROOF.sig

## OUT OF SCOPE
- experimental/**
- scripts/**
- drafts/**

👉 Ce document fait foi en cas de conflit.
```

---

## 🧠 3️⃣ ARCHITECTURE.md — Golden Module

Structure identique à Immobilisation :

- **CQRS strict**
- **Guardian central**
- **Read-models SQL**
- **BUILD_PROOF obligatoire**

👉 À copier depuis le Golden Module Immobilisation.

```markdown
# Architecture — <Module>

## Pattern
CQRS (Command Query Responsibility Segregation)

## Couches
1. API Layer (Controllers)
2. Application Layer (Commands/Handlers)
3. Domain Layer (Aggregates/Guardian)
4. Infrastructure Layer (Repositories)

## Règles
- Guardian = seule autorité métier
- Read-models = SQL pur, aucun calcul
- Commands = immutables, validées
```

---

## 🛡️ 4️⃣ GUARDIAN.md — Invariants Métier

```markdown
# Guardian — <Module>

## Règle fondamentale
Aucune logique métier hors Guardian.

## Invariants
| Code | Description | Sévérité |
|------|-------------|----------|
| MOD-001 | [Invariant 1] | P1 |
| MOD-002 | [Invariant 2] | P1 |
| MOD-003 | [Invariant 3] | P2 |

## Validation
Toute commande passe par le Guardian avant persistance.
```

---

## 🔁 5️⃣ COMMANDS_EVENTS.md

```markdown
# Commands & Events — <Module>

## Commands
| Command | Input | Guardian Check |
|---------|-------|----------------|
| Create<Module> | [Fields] | [Invariant codes] |
| Update<Module> | [Fields] | [Invariant codes] |
| Delete<Module> | [Fields] | [Invariant codes] |

## Events
| Event | Description | Immédiat/Différé |
|-------|-------------|------------------|
| <Module>Created | [Description] | Immédiat |
| <Module>Updated | [Description] | Immédiat |
| <Module>Deleted | [Description] | Immédiat |
```

---

## 📊 6️⃣ READ_MODELS.md

```markdown
# Read Models — <Module>

## Vues SQL
| Vue | Description | Source |
|-----|-------------|--------|
| view_<module>_list | Liste paginée | events |
| view_<module>_detail | Détail complet | events |
| view_<module>_summary | Agrégations | events |

## Règles
- ✅ Lecture seule
- ❌ Aucun calcul métier
- ❌ Aucune logique conditionnelle
```

---

## 🌐 7️⃣ API_READ_ONLY.md

```markdown
# API Read-Only — <Module>

## Endpoints
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | /api/v1/<module> | Liste paginée |
| GET | /api/v1/<module>/{id} | Détail |
| GET | /api/v1/<module>/search | Recherche |

## Headers Obligatoires
- `X-Tenant-Id` : string (UUID)
- `Authorization` : Bearer token

## Règles
- ❌ Pas de POST/PUT/DELETE
- ❌ Pas de mutation d'état
```

---

## 🧪 8️⃣ TESTS — Règles Non Négociables

### Structure
```
tests/
├── unit/               # Guardian table-driven
│   └── <module>.guardian.spec.ts
├── integration/        # Guardian ↔ DB réel
│   └── <module>.integration.spec.ts
├── e2e/                # API GET uniquement
│   └── <module>.e2e.spec.ts
└── contract/           # Inter-modules
    └── <module>.contract.spec.ts
```

### Principes
- ✅ Tests unitaires Guardian (table-driven)
- ✅ PostgreSQL réel (pas de mock)
- ✅ Aucun mock métier
- ✅ Tests inclus dans BUILD_PROOF

---

## 🔐 9️⃣ BUILD_PROOF.md — Obligatoire

### Génération

```bash
# Générer le BUILD_PROOF
node tools/build-proof/generate-build-proof.ts

# Signer cryptographiquement
node tools/build-proof/sign-build-proof.ts
```

### Contenu minimum

```markdown
# BUILD_PROOF — <Module> v1.0.0

## Status
🟢 SUCCESS

## Timestamp
2026-02-02T10:00:00Z

## Commit
a1b2c3d

## Validation
- ✅ TypeScript : 0 erreurs
- ✅ Tests unitaires : [X]/[Y] pass
- ✅ Tests integration : [X]/[Y] pass
- ✅ Guardian : validé

## Signature
[Signature Ed25519]
```

> ⚠️ **Sans BUILD_PROOF signé : PAS DE GO PROD.**

---

## 🚦 10️⃣ CHECKLIST GO PROD (SYSTÈME)

Un module SPOFE est :

| Critère | Statut | Bloquant |
|---------|--------|----------|
| BUILD_PROOF présent | ✅/❌ | OUI |
| BUILD_PROOF signé | ✅/❌ | OUI |
| SCOPE.md présent | ✅/❌ | OUI |
| ARCHITECTURE.md présent | ✅/❌ | OUI |
| GUARDIAN.md présent | ✅/❌ | OUI |
| Tests unitaires passent | ✅/❌ | OUI |
| Tests intégration passent | ✅/❌ | OUI |
| API conforme | ✅/❌ | OUI |
| SQL migrations OK | ✅/❌ | OUI |
| Read models SQL | ✅/❌ | OUI |

### Règles absolues

- ❌ **NON DÉPLOYABLE** sans BUILD_PROOF
- ❌ **NON VALIDABLE** sans SCOPE.md
- ❌ **NON ACCEPTÉ** sans ARCHITECTURE.md

---

## 🏁 STATUT DU TEMPLATE

| Attribut | Valeur |
|----------|--------|
| Nom | SPOFE Module Template |
| Version | v1.0.0 |
| Source | Golden Module Immobilisation |
| Autorité | Gouvernance SPOFE |
| Date | 2026-02-02 |

---

## ✅ CE QUE CE TEMPLATE GARANTIT

| Bénéfice | Description |
|----------|-------------|
| **Zéro ambiguïté** | Structure identique pour tous les modules |
| **Réplicabilité totale** | Copier, renommer, adapter |
| **Gouvernance automatisée** | Validation automatique via BUILD_PROOF |
| **Scalabilité des modules** | Ajout de modules sans friction |
| **Industrialisation de SPOFE** | Factory-ready |

---

## 📋 UTILISATION POUR NOUVEAU MODULE

### Étape 1 : Copier le template

```bash
cp -r cascade/modules/immobilisation cascade/modules/stock
```

### Étape 2 : Renommer les fichiers

```bash
cd cascade/modules/stock
find . -name "*immobilisation*" -exec rename 's/immobilisation/stock/' {} \;
```

### Étape 3 : Adapter le contenu

- Remplacer `immobilisation` → `stock` dans tous les fichiers
- Adapter les invariants métier
- Adapter les commandes/events
- Adapter les read models SQL

### Étape 4 : Générer BUILD_PROOF

```bash
node tools/build-proof/generate-build-proof.ts
node tools/build-proof/sign-build-proof.ts
```

### Étape 5 : Valider SPOFE

```bash
node tools/validate-module/spofe-validate-module.ts
```

---

## 🔗 RÉFÉRENCES

- Golden Module : `cascade/modules/immobilisation/`
- Outils SPOFE : `spofe/tools/`
- Gouvernance : `spofe/governance/`

---

**Document officiel SPOFE — Non modifiable sans processus gouvernance**  
_ Template v1.0.0 — Généré le 2026-02-02_
