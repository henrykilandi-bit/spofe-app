# ❓ SILC Guardian — FAQ & Troubleshooting

## 🎯 Installation & Démarrage

### Q: "Command 'npm' not found"
**A:** Node.js n'est pas installé.
```bash
# Installer Node.js 18+
# https://nodejs.org/

# Vérifier
node --version  # ≥ v18.0.0
npm --version   # ≥ 9.0.0
```

### Q: "Cannot find module 'glob'"
**A:** Dépendances non installées.
```bash
cd silc-guardian
npm install
```

### Q: "tsc: command not found"
**A:** TypeScript ne compile pas.
```bash
npm run build
```

---

## 🔧 Validation

### Q: "Aucune violation détectée mais fichiers existent"
**A:** Vérifier le `root` passé à Guardian.
```bash
# Par défaut: src/
npm run validate --root=src

# Ou spécifier chemin complet
npm run validate -- --root=c:/projet/src
```

### Q: "Faux positif: entité rejetée à tort"
**A:** Vérifier le nom exactement.
```typescript
// ❌ Rejeté
export class UserManagement { }  // "Management" interdit

// ✅ Accepté
export class User { }  // Contrat autorisé
```

### Q: "AST parsing échoue"
**A:** Erreur syntaxe TypeScript dans le fichier.
```bash
# Vérifier syntaxe
npx tsc --noEmit src/mon-fichier.ts

# Corriger et retester
npm run validate
```

---

## 📊 Reporters

### Q: "JSON invalide en sortie"
**A:** Rediriger proprement.
```bash
# Mauvais
npm run validate:json > output.log 2>&1

# Bon
npm run validate:json > output.json
# Puis
cat output.json | jq .
```

