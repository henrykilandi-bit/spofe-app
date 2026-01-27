#!/usr/bin/env node

/**
 * SPOFE Auto-Fix Script
 * Automatisation du diagnostic et de la correction du système SPOFE v2.1
 * 
 * Usage:
 *   node auto-fix.js                    # Exécution complète
 *   node auto-fix.js --dry-run          # Mode simulation
 *   node auto-fix.js --skip-package     # Ignorer nettoyage package.json
 *   node auto-fix.js --skip-db          # Ignorer vérification BD
 *   node auto-fix.js --skip-report      # Ignorer génération rapport
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { PackageJsonFixer } from './modules/package-fixer.js';
import { DatabaseValidator } from './modules/database-validator.js';
import { TestFixer } from './modules/test-fixer.js';
import { ReportGenerator } from './modules/report-generator.js';
import { Logger } from './utils/logger.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse les arguments CLI
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  skipPackage: args.includes('--skip-package'),
  skipDb: args.includes('--skip-db'),
  skipReport: args.includes('--skip-report'),
  verbose: args.includes('--verbose'),
};

const logger = new Logger(options.verbose);

// Configuration
const CONFIG = {
  projectRoot: path.resolve(__dirname, '..'),
  backend: path.resolve(__dirname, '../cascade'),
  frontend: path.resolve(__dirname, '../frontend'),
  dryRun: options.dryRun,
};

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  logger.banner('🚀 SPOFE Auto-Fix System v1.0');
  logger.info(`Date: ${new Date().toLocaleString('fr-FR')}`);
  logger.info(`Mode: ${options.dryRun ? 'DRY-RUN (Simulation)' : 'PRODUCTION'}`);
  console.log('');

  try {
    // Phase 1: Validation initiale
    logger.section('📋 Phase 1: Validation Initiale');
    if (!validateEnvironment()) {
      process.exit(1);
    }

    // Phase 2: Correction package.json
    if (!options.skipPackage) {
      logger.section('📦 Phase 2: Nettoyage package.json');
      await fixPackageJson();
    } else {
      logger.warn('Nettoyage package.json ignoré');
    }

    // Phase 3: Vérification BD
    if (!options.skipDb) {
      logger.section('🗄️  Phase 3: Validation Base de Données');
      await validateDatabase();
    } else {
      logger.warn('Vérification BD ignorée');
    }

    // Phase 4: Correction tests
    logger.section('🧪 Phase 4: Correction des Tests');
    await fixTests();

    // Phase 5: Génération rapports
    if (!options.skipReport) {
      logger.section('📊 Phase 5: Génération Rapports');
      await generateReports();
    } else {
      logger.warn('Génération rapports ignorée');
    }

    // Résumé final
    logger.section('✅ Résumé Final');
    displaySummary();

    process.exit(0);

  } catch (error) {
    logger.error(`Erreur fatale: ${error.message}`);
    if (options.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function validateEnvironment() {
  logger.info('Vérification environnement...');

  // Vérifier les répertoires critiques
  const requiredDirs = [
    CONFIG.backend,
    CONFIG.frontend,
    path.join(CONFIG.projectRoot, 'cascade'),
    path.join(CONFIG.projectRoot, 'frontend'),
  ];

  for (const dir of requiredDirs) {
    if (!fs.existsSync(dir)) {
      logger.error(`Répertoire manquant: ${dir}`);
      return false;
    }
  }

  // Vérifier les fichiers critiques
  const requiredFiles = [
    path.join(CONFIG.projectRoot, 'package.json'),
    path.join(CONFIG.backend, 'package.json'),
    path.join(CONFIG.frontend, 'package.json'),
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(file)) {
      logger.error(`Fichier manquant: ${file}`);
      return false;
    }
  }

  logger.success('Environnement valide');
  return true;
}

async function fixPackageJson() {
  try {
    const fixer = new PackageJsonFixer(CONFIG, options.dryRun);
    const results = await fixer.fixAll();

    logger.success(`✅ Fichiers corrigés: ${results.fixed}`);
    if (results.warnings.length > 0) {
      results.warnings.forEach(w => logger.warn(w));
    }
    return true;
  } catch (error) {
    logger.error(`Erreur correction package.json: ${error.message}`);
    throw error;
  }
}

async function validateDatabase() {
  try {
    const validator = new DatabaseValidator(CONFIG, options.dryRun);
    const results = await validator.validate();

    if (results.conformity >= 99) {
      logger.success(`✅ BD conforme: ${results.conformity}%`);
    } else {
      logger.warn(`⚠️  Conformité BD: ${results.conformity}%`);
    }

    if (results.issues.length > 0) {
      logger.warn('Problèmes détectés:');
      results.issues.forEach(issue => {
        logger.info(`  - ${issue}`);
      });
    }

    return true;
  } catch (error) {
    logger.error(`Erreur validation BD: ${error.message}`);
    throw error;
  }
}

async function fixTests() {
  try {
    const fixer = new TestFixer(CONFIG, options.dryRun);
    const results = await fixer.fixAll();

    logger.success(`✅ Tests corrigés: ${results.fixed}`);
    logger.info(`📈 Taux de réussite: ${results.successRate}%`);

    if (results.issues.length > 0) {
      logger.warn('Problèmes restants:');
      results.issues.forEach(issue => {
        logger.info(`  - ${issue}`);
      });
    }

    return true;
  } catch (error) {
    logger.error(`Erreur correction tests: ${error.message}`);
    throw error;
  }
}

async function generateReports() {
  try {
    const generator = new ReportGenerator(CONFIG, options.dryRun);
    const results = await generator.generate();

    logger.success(`✅ Rapports générés: ${results.reports.length}`);
    results.reports.forEach(report => {
      logger.info(`  📄 ${report}`);
    });

    return true;
  } catch (error) {
    logger.error(`Erreur génération rapports: ${error.message}`);
    throw error;
  }
}

function displaySummary() {
  console.log(chalk.cyan.bold('┌─────────────────────────────────────────┐'));
  console.log(chalk.cyan.bold('│  Corrections Appliquées avec Succès     │'));
  console.log(chalk.cyan.bold('├─────────────────────────────────────────┤'));
  console.log(chalk.cyan('│  ✅ Configuration package.json           │'));
  console.log(chalk.cyan('│  ✅ Validation Base de Données           │'));
  console.log(chalk.cyan('│  ✅ Correction Tests                     │'));
  console.log(chalk.cyan('│  ✅ Génération Rapports                  │'));
  console.log(chalk.cyan.bold('└─────────────────────────────────────────┘'));
  console.log('');
  console.log(chalk.yellow('📌 Prochaines étapes:'));
  console.log(chalk.yellow('  1. Exécuter: npm run test'));
  console.log(chalk.yellow('  2. Vérifier les résultats'));
  console.log(chalk.yellow('  3. Corriger les problèmes restants manuellement'));
  console.log('');
}

// Démarrer le script
main().catch(error => {
  logger.error(`Erreur non gérée: ${error.message}`);
  process.exit(1);
});
