# 📘 RÈGLES SPOFE — BUILD & TEST

**Version 1.1.0 — Clarification normative**

---

## 0. Historique de version

| Version | Date | Changements |
|---------|------|-------------|
| **v1.0.0** | - | Introduction de la preuve exécutable (BUILD_PROOF) |
| **v1.1.0** | - | Distinction formelle entre diagnostic et preuve, interdiction d'utiliser un rapport de diagnostic comme validation GO PROD, clarification de la chaîne de responsabilité |

---

## 1. Rappel du principe fondamental (inchangé)

### 🔒 Principe SPOFE — Preuve exécutable obligatoire

Un module SPOFE n'est considéré comme valide que s'il existe sous la forme d'un artefact exécutable, prouvé par un build et des tests exécutés avec succès, rattachés à un commit précis.

---

## 2. Distinction normative des artefacts techniques (NOUVEAU)

Afin d'éviter toute ambiguïté, SPOFE distingue de manière formelle et non négociable les types d'artefacts suivants.

### 2.1 Rapport de diagnostic technique (NON CONTRACTUEL)

#### Définition

Un rapport de diagnostic technique est un document ou un outil dont l'objectif est de :

- analyser l'état de l'environnement
- vérifier la cohérence globale du projet
- détecter des erreurs de configuration
- mesurer la capacité du système à supporter un build

#### Exemples

- `GENERATE_BUILD_PROOF_RESULTS.md`
- rapports d'outillage
- scripts de health-check
- métriques globales (nombre de fichiers, tests, etc.)

#### Statut SPOFE

| Critère | Statut |
|---------|--------|
| Contractuel | ❌ Non |
| Opposable | ❌ Non |
| Validation | ❌ Non |
| GO PROD | ❌ Interdit |

> 📌 Un rapport de diagnostic n'atteste pas qu'un module a été buildé, il atteste seulement que le contexte est favorable.

### 2.2 BUILD_PROOF SPOFE (CONTRACTUEL ET OPPOSABLE)

#### Définition

Un **BUILD_PROOF SPOFE** est la seule preuve technique reconnue par le système SPOFE pour valider un module.

Il doit impérativement :

- être généré automatiquement
- être rattaché à un commit Git précis
- contenir les commandes réellement exécutées
- contenir les résultats réels
- être signé cryptographiquement
- être vérifiable par script (`spofe-validate-module`)

#### Artefacts requis

| Fichier | Description |
|---------|-------------|
| `BUILD_PROOF.md` | Preuve de build et tests |
| `BUILD_PROOF.sha256` | Hash SHA-256 du contenu |
| `BUILD_PROOF.sig` | Signature cryptographique Ed25519 |

#### Statut SPOFE

| Critère | Statut |
|---------|--------|
| Contractuel | ✅ Oui |
| Opposable | ✅ Oui |
| Auditable | ✅ Oui |
| Autorité GO PROD | ✅ Seule reconnue |

---

## 3. Règle SPOFE — Non-substituabilité (NOUVEAU)

### ❗ Règle SPOFE — Non-substituabilité des preuves

> Aucun rapport de diagnostic, de stabilisation ou d'outillage ne peut se substituer à un BUILD_PROOF SPOFE.
>
> Toute tentative de validation basée sur un autre artefact est considérée comme **non conforme**.

---

## 4. Chaîne officielle de validation SPOFE (MISE À JOUR)

La validation SPOFE suit obligatoirement la chaîne suivante :

```
1. Validation conceptuelle
   ├── Contrats
   ├── Guardian
   └── AGA
           ↓
2. Diagnostic technique (optionnel mais recommandé)
   ├── Scripts d'analyse
   └── Rapports environnement
           ↓
3. BUILD_PROOF SPOFE (OBLIGATOIRE)
   ├── Build réel
   ├── Tests réels
   └── Signature cryptographique
           ↓
4. spofe-validate-module
   ├── Analyse checklist
   └── Vérification BUILD_PROOF
           ↓
5. Décision GO PROD
```

> 📌 Toute rupture dans cette chaîne invalide la validation.

---

