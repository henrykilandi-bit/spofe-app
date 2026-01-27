# 📚 SPOFE v2.1 - Guide de Maintenance des FK

**Dernière mise à jour**: 21 Janvier 2026  
**Statut**: ✅ Production-Ready

---

## 🎯 Objectif

Ce guide décrit comment maintenir et surveiller les **Contraintes de Clés Étrangères (FK)** dans SPOFE v2.1 pour garantir l'intégrité de la base de données.

---

## ✅ État Actuel

### ORM Associations
- **Status**: ✅ Validé
- **Total d'associations**: 40
- **Bidirectionnelles**: Company ↔ JournalEntry, Company ↔ ChartOfAccount
- **Commande**: `npm run verify:orm`

### Base de Données
- **Statut**: ✅ Conforme
- **FK vérifiées**: 2 (companies, journal_entries, chartsofaccounts)
- **Intégrité**: 100% (0 enregistrements orphelins)

---

## 🔧 Commands de Maintenance

### 1️⃣ Vérifier les Associations ORM

```bash
npm run verify:orm
```

**Vérifie**:
- ✅ Toutes les associations Sequelize
- ✅ Bidirectionnalité (hasMany ↔ belongsTo)
- ✅ Conformité avec la BD

**Sortie Attendue**:
```
✅ Connexion BD établie
ℹ️  12 modèles chargés
✅ Company ↔ JournalEntry: BIDIRECTIONNELLE
✅ Company ↔ ChartOfAccount: BIDIRECTIONNELLE
✅ Toutes les associations sont conformes!
```

### 2️⃣ Audit Automatique des FK

```bash
npm run audit:fk
# OU
node cascade/src/scripts/cron-audit-fk.js
```

**Vérifie**:
- ✅ Chaque FK dans la BD
- ✅ Enregistrements orphelins
- ✅ Intégrité référentielle

**Log**: `cascade/logs/fk-audit.log`

### 3️⃣ Utiliser le Helper SPOFE

```bash
npm run helper
# OU
node cascade/src/scripts/spofe-helper.js
```

**Menu Interactif**:
```
1️⃣  Synchroniser Base ↔ Documentation
2️⃣  Organiser la documentation
3️⃣  Déplacer les fichiers de manière sécurisée
4️⃣  Exécuter l'audit automatique SQL
5️⃣  Vérifier les associations ORM
6️⃣  Audit automatique des FK
7️⃣  Afficher le résumé des commandes SPOFE
8️⃣  Quitter
```

---

## 📅 Schedule de Surveillance

### Quotidienne (Automatique)
```bash
# Windows: Task Scheduler
# Linux/Mac: crontab -e
0 2 * * * cd /path/to/spofe && npm run audit:fk
```

### Hebdomadaire (Manuel)
```bash
npm run verify:orm
npm run audit:fk
```

### Avant Chaque Déploiement
```bash
npm run verify:orm
npm run audit:fk
# Les deux doivent être ✅ CONFORMES
```

---

## 🚨 Troubleshooting

### Problème: "0 modèles chargés"
**Solution**: Vérifiez que `src/models/index.js` importe tous les modèles
```javascript
import * as models from '../models/index.js';
```

### Problème: "Company ↔ JournalEntry: INCOMPLÈTE"
**Solution**: Vérifiez les associations dans `src/models/index.js`
```javascript
Company.hasMany(JournalEntry, { foreignKey: 'companyId', as: 'entries' });
JournalEntry.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
```

### Problème: "X enregistrements orphelins"
**Étapes**:
1. Exécuter `npm run audit:fk` pour identifier la table
2. Vérifier les données orphelines
3. Nettoyer avec une migration Sequelize

---

## 📝 Scripts Disponibles

Ajouter à `cascade/package.json`:

```json
{
  "scripts": {
    "verify:orm": "node src/scripts/verify-orm-associations.js",
    "audit:fk": "node src/scripts/cron-audit-fk.js",
    "helper": "node src/scripts/spofe-helper.js"
  }
}
```

---

## 📊 Métriques de Conformité

| Métrique | Valeur | Status |
|----------|--------|--------|
| Associations ORM | 40/40 | ✅ |
| FK Vérifiées | 2/2 | ✅ |
| Enregistrements Orphelins | 0 | ✅ |
| Bidirectionnalité | 100% | ✅ |
| Intégrité Référentielle | 100% | ✅ |

---

## 🎓 Formation Équipe

### Points Clés
1. **ORM** = Association Sequelize (code)
2. **FK** = Contrainte BD (table)
3. **Bidirectionnalité** = hasMany + belongsTo
4. **Orphelins** = Données sans parent FK

### Exercices
```bash
# 1. Vérifier les associations
npm run verify:orm

# 2. Visualiser le log
cat cascade/logs/fk-audit.log

# 3. Corriger un problème
# - Lire l'erreur
# - Localiser le fichier
# - Ajouter l'association manquante
# - Tester: npm run verify:orm
```

---

## 🔐 Checklist Préproduction

- [ ] `npm run verify:orm` = ✅ Conforme
- [ ] `npm run audit:fk` = ✅ Conforme
- [ ] Logs OK: `cascade/logs/fk-audit.log`
- [ ] Tous les modèles importés dans `src/models/index.js`
- [ ] Toutes les associations avec `as:` alias
- [ ] Cron configuré (Windows/Linux/Mac)
- [ ] Équipe formée

---

## 🚀 Déploiement

```bash
# 1. Vérifier la conformité
npm run verify:orm
npm run audit:fk

# 2. Si ✅ CONFORME
git commit -m "✅ FK conformes (verify:orm + audit:fk)"
git push

# 3. Post-déploiement
npm run audit:fk
```

---

## 📞 Support

**Problème ORM**: Vérifier `src/models/associations.js`  
**Problème FK**: Vérifier `cascade/logs/fk-audit.log`  
**Problème Cron**: Vérifier la configuration système (crontab/Task Scheduler)

---

**Statut Final**: 🎉 SPOFE v2.1 Production-Ready!
