# 📋 GIT INTEGRATION GUIDE - Secrets de Sécurité

**Objectif:** Prévenir les fuites de secrets dans Git

---

## ⚠️ IMPORTANT: NE JAMAIS COMMITER

```bash
❌ .env                     # Vrais secrets développement
❌ .env.production          # Vrais secrets production
❌ .env.staging             # Vrais secrets staging
❌ .env.backup.*            # Backups anciens secrets
❌ .env.local               # Secrets locaux
❌ secrets/                 # Dossier sensible
❌ *.pem, *.key, *.crt      # Certificats SSL
❌ config/secrets.json      # Configuration sensible
```

---

## ✅ À COMMITER

```bash
✅ .env.example              # Exemple SANS secrets
✅ .gitignore                # Patterns de protection
✅ src/utils/security-validator.js
✅ scripts/security-regenerate-secrets.js
✅ SECURITY_*.md files
✅ package.json              # Scripts inclus
```

---

## 🔍 VÉRIFIER AVANT DE COMMITER

### Avant le commit
```bash
# 1. Vérifier que .env n'est pas stagy
git status | grep -i ".env"
# Résultat attendu: RIEN (empty)

# 2. Vérifier aucun secret dans staged files
git diff --cached | grep -i "secret\|password\|key"
# Résultat attendu: RIEN (empty)

# 3. Vérifier que .env.example est sécurisé
grep -E "^[A-F0-9]{64}" .env.example
# Résultat attendu: RIEN (aucun vrai secret)
```

### Si problème détecté
```bash
# 🚨 ARRÊTER IMMÉDIATEMENT!
# Ne pas commiter jusqu'à correction

# Unstage les fichiers sensibles
git reset HEAD .env .env.* secrets/

# Vérifier que c'est bon
git status
# Résultat attendu: rien à commiter
```

---

## 📝 COMMIT MESSAGE

```bash
# Commits AUTORISÉS
✅ "chore: add security validation"
✅ "chore: add security scripts"
✅ "chore: harden .gitignore and security rules"
✅ "docs: add security documentation"

# Commits INTERDITS
❌ "chore: add production secrets" ← NE JAMAIS!
❌ "fix: update .env with new keys" ← NE JAMAIS!
❌ "feat: added JWT secret to config" ← NE JAMAIS!
```

---

## 🔐 SI UN SECRET A ÉTÉS ACCIDENTELLEMENT COMMITÉ

### Étape 1: ALERTER IMMÉDIATEMENT
```bash
# Signal danger
echo "🚨 SECRET COMPROMIS - ROTATION REQUISE IMMÉDIATEMENT"

# Notifier: responsable sécurité, DevOps, leads
```

### Étape 2: RÉVOQUER LE SECRET
```bash
# Régénérer immédiatement
npm run security:regenerate-secrets
# Répondre: oui, oui, oui

npm run dev
```

### Étape 3: NETTOYER L'HISTORIQUE GIT
```bash
# Option 1: Utiliser git-filter-repo (RECOMMANDÉ)
# https://github.com/newren/git-filter-repo

git filter-repo --force \
  --replace-text <(echo 'old_secret_value==>REVOKED_SECRET_DO_NOT_USE')

# Option 2: Nettoyer manuellement (PLUS FACILE)
# Faire un nouveau commit corrigeant le problème
git add .env.example .gitignore
git commit -m "chore: fix accidental secret exposure and regenerate"
git push origin --force-with-lease main
```

### Étape 4: AUDIT DE SÉCURITÉ
```bash
# Vérifier l'historique
git log --all --full-history -- ".env*" | head -20

# Chercher les secrets
git log -p --all --full-history | grep -i "secret\|password"
```

---

## 🚫 HOOKS GIT PRE-COMMIT

### Installation
```bash
# Créer le hook (optionnel, recommandé)
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# 🔐 Vérifier aucun fichier sensible ne va être commité
if git diff --cached --name-only | grep -E "^\\.env|secrets/" ; then
    echo "❌ ERREUR: Tentative de commit de fichiers sensibles!"
    echo "Fichiers interdits détectés:"
    git diff --cached --name-only | grep -E "^\\.env|secrets/"
    exit 1
fi

# 🔍 Vérifier aucun secret dans les diffs
if git diff --cached | grep -i "JWT_SECRET\|password\|api_key" ; then
    echo "❌ ERREUR: Secrets détectés dans le commit!"
    exit 1
fi

exit 0
EOF

chmod +x .git/hooks/pre-commit
```

### Test du hook
```bash
# Créer un fichier test
echo "SECRET=test" > test-secret.txt

# Essayer de le commiter
git add test-secret.txt
git commit -m "test"
# Résultat attendu: ❌ Hook refuse le commit

# Nettoyer
rm test-secret.txt
git reset
```

---

## 📊 STATUT DE SÉCURITÉ ACTUEL

### .env APRÈS RÉGÉNÉRATION

