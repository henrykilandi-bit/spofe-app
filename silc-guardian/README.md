# 🛡️ SILC Guardian — Validateur architectural normatif

**SILC Guardian** est un validateur TypeScript **bloquant et opposable** pour l'architecture SPOFE.
Il impose les normes SILC v2 à la compilation et au commit.

## 🎯 Objectifs

- ✅ **Bloquant** : Aucune violation BLOCKING ne passe
- ✅ **Explicatif** : Chaque erreur cite l'article SILC correspondant
- ✅ **Intelligent** : Analyse AST + lexique + structure
- ✅ **Traçable** : Signature de conformité SILC_COMPLIANCE.json
- ✅ **Légal** : Prêt pour audit et CI/CD

## 🔧 Installation

```bash
cd silc-guardian
npm install
npm run build
```

## 🚀 Utilisation

### Validation standard
```bash
npm run validate
```

### Validation avec rapport JSON (pour CI)
```bash
npm run validate:json
```

### Mode legacy (transition contrôlée)
```bash
npm run validate:legacy
```

### Vérifier la conformité
```bash
npm run check:compliance
```

## 📊 Sorties

### Console (lisible)
```
🛡️  RAPPORT SILC GUARDIAN

Fichiers analysés: OK
Violations trouvées: 2

🚫 BLOCKING (1):
  [SILC v2 — Article 8] src/models/User.js
    📌 Fichier ENTITY hors de domain/entities

⚠️  WARNINGS (1):
  [SILC v2 — Article 4] src/domain/processes/CompanyApproval.process.ts
    📌 Processus ne commence pas par un contrat

✅ SILC COMPLIANT — Merge autorisé
```

### JSON (pour CI/CD)
```json
{
  "status": "COMPLIANT",
  "timestamp": "2026-01-28T22:31:00Z",
  "violations": 0,
  "silcVersion": "2.0",
  "guardianVersion": "1.0.0"
}
```

## 🔌 Intégration Husky (pre-commit)

### Installation
```bash
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run silc:validate"
```

### Effet
- ❌ Commit bloqué si violations BLOCKING
- ⚠️ Commit autorisé avec warnings (mais affichés)
- 💬 Message SILC apparaît dans le terminal

## 🤖 Intégration CI (GitHub Actions)

Ajouter au workflow `.github/workflows/silc.yml`:

```yaml
name: SILC Guardian

on: [pull_request]

jobs:
  silc:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run silc:validate
```

Le job devient **required check** → bloque le merge.

## 🧪 Analyse AST (Niveau 2)

SILC Guardian détecte au-delà du lexique :

```typescript
// ❌ BLOCKING — Entité avec logique d'action
export class User {
  assign(role: Role) { /* ... */ } // Violation détectée!
}

// ❌ BLOCKING — Service qui décide
export class ApprovalService {
  approve(request: Request) { /* ... */ } // Violation détectée!
}

// ✅ Accepté — Processus avec logique métier
export class CompanyOnboarding {
  execute(company: Company) { /* ... */ }
}
```

## 📋 Mode Legacy (transition SILC)

Pour coexister ancien code + SILC v2 :

```bash
npm run validate:legacy
```

Effet :
- `src/controllers/**` → warnings (pas bloquant)
- `src/models/**` → warnings (pas bloquant)
- `domain/**` → BLOCKING (normalisé)

Génère un **plan de migration** :
```json
{
  "totalLegacyFiles": 24,
  "estimatedEffort": "5 sprints",
  "migrationItems": { ... }
}
```

## 🔐 Signature SILC Compliant

Quand zéro BLOCKING → génération de :
```json
// architecture/compliance/SILC_COMPLIANCE.json
{
  "status": "COMPLIANT",
  "silcVersion": "2.0",
  "guardianVersion": "1.0.0",
  "timestamp": "2026-01-28T22:31:00Z",
  "violations": 0,
  "validUntil": "2026-02-04T22:31:00Z"
}
```

### Règles opposabilité
- ✅ Toute version sans ce fichier = **NON CONFORME**
- ✅ Suppression du fichier = **rejet PR automatique**
- ✅ Traçable, signé, vérifiable

## 📏 Règles SILC

| Article | Règle | Sévérité |
|---------|-------|----------|
| 4 | Processus gouvernés (pas d'actions directes) | BLOCKING |
| 5 | Entités = contrats seulement | BLOCKING |
| 6 | Services = orchestration, pas décision | WARNING → BLOCKING (AST) |
| 7 | Relations avec pattern PascalCase | WARNING |
| 8 | Structure de répertoires obligatoire | BLOCKING |
| 9 | DTO = structuration pure | BLOCKING |
| 10 | Repositories = accès données, pas logique | BLOCKING |

## 🧵 Fluxe complet

```
Code → git add
    ↓
Pre-commit hook
    ↓
silc-guardian validate (BLOCKING?)
    ↓
   NON → Commit autorisé
    ↓
   OUI → Commit rejeté + message SILC
    ↓
PR créée
    ↓
GitHub Actions (SILC Guardian)
    ↓
   COMPLIANT → Merge autorisé + signature
    ↓
   NON-COMPLIANT → Merge bloqué
```

## 🔍 Diags

**Fichier détecté en mauvaise nature ?**
```
Vérifier le suffixe (.entity.ts, .process.ts, etc.)
NatureDetector sensible à la casse en fin de chemin
```

**Warnings visibles mais commit passe ?**
```
Warnings = non-bloquants
Ajouter au .husky/pre-commit pour strictness
```

**Signature SILC non générée ?**
```
Vérifier que violations.length === 0 (0 BLOCKING + autres)
Ou force: npm run check:compliance
```

## 📈 Performance

- **Temps de scan** : ~500ms pour 50+ fichiers
- **Mémoire** : <50MB (minimaliste)
- **Dépendances** : 2 seulement (glob, @typescript-eslint/typescript-estree)

## 🔜 Roadmap

- [ ] Support ESLint plugin
- [ ] Export audit aux formatages
- [ ] Mode "strictness" auto-crescendo
- [ ] Intégration SonarQube
- [ ] Dashboard temps réel

## 📝 Licence

© 2026 SPOFE — SILC Guardian v1.0.0
Normatif et opposable.
