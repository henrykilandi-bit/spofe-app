# IMMOBILISATION — GUARDIAN (P0)

## Objectif

Garantir l'intégrité factuelle et documentaire des immobilisations.

---

## INVARIANTS

- IM01 : Toute immobilisation appartient à un tenant unique
- IM02 : Toute immobilisation est rattachée à une catégorie OHADA valide
- IM03 : Aucun calcul comptable n'est autorisé
- IM04 : Toute immobilisation repose sur un document validé
- IM05 : Append-only : aucun événement modifiable ou supprimable
- IM06 : Mise en service postérieure à l'acquisition
- IM07 : Sortie postérieure à la mise en service
- IM08 : Un acteur SPOFE est obligatoire
- IM09 : Interdiction de cross-tenant
- IM10 : Interdiction d'écriture comptable
- IM11 : Interdiction de logique d'amortissement
- IM12 : Interdiction de modification après sortie

---

## Sanction

Toute violation ⇒ rejet immédiat par le Guardian.

---

## Statut

```
GUARDIAN STATUS
────────────────────────────────
Module        : Immobilisation
Version       : v1.0.0
Invariants    : G01 → G12
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON
────────────────────────────────
```
