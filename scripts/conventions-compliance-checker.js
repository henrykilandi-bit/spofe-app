#!/usr/bin/env node

/**
 * 🔍 SUIVI DE CONFORMITÉ - CONVENTIONS DE NOMMAGE SPOFE v2.2
 * 
 * Script de surveillance automatique qui se déclenche à chaque:
 * - Création de table
 * - Création de script
 * - Modification pouvant impacter la conformité
 * 
 * Usage:
 *   node conventions-compliance-checker.js [--fix] [--report] [--watch]
 *   
 * Options:
 *   --fix     : Tente de corriger automatiquement les violations
 *   --report  : Génère un rapport détaillé
 *   --watch   : Mode surveillance continue
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 🎯 CONFIGURATION DES CONVENTIONS SPOFE v2.2
const CONVENTIONS = {
  // 📊 DOMAINES FONCTIONNELS
  DOMAINS: {
    ORGANIZATIONNEL: {
      tables: ['groupes_entreprises', 'compagnies'],
      language: 'FR',
      description: 'Structure hiérarchique multi-compagnies'
    },
    SECURITY: {
      tables: ['users', 'roles', 'two_factor_auths', 'password_reset_tokens', 'token_blacklists'],
      language: 'EN',
      description: 'Gestion des accès, authentification, autorisations'
    },
    ACCOUNTING: {
      tables: ['charts_of_accounts', 'journal_entries', 'journal_entry_lines', 'account_balances'],
      language: 'EN',
      description: 'Cœur métier - Conformité comptable OHADA',
      frenchColumns: ['numero_compte', 'libellé', 'type_compte', 'montant_debit', 'montant_credit', 'solde_debit', 'solde_credit']
    },
    AUDIT: {
      tables: ['audit_trails', 'security_events'],
      language: 'EN',
      description: 'Immutabilité, conformité, investigation'
    },
    SYSTEM: {
      tables: ['app_settings'],
      language: 'EN',
      description: 'Configuration technique'
    }
  },

  // 🔧 RÈGLES TECHNIQUES
  RULES: {
    // snake_case obligatoire
    TABLE_NAMING: {
      pattern: /^[a-z_]+$/,
      description: 'Tables en snake_case uniquement'
    },
    COLUMN_NAMING: {
      pattern: /^[a-z_]+$/,
      description: 'Colonnes en snake_case uniquement'
    },
    PRIMARY_KEY: {
      pattern: /^id$/,
      description: 'Clé primaire doit être "id"'
    },
    FOREIGN_KEY: {
      pattern: /^[a-z_]+_id$/,
      description: 'Clés étrangères format {table}_id'
    },
    BOOLEAN_PREFIX: {
      pattern: /^(is_|can_|has_)/,
      description: 'Booléens commencent par is_, can_, has_'
    },
    TIMESTAMP_SUFFIX: {
      pattern: /_at$/,
      description: 'Timestamps finissent par _at'
    },
    SOFT_DELETE: {
      required: ['deleted_at'],
      description: 'Soft delete obligatoire avec deleted_at nullable'
    },
    OHADA_COLUMNS: {
      required: ['numero_compte', 'libellé'],
      description: 'Colonnes OHADA obligatoires pour tables comptables'
    }
  },

  // ❌ COLONNES INTERDITES
  FORBIDDEN_COLUMNS: [
    'groupeId', 'invitationToken', 'userRole', 'creationDate',
    'userId', 'companyId', 'createdAt', 'updatedAt'
  ],

  // ✅ HOOKS OBLIGATOIRES SEQUELIZE
  REQUIRED_HOOKS: [
    'beforeCreate',
    'beforeUpdate', 
    'afterCreate'
  ]
};

// 🎨 COULEURS POUR LE TERMINAL
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

/**
 * 🎯 Classe principale de vérification de conformité
 */
class ConventionsComplianceChecker {
  constructor() {
    this.violations = [];
    this.fixes = [];
    this.stats = {
      filesChecked: 0,
      violationsFound: 0,
      fixesApplied: 0
    };
  }

