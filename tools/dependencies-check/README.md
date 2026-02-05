# SPOFE Dependencies Compliance Checker

## 🎯 Objectif

Ce système transforme les fichiers `DEPENDENCIES.md` en **contrats exécutables** qui empêchent SPOFE de dériver silencieusement avec le temps.

## 🔒 Garanties P0

- ✅ **Pas de dépendances circulaires**
- ✅ **Symétrie des déclarations** (A → B ⟺ B déclare A comme consommateur)  
- ✅ **Modules existants uniquement**
- ✅ **Contraintes READ-ONLY respectées**
- ✅ **Autorisation explicite de consommation**

## 🧱 Architecture

```
tools/dependencies-check/
├── dependencies.parser.ts      # Parse DEPENDENCIES.md
├── dependencies.graph.ts       # Graphe & détection cycles
├── dependencies.rules.ts       # Règles de conformité SPOFE
├── dependencies-check.spec.ts  # Tests E2E compliance
└── index.ts                    # Point d'entrée CLI
```

## 🚀 Usage

### Vérification rapide
```bash
npm run validate:dependencies
```

### Tests complets
```bash
npm run test:dependencies
```

### Aide
```bash
npm run dependencies:help
```

### Intégration CI/CD
```bash
npm run ci:dependencies
```

## 📋 Règles de Validation

### 1. Existence des Modules
Tous les modules référencés doivent exister physiquement dans `cascade/modules/`.

### 2. Symétrie Obligatoire
Si le module A déclare consommer le module B :
- ✅ B **doit** déclarer A dans sa liste de consommateurs
- ❌ Asymétrie = violation SPOFE

### 3. Pas de Circularité
- ❌ A → B → C → A (cycle direct)
- ❌ A → B → A (cycle simple)
- ✅ A → B, C → B (convergence autorisée)

### 4. READ-ONLY Strict
- Modules `oie`, `coaching`, `investisseurs` = READ-ONLY uniquement
- Pas de dépendances WRITE autorisées
- Validation des interfaces contractuelles

### 5. Autorisation Explicite
Aucun module ne peut consommer un autre sans déclaration mutuelle explicite.

## 🔍 Exemples de Violations

### ❌ Dépendance Asymétrique
```
Module 'coaching' consomme 'oie' 
MAIS 'oie' ne déclare pas 'coaching' comme consommateur
```

### ❌ Circularité Détectée
```
Circular dependency: coaching → oie → budget → coaching
```

### ❌ Module Inexistant
```
Module 'coaching' consomme unknown module 'inexistant'
```

## 📊 Sortie du Système

### ✅ Succès
```
✅ All SPOFE inter-module dependencies are compliant

=== SUGGESTED DEPLOYMENT ORDER ===
1. vente
2. immobilisation  
3. cost-structure
4. oie
5. coaching

🚀 Ready for BUILD_PROOF certification
```

### ❌ Échec
```
❌ Found 2 SPOFE dependency violation(s):

## ASYMMETRY (1)
  • Dependency mismatch: 'coaching' consumes 'oie' but 'oie' does not declare 'coaching' as consumer

## CIRCULAR_DEPENDENCY (1)  
  • Circular dependency detected: coaching → oie → coaching

🚫 GO PROD REFUSED - Dependencies not compliant
```

## 🔄 Intégration CI/CD

### GitHub Actions
```yaml
- name: SPOFE Dependencies Compliance
  run: |
    npm install
    npm run ci:dependencies
```

### Échec = Déploiement Bloqué
```bash
# Exit code 1 = Pipeline failure
npm run validate:dependencies || exit 1
```

## 🧪 Tests Inclus

- **Parsing des DEPENDENCIES.md** : Structure valide
- **Détection de cycles** : Algorithme Tarjan
- **Validation symétrie** : Déclarations mutuelles
- **Contraintes READ-ONLY** : Modules OIE, Coaching, etc.
- **Ordre topologique** : Séquence de déploiement

## ⚙️ Configuration

### Package.json Scripts
```json
{
  "validate:dependencies": "npx tsx tools/dependencies-check/index.ts",
  "test:dependencies": "vitest tools/dependencies-check/dependencies-check.spec.ts",
  "dependencies:help": "npx tsx tools/dependencies-check/index.ts --help",
  "ci:dependencies": "npm run validate:dependencies && npm run test:dependencies"
}
```

### CI Script
```bash
bash ci/validate-dependencies-ci.sh
```

## 📝 Format des DEPENDENCIES.md

### Structure Obligatoire
```markdown
# DEPENDENCIES — Module Name

## Nature du module
- Type : Module type
- Rôle : Module role
- Sens des flux : Direction

## Modules consommés (READ-ONLY)
| Module | Usage |
|--------|-------|
| module1 | Purpose |

## Modules consommateurs (READ-ONLY)  
| Module | Finalité |
|--------|----------|
| consumer1 | Purpose |

## Règle de gouvernance
Governance rules...
```

## 🎯 Impact SPOFE

Ce système transforme SPOFE d'une architecture **"bien pensée"** en une architecture qui **se défend toute seule**.

### Avant
- Documentation manuelle
- Violations silencieuses possibles
- Dérive architecturale non détectée

### Après  
- ✅ **Contrats exécutables**
- ✅ **Validation automatique**
- ✅ **Déploiement bloqué** en cas de violation
- ✅ **Architecture auto-protégée**

## 🏆 Marqueur de Maturité

Ce test de conformité P0 est un **marqueur de maturité très élevé** pour SPOFE :

- Architecture industrielle
- Gouvernance automatisée  
- Prévention des régressions
- Confiance long terme

> **"Une architecture qui se surveille elle-même ne peut pas dériver silencieusement"**