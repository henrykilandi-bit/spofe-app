# SILC Guardian Integration Guide

## 🔌 Intégration dans SPOFE

### 1. Configuration racine

Ajouter à `cascade/package.json`:

```json
{
  "scripts": {
    "silc:validate": "cd silc-guardian && npm run validate",
    "silc:validate:json": "cd silc-guardian && npm run validate:json",
    "silc:validate:legacy": "cd silc-guardian && npm run validate:legacy",
    "silc:check": "cd silc-guardian && npm run check:compliance"
  }
}
```

### 2. Husky setup

```bash
# À la racine SPOFE
npx husky add .husky/pre-commit "npm run silc:validate"
```

### 3. GitHub Actions

Ajouter `.github/workflows/silc-guardian.yml` (fourni)

### 4. Script CI/CD

Pour GitLab CI, ajouter à `.gitlab-ci.yml`:

```yaml
silc_guardian:
  stage: validate
  script:
    - cd silc-guardian
    - npm ci
    - npm run build
    - npm run validate:json
  artifacts:
    reports:
      junit: silc-guardian/silc-report.json
  allow_failure: false
```

## 📋 Checklist intégration

- [ ] Copier le dossier `silc-guardian/` au root du repo
- [ ] Exécuter `npm install` dans `silc-guardian/`
- [ ] Tester `npm run validate` localement
- [ ] Ajouter hook Husky pre-commit
- [ ] Configurer GitHub Actions (ou GitLab CI)
- [ ] Tester sur une PR — doit bloquer les violations
- [ ] Vérifier signature SILC_COMPLIANCE.json générée
- [ ] Documenter pour l'équipe

## ⚠️ Mode transitoire

Si le codebase actuel a des violations:

```bash
npm run validate:legacy
```

Cela génère un plan de migration vers SILC v2.

Puis, progressivement:
- Semaine 1-2 : Remontée des entités
- Semaine 3-4 : Extraction des processus
- Semaine 5-6 : Structuration services/repositories
- Semaine 7+ : Zéro violation

## 🚨 Troubleshoot

**"Command silc-guardian not found"**
→ Vérifier `npm install` dans `silc-guardian/`

**"AST parsing fails"**
→ Vérifier compatibilité Node.js 20+

**"Signature not generated"**
→ Vérifier violations.length === 0 (zéro BLOCKING)

**"Pre-commit hook not triggered"**
→ `npx husky install` dans `.husky/`

## 🎓 Formation équipe

Présenter:
1. Les 4 principes SILC (Articles 1-10)
2. Les 7 types de violations
3. Comment lire les rapports Guardian
4. Mode legacy pour refactoring gradualisé
5. Signature de conformité

## 📞 Support

Questions sur SILC Guardian?
→ Consulter `silc-guardian/README.md`

Questions sur SILC v2?
→ Consulter `architecture/contracts/*.contract.md`
