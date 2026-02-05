# COST-STRUCTURE — GUARDIAN v1.0.0 (P0)

## PRINCIPE

Le Guardian Cost-Structure garantit la cohérence,
la complétude et la traçabilité des structures de coûts.

Aucun coût ne peut être calculé ou exposé hors Guardian.

## INVARIANTS

| Code | Invariant |
| ---- | --------- |
| CS-01 | Isolation stricte par tenant |
| CS-02 | Sources certifiées obligatoires |
| CS-03 | Aucune création de quantité |
| CS-04 | Aucune dépendance au prix |
| CS-05 | Coût incomplet interdit |
| CS-06 | Clé de répartition valide (0..1) |
| CS-07 | Somme des clés = 1 |
| CS-08 | Aucun calcul comptable |
| CS-09 | Aucun calcul fiscal |
| CS-10 | Aucune décision métier |
| CS-11 | Append-only |
| CS-12 | Méthode de calcul explicite |

## SANCTION

- Commande rejetée
- Aucun événement émis
- Aucun read-model mis à jour

## STATUT

- Module : cost-structure
- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : ACTIF
