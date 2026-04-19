# BUILD_PROOF — MODULE BUDGET v1.0.0

## RESPONSABILITÉ CERTIFIÉE
Le module Budget est responsable du pilotage et de la projection financière,
sur la base de données certifiées fournies par les modules tiers.

## CE QUE LE MODULE FAIT
- Crée et valide des budgets
- Projette des scénarios budgétaires
- Calcule des écarts prévisionnel / réel
- Expose des read-models budgétaires
- Fournit une API GET read-only

## CE QUE LE MODULE NE FAIT PAS
- Aucun calcul de coût
- Aucune gestion de quantité
- Aucune comptabilité
- Aucune décision automatique
- Aucune écriture financière

## ARCHITECTURE
- CQRS strict
- Guardian central
- Application Layer pure
- Read-models déterministes
- API GET uniquement

## TESTS
- Tests Guardian : OK
- Tests E2E : OK
- Isolation tenant : OK

## STATUT
Module certifié — prêt pour intégration système