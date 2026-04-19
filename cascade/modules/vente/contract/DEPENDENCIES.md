# DEPENDENCIES — Module Vente

## Nature du module
- Type : Module documentaire (write)
- Rôle : Gestion des documents de vente
- Sens des flux : SOURCE documentaire

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| gestion-tiers | Références clients |
| gestion-commandes | Base des documents commerciaux |
| parametres | Configuration des documents |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Vente est une **source documentaire commerciale**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
