# 🕐 Cache Scheduler - Guide Complet

## Vue d'Ensemble

Le **Cache Scheduler** de SPOFE v2.1 gère automatiquement l'optimisation du cache Redis via des tâches planifiées avec node-cron :

- **Purge automatique** : Supprime les entrées expirées et obsolètes
- **Warm-up automatique** : Précharge les patterns SPOFE critiques
- **Nettoyage mémoire** : Gère le fallback cache en RAM

---

## Architecture

### 3 Composants Clés

```
┌─────────────────────────────────────────────────────────┐
│  Cache Scheduler Service (cache-scheduler.service.js)   │
│  - Orchestrateur principal des tâches                   │
│  - Gestion des cron jobs (node-cron)                    │
│  - Statistiques et monitoring                           │
└─────────────────────────────────────────────────────────┘
          │                    │                    │
          ├─────────────────┐  ├─────────────────┐ ├─────────────────┐
          ↓                 ↓  ↓                 ↓ ↓                 ↓
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   PURGE     │   │  WARM-UP    │   │  CLEANUP    │
    │   JOB       │   │   JOB       │   │   JOB       │
    └─────────────┘   └─────────────┘   └─────────────┘
```

### Fichiers Impliqués

```
cascade/src/
├── services/
│   └── cache-scheduler.service.js      (300 LOC) - Orchestrateur
├── jobs/
│   ├── cache-purge.job.js              (200 LOC) - Tâche purge
│   └── cache-warmup.job.js             (250 LOC) - Tâche warm-up
├── bootstrap/
│   └── cache-scheduler-bootstrap.js    (150 LOC) - Initialisation
├── controllers/
│   └── scheduler.controller.js         (80  LOC) - API endpoints
├── routes/
│   └── scheduler.routes.js             (50  LOC) - Routing
└── middleware/
    └── [auth.middleware.js]            - Protection des endpoints
```

---

## Configuration

### Variables d'Environnement

Ajouter à votre `.env` :

```dotenv
# ═════════════════════════════════════════════════════════════════════
# CACHE SCHEDULER CONFIGURATION - NODE-CRON SCHEDULING
# ═════════════════════════════════════════════════════════════════════

# Enable/disable cache scheduler on startup
CACHE_SCHEDULER_ENABLED=true

# Purge expired cache entries (default: 2 AM daily)
# Format: standard cron expression (minute hour day month day-of-week)
CACHE_PURGE_SCHEDULE=0 2 * * *

# Pre-load warm-up cache patterns (default: midnight daily)
CACHE_WARMUP_SCHEDULE=0 0 * * *

# Clean fallback RAM cache (default: every 6 hours)
CACHE_MEMORY_CLEANUP_SCHEDULE=0 */6 * * *
```

### Formats de Cron

Utilise le format cron standard (minute heure jour mois jour-semaine) :

```
Minute (0-59)
Hour   (0-23)
Day    (1-31)
Month  (1-12)
DayOfWeek (0-6, 0=Dimanche)

Exemples:
0 2 * * *       = 02:00 chaque jour
0 0 * * *       = Minuit chaque jour  
0 */6 * * *     = Toutes les 6 heures
0 3 1 * *       = 03:00 le 1er de chaque mois
30 2 * * 0      = 02:30 le dimanche
```

---

## Utilisation

### 1️⃣ Démarrage Automatique

À la startup du serveur, le scheduler s'initialise automatiquement :

```javascript
// Dans cascade/src/server.js
import schedulerBootstrap from './bootstrap/cache-scheduler-bootstrap.js';

// Au démarrage
await schedulerBootstrap.initialize();
```

Le scheduler lance immédiatement un warm-up initial pour pré-charger le cache.

### 2️⃣ Monitorer la Santé

#### Via cURL

```bash
# ✅ Vérifier la santé du scheduler
curl -X GET http://localhost:3001/api/scheduler/health \
  -H "Authorization: Bearer $TOKEN"

# Réponse:
{
  "status": "healthy",
  "scheduler": {
    "running": true,
    "activeJobs": 3,
    "lastPurge": "2026-01-23T02:00:00.000Z",
    "lastWarmup": "2026-01-23T00:00:00.000Z",
    "lastCleanup": "2026-01-23T18:00:00.000Z"
  },
  "statistics": { ... }
}
```

