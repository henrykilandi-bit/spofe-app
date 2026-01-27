# 📚 SPOFE v2.1 - DOCUMENTATION MAÎTRESSE COMPILÉE
**Compilation intelligente sans doublons - 254 fichiers consolidés**

> **Version:** 2.1 Production Ready  
> **Date:** 22 Janvier 2026  
> **Statut:** ✅ 100% Synthétisée | 🎯 Zéro doublon  
> **Couverture:** Architecture | Déploiement | Sécurité | Performance | Tests | Troubleshooting

---

## 📋 TABLE DES MATIÈRES COMPLÈTE

- [🚀 DÉMARRAGE RAPIDE](#démarrage-rapide)
- [🏗️ ARCHITECTURE & DESIGN](#architecture)
- [📊 STRUCTURE DE PROJET](#structure)
- [🗄️ BASE DE DONNÉES](#base-données)
- [🔐 SÉCURITÉ & CONFORMITÉ](#sécurité)
- [🚀 INSTALLATION & DÉPLOIEMENT](#installation)
- [⚙️ CONFIGURATION](#configuration)
- [🧪 TESTS & QUALITÉ](#tests)
- [📈 PERFORMANCE & OPTIMISATIONS](#performance)
- [🔍 TROUBLESHOOTING](#troubleshooting)
- [📖 API & ENDPOINTS](#api)
- [🎯 GUIDES PAR RÔLE](#guides-rôle)

---

# 🚀 DÉMARRAGE RAPIDE {#démarrage-rapide}

## Pour les impatients (5 minutes)

### Installation minimale

```bash
# 1. Cloner et accéder
git clone <repo> && cd SPOFE-APP\ VERS\ 1.0/cascade

# 2. Installer dépendances
npm install

# 3. Configurer variables d'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 4. Initialiser la BD
npm run db:init

# 5. Démarrer serveur
npm run dev
# Serveur accessible: http://localhost:3001
```

### Vérifier l'installation

```bash
# Health check
curl http://localhost:3001/api/health

# Tester authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@spofe.com","password":"AdminPassword123!@"}'
```

---

## Premier accès application

1. **Frontend**: http://localhost:3000
2. **API**: http://localhost:3001/api
3. **Documentation API**: http://localhost:3001/api-docs
4. **Swagger UI**: http://localhost:3001/swagger

**Identifiants de test**
```
Email: admin@spofe.com
Password: AdminPassword123!@
```

---

# 🏗️ ARCHITECTURE & DESIGN {#architecture}

## Vue d'ensemble système

```
┌─────────────────────────────────────────────────────────┐
│           CLIENT LAYER (React Frontend)                 │
│     Interface responsive + real-time updates             │
└──────────────┬──────────────────────────────────────────┘
               │ REST API + WebSocket
┌──────────────┴──────────────────────────────────────────┐
│          EXPRESS.JS SERVER (Port 3001)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ MIDDLEWARE LAYER                                  │   │
│  │ - Authentication (JWT)                            │   │
│  │ - Security (CORS, Helmet, XSS, HPP)             │   │
│  │ - Validation (Joi schemas)                        │   │
│  │ - Rate limiting & DDoS protection                │   │
│  │ - Request logging & metrics                       │   │
│  │ - Error handling (centralized)                    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ROUTES & CONTROLLERS LAYER                        │   │
│  │ - /api/auth (authentication & refresh)            │   │
│  │ - /api/companies (multi-tenant management)        │   │
│  │ - /api/journal-entries (accounting entries)       │   │
│  │ - /api/chart-of-accounts (OHADA accounts)        │   │
│  │ - /api/reports (financial statements)             │   │
│  │ - /api/security (audit & compliance)              │   │
│  │ - /api/health (monitoring & status)              │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ SERVICES & BUSINESS LOGIC LAYER                   │   │
│  │ - Accounting service (entries, balances)          │   │
│  │ - Security service (2FA, audit logging)           │   │
│  │ - Report generation (financial statements)        │   │
│  │ - Notification service (alerts)                   │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────┘
               │ Sequelize ORM
┌──────────────┴──────────────────────────────────────────┐
│             DATA PERSISTENCE LAYER                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │ MySQL 8.0 (Development - XAMPP)                  │   │
│  │ MariaDB 10.5+ (Production)                        │   │
│  │ - 14+ tables with ForeignKey constraints         │   │
│  │ - Full OHADA compliance structure                │   │
│  │ - Complete audit trail support                    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Redis Cache (Session & Query Cache)               │   │
│  │ - Session storage (5000+ concurrent users)       │   │
│  │ - Query result caching (30sec - 1hour TTL)      │   │
│  │ - Rate limit counters                            │   │
│  │ - Real-time notification queue                    │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │ File Storage (Local or S3)                        │   │
│  │ - Document uploads (journal entries)              │   │
│  │ - Report exports (PDF, Excel)                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Principes architecturaux

### 1. **Multi-Tenant par Design**
- Chaque utilisateur lié à une compagnie
- Isolation complète des données par compagnie_id
- Support hiérarchie groupe → compagnie

### 2. **Sécurité Multicouche**
- Authentification JWT avec refresh tokens
- 2FA TOTP optionnel
- Audit trail immuable de toutes les actions sensibles
- Rate limiting + DDoS protection
- SQL injection, XSS, CSRF protection

### 3. **Performance Optimisée**
- Pagination intelligente (offset/limit avec validation)
- Redis caching (30s-1h TTL configurable)
- Indexes BD optimisés sur colonnes fréquemment requêtées
- Lazy loading relations
- Query optimization via Sequelize

### 4. **Scalabilité**
- Architecture stateless (facilite horizontal scaling)
- Session stockée en Redis (pas d'affinity requise)
- Event-driven design prêt pour microservices
- Support de load balancing natif

### 5. **Observabilité**
- Logging structuré (Winston): combined.log, error.log, security.log
- Prometheus metrics (/metrics endpoint)
- Request tracing (correlation IDs)
- Performance monitoring (response times)

---

# 📂 STRUCTURE DE PROJET {#structure}

## Arborescence complète

```
SPOFE-APP VERS 1.0/
│
├── cascade/                              # 🔵 BACKEND PRINCIPAL (Node.js/Express)
│   ├── src/
│   │   ├── server.js                    # ⭐ Entry point - Démarrage serveur
│   │   ├── app.js                       # ⭐ Configuration Express + middleware
│   │   │
│   │   ├── config/                      # Configuration globale
│   │   │   ├── database.js              # Connexion Sequelize + pool
│   │   │   ├── security.js              # Headers sécurité, CSP, HSTS
│   │   │   ├── cors.js                  # Configuration CORS par env
│   │   │   ├── swagger.js               # API documentation
│   │   │   └── monitoring.js            # Prometheus config
│   │   │
│   │   ├── middleware/                  # Couche middleware
│   │   │   ├── auth.middleware.js       # JWT verification
│   │   │   ├── error.middleware.js      # Global error handler
│   │   │   ├── security.middleware.js   # XSS, HPP, Helmet headers
│   │   │   ├── rateLimit.middleware.js  # Brute force protection
│   │   │   ├── validation.middleware.js # Joi schema validation
│   │   │   ├── metrics.middleware.js    # Prometheus metrics collection
│   │   │   └── requestLogger.middleware # Winston logging
│   │   │
│   │   ├── routes/                      # API Route definitions
│   │   │   ├── auth.routes.js           # Auth endpoints
│   │   │   ├── security.routes.js       # Audit & compliance
│   │   │   ├── companies.routes.js      # Multi-tenant management
│   │   │   ├── journal.routes.js        # Accounting entries
│   │   │   ├── chart.routes.js          # OHADA chart of accounts
│   │   │   ├── reports.routes.js        # Financial statements
│   │   │   ├── health.routes.js         # Health check
│   │   │   └── metrics.routes.js        # Prometheus metrics
│   │   │
│   │   ├── controllers/                 # Business logic controllers
│   │   │   ├── auth.controller.js       # Authentication logic
│   │   │   ├── company.controller.js    # Company management
│   │   │   ├── journal.controller.js    # Entry management
│   │   │   ├── chart.controller.js      # Chart of accounts
│   │   │   └── reports.controller.js    # Report generation
│   │   │
│   │   ├── services/                    # Business logic services
│   │   │   ├── accounting.service.js    # Entry processing
│   │   │   ├── security.service.js      # Audit logging
│   │   │   ├── cache.service.js         # Redis operations
│   │   │   ├── email.service.js         # Email notifications
│   │   │   └── report.service.js        # Report generation
│   │   │
│   │   ├── models/                      # Sequelize ORM models
│   │   │   ├── user.model.js            # Users + roles
│   │   │   ├── company.model.js         # Companies (multi-tenant)
│   │   │   ├── journal_entry.model.js   # Journal entries
│   │   │   ├── journal_entry_line.model # Entry lines (debit/credit)
│   │   │   ├── chart_of_account.model   # OHADA accounts
│   │   │   ├── two_factor_auth.model    # 2FA configuration
│   │   │   ├── audit_trail.model        # Audit logging
│   │   │   ├── security_event.model     # Security events
│   │   │   ├── role.model.js            # RBAC roles
│   │   │   └── index.js                 # Model associations
│   │   │
│   │   ├── validators/                  # Joi validation schemas
│   │   │   ├── auth.validator.js        # Auth request validation
│   │   │   ├── entry.validator.js       # Entry validation
│   │   │   └── company.validator.js     # Company validation
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   ├── response.js              # Standard response format
│   │   │   ├── logger.js                # Winston logger
│   │   │   ├── cache.js                 # Redis helper functions
│   │   │   ├── security.js              # Encryption utilities
│   │   │   └── helpers.js               # Helper functions
│   │   │
│   │   ├── migrations/                  # Sequelize migrations
│   │   │   └── *.js                     # Migration files
│   │   │
│   │   ├── seeders/                     # Sequelize seeders
│   │   │   └── *.js                     # Seeder files
│   │   │
│   │   └── scripts/                     # Utility scripts
│   │       ├── db-init.js               # Database initialization
│   │       ├── db-restore.js            # Database restore
│   │       ├── generate-admin.js        # Create admin user
│   │       └── ...
│   │
│   ├── tests/                           # Test files
│   │   ├── unit/                        # Unit tests
│   │   ├── integration/                 # Integration tests
│   │   └── fixtures/                    # Test data
│   │
│   ├── e2e/                             # End-to-End tests (Playwright)
│   │   ├── setup/                       # Global setup/teardown
│   │   ├── accounting/                  # Accounting workflow tests
│   │   ├── security/                    # Security tests
│   │   ├── performance/                 # Performance tests
│   │   └── fixtures/                    # Test fixtures
│   │
│   ├── logs/                            # Application logs
│   │   ├── combined.log                 # All logs
│   │   ├── error.log                    # Error logs only
│   │   └── security.log                 # Security events
│   │
│   ├── .env.example                     # Environment template
│   ├── .env                             # Environment variables (local)
│   ├── .sequelizerc                     # Sequelize CLI config
│   ├── package.json                     # NPM dependencies
│   ├── package-lock.json                # Locked versions
│   └── playwright.config.js             # E2E test config
│
├── frontend/                             # 🟢 FRONTEND REACT
│   ├── src/
│   │   ├── components/                  # React components
│   │   ├── pages/                       # Page components
│   │   ├── services/                    # API calls
│   │   ├── store/                       # State management
│   │   └── ...
│   ├── public/                          # Static assets
│   └── package.json
│
├── Docs/                                 # 📖 Documentation (Markdown)
│   ├── README.md                        # Main documentation
│   ├── QUICKSTART.md                    # Quick start guide
│   └── 05_LOGS_ET_AUDITS/              # Audit logs & reports
│
└── [Docker & CI/CD files]
    ├── docker-compose.yml
    ├── Dockerfile.backend
    ├── Dockerfile.frontend
    ├── nginx.conf
    └── .github/workflows/
```

---

# 🗄️ BASE DE DONNÉES {#base-données}

## Schéma complet (14 tables)

### Table: groupes_entreprises
**Rôle**: Hiérarchie organisationnelle (groupes)
```sql
CREATE TABLE groupes_entreprises (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL UNIQUE,
  siège_social VARCHAR(255),
  email_contact VARCHAR(255),
  phone_contact VARCHAR(20),
  secteur VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: compagnies
**Rôle**: Entités individuelles (multi-tenant)
```sql
CREATE TABLE compagnies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  groupe_id INT NOT NULL,
  nom VARCHAR(255) NOT NULL,
  matricule_fiscal VARCHAR(50) UNIQUE,
  adresse TEXT,
  email VARCHAR(255),
  phone VARCHAR(20),
  devise VARCHAR(3) DEFAULT 'XOF',
  fiscal_year_start MONTH DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
  INDEX idx_groupe_id (groupe_id),
  INDEX idx_is_active (is_active),
  UNIQUE INDEX unique_matricule_groupe (groupe_id, matricule_fiscal)
);
```

### Table: users
**Rôle**: Authentification & identification
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  nom_complet VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT,
  two_fa_enabled BOOLEAN DEFAULT FALSE,
  two_fa_secret VARCHAR(255),
  last_login TIMESTAMP,
  login_attempts INT DEFAULT 0,
  account_locked_until TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
  INDEX idx_compagnie_email (compagnie_id, email),
  INDEX idx_is_active (is_active)
);
```

### Table: roles
**Rôle**: RBAC (Role-Based Access Control)
```sql
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  permissions JSON,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table: charts_of_accounts
**Rôle**: Plan comptable OHADA (31+ comptes)
```sql
CREATE TABLE charts_of_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id INT NOT NULL,
  account_number VARCHAR(20) NOT NULL,
  account_name VARCHAR(255) NOT NULL,
  account_type VARCHAR(50), -- ACTIF, PASSIF, CHARGES, PRODUITS
  ohada_class INT, -- 1-8 (OHADA classification)
  parent_account_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_account_id) REFERENCES charts_of_accounts(id),
  UNIQUE INDEX unique_account (compagnie_id, account_number),
  INDEX idx_ohada_class (ohada_class),
  INDEX idx_account_type (account_type)
);
```

### Table: journal_entries
**Rôle**: Écritures comptables (en-têtes)
```sql
CREATE TABLE journal_entries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id INT NOT NULL,
  reference VARCHAR(50) NOT NULL,
  description TEXT,
  entry_date DATE NOT NULL,
  journal_type VARCHAR(20), -- ACH, VEN, BA, JOURNAL, etc.
  status VARCHAR(20) DEFAULT 'BROUILLON', -- BROUILLON, EN_ATTENTE, APPROUVÉE, POSTÉ
  created_by INT,
  approved_by INT,
  approved_at TIMESTAMP,
  posted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  UNIQUE INDEX unique_ref (compagnie_id, reference),
  INDEX idx_status (status),
  INDEX idx_entry_date (entry_date)
);
```

### Table: journal_entry_lines
**Rôle**: Lignes d'écritures (débit/crédit) - **CRITIQUE**
```sql
CREATE TABLE journal_entry_lines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  entry_id INT NOT NULL,
  account_id INT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0.00,
  credit DECIMAL(15,2) DEFAULT 0.00,
  description TEXT,
  line_number INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES charts_of_accounts(id),
  INDEX idx_entry_id (entry_id),
  INDEX idx_account_id (account_id),
  CHECK (debit >= 0 AND credit >= 0)
);
```

### Table: account_balances
**Rôle**: Soldes comptables par comptes
```sql
CREATE TABLE account_balances (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id INT NOT NULL,
  account_id INT NOT NULL,
  period_month INT,
  period_year INT,
  balance_type VARCHAR(20), -- OPENING, CLOSING
  debit_balance DECIMAL(15,2) DEFAULT 0.00,
  credit_balance DECIMAL(15,2) DEFAULT 0.00,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES charts_of_accounts(id) ON DELETE CASCADE,
  UNIQUE INDEX unique_balance (compagnie_id, account_id, period_month, period_year),
  INDEX idx_period (period_month, period_year)
);
```

### Table: audit_trails
**Rôle**: Traçabilité de toutes les actions
```sql
CREATE TABLE audit_trails (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  compagnie_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50), -- USER, ENTRY, ACCOUNT, etc.
  entity_id INT,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  INDEX idx_user_company (user_id, compagnie_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);
```

### Table: security_events
**Rôle**: Événements de sécurité critiques
```sql
CREATE TABLE security_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id INT,
  user_id INT,
  event_type VARCHAR(50), -- LOGIN_FAILED, RBAC_VIOLATION, 2FA_FAILED, etc.
  severity VARCHAR(20), -- LOW, MEDIUM, HIGH, CRITICAL
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  response_action VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_severity_type (severity, event_type),
  INDEX idx_created_at (created_at)
);
```

### Table: two_factor_auths
**Rôle**: Configuration 2FA (TOTP)
```sql
CREATE TABLE two_factor_auths (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  secret_key VARCHAR(255) NOT NULL,
  backup_codes JSON,
  is_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_is_verified (is_verified)
);
```

### Table: password_reset_tokens
**Rôle**: Réinitialisation de mot de passe
```sql
CREATE TABLE password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_expires (token, expires_at)
);
```

### Table: token_blacklists
**Rôle**: Logout & token revocation
```sql
CREATE TABLE token_blacklists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE INDEX unique_token (token),
  INDEX idx_expires_at (expires_at)
);
```

### Table: app_settings
**Rôle**: Configuration application par compagnie
```sql
CREATE TABLE app_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  compagnie_id INT NOT NULL UNIQUE,
  max_users INT DEFAULT 100,
  max_journal_entries INT DEFAULT 10000,
  retention_days INT DEFAULT 2555, -- 7 ans
  require_2fa BOOLEAN DEFAULT FALSE,
  allow_concurrent_logins BOOLEAN DEFAULT TRUE,
  backup_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE
);
```

---

# 🔐 SÉCURITÉ & CONFORMITÉ {#sécurité}

## Contrôles de sécurité implémentés

### 1. **Authentification & Autorisation**

#### JWT Tokens
- **Access Token**: 15 minutes TTL
- **Refresh Token**: 7 jours TTL
- **Header**: Authorization: Bearer <token>
- **Validation**: Signature HMAC-SHA256

#### 2FA TOTP (Optional)
- Algorithme: HMAC-SHA1 (RFC 4226)
- Temps: 30 secondes par code
- Backup codes: 8 générés à la création
- Activable/Désactivable par utilisateur

#### RBAC (Role-Based Access Control)
```json
{
  "roles": {
    "admin": ["*"],
    "comptable": ["entries_create", "entries_read"],
    "daf": ["entries_approve", "reports_read", "users_read"],
    "auditor": ["audit_read", "reports_read", "entries_read"]
  }
}
```

### 2. **Protection contre les vulnérabilités Web**

| Vulnérabilité | Protection | Endpoint |
|---------------|-----------|----------|
| **SQL Injection** | Requêtes paramétrées (Sequelize ORM) | Tous |
| **XSS** | Sanitization + Content-Security-Policy | Tous |
| **CSRF** | CSRF tokens (custom middleware) | POST/PUT/DELETE |
| **Brute Force** | Rate limiting (Redis counters) | /auth/login (50 req/hour) |
| **DDoS** | Slow down express (throttle requests) | Tous endpoints |
| **XXE** | Désactiver XML parsing | Pas de support XML |
| **Serialization** | JSON safe parsing | Tous |

### 3. **Headers Sécurité**

```javascript
// Appliqués globalement via helmet.js
{
  "strict-transport-security": "max-age=63072000; includeSubDomains",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-xss-protection": "1; mode=block",
  "content-security-policy": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  "referrer-policy": "strict-origin-when-cross-origin"
}
```

### 4. **Chiffrement**

- **Mots de passe**: bcryptjs (10 rounds)
- **Données sensibles en transit**: HTTPS/TLS 1.3+
- **Tokens**: JWT signed (HMAC-SHA256)
- **Cookies**: HttpOnly + Secure + SameSite flags

### 5. **Audit & Logging**

**Événements loggés (audit_trails):**
- ✅ Authentification (login, logout, 2FA)
- ✅ CRUD sur écritures comptables
- ✅ Approbations DAF
- ✅ Changements de permissions
- ✅ Exports de données
- ✅ Erreurs applicatives

**Événements sécurité (security_events):**
- 🔴 CRITICAL: Tentatives escalade privilèges
- 🔴 CRITICAL: Accès non autorisé multiples
- 🟠 HIGH: Tentatives brute force bloquées
- 🟠 HIGH: Modifications audit trail
- 🟡 MEDIUM: Accès ressources sensibles
- 🟡 MEDIUM: Changements configuration sécurité

### 6. **Conformité OHADA**

- ✅ Plan comptable 8 classes respecté
- ✅ Équilibre Débit = Crédit imposé
- ✅ Numérotation comptes standardisée
- ✅ Retention données 7 ans (configurable)
- ✅ Audit trail immuable
- ✅ Documents justificatifs requérant signatures numériques (roadmap)

---

# 🚀 INSTALLATION & DÉPLOIEMENT {#installation}

## Installation locale (Développement)

### Prérequis
- Node.js 18+ (test avec 18.17+)
- npm 9+
- MySQL 8.0+ (XAMPP inclus) ou MariaDB 10.5+
- Redis 6+ (optionnel mais recommandé pour cache)
- Git

### Étapes installation

```bash
# 1. Cloner le repo
git clone https://github.com/your-org/spofe-app.git
cd SPOFE-APP\ VERS\ 1.0/cascade

# 2. Installer dépendances
npm install

# 3. Copier et configurer .env
cp .env.example .env
# Éditer avec vos paramètres DB, JWT secret, etc.

# 4. Initialiser la base de données
npm run db:init
# Crée les tables + insère données de base

# 5. Créer compte admin
npm run create:admin
# Crée admin@spofe.com avec mot de passe temporaire

# 6. Démarrer le serveur
npm run dev
# Écoute sur http://localhost:3001

# 7. Vérifier santé
curl http://localhost:3001/api/health
```

### Installation frontend

```bash
cd ../frontend

npm install

npm start
# Écoute sur http://localhost:3000
```

## Déploiement Production

### Docker Compose (Recommandé)

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Démarrer services
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Configuration Nginx (Reverse Proxy)

```nginx
upstream backend {
  server localhost:3001;
}

server {
  listen 80;
  server_name spofe.example.com;
  
  # Redirection HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name spofe.example.com;
  
  ssl_certificate /etc/ssl/certs/spofe.crt;
  ssl_certificate_key /etc/ssl/private/spofe.key;
  
  # Security headers
  add_header Strict-Transport-Security "max-age=63072000" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  
  # Backend
  location /api {
    proxy_pass http://backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  # Frontend
  location / {
    proxy_pass http://frontend;
  }
}
```

### PM2 (Process Manager)

```bash
npm install -g pm2

pm2 start ecosystem.config.js --env production

pm2 logs

pm2 monit
```

---

# ⚙️ CONFIGURATION {#configuration}

## Variables d'environnement (.env)

```bash
# SERVER
NODE_ENV=production
PORT=3001

# DATABASE
DB_HOST=db.example.com
DB_USER=spofe_user
DB_PASSWORD=SecurePassword123!@
DB_NAME=spofe_prod

# REDIS
REDIS_HOST=redis.example.com
REDIS_PORT=6379
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# 2FA
TOTP_WINDOW=1

# CORS
CORS_ORIGIN=https://spofe.example.com

# EMAIL (Notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@example.com
SMTP_PASSWORD=app-password

# LOGGING
LOG_LEVEL=info
LOG_FORMAT=combined

# SECURITY
BCRYPT_ROUNDS=10
SESSION_SECRET=session-secret-key
```

## Configuration par environnement

### Development (.env)
- Debug logging activé
- CORS permissif
- JWT TTL court (15m)
- Hot reload activé

### Staging (.env.staging)
- Logging modéré
- CORS restrictif
- Monitoring activé
- Backup quotidien

### Production (.env.production)
- Logging JSON (structured)
- CORS très restrictif
- HTTPS obligatoire
- Monitoring + Alertes
- Backup 2x/jour

---

# 🧪 TESTS & QUALITÉ {#tests}

## Types de tests

### 1. **Unit Tests** (Vitest)

```bash
npm run test:unit

# Fichiers: src/**/*.test.js
# Coverage: >80%
# Focus: Services, utils, models
```

Exemple:
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { calculateBalance } from '../services/accounting.service';

describe('Accounting Service', () => {
  it('should calculate correct balance', () => {
    const result = calculateBalance([
      { debit: 100, credit: 0 },
      { debit: 0, credit: 50 }
    ]);
    expect(result).toBe(50); // 100 - 50
  });
});
```

### 2. **Integration Tests** (Vitest + Supertest)

```bash
npm run test:integration

# Fichiers: tests/integration/**/*.test.js
# Coverage: API endpoints
# DB: spofe_test (auto-cleanup)
```

Exemple:
```javascript
import request from 'supertest';
import app from '../src/app';

describe('POST /api/journal-entries', () => {
  it('should create entry with valid data', async () => {
    const res = await request(app)
      .post('/api/journal-entries')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reference: 'FAC-001',
        entry_date: '2026-01-22',
        lines: [
          { account_id: 1, debit: 1000, credit: 0 },
          { account_id: 2, debit: 0, credit: 1000 }
        ]
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
```

### 3. **End-to-End Tests** (Playwright)

```bash
npm run e2e                   # Tous les tests
npm run e2e:accounting       # Tests comptabilité
npm run e2e:security         # Tests sécurité
npm run e2e:performance      # Tests charge

# Fichiers: e2e/**/*.spec.js
# Coverage: User workflows complets
# DB: spofe_test (auto-cleanup)
```

### 4. **Performance Tests** (Lighthouse, k6)

```bash
npm run perf:audit           # Lighthouse audit
npm run perf:load-test       # K6 load testing
```

### 5. **Security Tests** (OWASP)

```bash
npm run security:scan        # OWASP Top 10
npm run security:dependency  # Dependency audit
npm audit                    # NPM audit
```

## Code Quality

```bash
npm run lint                 # ESLint
npm run format               # Prettier
npm run coverage             # Test coverage report
npm run type-check           # TypeScript check (future)
```

---

# 📈 PERFORMANCE & OPTIMISATIONS {#performance}

## Optimisations implémentées

### 1. **Database**
- ✅ Indexes sur colonnes requêtées fréquemment
- ✅ Lazy loading relations
- ✅ Query optimization (EXPLAIN analysis)
- ✅ Connection pooling (10 connexions)
- ✅ Pagination (offset/limit)

### 2. **Caching**
- ✅ Redis session cache (TTL: 1h)
- ✅ Query result cache (TTL: 30s-1h)
- ✅ Authentication token cache
- ✅ Rate limit counters (in-memory + Redis)

### 3. **API**
- ✅ Compression gzip (Express)
- ✅ Pagination lazy (1000 items/page max)
- ✅ Field selection (?fields=id,name)
- ✅ Batch operations (POST bulk)

### 4. **Frontend** (React)
- ✅ Code splitting (React.lazy)
- ✅ Image optimization
- ✅ Service worker caching
- ✅ Virtual scrolling (large lists)

## Métriques de performance

| Métrique | Cible | Actuel |
|----------|-------|--------|
| Page Load Time | <3s | ~1.8s ✅ |
| API Response | <200ms | ~95ms ✅ |
| Database Query | <100ms | ~45ms ✅ |
| Memory Usage | <512MB | ~320MB ✅ |
| Error Rate | <0.1% | ~0.02% ✅ |

---

# 🔍 TROUBLESHOOTING {#troubleshooting}

## Problèmes courants et solutions

### Problème: "Connexion BD refusée"

**Cause**: MySQL/MariaDB pas démarré ou credentials incorrects

**Solution**:
```bash
# Vérifier service MySQL
# Windows (XAMPP)
# macOS
brew services start mysql

# Tester connexion
mysql -h localhost -u root -p

# Vérifier .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
```

### Problème: "Redis connection failed"

**Cause**: Redis pas démarré (cache facultatif)

**Solution**:
```bash
# Windows (WSL2 ou Docker)
docker run -d -p 6379:6379 redis:latest

# macOS
brew services start redis

# Vérifier connexion
redis-cli ping
# Devrait répondre: PONG
```

### Problème: "JWT token expired"

**Cause**: Token d'accès expiré (TTL 15m)

**Solution**:
```bash
# Utiliser refresh token pour obtenir nouveau token
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGci..."
}
```

### Problème: "Erreur 500 - Internal Server Error"

**Solution**:
1. Vérifier logs: `tail -f cascade/logs/error.log`
2. Vérifier BD: `npm run db:verify`
3. Vérifier Redis: `redis-cli ping`
4. Redémarrer serveur: `npm run dev`

### Problème: "Tests échouent"

```bash
# Nettoyer cache & BD de test
npm run test:clean

# Réinitialiser BD de test
npm run db:init:test

# Relancer tests
npm run test
```

---

# 📖 API & ENDPOINTS {#api}

## Authentification

### POST /api/auth/register
Créer un nouveau compte

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!@",
    "nom_complet": "Jean Dupont"
  }'

# Response
{
  "success": true,
  "data": {
    "access_token": "eyJhbGci...",
    "refresh_token": "eyJhbGci...",
    "user": { "id": 1, "email": "...", "role": "comptable" }
  }
}
```

### POST /api/auth/login
Authentification

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spofe.com",
    "password": "AdminPassword123!@"
  }'
```

### POST /api/auth/refresh
Renouveler token

```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGci..."
  }'
```

## Écritures comptables

### GET /api/journal-entries
Lister les écritures

```bash
curl http://localhost:3001/api/journal-entries \
  -H "Authorization: Bearer $TOKEN" \
  -G \
    -d "limit=20" \
    -d "offset=0" \
    -d "status=APPROUVÉE"

# Response
{
  "success": true,
  "data": [
    {
      "id": 1,
      "reference": "FAC-001",
      "entry_date": "2026-01-22",
      "status": "APPROUVÉE",
      "lines": [...]
    }
  ],
  "pagination": {
    "total": 156,
    "limit": 20,
    "offset": 0
  }
}
```

### POST /api/journal-entries
Créer une écriture

```bash
curl -X POST http://localhost:3001/api/journal-entries \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "FAC-2026-001",
    "description": "Achat matériel bureau",
    "entry_date": "2026-01-22",
    "journal_type": "ACH",
    "lines": [
      { "account_id": 602, "debit": 1500, "credit": 0 },
      { "account_id": 401, "debit": 0, "credit": 1500 }
    ]
  }'
```

## Rapports

### GET /api/reports/balance-sheet
Balance (Bilan)

```bash
curl "http://localhost:3001/api/reports/balance-sheet?period=2026-01" \
  -H "Authorization: Bearer $TOKEN"

# Retourne bilan avec actif, passif, résultat
```

### GET /api/reports/profit-loss
Compte de résultat

```bash
curl "http://localhost:3001/api/reports/profit-loss?period=2026-01" \
  -H "Authorization: Bearer $TOKEN"

# Retourne charges, produits, résultat net
```

## Audit & Sécurité

### GET /api/security/audit-trail
Audit trail des actions

```bash
curl "http://localhost:3001/api/security/audit-trail?days=30" \
  -H "Authorization: Bearer $TOKEN"

# Retourne historique actions
```

### GET /api/security/events
Événements de sécurité

```bash
curl "http://localhost:3001/api/security/events?severity=HIGH" \
  -H "Authorization: Bearer $TOKEN"

# Retourne événements critiques
```

---

# 🎯 GUIDES PAR RÔLE {#guides-rôle}

## Pour les Développeurs

### Premiers pas (30 minutes)

1. Cloner repo et installer (`npm install`)
2. Configurer .env (DB, JWT, Redis)
3. Initialiser BD (`npm run db:init`)
4. Démarrer serveur (`npm run dev`)
5. Vérifier santé (`curl http://localhost:3001/api/health`)

### Ajouter une nouvelle API

```javascript
// 1. Créer validator (src/validators/new.validator.js)
export const newSchema = Joi.object({
  name: Joi.string().required(),
  // ...
});

// 2. Créer controller (src/controllers/new.controller.js)
export async function handleNew(req, res, next) {
  try {
    // Business logic
    const result = await service.doSomething(req.body);
    success(res, result, 201);
  } catch (error) {
    next(error);
  }
}

// 3. Créer route (src/routes/new.routes.js)
router.post('/new', validate(newSchema), handleNew);

// 4. Ajouter à app.js
app.use('/api', newRoutes);

// 5. Tester via Swagger ou curl
```

### Déboguer une issue

```bash
# 1. Vérifier logs
tail -f cascade/logs/error.log
tail -f cascade/logs/security.log

# 2. Vérifier BD
npm run db:verify

# 3. Mode debug
DEBUG=* npm run dev

# 4. Vérifier Redis
redis-cli KEYS "*"

# 5. Vérifier test
npm run test:single -- --grep "Test name"
```

---

## Pour les Comptables

### Créer une écriture comptable

1. Aller dans **Saisie Comptable** → **Nouvelles Écritures**
2. Remplir l'en-tête
   - Référence: `FAC-2026-001`
   - Date: Date de l'écriture
   - Type journal: Achat/Vente/...
3. Ajouter lignes
   - Compte: Sélectionner dans plan comptable
   - Débit/Crédit: Montants (attention: équilibre requis!)
4. Sauvegarder comme brouillon
5. Soumettre pour approbation
6. Attendre approbation DAF
7. Écriture posté → comptabilité mise à jour

### Consulter un rapport

1. Aller dans **Rapports Financiers**
2. Sélectionner type
   - Balance
   - Bilan
   - Compte de résultat
   - Cash flow
3. Choisir période
4. Cliquer **Générer**
5. Exporter (PDF/Excel)

---

## Pour les Administrateurs

### Ajouter un utilisateur

```bash
# Via API
POST /api/users
{
  "email": "newuser@company.com",
  "nom_complet": "New User",
  "role": "comptable"
}

# Via CLI
npm run create:user -- --email newuser@company.com --role comptable
```

### Gérer permissions

```bash
# Éditer role_id dans table users
# Ou via API
PATCH /api/users/1
{
  "role_id": 2  // Changer comptable → DAF
}
```

### Backup & Restore

```bash
# Backup
npm run db:backup
# Crée backup_YYYY-MM-DD_HH-MM-SS.sql

# Restore
npm run db:restore -- backup_2026-01-22_10-30-45.sql
```

---

## Pour les Auditeurs

### Vérifier audit trail

```bash
# Via API
GET /api/security/audit-trail?days=90&entity_type=journal_entry

# Exporter
GET /api/security/audit-trail/export?format=csv&days=365
```

### Vérifier événements sécurité

```bash
# Événements critiques
GET /api/security/events?severity=CRITICAL&days=30

# Tentatives authentification
GET /api/security/events?event_type=LOGIN_FAILED&days=7
```

---

# 📝 RECOMMANDATIONS FINALES

## Avant de produire

- [ ] Changer JWT_SECRET en production
- [ ] Configurer SMTP pour emails
- [ ] Activer HTTPS (SSL/TLS)
- [ ] Configurer CORS correctement
- [ ] Backup automatique activé
- [ ] Monitoring/alertes en place
- [ ] 2FA requis pour admins
- [ ] Tests E2E all passing
- [ ] Documentation mise à jour

## Maintenance régulière

- **Quotidien**: Vérifier logs erreurs
- **Hebdomadaire**: Vérifier metrics performance
- **Mensuel**: Audit sécurité, backup test
- **Trimestriel**: Mise à jour dépendances
- **Annuel**: Audit externe

---

**FIN DE LA DOCUMENTATION MAÎTRESSE COMPILÉE**

*Cette documentation consolide 254 fichiers markdown en une source de vérité unique.*
