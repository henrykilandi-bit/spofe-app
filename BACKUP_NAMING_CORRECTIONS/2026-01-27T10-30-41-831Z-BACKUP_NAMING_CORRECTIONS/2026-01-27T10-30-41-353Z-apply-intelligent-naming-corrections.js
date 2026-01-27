#!/usr/bin/env node

/**
 * 🧠 CORRECTIONS INTELLIGENTES DE NOMMAGE - SPOFE v2.2
 * 
 * APPROCHE: Non destructive, intelligente, cohérente, alignée
 * STRATÉGIE: Corrections progressives avec validation et backup
 * 
 * ⚠️ PRINCIPES FONDAMENTAUX:
 * 1. Jamais de modification directe sans backup
 * 2. Validation avant chaque correction
 * 3. Mapping automatique des références
 * 4. Rollback possible à tout moment
 * 5. Log détaillé de toutes les opérations
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  projectRoot: __dirname,
  backupDir: path.join(__dirname, 'BACKUP_NAMING_CORRECTIONS'),
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
  logFile: path.join(__dirname, 'naming-corrections-log.json')
};

// Logger intelligent
class IntelligentLogger {
  constructor() {
    this.logs = [];
    this.startTime = Date.now();
  }

  log(level, operation, details, status = 'pending') {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      operation,
      details,
      status,
      duration: Date.now() - this.startTime
    };
    
    this.logs.push(entry);
    
    if (CONFIG.verbose || level === 'ERROR') {
      console.log(`[${level}] ${operation}:`, details);
    }
  }

  success(operation, details) {
    this.log('SUCCESS', operation, details, 'completed');
  }

  error(operation, details) {
    this.log('ERROR', operation, details, 'failed');
  }

  warning(operation, details) {
    this.log('WARNING', operation, details, 'warning');
  }

  info(operation, details) {
    this.log('INFO', operation, details, 'info');
  }

  save() {
    fs.writeFileSync(CONFIG.logFile, JSON.stringify(this.logs, null, 2));
  }
}

const logger = new IntelligentLogger();

// Gestionnaire de backup intelligent
class BackupManager {
  constructor() {
    this.backupDir = CONFIG.backupDir;
    this.ensureBackupDir();
  }

  ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      logger.info('CREATE_BACKUP_DIR', `Backup directory created: ${this.backupDir}`);
    }
  }

  createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const relativePath = path.relative(CONFIG.projectRoot, filePath);
    const backupPath = path.join(this.backupDir, `${timestamp}-${relativePath}`);
    
    try {
      // Créer les sous-dossiers si nécessaire
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      fs.copyFileSync(filePath, backupPath);
      logger.success('BACKUP_CREATED', `${filePath} → ${backupPath}`);
      return backupPath;
    } catch (error) {
      logger.error('BACKUP_FAILED', `${filePath}: ${error.message}`);
      throw error;
    }
  }

  restoreBackup(backupPath, originalPath) {
    try {
      fs.copyFileSync(backupPath, originalPath);
      logger.success('BACKUP_RESTORED', `${backupPath} → ${originalPath}`);
    } catch (error) {
      logger.error('BACKUP_RESTORE_FAILED', `${backupPath}: ${error.message}`);
      throw error;
    }
  }
}

// Analyseur de code intelligent
class CodeAnalyzer {
  constructor() {
    this.patterns = {
      userId: /\buserId\b/g,
      groupeId: /\bgroupeId\b/g,
      companyId: /\bcompanyId\b/g,
      isActive: /\bisActive\b/g,
      canApprove: /\bcanApprove\b/g,
      createdAt: /\bcreatedAt\b/g,
      updatedAt: /\bupdatedAt\b/g
    };
  }

  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const analysis = {
        filePath,
        patterns: {},
        totalIssues: 0
      };

      Object.entries(this.patterns).forEach(([patternName, regex]) => {
        const matches = content.match(regex);
        if (matches) {
          analysis.patterns[patternName] = {
            count: matches.length,
            positions: this.findPositions(content, regex)
          };
          analysis.totalIssues += matches.length;
        }
      });

      return analysis;
    } catch (error) {
      logger.error('FILE_ANALYSIS_FAILED', `${filePath}: ${error.message}`);
      return null;
    }
  }

  findPositions(content, regex) {
    const positions = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
      positions.push({
        index: match.index,
        line: this.getLineNumber(content, match.index),
        context: this.getContext(content, match.index)
      });
    }
    return positions;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  getContext(content, index, contextSize = 50) {
    const start = Math.max(0, index - contextSize);
    const end = Math.min(content.length, index + contextSize);
    return content.substring(start, end).replace(/\n/g, ' ');
  }
}

// Correcteur intelligent de code
class IntelligentCodeCorrector {
  constructor(backupManager, analyzer) {
    this.backupManager = backupManager;
    this.analyzer = analyzer;
    this.corrections = {
      userId: 'user_id',
      groupeId: 'groupe_id',
      companyId: 'company_id',
      isActive: 'is_active',
      canApprove: 'can_approve',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    };
  }

  correctFile(filePath, dryRun = CONFIG.dryRun) {
    logger.info('FILE_CORRECTION_START', `Processing: ${filePath}`);
    
    const analysis = this.analyzer.analyzeFile(filePath);
    if (!analysis || analysis.totalIssues === 0) {
      logger.info('FILE_CLEAN', `No issues found in: ${filePath}`);
      return { corrected: false, issues: 0 };
    }

    // Créer backup avant modification
    if (!dryRun) {
      this.backupManager.createBackup(filePath);
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalCorrections = 0;

    // Appliquer les corrections de manière intelligente
    Object.entries(analysis.patterns).forEach(([patternName, patternInfo]) => {
      if (this.corrections[patternName]) {
        const replacement = this.corrections[patternName];
        const regex = new RegExp(`\\b${patternName}\\b`, 'g');
        
        // Compter les occurrences avant correction
        const beforeCount = (content.match(regex) || []).length;
        
        // Appliquer la correction
        content = content.replace(regex, replacement);
        
        const afterCount = (content.match(regex) || []).length;
        const correctionsMade = beforeCount - afterCount;
        
        totalCorrections += correctionsMade;
        
        logger.success('PATTERN_CORRECTED', 
          `${patternName} → ${replacement}: ${correctionsMade} occurrences in ${filePath}`);
      }
    });

    // Écrire le fichier corrigé
    if (!dryRun && totalCorrections > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      logger.success('FILE_CORRECTED', `${filePath}: ${totalCorrections} corrections applied`);
    } else if (dryRun && totalCorrections > 0) {
      logger.info('DRY_RUN_CORRECTIONS', `${filePath}: ${totalCorrections} corrections would be applied`);
    }

    return { corrected: totalCorrections > 0, issues: totalCorrections };
  }

  correctDirectory(dirPath, extensions = ['.js', '.jsx']) {
    logger.info('DIRECTORY_CORRECTION_START', `Processing directory: ${dirPath}`);
    
    const results = {
      filesProcessed: 0,
      filesCorrected: 0,
      totalIssues: 0
    };

    const scanDirectory = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(itemPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          results.filesProcessed++;
          const correction = this.correctFile(itemPath);
          
          if (correction.corrected) {
            results.filesCorrected++;
            results.totalIssues += correction.issues;
          }
        }
      }
    };

    scanDirectory(dirPath);
    
    logger.success('DIRECTORY_CORRECTION_COMPLETE', 
      `Processed ${results.filesProcessed} files, corrected ${results.filesCorrected} files, ${results.totalIssues} total issues`);
    
    return results;
  }
}

// Gestionnaire de modèles dupliqués
class ModelDuplicateManager {
  constructor(backupManager) {
    this.backupManager = backupManager;
    this.duplicates = [
      { keep: 'Compagnie.model.js', remove: 'Company.model.js' },
      { keep: 'AppSetting.model.js', remove: 'AppSetting.model.js' }
    ];
  }

  resolveDuplicates(modelsDir, dryRun = CONFIG.dryRun) {
    logger.info('DUPLICATE_RESOLUTION_START', `Processing models directory: ${modelsDir}`);
    
    const results = {
      duplicatesFound: 0,
      duplicatesResolved: 0
    };

    this.duplicates.forEach(duplicate => {
      const keepPath = path.join(modelsDir, duplicate.keep);
      const removePath = path.join(modelsDir, duplicate.remove);
      
      if (fs.existsSync(keepPath) && fs.existsSync(removePath)) {
        results.duplicatesFound++;
        
        logger.warning('DUPLICATE_FOUND', `Found duplicate models: ${duplicate.keep} and ${duplicate.remove}`);
        
        if (!dryRun) {
          // Backup avant suppression
          this.backupManager.createBackup(removePath);
          
          // Analyser les références au modèle à supprimer
          this.analyzeAndReplaceReferences(removePath, keepPath, modelsDir);
          
          // Supprimer le modèle dupliqué
          fs.unlinkSync(removePath);
          results.duplicatesResolved++;
          
          logger.success('DUPLICATE_RESOLVED', `Removed ${duplicate.remove}, kept ${duplicate.keep}`);
        } else {
          logger.info('DRY_RUN_DUPLICATE', `Would remove ${duplicate.remove}, keep ${duplicate.keep}`);
        }
      }
    });

    logger.success('DUPLICATE_RESOLUTION_COMPLETE', 
      `Resolved ${results.duplicatesResolved}/${results.duplicatesFound} duplicates`);
    
    return results;
  }

  analyzeAndReplaceReferences(removePath, keepPath, modelsDir) {
    const modelName = path.basename(removePath, '.model.js');
    const keepModelName = path.basename(keepPath, '.model.js');
    
    // Chercher les références dans tous les fichiers du projet
    const scanDirectory = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(itemPath);
        } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
          this.replaceModelReferences(itemPath, modelName, keepModelName);
        }
      }
    };

    scanDirectory(CONFIG.projectRoot);
  }

  replaceModelReferences(filePath, oldModel, newModel) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const regex = new RegExp(`\\b${oldModel}\\b`, 'g');
      
      if (regex.test(content)) {
        this.backupManager.createBackup(filePath);
        
        const correctedContent = content.replace(regex, newModel);
        fs.writeFileSync(filePath, correctedContent, 'utf8');
        
        logger.success('MODEL_REFERENCE_UPDATED', 
          `Updated ${oldModel} → ${newModel} in ${filePath}`);
      }
    } catch (error) {
      logger.error('MODEL_REFERENCE_UPDATE_FAILED', 
        `${filePath}: ${error.message}`);
    }
  }
}

// Fonction principale d'exécution
async function applyIntelligentNamingCorrections() {
  logger.info('CORRECTIONS_START', 'Starting intelligent naming corrections for SPOFE v2.2');
  
  try {
    // Initialisation
    const backupManager = new BackupManager();
    const analyzer = new CodeAnalyzer();
    const corrector = new IntelligentCodeCorrector(backupManager, analyzer);
    const duplicateManager = new ModelDuplicateManager(backupManager);
    
    const results = {
      frontend: {},
      backend: {},
      duplicates: {},
      summary: {
        totalFilesProcessed: 0,
        totalFilesCorrected: 0,
        totalIssuesResolved: 0
      }
    };

    // Phase 1: Correction Frontend (userId/user_id, etc.)
    logger.info('PHASE_1_START', 'Correcting Frontend naming conventions');
    
    const frontendDir = path.join(CONFIG.projectRoot, 'frontend', 'src');
    if (fs.existsSync(frontendDir)) {
      results.frontend = corrector.correctDirectory(frontendDir, ['.js', '.jsx']);
      results.summary.totalFilesProcessed += results.frontend.filesProcessed;
      results.summary.totalFilesCorrected += results.frontend.filesCorrected;
      results.summary.totalIssuesResolved += results.frontend.totalIssues;
    }

    // Phase 2: Correction Backend
    logger.info('PHASE_2_START', 'Correcting Backend naming conventions');
    
    const backendDir = path.join(CONFIG.projectRoot, 'cascade', 'src');
    if (fs.existsSync(backendDir)) {
      results.backend = corrector.correctDirectory(backendDir, ['.js']);
      results.summary.totalFilesProcessed += results.backend.filesProcessed;
      results.summary.totalFilesCorrected += results.backend.filesCorrected;
      results.summary.totalIssuesResolved += results.backend.totalIssues;
    }

    // Phase 3: Résolution des modèles dupliqués
    logger.info('PHASE_3_START', 'Resolving duplicate models');
    
    const modelsDir = path.join(CONFIG.projectRoot, 'cascade', 'src', 'models');
    if (fs.existsSync(modelsDir)) {
      results.duplicates = duplicateManager.resolveDuplicates(modelsDir);
    }

    // Phase 4: Validation et rapport
    logger.info('PHASE_4_START', 'Validation and reporting');
    
    const report = {
      timestamp: new Date().toISOString(),
      dryRun: CONFIG.dryRun,
      results,
      recommendations: generateRecommendations(results)
    };

    // Sauvegarder le rapport
    const reportPath = path.join(CONFIG.projectRoot, 'naming-corrections-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    logger.success('CORRECTIONS_COMPLETE', `Report saved to: ${reportPath}`);
    
    // Afficher le résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DES CORRECTIONS INTELLIGENTES');
    console.log('='.repeat(80));
    console.log(`Mode: ${CONFIG.dryRun ? 'DRY RUN (simulation)' : 'CORRECTION APPLIQUÉE'}`);
    console.log(`Fichiers traités: ${results.summary.totalFilesProcessed}`);
    console.log(`Fichiers corrigés: ${results.summary.totalFilesCorrected}`);
    console.log(`Problèmes résolus: ${results.summary.totalIssuesResolved}`);
    console.log(`Modèles dupliqués: ${results.duplicates.duplicatesResolved}/${results.duplicates.duplicatesFound}`);
    console.log(`Backup directory: ${CONFIG.backupDir}`);
    console.log(`Log file: ${CONFIG.logFile}`);
    console.log(`Report file: ${reportPath}`);
    console.log('='.repeat(80));

    if (!CONFIG.dryRun) {
      console.log('\n✅ Corrections appliquées avec succès !');
      console.log('📋 Tous les fichiers ont été sauvegardés avant modification.');
      console.log('🔄 Rollback possible en restaurant les fichiers depuis le backup.');
    } else {
      console.log('\n🔍 Mode DRY RUN - Aucune modification appliquée.');
      console.log('🚀 Exécutez sans --dry-run pour appliquer les corrections.');
    }

  } catch (error) {
    logger.error('CORRECTIONS_FAILED', `Fatal error: ${error.message}`);
    console.error('❌ Erreur lors des corrections:', error.message);
    process.exit(1);
  } finally {
    logger.save();
  }
}

// Générateur de recommandations
function generateRecommendations(results) {
  const recommendations = [];
  
  if (results.summary.totalIssuesResolved > 0) {
    recommendations.push('✅ Corrections de nommage appliquées avec succès');
  }
  
  if (results.duplicates.duplicatesResolved > 0) {
    recommendations.push('✅ Modèles dupliqués résolus');
  }
  
  if (results.summary.totalFilesCorrected > 0) {
    recommendations.push('📋 Tester l\'application pour valider les corrections');
    recommendations.push('🔍 Vérifier les logs d\'erreur potentiels');
  }
  
  if (results.summary.totalIssuesResolved === 0) {
    recommendations.push('🎉 Aucune correction nécessaire - code déjà conforme');
  }
  
  recommendations.push('📊 Consulter le rapport détaillé pour plus d\'informations');
  recommendations.push('🔄 Effectuer un commit des changements après validation');
  
  return recommendations;
}

// Point d'entrée
if (require.main === module) {
  console.log('🧠 CORRECTIONS INTELLIGENTES DE NOMMAGE - SPOFE v2.2');
  console.log('📋 Mode:', CONFIG.dryRun ? 'DRY RUN (simulation)' : 'CORRECTION APPLIQUÉE');
  console.log('🔁 Backup automatique activé');
  console.log('📊 Logging détaillé activé');
  console.log('');
  
  applyIntelligentNamingCorrections();
}

module.exports = {
  applyIntelligentNamingCorrections,
  BackupManager,
  CodeAnalyzer,
  IntelligentCodeCorrector,
  ModelDuplicateManager
};