#### Via npm

```bash
npm run scheduler:health
```

### 3️⃣ Consulter les Statistiques

```bash
# Via API
curl -X GET http://localhost:3001/api/scheduler/stats \
  -H "Authorization: Bearer $TOKEN"

# Via npm
npm run scheduler:stats
```

Affiche :
- Nombre de tâches de purge exécutées
- Nombre de patterns warm-up chargés
- Nombre d'exécutions du nettoyage
- Mémoire libérée (MB)
- Durée moyenne d'exécution

### 4️⃣ Lister les Tâches

```bash
curl -X GET http://localhost:3001/api/scheduler/tasks \
  -H "Authorization: Bearer $TOKEN"

# Réponse:
{
  "data": [
    {
      "name": "purge",
      "schedule": "0 2 * * *",
      "running": true,
      "nextRun": "2026-01-24T02:00:00.000Z"
    },
    {
      "name": "warmup",
      "schedule": "0 0 * * *",
      "running": true,
      "nextRun": "2026-01-24T00:00:00.000Z"
    },
    {
      "name": "cleanup",
      "schedule": "0 */6 * * *",
      "running": true,
      "nextRun": "2026-01-23T18:00:00.000Z"
    }
  ]
}
```

### 5️⃣ Déclencher Manuellement une Tâche

Très utile pour tester ou forcer l'exécution en dehors du calendrier.

#### Option A: Via cURL

```bash
# Purger le cache maintenant
curl -X POST http://localhost:3001/api/scheduler/trigger/purge \
  -H "Authorization: Bearer $TOKEN"

# Warm-up cache maintenant
curl -X POST http://localhost:3001/api/scheduler/trigger/warmup \
  -H "Authorization: Bearer $TOKEN"

# Nettoyage RAM cache maintenant
curl -X POST http://localhost:3001/api/scheduler/trigger/cleanup \
  -H "Authorization: Bearer $TOKEN"
```

#### Option B: Via npm

```bash
npm run scheduler:trigger:purge
npm run scheduler:trigger:warmup
npm run scheduler:trigger:cleanup
```

#### Option C: Directement en Node.js

```javascript
import cacheScheduler from './src/services/cache-scheduler.service.js';

// Déclencher une tâche
await cacheScheduler.triggerTask('purge');
```

---

## Tâches Détails

### 🧹 Tâche: PURGE

**Quand** : 2 AM quotidiennement (configurable via `CACHE_PURGE_SCHEDULE`)

**Qu'est-ce qu'elle fait** :

1. **Scanne Redis** par batch de 100 clés
2. **Supprime les entrées** qui correspondent à :
   - `TTL = -2` (déjà expiré)
   - `TTL < 60 secondes` (expirira très bientôt)
   - `Taille > 1 MB` (optimisation mémoire)

3. **Purge le cache fallback** (en RAM) :
   - Supprime les entrées > 24h
   - Calcule l'espace libéré

**Output** :

```json
{
  "success": true,
  "jobName": "purge",
  "purgeDuration": 1234,
  "keysRemoved": 245,
  "memoryFreed": 12.5,
  "redisStats": {
    "scanned": 1000,
    "removed": 245,
    "expiringSoon": 45,
    "tooLarge": 200
  },
  "fallbackStats": {
    "removedFromCache": 15,
    "memoryFreed": 2.3
  },
  "timestamp": "2026-01-23T02:00:00.000Z"
}
```

### 🔥 Tâche: WARM-UP

**Quand** : Minuit quotidiennement + au démarrage du serveur

**Patterns Pré-configurés** (6 critiques SPOFE) :

| Pattern | Clé | TTL | Description |
|---------|-----|-----|-------------|
| Chart of Accounts | `cache:chart-of-accounts` | 7j | Codes OHADA (1000-9999) |
| Journal Types | `cache:journal-types` | 30j | Ventes, Achats, Banque, Caisse |
| Accounting Rules | `cache:accounting-rules` | 7j | Debit/credit balance, décimales |
| Fiscal Periods | `cache:fiscal-periods` | 1j | Période actuelle, fermées |
| Company Config | `cache:company-config` | 1j | Devise, exercice fiscal, langue |
| UI Config | `cache:ui-config` | 1j | Thème, locale, format date |

