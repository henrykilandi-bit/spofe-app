# 📋 RÈGLE SPOFE P0 - RÉFÉRENCEMENT CHARTE COMPTABLE

## Statut Officiel
**Niveau :** P0 - GOUVERNANCE  
**Portée :** Tous les modules SPOFE  
**Opposabilité :** OBLIGATOIRE  
**Date d'activation :** 2026-02-03  

---

## Principe

**Tout module SPOFE DOIT référencer explicitement la charte de gouvernance comptable P0.**  
Ce référencement est obligatoire dès la v1.0.0 de tout module.

---

## 🧱 Emplacements Canoniques (3 OBLIGATOIRES)

### 1️⃣ Dans le SCOPE.md du module

**Rôle :** Poser le cadre réglementaire et éviter toute ambiguïté dès le départ

**Ajout standard obligatoire :**

```markdown
## Référentiel comptable & gouvernance

Ce module est conçu conformément à la gouvernance SPOFE P0.

- Référentiel comptable par défaut : **OHADA**
- Référentiels alternatifs : via adapters (PCG, IFRS, etc.)
- Aucune logique comptable dépendante d'un référentiel n'est autorisée dans ce module.

Ce module est conforme à la charte :
`cascade/governance/accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`
```

### 2️⃣ Dans le CONTRACT.md

**Rôle :** Rendre la règle opposable contractuellement et bloquer toute dérive future

**Clause standard obligatoire :**

```markdown
## Conformité réglementaire

Le présent contrat est établi conformément à la gouvernance SPOFE P0.

Il est expressément convenu que :
- le module est **référentiel-agnostique** dans son core,
- toute interprétation comptable relève de modules dédiés,
- le référentiel comptable par défaut de SPOFE est **OHADA**.

Référence :
`CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`
```

### 3️⃣ Dans le BUILD_PROOF du module

**Rôle :** Verrouiller la conformité au moment de la certification

**Section JSON obligatoire :**

```json
{
  "governance": {
    "accountingCharter": "CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0",
    "defaultReferential": "OHADA",
    "compliance": "CONFIRMED"
  }
}
```

---

## 🔍 Grille d'Audit Automatisée

| Vérification                            | Résultat |
|----------------------------------------|----------|
| SCOPE.md référence la charte           | ✅ / ❌  |
| CONTRACT.md référence la charte        | ✅ / ❌  |
| BUILD_PROOF contient section governance| ✅ / ❌  |

**❌ Un seul NON = BUILD_PROOF refusé**

---

## 📊 Application au Module Gestion-Tiers

**Audit de conformité :**

✅ **SCOPE.md** → Charte référencée : `CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`  
✅ **CONTRACT.md** → Clause de conformité incluse  
✅ **BUILD_PROOF** → Section governance complète  

**Status :** ✅ **CONFORME P0**

---

## 🔒 Statut de la Règle

```
RÈGLE SPOFE — RÉFÉRENCEMENT CHARTE
────────────────────────────────
Niveau        : P0
Portée        : Tous les modules
Obligatoire   : OUI
Opposable     : OUI
Automatisable : OUI
────────────────────────────────
```

---

**Version :** 1.0  
**Référence charte :** [CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md](../accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md)  
**Exemple de conformité :** Module gestion-tiers