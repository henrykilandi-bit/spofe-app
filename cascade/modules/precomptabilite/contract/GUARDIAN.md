# PRÉCOMPTABILITÉ — GUARDIAN v1.0.0 (P0)

## PRINCIPE

Le Guardian Précomptabilité garantit la cohérence, la traçabilité
et la validité documentaire avant toute exposition inter-modules.

Aucune règle documentaire ne peut exister hors Guardian.

## INVARIANTS

- PR01 : Isolation stricte par tenant
- PR02 : Pièce justificative obligatoire
- PR03 : État document valide
- PR04 : Montant strictement positif
- PR05 : Append-only strict
- PR06 : Workflow de validation respecté
- PR07 : Référence tiers obligatoire
- PR08 : Acteur SPOFE requis

| Code | Invariant |
| ---- | --------- |
| P-01 | Isolation stricte par tenant |
| P-02 | Acteur SPOFE obligatoire |
| P-03 | Document obligatoire pour toute donnée exposée |
| P-04 | Document non modifiable (append-only) |
| P-05 | Statut valide requis pour exposition |
| P-06 | Workflow de validation respecté |
| P-07 | Champs factuels uniquement |
| P-08 | Aucune écriture comptable |
| P-09 | Aucune décision automatique |
| P-10 | Aucune fiscalité |
| P-11 | Traçabilité complète |

## SANCTION

- Commande rejetée
- Aucun événement émis
- Aucune donnée exposée

## STATUT

- Module : precomptabilite
- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : ACTIF
