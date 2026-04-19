# BUILD_PROOF — MODULE PRÉCOMPTABILITÉ v1.0.0

## RESPONSABILITÉ CERTIFIÉE

Le module Précomptabilité est responsable de la capture, qualification,
validation et exposition de documents financiers, en amont de la comptabilité.

## CE QUE LE MODULE FAIT

- Gère des documents financiers (factures, reçus, notes de frais)
- Applique des workflows de validation
- Enrichit des champs factuels
- Expose des read-models documentaires
- Fournit une API GET read-only

## CE QUE LE MODULE NE FAIT PAS

- Aucune écriture comptable
- Aucune fiscalité
- Aucun paiement
- Aucune décision automatique
- Aucun calcul métier

## ARCHITECTURE

- CQRS strict
- Guardian central
- Application Layer déterministe
- Read-models projetés
- API GET uniquement

## TESTS

- Guardian : 100 %
- E2E : PASS
- Isolation tenant : OK

## STATUT

Module certifié — prêt pour intégration système
