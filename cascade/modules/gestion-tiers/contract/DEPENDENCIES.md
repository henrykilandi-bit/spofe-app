# DEPENDENCIES — Module Gestion-Tiers

## Nature du module
- Type : Module métier principal
- Rôle : Référentiel des tiers (clients, fournisseurs)
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| parametres | Configuration des catégories de tiers |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| vente | Références clients |
| gestion-commandes | Références clients et fournisseurs |
| precomptabilite | Validation des tiers |
| tresorerie-banque | Références pour virements |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Gestion-Tiers est un **référentiel maître**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
