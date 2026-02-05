# MODULE STOCK — CONTRACT

**Module:** gestion-stocks  
**Version:** v1.0.0  
**Statut:** OFFICIEL — Normatif  
**Type:** Contrat fonctionnel SPOFE  

---

## 🎯 Responsabilité du module Stock

Le module Stock est responsable de la **traçabilité, du contrôle et de l'état des quantités physiques** des biens d'une entreprise, exclusivement sur la base de **documents validés**, dans un environnement **multi-tenant** et **multi-dépôts**.

---

## 🧱 Responsabilités fonctionnelles

### 📦 Gestion des stocks physiques
- Suivi des quantités physiques
- Aucune valorisation financière
- Aucune interprétation comptable

### 🏷️ Catégories de stock
Les catégories conditionnent les règles de gestion et de suivi :

- Marchandises (achat → revente)
- Produits finis
- Matières premières
- Emballages perdus (consommables)
- Emballages récupérables (actifs à suivre)
- Autres stocks (fournitures, consommables)

---

### 🏬 Gestion des dépôts
- Stock rattaché obligatoirement à un dépôt
- Aucun mouvement hors dépôt
- Aucun mouvement inter-tenant

---

## 📄 Documents de stock (obligatoires)

Aucun mouvement de stock n'existe sans document préalable validé.

### Approvisionnement
- Bon de commande fournisseur
- Bon de réception
- Bon d'entrée en stock

### Sorties / consommation
- Bon de commande client
- Bon de livraison
- Bon de sortie de stock

### Transferts internes
- État de besoin
- Bon de transfert
- Bon de sortie (dépôt source)
- Bon d'entrée (dépôt destination)

### Inventaires
- Bon d'inventaire

---

## 🔁 Mouvements de stock

- Générés **uniquement** par validation documentaire
- Types :
  - Entrée
  - Sortie
  - Transfert
  - Ajustement d'inventaire
- Historique **append-only**
- Aucune modification rétroactive

---

## 🔐 Règles contractuelles NON NÉGOCIABLES

- Aucun mouvement sans document validé
- Aucun document validé sans acteur SPOFE identifié
- Aucun mouvement cross-tenant
- Aucun mouvement hors dépôt
- Aucune suppression d'historique
- Toute règle métier passe par le Guardian Stock

Toute violation est rejetée.

---

## 🔗 Interfaces inter-modules (lecture uniquement)

### Cost-Structure
- Quantités consommées
- Sorties par produit

### Budget
- Niveaux de stock
- Alertes de seuil
- Prévisions de rupture simples

👉 Le module Stock **expose**, il ne calcule pas.

---

## 📊 Exposition des données

- Read-models uniquement
- API REST **GET**
- Aucune mutation exposée

---

**Fin du document**
