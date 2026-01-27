#!/usr/bin/env node

/**
 * 🪝 PRE-COMMIT HOOK - CONVENTIONS SPOFE v2.2
 * 
 * Hook Git qui bloque les commits non conformes aux conventions de nommage
 * Se déclenche automatiquement avant chaque commit
 * 
 * Installation:
 *   node scripts/install-pre-commit.js
 *   
 * Test manuel:
 *   node scripts/pre-commit-hook.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

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
 * 🪝 Classe du hook pre-commit
 */
class PreCommitHook {
  constructor() {
    this.violations = [];
    this.stagedFiles = [];
    this.blockCommit = false;
  }

  /**
   * 🚀 Point d'entrée principal
   */
  async run() {
    console.log(`${COLORS.cyan}🪝 PRE-COMMIT HOOK - CONVENTIONS SPOFE v2.2${COLORS.reset}`);
    console.log(`${COLORS.blue}═`.repeat(50) + COLOR.reset);

    try {
      // 1. Récupération des fichiers staged
      await this.getStagedFiles();

      if (this.stagedFiles.length === 0) {
        console.log(`${COLORS.yellow}⚠️  Aucun fichier staged à vérifier${COLORS.reset}`);
        return this.success();
      }

      console.log(`${COLORS.blue}📋 Fichiers staged: ${this.stagedFiles.length}${COLORS.reset}`);

      // 2. Vérification des conventions
      await this.checkStagedFiles();

      // 3. Affichage des résultats
      this.displayResults();

      // 4. Blocage ou autorisation du commit
      if (this.blockCommit) {
        this.blockCommitAction();
      } else {
        this.success();
      }

    } catch (error) {
      console.error(`${COLORS.red}❌ Erreur dans le hook pre-commit:${COLORS.reset}`, error.message);
      this.blockCommitAction();
    }
  }

  /**
   * 📋 Récupération des fichiers staged
   */
  async getStagedFiles() {
    try {
      const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
      this.stagedFiles = output.split('\n').filter(file => file.trim() !== '');
    } catch (error) {
      throw new Error('Impossible de récupérer les fichiers staged');
    }
  }

  /**
   * 🔍 Vérification des fichiers staged
   */
  async checkStagedFiles() {
    for (const file of this.stagedFiles) {
      await this.checkFile(file);
    }
  }

  /**
   * 🔍 Vérification d'un fichier spécifique
   */
  async checkFile(filePath) {
    const fullPath = path.join(projectRoot, filePath);

    if (!fs.existsSync(fullPath)) {
      return;
    }

    const extension = path.extname(filePath);
    const fileName = path.basename(filePath);

    // Vérification selon le type de fichier
    switch (extension) {
      case '.js':
        await this.checkJavaScriptFile(fullPath, filePath);
        break;
      case '.sql':
        await this.checkSQLFile(fullPath, filePath);
        break;
      case '.md':
        await this.checkMarkdownFile(fullPath, filePath);
        break;
    }

    // Vérification du nom de fichier
    this.checkFileName(filePath);
  }

  /**
   * 🔍 Vérification d'un fichier JavaScript
   */
  async checkJavaScriptFile(fullPath, relativePath) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Vérification spécifique aux modèles Sequelize
      if (relativePath.includes('/models/') || relativePath.includes('\\models\\')) {
        this.checkSequelizeModel(content, relativePath);
      }

      // Vérification spécifique aux migrations
      if (relativePath.includes('/migrations/') || relativePath.includes('\\migrations\\')) {
        this.checkMigration(content, relativePath);
      }

      // Vérification spécifique aux contrôleurs
      if (relativePath.includes('/controllers/') || relativePath.includes('\\controllers\\')) {
        this.checkController(content, relativePath);
      }

