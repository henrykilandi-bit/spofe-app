# CONTRACT.md
## Module Trésorerie Caisse — SPOFE v1.0.0

### 1. Objet du contrat

Le présent contrat définit les **responsabilités, règles non négociables, interfaces, et limites fonctionnelles** du module Trésorerie Caisse dans le système SPOFE.

Ce module est une **brique factuelle du socle économique SPOFE**.  
Il est conçu pour être **audit-proof, traçable, et indépendant** de toute interprétation comptable.

### 2. Responsabilité du module

Le module Trésorerie Caisse est **responsable de** :

- la **traçabilité des flux physiques d'espèces**
- la **gestion des documents électroniques de caisse**
- le **contrôle des ouvertures, mouvements et clôtures**
- la **conservation append-only des faits**
- l'**exposition d'états de lecture fiables**

👉 Le module est une **source de vérité physique**, pas financière.

### 3. Gouvernance & référentiel

Le module est régi par la **gouvernance SPOFE P0**.

- **Référentiel comptable par défaut :** OHADA
- **Référentiels alternatifs :** via adapters (PCG, IFRS, etc.)
- Le **core du module est référentiel-agnostique**

**Référence normative obligatoire :**  
`cascade/governance/accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`

### 4. Principe fondamental (non négociable)

**Aucun mouvement de trésorerie caisse n'existe sans document électronique validé et signé.**

Les documents :

- sont **créés et remplis dans la plateforme SPOFE**
- sont **validés par un acteur SPOFE identifié**
- sont **signés électroniquement**
- deviennent **immuables après signature**
- sont **conservés en append-only**

**Toute violation de ce principe est rejetée par le Guardian Trésorerie Caisse.**

### 5. Éléments gérés par le module (IN SCOPE)

#### 5.1 Faits gérés

- Encaissements en espèces
- Décaissements en espèces
- Apports de fonds
- Sorties de caisse
- Avances et remboursements en espèces
- Constats d'écarts de caisse

#### 5.2 Documents contractuels obligatoires

Les documents suivants existent **obligatoirement** :

- Document d'ouverture de caisse
- Document de mouvement de caisse (entrée / sortie espèces)
- Document de clôture de caisse
- Document de constat d'écart de caisse

**Chaque document :**

- possède un état (draft, validated, signed)
- est rattaché à un tenantId
- est validé par un actorId
- est signé électroniquement avant tout impact sur l'état de la caisse

#### 5.3 Caisse & organisation

- Gestion d'une ou plusieurs **caisses physiques**
- **Fonds de caisse** déclaré
- **Solde théorique** calculé par agrégation des faits
- **Solde réel** saisi lors de la clôture
- **Écart constaté** comme fait factuel

### 6. Ce que le module NE FAIT PAS (OUT OF SCOPE)

Le module Trésorerie Caisse ne fait **explicitement pas** :

- ❌ génération d'écritures comptables
- ❌ calculs comptables ou financiers
- ❌ lettrage ou contreparties
- ❌ rapprochements bancaires
- ❌ gestion des chèques, cartes, virements
- ❌ prévision de trésorerie
- ❌ statistiques avancées
- ❌ multi-devises
- ❌ intégration matérielle (TPE, imprimantes)
- ❌ conformité fiscale spécifique (caisse certifiée)

👉 Ces responsabilités relèvent d'**autres modules** ou de **versions ultérieures**.

### 7. Règles contractuelles NON NÉGOCIABLES

- **Aucun mouvement** sans document validé et signé
- **Aucun document** sans acteur identifié
- **Aucune modification** d'un document signé
- **Aucune suppression** de faits (append-only)
- **Aucune opération** hors période ouverte
- **Aucune opération** cross-tenant
- **Aucune écriture comptable** produite par le module

**Toute violation est rejetée par le Guardian.**

### 8. Interfaces inter-modules (exposition uniquement)

Le module Trésorerie Caisse :

**Expose :**
- les mouvements d'espèces
- les soldes de caisse
- les écarts constatés
- les journaux de caisse

**N'écrit jamais dans :**
- Comptabilité
- Précomptabilité
- Banque
- Ventes
- Achats

👉 Le module **expose**, il ne synchronise pas.

### 9. Read-models contractuels

Le module fournit des modèles de lecture **GET uniquement** :

- Journal de caisse
- État de caisse à date
- Historique des ouvertures / clôtures
- Historique des mouvements
- Liste des écarts de caisse

Ces read-models sont :
- **reconstruisibles**
- basés uniquement sur les **événements**
- **sans logique métier**

### 10. Append-only & auditabilité

Tous les événements du module :

- sont **horodatés**
- sont **signés logiquement** (acteur)
- sont **conservés sans altération**
- sont **auditables a posteriori**

👉 L'historique est **inviolable**.

### 11. Versionnement & gel

```
CONTRACT STATUS
────────────────────────────────
Module        : Trésorerie Caisse
Version       : v1.0.0
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON (v1)
────────────────────────────────
```

Toute évolution fonctionnelle nécessite :

- une **nouvelle version** du module
- un **nouveau contrat**
- un **nouveau BUILD_PROOF**

### 12. Clause finale

Le présent contrat est **opposable à toute implémentation** du module Trésorerie Caisse.

Aucune implémentation, test ou intégration ne peut déroger aux règles définies ci-dessus sans rompre la **gouvernance SPOFE**.