### Q: "Rapport console vide"
**A:** Zéro violations (c'est bon!).
```bash
npm run validate
# ✅ Aucune violation — SILC compliant
```

---

## 🔐 Compliance & Signature

### Q: "SILC_COMPLIANCE.json ne se génère pas"
**A:** Il doit y avoir zéro violations BLOCKING.
```bash
# Vérifier violations
npm run validate

# Si zéro BLOCKING → file généré
ls architecture/compliance/SILC_COMPLIANCE.json
```

### Q: "Signature SILC expirée"
**A:** Signature valide 7 jours seulement.
```bash
# Revalider
npm run validate

# Nouvelle signature générée
npm run check:compliance
```

### Q: "Puis-je modifier SILC_COMPLIANCE.json?"
**A:** Non. Fichier signé et opposable.
- Suppression → rejet PR
- Modification → rejet PR
- Régénération → seulement via `npm run validate` sans BLOCKING

---

## 🔴 Mode Legacy

### Q: "Quand utiliser --mode=legacy?"
**A:** Quand code legacy coexiste avec SILC v2.
```bash
# Coexistence temporaire
npm run validate:legacy

# Affiche plan de migration
```

### Q: "Comment ajouter un chemin à la whitelist?"
**A:** Éditer `LegacyAuditMode.ts`.
```typescript
// src/compliance/LegacyAuditMode.ts
static readonly LEGACY_PATHS = [
  "src/controllers/**",
  "src/models/**",
  "src/old/**",  // ← Ajouter
];
```

### Q: "Mode legacy reste actif éternellement?"
**A:** Non. À planifier progressivement.
- Semaine 1-2: Mapping violations
- Semaine 3-4: Refactor priorités HIGH
- Semaine 5-6: Refactor priorités MEDIUM
- Semaine 7+: Zéro mode legacy

---

## 🪝 Husky & Pre-commit

### Q: "Hook pre-commit ne se déclenche pas"
**A:** Husky non installé.
```bash
npx husky install
npx husky add .husky/pre-commit "npm run silc:validate"

# Tester
git add .
git commit -m "test"  # Doit déclencher
```

### Q: "Commit rejeté mais pas de message d'erreur"
**A:** Hook silencieux. Forcer message.
```bash
# Vérifier manuellement
npm run validate

# Corriger
# Retenter commit
```

### Q: "Warnings bloquent le commit"
**A:** Par design, warnings ne bloquent pas.
- BLOCKING → rejet
- WARNING → visible mais autorisé

### Q: "Contourner le hook"
**A:** Possible mais mauvaise idée.
```bash
git commit --no-verify  # ⚠️ Déconseillé!
```

---

## 🤖 CI/CD & GitHub Actions

### Q: "Workflow GitHub Actions ne s'exécute pas"
**A:** Workflow non trouvé ou branche incorrecte.
```bash
# Vérifier chemin
ls .github/workflows/silc-guardian.yml

# Vérifier branche configurée
# Dans fichier: on: branches: [main, develop]
```

### Q: "PR bloquée mais rapport manquant"
**A:** Artifact pas uploadé ou renommé.
```bash
# Vérifier fichier output
npm run validate:json > silc-report.json

# Vérifier format
cat silc-report.json | jq '.status'
```

### Q: "Comment déboguer workflow?"
**A:** Ajouter logs au workflow.
```yaml
- name: Debug SILC
  run: |
    npm run validate:json
    cat silc-report.json
    echo "Exit code: $?"
```

---

## 🏗️ Architecture & Structure

### Q: "Puis-je modifier les répertoires obligatoires?"
**A:** Non. Immuables dans SILC v2.
```
domain/entities/     → ENTITY
domain/processes/    → PROCESS
domain/relations/    → RELATION
application/dtos/    → DTO
application/services/ → SERVICE
infrastructure/repositories/ → REPOSITORY
```

### Q: "Exception pour un fichier?"
**A:** Non permises. Contacter architecte.
```typescript
// Pas de:
// @silc-ignore
// @skip-validation
// etc.

// Seulement: mode legacy pour transition
npm run validate:legacy
```

---

## 📈 Performance & Scalabilité

### Q: "Validation lente (>10s)"
**A:** Normal si 100+ fichiers. Optimiser:
```bash
# Limiter à un dossier
npm run validate -- --root=src/domain

# Vérifier AST parsing (coûteux)
# Peut être désactivé si nécessaire dans Guardian
```

### Q: "Mémoire élevée"
**A:** Rare. Vérifier fichiers très volumineux.
```bash
# Vérifier taille fichiers
find src -name "*.ts" -exec wc -l {} + | sort -rn | head

# Si >5000 lignes → split en modules
```

---

## 🎓 Concepts

### Q: "Quelle différence entre Article 5 et Article 6?"
**A:**
- **Article 5** (Entités) → Structuration de contrats
- **Article 6** (Services) → Orchestration seulement
```typescript
// Article 5 — entité
class User { /* propriétés */ }

// Article 6 — service
class UserService { 
  execute(user: User) { /* orchestration */ }
}
```

### Q: "AST vs Lexique - quand lequel?"
**A:**
- **Lexique** → Détecte noms + mots interdits
- **AST** → Détecte logique + sémantique
```typescript
// Détecté par lexique
class AdminUser { }  // Mot "Admin"

// Détecté par AST
class User { 
  approve() { }  // Logique décisionnaire
}
```

### Q: "Contrat vs Entity?"
**A:**
- **Contrat** → Concept SILC (User, Role, etc.)
- **Entity** → Classe TypeScript implémentant contrat
```typescript
// Contrat: User
// Entity: classe User implémentant contrat
export class User { /* propriétés */ }
```

---

## 🐛 Bugs & Issues

### Q: "Même violation rapportée 2x"
**A:** Vérifier que règles ne se chevauchent pas.
```typescript
// Mauvais: deux règles pour même violation
EntityNamingRule.check() // → "Admin" interdit
AstRule.check()          // → "Admin" interdit (doublon)

// Solution: regrouper dans une règle
```

### Q: "Violation disparaît/réapparaît"
**A:** Possible si mode legacy ou chemins whitelistés.
```bash
# Vérifier mode
npm run validate  # strict
npm run validate:legacy  # permissif
```

---

## 🔗 Intégration externe

### Q: "Intégrer dans GitLab CI?"
**A:** Adapter workflow:
```yaml
silc_guardian:
  script:
    - npm run build
    - npm run validate:json
  artifacts:
    reports:
      junit: silc-report.json
```

### Q: "SonarQube integration?"
**A:** Possible via JSON export:
```bash
npm run validate:json > silc-sonar.json
# Importer JSON dans SonarQube
```

### Q: "Slack notifications?"
**A:** Via GitHub Actions:
```yaml
- uses: slackapi/slack-github-action@v1
  with:
    payload: ${{ env.SILC_REPORT }}
```

---

## 🎯 Bonnes pratiques

### ✅ À FAIRE
```bash
npm run validate  # Avant commit
npm run build     # Compiler avant push
npm run validate:legacy  # Plan transition
npm run check:compliance  # Vérifier signature
```

### ❌ À NE PAS FAIRE
```bash
git commit --no-verify  # Contourner hook
rm SILC_COMPLIANCE.json  # Supprimer signature
npm run validate:legacy --force  # Mode legacy permanent
```

---

## 📞 Support ultime

**Problème non résolu?**

1. Consulter README.md
2. Vérifier ARCHITECTURE.md
3. Lire SCENARIOS.ts pour exemples
4. Contacter équipe architecture

**Signaler bug:**
```bash
# Reproduire
npm run validate

# Documenter
# Créer issue avec:
# - Error message
# - Fichier problématique
# - Commande exécutée
# - Version Node.js
```

---

**FAQ complète — Prêt à coder!** 🚀