      // Vérification des conventions générales
      this.checkJavaScriptConventions(content, relativePath);

    } catch (error) {
      this.addViolation('FILE_READ_ERROR', relativePath, `Erreur lecture fichier: ${error.message}`);
    }
  }

  /**
   * 📊 Vérification d'un modèle Sequelize
   */
  checkSequelizeModel(content, filePath) {
    // Vérification du nom de table
    const tableNameMatch = content.match(/tableName:\s*['"`]([^'"`]+)['"`]/);
    if (tableNameMatch) {
      const tableName = tableNameMatch[1];
      this.checkTableName(tableName, filePath);
    }

    // Vérification des options obligatoires
    const requiredOptions = ['underscored: true', 'timestamps: true', 'paranoid: true'];
    for (const option of requiredOptions) {
      if (!content.includes(option)) {
        this.addViolation('MISSING_OPTION', filePath, `Option obligatoire manquante: ${option}`);
        this.blockCommit = true;
      }
    }

    // Vérification des hooks
    if (!content.includes('hooks:')) {
      this.addViolation('MISSING_HOOKS', filePath, 'Hooks Sequelize manquants');
      this.blockCommit = true;
    }
  }

  /**
   * 🔄 Vérification d'une migration
   */
  checkMigration(content, filePath) {
    // Vérification des CREATE TABLE
    const createTableMatches = content.matchAll(/CREATE TABLE\s+(\w+)/gi);
    for (const match of createTableMatches) {
      const tableName = match[1];
      this.checkTableName(tableName, filePath);
    }

    // Vérification des ALTER TABLE
    const alterTableMatches = content.matchAll(/ALTER TABLE\s+(\w+)/gi);
    for (const match of alterTableMatches) {
      const tableName = match[1];
      this.checkTableName(tableName, filePath);
    }
  }

  /**
   * 🎮 Vérification d'un contrôleur
   */
  checkController(content, filePath) {
    // Vérification des requêtes SQL
    const tableMatches = content.matchAll(/FROM\s+(\w+)|JOIN\s+(\w+)|INTO\s+(\w+)/gi);
    for (const match of tableMatches) {
      const tableName = match[1] || match[2] || match[3];
      if (tableName) {
        this.checkTableName(tableName, filePath);
      }
    }
  }

  /**
   * 🔍 Vérification des conventions JavaScript
   */
  checkJavaScriptConventions(content, filePath) {
    // Vérification des variables camelCase (frontend)
    const camelCaseVars = content.matchAll(/(?:const|let|var)\s+([a-z][a-zA-Z0-9]*)/g);
    for (const match of camelCaseVars) {
      const varName = match[1];
      if (varName.includes('_') && !varName.startsWith('is_') && !varName.startsWith('has_') && !varName.startsWith('can_')) {
        this.addViolation('CAMEL_CASE_VAR', filePath, `Variable JavaScript devrait être camelCase: ${varName}`);
      }
    }
  }

  /**
   * 🗄️ Vérification d'un fichier SQL
   */
  async checkSQLFile(fullPath, relativePath) {
    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      // Vérification des noms de tables
      const tableMatches = content.matchAll(/CREATE TABLE\s+(\w+)|ALTER TABLE\s+(\w+)|DROP TABLE\s+(\w+)/gi);
      for (const match of tableMatches) {
        const tableName = match[1] || match[2] || match[3];
        if (tableName) {
          this.checkTableName(tableName, relativePath);
        }
      }

      // Vérification des noms de colonnes
      const columnMatches = content.matchAll(/ADD COLUMN\s+(\w+)|(\w+)\s+(VARCHAR|INT|DECIMAL|BOOLEAN|DATE|TIMESTAMP)/gi);
      for (const match of columnMatches) {
        const columnName = match[1] || match[2];
        if (columnName) {
          this.checkColumnName(columnName, relativePath);
        }
      }

    } catch (error) {
      this.addViolation('FILE_READ_ERROR', relativePath, `Erreur lecture SQL: ${error.message}`);
    }
  }

  /**
   * 📄 Vérification d'un fichier Markdown
   */
  async checkMarkdownFile(fullPath, relativePath) {
    // Vérification spécifique aux docs de tables
    if (relativePath.includes('/tables/') || relativePath.includes('\\tables\\')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Vérification des sections obligatoires
        const requiredSections = [
          '## 📊 TABLE:',
          '### 🎯 Rôle Métier',
          '### 📝 Colonnes Clés'
        ];

        for (const section of requiredSections) {
          if (!content.includes(section)) {
            this.addViolation('MISSING_DOC_SECTION', relativePath, `Section manquante: ${section}`);
          }
        }

      } catch (error) {
        this.addViolation('FILE_READ_ERROR', relativePath, `Erreur lecture Markdown: ${error.message}`);
      }
    }
  }

  /**
   * 📋 Vérification du nom de fichier
   */
  checkFileName(filePath) {
    const fileName = path.basename(filePath, path.extname(filePath));

    // Vérification snake_case pour les fichiers de modèle/migration
    if (filePath.includes('/models/') || filePath.includes('/migrations/')) {
      if (!/^[a-z_]+$/.test(fileName)) {
        this.addViolation('FILE_NAMING', filePath, `Nom de fichier devrait être snake_case: ${fileName}`);
        this.blockCommit = true;
      }
    }
  }

  /**
   * 📊 Vérification du nom de table
   */
  checkTableName(tableName, filePath) {
    // Vérification snake_case
    if (!/^[a-z_]+$/.test(tableName)) {
      this.addViolation('TABLE_NAMING', filePath, `Table "${tableName}" ne respecte pas snake_case`);
      this.blockCommit = true;
    }

    // Vérification colonnes interdites
    const forbiddenPatterns = ['Id', 'Token', 'Role', 'Date'];
    for (const pattern of forbiddenPatterns) {
      if (tableName.includes(pattern)) {
        this.addViolation('FORBIDDEN_PATTERN', filePath, `Table "${tableName}" contient motif interdit "${pattern}"`);
        this.blockCommit = true;
      }
    }
  }

  /**
   * 📝 Vérification du nom de colonne
   */
  checkColumnName(columnName, filePath) {
    // Vérification snake_case
    if (!/^[a-z_]+$/.test(columnName)) {
      this.addViolation('COLUMN_NAMING', filePath, `Colonne "${columnName}" ne respecte pas snake_case`);
      this.blockCommit = true;
    }

    // Vérification colonnes interdites
    const forbiddenColumns = ['groupeId', 'invitationToken', 'userRole', 'creationDate'];
    if (forbiddenColumns.includes(columnName)) {
      this.addViolation('FORBIDDEN_COLUMN', filePath, `Colonne "${columnName}" est interdite`);
      this.blockCommit = true;
    }
  }

  /**
   * 📋 Ajout d'une violation
   */
  addViolation(type, file, message) {
    this.violations.push({
      type,
      file,
      message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 📊 Affichage des résultats
   */
  displayResults() {
    console.log(`\n${COLORS.blue}═`.repeat(50) + COLOR.reset);
    console.log(`${COLORS.bold}📊 RÉSULTATS DE VÉRIFICATION${COLORS.reset}`);
    console.log(`${COLORS.blue}═`.repeat(50) + COLOR.reset);

    if (this.violations.length === 0) {
      console.log(`\n${COLORS.green}🎉 CONFORMITÉ PARFAITE!${COLORS.reset}`);
      console.log(`${COLORS.green}✅ Tous les fichiers respectent les conventions SPOFE v2.2${COLORS.reset}`);
      return;
    }

    console.log(`\n${COLORS.red}🚨 ${this.violations.length} violations trouvées:${COLORS.reset}`);

    // Groupement par type de violation
    const violationsByType = {};
    for (const violation of this.violations) {
      violationsByType[violation.type] = violationsByType[violation.type] || [];
      violationsByType[violation.type].push(violation);
    }

    for (const [type, violations] of Object.entries(violationsByType)) {
      console.log(`\n${COLORS.yellow}📋 ${type} (${violations.length}):${COLORS.reset}`);
      for (const violation of violations) {
        console.log(`  ${COLORS.red}❌ ${violation.file}:${COLORS.reset} ${violation.message}`);
      }
    }

    // Suggestions de correction
    console.log(`\n${COLORS.cyan}💡 Suggestions de correction:${COLORS.reset}`);
    console.log(`  • Exécutez: npm run conventions:fix`);
    console.log(`  • Consultez: docs/CONVENTIONS_NOMMAGE_SPOFE_v2.2.md`);
    console.log(`  • Demandez de l'aide: #conventions-spofe`);
  }

  /**
   * 🚫 Action de blocage du commit
   */
  blockCommitAction() {
    console.log(`\n${COLORS.red}═`.repeat(50) + COLOR.reset);
    console.log(`${COLORS.red}🚫 COMMIT BLOQUÉ${COLORS.reset}`);
    console.log(`${COLORS.red}═`.repeat(50) + COLOR.reset);
    
    console.log(`\n${COLORS.red}❌ Le commit est bloqué pour les raisons suivantes:${COLORS.reset}`);
    console.log(`${COLORS.yellow}• Violations des conventions SPOFE v2.2${COLORS.reset}`);
    console.log(`${COLORS.yellow}• Risque de régression technique${COLORS.reset}`);
    console.log(`${COLORS.yellow}• Non-conformité avec les standards${COLORS.reset}`);

    console.log(`\n${COLORS.cyan}🔧 Pour corriger:${COLORS.reset}`);
    console.log(`${COLORS.white}1. Corrigez les violations manuellement${COLORS.reset}`);
    console.log(`${COLORS.white}2. Ou exécutez: npm run conventions:fix${COLORS.reset}`);
    console.log(`${COLORS.white}3. Ajoutez les corrections: git add .${COLORS.reset}`);
    console.log(`${COLORS.white}4. Relancez le commit${COLORS.reset}`);

    console.log(`\n${COLORS.magenta}📚 Documentation:${COLORS.reset}`);
    console.log(`${COLORS.white}• docs/CONVENTIONS_NOMMAGE_SPOFE_v2.2.md${COLORS.reset}`);
    console.log(`${COLORS.white}• docs/SCRIPTS_CONFORMITÉ_SPOFE_v2.2.md${COLORS.reset}`);

    process.exit(1);
  }

  /**
   * ✅ Succès - autorisation du commit
   */
  success() {
    console.log(`\n${COLORS.green}═`.repeat(50) + COLOR.reset);
    console.log(`${COLORS.green}✅ COMMIT AUTORISÉ${COLORS.reset}`);
    console.log(`${COLORS.green}═`.repeat(50) + COLOR.reset);
    
    console.log(`\n${COLORS.green}🎉 Conformité validée!${COLORS.reset}`);
    console.log(`${COLORS.green}✅ Les fichiers respectent les conventions SPOFE v2.2${COLORS.reset}`);
    console.log(`${COLORS.green}🚀 Commit autorisé${COLORS.reset}`);

    process.exit(0);
  }
}

/**
 * 🚀 Point d'entrée principal
 */
async function main() {
  const hook = new PreCommitHook();
  await hook.run();
}

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PreCommitHook;
