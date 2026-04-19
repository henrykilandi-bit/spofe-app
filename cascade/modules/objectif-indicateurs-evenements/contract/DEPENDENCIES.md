# DEPENDENCIES — Module Objectif-Indicateurs-Événements

## Nature du module
- Type : Module explicatif (READ-ONLY)
- Rôle : Contexte narratif et événements stratégiques
- Sens des flux : LECTURE référentielle

---

## Modules consommés (READ-ONLY)

👉 **AUCUN**

---

## Modules consommateurs (READ-ONLY)

| Module | Finalité |
|--------|----------|
| coaching | Narration du suivi d'accompagnement |
| budget | Justification des révisions |
| investisseurs | Publication de contexte non financier |

---

## Dépendances interdites

- ❌ Toute dépendance entrante en écriture
- ❌ Toute écriture dans un module consommateur
- ❌ Toute logique de calcul financier

---

## Règle de gouvernance

OIE reste un module explicatif.  
Toute évolution de dépendance nécessite :
- nouvelle version du module
- validation BUILD_PROOF
