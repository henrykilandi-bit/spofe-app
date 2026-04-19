# DEPENDENCIES — Module Précomptabilité

## Nature du module
- Type : Module métier principal
- Rôle : Vérité documentaire et validation financière
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| gestion-tiers | Validation des tiers |
| parametres | Règles de validation |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| tresorerie-caisse | Références pour encaissements |
| tresorerie-banque | Références pour virements |
| objectif-indicateur-evenement | Références d'indicateurs de flux |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Précomptabilité est une **source de vérité documentaire**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF