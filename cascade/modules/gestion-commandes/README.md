# Module gestion-commandes

## Statut

Slice metier actif sur un module encore en preparation elargie.

## Ce qui est vrai aujourd'hui

- Les points d'entree actifs sont `index.ts`, `domain/`, `guardian/` et `write/`.
- Le module porte un slice executable: creation + annulation controlee d'une commande.
- Le Guardian couvre les invariants de creation et d'annulation (blocage des statuts non annulables).
- Le domaine et la facade write exposent les evenements `ORDER_CREATED` et `ORDER_CANCELLED`.
- Un read-model en memoire projette le statut de commande (`CREATED` -> `CANCELLED`).

## Ce que le module ne pretend pas encore etre

- un module complet de gestion du cycle de vie des commandes
- une implementation de persistance et de transitions d'etat exhaustive
- un domaine finalise sur toutes les operations futures

## Scripts

- `npm run build` : verification TypeScript des entrypoints du module.
- `npm test` : validation Jest du premier slice metier.

## Prochaine etape utile

- etendre le Guardian au cycle de vie complet
- ajouter les transitions d'etat et la persistance
- aligner les commandes et evenements contractuels sur ce premier noyau reel
