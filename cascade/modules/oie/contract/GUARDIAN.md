# GUARDIAN.md - OIE Module

Invariants métier garantis par le module OIE.

---

## INVARIANTS

- G01: Tout objectif doit avoir au moins un indicateur associé
- G02: Les indicateurs doivent avoir une unité de mesure définie
- G03: Les événements OIE doivent être horodatés de manière monotone
- G04: Un objectif ne peut pas être son propre parent (pas de cycle)
- G05: Les valeurs d'indicateurs doivent être numériques ou nulles
- G06: Chaque entité OIE doit appartenir à exactement un tenant
- G07: Les permissions de lecture respectent le modèle multi-tenant
- G08: Les identifiants OIE sont immutables après création
- G09: Les événements ne peuvent pas être modifiés après création
- G10: Les calculs d'indicateurs produisent des résultats déterministes

---

## VERIFICATION

Ces invariants sont vérifiés automatiquement par :
- Tests unitaires du module OIE
- Tests d'intégration avec repository
- Validation contractuelle SPOFE
- Tests de charge multi-tenant