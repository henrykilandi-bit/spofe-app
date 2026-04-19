# 🛡️ GUARDIAN.md — Module Trésorerie Banque — SPOFE v1.0.0

## 1. Rôle du Guardian Trésorerie Banque

Le Guardian Trésorerie Banque est l'**autorité de contrôle non négociable** du module.

Il garantit que tout fait bancaire enregistré :
- repose sur un document bancaire électronique valide,
- est factuel, constaté, non interprété,
- respecte l'isolation stricte (tenant / banque / compte),
- est traçable, immuable, append-only.

👉 **Aucune écriture bancaire ne peut exister sans validation préalable du Guardian.**

---

## 2. Principes fondamentaux (P0)

Le Guardian applique les principes suivants :

| Principe | Description |
|----------|-------------|
| **Guardian-first** | Aucune commande ne bypass le Guardian |
| **Document-first** | Pas de fait sans document bancaire |
| **Fact-only** | Aucun calcul, aucune interprétation |
| **Isolation absolue** | Pas de cross-tenant / cross-banque / cross-compte |
| **Immuabilité** | Aucun fait bancaire n'est modifiable |

> ❌ **Toute violation entraîne un rejet immédiat.**

---

## INVARIANTS

- TB01 : Compte bancaire obligatoire pour tout fait bancaire
- TB02 : Pièce justificative bancaire obligatoire
- TB03 : État document valide
- TB04 : Montant strictement positif
- TB05 : Append-only strict
- TB06 : Workflow de validation respecté
- TB07 : Référence banque obligatoire
- TB08 : Acteur SPOFE requis
- TB09 : Solde bancaire cohérent
- TB10 : Rapprochement bancaire validé

---

### 🏛️ G02 — Banque obligatoire

> Chaque compte bancaire est rattaché à une banque identifiée.

- un `bankAccountId` implique un `bankId`
- aucun mouvement bancaire sans banque explicite

---

### 🔐 G03 — Isolation par tenant

> Aucun fait bancaire cross-tenant n'est autorisé.

- `tenantId` obligatoire
- toute incohérence entre document, compte et tenant est rejetée

---

### 📄 G04 — Document bancaire obligatoire

> Aucun mouvement bancaire n'existe sans document bancaire électronique validé.

**Documents acceptés :**
- relevé bancaire
- avis de débit
- avis de crédit

❌ **Rejet si document manquant, non validé ou non électronique.**

---

### 🧾 G05 — Document bancaire immuable

> Un document bancaire validé ne peut jamais être modifié.

- aucun update
- aucun delete
- append-only strict

---

### 🔁 G06 — Faits bancaires constatés uniquement

> Le module Banque n'enregistre que des faits déjà constatés par la banque.

**Interdit :**
- émission de virement
- initiation de prélèvement
- simulation

**Autorisé :**
- constat de débit
- constat de crédit

---

### 🧮 G07 — Absence totale d'interprétation

> Le Guardian interdit toute interprétation comptable ou financière.

- pas de rapprochement
- pas de catégorisation
- pas de calcul d'agios
- pas de consolidation

---

### 🧱 G08 — Isolation par compte bancaire

> Aucun fait bancaire ne peut concerner plusieurs comptes.

- 1 fait = 1 compte bancaire
- aucune agrégation multi-comptes dans le core

---

### ⏱️ G09 — Temporalité bancaire respectée

> Les faits bancaires sont horodatés selon la date bancaire officielle.

- date issue du document bancaire
- pas de recalcul temporel
- pas de date "métier"

---

### 📊 G10 — Solde bancaire factuel uniquement

> Les soldes exposés sont strictement factuels.

- solde à date = solde du document bancaire
- aucun solde prévisionnel
- aucun solde disponible "calculé"

---

### 🧠 G11 — Aucune dépendance inter-module

> Le Guardian Banque est totalement autonome.

Aucune dépendance directe vers :
- Tiers
- Caisse
- Comptabilité
- Budget

👉 Les autres modules consomment les faits bancaires exposés.

---

### 🧊 G12 — Append-only & traçabilité totale

> Toute écriture bancaire est définitive et traçable.

- append-only
- horodatage obligatoire
- acteur technique identifié
- origine documentaire conservée

---

## 4. Décisions explicites du Guardian

Le Guardian **REFUSE** systématiquement :

- ❌ toute tentative de rapprochement bancaire
- ❌ toute écriture sans document
- ❌ toute modification d'un fait existant
- ❌ toute consolidation multi-comptes
- ❌ toute logique prévisionnelle
- ❌ toute logique d'optimisation ou d'IA

---

## 5. Tests Guardian obligatoires

Chaque invariant **G01 → G12** DOIT disposer :
- d'au moins **1 test de succès**
- d'au moins **1 test de rejet**

👉 **Aucun BUILD_PROOF n'est possible sans 100 % de couverture Guardian.**

---

## 6. Statut du Guardian

```
GUARDIAN STATUS
────────────────────────────────
Module        : Trésorerie Banque
Version       : v1.0.0
Invariants    : G01 → G12
Niveau        : SPOFE P0
Mutable       : NON
────────────────────────────────
```

---

## 7. Clause de gel

À partir de la certification BUILD_PROOF v1.0.0 :

- ❄️ **aucun invariant ne pourra être modifié**
- toute évolution nécessitera :
  - une nouvelle version,
  - un nouveau Guardian,
  - un nouveau BUILD_PROOF.
