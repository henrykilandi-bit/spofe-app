# 🛠️ SILC Guardian — Guide de Maintenabilité et Contribution

## 👨‍💼 Maintenance

### Qui maintient?
- **Équipe Architecture** — Changements à SILC v2
- **Tech Lead** — Revues de violations
- **DevOps** — Intégration CI/CD

### Responsabilités

| Rôle | Responsabilités |
|------|-----------------|
| **Architecte** | Articles SILC + nouvelles règles |
| **Développeur** | Respecter les règles, corriger violations |
| **DevOps** | CI/CD + hooks + signature |
| **Lead** | Audit exceptions, plan legacy |

---

## 📝 Ajouter une nouvelle règle

### 1. Créer le fichier

```typescript
// src/rules/custom/MyRule.ts
import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";

export class MyRule {
  static check(file: string, nature: Nature): Violation[] {
    const violations: Violation[] = [];
    
    if (nature === "MY_TARGET") {
      // Votre logique
      violations.push(
        new Violation(
          "BLOCKING",  // ou "WARNING"
          "SILC v2 — Article N",  // Citer l'article
          file,
          "Message d'erreur explicite",
          "NAMING",  // ou "STRUCTURE", "AST", etc.
          "Attente",
          "Action corrective"
        )
      );
    }
    
    return violations;
  }
}
```

### 2. L'intégrer dans Guardian

```typescript
// src/core/Guardian.ts
import { MyRule } from "../rules/custom/MyRule";

violations.push(...MyRule.check(file, nature));
```

### 3. Compiler et tester

```bash
npm run build
npm run validate
```

### 4. Ajouter test

```typescript
// test/MyRule.test.ts (optionnel)
const violations = MyRule.check("src/example.ts", "MY_TARGET");
expect(violations.length).toBe(1);
expect(violations[0].severity).toBe("BLOCKING");
```

---

## 🔄 Mettre à jour un contrat SILC

### Ajouter un contrat autorisé

```typescript
// src/lexicon/allowed-contracts.ts
export const ALLOWED_CONTRACTS = [
  // ... existants
  "NewContract"  // Nouveau
];
```

**Effet**: Entités nommées `NewContract` deviennent acceptées.

### Ajouter un mot interdit

```typescript
// src/lexicon/forbidden-words.ts
export const FORBIDDEN_WORDS = [
  // ... existants
  "ForbiddenWord"  // Nouveau
];
```

**Effet**: Aucun identifiant ne peut contenir `ForbiddenWord`.

---

## 🐛 Déboguer une violation

### Cas 1 : Faux positif (violation non justifiée)

```bash
# Identifier le fichier
npm run validate

# Vérifier la règle
# Éditer la règle concernée dans src/rules/

# Recompiler
npm run build

# Retester
npm run validate
```

### Cas 2 : Violation non détectée

```bash
# Ajouter logging
export class MyRule {
  static check(file: string, nature: Nature): Violation[] {
    console.log(`Checking ${file} (nature: ${nature})`);
    // ...
  }
}

# Recompiler et retester
npm run build
npm run validate
```

---

## 📊 Audit violations existantes

```bash
# Rapport JSON complet
npm run validate:json > violations.json

# Analyser les violations
cat violations.json | jq '.violations.blocking'

# Mode legacy pour plan de migration
npm run validate:legacy
```

---

## 🔄 Workflow de correction

### Pour développeur

```
1. Commit local
   ↓
2. Hook pre-commit vérifie
   ↓
   NON-BLOQUANT → Commit OK
   BLOQUANT → Commit rejeté + message
   ↓
3. Corriger violations
   ↓
4. Retenter commit
   ↓
5. Si OK → PR créée
```

### Pour CI/CD

```
PR créée
   ↓
GitHub Actions déclenche SILC Guardian
   ↓
   COMPLIANT → Merge autorisé
   VIOLATIONS → Merge bloqué + commentaire PR
```

---

## 🛠️ Commands de maintenance

