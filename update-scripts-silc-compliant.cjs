/**
 * ============================================================================
 * UPDATE-SCRIPTS-SILC-COMPLIANT.CJS
 * ============================================================================
 * 
 * Système de mise à jour robuste et sécurisé des scripts npm
 * Aligné avec la gouvernance SILC de SPOFE
 * 
 * Caractéristiques:
 * ✅ Validation JSON stricte
 * ✅ Backup automatique avec timestamp
 * ✅ Gestion intelligente des conflits
 * ✅ Écriture atomique (fichier temporaire + rename)
 * ✅ Détection et refus des modifications sur workspaces
 * ✅ Support --dry-run (audit préalable)
 * ✅ Support --fail-on-conflict (mode strict)
 * ✅ Logs SILC-conformes
 * ✅ Rollback automatique en cas d'erreur
 * 
 * Usage:
 *   node update-scripts-silc-compliant.cjs
 *   node update-scripts-silc-compliant.cjs --dry-run
 *   node update-scripts-silc-compliant.cjs --fail-on-conflict
 * 
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION SILC
// ============================================================================

// Parser les arguments en filtrant les flags
const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const flags = process.argv.slice(2).filter(arg => arg.startsWith('--'));

const CONFIG = {
  // Mode d'exécution
  DRY_RUN: flags.includes('--dry-run'),
  FAIL_ON_CONFLICT: flags.includes('--fail-on-conflict'),
  
  // Options d'écriture
  VALIDATE_JSON: true,
  BACKUP_BEFORE_WRITE: true,
  SORT_KEYS: true,
  INDENT: 2,
  LINE_ENDING: '\n',
  
  // Sécurité workspaces
  FORBID_WORKSPACE_MODIFICATION: true,
  
  // Paths
  TARGET_DIR: args[0] || '.',
  TIMESTAMP: new Date().toISOString().split('T')[0] + '_' + Date.now(),
  
  // Logging
  LOG_COLORS: {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m'
  }
};

// ============================================================================
// SCRIPTS À AJOUTER (CONFORME SILC)
// ============================================================================

const SCRIPTS_CONFORMES_SILC = {
  // Tests de contrats (Core SILC)
  'test:contracts': 'jest --config=jest.config.contracts.cjs',
  'test:contracts:watch': 'jest --config=jest.config.contracts.cjs --watch',
  'test:contracts:coverage': 'jest --config=jest.config.contracts.cjs --coverage',
  'test:contracts:debug': 'node --inspect-brk ./node_modules/.bin/jest --config=jest.config.contracts.cjs --runInBand',
  'test:contracts:verbose': 'jest --config=jest.config.contracts.cjs --verbose',
  
  // Validation SILC (Guardian)
  'silc:validate': 'node src/scripts/silc-guardian-validator.js',
  'silc:validate:strict': 'npm run silc:validate && npm run test:contracts',
  
  // Méta-scripts
  'validate': 'npm run silc:validate',
  'validate:strict': 'npm run silc:validate:strict'
};

// ============================================================================
// LOGGER SILC-CONFORME
// ============================================================================

function log(level, message, context = '') {
  const timestamp = new Date().toISOString();
  const color = {
    'INFO': CONFIG.LOG_COLORS.CYAN,
    'SUCCESS': CONFIG.LOG_COLORS.GREEN,
    'WARN': CONFIG.LOG_COLORS.YELLOW,
    'ERROR': CONFIG.LOG_COLORS.RED,
    'DEBUG': CONFIG.LOG_COLORS.BLUE
  }[level] || CONFIG.LOG_COLORS.RESET;
  
  const symbol = {
    'INFO': 'ℹ️',
    'SUCCESS': '✅',
    'WARN': '⚠️',
    'ERROR': '❌',
    'DEBUG': '🔍'
  }[level] || '•';
  
  const contextStr = context ? ` [${context}]` : '';
  console.log(`${color}${symbol} ${level}${contextStr}${CONFIG.LOG_COLORS.RESET} ${message}`);
}

// ============================================================================
// CLASSE PRINCIPALE: GESTIONNAIRE DE SCRIPTS
// ============================================================================

class ScriptManager {
  constructor(targetDir, options = {}) {
    this.targetDir = targetDir;
    this.pkgPath = path.join(targetDir, 'package.json');
    this.backupPath = null;
    this.pkg = null;
    this.originalContent = null;
    this.stats = {
      added: 0,
      modified: 0,
      total: 0,
      conflicts: []
    };
  }

  /**
   * Valide le chemin et l'existence du fichier
   */
  validateEnvironment() {
    log('INFO', `Vérification de l'environnement...`, 'Setup');
    
    if (!fs.existsSync(this.pkgPath)) {
      throw new Error(`❌ Fichier ${this.pkgPath} introuvable.`);
    }
    
    log('SUCCESS', `Fichier trouvé: ${this.pkgPath}`, 'Setup');
  }

  /**
   * Lit et valide strictement le JSON
   */
  readAndValidateJSON() {
    log('INFO', `Lecture et validation du JSON...`, 'Parse');
    
    this.originalContent = fs.readFileSync(this.pkgPath, 'utf8');
    
    // Détection précoce des problèmes
    try {
      this.pkg = JSON.parse(this.originalContent);
    } catch (parseError) {
      log('ERROR', `JSON invalide détecté`, 'Parse');
      console.error(`\n📍 Détails de l'erreur:`);
      console.error(`   Position: byte ${parseError.position || '?'}`);
      console.error(`   Message: ${parseError.message}`);
      
      // Afficher le contexte problématique
      if (parseError.position) {
        const contextStart = Math.max(0, parseError.position - 50);
        const contextEnd = Math.min(this.originalContent.length, parseError.position + 50);
        const context = this.originalContent.substring(contextStart, contextEnd);
        console.error(`   Contexte: "${context.replace(/\n/g, '↵')}"`);
      }
      
      throw new Error(`JSON invalide - impossible de continuer`);
    }
    
    log('SUCCESS', `JSON valide et parsé correctement`, 'Parse');
  }

  /**
   * Détecte et valide les workspaces
   */
  validateWorkspaces() {
    log('INFO', `Vérification des workspaces...`, 'Workspace');
    
    if (this.pkg.workspaces && this.pkg.workspaces.length > 0) {
      // ⚠️ IMPORTANT: La racine du monorepo DOIT avoir des workspaces
      // On accepte les workspaces à la racine (c'est normal)
      // Mais on refuse de modifier les sous-workspaces directement
      
      if (this.pkgPath.includes('cascade') || 
          this.pkgPath.includes('frontend') || 
          this.pkgPath.includes('silc-guardian')) {
        throw new Error(
          `🛑 REFUSÉ: Modification directe sur un sous-workspace.\n` +
          `   Workspaces détectés: ${this.pkg.workspaces.join(', ')}\n` +
          `   Action recommandée: Exécute depuis la racine du monorepo`
        );
      }
      
      log('SUCCESS', `Workspaces détectés (racine du monorepo) - sûr`, 'Workspace');
    } else {
      log('SUCCESS', `Aucun workspace détecté`, 'Workspace');
    }
  }

  /**
   * Crée un backup automatique
   */
  createBackup() {
    log('INFO', `Création du backup...`, 'Backup');
    
    if (!CONFIG.BACKUP_BEFORE_WRITE) {
      log('WARN', `Backups désactivés (--no-backup)`, 'Backup');
      return;
    }
    
    this.backupPath = `${this.pkgPath}.backup-${CONFIG.TIMESTAMP}`;
    
    try {
      fs.writeFileSync(this.backupPath, this.originalContent, 'utf8');
      log('SUCCESS', `Backup créé: ${path.basename(this.backupPath)}`, 'Backup');
    } catch (error) {
      log('ERROR', `Impossible de créer le backup: ${error.message}`, 'Backup');
      throw error;
    }
  }

  /**
   * Initialise et fusionne les scripts avec détection des conflits
   */
  mergeScripts(newScripts) {
    log('INFO', `Fusion des scripts...`, 'Merge');
    
    if (!this.pkg.scripts) {
      this.pkg.scripts = {};
    }
    
    Object.keys(newScripts).forEach(key => {
      const existingValue = this.pkg.scripts[key];
      const newValue = newScripts[key];
      
      if (existingValue && existingValue !== newValue) {
        // Conflit détecté
        this.stats.conflicts.push({
          key,
          old: existingValue,
          new: newValue
        });
        
        log('WARN', `Script en conflit: "${key}"`, 'Merge');
        console.log(`   Ancien: "${existingValue}"`);
        console.log(`   Nouveau: "${newValue}"`);
        
        // Vérifier le mode strict
        if (CONFIG.FAIL_ON_CONFLICT) {
          throw new Error(
            `❌ Mode --fail-on-conflict: conflit détecté sur "${key}"`
          );
        }
        
        // Remplacer (avec avertissement)
        this.stats.modified++;
      } else if (!existingValue) {
        this.stats.added++;
      }
    });
    
    // Fusion
    this.pkg.scripts = { ...this.pkg.scripts, ...newScripts };
    this.stats.total = Object.keys(this.pkg.scripts).length;
    
    log('SUCCESS', `Scripts fusionnés: +${this.stats.added} ajoutés, ${this.stats.modified} modifiés`, 'Merge');
  }

  /**
   * Trie les scripts alphabétiquement
   */
  sortScripts() {
    if (!CONFIG.SORT_KEYS) {
      log('WARN', `Tri des clés désactivé`, 'Sort');
      return;
    }
    
    log('INFO', `Tri des scripts alphabétiquement...`, 'Sort');
    
    const sorted = Object.keys(this.pkg.scripts)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .reduce((acc, key) => {
        acc[key] = this.pkg.scripts[key];
        return acc;
      }, {});
    
    this.pkg.scripts = sorted;
    log('SUCCESS', `Scripts triés`, 'Sort');
  }

  /**
   * Valide le JSON généré
   */
  validateOutput() {
    log('INFO', `Validation du JSON généré...`, 'Validate');
    
    try {
      const newContent = JSON.stringify(this.pkg, null, CONFIG.INDENT) + CONFIG.LINE_ENDING;
      JSON.parse(newContent);
      log('SUCCESS', `JSON généré valide`, 'Validate');
      return newContent;
    } catch (error) {
      log('ERROR', `JSON généré invalide: ${error.message}`, 'Validate');
      throw error;
    }
  }

  /**
   * Écrit le fichier de manière atomique
   */
  writeAtomically(content) {
    if (CONFIG.DRY_RUN) {
      log('WARN', `DRY RUN - aucune écriture effectuée`, 'Write');
      return;
    }
    
    log('INFO', `Écriture atomique du fichier...`, 'Write');
    
    const tempPath = `${this.pkgPath}.tmp-${CONFIG.TIMESTAMP}`;
    
    try {
      // 1. Écrire dans fichier temporaire
      fs.writeFileSync(tempPath, content, 'utf8');
      
      // 2. Re-lire et re-valider
      const writtenContent = fs.readFileSync(tempPath, 'utf8');
      JSON.parse(writtenContent);
      
      // 3. Remplacer atomiquement
      fs.renameSync(tempPath, this.pkgPath);
      
      log('SUCCESS', `Fichier écrit avec succès: ${this.pkgPath}`, 'Write');
    } catch (error) {
      log('ERROR', `Erreur lors de l'écriture: ${error.message}`, 'Write');
      
      // Cleanup fichier temporaire
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      
      throw error;
    }
  }

  /**
   * Restaure depuis le backup
   */
  rollback() {
    if (!this.backupPath || !fs.existsSync(this.backupPath)) {
      log('WARN', `Aucun backup disponible pour rollback`, 'Rollback');
      return false;
    }
    
    log('INFO', `Rollback en cours...`, 'Rollback');
    
    try {
      const backupContent = fs.readFileSync(this.backupPath, 'utf8');
      fs.writeFileSync(this.pkgPath, backupContent, 'utf8');
      log('SUCCESS', `Restauré depuis: ${path.basename(this.backupPath)}`, 'Rollback');
      return true;
    } catch (error) {
      log('ERROR', `Impossible de restaurer: ${error.message}`, 'Rollback');
      return false;
    }
  }

  /**
   * Affiche un résumé des opérations
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSUMÉ DES OPÉRATIONS');
    console.log('='.repeat(70));
    
    console.log(`\n📝 Statistiques:`);
    console.log(`   Scripts ajoutés: ${this.stats.added}`);
    console.log(`   Scripts modifiés: ${this.stats.modified}`);
    console.log(`   Scripts totaux: ${this.stats.total}`);
    console.log(`   Conflits détectés: ${this.stats.conflicts.length}`);
    
    if (this.stats.conflicts.length > 0) {
      console.log(`\n⚠️  Conflits résolus:`);
      this.stats.conflicts.forEach(({ key, old, new: newVal }) => {
        console.log(`   - ${key}:`);
        console.log(`     Ancien: "${old}"`);
        console.log(`     Nouveau: "${newVal}"`);
      });
    }
    
    if (CONFIG.BACKUP_BEFORE_WRITE && this.backupPath) {
      console.log(`\n💾 Backup disponible:`);
      console.log(`   ${this.backupPath}`);
    }
    
    if (CONFIG.DRY_RUN) {
      console.log(`\n🟡 Mode DRY RUN - aucune modification effectuée`);
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
  }

  /**
   * Exécute le workflow complet
   */
  async execute(newScripts) {
    try {
      log('INFO', `Démarrage du workflow SILC-compliant...`, 'Main');
      
      this.validateEnvironment();
      this.readAndValidateJSON();
      this.validateWorkspaces();
      
      if (!CONFIG.DRY_RUN) {
        this.createBackup();
      }
      
      this.mergeScripts(newScripts);
      this.sortScripts();
      
      const newContent = this.validateOutput();
      
      if (!CONFIG.DRY_RUN) {
        this.writeAtomically(newContent);
      }
      
      this.printSummary();
      
      log('SUCCESS', `Workflow terminé avec succès!`, 'Main');
      return { success: true, stats: this.stats };
      
    } catch (error) {
      log('ERROR', `Erreur fatale: ${error.message}`, 'Main');
      
      if (!CONFIG.DRY_RUN && this.backupPath) {
        log('INFO', `Tentative de rollback...`, 'Main');
        if (this.rollback()) {
          log('SUCCESS', `Rollback réussi - état précédent restauré`, 'Main');
        } else {
          log('ERROR', `Rollback échoué - état incohérent possible`, 'Main');
        }
      }
      
      process.exit(1);
    }
  }
}

// ============================================================================
// POINT D'ENTRÉE
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('🔧 UPDATE-SCRIPTS-SILC-COMPLIANT');
  console.log('='.repeat(70) + '\n');
  
  log('INFO', `Configuration:`, 'Init');
  console.log(`   Cible: ${CONFIG.TARGET_DIR}`);
  console.log(`   DRY RUN: ${CONFIG.DRY_RUN ? 'OUI' : 'NON'}`);
  console.log(`   FAIL ON CONFLICT: ${CONFIG.FAIL_ON_CONFLICT ? 'OUI' : 'NON'}`);
  console.log(`   Backup: ${CONFIG.BACKUP_BEFORE_WRITE ? 'OUI' : 'NON'}`);
  console.log(`   Tri: ${CONFIG.SORT_KEYS ? 'OUI' : 'NON'}`);
  console.log(`   Workspaces interdits: ${CONFIG.FORBID_WORKSPACE_MODIFICATION ? 'OUI' : 'NON'}`);
  console.log('');
  
  const manager = new ScriptManager(CONFIG.TARGET_DIR);
  await manager.execute(SCRIPTS_CONFORMES_SILC);
}

// Exécuter
main();
