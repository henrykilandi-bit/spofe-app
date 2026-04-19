# DEPENDENCIES — Module Trésorerie-Banque

## Nature du module
- Type : Module métier principal
- Rôle : Gestion des comptes bancaires et virements
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| precomptabilite | Références pour virements |
| gestion-tiers | Références pour virements tiers |
| parametres | Configuration des comptes bancaires |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| tresoconsolidation | Consolidation des positions |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Trésorerie-Banque est une **source de vérité bancaire**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF