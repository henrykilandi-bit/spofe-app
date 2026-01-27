# ✅ SPOFE v2.1 - POST-SYNC CHECKLIST

## 🎯 Immédiat (Avant utilisation)

- [ ] **Appliquer migrations BD**
  ```bash
  npm run db:init
  ```
  Crée: chartsOfAccounts, journalEntries, journalEntryLines, accountBalances

- [ ] **Charger données OHADA**
  ```bash
  npm run db:seed
  ```
  Charge: Plan comptable OHADA (45+ comptes)

- [ ] **Vérifier intégrité BD**
  ```bash
  npm run db:verify
  ```
  Doit afficher: ✅ Toutes tables créées

- [ ] **Test rapide API**
  ```bash
  npm run test
  ```
  Ou:
  ```bash
  npm run health
  ```

## 🔍 Surveillance Active

### Option 1: Watch Mode (Développement)
```bash
npm run monitor:watch
```
Surveille en continu les fichiers config/middleware/models

### Option 2: Cronjob Horaire (Production)
```bash
npm run monitor:hourly
```
Vérification chaque heure (background)

### Option 3: Manuel (Vérification rapide)
```bash
npm run monitor:critical
```
Rapport complet des 32 fichiers

## 📊 Rapports Disponibles

```bash
# Synchronisation complète
cat logs/sync-complete.log

# Monitoring fichiers
cat monitoring/surveillance.log

# BD sync
cat logs/sync_backend_db_ai.log

# Tous logs
cat logs/combined.log
```

## 🚀 Démarrage Application

```bash
# Développement
npm run dev

# Production
npm start

# Avec surveillance
npm run monitor:watch &
npm run dev
```

## 🔐 Avant Déploiement

- [ ] Vérifier: `npm run monitor:critical` = ✅ 100%
- [ ] Vérifier: `npm run db:verify` = ✅ Toutes tables
- [ ] Vérifier: Zéro erreurs dans `logs/error.log`
- [ ] Vérifier: `.env` contient tous secrets
- [ ] Vérifier: Variables d'env production correctes

## ⚠️ Actions Si Problèmes

### Erreur Import ES Module
```bash
# Vérifier que correction est appliquée
grep "import sequelize from" src/scripts/db-verify.js
```

### BD Inaccessible
```bash
# Vérifier credentials
grep DB_ .env

# Vérifier MySQL est running
npm run health
```

### Fichiers Manquants
```bash
# Rapport complet
npm run sync:complete
```

### Monitoring Échoue
```bash
# Vérifier logs
cat logs/surveillance.log | tail -20
```

## 📈 Performance Check

```bash
# Request time
time npm run health

# Memory usage (après npm start)
# Voir dans logs/performance.log

# DB Query performance
npm run db:verify | grep "performance"
```

## 🎓 Références

- Rapport complet: [RAPPORT_SYNCHRONISATION_COMPLETE_2026-01-21.md](RAPPORT_SYNCHRONISATION_COMPLETE_2026-01-21.md)
- Fichiers critiques: [FICHIERS_CRITIQUES_A_SURVEILLER.md](cascade/docs/FICHIERS_CRITIQUES_A_SURVEILLER.md)
- Guide surveillance: [GUIDE_IMPLEMENTATION_SURVEILLANCE.md](cascade/docs/GUIDE_IMPLEMENTATION_SURVEILLANCE.md)

---

**Status**: ✅ Prêt pour démarrage application
**Next Step**: `npm run db:init && npm run dev`
