# PM2 - Aide-Mémoire Complet

## 🚀 Démarrage / Arrêt

```bash
# Démarrer avec fichier config
pm2 start ecosystem.config.js

# Démarrer en mode production
pm2 start ecosystem.config.js --env production

# Arrêter tous les processus
pm2 stop all

# Arrêter un processus spécifique
pm2 stop spofe-backend
pm2 stop 0  # Par ID

# Redémarrer tous
pm2 restart all

# Redémarrer un processus
pm2 restart spofe-frontend

# Reload (zero-downtime restart)
pm2 reload all
pm2 reload spofe-backend

# Supprimer tous
pm2 delete all

# Supprimer un processus
pm2 delete spofe-backend
```

## 📊 Monitoring

```bash
# Liste des processus
pm2 list
pm2 ls

# Status avec détails
pm2 status

# Monitoring en temps réel (CPU, RAM)
pm2 monit

# Dashboard web
pm2 web
# Ouvre http://localhost:9615

# Informations détaillées
pm2 show spofe-backend
pm2 describe 0
```

## 📝 Logs

```bash
# Voir tous les logs en temps réel
pm2 logs

# Logs d'un processus spécifique
pm2 logs spofe-backend
pm2 logs 0

# Dernières 100 lignes
pm2 logs --lines 100

# Logs erreurs seulement
pm2 logs --err

# Flush les logs (vider)
pm2 flush

# Réinitialiser les métadonnées
pm2 reset all
```

## 💾 Sauvegarde / Restauration

```bash
# Sauvegarder la liste de processus
pm2 save

# Restaurer les processus sauvegardés
pm2 resurrect

# Dump de la config
pm2 dump

# Supprimer le dump sauvegardé
pm2 cleardump
```

## 🔄 Auto-Start

```bash
# Configurer auto-start au boot
pm2 startup

# Désactiver auto-start
pm2 unstartup

# Workflow complet:
pm2 start ecosystem.config.js
pm2 save
pm2 startup
# Suivre instructions affichées
```

## 🔧 Gestion Avancée

```bash
# Échelle (scale) le nombre d'instances
pm2 scale spofe-backend 4

# Recharger la configuration
pm2 reload ecosystem.config.js

# Mettre à jour PM2
pm2 update

# Tuer le daemon PM2 (arrête tout)
pm2 kill

# Version de PM2
pm2 --version

# Aide
pm2 --help
pm2 start --help
```

## 📈 Métriques & Profiling

```bash
# Voir les métriques
pm2 show spofe-backend

# Module de monitoring (nécessite pm2-io)
pm2 install pm2-logrotate

# Voir CPU profiling
pm2 profile:cpu 0

# Heap snapshot
pm2 profile:heap 0
```

## 🔍 Filtres & Recherche

```bash
# Filtrer par nom
pm2 list | grep spofe

# Redémarrer tous les processus matching
pm2 restart /spofe-*/

# Logs filtrés par pattern
pm2 logs --raw | grep ERROR
```

## ⚙️ Environment Variables

```bash
# Démarrer avec env spécifique
pm2 start ecosystem.config.js --env production

# Définir une variable inline
pm2 start app.js --name myapp -- --port=8080

# Voir les env vars d'un processus
pm2 env 0
```

## 📦 Cluster Mode

```bash
# Démarrer en cluster (load balancing)
pm2 start app.js -i max
pm2 start app.js -i 4  # 4 instances

# Reload zero-downtime
pm2 reload all

# Scale up/down
pm2 scale myapp +2  # Ajoute 2 instances
pm2 scale myapp 1   # Réduit à 1 instance
```

## 🌐 Déploiement

```bash
# Setup initial
pm2 deploy ecosystem.config.js production setup

# Déployer
pm2 deploy ecosystem.config.js production

# Voir liste déploiements
pm2 deploy ecosystem.config.js production list

# Rollback
pm2 deploy ecosystem.config.js production revert 1
```

## 🚨 Diagnostic

```bash
# Afficher erreurs récentes
pm2 logs --err --lines 50

# Voir pourquoi un processus crash
pm2 show spofe-backend | grep error

# Nombre de restarts
pm2 list | grep restart

# Vérifier utilisation mémoire
pm2 list | grep memory

# Tester une app avant de l'ajouter
node app.js  # Teste manuellement d'abord
```

## 📋 Exemples Pratiques

### Démarrage quotidien

```bash
pm2 start ecosystem.config.js
pm2 logs --lines 20
```

### Débugger un crash

```bash
pm2 logs spofe-backend --err --lines 100
pm2 restart spofe-backend
pm2 monit
```

### Mettre à jour l'app

```bash
git pull
pm2 reload all  # Zero-downtime
pm2 logs --lines 50
```

### Nettoyer après tests

```bash
pm2 stop all
pm2 delete all
pm2 flush
```

### Production deployment

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 logs --lines 0 --raw > /dev/null  # Start fresh
```

## 🔗 Raccourcis Utiles

```bash
# Alias pratiques (à ajouter dans .bashrc ou PowerShell profile)
alias pm2l="pm2 list"
alias pm2la="pm2 logs --lines 50"
alias pm2s="pm2 status"
alias pm2m="pm2 monit"
alias pm2r="pm2 restart all"
```

## 📱 PM2 Plus (Monitoring Cloud - Optionnel)

```bash
# Lier à PM2 Plus (monitoring en ligne)
pm2 link <secret_key> <public_key>

# Voir sur https://app.pm2.io
```

## ⚠️ Troubleshooting Windows

```powershell
# Si erreur "pm2 not found" après install
npm config get prefix
# Ajouter le chemin dans PATH système

# Si problème permissions
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Logs PM2 Windows
$env:USERPROFILE\.pm2\logs\
```

## 🎯 Commandes les Plus Utiles (Top 10)

1. `pm2 start ecosystem.config.js` - Démarre tout
2. `pm2 logs` - Voir logs temps réel
3. `pm2 list` - Liste processus
4. `pm2 monit` - Monitoring CPU/RAM
5. `pm2 restart all` - Redémarre tout
6. `pm2 stop all` - Arrête tout
7. `pm2 save` - Sauvegarde config
8. `pm2 flush` - Nettoie logs
9. `pm2 show <name>` - Détails processus
10. `pm2 reload all` - Reload zero-downtime
