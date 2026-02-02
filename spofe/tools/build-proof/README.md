# 🔨 SPOFE Build Proof Generator

**Version 1.0.0 — Outil Officiel SPOFE**

Génère automatiquement un `BUILD_PROOF.md` traçable et non falsifiable conforme aux [Règles SPOFE Build/Test](../../governance/RULES_BUILD_TEST.md).

---

## 🎯 Objectif

Ce script garantit que :

- ✅ Le build s'exécute réellement
- ✅ Les tests passent réellement
- ✅ Les métadonnées Git sont capturées
- ✅ Le `BUILD_PROOF.md` est généré automatiquement
- ❌ **Aucune validation manuelle possible** — Le script échoue si un point critique échoue

---

## 📦 Installation

```bash
cd spofe/tools/build-proof
npm install
```

---

## 🚀 Utilisation

### En local

```bash
# Depuis le répertoire du module
SPOFE_MODULE=immobilisation npx tsx path/to/generate-build-proof.ts

# Ou avec le chemin explicite
SPOFE_MODULE=immobilisation SPOFE_MODULE_PATH=/path/to/module npx tsx generate-build-proof.ts
```

### En CI (GitHub Actions)

```yaml
- name: Generate BUILD_PROOF
  run: npx tsx spofe/tools/build-proof/generate-build-proof.ts
  env:
    SPOFE_MODULE: immobilisation
    SPOFE_MODULE_VERSION: 1.0.0
  working-directory: cascade/modules/immobilisation
```

---

## 🔧 Variables d'environnement

| Variable | Description | Obligatoire | Défaut |
|----------|-------------|-------------|--------|
| `SPOFE_MODULE` | Nom du module | Non | `package.json` name |
| `SPOFE_MODULE_PATH` | Chemin absolu du module | Non | `process.cwd()` |
| `SPOFE_MODULE_VERSION` | Version du module | Non | N/A |
| `SPOFE_BUILD_CMD` | Commande de build personnalisée | Non | `npm run build` |
| `SPOFE_REQUIRED_TESTS` | Tests requis (comma-separated) | Non | `unit,integration` |
| `SPOFE_ALLOW_DIRTY` | Autoriser repo Git non propre | Non | `false` |
| `SPOFE_COVERAGE` | Seuil de couverture | Non | N/A |

---

## 📋 Détection automatique

Le script détecte automatiquement les scripts disponibles dans le `package.json` du module :

- `test:unit` → Tests unitaires
- `test:integration` → Tests d'intégration
- `test:e2e` → Tests E2E

Si un script n'existe pas, il est ignoré (sauf s'il est dans `SPOFE_REQUIRED_TESTS`).

---

## 🛡️ Comportement de sécurité

| Situation | Action | Code de sortie |
|-----------|--------|----------------|
| Build échoue | ❌ Stoppe immédiatement | 1 |
| Tests requis échouent | ❌ Stoppe immédiatement | 1 |
| Repo Git non propre | ⚠️ Stoppe (sauf `SPOFE_ALLOW_DIRTY=1`) | 1 |
| Tout passe | ✅ Génère `BUILD_PROOF.md` | 0 |

---

## 📄 Output

Le script génère un fichier `BUILD_PROOF.md` dans le répertoire du module avec :

- Identification complète du module
- Référence Git (commit SHA, branche)
- Environnement d'exécution
- Résultats du build
- Résultats des tests
- Checklist SPOFE
- Conclusion (COMPLIANT / NON COMPLIANT)
- Signatures
- Annexes avec logs complets

---

## 🧪 Exemple de sortie

```
🔨 SPOFE Build Proof Generator v1.0.0
=====================================

📦 Module: immobilisation
📁 Path: /home/user/spofe/cascade/modules/immobilisation

📋 Collecting metadata...

🔨 Running build...
✅ Build completed in 2450ms

🧪 Running unit tests...
✅ Unit tests passed

🧪 Running integration tests...
✅ Integration tests passed

📄 Generating BUILD_PROOF.md...

✅ BUILD_PROOF.md generated successfully!
📄 Location: /home/user/spofe/cascade/modules/immobilisation/BUILD_PROOF.md

=====================================
📊 RÉSUMÉ
=====================================
Build:        ✅ SUCCESS (2450ms)
Unit:         ✅ SUCCESS (1200ms)
Integration:  ✅ SUCCESS (3500ms)
=====================================
Statut final: ✅ SPOFE COMPLIANT
=====================================

✅✅✅ SPOFE BUILD_PROOF COMPLETE ✅✅✅
```

---

## 🔗 Intégration CI

### GitHub Actions

```yaml
name: Build Proof

on:
  push:
    branches: [main, develop]

jobs:
  build-proof:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate BUILD_PROOF
        run: npx tsx spofe/tools/build-proof/generate-build-proof.ts
        env:
          SPOFE_MODULE: ${{ github.event.repository.name }}
          SPOFE_MODULE_VERSION: ${{ github.ref_name }}
      
      - name: Upload BUILD_PROOF
        uses: actions/upload-artifact@v4
        with:
          name: BUILD_PROOF
          path: BUILD_PROOF.md
```

---

## 📚 Architecture

```
spofe/tools/build-proof/
├── generate-build-proof.ts    # Script principal
├── package.json               # Configuration npm
├── README.md                  # Ce fichier
└── dist/                      # Code compilé (généré)
    └── generate-build-proof.js
```

---

## 🏛️ Gouvernance

Ce tool fait partie de la **gouvernance SPOFE** et est régi par :

- [Règles SPOFE Build/Test](../../governance/RULES_BUILD_TEST.md)
- [Template BUILD_PROOF](../../governance/BUILD_PROOF_TEMPLATE.md)

---

## 📝 License

PROPRIETARY — SPOFE Platform

---

**Document officiel SPOFE — Version 1.0.0**
