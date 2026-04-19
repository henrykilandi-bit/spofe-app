# DEPENDENCIES — Module Budgeting

## Nature du module
- Type : Module métier principal
- Rôle : Planification budgétaire et projections
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| cost-structure | Données de coûts analytiques |
| amortissement | Projections d'amortissements |
| gestion-stocks | Références de valorisation stocks |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| objectif-indicateur-evenement | Références d'indicateurs financiers |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Budgeting est une **source de vérité de planification financière**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF