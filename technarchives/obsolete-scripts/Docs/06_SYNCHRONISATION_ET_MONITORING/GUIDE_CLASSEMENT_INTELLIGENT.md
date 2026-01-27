# 📋 Guide - Classement Intelligent & Auto Scheduler

## 🎯 Vue d'ensemble

Le système de classement intelligent automatise l'organisation du dossier `Docs/` avec protection complète des fichiers critiques.

### Caractéristiques
- ✅ Scan intelligent toutes les 2 heures
- ✅ Classification automatique par patterns
- ✅ Protection des fichiers critiques (JAMAIS déplacés)
- ✅ Vérification d'intégrité
- ✅ Audit complet avec checksums SHA256
- ✅ Alertes en cas d'anomalie
- ✅ Logging structuré par niveau
- ✅ Exécution en arrière plan

---

## 🚀 Démarrage Rapide

### 1. Exécuter un scan manuel
```bash
npm run docs:classify
```

### 2. Démarrer le scheduler (toutes les 2h)
```bash
npm run docs:classifier:start
```

### 3. Vérifier l'état
```bash
npm run docs:classifier:status
```

### 4. Afficher les logs
```bash
npm run docs:classifier:logs
npm run docs:classifier:tail  # Temps réel
```

### 5. Arrêter le scheduler
```bash
npm run docs:classifier:stop
```

---

## 📊 Architecture

### Scripts Créés

| Script | Fichier | Fonction |
|--------|---------|----------|
| **Classification** | `docs_intelligent_classifier.cjs` | Scan et classement intelligent |
| **Scheduler** | `docs_scheduler.cjs` | Exécute classification toutes les 2h |
| **Manager** | `docs_manager.cjs` | Gère démarrage/arrêt du scheduler |

### Fichiers de Sortie

```
cascade/logs/
├── move_docs_intelligent.log    (Logs de classification)
├── docs_scheduler.log           (Logs du scheduler)
├── docs_alerts.log              (Alertes)
├── docs_state.json              (État courant)
└── docs_scheduler.pid           (PID du processus)
```

---

## 🔒 Protection des Fichiers Critiques

### Fichiers JAMAIS Déplacés

#### 1. Fichiers Sous Surveillance (Monitoring)
```
.env
.env.production
package.json
package-lock.json
.sequelizerc
babel.config.json
.eslintrc.cjs
```

#### 2. Fichiers de Configuration BD
```
database.js
migrations/
```

#### 3. Fichiers de Sécurité
```
auth.middleware.js
security.middleware.js
tokenBlacklist.middleware.js
rateLimit.middleware.js
```

#### 4. Fichiers Système
```
jest.config.js
nodemon.json
ecosystem.config.js
pm2.config.js
```

#### 5. Logs & Audit
```
surveillance.log
sync_backend_db_ai.log
combined.log
error.log
spofe_docs_audit.json
```

#### 6. Monitoring
```
monitoring-surveillance.js
sync_backend_db_spofe_v2.1_AI.js
```

#### 7. Index & README
```
INDEX.md
README.md
FINAL_INDEX.md
```

---

## 📋 Règles de Classification

### 01_ANALYSE_ET_DIAGNOSTICS
Patterns: `rapport`, `analyse`, `diagnostic`, `résumé`, `fichiers_critiques`, `surveillance`, `monitoring`, `index_surveillance`, `guide_implementation`

**Fichiers classés:**
- RAPPORT_SYNCHRONISATION_COMPLETE_2026-01-21.md
- FICHIERS_CRITIQUES_A_SURVEILLER.md
- GUIDE_IMPLEMENTATION_SURVEILLANCE.md
- INDEX_SURVEILLANCE.md
- RESUME_SURVEILLANCE.md
- SURVEILLANCE_1PAGE_RESUME.md

### 02_CONFIGURATION_ET_SCRIPTS
Patterns: `config`, `script`, `setup`, `correction`, `architecture_surveillance`, `deployment_checklist`, `deployment_guide`

**Fichiers classés:**
- ARCHITECTURE_SURVEILLANCE_2SCRIPTS.md
- DEPLOYMENT_CHECKLIST.md
- DEPLOYMENT_GUIDE_v2.1.md

### 03_ARCHITECTURE_TECHNIQUE
Patterns: `mcd`, `mpd`, `architecture`, `convention`, `implementation`, `final_implementation`

**Fichiers classés:**
- FINAL_IMPLEMENTATION_SUMMARY.md

### 04_DATABASE
Patterns: `sql`, `database`, `structure`, `tables`, `schema`

### 05_LOGS_ET_AUDITS
Patterns: `audit`, `log`, `check`, `report`, `verification`, `post-sync`, `checklist`, `resume`

**Fichiers classés:**
- DEPLOYMENT_CHECKLIST.md
- DEPLOYMENT_GUIDE_v2.1.md
- POST-SYNC_CHECKLIST.md
- VERIFICATION_FINALE.md

---

## 🎯 Commandes NPM Complètes

### Classification & Scanning

```bash
# Scan manuel immédiat
npm run docs:classify

# Watch mode (écoute les changements dans Docs/)
npm run docs:classify:watch

# Scan + monitoring fichiers critiques
npm run docs:scan
```

### Scheduler

```bash
# Démarrer en arrière plan (toutes les 2h)
npm run docs:classifier:start

# Vérifier l'état
npm run docs:classifier:status

# Arrêter
npm run docs:classifier:stop
```

### Logs & Monitoring

```bash
# Afficher derniers 50 logs
npm run docs:classifier:logs

# Afficher logs en temps réel
npm run docs:classifier:tail

# Afficher l'aide
npm run docs:classifier:info
```

---

