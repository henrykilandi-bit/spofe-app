# GUARDIAN — MODULE INVESTISSEURS v1.0.0

## 🛡️ Guardian Investisseurs — Règles invariantes

Le Guardian Investisseurs garantit la protection des données et l'accès contrôlé.

## INVARIANTS

- IN01 : Append-only strict
- IN02 : Aucun calcul financier
- IN03 : Lecture seule inter-modules
- IN04 : Séparation stricte des rôles
- IN05 : Exposition contrôlée
- IN06 : Documents validés uniquement
- IN07 : Traçabilité totale

### Détails des Invariants

#### G-01 — Append-only strict
- Aucun historique n'est modifiable ou supprimable.

#### G-02 — Aucun calcul financier
- Toute logique de valorisation, rendement ou projection est interdite.

#### G-03 — Lecture seule inter-modules
- Le module ne produit aucune donnée métier pour les autres modules.

#### G-04 — Séparation stricte des rôles
- Accès différencié : entrepreneur / coach / investisseur.

#### G-05 — Exposition contrôlée
- Un investisseur ne voit que ce qui lui est explicitement accordé.

#### G-06 — Documents validés uniquement
- Aucun document draft exposé aux investisseurs.

#### G-07 — Traçabilité totale
- Toute consultation est journalisée.

### Sanctions Guardian

Toute violation ⇒ Command rejected by Guardian.