**Output** :

```json
{
  "success": true,
  "jobName": "warmup",
  "warmupDuration": 456,
  "warmedPatterns": 6,
  "patternsList": [
    {
      "key": "cache:chart-of-accounts",
      "status": "loaded",
      "size": 1.5,
      "ttl": 604800
    },
    {
      "key": "cache:journal-types",
      "status": "loaded",
      "size": 0.3,
      "ttl": 2592000
    },
    ...
  ],
  "timestamp": "2026-01-23T00:00:00.000Z"
}
```

### 🧻 Tâche: CLEANUP

**Quand** : Toutes les 6 heures (configurable via `CACHE_MEMORY_CLEANUP_SCHEDULE`)

**Qu'est-ce qu'elle fait** :

1. Scanne le cache fallback en RAM
2. Supprime les entrées > 24 heures
3. Calcule l'espace libéré
4. Recalcule les stats d'utilisation mémoire

**Output** :

```json
{
  "success": true,
  "jobName": "cleanup",
  "cleanupDuration": 123,
  "entriesRemoved": 89,
  "memoryFreed": 5.7,
  "timestamp": "2026-01-23T18:00:00.000Z"
}
```

---

## Bonnes Pratiques

### ✅ À Faire

1. **Surveiller régulièrement** :
   ```bash
   npm run scheduler:health
   npm run scheduler:stats
   ```

2. **Tester après changements** :
   ```bash
   npm run scheduler:trigger:warmup
   npm run scheduler:trigger:purge
   ```

3. **Ajuster les schedules selon charge** :
   - Purge souvent en production haute charge
   - Warm-up plus tôt avant pics de trafic

4. **Monitorer les logs** :
   ```bash
   tail -f logs/security.log | grep scheduler
   tail -f logs/combined.log | grep scheduler
   ```

### ❌ À Éviter

1. ❌ Ne pas déclencher purge pendant pics de charge
2. ❌ Ne pas modifier les patterns warm-up en production sans test
3. ❌ Ne pas augmenter la fréquence de cleanup sans besoin
4. ❌ Ne pas désactiver le scheduler sans raison

---

## Personnalisation

### Ajouter un Pattern Warm-up Custom

```javascript
import cacheWarmupJob from './src/jobs/cache-warmup.job.js';

// Ajouter un nouveau pattern
cacheWarmupJob.addPattern({
  key: 'cache:my-custom-data',
  data: await fetchMyCustomData(),
  ttl: 86400,  // 24 heures
  description: 'My custom warm-up pattern'
});
```

### Changer un Schedule Dynamiquement

```javascript
import cacheScheduler from './src/services/cache-scheduler.service.js';

// Reprogrammer la purge à 3 AM
cacheScheduler.schedulePurge('0 3 * * *');

// Reprogrammer le warm-up à 23h
cacheScheduler.scheduleWarmup('0 23 * * *');
```

### Désactiver une Tâche

```javascript
cacheScheduler.stop();  // Arrête le scheduler complètement

// Ou seulement une tâche...
// (À venir: support granulaire)
```

---

## Monitoring & Troubleshooting

### Problème: Scheduler ne démarre pas

**Symptôme** : Aucune activité même après startup

**Diagnostic** :
```bash
npm run scheduler:health
# Doit retourner status: 'healthy'
```

**Solutions** :
1. Vérifier `CACHE_SCHEDULER_ENABLED=true` dans `.env`
2. Vérifier les logs : `tail -f logs/error.log | grep scheduler`
3. Vérifier Redis connexion : `npm run health`

### Problème: Tâches n'exécutent pas à l'heure

**Symptôme** : Les timestamps ne correspondent pas

**Vérifier** :
```bash
# Vérifier le schedule cron
npm run scheduler:tasks

# Déclencher manuellement pour tester
npm run scheduler:trigger:purge

# Vérifier les logs
grep "executePurge" logs/combined.log
```

### Problème: Mémoire qui augmente constamment

**Symptôme** : RAM augmente malgré cleanup

**Vérifier** :
1. La fréquence de cleanup (augmenter de 6h à 3h)
2. La taille des patterns warm-up
3. Les TTLs (réduire si trop long)