```bash
# Status: ✅ SÉCURISÉ

# Contenu:
jwt_secret=a3f9c8e2d1b6f4a9c7e3d8f1b9a2c5e7... (64 chars)
jwt_refresh_secret=c7d8e1f4a3b6e9c2f5a8b1d4e7f0a3c6... (64 chars)

# État Git:
git status
# → .env n'est PAS suivi (✅ correct)

# Vérifier le .gitignore
grep "^\.env$" .gitignore
# → Résultat: .env (✅ correct)
```

### .env.example APRÈS RÉGÉNÉRATION

```bash
# Status: ✅ SÛRA COMMITER

# Contenu:
JWT_SECRET=VOTRE_SECRET_CRYPTOGRAPHIQUE_64_CHARS_À_CHANGER
JWT_REFRESH_SECRET=VOTRE_REFRESH_SECRET_CRYPTOGRAPHIQUE_64_CHARS_À_CHANGER

# État Git:
git status
# → .env.example EST suivi (✅ correct)

# Vérifier aucun secret réel:
grep -E "^[A-F0-9]{64}" .env.example
# → Résultat: empty (✅ correct)
```

---

## 🔄 WORKFLOW GIT SÉCURISÉ

### Après régénération
```bash
# 1. Vérifier que .env n'est pas suivi
git status | grep ".env"
# Résultat attendu: RIEN

# 2. Commiter les fichiers OK
git add .env.example .gitignore package.json
git add src/utils/security-validator.js
git add scripts/security-regenerate-secrets.js
git add SECURITY_*.md

# 3. Vérifier avant de commiter
git diff --cached | head -50
# Vérifier AUCUN SECRET n'apparaît

# 4. Commiter
git commit -m "chore: strengthen security - add JWT secret validation"

# 5. Push
git push origin main
```

---

## 📚 DOCUMENTATION GITHUB

### Pour le repo GitHub
```markdown
# ⚠️ SECURITY NOTICE

## 🔐 Secrets Management

- ✅ `.env.example` - Safe to commit (no real secrets)
- ❌ `.env` - Never commit (contains real secrets)
- ✅ Secrets are validated at startup
- ✅ Use `npm run security:regenerate-secrets` to rotate

## 🚀 Getting Started

1. Copy .env.example to .env
2. Run: `npm run security:regenerate-secrets`
3. Run: `npm run dev`
```

### Ajouter un README.md
```bash
# Créer si manquant
touch SECURITY_README.md

# Contenu:
cat > SECURITY_README.md << 'EOF'
# 🔐 Security - JWT Secret Management

This project uses strong cryptographic secrets for JWT authentication.

## Quick Start

```bash
npm run security:regenerate-secrets
npm run dev
```

## Secrets

- `JWT_SECRET` - Main JWT signing key (64+ chars, cryptographic)
- `JWT_REFRESH_SECRET` - Refresh token key (different from JWT_SECRET)
- `ENCRYPTION_KEY` - Data encryption (32+ chars)

## Rules

❌ **NEVER** commit `.env` files
✅ **ALWAYS** use `npm run security:regenerate-secrets`
✅ **ALWAYS** rotate secrets every 90 days

See SECURITY_JWT_SECRET_CORRECTION.md for details.
EOF
```

---

## 🚨 EMERGENCY PROCEDURES

### Si secret a été leaké en production

```bash
# 1. IMMÉDIATE: Arrêter l'application
npm stop

# 2. IMMÉDIATE: Régénérer tous les secrets
npm run security:regenerate-secrets
# Répondre: oui, oui, oui

# 3. IMMÉDIATE: Notifier équipe sécurité
# Email: security@spofe.local
# Subject: 🚨 URGENT: Secret compromise - rotation required

# 4. IMMÉDIATE: Redémarrer avec nouveaux secrets
npm run dev

# 5. URGENT: Déployer sur TOUS les environnements
# - Staging
# - Production
# - Backups

# 6. URGENT: Invalider les tokens existants
# Utilisateurs doivent se reconnecter

# 7. SUIVI: Audit complet
npm run security:audit
git log --all --full-history -- ".env*"

# 8. SUIVI: Post-mortem
# Analyser comment c'est passé
# Prévenir prochaine fois
```

---

## ✅ CHECKLIST GIT SÉCURITÉ

### Avant chaque commit
- [ ] `git status` - .env n'apparaît pas
- [ ] `git diff --cached` - Aucun secret n'apparaît
- [ ] `grep "secret"` - Vérifier les diffs
- [ ] Hook pre-commit - Testé
- [ ] .gitignore - À jour

### Après commit
- [ ] Push réussi
- [ ] GitHub Actions vérification OK
- [ ] Code review complète
- [ ] Deploy à staging
- [ ] Validation production

### Avant deployment
- [ ] `npm run security:validate` - OK
- [ ] Aucun secret dans logs
- [ ] Aucun secret en clear en BD
- [ ] Audit trail complet
- [ ] Go-live approved

---

## 📞 SUPPORT

### Questions?
- See: `SECURITY_JWT_SECRET_CORRECTION.md`
- See: `SECURITY_ACTION_RAPIDE.md`

### Incident?
- Run: `npm run security:audit`
- Contact: Security Team
- Emergency: STOP application immediately

---

**Status:** ✅ Git Security Configured  
**Last Update:** 22 janvier 2026  
**Maintained by:** Security Team