```bash
# Build
npm run build

# Validation standard
npm run validate

# Validation JSON (pour parsing)
npm run validate:json

# Mode legacy (transition)
npm run validate:legacy

# Vérifier conformité
npm run check:compliance

# Watch mode (optionnel)
npm run dev
```

---

## 📈 Monitoring

### Signature SILC

```bash
# Vérifier
npm run check:compliance

# Fichier généré?
ls -la architecture/compliance/SILC_COMPLIANCE.json
```

### Violations historiques

```bash
# Garder un log
npm run validate:json >> violations-history.log

# Analyser tendances
grep '"severity": "BLOCKING"' violations-history.log | wc -l
```

---

## 🚨 Escalations

| Situation | Action |
|-----------|--------|
| **Nombreuses violations legacy** | Activer `--mode=legacy` + plan migration |
| **Violation non justifiée** | Audit + correction règle |
| **Exception nécessaire** | Documented whitelist temporaire |
| **Nouvelle contrainte SILC** | Ajouter règle + former équipe |

---

## 📚 Extension AST

### Ajouter règle AST

```typescript
// src/rules/ast/AstRule.ts
if (nature === "CUSTOM") {
  const violations = AstAnalyzer.parseFile(file);
  // Votre logique sémantique
}
```

### Exemples

```typescript
// Détecter imports interdits
if (ast.imports.some(i => i.source.includes("admin"))) {
  violation("Import interdit");
}

// Détecter patterns dangereux
if (ast.variables.some(v => v.name === "adminFlag")) {
  violation("Variable administrative détectée");
}
```

---

## 🔐 Sécurité & Intégrité

### Signature SILC

```json
{
  "status": "COMPLIANT",
  "timestamp": "2026-01-28T22:31:00Z",
  "violations": 0,
  "validUntil": "2026-02-04T22:31:00Z"
}
```

**Rules**:
- ✅ Générée = zéro BLOCKING
- ❌ Suppression = merge rejeté
- ✅ Vérifiable = `npm run check:compliance`

---

## 📊 Versioning

```
SILC Guardian v1.0.0
├─ MAJOR (1.x.y) — Changements SILC v2 majeurs
├─ MINOR (x.1.y) — Nouvelles règles
└─ PATCH (x.y.1) — Corrections bugs
```

---

## 🎓 Formation équipe

### Présentation (30 min)

1. **SILC v2 principles** (5 min)
   - 7 articles
   - 3 niveaux de sévérité
   - Opposabilité

2. **Guardian architecture** (5 min)
   - Lexique + Structure + AST
   - Reporters + Compliance

3. **Workflow (pre-commit + CI)** (10 min)
   - Husky hook
   - GitHub Actions
   - Message d'erreur

4. **Mode legacy & migration** (5 min)
   - Whitelist chemins
   - Plan de migration
   - Gradualité

5. **Démo live** (5 min)
   - Crée violation
   - Bloque commit
   - Affiche correctif

---

## 💬 Support & Questions

**Q: Comment ajouter exception temporaire?**
A: Mode legacy ou whitelist spécifique dans `LegacyAuditMode.ts`

**Q: Puis-je désactiver une règle?**
A: Non par design. Contacter architecte pour revoir SILC.

**Q: Performance avec 1000+ fichiers?**
A: AST parsing ~100ms/fichier, total <2min.

**Q: Comment signer conformité?**
A: Automatique si zéro BLOCKING. Vérifié par CI.

---

## 📋 Checklist déploiement nouvelle version

- [ ] Tests passent (`npm run validate`)
- [ ] Zéro violations BLOCKING
- [ ] Signature SILC générée
- [ ] Documentation mise à jour
- [ ] Version bumped (`package.json`)
- [ ] CHANGELOG rédigé
- [ ] Équipe formée aux changements
- [ ] Hook Husky testé
- [ ] CI/CD testée
- [ ] Merge autorisé + merge

---

**Maintenu par**: Équipe Architecture  
**Dernière mise à jour**: 2026-01-28  
**Statut**: Production-ready ✅
