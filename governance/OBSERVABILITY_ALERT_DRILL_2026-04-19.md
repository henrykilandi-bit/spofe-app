# Observability Alert Drill - 2026-04-19

Objectif: prouver le comportement d'alerte SLO en cas de degradation puis retour nominal.

## Drill execute

1. Simulation KPI degrade via fixture `governance/fixtures/kpi-exploitation-simulated-critical.json`
2. Execution `npm run observability:slo` avec input override
3. Verification dashboard drill + payload alertes drill
4. Retour au flux nominal (`npm run observability:slo` sans override)

## Resultats

- Drill degrade: `overall=CRITICAL`, `critical=4`, `warning=0`
- Drill dashboard: `governance/OBSERVABILITY_SLO_DASHBOARD_DRILL.md`
- Drill alert payload: `.spofe/observability-alerts-drill.json`
- Retour nominal: `overall=GO`, `critical=0`, `warning=0`
- Dashboard nominal: `governance/OBSERVABILITY_SLO_DASHBOARD_LATEST.md`

## Conclusion

Le chemin d'alerte est valide: la detection SLO remonte bien en CRITICAL en cas de derive, puis revient en GO apres restauration des KPI nominaux.