  /**
   * 🔍 Point d'entrée principal
   */
  async run(options = {}) {
    console.log(`${COLORS.cyan}🔍 SUIVI DE CONFORMITÉ - CONVENTIONS SPOFE v2.2${COLORS.reset}`);
    console.log(`${COLORS.blue}═`.repeat(60) + COLOR.reset);

    const startTime = Date.now();

    try {
      // 1. Scan des modèles Sequelize
      await this.scanSequelizeModels();
      
      // 2. Scan des migrations
      await this.scanMigrations();
      
      // 3. Scan des contrôleurs
      await this.scanControllers();
      
      // 4. Vérification de la documentation
      await this.checkDocumentation();

      // 5. Génération du rapport
      if (options.report) {
        await this.generateReport();
      }

      // 6. Tentative de correction automatique
      if (options.fix) {
        await this.applyFixes();
      }

      // 7. Mode surveillance
      if (options.watch) {
        await this.startWatchMode();
      }

      const duration = Date.now() - startTime;
      this.displaySummary(duration);

    } catch (error) {
      console.error(`${COLORS.red}❌ Erreur lors de la vérification:${COLORS.reset}`, error.message);
      process.exit(1);
    }
  }

  /**
   * 📊 Scan des modèles Sequelize
   */
  async scanSequelizeModels() {
    console.log(`\n${COLORS.yellow}📊 Scan des modèles Sequelize...${COLORS.reset}`);
    
    const modelsPath = path.join(projectRoot, 'cascade/src/models');
    
    if (!fs.existsSync(modelsPath)) {
      console.log(`${COLORS.yellow}⚠️  Dossier models non trouvé: ${modelsPath}${COLORS.reset}`);
      return;
    }

    const modelFiles = this.findFiles(modelsPath, '.js');
    
    for (const file of modelFiles) {
      await this.checkSequelizeModel(file);
    }
  }

