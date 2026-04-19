# DEPENDENCIES — Module Immobilisation

## Nature du module
- Type : Module métier principal
- Rôle : Gestion du patrimoine immobilisé (OHADA classe 2)
- Sens des flux : SOURCE (write)

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| parametres | Configuration OHADA et règles comptables |

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| amortissement | Base de calcul des amortissements |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute dépendance inverse vers modules consommateurs
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Immobilisation est une **source de vérité patrimoniale OHADA**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
