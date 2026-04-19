# 🏛️ Gouvernance SPOFE

Ce dossier contient les **documents fondateurs et normatifs** du système SPOFE.

---

## 📋 Documents P0 (opposables)

### 🔹 **CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md**
**Emplacement :** [`accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`](accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md)  
**Objet :** Définit le référentiel comptable par défaut (OHADA) et la stratégie d'extension (PCG, IFRS)

### 🔹 **TEMPLATE_TESTS_SYSTEME_SPOFE_P0.md**
**Emplacement :** [`testing/TEMPLATE_TESTS_SYSTEME_SPOFE_P0.md`](testing/TEMPLATE_TESTS_SYSTEME_SPOFE_P0.md)  
**Objet :** Définit les règles obligatoires des tests système pour BUILD_PROOF global

---

## 🏗️ Structure de Gouvernance

```
governance/
├── README.md                    # Ce document
├── accounting/                  # Gouvernance comptable & économique
│   └── CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md
├── testing/                     # Standards de tests système
│   └── TEMPLATE_TESTS_SYSTEME_SPOFE_P0.md
├── architecture/                # Principes architecturaux
│   └── PRINCIPES_SPOFE_CORE.md
├── INDEX_CONTRATS_SPOFE.md      # Catalogue des contrats
└── CHANGELOG_CONTRATS_*.md      # Historique des changements
```

---

## 🚨 **Règle d'Opposabilité**

**Tout module, toute évolution, tout test doit être conforme à ces documents.**

- ✅ **Conformité P0** → BUILD_PROOF SUCCESS
- ❌ **Non-conformité** → BUILD_PROOF BLOCKED

---

**Gouvernance SPOFE — Version 2026-02-03**  
**Status :** ACTIF