## 5. Règle SPOFE — Interdiction de langage ambigu (NOUVEAU)

### Termes interdits pour tout document non contractuel

Les termes suivants sont **interdits** pour tout document de diagnostic :

- "Build Proof réussi"
- "Prêt pour la production"
- "Validation technique"
- "GO PROD"
- "Certifié SPOFE"
- "Approuvé pour déploiement"

👉 Ces termes sont **réservés exclusivement** au BUILD_PROOF SPOFE validé par `spofe-validate-module`.

### Termes autorisés pour les diagnostics

| À la place de | Utiliser |
|---------------|----------|
| "Build Proof réussi" | "Environnement favorable au build" |
| "Prêt pour la production" | "Diagnostic environnemental positif" |
| "Validation technique" | "Analyse technique préliminaire" |
| "GO PROD" | "Recommandation de génération BUILD_PROOF" |

---

## 6. Positionnement des rapports existants (clarification)

| Document | Statut SPOFE |
|----------|--------------|
| `RAPPORT_STABILISATION_TECHNIQUE_*.md` | Diagnostic |
| `GENERATE_BUILD_PROOF_RESULTS.md` | Diagnostic |
| `BUILD_PROOF.md` signé | ✅ Validation |
| CI verte sans BUILD_PROOF | ❌ Insuffisant |
| Checklist GO PROD manuelle | ❌ Non conforme |
| Checklist GO PROD générée | ✅ Conforme |

---

## 7. Responsabilité et gouvernance

### 7.1 Responsabilité humaine

| Rôle | Action |
|------|--------|
| Équipe de développement | Produire les diagnostics |
| Système SPOFE | Produire les BUILD_PROOF |
| `spofe-validate-module` | Décider de la conformité |

> Les rapports de diagnostic éclairent, les BUILD_PROOF décident.

### 7.2 Responsabilité système

- `spofe-validate-module` est **l'autorité finale**
- Aucune validation manuelle ne peut la contourner
- Toute validation est **traçable et auditable**

---

## 8. Conclusion officielle

> Dans SPOFE, **le diagnostic prépare, la preuve décide**.

Toute ambiguïté entre ces deux notions est désormais explicitement interdite.

---

## Annexe A — Template BUILD_PROOF.md

```markdown
# BUILD_PROOF — [Module Name]

**Status**: [SUCCESS / FAIL]
**Commit**: [hash]
**Date**: [ISO 8601]
**Environment**: [Node Version, OS]

## Commands Executed

### Build
\`\`\`bash
npm run build
\`\`\`
**Result**: ✅ SUCCESS / ❌ FAIL

### Tests
\`\`\`bash
npm run test:unit
npm run test:integration
npm run test:e2e
\`\`\`
**Result**: ✅ SUCCESS / ❌ FAIL

## CI References
- **Pipeline**: [link]
- **Job ID**: [id]
- **Artifact**: [link]

## Validation
- **Validated by**: [AGA / System / Manual]
- **Date**: [YYYY-MM-DD]
- **Final Status**: ✅ APPROVED / ❌ REJECTED
```

---

## Annexe B — Checklist de validation automatique

```
□ BUILD_PROOF.md présent
□ BUILD_PROOF.sha256 présent (hash cryptographique)
□ BUILD_PROOF.sig présent (signature cryptographique)
□ BUILD_PROOF.md à jour (correspond au commit)
□ Build réussi (npm run build)
□ Tests unitaires passants
□ Tests intégration passants (si applicable)
□ Tests E2E passants (si applicable)
□ CI verte (si applicable)
□ Pas d'erreur lint/typecheck
□ Documentation à jour
□ Contrats validés
□ Signature cryptographique valide (Ed25519)
□ Vérification SPOFE complète
```

---

**Document officiel SPOFE — Ne pas modifier sans approbation architecturale**

**Statut du document**

| Attribut | Valeur |
|----------|--------|
| Nom | RULES_BUILD_TEST.md |
| Version | 1.1.0 |
| Type | Normatif |
| Applicabilité | Globale SPOFE |
| Caractère | Obligatoire / Non dérogeable |
