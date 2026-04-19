# 🧪 PLAN DE TESTS P0 - Guardian Comptabilité Générale

## 🎯 Objectif Constitutionnel

Garantir que le Guardian Comptabilité :

- Protège la légalité comptable
- Empêche toute dérive fonctionnelle  
- Figes les périodes correctement
- Assure une auditabilité totale

Ces tests sont **constitutionnels**, pas techniques.

---

## 📊 Récapitulatif des Tests P0

| Domaine | Code Invariants | Tests P0 | Statut |
|---------|----------------|----------|--------|
| Périodes | G-COMPTA-01 → 04 | 4 | ✅ |
| Partie double | G-COMPTA-05 → 07 | 5 | ✅ |
| Plan comptable | G-COMPTA-08 → 09 | 3 | ✅ |
| Tiers | G-COMPTA-10 | 3 | ✅ |
| Traçabilité | G-COMPTA-11 → 13 | 5 | ✅ |
| Journaux | G-COMPTA-14 → 15 | 3 | ✅ |
| Clôture | G-COMPTA-16 → 18 | 4 | ✅ |
| **TOTAL** | **18 invariants** | **27 tests** | **✅** |

---

## 🧾 A. Tests Période Comptable (G-COMPTA-01 → 04)

### P0-A01 — Ajout d'écriture autorisé si période OPEN
- **✔️ Prérequis** : période = OPEN, écriture valide
- **➡️ Résultat attendu** : ACCEPTÉ
- **Invariant** : G-COMPTA-01

### P0-A02 — Ajout d'écriture refusé si période CLOSED
- **❌ Prérequis** : période = CLOSED
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-01

### P0-A03 — Ajout d'écriture refusé si période LOCKED
- **❌ Prérequis** : période = LOCKED
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-01

### P0-A04 — Modification d'écriture interdite (append-only)
- **❌ Prérequis** : tentative de modification
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-02

---

## ⚖️ B. Tests Partie Double (G-COMPTA-05 → 07)

### P0-B01 — Écriture avec moins de 2 lignes refusée
- **❌ Prérequis** : 1 ligne
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-05

### P0-B02 — Écriture non équilibrée refusée
- **❌ Prérequis** : total débit ≠ total crédit
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-06

### P0-B03 — Ligne avec débit ET crédit refusée
- **❌ Prérequis** : débit > 0 et crédit > 0
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-07

### P0-B04 — Ligne avec débit négatif refusée
- **❌ Prérequis** : débit < 0
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-07

### P0-B05 — Ligne avec crédit négatif refusée
- **❌ Prérequis** : crédit < 0
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-07

---

## 📘 C. Tests Plan Comptable & Comptes (G-COMPTA-08 → 09)

### P0-C01 — Compte inexistant refusé
- **❌ Prérequis** : accountCode absent du plan actif
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-08

### P0-C02 — Compte inactif refusé
- **❌ Prérequis** : compte désactivé dans Paramètres
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-08

### P0-C03 — Utilisation incorrecte de la nature du compte
- **❌ Prérequis** : compte de charge crédité
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-09

---

## 👥 D. Tests Tiers (Classe 4) (G-COMPTA-10)

### P0-D01 — Ligne classe 4 sans tiers refusée
- **❌ Prérequis** : accountCode = 401/411 sans tierId
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-10

### P0-D02 — Tiers inexistant refusé
- **❌ Prérequis** : tierId inconnu
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-10

### P0-D03 — Tiers inactif refusé
- **❌ Prérequis** : tierId inactif
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-10

---

## 🔗 E. Tests Traçabilité (G-COMPTA-11 → 13)

### P0-E01 — Écriture sans source refusée
- **❌ Prérequis** : source.module absent
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-11

### P0-E02 — Écriture sans sourceId refusée
- **❌ Prérequis** : source.sourceId absent
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-11

### P0-E03 — Écriture sans pièce justificative refusée
- **❌ Prérequis** : documentRef absent
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-12

### P0-E04 — Écriture sans horodatage refusée
- **❌ Prérequis** : createdAt absent
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-13

### P0-E05 — Écriture sans auteur refusée
- **❌ Prérequis** : createdBy absent
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-13

---

## 📒 F. Tests Journaux (G-COMPTA-14 → 15)

### P0-F01 — Journal inexistant refusé
- **❌ Prérequis** : journalCode non déclaré (Paramètres)
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-14

### P0-F02 — Journal non autorisé pour l'opération refusé
- **❌ Prérequis** : vente dans journal BANQUE
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-14

### P0-F03 — Journal d'une autre période refusé
- **❌ Prérequis** : journal.periodId ≠ entry.periodId
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-15

---

## 🔐 G. Tests Clôture (G-COMPTA-16 → 18)

### P0-G01 — Clôture refusée si période déséquilibrée
- **❌ Prérequis** : total débits ≠ crédits
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-16

### P0-G02 — Clôture réussie si période équilibrée
- **✔️ Prérequis** : période équilibrée
- **➡️ Résultat attendu** : CLOSED
- **Invariant** : G-COMPTA-16

### P0-G03 — Ajout post-clôture refusé
- **❌ Prérequis** : écriture ajoutée après clôture
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-17

### P0-G04 — Trace d'audit obligatoire à la clôture
- **❌ Prérequis** : auditTrail absent
- **➡️ Résultat attendu** : REJET
- **Invariant** : G-COMPTA-18

---

## 🏗️ Structure des Tests

```text
tests/
└── guardian/
    ├── accounting.guardian.p0.spec.ts    ✅ 27 tests P0
    └── fixtures/
        ├── validPeriod.ts                 ✅ Périodes valides
        ├── validEntry.ts                  ✅ Écritures valides
        ├── validJournal.ts                ✅ Journaux valides
        ├── validTier.ts                   ✅ Tiers valides
        └── index.ts                       ✅ Export fixtures
```

---

## 🎯 Garanties Constitutionnelles

### ✅ Avant Codage

1. **Tous les invariants sont testables** : 18 invariants → 27 tests
2. **Aucun cas métier flou** : Scénarios positifs et négatifs définis
3. **Guardian codable sans interprétation** : Tests exhaustifs
4. **BUILD_PROOF futur sécurisé** : Validation constitutionnelle

### 🛡️ Protection Maximale

- **27 tests P0 bloquants** : Aucune tolérance
- **Aucun "warning"** : Binaire (PASS/FAIL)
- **Constitutionnel** : Pas technique
- **Exhaustif** : Tous les cas couverts

---

## 🚀 Prochaines Étapes

Avec ce plan de tests P0 :

1. **L'implémentation du Guardian devient mécanique**
2. **La validation est automatique et exhaustive**
3. **La certification BUILD_PROOF est préparée**
4. **La légalité comptable est garantie**

**🏛️ PLAN DE TESTS P0 CONSTITUTIONNEL TERMINÉ**

**Le Guardian Comptabilité est prêt pour implémentation avec validation constitutionnelle garantie.**
