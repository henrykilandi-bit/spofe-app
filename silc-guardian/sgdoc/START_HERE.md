🛡️ **SILC Guardian v1.0.0**

Validateur architectural normatif pour SPOFE SILC v2.

---

## ⚡ Démarrage rapide

```bash
npm install && npm run build && npm run validate
```

## 📖 Documentation

Lire d'abord → **[QUICKSTART.md](QUICKSTART.md)** (5 min)

Ensuite → **[README.md](README.md)** (complète)

## 🎯 Que fait SILC Guardian?

- ✅ Valide votre code contre SILC v2 (7 articles)
- ✅ Bloque les commits violant les règles
- ✅ Bloque les PR non-conformes en CI
- ✅ Génère une signature SILC officielle
- ✅ Supporte transition legacy

## 📊 Structure

```
src/
├── core/         ← Guardian principal
├── lexicon/      ← Contrats + mots interdits
├── rules/        ← 7 règles SILC + AST
├── reporters/    ← Console + JSON
├── compliance/   ← Signature SILC
└── cli/          ← Interface CLI
```

## 🚀 Commands

```bash
npm run validate              # Validation standard
npm run validate:json         # Rapport JSON
npm run validate:legacy       # Mode transition
npm run check:compliance      # Vérifier signature
npm run build                 # Compiler
```

## 📋 Documentation complète

| Document | Contenu |
|----------|---------|
| [README.md](README.md) | Vue d'ensemble (850+ lignes) |
| [QUICKSTART.md](QUICKSTART.md) | Installation 5 min |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Détails techniques |
| [INTEGRATION.md](INTEGRATION.md) | Intégration SPOFE |
| [MAINTENANCE.md](MAINTENANCE.md) | Maintenance + contribution |
| [QA_CHECKLIST.md](QA_CHECKLIST.md) | Tests qualité |
| [FAQ.md](FAQ.md) | 50+ questions |
| [SCENARIOS.ts](SCENARIOS.ts) | Exemples violations |
| [FINAL_SUMMARY.md](FINAL_SUMMARY.md) | Synthèse complète |

## 🔒 Blocages

| Violation | Bloque? | Article |
|-----------|---------|---------|
| Mot interdit | ✅ OUI | 5 |
| Entité mal placée | ✅ OUI | 8 |
| Service décisionnaire | ✅ OUI | 6 |
| DTO avec action | ✅ OUI | 9 |
| Relation camelCase | ⚠️ WARNING | 7 |

## 🔌 Intégrations

- ✅ **Husky pre-commit** — Hook automatique
- ✅ **GitHub Actions** — CI/CD bloquante
- ✅ **CLI** — Standalone ou npm script
- ✅ **Programmatic** — Import API

## 📦 Installation

```bash
# 1. Installer
npm install

# 2. Compiler
npm run build

# 3. Intégrer Husky
npx husky install
npx husky add .husky/pre-commit "npm run validate"

# 4. Tester
npm run validate
```

## ✨ Points forts

- 🎯 **Bloquant** — Impossible à contourner
- 🧠 **Intelligent** — Analyse AST + lexique + structure
- 🔐 **Opposable** — Signature SILC_COMPLIANCE.json
- ⚡ **Rapide** — ~500ms pour 50+ fichiers
- 📚 **Documenté** — 25+ pages complètes

## 🆘 Besoin d'aide?

→ Consulter **[FAQ.md](FAQ.md)**

---

**Status**: ✅ Production-ready  
**Version**: 1.0.0  
**Date**: 28 janvier 2026

🛡️ *La norme, enforcée.*
