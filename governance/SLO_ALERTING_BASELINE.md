# SLO Alerting Baseline (SPOFE)

Objectif: convertir les KPI d'exploitation en signal d'alerte actionnable pour l'exploitation prod.

## Source de verite

- KPI: `.spofe/kpi-exploitation-latest.json`
- Evaluation SLO: `npm run observability:slo`
- Dashboard: `governance/OBSERVABILITY_SLO_DASHBOARD_LATEST.md`
- Alert payload: `.spofe/observability-alerts-latest.json`

## SLO surveilles

- Disponibilite service: cible `>= 99%`
- Taux check:repo vert: cible `>= 90%`
- MTTR incident N1: cible `< 24h`
- Backup+restore hebdo: statut `GO`

## Niveaux d'alerte

- `GO`: aucune alerte, exploitation nominale.
- `WARNING`: degradation proche seuil, investigation sous 24h.
- `CRITICAL`: seuil depasse, action immediate et ouverture incident.

## Procedure rapide

1. `npm run kpi:exploitation`
2. `npm run observability:slo`
3. Lire le dashboard SLO latest et appliquer la regle d'action.
