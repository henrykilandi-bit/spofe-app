# 🔐 GOUVERNANCE DES CLÉS CRYPTOGRAPHIQUES SPOFE

**Version 1.0.0 — Document Normatif**

---

## 1. Objectif

Ce document définit la gouvernance des clés cryptographiques utilisées pour signer les `BUILD_PROOF` dans le système SPOFE.

Il garantit :
- La sécurité des clés privées
- L'auditabilité des signatures
- La traçabilité temporelle
- La non-répudiation des preuves

---

## 2. Architecture Cryptographique

### 2.1 Algorithmes

| Composant | Algorithme | Justification |
|-----------|------------|---------------|
| **Signature** | Ed25519 | Moderne, rapide, sécurité prouvée |
| **Hash** | SHA-256 | Standard industriel, résistant aux collisions |
| **Encodage** | Base64 | Portable, lisible, compatible |

### 2.2 Fichiers générés

Pour chaque module validé, les fichiers suivants sont produits :

```
BUILD_PROOF.md          ← Contenu lisible (preuve)
BUILD_PROOF.sha256      ← Empreinte SHA-256
BUILD_PROOF.sig         ← Signature Ed25519 (base64)
BUILD_PROOF.sigmeta     ← Métadonnées de signature (JSON)
```

---

## 3. Gestion des Clés

### 3.1 Structure des clés

| Type | Emplacement | Usage |
|------|-------------|-------|
| **Clé privée** | Secret CI uniquement | Signature des BUILD_PROOF |
| **Clé publique** | `spofe/governance/spofe_build_proof_key.pub` | Vérification des signatures |

### 3.2 Génération des clés (one-time setup)

```bash
# Générer une paire de clés Ed25519
node spofe/tools/build-proof/sign-build-proof.ts --generate-keys

# Ou manuellement avec OpenSSL
openssl genpkey -algorithm Ed25519 -out spofe_build_proof_key
openssl pkey -in spofe_build_proof_key -pubout -out spofe_build_proof_key.pub
```

### 3.3 Stockage sécurisé

**Clé privée (CRITIQUE)** :
- Stockée comme secret CI (`SPOFE_SIGNING_KEY`)
- Jamais commitée dans le repository
- Accès restreint aux pipelines CI/CD
- Rotation annuelle recommandée

**Clé publique** :
- Commitée dans `spofe/governance/`
- Versionnée avec Git
- Disponible publiquement pour vérification

---

## 4. Cycle de vie des signatures

### 4.1 Création d'une signature

1. **Génération du BUILD_PROOF** : `generate-build-proof.ts`
2. **Hash du contenu** : SHA-256 du fichier BUILD_PROOF.md
3. **Signature** : Ed25519 du hash avec clé privée
4. **Stockage** : Écriture des fichiers .sig, .sha256, .sigmeta

### 4.2 Vérification d'une signature

1. **Lecture** : Chargement du BUILD_PROOF.md et BUILD_PROOF.sig
2. **Récupération clé publique** : Depuis `spofe/governance/`
3. **Vérification** : `verify(BUILD_PROOF.md, signature, public_key)`
4. **Résultat** : Valid/Invalid avec traçabilité

### 4.3 Invalidation

Une signature devient invalide si :
- Le contenu du BUILD_PROOF.md est modifié
- La clé privée est compromise (rotation nécessaire)
- La clé publique correspondante est introuvable

---

## 5. Intégration CI/CD

### 5.1 GitHub Actions

```yaml
- name: Generate BUILD_PROOF
  run: npx tsx spofe/tools/build-proof/generate-build-proof.ts

- name: Sign BUILD_PROOF
  env:
    SPOFE_SIGNING_KEY: ${{ secrets.SPOFE_SIGNING_KEY }}
  run: npx tsx spofe/tools/build-proof/sign-build-proof.ts

- name: Validate SPOFE
  run: npx tsx spofe/tools/validate-module/spofe-validate-module.ts
```

### 5.2 Variables d'environnement

| Variable | Source | Description |
|----------|--------|-------------|
| `SPOFE_SIGNING_KEY` | GitHub Secret | Clé privée Ed25519 (PEM format) |
| `SPOFE_PUBLIC_KEY_PATH` | Env optionnel | Chemin vers la clé publique |

---

## 6. Sécurité

### 6.1 Menaces mitigées

| Menace | Mitigation |
|--------|------------|
| Falsification BUILD_PROOF | Signature cryptographique |
| Usurpation d'identité | Clé privée protégée en CI |
| Replay attack | Timestamp + commit hash uniques |
| Modification post-validation | Vérification systématique |

### 6.2 Bonnes pratiques

- ✅ Clé privée jamais en clair
- ✅ Clé privée jamais logguée
- ✅ Rotation annuelle des clés
- ✅ Audit des accès CI
- ✅ Vérification automatique obligatoire

---

## 7. Audit et conformité

### 7.1 Traçabilité

Chaque signature contient :
- Timestamp ISO8601
- Commit Git exact
- Version de l'outil
- Identifiant du signataire (CI)

### 7.2 Preuve légale

Les signatures Ed25519 sont :
- **Non-répudiables** (clé privée contrôlée par SPOFE)
- **Horodatées** (timestamp vérifiable)
- **Liées au code** (commit hash)
- **Vérifiables offline** (clé publique disponible)

---

## 8. Règles SPOFE

### Règle fondamentale

> **Un BUILD_PROOF sans signature cryptographique valide est considéré comme non conforme.**

### Application

- Mode strict (`SPOFE_STRICT=true`) : Échec si pas de signature
- Mode normal : Warning si pas de signature
- Recommandation : Toujours utiliser le mode strict en production

---

## 9. Procédures opérationnelles

### 9.1 Rotation de clé (annuelle)

1. Générer nouvelle paire de clés
2. Mettre à jour `SPOFE_SIGNING_KEY` en CI
3. Committer nouvelle clé publique
4. Tester sur module non-critique
5. Documenter la rotation

### 9.2 Compromission de clé

1. Révoquer immédiatement l'accès CI
2. Générer nouvelle paire de clés
3. Auditer tous les BUILD_PROOF signés
4. Re-signer les modules actifs
5. Documenter l'incident

---

## 10. Références

### Standards

- [Ed25519](https://ed25519.cr.yp.to/) — Daniel J. Bernstein et al.
- [RFC 8032](https://tools.ietf.org/html/rfc8032) — Edwards-Curve Digital Signature Algorithm
- [NIST SP 800-57](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final) — Recommendation for Key Management

### Outils SPOFE

- `spofe/tools/build-proof/generate-build-proof.ts` — Génération BUILD_PROOF
- `spofe/tools/build-proof/sign-build-proof.ts` — Signature cryptographique
- `spofe/tools/validate-module/spofe-validate-module.ts` — Vérification

---

## 📌 Statut du document

| Attribut | Valeur |
|----------|--------|
| **Type** | Normatif sécurité |
| **Version** | 1.0.0 |
| **Applicabilité** | Globale SPOFE |
| **Classification** | Interne / Security-sensitive |

---

**Document officiel SPOFE — Ne pas diffuser la clé privée**
