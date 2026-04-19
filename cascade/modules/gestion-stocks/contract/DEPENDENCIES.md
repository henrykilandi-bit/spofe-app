# DEPENDENCIES — Module Gestion-Stocks

## Nature du module
- Type : Module métier principal
- Rôle : Vérité physique des stocks
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| parametres | Configuration des règles de valorisation |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| cost-structure | Calculs de coûts de production |
| budget | Valorisation des stocks en planification |
| budgeting | Projections de stocks |
| gestion-commandes | Vérification des disponibilités |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Gestion-Stocks est une **source de vérité physique**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
