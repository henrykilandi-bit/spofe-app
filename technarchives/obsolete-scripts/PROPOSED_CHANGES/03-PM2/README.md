# ⚙️ SOLUTION #3: PM2 Process Manager

## 🎯 Objectif

Gérer les processus backend et frontend avec PM2 pour remplacer les terminaux manuels et bénéficier d'un process management production-ready.

## ⚠️ PROBLÈME RÉSOLU

**#1 - Serveur Vite se ferme immédiatement (Sévérité MOYEN)**

Actuellement:
```bash
# ❌ Nécessite 2 terminaux séparés
Terminal 1: cd cascade && npm run dev
Terminal 2: cd frontend && npm run dev
# Se ferment si autres commandes exécutées
```

## ✅ SOLUTION

**PM2** = Process Manager production-grade:
- ✅ Processus en arrière-plan (daemon)
- ✅ Auto-restart si crash
- ✅ Cluster mode (multi-instances)
- ✅ Logs centralisés
- ✅ Monitoring intégré
- ✅ Déploiement automatisé

## 📁 FICHIERS CRÉÉS

```
03-PM2/
├── README.md (ce fichier)
├── ecosystem.config.js  → Configuration PM2
├── pm2-commands.md      → Aide-mémoire commandes
└── windows-setup.md     → Installation Windows spécifique
```

## 🔧 FICHIERS MODIFIÉS

Aucun! PM2 s'ajoute sans modifier le code existant.

## 📝 INSTRUCTIONS D'ACTIVATION

### Étape 1: Installer PM2 globalement

```bash
npm install -g pm2
```

### Étape 2: Copier ecosystem.config.js

```bash
# Depuis PROPOSED_CHANGES/03-PM2/
cp ecosystem.config.js "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\"
```

### Étape 3: Démarrer avec PM2

```bash
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0"
pm2 start ecosystem.config.js
```

**Résultat attendu:**
```
┌─────┬──────────────────┬─────────┬─────────┬──────────┐
│ id  │ name             │ status  │ cpu     │ memory   │
├─────┼──────────────────┼─────────┼─────────┼──────────┤
│ 0   │ spofe-backend    │ online  │ 0.3%    │ 85.2 MB  │
│ 1   │ spofe-frontend   │ online  │ 0.1%    │ 42.5 MB  │
└─────┴──────────────────┴─────────┴─────────┴──────────┘
```

### Étape 4: Vérifier les processus

```bash
pm2 status
pm2 logs
pm2 monit
```

## 🧪 TESTS DE VALIDATION

```bash
# 1. Voir les processus
pm2 list

# 2. Voir logs en temps réel
pm2 logs --lines 50

# 3. Monitoring ressources
pm2 monit

# 4. Tester auto-restart
pm2 stop spofe-backend
pm2 start spofe-backend
# Vérifie que l'app redémarre

# 5. Tester backend
curl http://localhost:3001/api-docs

# 6. Tester frontend
curl http://localhost:5173
```

## 💻 COMMANDES PM2 ESSENTIELLES

### Démarrage/Arrêt

```bash
# Démarrer tout
pm2 start ecosystem.config.js

# Arrêter tout
pm2 stop all

# Redémarrer tout
pm2 restart all

# Arrêter un processus
pm2 stop spofe-backend

# Redémarrer un processus
pm2 restart spofe-frontend
```

### Monitoring

```bash
# Liste des processus
pm2 list

# Logs temps réel
pm2 logs

# Logs d'un processus
pm2 logs spofe-backend

# Monitoring CPU/RAM
pm2 monit

# Dashboard web
pm2 web
# Ouvre http://localhost:9615
```

### Gestion

```bash
# Supprimer un processus
pm2 delete spofe-backend

# Supprimer tous
pm2 delete all

# Sauvegarder config
pm2 save

# Restaurer processus
pm2 resurrect

# Flush logs
pm2 flush
```

## ⚠️ RISQUES

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **PM2 non installé** | 🟡 Moyen | Installation globale requise |
| **Ports déjà utilisés** | 🟡 Moyen | pm2 stop all avant redémarrage |
| **Watch mode consume CPU** | 🟢 Faible | Désactiver watch en production |

## 🔙 ROLLBACK

Si problème avec PM2, revenir aux terminaux manuels:

```bash
# Arrêter PM2
pm2 stop all
pm2 delete all

# Revenir à l'ancien mode
# Terminal 1
cd cascade && npm run dev

# Terminal 2
cd frontend && npm run dev
```

## 🏭 PRODUCTION vs DÉVELOPPEMENT

### Développement (actuel)

```javascript
// ecosystem.config.js
{
  instances: 1,           // Une seule instance
  exec_mode: 'fork',      // Mode simple
  watch: true,            // Auto-reload sur changements
  env: {
    NODE_ENV: 'development',
    PORT: 3001
  }
}
```

### Production (futur)

```javascript
// ecosystem.config.js
{
  instances: 'max',       // Une instance par CPU
  exec_mode: 'cluster',   // Load balancing
  watch: false,           // Pas de watch
  env_production: {
    NODE_ENV: 'production',
    PORT: 3001
  }
}
```

Démarrer en production:
```bash
pm2 start ecosystem.config.js --env production
```

## 🚀 AUTO-START AU BOOT (Optionnel)

Pour démarrer PM2 automatiquement au démarrage de Windows:

```bash
# 1. Démarrer tes apps
pm2 start ecosystem.config.js

# 2. Sauvegarder la config
pm2 save

# 3. Configurer auto-start
pm2 startup

# 4. Suivre les instructions affichées
```

⚠️ Sur Windows, nécessite des permissions admin.

## 📊 LOGS & MONITORING

PM2 crée automatiquement des logs:

```
c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\logs\
├── backend-error.log   → Erreurs backend
├── backend-out.log     → Logs backend
├── frontend-error.log  → Erreurs frontend
└── frontend-out.log    → Logs frontend
```

Rotation automatique configurée dans `ecosystem.config.js`:
- Date format: `YYYY-MM-DD HH:mm:ss Z`
- Merge logs: Oui

## 🎯 PRIORITÉ

**🟡 HAUTE** - Résout complètement le problème #1

## ⏱️ TEMPS D'IMPLÉMENTATION

- Installation PM2: 2 min
- Copie config: 1 min
- Démarrage: 1 min
- Tests validation: 5 min

**Total: ~10 minutes**

## ✅ CHECKLIST D'ACTIVATION

- [ ] PM2 installé globalement (`npm install -g pm2`)
- [ ] `ecosystem.config.js` copié à la racine
- [ ] `pm2 start ecosystem.config.js` exécuté
- [ ] `pm2 list` montre 2 processus online
- [ ] Backend accessible sur http://localhost:3001
- [ ] Frontend accessible sur http://localhost:5173
- [ ] Logs visibles avec `pm2 logs`
- [ ] (Optionnel) `pm2 save` pour persistence

## 🔗 RESSOURCES

- Documentation PM2: https://pm2.keymetrics.io/docs/usage/quick-start/
- PM2 sous Windows: https://pm2.keymetrics.io/docs/usage/windows/
- Voir `pm2-commands.md` pour aide-mémoire complet

## 📖 RÉFÉRENCE

Voir [ANALYSE_SOLUTIONS_PROPOSEES.md](../../ANALYSE_SOLUTIONS_PROPOSEES.md) section "Solution #2"
