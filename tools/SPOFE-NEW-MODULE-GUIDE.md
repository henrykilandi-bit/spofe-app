# 🏗️ SPOFE NEW MODULE GENERATOR

**Script officiel** pour créer automatiquement des modules SPOFE conformes au Golden Module.

---

## 🎯 OBJECTIF

Générer **instantanément** un nouveau module SPOFE avec :
- ✅ Structure identique au Golden Module
- ✅ Documents contractuels présents
- ✅ Périmètre clair (SCOPE.md)
- ✅ Architecture posée (ARCHITECTURE.md) 
- ✅ Aucun code hors périmètre par défaut
- ✅ Prêt pour Guardian, BUILD_PROOF et CI

**👉 Aucun module ne doit plus jamais être créé à la main.**

## 🧑‍💻 UTILISATION

### Commande rapide
```bash
npm run new-module stock
```

### Commande directe  
```bash
node tools/spofe-new-module.js stock
```

### Résultat généré
```
cascade/modules/stock/
├── contract/
│   ├── CONTRACT.md
│   ├── SCOPE.md
│   ├── ARCHITECTURE.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   ├── API_READ_ONLY.md
│   └── stock.openapi.json
├── src/
│   ├── api/controllers/
│   ├── api/dto/
│   ├── application/commands/
│   ├── application/handlers/
│   ├── application/events/
│   ├── domain/aggregates/
│   ├── domain/value-objects/
│   ├── domain/invariants/
│   ├── domain/guardian/
│   ├── infrastructure/repositories/write/
│   ├── infrastructure/repositories/read/
│   └── sql/migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── contract/
├── experimental/
│   ├── legacy/
│   ├── drafts/
│   ├── poc/
│   └── disabled-tests/
├── tsconfig.module.json
├── package.json
└── README.md
```

## ⚙️ PRÉREQUIS

- **Node.js** ≥ 18
- Repo SPOFE avec dossier `tools/`
- Dossier `modules/` (créé automatiquement)

## 🔄 WORKFLOW RECOMMANDÉ

1. **Générer le module**
   ```bash
   npm run new-module ma-feature
   ```

2. **Écrire le contrat**
   - Éditer `contract/CONTRACT.md`
   - Définir le périmètre dans `contract/SCOPE.md`

3. **Implémenter Guardian**
   - Créer `src/domain/guardian/ma-feature.guardian.ts`
   - Définir les invariants

4. **Développer les agrégats**
   - `src/domain/aggregates/`
   - `src/application/commands/`

5. **Tester**
   - Tests unitaires Guardian
   - Tests d'intégration
   - Tests E2E

6. **Valider BUILD_PROOF**
   ```bash
   npm run build-proof
   ```

## 🛡️ GARANTIES SPOFE

- ✅ **Structure Golden Module** : 100% conforme
- ✅ **Contractuel complet** : Tous les documents présents
- ✅ **Périmètre clair** : IN/OUT SCOPE défini
- ✅ **Prêt pour BUILD_PROOF** : Configuration TypeScript correcte
- ✅ **Experimental isolé** : Code non-contractuel séparé dès le début

## 🚀 EXEMPLES

### Module métier
```bash
npm run new-module comptabilite
npm run new-module facturation  
npm run new-module paie
```

### Module technique
```bash
npm run new-module notification
npm run new-module audit
npm run new-module cache
```

## 📊 VALIDATION

Après génération, le module doit :

1. **Compiler sans erreur**
   ```bash
   cd cascade/modules/mon-module && tsc --noEmit
   ```

2. **Être prêt pour Guardian**
   - Structure domain/guardian/ présente
   - Contract/GUARDIAN.md créé

3. **Respecter SPOFE**
   - experimental/ isolé
   - tsconfig.module.json correct
   - SCOPE.md défini

---

**🎯 Ce générateur garantit que 100% des modules suivent l'architecture Golden Module validée en production.**