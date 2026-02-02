# 🔍 SILC Guardian — Guide de Contrôle de Qualité

## Vérification préalable à la production

### ✅ Checklist technique

- [ ] TypeScript compile sans erreurs : `npm run build`
- [ ] Tous les imports sont résolus
- [ ] Dépendances minimales (glob, @typescript-eslint/typescript-estree)
- [ ] Tests unitaires passent (si écrits)
- [ ] CLI fonctionne : `node dist/cli/index.js validate`

### ✅ Checklist fonctionnelle

**Validations lexicales**
- [ ] Les 7 mots interdits sont bien bloqués
- [ ] Les contrats autorisés sont bien acceptés
- [ ] Les patterns de nommage (suffixes) sont vérifiés

**Validations structurelles**
- [ ] Entités forcées dans `domain/entities/`
- [ ] Relations forcées dans `domain/relations/`
- [ ] Processus forcés dans `domain/processes/`
- [ ] DTO forcés dans `application/dtos/`
- [ ] Services forcés dans `application/services/`
- [ ] Repositories forcés dans `infrastructure/repositories/`

**Analyse AST**
- [ ] Entités ne contenant pas de méthodes d'action
- [ ] Services ne contenant pas de méthodes décisionnaires
- [ ] Processus contenant au moins une logique

**Mode legacy**
- [ ] `--mode=legacy` whitelist les chemins corrects
- [ ] Conversions BLOCKING → WARNING en legacy
- [ ] Plan de migration est généré

**Signature SILC**
- [ ] Fichier généré quand violations = 0
- [ ] Fichier non généré si violations BLOCKING > 0
- [ ] Vérification signature fonctionne

### ✅ Checklist d'intégration

**Husky**
- [ ] Hook pre-commit bloque les violations BLOCKING
- [ ] Warnings n'empêchent pas le commit
- [ ] Message d'erreur clair

**CI/CD (GitHub Actions)**
- [ ] Job SILC Guardian s'exécute sur PR
- [ ] Rapport JSON uploadé en artifact
- [ ] Commentaire PR généré
- [ ] Merge bloqué si BLOCKING

### ✅ Checklist d'usabilité

**CLI**
- [ ] `silc-guardian validate` affiche rapport lisible
- [ ] `silc-guardian validate --report=json` affiche JSON valide
- [ ] `silc-guardian validate --mode=legacy` génère plan migration
- [ ] `silc-guardian check-compliance` vérifie signature
- [ ] `silc-guardian help` affiche usage clair

**Reporters**
- [ ] ConsoleReporter classe violations par sévérité
- [ ] ConsoleReporter inclut article SILC
- [ ] JsonReporter génère JSON ISO 8601
- [ ] Violations lisibles et exploitables

## 🧪 Cas de test critiques

### Test 1 : Blocker sur entité mal placée
```
File: src/models/User.entity.ts
Expected: Violation BLOCKING (Article 8)
```

### Test 2 : Blocker sur mot interdit
```
File: src/domain/entities/AdminUser.entity.ts
Expected: Violation BLOCKING (Article 5)
```

### Test 3 : Blocker sur Service décisionnaire (AST)
```
File: src/application/services/ApprovalService.ts
Method: approve()
Expected: Violation BLOCKING (Article 6 AST)
```

### Test 4 : Warning sur naming (pas bloquant)
```
File: src/domain/relations/userRole.relation.ts
Expected: Violation WARNING (Article 7)
```

### Test 5 : Mode legacy whiteliste chemins
```
Command: silc-guardian validate --mode=legacy
File: src/controllers/LegacyController.ts
Expected: Violation convertie en WARNING
```

### Test 6 : Signature générée si zéro violation
```
Violations: 0
Expected: architecture/compliance/SILC_COMPLIANCE.json créé
```

## 📊 Critères de succès

| Critère | Seuil | Statut |
|---------|-------|--------|
| Violations BLOCKING bloquées | 100% | ✅ |
| Articles SILC couverts | 7/7 | ✅ |
| AST detection en place | Oui | ✅ |
| Mode legacy fonctionnel | Oui | ✅ |
| Signature de conformité | Oui | ✅ |
| Husky intégré | Oui | ✅ |
| CI/CD configurée | GitHub Actions | ✅ |
| Documentation complète | README + INTEGRATION | ✅ |

## 🚀 Déploiement

1. **Local** : `npm run build && npm run validate`
2. **Pre-commit** : Husky hook automatique
3. **CI** : GitHub Actions sur PR
4. **Production** : Zéro BLOCKING requis

## 📞 Escalade

- **Bug dans règle** → Éditer règle, tester, rebuild
- **Faux positif** → Vérifier contrat dans lexique
- **Performance** → Profiler avec `--verbose`

## ✔️ Sign-off

Validé et prêt pour production:
- [ ] Développement: `npm run build && npm run validate`
- [ ] Intégration: `.github/workflows/silc-guardian.yml`
- [ ] Husky: `.husky/pre-commit`
- [ ] Documentation: README.md + INTEGRATION.md
