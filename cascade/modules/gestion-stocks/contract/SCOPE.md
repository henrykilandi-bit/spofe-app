# MODULE GESTION-STOCKS — SCOPE v1.0.0

## 1. RÔLE DU MODULE

Le module Gestion-Stocks est responsable de la traçabilité et de l'état des
quantités physiques de biens d'une entreprise, sur la base exclusive de
documents validés.

Il constitue la source de vérité physique des stocks.

## IN SCOPE

- Gestion multi-tenant
- Gestion multi-dépôts
- Dépôt par défaut par tenant
- Produits stockables
- Catégories de stock (physiques)
- Documents de stock
- Mouvements physiques (entrée, sortie, transfert, ajustement)
- Traçabilité complète et append-only
- Read-models de consultation
- API GET uniquement
- Guardian central (invariants physiques et documentaires)

## OUT OF SCOPE

- Valorisation des stocks (FIFO, CMUP, etc.)
- Calcul de coûts
- Comptabilisation
- Budgets
- Prévisions
- Optimisation
- MRP
- Réapprovisionnement automatique

## 5. SÉPARATION COMPTABLE

Ce module est strictement référentiel-agnostique.
Il ne contient aucune notion de plan de comptes, de valorisation ou de
logique comptable.

Les faits exposés sont destinés à être interprétés par des modules
comptables dédiés, conformément aux chartes SPOFE P0.

## 6. GOUVERNANCE

- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : CONTRACTUEL — GELÉ
