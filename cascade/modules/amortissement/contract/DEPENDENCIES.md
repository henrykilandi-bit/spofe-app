# DEPENDENCIES — Module Amortissement

## Nature du module
- Type : Module métier principal 
- Rôle : Calcul et gestion des amortissements d'actifs
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|-------|
| immobilisation | Référence des actifs à amortir |
| parametres | Configuration des règles d'amortissement |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| cost-structure | Calculs de coûts analytiques |
| budget | Intégration des amortissements en planification |
| budgeting | Projections budgétaires |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Amortissement est une **source de vérité comptable OHADA**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
