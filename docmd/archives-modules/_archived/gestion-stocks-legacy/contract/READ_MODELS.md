# MODULE STOCK — READ MODELS

**Module:** gestion-stocks  
**Version:** v1.0.0  
**Statut:** OFFICIEL — Normatif  
**Pattern:** CQRS strict — Read-only projections  

---

## 🎯 Principe fondamental

Les Read Models du module Stock sont :

- strictement **en lecture seule**
- alimentés **exclusivement par des Events**
- dépourvus de toute logique métier
- utilisés pour la consultation, le reporting et l'exposition API

Toute tentative d'introduire :
- des règles métier
- des calculs financiers
- des validations
dans un Read Model constitue une **violation SPOFE P0**.

---

## 📊 LISTE DES READ MODELS OFFICIELS

Le module Stock expose obligatoirement les vues suivantes :

1. Stock par dépôt  
2. Stock par catégorie  
3. Stock par produit  
4. Historique des mouvements de stock  

Aucune autre vue n'est autorisée en v1.0.0.

---

## 🏬 READ MODEL 1 — Stock par dépôt

### 🎯 Finalité
Fournir l'état courant des quantités physiques par dépôt.

### 📄 Vue SQL contractuelle

```sql
CREATE VIEW view_stock_by_depot AS
SELECT
    tenant_id,
    depot_id,
    product_id,
    category,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY
    tenant_id,
    depot_id,
    product_id,
    category;
```

### 🔍 Utilisation

- Consultation des niveaux de stock par dépôt
- Détection de ruptures
- Exposition API GET

---

## 🏷️ READ MODEL 2 — Stock par catégorie

### 🎯 Finalité
Analyser les volumes physiques par catégorie de stock.

### 📄 Vue SQL contractuelle

```sql
CREATE VIEW view_stock_by_category AS
SELECT
    tenant_id,
    category,
    product_id,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY
    tenant_id,
    category,
    product_id;
```

### 🔍 Utilisation

- Analyse par type de stock
- Support aux alertes de seuil
- Lecture par modules externes (Budget)

---

## 📦 READ MODEL 3 — Stock par produit

### 🎯 Finalité
Donner une vision consolidée du stock par produit, tous dépôts confondus.

### 📄 Vue SQL contractuelle

```sql
CREATE VIEW view_stock_by_product AS
SELECT
    tenant_id,
    product_id,
    SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY
    tenant_id,
    product_id;
```

### 🔍 Utilisation

- Vision globale produit
- Exposition API GET
- Support aux modules consommateurs

---

## 🔁 READ MODEL 4 — Historique des mouvements

### 🎯 Finalité
Assurer une traçabilité complète et chronologique des mouvements de stock.

### 📄 Vue SQL contractuelle

```sql
CREATE VIEW view_stock_movements AS
SELECT
    movement_id,
    tenant_id,
    depot_id,
    product_id,
    category,
    movement_type,
    quantity,
    document_id,
    occurred_at
FROM stock_movements
ORDER BY occurred_at ASC;
```

### 🔍 Utilisation

- Audit
- Contrôle interne
- Investigation
- Justification réglementaire

---

## 🔗 SOURCE DE DONNÉES

Tous les Read Models sont alimentés exclusivement par la table :

**`stock_movements`**

Cette table :
- est append-only
- est générée uniquement via Events
- ne peut pas être modifiée manuellement

---

## 🚫 INTERDICTIONS ABSOLUES

Les Read Models ne doivent contenir :

- aucune logique métier
- aucun calcul de coût
- aucun prix
- aucune valorisation financière
- aucune règle de validation
- aucune écriture

Toute violation invalide le BUILD_PROOF.

---

## 📊 CONTRAINTES DE QUALITÉ

- Vues déterministes
- Temps de réponse cible : **< 50 ms p95**
- Indexation assurée au niveau infrastructure
- Aucun trigger métier autorisé

---

## 🧨 SANCTION

Toute modification non contractuelle d'un Read Model :

- rend le module **NON CONFORME**
- invalide le BUILD_PROOF
- bloque toute release

---

**Fin du document — READ MODELS Stock v1.0.0**