**Fix** :
```bash
# Forcer un cleanup maintenant
npm run scheduler:trigger:cleanup

# Augmenter la fréquence dans .env
CACHE_MEMORY_CLEANUP_SCHEDULE=0 */3 * * *
```

---

## Performance & Sécurité

### Performance

| Métrique | Valeur | Notes |
|----------|--------|-------|
| Durée purge | ~1-2s | Dépend de la taille du cache |
| Durée warm-up | ~0.5-1s | Patterns standards |
| Durée cleanup | ~0.5s | Cache RAM uniquement |
| Impact CPU | < 5% | Exécution hors heures de pointe |
| Impact Mémoire | Réduit | Libère 5-15 MB à chaque purge |

### Sécurité

- ✅ Endpoints protégés par JWT (auth obligatoire)
- ✅ Logging d'audit de toute exécution manuelle
- ✅ Validation des task names
- ✅ Gestion des erreurs centralisée

---

## Exemples Complets

### Scénario 1: Cold Start avec Warm-up

```bash
# Serveur démarre
npm run dev

# Logs affichent:
# ✅ Cache Scheduler Bootstrap: Starting initialization...
# 🔥 Running initial cache warm-up...
# ✅ Initial warm-up: 6 patterns loaded

# Vérifier l'état
npm run scheduler:health
# { "status": "healthy", ... }
```

### Scénario 2: Maintenance Matinale

```bash
# 2 AM: Purge automatique s'exécute
# Vérifier le résultat
npm run scheduler:stats

# Output:
# {
#   "purgeTaskCount": 1,
#   "lastPurgeTime": "2026-01-23T02:00:00.000Z",
#   "totalMemoryFreed": 45.3,
#   ...
# }
```

### Scénario 3: Teste après Déploiement

```bash
# Après déploiement, forcer tous les tests
npm run scheduler:trigger:purge
npm run scheduler:trigger:warmup
npm run scheduler:trigger:cleanup

# Vérifier que tout fonctionne
npm run scheduler:health
npm run scheduler:stats
```

---

## Intégration avec Système Complet

Le scheduler s'intègre avec:

1. **Cache Service** (`advanced-cache.service.js`)
   - Utilise les mêmes patterns
   - Fallback logic synchrone

2. **Logging** (`logger.js`)
   - Audit logging pour compliance
   - Error logging pour troubleshooting

3. **API** (`scheduler.routes.js`)
   - Health checks
   - Manual triggers
   - Statistics

4. **PM2** (optionnel)
   - Restarts si le scheduler crash
   - Monitoring via PM2 Plus

---

## Déploiement Production

### Checklist Pré-Deployment

- [ ] Vérifier `CACHE_SCHEDULER_ENABLED=true`
- [ ] Ajuster les schedules selon charge attendue
- [ ] Tester les 3 tâches manuellement
- [ ] Vérifier les logs pour erreurs
- [ ] Monitorer mémoire/CPU pendant 24h
- [ ] Configurer alerts si scheduler crash
- [ ] Documenter les schedules custom

### Monitoring Recommandé

```bash
# Terminal 1: Surveiller la santé
watch -n 300 'npm run scheduler:health 2>/dev/null | jq ".status"'

# Terminal 2: Surveiller les stats
watch -n 300 'npm run scheduler:stats 2>/dev/null | jq ".data"'

# Terminal 3: Surveiller les logs
tail -f logs/combined.log | grep -i scheduler
```

---

## FAQ

**Q: Puis-je modifier les schedules en production?**
A: Oui, modifiez le `.env` et redémarrez le processus.

**Q: Que se passe-t-il si une tâche échoue?**
A: Elle est loggée, la prochaine exécution continue normalement.

**Q: Puis-je ajouter des patterns warm-up custom?**
A: Oui, via `cacheWarmupJob.addPattern()`.

**Q: Les tâches tournent-elles vraiment à l'heure cron?**
A: Oui, node-cron respecte strictement les heures (±1 minute).

**Q: Comment savoir si le scheduler est vraiment actif?**
A: Vérifiez les logs et déclenchez une tâche manuelle.

---

**Version**: 2.1.0  
**Dernière mise à jour**: 23 Jan 2026  
**Statut**: ✅ Production-Ready
