# GUARDIAN.md - Objectif-Indicateurs-Événements Module

Invariants métier garantis par le module Objectif-Indicateurs-Événements.

---

## INVARIANTS

- G31: Tout objectif doit avoir au moins un indicateur associé
- G32: Les indicateurs doivent avoir une unité de mesure définie
- G33: Les événements OIE doivent être horodatés de manière monotone
- G34: Un objectif ne peut pas être son propre parent (pas de cycle)
- G35: Les valeurs d'indicateurs doivent être numériques ou nulles
- G36: Chaque entité OIE doit appartenir à exactement un tenant
- G37: Les permissions de lecture respectent le modèle multi-tenant
- G38: Les identifiants OIE sont immutables après création
- G39: Les événements ne peuvent pas être modifiés après création
- G40: Les calculs d'indicateurs produisent des résultats déterministes

---

## VERIFICATION

Ces invariants sont vérifiés automatiquement par :
- Tests unitaires du module OIE
- Tests d'intégration avec repository
- Validation contractuelle SPOFE
- Tests de charge multi-tenant
