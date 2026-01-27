# Installation PM2 sous Windows

## 📋 Prérequis

- Node.js installé (v16+ recommandé)
- npm installé
- PowerShell ou CMD avec droits admin (pour certaines opérations)

## 🚀 Installation

### Méthode 1: Installation Globale (Recommandée)

```powershell
npm install -g pm2
```

### Méthode 2: Avec pnpm

```powershell
pnpm install -g pm2
```

### Méthode 3: Avec Yarn

```powershell
yarn global add pm2
```

## ✅ Vérification Installation

```powershell
pm2 --version
# Devrait afficher: 5.x.x ou supérieur
```

## ⚠️ Problèmes Courants Windows

### 1. "pm2 n'est pas reconnu"

**Cause**: PM2 pas dans le PATH

**Solution**:

```powershell
# Trouver le chemin npm global
npm config get prefix
# Exemple: C:\Users\henry\AppData\Roaming\npm

# Ajouter au PATH système:
# Panneau de config → Système → Variables d'environnement
# Ajouter: C:\Users\henry\AppData\Roaming\npm
```

Ou via PowerShell (admin):

```powershell
$npmPath = npm config get prefix
[Environment]::SetEnvironmentVariable("Path", "$env:Path;$npmPath", "User")
```

### 2. "Exécution de scripts désactivée"

**Erreur**:
```
pm2 : Impossible de charger le fichier ... car l'exécution de scripts est désactivée
```

**Solution**:

```powershell
# Ouvrir PowerShell en admin
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 3. "EPERM: operation not permitted"

**Solution**:
```powershell
# Lancer PowerShell/CMD en administrateur
# Ou installer sans droits admin:
npm install -g pm2 --unsafe-perm
```

### 4. Ports déjà utilisés

```powershell
# Vérifier si port 3001 ou 5173 utilisé
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Tuer processus si nécessaire
taskkill /PID <PID> /F
```

## 🔧 Configuration Windows-Specific

### PM2 en tant que Service Windows (Optionnel)

Pour démarrer PM2 automatiquement au boot de Windows:

```powershell
# 1. Installer pm2-windows-service
npm install -g pm2-windows-service

# 2. Configurer
pm2-service-install -n PM2

# 3. Démarrer le service
net start PM2

# 4. Configurer apps
pm2 start ecosystem.config.js
pm2 save
```

### Désinstaller le service

```powershell
pm2-service-uninstall
```

## 📁 Chemins PM2 sous Windows

```
C:\Users\<username>\.pm2\
├── logs\           → Logs des apps
├── pids\           → Process IDs
├── pm2.log         → Log PM2 lui-même
├── pm2.pid         → PID du daemon
└── dump.pm2        → Config sauvegardée
```

## 🧪 Test Complet

```powershell
# 1. Vérifier installation
pm2 --version

# 2. Créer app test
echo "console.log('Hello PM2')" > test.js

# 3. Démarrer avec PM2
pm2 start test.js

# 4. Voir les processus
pm2 list

# 5. Voir logs
pm2 logs test

# 6. Arrêter et nettoyer
pm2 stop test
pm2 delete test
del test.js
```

## 🐛 Debugging

### Voir les logs PM2 lui-même

```powershell
type $env:USERPROFILE\.pm2\pm2.log
```

### Réinitialiser PM2

```powershell
pm2 kill
del -Recurse -Force $env:USERPROFILE\.pm2
npm install -g pm2
```

### Tester sans PM2

```powershell
# Si PM2 ne fonctionne pas, tester directement:
cd cascade
npm run dev

# Dans un autre terminal:
cd frontend
npm run dev
```

## 🔄 Alternatives à PM2 sous Windows

Si PM2 pose problème:

1. **Windows Task Scheduler** (natif)
2. **Nodemon** (développement seulement)
   ```powershell
   npm install -g nodemon
   nodemon src/server.js
   ```
3. **Forever**
   ```powershell
   npm install -g forever
   forever start src/server.js
   ```

## 📞 Support

Si problèmes persistent:

1. Vérifier logs: `$env:USERPROFILE\.pm2\pm2.log`
2. Issue GitHub PM2: https://github.com/Unitech/pm2/issues
3. Revenir aux terminaux manuels temporairement

## ✅ Checklist Installation Windows

- [ ] Node.js installé et accessible (`node --version`)
- [ ] npm fonctionnel (`npm --version`)
- [ ] PM2 installé globalement (`npm install -g pm2`)
- [ ] PM2 dans le PATH (`pm2 --version` fonctionne)
- [ ] Execution Policy configurée si PowerShell
- [ ] Test avec app simple réussi
- [ ] `ecosystem.config.js` copié à la racine du projet
- [ ] `pm2 start ecosystem.config.js` fonctionne
- [ ] Backend accessible (http://localhost:3001)
- [ ] Frontend accessible (http://localhost:5173)

## 🎯 Commandes Post-Installation

```powershell
# Une fois PM2 installé:
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0"
pm2 start ecosystem.config.js
pm2 logs
pm2 monit
```
