# 🔐 NO WRITE OUTSIDE GUARDIAN - Système Immunitaire SPOFE

## 🎯 Mission Constitutionnelle

Garantir techniquement (pas idéologiquement) que **toute écriture métier passe exclusivement par le Guardian**.

## 🛡️ Principe Fondamental

```
❌ AUCUNE mutation métier en dehors de src/guardian/**
✅ Guardian = autorité constitutionnelle réelle
```

## 🔍 Ce qui est considéré comme "WRITE"

| Type AST | Exemples | Détecté |
|----------|----------|---------|
| `AssignmentExpression` | `a = 1`, `obj.x = y` | ✅ |
| `PropertyAssignment` | `obj.prop = value` | ✅ |
| `CallExpression` (mutating) | `save()`, `insert()`, `update()`, `delete()` | ✅ |
| `Array mutations` | `push()`, `splice()`, `pop()`, `shift()` | ✅ |
| `Map/Set mutations` | `set()`, `add()`, `delete()`, `clear()` | ✅ |
| `Increment/Decrement` | `++`, `--` | ✅ |
| `Element assignment` | `array[index] = value` | ✅ |

## 🚀 Utilisation

### **Validation manuelle**
```bash
npm run validate:no-write
```

### **Tests automatisés**
```bash
npm run test:no-write
```

### **Validation constitutionnelle complète**
```bash
npm run validate:constitution
```

### **Intégration Pipeline**
```bash
# Pré-build proof
npm run pre-build-proof

# Pré-commit
npm run pre-commit
```

## 📁 Structure de l'outil

```
tools/contracts-check/no-write-guardian/
├── no-write.check.ts      # Scan AST - cœur du système
├── no-write.rules.ts      # Règles & enforcement
├── no-write.spec.ts       # Tests de conformité
├── index.ts              # Orchestration & CLI
├── vitest.config.ts      # Configuration tests
└── README.md             # Documentation
```

## 🔧 Fonctionnement Technique

1. **Scan AST** : Parse tous les fichiers TypeScript du module
2. **Filtrage Guardian** : Ignore `src/guardian/` (zone autorisée)
3. **Détection** : Identifie les patterns de mutation
4. **Violation** : Génère un rapport détaillé
5. **Blocage** : Arrête le build si violation détectée

## 📊 Rapport de Violation

```
❌ NO WRITE OUTSIDE GUARDIAN - 2 violation(s) found:

  📍 cascade/modules/module-x/src/service.ts:15 → Assignment outside Guardian
  📍 cascade/modules/module-y/src/repository.ts:23 → Mutating call save() outside Guardian

💡 REMEDIATION:
   Move all business write operations to src/guardian/
   Read-only operations are allowed elsewhere
   Consider using CQRS patterns for read/write separation
```

## 🎯 Patterns Autorisés

### **✅ Lecture partout**
```typescript
// ✅ Read operations - autorisées partout
const data = repository.findById(id);
const results = data.filter(item => item.active);
const total = items.length;
```

### **✅ Écritures uniquement dans Guardian**
```typescript
// ✅ Write operations - uniquement dans src/guardian/
export class OieGuardian {
  validateCommand(ctx: Context, cmd: Command): void {
    // Écritures autorisées ici
    this.state.set(cmd.id, cmd);
    this.repository.save(cmd);
    this.eventBus.emit(cmd);
  }
}
```

### **❌ Écritures interdites ailleurs**
```typescript
// ❌ Write operations - interdits hors Guardian
export class SomeService {
  processData(data: Data): void {
    this.repository.save(data); // 🚨 VIOLATION
    this.cache.set(key, value); // 🚨 VIOLATION
    results.push(item);        // 🚨 VIOLATION
  }
}
```

## 🧪 Tests

### **Test de conformité**
```bash
npm run test:no-write
```

### **Test sur module spécifique**
```bash
tsx tools/contracts-check/no-write-guardian/index.ts cascade/modules/module-x
```

## 🔄 Intégration CI/CD

### **GitHub Actions**
```yaml
- name: Enforce SPOFE Constitution
  run: npm run validate:constitution
```

### **Pre-commit hooks**
```json
{
  "pre-commit": "npm run validate:no-write"
}
```

## 🎉 Bénéfices

- **🛡️ Protection constitutionnelle** : Le Guardian devient l'autorité réelle
- **🚨 Détection précoce** : Les violations sont détectées au développement
- **📋 Documentation vivante** : Le code respecte automatiquement les règles
- **🔒 Zéro triche** : Impossible de contourner le Guardian techniquement
- **⚡ Performance** : Vérification AST ultra-rapide

## 🏆 SPOFE Level

Ce système place SPOFE dans la catégorie **rarissime** des systèmes où :
- Les règles constitutionnelles sont **techniquement enforceables**
- Le **CQRS est garanti par le compilateur**
- L'architecture ne peut pas dériver **même intentionnellement**

**👉 Très peu de systèmes vont jusque-là.**