## 📈 Rapport de Scan

### Structure du Rapport

```json
{
  "timestamp": "2026-01-21T10:07:12.016Z",
  "version": "2.1.0",
  "scan": {
    "scan_results": {
      "moved": 0,
      "protected_critical": 3,
      "protected_system": 0,
      "errors": 0,
      "total_processed": 3
    },
    "details": {
      "moves": [],
      "protected_files": [
        {
          "file": "FINAL_INDEX.md",
          "reason": "Fichier critique nécessaire au fonctionnement",
          "protected_at": "2026-01-21T10:07:12.030Z"
        }
      ]
    }
  },
  "integrity": {
    "integrityOK": true,
    "missingFiles": []
  },
  "status": "OK"
}
```

---

## 🔍 Logging Structuré

### Niveaux de Log

| Niveau | Fichier | Usage |
|--------|---------|-------|
| **INFO** | move_docs_intelligent.log | Informations générales |
| **SUCCESS** | move_docs_intelligent.log | Opération réussie |
| **PROTECT** | move_docs_intelligent.log | Fichier protégé |
| **WARNING** | docs_alerts.log | Avertissement |
| **ERROR** | docs_alerts.log | Erreur |
| **CRITICAL** | docs_alerts.log | Erreur critique |

### Exemple de Logs

```
[2026-01-21T10:07:12.019Z] [INFO] ╔════════════════════════════════════════════╗
[2026-01-21T10:07:12.019Z] [INFO] ║ DÉBUT DU SCAN INTELLIGENT - Dossier Docs  ║
[2026-01-21T10:07:12.019Z] [INFO] ╚════════════════════════════════════════════╝
[2026-01-21T10:07:12.027Z] [INFO] ⚠️ Aucun dossier pour: DEMARRAGE_RAPIDE_5MIN.md
[2026-01-21T10:07:12.030Z] [PROTECT] 🔒 FICHIER CRITIQUE PROTÉGÉ: FINAL_INDEX.md
[2026-01-21T10:07:12.042Z] [REPORT] ════════════════════════════════════════════
[2026-01-21T10:07:12.042Z] [REPORT] RÉSULTATS DU SCAN INTELLIGENT:
[2026-01-21T10:07:12.042Z] [REPORT]   ✅ Déplacés: 0
[2026-01-21T10:07:12.042Z] [REPORT]   🔒 Protégés (critique): 3
[2026-01-21T10:07:12.042Z] [REPORT]   ❌ Erreurs: 0
```

---

## ⚠️ Gestion des Alertes

### Types d'Alertes

| Alerte | Cause | Action |
|--------|-------|--------|
| **File Critical Protected** | Détecte tentative déplacement fichier critique | ✅ Bloqué (normal) |
| **Missing File** | Fichier critique manquant | ⚠️ Vérifier intégrité |
| **Classification Error** | Erreur lors déplacement | ❌ Voir logs |
| **Anomaly Detected** | Comportement anormal | 🔍 Investiguer |

### Consulter les Alertes

```bash
cat cascade/logs/docs_alerts.log
```

---

## 🔧 Configuration Personnalisée

### Modifier l'Intervalle (défaut: 2h)

Éditer `docs_scheduler.cjs`:
```javascript
const INTERVAL = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
// Changer pour 1 heure:
// const INTERVAL = 1 * 60 * 60 * 1000;
// Changer pour 30 minutes:
// const INTERVAL = 30 * 60 * 1000;
```

### Ajouter des Fichiers à Protéger

Éditer `docs_intelligent_classifier.cjs`:
```javascript
const CRITICAL_PROTECTED_FILES = [
  // ... existants ...
  'mon_fichier_critique.md'  // Ajouter ici
];
```

### Ajouter des Patterns de Classification

Éditer `docs_intelligent_classifier.cjs`:
```javascript
const CLASSIFICATION = {
  '02_CONFIGURATION_ET_SCRIPTS': [
    // ... existants ...
    /mon_pattern/i  // Ajouter ici
  ]
};
```

---

## 🚨 Dépannage

### Le scheduler ne démarre pas
```bash
# Vérifier les droits
npm run docs:classifier:status

# Voir les détails
npm run docs:classifier:logs
```

### Fichiers déplacés par erreur
```bash
# Vérifier l'audit
cat cascade/logs/docs_audit.json

# Restaurer manuellement depuis Docs/05_LOGS_ET_AUDITS/spofe_docs_audit.json
```

### Trop de logs
```bash
# Nettoyer les logs
rm cascade/logs/move_docs_intelligent.log
rm cascade/logs/docs_scheduler.log

# Puis redémarrer
npm run docs:classifier:stop
npm run docs:classifier:start
```

---

## 📝 Cas d'Usage

### 1. Production - Scheduler Actif
```bash
# Au démarrage de l'application
npm run docs:classifier:start

# Monitoring occasionnel
npm run docs:classifier:status
npm run docs:classifier:logs
```

### 2. Développement - Scans Manuels
```bash
# Avant de commiter
npm run docs:classify

# Vérifier l'intégrité
npm run docs:scan
```

### 3. CI/CD - Validation Automatique
```bash
# Dans le pipeline
npm run docs:classify

# Vérifier pas d'erreurs
npm run docs:classifier:logs | grep "ERROR\|CRITICAL"
```

---

## 📊 État du Système

Voir l'état courant:
```bash
cat cascade/logs/docs_state.json
```

Exemple:
```json
{
  "lastRun": "2026-01-21T10:07:12.016Z",
  "fileCount": 3,
  "errors": 0,
  "filesProcessed": 3
}
```

---

**Version**: 2.1.0  
**Date**: 21 janvier 2026  
**Status**: ✅ Production Ready
