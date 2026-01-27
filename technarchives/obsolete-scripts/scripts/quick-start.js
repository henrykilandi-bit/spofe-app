#!/usr/bin/env node

/**
 * SPOFE Auto-Fix - Quick Start Guide
 * Guide de démarrage rapide pour l'automatisation SPOFE
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.clear();
console.log(chalk.cyan.bold('╔═══════════════════════════════════════════════════════════════╗'));
console.log(chalk.cyan.bold('║                                                               ║'));
console.log(chalk.cyan.bold('║   🚀 SPOFE Auto-Fix - Quick Start Guide                      ║'));
console.log(chalk.cyan.bold('║                                                               ║'));
console.log(chalk.cyan.bold('╚═══════════════════════════════════════════════════════════════╝'));
console.log('');

const steps = [
  {
    number: 1,
    title: 'Prérequis',
    commands: [
      'node --version',
      'npm --version',
      'mysql --version'
    ],
    check: () => {
      try {
        require('mysql2');
        return true;
      } catch {
        return false;
      }
    }
  },
  {
    number: 2,
    title: 'Installation des dépendances',
    commands: [
      'npm install'
    ],
    description: 'Installer les dépendances du script'
  },
  {
    number: 3,
    title: 'Configuration',
    commands: [
      'cp .env.example .env',
      'nano .env'
    ],
    description: 'Configurer les paramètres BD'
  },
  {
    number: 4,
    title: 'Test (mode simulation)',
    commands: [
      'node auto-fix.js --dry-run'
    ],
    description: 'Voir les changements sans les appliquer'
  },
  {
    number: 5,
    title: 'Exécution complète',
    commands: [
      'node auto-fix.js'
    ],
    description: 'Appliquer toutes les corrections'
  }
];

steps.forEach(step => {
  console.log(chalk.magenta.bold(`\n█ Étape ${step.number}: ${step.title}`));
  console.log(chalk.magenta('─'.repeat(step.title.length + 15)));
  
  if (step.description) {
    console.log(chalk.yellow(`  📝 ${step.description}`));
  }
  
  console.log(chalk.cyan('\n  Commandes:'));
  step.commands.forEach(cmd => {
    console.log(chalk.cyan(`    $ ${cmd}`));
  });
});

console.log('');
console.log(chalk.green.bold('✅ Guide de démarrage rapide terminé!'));
console.log('');
console.log(chalk.yellow('📌 Prochaines étapes:'));
console.log(chalk.yellow('  1. Configurer le fichier .env'));
console.log(chalk.yellow('  2. Exécuter: node auto-fix.js --dry-run'));
console.log(chalk.yellow('  3. Vérifier les changements proposés'));
console.log(chalk.yellow('  4. Exécuter: node auto-fix.js'));
console.log('');
console.log(chalk.cyan('📖 Pour plus d\'informations:'));
console.log(chalk.cyan('  - Lire: README.md'));
console.log(chalk.cyan('  - Rapport: ../RAPPORT_ANALYSE_TESTS_DETAILLE.md'));
console.log('');
