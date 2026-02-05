# 📘 CONTRACT — MODULE IMMOBILISATION v1.0.0
## SPOFE Platform

---

## 1. Objet du document

Le présent document définit le **contrat fonctionnel, métier et technique** du **module Immobilisation** de la plateforme SPOFE.

Il constitue la **référence canonique** pour :
- la conception,
- l'implémentation,
- les tests,
- l'intégration inter-modules.

Toute fonctionnalité non explicitement décrite dans ce document est **hors périmètre** de la version v1.0.0.

---

## 2. Rôle du module Immobilisation dans SPOFE

Le module Immobilisation est le **registre patrimonial unique de vérité** pour l'ensemble des actifs immobilisés d'une entreprise (tenant).

Il est responsable de :
- la gestion du cycle de vie des immobilisations (acquisition → amortissement → sortie),
- le calcul et l'historisation des amortissements,
- la traçabilité des coûts réels liés aux actifs,
- l'alimentation contractuelle des modules **Cost-Structure** et **Budget**.

📌 Le module Immobilisation :
- **ne décide pas** de la rentabilité,
- **ne fait pas** de simulation financière avancée,
- **ne recalcule pas** les coûts métier des autres modules.

---

## 3. Périmètre fonctionnel — v1.0.0

### 3.1 Gestion des immobilisations (cœur patrimonial)

Le module permet :
- l'enregistrement des immobilisations avec :
  - coût d'acquisition,
  - date d'acquisition,
  - durée de vie,
  - méthode d'amortissement (linéaire),
  - valeur résiduelle,
- la génération d'un identifiant unique d'immobilisation,
- la gestion du statut :
  - en service,
  - cédé,
  - déclassé.

Chaque immobilisation est rattachée à un **tenant unique**.

---

### 3.2 Calcul des amortissements

Le module assure :
- le calcul des dotations d'amortissement :
  - par immobilisation,
  - par période (mensuelle / annuelle),
- l'historisation complète et immuable des dotations,
- le calcul de la **valeur nette comptable (VNC)** à chaque période.

📌 Les calculs d'amortissement sont **exclusivement réalisés dans le Guardian Immobilisation**.  
📌 Aucun calcul métier n'est effectué dans les read-models SQL.

---

### 3.3 Date de renouvellement des équipements

Le module permet :
- la gestion d'une **date de renouvellement prévisionnelle** par immobilisation,
- l'enregistrement d'un **coût estimatif de remplacement**,
- l'historisation des modifications de ces données.

📌 La date de renouvellement :
- n'entraîne **aucune écriture d'amortissement**,
- ne constitue **pas une immobilisation tant que l'acquisition n'est pas réalisée**,
- sert uniquement à la **projection budgétaire**.

---

### 3.4 Affectation des immobilisations

Le module permet :
- l'affectation des immobilisations :
  - aux produits,
  - aux services,
  - aux projets économiques,
- la définition de clés de répartition explicites,
- l'historisation des changements d'affectation.

📌 Cette affectation constitue le **point de liaison contractuel** avec le module Cost-Structure.

---

### 3.5 Suivi des coûts réels de maintenance / réparation / entretien

Le module permet :
- l'enregistrement des interventions réelles sur une immobilisation :
  - maintenance,
  - réparation,
  - entretien,
- pour chaque intervention :
  - date,
  - type,
  - description,
  - coût réel,
  - intervenant (interne / externe).

📌 Ce suivi :
- n'est **pas prédictif**,
- n'est **pas planifié**,
- ne modifie **ni la durée de vie ni la valeur amortissable**,
- permet de mesurer le **coût réel de possession**.

---

### 3.6 Cession et déclassement

Le module permet :
- l'enregistrement de la sortie d'une immobilisation :
  - cession,
  - déclassement,
- le calcul automatique :
  - de la valeur nette comptable à la date de sortie,
  - des plus-values ou moins-values,
- l'archivage définitif de l'actif.

---

## 4. Hors périmètre explicite — v1.0.0

Sont explicitement exclus de cette version :
- amortissement dégressif,
- maintenance prédictive ou préventive,
- planification des interventions,
- inventaire mobile (QR Code, RFID),
- analytics avancés et simulations multi-scénarios,
- gestion avancée des garanties et contrats.

Toute inclusion future implique une **nouvelle version majeure**.

---

## 5. Modèle de domaine (vue contractuelle)

### 5.1 Aggregate racine : Immobilisation (Asset)

Responsabilités :
- représenter un actif patrimonial,
- porter les règles d'amortissement,
- servir de source officielle des dotations.

---

### 5.2 Sous-ensembles métier

- **DepreciationRecord** : dotations d'amortissement historisées
- **AssetAllocation** : ventilation par produit / projet
- **MaintenanceRecord** : coûts réels liés à l'actif

---

## 6. Invariants métier (extraits non exhaustifs)

- Une immobilisation cédée est **immutable**.
- Une immobilisation ne peut pas être amortie après sa sortie.
- La valeur nette comptable est toujours ≥ 0.
- La somme des affectations d'une immobilisation est toujours = 100 %.
- Une intervention de maintenance ne modifie jamais l'amortissement.

---

## 7. Contrats inter-modules

### 7.1 Immobilisation → Cost-Structure

Le module Immobilisation expose :
- les dotations d'amortissement,
- ventilées par produit / projet,
- via des read-models SQL et des API GET read-only.

📌 Le module Cost-Structure **consomme ces données sans jamais les recalculer**.

---

### 7.2 Immobilisation → Budget

Le module Immobilisation expose :
- les dates de renouvellement prévues,
- les coûts estimatifs de remplacement,
- les coûts réels de maintenance agrégés.

Ces données servent à la **planification budgétaire**.

---

## 8. Sécurité et gouvernance

- Isolation stricte multi-tenant.
- Audit trail complet (création, modification, sortie).
- Aucune suppression physique des données.
- Contrôle d'accès basé sur les rôles.

---

## 9. Statut du document

- Version : **v1.0.0**
- Statut : **Contractuel**
- Évolutivité : **Version majeure requise**
- Dépendances :
  - Budget
  - Cost-Structure (COUTFLEX)

---

## 🧊 Déclaration officielle

Le module **Immobilisation v1.0.0** est défini, cadré et contractuellement prêt à être implémenté dans la plateforme SPOFE.

Toute implémentation doit être **strictement conforme** au présent contrat.
