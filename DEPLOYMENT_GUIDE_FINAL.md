# 🚀 GUIDE DE DÉPLOIEMENT - DASHBOARD D'APPROBATION

## Phase 1: Préparation du Déploiement (5 minutes)

### 1. Vérifier l'état du système
```bash
# Vérifier Node.js
node --version
npm --version

# Vérifier MySQL (XAMPP)
mysql -u root -e "SELECT VERSION();"

# Vérifier Redis
redis-cli ping
# Attendez: PONG
```

### 2. Cloner/Récupérer le code
```bash
cd c:\Users\henry\Desktop\SPOFE-APP\ VERS\ 1.0
git status  # Vérifier l'état

# Installer les dépendances si nécessaire
cd cascade && npm install
cd ../frontend && npm install
```

## Phase 2: Démarrage du Backend (5 minutes)

### 1. Ouvrir un Terminal dans VS Code (Ctrl+`)

```bash
# Aller au dossier backend
cd cascade

# Démarrer le serveur
npm run dev
```

### ✅ Vérifications du Backend
```
✓ Server started on port 3001
✓ Database connected
✓ Redis connected
✓ Routes loaded successfully
✓ Middleware initialized
```

**Vous devriez voir:**
```
Server running on port 3001
✓ Core routes initialized
✓ Dashboard routes initialized
✓ Approvals routes initialized
✓ Database connection established
```

## Phase 3: Démarrage du Frontend (5 minutes)

### 1. Ouvrir un NOUVEAU Terminal

```bash
# Aller au dossier frontend
cd frontend

# Démarrer le dev server
npm run dev
```

### ✅ Vérifications du Frontend
```
✓ Vite dev server started
✓ Port 5173 ready
✓ Hot reload enabled
✓ React compiled successfully
```

**Vous devriez voir:**
```
  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

## Phase 4: Accès au Dashboard (2 minutes)

### 1. Ouvrir le navigateur
```
URL: http://127.0.0.1:5173/
```

### 2. Connexion
```
Email: admin@spofe.sn
Mot de passe: admin123
```

### 3. Naviguer vers le dashboard
```
Menu → Admin → Approbations
OU
URL directe: http://127.0.0.1:5173/admin/approvals
```

## Phase 5: Vérification Fonctionnelle (10 minutes)

### ✅ Checklist de Vérification

#### Dashboard Principal
- [ ] Page charge sans erreur
- [ ] 6 cartes de statistiques affichées
- [ ] Stats contiennent les bons nombres
- [ ] Design responsive et clean

#### Onglet "Tableau de Bord"
- [ ] ApprovalStats chargé
- [ ] Breakdown par statut visible
- [ ] Graphiques/cartes affichés
- [ ] Données à jour

#### Onglet "En Attente"
- [ ] Tableau des approbations affiché
- [ ] Colonnes: Email, Nom, Username, Statut, Date, Actions
- [ ] Pagination fonctionnelle
- [ ] Tri/Filtre disponibles

#### Actions sur tableau
- [ ] Bouton "Approuver" cliquable
- [ ] Bouton "Rejeter" affiche modal
- [ ] Bouton "Modifications" affiche formulaire
- [ ] Bouton "Détails" ouvre modal d'info

#### Onglet "Audit"
- [ ] Timeline affichée
- [ ] Actions listées chronologiquement
- [ ] Codes couleur appliqués (rouge, vert, bleu, etc.)
- [ ] Bouton "Export CSV" visible

### Tests API avec Postman/Thunder Client

#### 1. Récupérer le token admin
```
POST http://127.0.0.1:3001/api/auth/login
Content-Type: application/json

{
  "email": "admin@spofe.sn",
  "password": "admin123"
}
```
**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGc..."
  }
}
```

#### 2. Tester l'endpoint /stats
```
GET http://127.0.0.1:3001/api/admin/approvals/stats
Authorization: Bearer <TOKEN>
```
**Résultat attendu:**
```json
{
  "success": true,
  "data": {
    "totalPending": 3,
    "totalApproved": 0,
    "totalRejected": 0,
    "approvalRate": 0
  }
}
```

#### 3. Tester l'endpoint /pending
```
GET http://127.0.0.1:3001/api/admin/approvals/pending?limit=10&offset=0
Authorization: Bearer <TOKEN>
```

#### 4. Tester les actions
```
POST http://127.0.0.1:3001/api/admin/approvals/1/approve
Authorization: Bearer <TOKEN>
Content-Type: application/json

{}
```

## Phase 6: Exécution des Tests (5 minutes)

### 1. Lancer la suite de tests
```bash
# Dans le terminal backend (cascade)
npm run test -- approvals-integration.test.js
```

### ✅ Résultat attendu
```
PASS  tests/integration/approvals-integration.test.js

Test Suites: 1 passed, 1 total
Tests:       40 passed, 40 total
Duration:    2.345s
```

