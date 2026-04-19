# GESTION-STOCKS — GUARDIAN v1.0.0 (P0)

## PRINCIPE

Toute violation d'un invariant entraîne un rejet immédiat.
Aucune tolérance, aucun fallback.

## INVARIANTS

- GS01 : Isolation stricte par tenant
- GS02 : Quantités strictement positives ou nulles
- GS03 : Référence produit obligatoire
- GS04 : Mouvement documenté
- GS05 : Append-only strict
- GS06 : Entrée avant sortie
- GS07 : Solde cohérent
- GS08 : Acteur SPOFE requis
- GS09 : Tout mouvement est rattaché à un document validé
- GS10 : Tout document validé a un actorId
- GS11 : Quantité strictement différente de zéro
- GS12 : Stock négatif interdit
- GS13 : Dépôt obligatoire (dépôt par défaut autorisé)
- GS14 : Lots séries requis uniquement si activés
- GS15 : Aucun mouvement cross-dépôt sans transfert
- GS16 : Aucune information comptable présente
- GS17 : Aucune logique de valorisation ou de coût

## SANCTION

Toute violation entraîne :
- rejet de la commande
- aucun événement émis
- aucune persistance

## STATUT

- Module : gestion-stocks
- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : ACTIF
