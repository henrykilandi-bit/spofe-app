# ⚡ Démarrage rapide SILC Guardian

## 🚀 Installation (5 min)

```bash
# 1. Positionner dans le projet
cd silc-guardian

# 2. Installer dépendances
npm install

# 3. Compiler TypeScript
npm run build

# 4. Tester
npm run validate
```

## ✅ Vérifier l'installation

```bash
# Doit afficher la version
node dist/cli/index.js validate --help

# Doit afficher "SILC COMPLIANT" (0 violations)
npm run validate
```

## 📖 Premier usage

### Valider un dossier
```bash
npm run validate
```

### Valider en JSON (pour intégration)
```bash
npm run validate:json
```

### Mode transition legacy
```bash
npm run validate:legacy
```

### Vérifier conformité
```bash
npm run check:compliance
```

## 🔌 Intégrer à SPOFE

### 1. Hook Husky (pre-commit)
```bash
# À la racine SPOFE
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "cd silc-guardian && npm run validate"
```

Résultat: Commit bloqué si violations BLOCKING.

### 2. GitHub Actions
Copier `.github/workflows/silc-guardian.yml` à la racine du repo.

Résultat: PR bloquée si violations BLOCKING.

### 3. Scripts dans package.json racine
```json
{
  "scripts": {
    "silc:validate": "cd silc-guardian && npm run validate",
    "silc:check": "cd silc-guardian && npm run check:compliance"
  }
}
```

## 🎯 Premiers tests

### Test 1 : Détection basique
```bash
# Crée un fichier violation
echo 'export class AdminUser {}' > src/domain/entities/AdminUser.entity.ts

# Valide
npm run validate

# Doit afficher: "Mot interdit 'Admin' dans le nom d'entité"
```

### Test 2 : Blocage pre-commit
```bash
# Créer faux commit
git add AdminUser.entity.ts
git commit -m "test"

# Doit être rejeté par hook
```

### Test 3 : Génération signature
```bash
# Supprimer fichier violation
rm src/domain/entities/AdminUser.entity.ts

# Valider
npm run validate

# Doit générer: architecture/compliance/SILC_COMPLIANCE.json
```

## 📋 Checklist intégration

- [ ] `npm install` et `npm run build` réussis
- [ ] `npm run validate` affiche rapport
- [ ] Hook Husky installé et testé
- [ ] GitHub Actions configurée
- [ ] Scripts root package.json mis à jour
- [ ] Signature SILC_COMPLIANCE.json générée

## 🆘 Troubleshoot rapide

| Problème | Solution |
|----------|----------|
| "Cannot find module glob" | `npm install` dans silc-guardian/ |
| "tsc: command not found" | `npm run build` (compile d'abord) |
| "Hook not triggered" | `npx husky install` dans .husky/ |
| "AST parsing fails" | Vérifier Node.js 18+ |
| "Signature not generated" | Vérifier zéro BLOCKING violations |

## 📚 Documentation

- **README.md** — Vue d'ensemble complète
- **ARCHITECTURE.md** — Structure technique détaillée
- **INTEGRATION.md** — Guide d'intégration SPOFE
- **QA_CHECKLIST.md** — Contrôle qualité
- **SCENARIOS.ts** — Exemples de violations

## 🎓 Concepts clés (2 min)

**SILC Guardian valide 7 articles:**
1. **Article 4** — Processus gouvernés (logique métier)
2. **Article 5** — Entités basées contrats (User, Role, etc.)
3. **Article 6** — Services = orchestration (pas décision)
4. **Article 7** — Relations en PascalCase
5. **Article 8** — Structure obligatoire (domain/*, application/*, infrastructure/*)
6. **Article 9** — DTO structuration pure
7. **Article 10** — Repositories accès données

**3 niveaux de sévérité:**
- 🚫 **BLOCKING** — rejet immediate (commit, PR)
- ⚠️ **WARNING** — visible mais non-bloquant
- ℹ️ **INFO** — information

## 🚀 Prochaines étapes

1. ✅ Installation locale
2. ✅ Test sur codebase SPOFE
3. ✅ Intégration Husky + CI
4. ✅ Formation équipe
5. ✅ Mode legacy si legacy code
6. ✅ Signature SILC en production

---

**Prêt?** → `npm run validate`
