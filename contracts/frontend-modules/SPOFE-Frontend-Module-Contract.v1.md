# 📜 SPOFE – Frontend Module Contract

**Module Frontend SPOFE-clean**

**Version :** 1.0.0  
**Statut :** ACTIVE  
**Date :** 2026-01-30  
**Portée :** Tous les modules frontend SPOFE

---

## 0. Préambule (engagement)

Ce document définit le **contrat officiel et obligatoire** que doit respecter tout module frontend intégré dans l'écosystème SPOFE.

Ce contrat est :

- **normatif** (non optionnel)
- **opposable en revue et en CI**
- **versionné**
- **aligné avec le Kernel SPOFE et le contrat frontend-backend**

👉 **Aucun développement de module frontend n'est autorisé hors de ce cadre.**

---

## 1. Définition

### 1.1 Module Frontend SPOFE-clean

Un Module Frontend SPOFE-clean est une unité frontend qui :

- consomme **exclusivement** des read-models SPOFE
- émet **exclusivement** des Commands SPOFE
- ne contient **aucune** logique métier
- ne possède **aucune** autorité décisionnelle
- est **gouvernée par contrat**

### 1.2 Statut du présent document

Ce document constitue :

- un **contrat d'intégration**
- une **norme structurelle**
- une **référence SPOFE officielle**

Tout module non conforme est **refusé, sans exception**.

---

## 2. Champ d'application

Ce contrat s'applique à :

- tous les modules frontend **existants**
- tous les modules frontend **nouveaux**
- toute contribution **interne ou externe**

👉 **Il n'existe aucun mode "dérogatoire".**

---

## 3. Principes fondamentaux (non négociables)

### P1 — Le frontend n'est jamais une autorité

Le frontend :

- ne valide **pas** le métier
- ne décide **pas**
- ne corrige **pas** une décision backend

### P2 — SPOFE Backend est l'unique source de vérité

Toute vérité métier :

- est décidée par le **backend**
- est validée par **Guardian**
- est fournie au frontend sous forme de **read-model**

### P3 — Toute interaction est contractuelle

Le frontend :

- ne consomme que des **endpoints OpenAPI déclarés**
- n'émet que des **Commands listées**
- respecte **strictement** le contrat versionné

---

## 4. Structure obligatoire d'un module

Tout module frontend **DOIT** respecter exactement l'arborescence suivante :

```
modules/
└─ <module-name>/
   ├─ module.manifest.md
   ├─ index.ts
   │
   ├─ api/
   │  └─ module.api.ts
   │
   ├─ ui/
   │  ├─ ModuleView.tsx
   │  └─ module.ui.ts
   │
   ├─ routes/
   │  └─ module.routes.ts
   │
   ├─ hooks/
   │  └─ useModuleUI.ts
   │
   └─ tests/
      └─ module.contract.spec.ts
```

❌ **Toute structure différente est non conforme.**

---

## 5. Responsabilités autorisées

### 5.1 API (api/)

- appels **exclusifs** via le Frontend Contract Enforcer
- **aucun** fetch, Axios, ou client réseau direct
- **aucun** calcul
- **aucun** mapping métier

### 5.2 UI (ui/)

- affichage
- gestion UX
- gestion erreurs sans interprétation
- déclenchement d'intentions utilisateur

### 5.3 Hooks (hooks/)

- état UI local uniquement
- sélection, pagination, filtres visuels

❌ **Interdiction formelle :**

- logique métier
- calculs métier
- reconstitution d'état

### 5.4 Routes (routes/)

- routes = vues
- aucune logique métier
- aucune redirection conditionnelle métier

---

## 6. Interdictions absolues

Un module frontend SPOFE-clean **NE DOIT JAMAIS** :

- appeler `fetch()` directement
- utiliser Axios ou équivalent
- implémenter une règle métier
- stocker une donnée métier localement
- recalculer un statut
- contourner le contrat frontend-backend
- contourner Guardian
- accéder directement à la base de données
- inférer une autorité ou un rôle

**Toute violation est bloquante.**

---

## 7. Frontend Contract Enforcer (obligatoire)

Tout module :

- **DOIT** passer par le Frontend Contract Enforcer
- **NE PEUT PAS** fonctionner sans contrat chargé
- **DOIT** échouer si le contrat est absent ou invalide

👉 **Le contrat est une dépendance vitale du module.**

---

## 8. Tests contractuels (obligatoires)

Chaque module **DOIT** fournir des tests qui vérifient :

- qu'une Command non listée est refusée
- qu'un endpoint non contractuel est refusé
- que le module échoue sans bootstrap du contrat

❌ **Pas de tests contractuels → module refusé.**

---

