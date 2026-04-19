# DEPENDENCIES — Module Cost-Structure

## Nature du module
- Type : Module analytique (read-only)
- Rôle : Analyse des coûts COUTFLEX
- Sens des flux : LECTURE analytique

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|-------|
| gestion-stocks | Base de calcul des coûts de production |
| amortissement | Intégration des amortissements en coûts |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| budget | Utilisation des coûts en planification |
| budgeting | Projections de coûts |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute écriture dans les modules consommés
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Cost-Structure est un **module analytique COUTFLEX**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
