# DEPENDENCIES — Module Budget

## Nature du module
- Type : Module métier principal
- Rôle : Planification budgétaire et suivi des écarts
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|-------|
| parametres | Exercices, périodes, cadres de référence |
| gestion-stocks | Valorisation des stocks en planification |
| cost-structure | Référentiel analytique des coûts |
| amortissement | Charges d'amortissement prévisionnelles |
| objectif-indicateur-evenement | Contexte narratif et justification des révisions |

---

## Modules consommateurs (READ-ONLY)

👉 **AUCUN**

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique de calcul déléguée à OIE

---

## Règle de gouvernance

Le Budget reste souverain sur les calculs.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
