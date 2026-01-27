# 🚀 Scripts de Démarrage SPOFE v2.1

Guide complet pour démarrer SPOFE avec les scripts de gestion des services.

## 📋 Scripts Disponibles

### 1. **wait-for-redis.sh** (Linux/Mac)
Attend que Redis soit disponible avant de continuer.

```bash
# Démarrage simple (127.0.0.1:6379, timeout 60s)
./wait-for-redis.sh

# Avec paramètres personnalisés
./wait-for-redis.sh 192.168.1.10 6379 120
```

**Paramètres:**
- `$1` : Host (défaut: 127.0.0.1)
- `$2` : Port (défaut: 6379)
- `$3` : Timeout en secondes (défaut: 60)

**Codes de sortie:**
- `0` : ✅ Redis prêt
- `1` : ❌ Timeout atteint

---

### 2. **wait-for-mysql.sh** (Linux/Mac)
Attend que MySQL soit disponible avant de continuer.

```bash
# Démarrage simple (127.0.0.1:3306, timeout 60s)
./wait-for-mysql.sh

# Avec paramètres personnalisés
./wait-for-mysql.sh 192.168.1.10 3306 120
```

**Paramètres:**
- `$1` : Host (défaut: 127.0.0.1)
- `$2` : Port (défaut: 3306)
- `$3` : Timeout en secondes (défaut: 60)

---

### 3. **wait-for-redis.ps1** (Windows)
Équivalent PowerShell de wait-for-redis.sh

```powershell
# Démarrage simple
.\wait-for-redis.ps1

# Avec paramètres
.\wait-for-redis.ps1 -Host 192.168.1.10 -Port 6379 -Timeout 120
```

**Paramètres:**
- `-Host` : Adresse du serveur (défaut: 127.0.0.1)
- `-Port` : Numéro du port (défaut: 6379)
- `-Timeout` : Délai max en secondes (défaut: 60)

---

### 4. **wait-for-mysql.ps1** (Windows)
Équivalent PowerShell de wait-for-mysql.sh

```powershell
# Démarrage simple
.\wait-for-mysql.ps1

# Avec paramètres
.\wait-for-mysql.ps1 -Host 192.168.1.10 -Port 3306 -Timeout 120
```

---

### 5. **startup.sh** (Linux/Mac)
Script de démarrage complet SPOFE

```bash
# Démarrage en dev (défaut)
./startup.sh dev

# Démarrage en production
./startup.sh prod

# Démarrage avec docker-compose v2.1
./startup.sh docker
```

**Processus:**
1. ✅ Vérification des dépendances
2. ✅ Démarrage Docker (MySQL, Redis, Nginx)
3. ✅ Attente Redis
4. ✅ Attente MySQL
5. ✅ Migrations de base de données
6. ✅ Démarrage backend (3001)
7. ✅ Démarrage frontend (5173)

**Accès:**
- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:3001
- MySQL: 127.0.0.1:3306
- Redis: 127.0.0.1:6379

---

### 6. **startup.ps1** (Windows)
Équivalent PowerShell du script startup.sh

```powershell
# Démarrage en dev (défaut)
.\startup.ps1 -Env dev

# Démarrage en production
.\startup.ps1 -Env prod

# Démarrage avec docker-compose v2.1
.\startup.ps1 -Env docker
```

---

## 🔧 Configuration d'Environnement

Avant de démarrer, vous pouvez configurer les variables d'environnement :

### Linux/Mac
```bash
export REDIS_HOST=127.0.0.1
export REDIS_PORT=6379
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306

./startup.sh dev
```

### Windows
```powershell
$env:REDIS_HOST = "127.0.0.1"
$env:REDIS_PORT = 6379
$env:MYSQL_HOST = "127.0.0.1"
$env:MYSQL_PORT = 3306

.\startup.ps1 -Env dev
```

### .env File
Ou créer un fichier `.env`:
```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
NODE_ENV=development
```

---

## 🎯 Cas d'Usage

### Démarrage Complet en Développement
```bash
# Linux/Mac
./startup.sh dev

# Windows
.\startup.ps1 -Env dev
```

### Vérifier Redis Avant le Déploiement
```bash
# Linux/Mac
./wait-for-redis.sh

# Windows
.\wait-for-redis.ps1
```

### Vérifier MySQL Avant les Migrations
```bash
# Linux/Mac
./wait-for-mysql.sh && npm run migrate

# Windows
.\wait-for-mysql.ps1; npm run migrate
```