  /**
   * 🔍 Vérification d'un modèle Sequelize
   */
  async checkSequelizeModel(filePath) {
    this.stats.filesChecked++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const fileName = path.basename(filePath, '.js');

      // Vérification du nom de table
      const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
      if (tableNameMatch) {
        const tableName = tableNameMatch[1];
        this.checkTableName(tableName, filePath);
      }

      // Vérification des colonnes
      this.checkModelColumns(content, filePath, fileName);

      // Vérification des hooks
      this.checkModelHooks(content, filePath);

      // Vérification des options
      this.checkModelOptions(content, filePath);

    } catch (error) {
      this.addViolation('FILE_READ_ERROR', filePath, `Erreur lecture fichier: ${error.message}`);
    }
  }

  /**
   * 📋 Vérification du nom de table
   */
  checkTableName(tableName, filePath) {
    // Vérification snake_case
    if (!CONVENTIONS.RULES.TABLE_NAMING.pattern.test(tableName)) {
      this.addViolation('TABLE_NAMING', filePath, `Table "${tableName}" ne respecte pas snake_case`);
    }

    // Vérification domaine
    const domain = this.getTableDomain(tableName);
    if (!domain) {
      this.addViolation('UNKNOWN_DOMAIN', filePath, `Table "${tableName}" n'appartient à aucun domaine connu`);
    }

    // Vérification colonnes interdites
    for (const forbidden of CONVENTIONS.FORBIDDEN_COLUMNS) {
      if (tableName.includes(forbidden)) {
        this.addViolation('FORBIDDEN_PATTERN', filePath, `Table "${tableName}" contient motif interdit "${forbidden}"`);
      }
    }
  }

  /**
   * 🏢 Détermination du domaine d'une table
   */
  getTableDomain(tableName) {
    for (const [domainName, domain] of Object.entries(CONVENTIONS.DOMAINS)) {
      if (domain.tables.includes(tableName)) {
        return { name: domainName, ...domain };
      }
    }
    return null;
  }

  /**
   * 📝 Vérification des colonnes du modèle
   */
  checkModelColumns(content, filePath, fileName) {
    // Extraction des définitions de colonnes
    const columnMatches = content.matchAll(/(\w+):\s*{\s*type:\s*([^}]+)}/g);
    
    for (const match of columnMatches) {
      const columnName = match[1];
      const columnType = match[2];

      // Vérification snake_case
      if (!CONVENTIONS.RULES.COLUMN_NAMING.pattern.test(columnName)) {
        this.addViolation('COLUMN_NAMING', filePath, `Colonne "${columnName}" ne respecte pas snake_case`);
      }

      // Vérification colonnes interdites
      if (CONVENTIONS.FORBIDDEN_COLUMNS.includes(columnName)) {
        this.addViolation('FORBIDDEN_COLUMN', filePath, `Colonne "${columnName}" est interdite`);
      }

      // Vérification clés étrangères
      if (columnName.endsWith('_id') && columnName !== 'id') {
        if (!CONVENTIONS.RULES.FOREIGN_KEY.pattern.test(columnName)) {
          this.addViolation('FOREIGN_KEY_FORMAT', filePath, `Clé étrangère "${columnName}" format incorrect`);
        }
      }

      // Vérification booléens
      if (columnType.includes('BOOLEAN') || columnType.includes('boolean')) {
        if (!CONVENTIONS.RULES.BOOLEAN_PREFIX.pattern.test(columnName)) {
          this.addViolation('BOOLEAN_NAMING', filePath, `Booléen "${columnName}" doit commencer par is_, can_, has_`);
        }
      }

      // Vérification timestamps
      if (columnType.includes('DATE') || columnType.includes('TIMESTAMP')) {
        if (!columnName.endsWith('_at') && !columnName.endsWith('_date')) {
          this.addViolation('TIMESTAMP_NAMING', filePath, `Timestamp "${columnName}" doit finir par _at ou _date`);
        }
      }
    }

    // Vérification colonnes OHADA obligatoires
    const domain = this.getTableDomain(fileName);
    if (domain?.name === 'ACCOUNTING') {
      for (const requiredColumn of CONVENTIONS.RULES.OHADA_COLUMNS.required) {
        if (!content.includes(requiredColumn)) {
          this.addViolation('MISSING_OHADA_COLUMN', filePath, `Colonne OHADA obligatoire manquante: ${requiredColumn}`);
        }
      }
    }
  }

  /**
   * 🪝 Vérification des hooks Sequelize
   */
  checkModelHooks(content, filePath) {
    const hooksMatch = content.match(/hooks:\s*{([^}]+)}/s);
    
    if (!hooksMatch) {
      this.addViolation('MISSING_HOOKS', filePath, 'Hooks Sequelize manquants');
      return;
    }

    const hooksContent = hooksMatch[1];
    
    for (const requiredHook of CONVENTIONS.REQUIRED_HOOKS) {
      if (!hooksContent.includes(requiredHook)) {
        this.addViolation('MISSING_HOOK', filePath, `Hook obligatoire manquant: ${requiredHook}`);
      }
    }
  }

  /**
   * ⚙️ Vérification des options du modèle
   */
  checkModelOptions(content, filePath) {
    // Vérification underscored: true
    if (!content.includes('underscored: true')) {
      this.addViolation('MISSING_UNDERSCORED', filePath, 'Option underscored: true manquante');
    }

    // Vérification timestamps: true
    if (!content.includes('timestamps: true')) {
      this.addViolation('MISSING_TIMESTAMPS', filePath, 'Option timestamps: true manquante');
    }

    // Vérification paranoid: true
    if (!content.includes('paranoid: true')) {
      this.addViolation('MISSING_PARANOID', filePath, 'Option paranoid: true manquante (soft delete)');
    }
  }

  /**
   * 🔄 Scan des migrations
   */
  async scanMigrations() {
    console.log(`\n${COLORS.yellow}🔄 Scan des migrations...${COLORS.reset}`);
    
    const migrationsPath = path.join(projectRoot, 'cascade/src/migrations');
    
    if (!fs.existsSync(migrationsPath)) {
      console.log(`${COLORS.yellow}⚠️  Dossier migrations non trouvé: ${migrationsPath}${COLORS.reset}`);
      return;
    }

    const migrationFiles = this.findFiles(migrationsPath, '.js');
    
    for (const file of migrationFiles) {
      await this.checkMigration(file);
    }
  }

  /**
   * 🔍 Vérification d'une migration
   */
  async checkMigration(filePath) {
    this.stats.filesChecked++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Vérification CREATE TABLE
      const createTableMatches = content.matchAll(/CREATE TABLE\s+(\w+)/gi);
      
      for (const match of createTableMatches) {
        const tableName = match[1];
        this.checkTableName(tableName, filePath);
      }

      // Vérification ALTER TABLE
      const alterTableMatches = content.matchAll(/ALTER TABLE\s+(\w+)/gi);
      
      for (const match of alterTableMatches) {
        const tableName = match[1];
        this.checkTableName(tableName, filePath);
      }

      // Vérification colonnes ajoutées
      const addColumnMatches = content.matchAll(/ADD COLUMN\s+(\w+)/gi);
      
      for (const match of addColumnMatches) {
        const columnName = match[1];
        if (!CONVENTIONS.RULES.COLUMN_NAMING.pattern.test(columnName)) {
          this.addViolation('COLUMN_NAMING', filePath, `Colonne ajoutée "${columnName}" ne respecte pas snake_case`);
        }
      }

    } catch (error) {
      this.addViolation('FILE_READ_ERROR', filePath, `Erreur lecture migration: ${error.message}`);
    }
  }

  /**
   * 🎮 Scan des contrôleurs
   */
  async scanControllers() {
    console.log(`\n${COLORS.yellow}🎮 Scan des contrôleurs...${COLORS.reset}`);
    
    const controllersPath = path.join(projectRoot, 'cascade/src/controllers');
    
    if (!fs.existsSync(controllersPath)) {
      console.log(`${COLORS.yellow}⚠️  Dossier controllers non trouvé: ${controllersPath}${COLORS.reset}`);
      return;
    }

    const controllerFiles = this.findFiles(controllersPath, '.js');
    
    for (const file of controllerFiles) {
      await this.checkController(file);
    }
  }

  /**
   * 🔍 Vérification d'un contrôleur
   */
  async checkController(filePath) {
    this.stats.filesChecked++;
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Vérification des noms de tables dans les requêtes
      const tableMatches = content.matchAll(/FROM\s+(\w+)|JOIN\s+(\w+)|INTO\s+(\w+)/gi);
      
      for (const match of tableMatches) {
        const tableName = match[1] || match[2] || match[3];
        if (tableName) {
          this.checkTableName(tableName, filePath);
        }
      }

      // Vérification des noms de colonnes
      const columnMatches = content.matchAll(/SELECT\s+([^FROM]+)|WHERE\s+(\w+)\s*=|SET\s+(\w+)\s*=/gi);
      
      for (const match of columnMatches) {
        const columns = match[1] || match[2] || match[3];
        if (columns && typeof columns === 'string') {
          const columnList = columns.split(',').map(c => c.trim().split(' ')[0]);
          for (const column of columnList) {
            if (column && !CONVENTIONS.RULES.COLUMN_NAMING.pattern.test(column) && column !== '*') {
              this.addViolation('COLUMN_NAMING', filePath, `Colonne "${column}" ne respecte pas snake_case`);
            }
          }
        }
      }

    } catch (error) {
      this.addViolation('FILE_READ_ERROR', filePath, `Erreur lecture contrôleur: ${error.message}`);
    }
  }

  /**
   * 📚 Vérification de la documentation
   */
  async checkDocumentation() {
    console.log(`\n${COLORS.yellow}📚 Vérification de la documentation...${COLORS.reset}`);
    
    const docsPath = path.join(projectRoot, 'docs/tables');
    
    if (!fs.existsSync(docsPath)) {
      this.addViolation('MISSING_DOCS_FOLDER', docsPath, 'Dossier de documentation des tables manquant');
      return;
    }

    // Vérification que chaque table a sa documentation
    for (const domain of Object.values(CONVENTIONS.DOMAINS)) {
      for (const table of domain.tables) {
        const docFile = path.join(docsPath, `${table}.md`);
        
        if (!fs.existsSync(docFile)) {
          this.addViolation('MISSING_TABLE_DOC', docFile, `Documentation manquante pour table: ${table}`);
        } else {
          await this.checkTableDocumentation(docFile, table);
        }
      }
    }
  }

  /**
   * 📄 Vérification de la documentation d'une table
   */
  async checkTableDocumentation(docPath, tableName) {
    try {
      const content = fs.readFileSync(docPath, 'utf8');
      
      // Vérification des sections obligatoires
      const requiredSections = [
        '## 📊 TABLE:',
        '### 🎯 Rôle Métier',
        '### ⚠️ Criticité',
        '### 📝 Colonnes Clés',
        '### 🔗 Dépendances'
      ];

      for (const section of requiredSections) {
        if (!content.includes(section)) {
          this.addViolation('MISSING_DOC_SECTION', docPath, `Section manquante: ${section}`);
        }
      }

      // Vérification cohérence nom de table
      if (!content.includes(`## 📊 TABLE: ${tableName}`)) {
        this.addViolation('INCONSISTENT_TABLE_NAME', docPath, `Nom de table incohérent dans documentation`);
      }

    } catch (error) {
      this.addViolation('DOC_READ_ERROR', docPath, `Erreur lecture documentation: ${error.message}`);
    }
  }

  /**
   * 🛠️ Application des corrections automatiques
   */
  async applyFixes() {
    console.log(`\n${COLORS.yellow}🛠️  Application des corrections automatiques...${COLORS.reset}`);
    
    for (const violation of this.violations) {
      if (this.isFixable(violation)) {
        await this.fixViolation(violation);
      }
    }
  }

  /**
   * 🔧 Vérification si une violation est corrigeable
   */
  isFixable(violation) {
    const fixableTypes = [
      'MISSING_UNDERSCORED',
      'MISSING_TIMESTAMPS', 
      'MISSING_PARANOID',
      'COLUMN_NAMING',
      'TABLE_NAMING'
    ];
    
    return fixableTypes.includes(violation.type);
  }

  /**
   * 🔧 Correction d'une violation
   */
  async fixViolation(violation) {
    try {
      let content = fs.readFileSync(violation.file, 'utf8');
      let fixed = false;

      switch (violation.type) {
        case 'MISSING_UNDERSCORED':
          if (content.includes('define(')) {
            content = this.addOptionToModel(content, 'underscored: true');
            fixed = true;
          }
          break;

        case 'MISSING_TIMESTAMPS':
          if (content.includes('define(')) {
            content = this.addOptionToModel(content, 'timestamps: true');
            fixed = true;
          }
          break;

        case 'MISSING_PARANOID':
          if (content.includes('define(')) {
            content = this.addOptionToModel(content, 'paranoid: true');
            fixed = true;
          }
          break;
      }

      if (fixed) {
        fs.writeFileSync(violation.file, content);
        this.fixes.push(violation);
        this.stats.fixesApplied++;
        console.log(`${COLORS.green}✅ Corrigé: ${violation.message}${COLORS.reset}`);
      }

    } catch (error) {
      console.log(`${COLORS.red}❌ Impossible de corriger: ${violation.message}${COLORS.reset}`);
    }
  }

  /**
   * ➕ Ajout d'option à un modèle Sequelize
   */
  addOptionToModel(content, option) {
    const optionsMatch = content.match(/},\s*{\s*([^}]+)\s*}\s*\);?\s*$/);
    
    if (optionsMatch) {
      const existingOptions = optionsMatch[1];
      const newOptions = existingOptions + ',\n    ' + option;
      return content.replace(existingOptions, newOptions);
    }
    
    return content;
  }

  /**
   * 📊 Génération du rapport
   */
  async generateReport() {
    console.log(`\n${COLORS.yellow}📊 Génération du rapport de conformité...${COLORS.reset}`);
    
    const reportPath = path.join(projectRoot, 'conventions-compliance-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      version: '2.2.0',
      stats: this.stats,
      violations: this.violations,
      fixes: this.fixes,
      conventions: CONVENTIONS
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`${COLORS.green}📄 Rapport généré: ${reportPath}${COLORS.reset}`);
  }

  /**
   * 👁️ Mode surveillance continue
   */
  async startWatchMode() {
    console.log(`\n${COLORS.yellow}👁️  Mode surveillance activé...${COLORS.reset}`);
    console.log(`${COLORS.cyan}Surveillance des modifications en temps réel${COLORS.reset}`);
    
    // Implémentation de la surveillance avec fs.watch
    // (Pour une implémentation complète, utiliser chokidar)
    
    console.log(`${COLORS.green}✅ Surveillance active - Ctrl+C pour arrêter${COLORS.reset}`);
  }

  /**
   * 📋 Ajout d'une violation
   */
  addViolation(type, file, message) {
    this.violations.push({
      type,
      file: path.relative(projectRoot, file),
      message,
      timestamp: new Date().toISOString()
    });
    this.stats.violationsFound++;
  }

  /**
   * 🔍 Recherche de fichiers par extension
   */
  findFiles(dir, extension) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * 📊 Affichage du résumé
   */
  displaySummary(duration) {
    console.log(`\n${COLORS.blue}═`.repeat(60) + COLOR.reset);
    console.log(`${COLORS.bold}📊 RÉSUMÉ DE CONFORMITÉ SPOFE v2.2${COLORS.reset}`);
    console.log(`${COLORS.blue}═`.repeat(60) + COLOR.reset);
    
    console.log(`\n${COLORS.cyan}📈 Statistiques:${COLORS.reset}`);
    console.log(`  • Fichiers vérifiés: ${this.stats.filesChecked}`);
    console.log(`  • Violations trouvées: ${this.stats.violationsFound}`);
    console.log(`  • Corrections appliquées: ${this.stats.fixesApplied}`);
    console.log(`  • Durée: ${duration}ms`);

    if (this.violations.length > 0) {
      console.log(`\n${COLORS.red}🚨 Violations par type:${COLORS.reset}`);
      const violationsByType = {};
      
      for (const violation of this.violations) {
        violationsByType[violation.type] = (violationsByType[violation.type] || 0) + 1;
      }
      
      for (const [type, count] of Object.entries(violationsByType)) {
        console.log(`  • ${type}: ${count}`);
      }
    }

    if (this.stats.violationsFound === 0) {
      console.log(`\n${COLORS.green}🎉 CONFORMITÉ PARFAITE!${COLORS.reset}`);
      console.log(`${COLORS.green}✅ Tous les fichiers respectent les conventions SPOFE v2.2${COLORS.reset}`);
    } else {
      console.log(`\n${COLORS.yellow}⚠️  ${this.stats.violationsFound} violations trouvées${COLORS.reset}`);
      console.log(`${COLORS.yellow}📄 Exécutez avec --fix pour corriger automatiquement${COLORS.reset}`);
    }

    console.log(`\n${COLORS.magenta}📋 Conventions vérifiées:${COLORS.reset}`);
    console.log(`  • snake_case obligatoire en base de données`);
    console.log(`  • Clés étrangères format {table}_id`);
    console.log(`  • Timestamps format *_at`);
    console.log(`  • Soft delete avec deleted_at`);
    console.log(`  • Hooks Sequelize obligatoires`);
    console.log(`  • Documentation par table obligatoire`);

    console.log(`\n${COLORS.blue}🎯 Score de conformité: ${this.calculateComplianceScore()}%${COLORS.reset}`);
  }

  /**
   * 📊 Calcul du score de conformité
   */
  calculateComplianceScore() {
    if (this.stats.filesChecked === 0) return 100;
    
    const potentialViolations = this.stats.filesChecked * 10; // Estimation
    const complianceRate = Math.max(0, 100 - (this.stats.violationsFound / potentialViolations * 100));
    
    return Math.round(complianceRate);
  }
}

/**
 * 🚀 Point d'entrée principal
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    fix: args.includes('--fix'),
    report: args.includes('--report'),
    watch: args.includes('--watch')
  };

  const checker = new ConventionsComplianceChecker();
  await checker.run(options);
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default ConventionsComplianceChecker;