### 2. Tests individuels (optionnel)
```bash
# Tests unitaires
npm run test:unit

# Coverage complet
npm run test:coverage

# Watch mode
npm run test:watch
```

## Phase 7: Validation de la Sécurité (5 minutes)

### Tests de sécurité
```bash
# 1. Sans token (devrait return 401)
curl http://127.0.0.1:3001/api/admin/approvals/stats

# 2. Token invalide (devrait return 401)
curl -H "Authorization: Bearer invalid" \
     http://127.0.0.1:3001/api/admin/approvals/stats

# 3. Utilisateur non-admin (devrait return 403)
# Créer un user comptable et tester l'endpoint
```

### Validations requises
- [ ] Routes protégées par JWT
- [ ] Rôle admin vérifié
- [ ] Entrées sanitizées
- [ ] SQL injection impossible
- [ ] Logs d'audit enregistrés

## Phase 8: Tests de Performance (5 minutes)

### Charger le dashboard
```bash
# Tester la charge avec beaucoup de données
# Ajout de 100 approbations en test data

npm run seed:approvals -- --count=100
```

### Vérifications
- [ ] Pagination répond < 500ms
- [ ] Stats charge < 1s
- [ ] Audit logs < 2s
- [ ] Interface reste réactive
- [ ] Pas de memory leak

## ✅ Troubleshooting

### Erreur: Port 3001 déjà utilisé
```bash
# Trouver le processus
netstat -ano | findstr :3001

# Terminer le processus (Windows)
taskkill /PID <PID> /F

# Ou redémarrer Node
npm run dev
```

### Erreur: Base de données non trouvée
```bash
# Vérifier XAMPP est démarré
# Vérifier mysql running

# Se reconnecter
mysql -u root -p
CREATE DATABASE IF NOT EXISTS spofe_v2_1;
USE spofe_v2_1;

# Relancer les migrations
node create-approval-tables.js
```

### Erreur: React Router /admin/approvals non trouvée
```javascript
// Vérifier App.jsx contient:
import UserApprovalDashboard from '@/pages/dashboard/UserApprovalDashboard';

<Route 
  path="/admin/approvals" 
  element={<PrivateRoute><UserApprovalDashboard /></PrivateRoute>} 
/>
```

### Erreur: JWT token expiré
```bash
# Relancer le login
# Token JWT expire généralement après 24h

# Vérifier .env contient JWT_SECRET
echo $JWT_SECRET
```

## 📊 Monitoring en Production

### Logs Backend
```bash
# Logs en temps réel
tail -f logs/combined.log

# Erreurs uniquement
tail -f logs/error.log

# Logs de sécurité
tail -f logs/security.log
```

### Dashboard Santé
```bash
# Health check endpoint
GET http://127.0.0.1:3001/api/health
```

### Métriques de Perf
```bash
# Stats de performance
GET http://127.0.0.1:3001/api/metrics
```

## 🔄 Redémarrage/Arrêt Gracieux

### Arrêter les serveurs
```bash
# Backend (Ctrl+C dans le terminal)
^C

# Frontend (Ctrl+C dans le terminal)
^C
```

### Redémarrer les serveurs
```bash
# Backend
npm run dev

# Frontend
npm run dev
```

## 📋 Checklist de Go-Live

- [ ] Backend démarre sans erreur
- [ ] Frontend accessible sur port 5173
- [ ] Base de données connectée
- [ ] Tables créées et peuplées
- [ ] Tests d'intégration tous passants
- [ ] API endpoints testés manuellement
- [ ] Dashboard affiche les données
- [ ] Actions (approve/reject) fonctionnent
- [ ] Audit logs enregistrés
- [ ] Sécurité validée
- [ ] Performance acceptable
- [ ] Logs disponibles pour monitoring

## 🎯 Prochaines Étapes

1. **Configuration Production**
   - Configurer PM2 pour gestion des processus
   - Setup Nginx comme reverse proxy
   - Configurer SSL/HTTPS

2. **Monitoring**
   - Setup Prometheus pour métriques
   - Configure Grafana pour visualisation
   - Setup alerting pour erreurs critiques

3. **Backup & Disaster Recovery**
   - Scheduler les backups MySQL
   - Tester la restauration des données
   - Documenter le processus de recovery

4. **Documentation Production**
   - API documentation complète
   - Architecture diagrams
   - Decision logs et rationales
   - Runbooks pour opérations

## 📞 Support & Contact

Pour toute question ou problème:
- Consulter les logs: `logs/error.log`
- Vérifier la documentation: `/cascade/QUICK_START.md`
- Contacter: Admin/DevOps team

---

**Version**: 1.0
**Date**: 24 Janvier 2026
**Statut**: Prêt pour Production ✅
