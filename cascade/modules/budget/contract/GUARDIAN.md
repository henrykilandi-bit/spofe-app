# BUDGET — GUARDIAN v1.0.0 (P0)

## PRINCIPE

Le Guardian Budget garantit la cohérence, la complétude et la traçabilité
des budgets et de leurs hypothèses.

Aucune règle budgétaire ne peut exister hors Guardian.

## INVARIANTS

- BU01 : Isolation stricte par tenant
- BU02 : Période budgétaire valide
- BU03 : Montants strictement positifs
- BU04 : Version unique active
- BU05 : Append-only strict
- BU06 : Référence exercice obligatoire
- BU07 : Cohérence temporelle
- BU08 : Acteur SPOFE requis
- BU09 : Budget incomplet interdit
- BU10 : Hypothèses explicites obligatoires
- BU11 : Transitions d'état contrôlées
- BU12 : Données sources certifiées uniquement
- BU13 : Aucun calcul de coût
- BU14 : Aucune gestion de quantité
- BU15 : Aucune comptabilisation
- BU16 : Aucune décision automatique

## SANCTION

- Commande rejetée
- Aucun événement émis
- Aucun read-model mis à jour

## STATUT

- Module : budget
- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : ACTIF