## 9. module.manifest.md (obligatoire)

Chaque module **DOIT** déclarer explicitement :

- son objectif
- les read-models consommés
- les Commands émises
- les invariants Guardian impactants (informationnels)
- la version du template utilisée

👉 **Sans manifest : pas d'intégration.**

---

## 10. Versionnement et compatibilité

Ce contrat est **versionné**

La version 1.0.0 constitue la **baseline SPOFE**

Toute évolution :

- est **versionnée**
- est **documentée**
- n'est **jamais** silencieuse

Les modules **DOIVENT** déclarer la version du contrat qu'ils implémentent.

---

## 11. Gouvernance et contrôle

- Toute PR frontend est évaluée à l'aune de ce contrat
- La CI **DOIT** bloquer toute non-conformité
- Aucune exception humaine n'est acceptée

👉 **La gouvernance est structurelle, pas sociale.**

---

## 12. Clause finale (engagement)

En intégrant un module frontend dans SPOFE,
le contributeur reconnaît :

- avoir pris connaissance de ce contrat
- s'engager à le respecter intégralement
- accepter le refus de toute intégration non conforme

---

## 13. Signature (référence)

**SPOFE Frontend Module Contract – v1.0.0**  
Document de référence officiel.

---

## 📍 Emplacement et gouvernance

### 👉 Ce contrat ne vit PAS dans un module frontend
### 👉 Il ne vit PAS dans le backend non plus
### 👉 Il vit au niveau racine de la gouvernance SPOFE

---

## ✅ Emplacement recommandé (normatif)

```
/contracts
├─ frontend-backend/
│  ├─ contract.v1.yaml
│  ├─ rules.v1.md
│  ├─ allowed-commands.v1.json
│  └─ allowed-read-models.v1.json
│
├─ frontend-modules/
│  ├─ SPOFE-Frontend-Module-Contract.v1.md   👈 ICI
│  └─ CHANGELOG.md
│
└─ README.md
```

### 📌 Nom exact conseillé :
```
contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md
```

### 👉 Pourquoi ?

- ✔️ visibilité maximale
- ✔️ séparation claire des responsabilités
- ✔️ gouvernance transversale (frontend et backend s'y réfèrent)

---

## 🧠 Rôle exact de ce contrat dans l'écosystème SPOFE

Ce document **n'est pas un doublon** du contrat frontend-backend.
Il est **complémentaire** et c'est très bien.

### 🧩 Positionnement clair

| Contrat | Rôle |
|---------|------|
| **Frontend–Backend Contract** | Définit ce qui peut être appelé |
| **Frontend Module Contract** | Définit comment un module frontend doit être structuré et se comporter |
| **Kernel vs Modules** | Définit qui a le droit d'exister |

👉 Ce document est donc :

- un **contrat d'intégration**
- un **contrat de structure**
- un **contrat de comportement frontend**

**C'est exactement ce qu'il fallait.**

---

## 🧱 Pourquoi ce contrat ne doit PAS être ailleurs

### ❌ Pas dans un module frontend

Sinon :
- il devient optionnel
- il peut être ignoré
- il perd son caractère opposable

### ❌ Pas dans /docs

Sinon :
- il devient "informatif"
- il n'est plus normatif
- la CI ne peut pas s'y référer clairement

### ❌ Pas dans le backend

Sinon :
- confusion des responsabilités
- frontend vu comme "sous-produit"

👉 **Le dossier /contracts est le seul endroit légitime.**

---

## 🧪 Lien avec la CI (important)

Une fois placé ici, ce contrat peut être **réellement appliqué** :

La CI frontend peut :
- vérifier la structure des modules
- refuser un module sans `module.manifest.md`
- vérifier la version du contrat déclarée

Les revues peuvent dire :
- "Non conforme au contrat frontend-modules v1"

👉 **Ce n'est plus un texte : c'est une règle du système.**

---

## ✅ Validation du contenu

Sur le fond, ce contrat est :

- ✔️ **cohérent avec le Kernel SPOFE**
- ✔️ **cohérent avec le Frontend Contract Enforcer**
- ✔️ **cohérent avec OpenAPI contract-first**
- ✔️ **suffisamment strict** (et c'est voulu)
- ✔️ **exploitable en CI**

👉 Aucune section n'est à retirer.  
👉 Aucune règle n'est abusive.

**C'est exactement le niveau attendu pour SPOFE.**

---

## 📋 Références et utilisation

Ce contrat est **versionné, normatif, opposable** et doit être **référencé par** :

- la CI
- les manifests de modules
- les revues PR

**Version active :** 1.0.0  
**Date de publication :** 2026-01-30  
**Autorité responsable :** Gouvernance SPOFE
