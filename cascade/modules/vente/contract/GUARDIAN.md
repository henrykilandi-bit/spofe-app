# GUARDIAN — MODULE VENTE v1.0.0

## RÔLE DU GUARDIAN

Le Guardian Vente garantit le respect strict du périmètre documentaire
du module et empêche toute dérive fonctionnelle.

---

## INVARIANTS

- VE01 : Aucun document externe comme source
- VE02 : Aucun calcul économique
- VE03 : Aucun calcul de TVA
- VE04 : Aucune décision automatique
- VE05 : Mouvement Stock avec BL validé
- VE06 : Facture avec commande ou BL validé
- VE07 : Append-only strict
- VE08 : Acteur SPOFE requis
- VE09 : Isolation stricte par tenant
- VE10 : Écriture inter-module interdite

### Sanctions Guardian

Toute tentative de :
- calcul de marge
- simulation
- modification rétroactive
- import de document externe
- écriture inter-module

est rejetée par le Guardian Vente.
