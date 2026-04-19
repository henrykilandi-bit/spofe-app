# Environnement Pilote Restreint - Supervision Active

Objectif: preparer un environnement pilote minimal, controle, et observable avant mise en ligne elargie.

## 1) Perimetre pilote restreint

- service unique backend SPOFE (pas de front public ouvert)
- base de donnees dediee pilote
- utilisateurs pilotes limites (liste blanche)
- fenetre d'ouverture controlee

## 2) Supervision active minimale

Commande quotidienne conseillee:

```bash
npm run pilot:supervision
```

Cette commande enchaine:

1. `npm run server:start`
2. `npm run server:health`
3. `npm run db:check`
4. `npm run kpi:exploitation`
5. `npm run observability:slo`

Signaux attendus:

- health OK
- DB connectivite OK
- KPI mis a jour (`governance/KPI_EXPLOITATION_LATEST.md`)
- dashboard SLO mis a jour (`governance/OBSERVABILITY_SLO_DASHBOARD_LATEST.md`)
- alertes SLO mises a jour (`.spofe/observability-alerts-latest.json`)

## 3) Procedure incident rapide (pilote)

Si `pilot:supervision` echoue:

1. appliquer `PRODUCTION_INCIDENT_MINI_GUIDE.md`
2. relancer `npm run pilot:supervision`
3. si nouvel echec, geler les changements et ouvrir un incident N2

## 4) Critere GO pilote journalier

- `pilot:supervision` vert
- aucun incident non resolu ouvert
- dernier backup smoke vert de la semaine
