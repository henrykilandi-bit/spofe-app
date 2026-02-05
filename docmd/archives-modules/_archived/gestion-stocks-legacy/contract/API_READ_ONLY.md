# MODULE STOCK — API READ ONLY

**Module:** gestion-stocks  
**Version:** v1.0.0  
**Statut:** OFFICIEL — Normatif  
**Type:** API REST — Lecture seule (GET)  

---

## 🎯 Principe fondamental

L'API du module Stock est **strictement en lecture seule**.

- Aucun endpoint POST, PUT, PATCH ou DELETE n'est autorisé
- Toute mutation passe exclusivement par le mécanisme **Commands / Events**
- L'API consomme uniquement les **Read Models contractuels**

Toute violation de cette règle constitue une **violation SPOFE P0**.

---

## 🔐 RÈGLES DE SÉCURITÉ ET D'ISOLATION

- Toutes les requêtes sont **scopées par tenant**
- Aucun accès cross-tenant n'est autorisé
- Le `tenantId` est injecté par le contexte d'authentification
- Aucun `tenantId` ne peut être fourni manuellement dans les paramètres

---

## 📊 ENDPOINTS OFFICIELS — v1.0.0

### 🏬 GET — Stock par dépôt

**Endpoint**

```
GET /api/stocks/depot/{depotId}
```

**Description**  
Retourne l'état courant des quantités physiques pour un dépôt donné.

**Source**
- Read Model : `view_stock_by_depot`

**Paramètres**
- `depotId` (path, obligatoire)

**Réponse**
- productId
- category
- totalQuantity

---

### 🏷️ GET — Stock par catégorie

**Endpoint**

```
GET /api/stocks/category/{category}
```

**Description**  
Retourne les quantités physiques par catégorie de stock.

**Source**
- Read Model : `view_stock_by_category`

**Paramètres**
- `category` (path, obligatoire)

---

### 📦 GET — Stock par produit

**Endpoint**

```
GET /api/stocks/product/{productId}
```

**Description**  
Retourne la quantité totale d'un produit, tous dépôts confondus.

**Source**
- Read Model : `view_stock_by_product`

**Paramètres**
- `productId` (path, obligatoire)

---

### 🔁 GET — Historique des mouvements

**Endpoint**

```
GET /api/stocks/movements
```

**Description**  
Retourne l'historique chronologique des mouvements de stock.

**Source**
- Read Model : `view_stock_movements`

**Filtres optionnels**
- depotId
- productId
- category
- movementType
- dateFrom
- dateTo

---

### 🚨 GET — Alertes de stock (seuils simples)

**Endpoint**

```
GET /api/stocks/alerts
```

**Description**  
Expose les alertes simples liées aux seuils de stock (lecture seule).

**Source**
- Read Models dérivés
- Aucune logique de calcul complexe

---

## 📄 FORMAT DE RÉPONSE (STANDARD)

Toutes les réponses respectent le format suivant :

```json
{
  "data": [],
  "metadata": {
    "module": "gestion-stocks",
    "version": "v1.0.0",
    "generatedAt": "ISO-8601"
  }
}
```

---

## 🚫 INTERDICTIONS ABSOLUES

L'API Stock interdit formellement :

- toute mutation
- tout calcul de coût
- toute valorisation financière
- toute logique métier
- toute écriture en base
- toute modification d'état

---

## 📊 CONTRAINTES DE PERFORMANCE

- Temps de réponse cible : **< 100 ms p95**
- Pagination obligatoire pour les listes volumineuses
- Indexation assurée par l'infrastructure

---

## 🧨 SANCTION

Toute tentative de :

- mutation via API
- ajout d'un endpoint non GET
- contournement des Read Models

entraîne :

- rejet de la validation
- BUILD_PROOF invalide
- blocage de release

---

**Fin du document — API READ ONLY Stock v1.0.0**