### Docker Compose avec Attente
```bash
docker-compose up -d

# Attendre les services
./wait-for-mysql.sh
./wait-for-redis.sh

# Lancer le backend
cd cascade && npm run dev
```

---

## ✅ Vérification des Services

### Tester Redis
```bash
redis-cli ping
# Réponse: PONG
```

### Tester MySQL
```bash
mysql -h 127.0.0.1 -u root -p
# Ou
nc -zv 127.0.0.1 3306
```

### Tester Frontend
```
http://127.0.0.1:5173
```

### Tester Backend
```
http://127.0.0.1:3001/api/health
```

---

## 🐛 Dépannage

### Redis ne démarre pas
```bash
# Vérifier les logs Docker
docker-compose logs redis

# Vérifier le port
netstat -an | grep 6379  # Linux/Mac
netstat -an | findstr 6379  # Windows

# Redémarrer
docker-compose restart redis
```

### MySQL ne démarre pas
```bash
# Vérifier les logs Docker
docker-compose logs mysql

# Vérifier le port
netstat -an | grep 3306  # Linux/Mac
netstat -an | findstr 3306  # Windows

# Redémarrer
docker-compose restart mysql
```

### Script d'attente en timeout
```bash
# Augmenter le timeout
./wait-for-redis.sh 127.0.0.1 6379 120  # 120 secondes

# Vérifier la connexion manuelle
redis-cli -h 127.0.0.1 -p 6379 ping
```

### Permission denied (Linux/Mac)
```bash
# Rendre les scripts exécutables
chmod +x wait-for-*.sh startup.sh
ls -l wait-for-*.sh startup.sh  # Vérifier
```

---

## 📊 Flux de Démarrage Complet

```
┌─────────────────────────────────────────┐
│  .\startup.ps1 (ou ./startup.sh)        │
└──────────────┬──────────────────────────┘
               │
        ┌──────▼──────┐
        │   Docker    │
        │   MySQL ✓   │
        │   Redis ✓   │
        │   Nginx ✓   │
        └──────┬──────┘
               │
        ┌──────▼──────────┐
        │ wait-for-redis  │  ⏳ 60s max
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │ wait-for-mysql  │  ⏳ 60s max
        └──────┬──────────┘
               │
        ┌──────▼──────────┐
        │   Migrations    │  ✓ DB Ready
        └──────┬──────────┘
               │
     ┌─────────┴─────────┐
     │                   │
┌────▼────────┐  ┌──────▼──────┐
│ npm run dev │  │ npm run dev  │
│   Backend   │  │  Frontend    │
│   :3001 ✓   │  │  :5173 ✓     │
└─────────────┘  └──────────────┘
```

---

## 📝 Exemples d'Utilisation Avancée

### 1. Pipeline CI/CD
```bash
#!/bin/bash
set -e

./wait-for-mysql.sh
./wait-for-redis.sh

cd cascade
npm install
npm run migrate
npm run test
npm run build
```

### 2. Vérification Pré-déploiement
```bash
#!/bin/bash
echo "Vérification des services..."
./wait-for-mysql.sh || exit 1
./wait-for-redis.sh || exit 1
echo "✅ Tous les services sont prêts"

npm run deploy
```

### 3. Redémarrage Gracieux
```bash
docker-compose restart mysql redis
./wait-for-mysql.sh
./wait-for-redis.sh
npm start
```

---

## 🔐 Recommandations de Sécurité

### Production
1. ✅ Utiliser des variables d'environnement pour les credentials
2. ✅ Configurer les pare-feu (exposer uniquement les ports nécessaires)
3. ✅ Utiliser des hôtes différents si possible
4. ✅ Vérifier les logs de démarrage
5. ✅ Mettre en place un monitoring

### Développement
1. ✅ Augmenter les timeouts pour une meilleure stabilité
2. ✅ Utiliser localhost/127.0.0.1
3. ✅ Vérifier les logs régulièrement
4. ✅ Nettoyer les volumes Docker périodiquement

---

## 📞 Support & Documentation

Pour plus d'informations:
- 📖 [DOCUMENTATION_COMPLETE_SPOFE_v2.1.md](DOCUMENTATION_COMPLETE_SPOFE_v2.1.md)
- 🐳 [Docker Setup](E2E_ENVIRONMENT_SETUP.md)
- 🚀 [Quick Start](CASCADE_QUICK_START.sh)

---

**Version**: 2.1.0 | **Date**: 23 Jan 2026 | **Status**: ✅ Production Ready
