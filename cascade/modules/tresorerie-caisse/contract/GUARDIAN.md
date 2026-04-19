# GUARDIAN.md
## Module Trésorerie Caisse — SPOFE v1.0.0

### 1. Rôle du Guardian Trésorerie Caisse

Le **Guardian Trésorerie Caisse** est responsable de garantir l'intégrité factuelle, documentaire et temporelle des opérations de caisse.

Il veille à ce que :

- seuls des **faits physiques valides** soient enregistrés,
- chaque fait soit porté par un **document électronique valide et signé**,
- la **séquentialité caisse** soit respectée,
- aucune opération ne viole la **gouvernance SPOFE P0**.

👉 Le Guardian est **bloquant** : toute violation entraîne un **rejet**.

### 2. Principes fondamentaux contrôlés

Le Guardian applique les principes suivants :

- **Document-first** : aucun fait sans document
- **Signature obligatoire** : aucun impact sans signature
- **Append-only** : aucun effacement ni modification
- **Séquentialité stricte** : ouverture → mouvements → clôture
- **Isolement tenant** : aucune opération cross-tenant
- **Traçabilité acteur** : toute action est imputable

## INVARIANTS

- TCA01 : Existence d'une caisse valide pour toute opération
- TCA02 : Ouverture préalable obligatoire avant mouvement
- TCA03 : Unicité de l'ouverture par période
- TCA04 : Montant strictement positif
- TCA05 : Append-only strict
- TCA06 : Workflow de validation respecté
- TCA07 : Référence caisse obligatoire
- TCA08 : Acteur SPOFE requis
- TCA09 : Solde caisse cohérent
- TCA10 : Mouvement caisse validé

#### 🧱 G04 — Document électronique obligatoire

Tout fait de trésorerie caisse doit être porté par :

- un **document électronique existant**,
- au statut **validated**,
- **signé électroniquement**.

Un document non signé ou en brouillon (draft) ne peut produire **aucun effet**.

#### 🧱 G05 — Identification de l'acteur

Tout document de caisse doit comporter :

- un **actorId valide**,
- correspondant à l'acteur ayant réalisé l'opération.

**Aucune opération anonyme** n'est autorisée.

#### 🧱 G06 — Séquentialité des opérations

Les opérations doivent respecter l'ordre suivant :

`OUVERTURE` → `MOUVEMENTS (0..n)` → `CLÔTURE`

- **Aucun mouvement** après clôture
- **Aucune clôture** sans ouverture préalable

#### 🧱 G07 — Période clôturée verrouillée

Une période de caisse clôturée est :

- **définitivement verrouillée**
- **non modifiable**
- **non réouvrable**

Toute tentative d'écriture sur une période clôturée est **rejetée**.

#### 🧱 G08 — Typologie valide des mouvements

Chaque mouvement de caisse doit :

- être **explicitement typé** (ENTRÉE ou SORTIE)
- correspondre à un **fait physique réel**
- porter un **montant strictement positif**

Les montants nuls ou négatifs sont **interdits**.

#### 🧱 G09 — Constat d'écart uniquement à la clôture

Un écart de caisse :

- ne peut être constaté qu'au **moment de la clôture**
- doit faire l'objet d'un **document dédié**
- est enregistré comme un **fait, sans interprétation**

#### 🧱 G10 — Isolation stricte par tenant

Tous les éléments suivants doivent appartenir au **même tenantId** :

- caisse
- documents
- opérations
- acteurs

Toute tentative cross-tenant est **rejetée**.

#### 🧱 G11 — Immutabilité post-signature

Un document de caisse signé :

- **ne peut plus être modifié**,
- **ne peut plus être annulé**,
- **ne peut plus être supprimé**.

Toute correction passe par un **nouveau document**.

#### 🧱 G12 — Aucune logique comptable

Le Guardian interdit toute tentative de :

- **génération d'écriture comptable**,
- **association à un compte comptable**,
- **calcul de solde comptable**.

Le Guardian protège le module contre toute **dérive interprétative**.

### 4. Décisions Guardian explicites

| Situation | Décision |
|-----------|----------|
| Mouvement sans document signé | ❌ **REJET** |
| Mouvement hors caisse ouverte | ❌ **REJET** |
| Document sans actorId | ❌ **REJET** |
| Modification après signature | ❌ **REJET** |
| Écart hors clôture | ❌ **REJET** |
| Tentative comptable | ❌ **REJET** |

### 5. Portée du Guardian

Le Guardian Trésorerie Caisse s'applique à :

- **toutes les commandes write**
- **tous les événements produits**
- **tous les tests Guardian**
- **tous les tests système**

👉 Il est **référence absolue** pour la validation métier.

### 6. Relation avec les autres modules

Le Guardian Trésorerie Caisse :

- **ne dépend** d'aucun autre module
- **n'appelle** aucun Guardian externe
- **expose uniquement** des faits validés

Les modules consommateurs sont **responsables** de leurs propres interprétations.

### 7. Tests Guardian (obligatoires)

Chaque invariant (G01 à G12) doit être couvert par :

- **au moins un test Guardian nominal**
- **au moins un test de rejet**

👉 **Aucun BUILD_PROOF** n'est possible sans couverture complète.

### 8. Statut du Guardian

```
GUARDIAN STATUS
────────────────────────────────
Module        : Trésorerie Caisse
Version       : v1.0.0
Invariants    : G01 → G12
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON
────────────────────────────────
```

### 9. Règle d'or Guardian

> **Si une opération viole un invariant,  
> l'opération est invalide, pas le Guardian.**
