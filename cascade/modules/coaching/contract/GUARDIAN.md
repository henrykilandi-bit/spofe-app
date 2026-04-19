# GUARDIAN — MODULE COACHING v1.0.0

## RÔLE DU GUARDIAN

Le Guardian Coaching garantit que le module respecte strictement son rôle
d'accompagnement humain, sans dérive fonctionnelle.

---

## INVARIANTS

- CO01 : Isolation stricte par tenant
- CO02 : Aucun calcul métier
- CO03 : Lecture seule inter-modules
- CO04 : Confidentialité séance
- CO05 : Append-only strict
- CO06 : Acteur coach identifié
- CO07 : Données anonymisées si requis
- CO08 : Aucune décision automatique
- CO09 : Le module Coaching ne produit aucune vérité métier
- CO10 : Le module Coaching ne produit aucun calcul économique
- CO11 : Le module Coaching ne prend aucune décision automatique
- CO12 : Toute action requiert un acteur SPOFE identifié
- CO13 : Aucun échange sans entretien planifié
- CO14 : Aucun échange hors période d'activation de l'entretien
- CO15 : Aucun accès cross-tenant

---

## RÈGLES DE REJET

Toute tentative de :
- calcul économique
- simulation
- recommandation automatique
- échange hors planification
- accès cross-tenant

est rejetée par le Guardian Coaching.
