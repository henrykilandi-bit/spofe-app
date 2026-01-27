# Guide d'Exécution des Migrations et Seeds - SPOFE

## 📋 Sommaire
1. [Prérequis](#prérequis)
2. [Structure des Migrations](#structure-des-migrations)
3. [Exécution Pas à Pas](#exécution-pas-à-pas)
4. [Gestion des Données](#gestion-des-données)
5. [Dépannage](#dépannage)

## Prérequis

### Services Requis
```bash
# MySQL doit être en cours d'exécution
# Vérifier avec:
mysql --version          # MySQL doit être installé
mysql -u root -p         # Se connecter (password demandé)
```

### Variables d'Environnement
Vérifiez que `.env` contient:
```
DB_HOST=localhost
DB_USER=spofe_user
DB_PASSWORD=your_password
DB_NAME=spofe_db
DB_PORT=3306
NODE_ENV=development
JWT_SECRET=your_secret_key
```

### Installation des Dépendances
```bash
cd cascade
npm install
```

## Structure des Migrations

### Fichiers de Migration Créés

| Migration | Numéro | Fichier | Tables Créées |
|-----------|--------|---------|---------------|
| Companies | 004 | `004-create-companies-table.js` | `companies` |
| Chart of Accounts | 005 | `005-create-charts-of-accounts-table.js` | `chartsOfAccounts` |
| Journal Entries | 006 | `006-create-journal-entries-table.js` | `journalEntries` |
| Entry Lines | 007 | `007-create-journal-entry-lines-table.js` | `journalEntryLines` |
| Account Balances | 008 | `008-create-account-balances-table.js` | `accountBalances` |

### Structure des Tables

#### Companies (004)
```
┌─────────────────────────────────┐
│         companies               │
├─────────────────────────────────┤
│ id (PK)                         │
│ name (VARCHAR)                  │
│ registrationNumber (UNIQUE)     │
│ email                           │
│ phone                           │
│ address                         │
│ city / country                  │
│ fiscalYearStartMonth/End        │
│ currency (DEFAULT: XOF)         │
│ status (ENUM: ACTIVE/INACTIVE)  │
│ createdAt / updatedAt           │
└─────────────────────────────────┘
```

#### Chart of Accounts (005)
```
┌──────────────────────────────────┐
│     chartsOfAccounts             │
├──────────────────────────────────┤
│ id (PK)                          │
│ companyId (FK) → companies       │
│ accountNumber (UNIQUE per co.)   │
│ accountName                      │
│ accountType (ENUM: 7 types)      │
│ parentAccountId (FK, self-ref)   │
│ isControlAccount / isPrintable   │
│ debit / credit / balance         │
│ createdAt / updatedAt            │
└──────────────────────────────────┘
```

#### Journal Entries (006)
```
┌──────────────────────────────────┐
│     journalEntries               │
├──────────────────────────────────┤
│ id (PK)                          │
│ companyId (FK) → companies       │
│ journalCode (AC/VT/BQ/CA/OD...)  │
│ entryDate                        │
│ description                      │
│ totalDebit / totalCredit         │
│ status (ENUM: DRAFT/POSTED...)   │
│ createdBy (FK) → users           │
│ approvedBy (FK) → users          │
│ approvalDate                     │
│ createdAt / updatedAt            │
└──────────────────────────────────┘
```

#### Journal Entry Lines (007)
```
┌──────────────────────────────────┐
│    journalEntryLines             │
├──────────────────────────────────┤
│ id (PK)                          │
│ journalEntryId (FK, CASCADE)     │
│ accountId (FK)                   │
│ debit (DECIMAL)                  │
│ credit (DECIMAL)                 │
│ description                      │
│ createdAt / updatedAt            │
│ CHK: NOT(debit>0 AND credit>0)   │
└──────────────────────────────────┘
```

#### Account Balances (008)
```
┌──────────────────────────────────┐
│     accountBalances              │
├──────────────────────────────────┤
│ id (PK)                          │
│ companyId (FK)                   │
│ accountId (FK)                   │
│ periodDate                       │
│ periodOpening                    │
│ debit / credit                   │
│ balance / closingBalance         │
│ UNIQUE(company, account, period) │
│ createdAt / updatedAt            │
└──────────────────────────────────┘
```

## Exécution Pas à Pas

### Option 1: Initialisation Complète (RECOMMANDÉE)

```bash
cd cascade

# Étape 1: Lister les migrations disponibles
node src/scripts/migrations-manager.js list

# Étape 2: Exécuter toutes les migrations et seeds
node src/scripts/db-init.js

# Ou via npm scripts (si configurés)
npm run db:init
```

**Résultat Attendu:**
```
🗄️  Initialisation complète de la base de données SPOFE

1️⃣  Test de connexion à la base de données...
✅ Connecté

2️⃣  Synchronisation des modèles Sequelize...
✅ Modèles synchronisés

3️⃣  Exécution des migrations...
   ✅ 004-create-companies-table.js
   ✅ 005-create-charts-of-accounts-table.js
   ✅ 006-create-journal-entries-table.js
   ✅ 007-create-journal-entry-lines-table.js
   ✅ 008-create-account-balances-table.js
✅ 5 migrations exécutées

4️⃣  Exécution des seeds...
✅ Seeds complétées
   - Compagnie: SOCIETE ANONYME DEMO
   - Comptes: 45
   - Écritures: 10

🎉 Initialisation complète!

✅ Vous pouvez démarrer l'application avec: npm run dev
```

### Option 2: Exécution Manuelle

#### 2.1 Créer la Base de Données (si nécessaire)

```sql
-- Via MySQL CLI
CREATE DATABASE IF NOT EXISTS spofe_db;
USE spofe_db;

-- Vérifier qu'elle est bien créée
SHOW DATABASES;
```

#### 2.2 Exécuter les Migrations Une par Une

```bash
# Exécuter une migration spécifique
node src/scripts/migrations-manager.js up companies

# Exécuter toutes les migrations
node src/scripts/migrations-manager.js up
```

#### 2.3 Exécuter les Seeds

```bash
# Via le script npm (si configuré)
npm run db:seed

# Ou directement via Node.js
node -e "import('./src/database/seeders/advanced-seeds.js').then(m => m.default())"
```

### Option 3: Via npm Scripts

Ajoutez à `package.json`:
```json
{
  "scripts": {
    "db:init": "node src/scripts/db-init.js",
    "db:migrate": "node src/scripts/migrations-manager.js up",
    "db:migrate:list": "node src/scripts/migrations-manager.js list",
    "db:seed": "node -e \"import('./src/database/seeders/advanced-seeds.js').then(m => m.default())\"",
    "db:reset": "npm run db:init -- --reset"
  }
}
```

Puis exécutez:
```bash
npm run db:init        # Initialisation complète
npm run db:migrate     # Juste les migrations
npm run db:seed        # Juste les seeds
npm run db:migrate:list  # Lister les migrations
```

## Gestion des Données

### Seed Data Incluses

#### 1. Compagnie
```
Nom: SOCIETE ANONYME DEMO
Numéro d'Immatriculation: SA-2024-001
Devise: XOF (Franc CFA)
État: ACTIVE
Année Fiscale: 01/01 - 31/12
```

#### 2. Comptes Comptables (45 total - Norme OHADA)

Catégories:
- **Assets (Actif)**: 101-401 (10 comptes)
- **Liabilities (Passif)**: 201-210 (8 comptes)
- **Equity (Capitaux Propres)**: 101-110 (7 comptes)
- **Revenues (Produits)**: 701-799 (6 comptes)
- **Expenses (Charges)**: 601-699 (8 comptes)

#### 3. Transactions Exemples (10 total)

| # | Journal | Description | Montant |
|---|---------|-------------|---------|
| 1 | BQ | Dépôt de capital | 5 000 000 XOF |
| 2 | VT | Achat marchandises | 500 000 XOF |
| 3 | VT | Vente marchandises + TVA | 750 000 XOF |
| 4 | BQ | Paiement fournisseur | 450 000 XOF |
| 5 | AJ | Ajustement stocks | 50 000 XOF |
| 6 | CA | Retrait caisse | 100 000 XOF |
| 7 | AJ | Fournitures de bureau | 25 000 XOF |
| 8 | PAY | Paie salaires | 800 000 XOF |
| 9 | OD | Loyer bureau | 150 000 XOF |
| 10 | PAY | Salaires payés | 800 000 XOF |

**Toutes les transactions sont équilibrées (Débits = Crédits)**

### Vérifier les Données Après Seed

```sql
-- Compter les comptes créés
SELECT COUNT(*) as total_accounts FROM chartsOfAccounts;
-- Résultat attendu: 45

-- Voir les transactions créées
SELECT * FROM journalEntries;
-- Résultat attendu: 10 lignes

-- Vérifier l'équilibre
SELECT SUM(totalDebit) as total_debit, SUM(totalCredit) as total_credit
FROM journalEntries;
-- Les deux montants doivent être égaux
```

## Dépannage

### Erreur: "Access Denied for user"

```bash
# Vérifier les credentials dans .env
cat .env | grep DB_

# Tester la connexion MySQL
mysql -h localhost -u spofe_user -p spofe_db

# Si l'utilisateur n'existe pas:
mysql -u root -p
CREATE USER 'spofe_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON spofe_db.* TO 'spofe_user'@'localhost';
FLUSH PRIVILEGES;
```

### Erreur: "Table already exists"

```bash
# Les migrations vérifient déjà si la table existe avant de la créer
# Si vous voulez recréer, supprimez d'abord:
mysql -u root -p spofe_db < /dev/null
DROP DATABASE spofe_db;
CREATE DATABASE spofe_db;

# Puis réexécutez les migrations
npm run db:init
```

### Erreur: "Foreign key constraint fails"

```bash
# Assurez-vous que les FK des migrations pointent vers les bonnes tables
# Vérifier l'ordre d'exécution des migrations:
1. Companies (004) - pas de FK
2. Charts (005) - FK vers companies
3. Journal Entries (006) - FK vers companies
4. Entry Lines (007) - FK vers entries et accounts
5. Balances (008) - FK vers accounts

# Exécuter dans le bon ordre:
npm run db:migrate
```

### Erreur: "Cannot find module"

```bash
# Vérifier les chemins dans db-init.js et migrations-manager.js
# Les imports doivent correspondre à votre structure réelle

# Exemple de chemin correct pour ES modules:
import { sequelize } from '../config/database.js';  // ✅
import sequelize from '../config/database';        // ❌
```

### Seeds ne s'exécutent pas

```bash
# Vérifier que les migrations sont déjà exécutées
# Les seeds créent des données APRÈS les tables

# Exécuter dans l'ordre:
1. npm run db:migrate      # Crée les tables
2. npm run db:seed         # Peuple les données
```

## Points de Contrôle

Après initialisation, vérifiez:

✅ **Base de données créée**
```sql
SHOW DATABASES;  -- spofe_db doit être listé
```

✅ **Tables créées**
```sql
SHOW TABLES;     -- 5+ tables (+ les existantes)
```

✅ **Données seedées**
```sql
SELECT COUNT(*) FROM companies;        -- 1
SELECT COUNT(*) FROM chartsOfAccounts; -- 45
SELECT COUNT(*) FROM journalEntries;   -- 10
```

✅ **Intégrité des données**
```sql
-- Comptes liés à la compagnie
SELECT COUNT(*) FROM chartsOfAccounts WHERE companyId = 1;
-- Résultat attendu: 45

-- Écritures équilibrées
SELECT * FROM journalEntries WHERE totalDebit != totalCredit;
-- Résultat attendu: 0 lignes (aucune déséquilibrée)
```

✅ **Application démarre**
```bash
npm run dev
# Vérifier dans les logs: "Database connected successfully"
```

## Prochaines Étapes

Après initialisation réussie:

1. **Démarrer l'application**
   ```bash
   npm run dev
   ```

2. **Tester les endpoints**
   ```bash
   # Créer un utilisateur (si pas existant)
   POST /api/auth/register
   
   # Se connecter
   POST /api/auth/login
   
   # Récupérer les comptes
   GET /api/accounts
   ```

3. **Vérifier les sauvegardes**
   ```bash
   ls -la backups/
   # Doit contenir au moins: spofe_db_YYYYMMDD_HHMMSS.sql.gz
   ```

4. **Intégrer les services de sécurité**
   - Account Lockout dans auth.controller.js
   - Access Logging dans les événements critiques
   - Voir INTEGRATION_GUIDE.md

---

**Status**: ✅ Prêt pour production avec 45 comptes et 10 transactions de test
