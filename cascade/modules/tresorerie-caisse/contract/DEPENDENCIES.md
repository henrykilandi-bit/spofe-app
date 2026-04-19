# DEPENDENCIES — Module Trésorerie-Caisse

## Nature du module
- Type : Module métier principal
- Rôle : Gestion de la caisse et encaissements
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| precomptabilite | Références pour encaissements |
| parametres | Configuration des comptes de caisse |

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

Trésorerie-Caisse est une **source de vérité de caisse**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF