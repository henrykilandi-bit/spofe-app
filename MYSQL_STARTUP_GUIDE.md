# 🗄️ Guide de Lancement MySQL pour SPOFE v2.1

**Date:** 22 janvier 2026  
**Plateforme:** Windows 10/11  
**SGBD:** MySQL 8.0 via XAMPP

---

## ⚡ Quick Start (30 secondes)

### Option 1: Script PowerShell (Recommandé)

```powershell
cd C:\Users\henry\Desktop\SPOFE-APP\ VERS\ 1.0\cascade
.\start-mysql.ps1
```

**Résultat attendu:**
```
✅ MySQL est READY et fonctionnel!
✅ MySQL est PRÊT pour SPOFE!

Prochaines étapes:
  1. Ouvrez un nouveau terminal PowerShell
  2. cd cascade
  3. npm run dev
```

### Option 2: XAMPP Panel (GUI)

1. **Ouvrir XAMPP Control Panel**
   - Windows: `C:\xampp\xampp-control.exe`
   
2. **Cliquer "Start" à côté de "MySQL"**
   
3. **Attendre le message "Running"** ✅
   - Port: 3306
   - Utilisateur: `root`
   - Mot de passe: (vide)

---

## 🔍 Vérifier que MySQL fonctionne

### Via PowerShell

```powershell
# Vérifier le service MySQL
Get-Service MySQL* | Select-Object Status, Name

# Ou tester la connexion
C:\xampp\mysql\bin\mysql.exe -u root -e "SELECT 1"
```

**Résultat attendu:**
```
Status Name
------ ----
Running MySQL
```

### Via PhpMyAdmin (Web UI)

1. Ouvrir XAMPP Panel → Cliquer "Admin" sous MySQL
2. Naviguer vers: `http://localhost/phpmyadmin`
3. Base de données `spofe_v2_1` doit être visible

### Commande DirecteMySQL

```powershell
# Se connecter à MySQL
C:\xampp\mysql\bin\mysql.exe -u root

# Une fois connecté:
SHOW DATABASES;  -- doit afficher spofe_v2_1
USE spofe_v2_1;
SHOW TABLES;     -- doit afficher 23 tables
```

---

## 📋 Options de Démarrage de MySQL

### **Option A: Service Windows** (Recommandé - Automatique)

Le script PowerShell essaie d'abord cette méthode.

```powershell
# Démarrer le service
net start MySQL

# Arrêter le service
net stop MySQL

# Vérifier l'état
Get-Service MySQL
```

✅ **Avantages:**
- Démarre automatiquement après redémarrage
- Gestion centralisée
- Plus robuste

❌ **Inconvénients:**
- Nécessite droits administrateur

---

### **Option B: XAMPP Control Panel** (Visual)

1. Ouvrir `C:\xampp\xampp-control.exe`
2. Cliquer **"Start"** à côté MySQL
3. Attendre 5-10 secondes

✅ **Avantages:**
- Interface visuelle
- Facile pour débutants
- Contrôle immédiat

❌ **Inconvénients:**
- Arrête si vous fermez le panel
- À redémarrer après reboot

---

### **Option C: Docker** (Moderne)

Si vous avez Docker Desktop installé:

```powershell
# Créer et démarrer container MySQL
docker run -d `
  --name spofe-mysql `
  -e MYSQL_ROOT_PASSWORD= `
  -e MYSQL_DATABASE=spofe_v2_1 `
  -p 3306:3306 `
  mysql:8.0

# Vérifier que ça fonctionne
docker ps -f name=spofe-mysql
```

✅ **Avantages:**
- Isolation complète
- Version exacte
- Facile à nettoyer

❌ **Inconvénients:**
- Nécessite Docker Desktop
- Overhead mémoire (~300MB)

---

### **Option D: Démarrage Direct** (Manuel)

```powershell
# Ouvrir PowerShell en Admin et taper:
C:\xampp\mysql\bin\mysqld.exe `
  --defaults-file="C:\xampp\mysql\bin\my.ini"
```

✅ **Avantages:**
- Sans installation
- Contrôle total

❌ **Inconvénients:**
- Terminal reste bloqué
- À relancer après chaque reboot

---

## ⚙️ Configuration SPOFE + MySQL

### Vérifier la Configuration (.env)

```powershell
cd C:\Users\henry\Desktop\SPOFE-APP\ VERS\ 1.0\cascade
cat .env
```

Chercher ces lignes:

```env
# 🗄️ Base de données (MySQL via XAMPP)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=spofe_v2_1
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql
```

✅ Si ces valeurs sont présentes, SPOFE est prêt.

### Initialiser la Base de Données

```powershell
cd cascade

# Option 1: Sync automatique (crée tables)
npm run db:sync

# Option 2: Migrations + seeders
npm run db:migrate
npm run seed

# Option 3: Reset complet
npm run db:reset
```

---

## 🔧 Dépannage

### MySQL ne démarre pas

**Erreur:** `Access denied for user 'root'@'localhost'`

```powershell
# Solution: Réinitialiser MySQL
C:\xampp\mysql\bin\mysqld.exe --remove
C:\xampp\mysql\bin\mysqld.exe --install MySQL

# Puis redémarrer
net start MySQL
```

---

### Port 3306 en utilisation

```powershell
# Trouver quel process utilise le port
netstat -ano | findstr :3306

# Tuer le process (remplacer PID)
taskkill /PID 1234 /F
```

---

### MySQL démarre mais ne répond pas

```powershell
# Vérifier la status du service
Get-Service MySQL

# Voir les erreurs
Get-EventLog -LogName Application -Source MySQL -Newest 10

# Fichier log XAMPP
cat C:\xampp\mysql\data\*.err
```

---

## 📊 État Final Attendu

Après démarrage réussi:

```
╔════════════════════════════════════════════════════════════════╗
║  ✅ MySQL PRÊT POUR SPOFE                                      ║
╠════════════════════════════════════════════════════════════════╣
║  Host: localhost                                               ║
║  Port: 3306                                                    ║
║  User: root                                                    ║
║  Password: (vide)                                              ║
║  Database: spofe_v2_1                                          ║
║                                                                ║
║  Tables: 23 ✅                                                 ║
║  Indices: 50+ ✅                                               ║
║  Foreign Keys: Validées ✅                                     ║
║                                                                ║
║  SPOFE peut maintenant démarrer!                              ║
╚════════════════════════════════════════════════════════════════╝
```

---

## 🚀 Démarrer SPOFE avec MySQL

```powershell
# Terminal 1: Démarrer MySQL
cd cascade
.\start-mysql.ps1

# Terminal 2: Démarrer SPOFE (30s après)
cd cascade
npm run dev

# Terminal 3 (Optionnel): Tests de charge
cd cascade
npm run load:all
```

**Résultat:**
```
✅ Server running on port 3001
✅ Database connected: spofe_v2_1
✅ 23 tables validated
✅ SPOFE prêt pour requêtes
```

---

## 📚 Commandes Utiles

```powershell
# Vérifier status MySQL
Get-Service MySQL

# Démarrer MySQL
net start MySQL

# Arrêter MySQL
net stop MySQL

# Redémarrer MySQL
net stop MySQL; net start MySQL

# Voir les tables SPOFE
C:\xampp\mysql\bin\mysql.exe -u root spofe_v2_1 -e "SHOW TABLES;"

# Sauvegarde
C:\xampp\mysql\bin\mysqldump.exe -u root spofe_v2_1 > backup.sql

# Restauration
C:\xampp\mysql\bin\mysql.exe -u root spofe_v2_1 < backup.sql
```

---

## ✅ Checklist

- [ ] XAMPP installé (`C:\xampp\`)
- [ ] MySQL service disponible
- [ ] Port 3306 libre
- [ ] Base `spofe_v2_1` existe
- [ ] `.env` configuré correctement
- [ ] Script `start-mysql.ps1` exécutable
- [ ] `npm run dev` démarre sans erreur BD

---

**Besoin d'aide?**
- Logs: `C:\xampp\mysql\data\*.err`
- PhpMyAdmin: `http://localhost/phpmyadmin`
- Documentation: Voir `DOCUMENTATION_COMPLETE_SPOFE_v2.1.md`
