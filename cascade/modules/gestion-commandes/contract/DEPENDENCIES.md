# DEPENDENCIES — Module Gestion-Commandes

## Nature du module
- Type : Module métier principal
- Rôle : Gestion des commandes clients et fournisseurs
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| gestion-tiers | Références clients et fournisseurs |
| gestion-stocks | Vérification disponibilités |
| parametres | Configuration des conditions commerciales |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| vente | Génération documents commerciaux |
| precomptabilite | Validation financière |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Gestion-Commandes est une **source de vérité commerciale**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF