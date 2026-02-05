# RÈGLES DE CONDUITE SPOFE

**Version:** 1.1.0 | **Statut:** NORMATIF (P0) | **Autorité:** Gouvernance SPOFE | **Date:** 2026-02-03

---

## 🎯 PRINCIPE FONDAMENTAL

> **SPOFE se gouverne par des règles exécutables, non par des conventions.**

---

## 📋 RÈGLES ABSOLUES

### Règle 1 : Pas de Statut Manuel
| Interdit | Obligatoire |
|----------|-------------|
| Déclaration verbale de conformité | BUILD_PROOF généré automatiquement |
| Checklist signée à la main | Validation CI/CD |
| Métriques auto-évaluées | Métriques instrumentées |

### Règle 2 : Aucune Auto-Déclaration
Un module NE PEUT PAS se déclarer conforme. La conformité est **dérivée** de:
- BUILD_PROOF signé
- Tests passants
- Checklist validée

### Règle 3 : BUILD_PROOF Obligatoire
```
Pas de BUILD_PROOF signé → Pas de GO PROD
```

### Règle 4 : Guardian Central
Toute logique métier passe par le **Guardian**. Pas de validation dispersée.

### Règle 5 : Read-Only API
Les APIs SPOFE sont **uniquement GET**. Mutations via Commandes/Events.

---

## 🏛️ HIÉRARCHIE NORMATIVE

```
REGLES_CONDUITE_SPOFE.md (ce fichier)
        ↓
SPOFE_RULES.md (organisation modules)
        ↓
RULES_BUILD_TEST.md (build et test)
        ↓
BUILD_PROOF.md (spécifique module)
```

**En cas de conflit :** Le document supérieur l'emporte.

---

## ⚡ PROCESSUS OBLIGATOIRE

### Phase 1 : Diagnostic (Debugging uniquement)
- Rapports de diagnostic autorisés
- Investigation des problèmes
- **NON opposable** comme preuve

### Phase 2 : Stabilisation
- Correction des erreurs
- Tests passants
- Compilation réussie

### Phase 3 : Validation Contractuelle
- Génération BUILD_PROOF
- Signature cryptographique
- **SEULE phase opposable**

### Phase 4 : Production
- GO PROD uniquement si SUCCESS
- Rollback auto si échec

---

## 🚫 INTERDICTIONS STRICTES

| Interdiction | Sanction |
|--------------|----------|
| Module hors `cascade/modules/` | Rejet immédiat |
| Module créé manuellement | Non conforme |
| BUILD_PROOF modifié à la main | Invalidation |
| Tests ignorés | Rollback auto |
| Release sans signature | Suppression tag |

---

## ✅ OBLIGATIONS

### Pour chaque module:
1. **SCOPE.md** — Frontière contractuelle définie
2. **ARCHITECTURE.md** — Architecture documentée
3. **CONTRACT.md** — Contrat fonctionnel
4. **GUARDIAN.md** — Invariants métier
5. **COMMANDS_EVENTS.md** — Commandes/Events listés
6. **READ_MODELS.md** — Vues SQL spécifiées
7. **BUILD_PROOF.md** — Preuve de build générée
8. **BUILD_PROOF.sig** — Signature présente

### Pour chaque release:
1. Tests passants (100% requis)
2. Compilation TypeScript (0 erreur)
3. Signature Ed25519 validée
4. Checklist GO PROD conforme

---

## 🔄 ROLLBACK AUTOMATIQUE

**Principe :** Aucune release invalide ne survit.

**Déclencheurs :**
- BUILD_FAILURE
- TEST_FAILURE
- SIGNATURE_FAILURE
- CHECKLIST_FAILURE
- VALIDATION_FAILURE

**Résultat :**
- Tag supprimé
- Statut ROLLED_BACK
- Traçabilité conservée

---

## 📊 TABLEAU DE CONFORMITÉ

**Unique source de vérité** pour toute décision stratégique.

| Statut | Signification |
|--------|---------------|
| CONFORM | BUILD_PROOF signé et validé |
| CONDITIONAL | BUILD_PROOF signé avec warnings |
| NON_CONFORM | Pas de BUILD_PROOF |
| ROLLED_BACK | Release rejetée |

---

## 🛠️ OUTILS OFFICIELS

| Outil | Usage |
|-------|-------|
| `spofe-new-module.js` | Création module (obligatoire) |
| `generate-build-proof.ts` | Génération BUILD_PROOF |
| `sign-build-proof.ts` | Signature cryptographique |
| `validate-module.ts` | Validation SPOFE |
| `conformity-table.ts` | Génération tableau conformité |

---

## 🏆 GOLDEN MODULE

**Référence :** `cascade/modules/immobilisation/`

Tout nouveau module doit être dérivé du Golden Module.

---

## 📌 RÈGLE FINALE

> **Ce document fait foi. En cas de divergence entre la pratique et ces règles, ces règles prévalent.**

> **SPOFE se gouverne lui-même.** 🔒

---

**Document normatif SPOFE — Modification soumise à processus de gouvernance**
