# DEPENDENCIES — Module Trésoconsolidation

## Nature du module
- Type : Module transverse (read-only)
- Rôle : Consolidation des positions de trésorerie
- Sens des flux : LECTURE transverse

---

## Modules consommés (READ-ONLY)

| Module | Usage |
|--------|---------|
| tresorerie-caisse | Positions de caisse |
| tresorerie-banque | Positions bancaires |

---

## Modules consommateurs (READ-ONLY)

Aucun. Trésoconsolidation est un module de restitution.

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute écriture dans les modules consommés
- ❌ Toute logique métier partagée

---

## Règle de gouvernance

Trésoconsolidation est un **agrégateur read-only**.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF