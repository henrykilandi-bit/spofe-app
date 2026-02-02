# Configuration GitHub — Verrouillage SILC

## 🔒 Activation des règles de protection de branche

Cette procédure verrouille les merges et force la conformité SILC v2.

### Étape 1 — Accéder aux paramètres de branche

1. **Repository Settings**
   ```
   GitHub.com → Your Repository → Settings
   ```

2. **Branches**
   ```
   Settings → Branches → Branch protection rules
   ```

### Étape 2 — Créer une règle pour `main`

#### 2.1 Pattern
```
Branch name pattern: main
```

#### 2.2 ✅ Require a pull request before merging
- [x] Require approvals
- Approvals required: `1`
- [x] Dismiss stale pull request approvals when new commits are pushed
- [x] Require status checks to pass before merging

#### 2.3 ✅ Status checks
Sélectionner :
```
☑ SILC Guardian CI/CD / SILC Guardian Validation
☑ SILC Guardian CI/CD / Compliance Check
☑ SILC Guardian CI/CD / Backend Tests
```

#### 2.4 ✅ Require conversation resolution before merging
```
[x] Require all conversations on code to be resolved
```

#### 2.5 ✅ Restrictions
```
[x] Restrict who can push to matching branches
    Allowed: admins + architects
```

#### 2.6 ✅ Enforce all the above for administrators
```
[x] Include administrators
```

#### 2.7 ✅ Allow force pushes
```
[x] Allow force pushes
    Choose who can force push: (optional)
    → Décocher pour un vrai verrouillage
```

#### 2.8 ✅ Allow deletions
```
☐ Allow deletions
```

### Étape 3 — Créer une règle pour `develop` (moins stricte)

Pattern:
```
develop
```

Mêmes paramètres que `main`, mais :
- Approvals: `0` ou `1`
- Admins: inclus SAUF force push

### Étape 4 — Vérifier la règle

```bash
curl -X GET \
  https://api.github.com/repos/YOUR_ORG/SPOFE-APP/branches/main/protection \
  -H "Authorization: token YOUR_TOKEN"
```

Résultat attendu :
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "SILC Guardian CI/CD / SILC Guardian Validation",
      "SILC Guardian CI/CD / Compliance Check"
    ]
  },
  "enforce_admins": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

---

## 🛡️ Impact

### Avant (sans protection)
```
dev → git push → merge → ❌ Pas de SILC validation
```

### Après (avec protection)
```
dev → git push → PR → CI/CD Tests
                    ↓
              SILC Guardian ← BLOQUE si non conforme
                    ↓
            Code Review required
                    ↓
            Status checks OK
                    ↓
            ✅ Merge autorisé
```

### Cas d'erreur
```
SILC Guardian Validation FAILED
  ↓
PR est "blocked"
  ↓
Même un admin ne peut pas merger
  ↓
Fixer la violation
  ↓
ré-push
  ↓
CI re-run automatiquement
```

---

## 📋 Checklist

- [ ] Aller dans Settings → Branches
- [ ] Créer règle pour `main`
  - [ ] Require PRs
  - [ ] Status checks SILC Guardian
  - [ ] Conversations resolved
  - [ ] Include administrators
  - [ ] Disable force push
- [ ] Créer règle pour `develop` (moins stricte)
- [ ] Tester avec une PR non-conforme SILC
- [ ] Vérifier que le merge est bloqué
- [ ] Corriger la violation
- [ ] Vérifier que le merge passe

---

## 🔧 Configuration via API (optionnel)

```bash
# Installer GitHub CLI
brew install gh

# Authentifier
gh auth login

# Créer la protection
gh api repos/{owner}/{repo}/branches/main/protection \
  --input protection.json
```

Contenu de `protection.json`:
```json
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "SILC Guardian CI/CD / SILC Guardian Validation",
      "SILC Guardian CI/CD / Compliance Check"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismissal_restrictions": {},
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}
```

```bash
gh api repos/{owner}/{repo}/branches/main/protection --input protection.json
```

---

## ⚠️ Notes importantes

1. **Ordre de précédence** :
   - Husky (local) → bloque commit
   - CI/CD (GitHub) → bloque merge
   - Branch protection → bloque tout changement

2. **Exceptions** :
   - Les admins peuvent bypass Husky (mais pas GitHub)
   - Pas d'admin bypass pour le merge (include_admins: true)

3. **Alerter les devs** :
   ```
   IMPORTANT: Conformité SILC v2 requise pour tous les commits
   - Local: npm run silc:validate avant de commit
   - GitHub: La CI bloquera les PRs non-conformes
   - Pas de workaround possible
   ```

---

**Status**: ✅ ACTIF  
**Dernière vérification**: 2026-01-28  
**Version**: SILC v2 Governance Mode
