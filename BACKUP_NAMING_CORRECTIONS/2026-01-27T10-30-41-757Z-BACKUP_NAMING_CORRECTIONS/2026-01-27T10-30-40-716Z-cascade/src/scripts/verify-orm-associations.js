#!/usr/bin/env node

/**
 * ✅ verify-orm-associations.js
 * Vérifier la conformité des associations Sequelize avec la BD réelle
 * Usage: npm run verify:orm || node src/scripts/verify-orm-associations.js
 */

import sequelize from '../config/database.js';
import logger from '../utils/logger.js';
// Import all models to register them with sequelize
import * as models from '../models/index.js';

const logSuccess = (msg) => console.log(`✅ ${msg}`);
const logError = (msg) => console.log(`❌ ${msg}`);
const logInfo = (msg) => console.log(`ℹ️  ${msg}`);

async function verifyAssociations() {
  try {
    console.log('\n🔍 Vérification des associations ORM/BD...\n');

    // 1. Tester connexion
    await sequelize.authenticate();
    logSuccess('Connexion BD établie');

    // 2. Charger tous les modèles
    const models = sequelize.models;
    logInfo(`${Object.keys(models).length} modèles chargés`);

    // 3. Vérifier chaque modèle
    let associationCount = 0;
    let errors = [];

    for (const [modelName, model] of Object.entries(models)) {
      if (!model.associations) continue;

      for (const [assocName, association] of Object.entries(model.associations)) {
        associationCount++;
        
        const targetModel = association.target;
        const foreignKey = association.foreignKey || association.targetKey;
        
        // Vérifier que le modèle cible existe
        if (!targetModel) {
          errors.push(`${modelName}.${assocName} → modèle cible introuvable`);
          logError(`${modelName}.${assocName} → modèle cible introuvable`);
        } else {
          logSuccess(`${modelName}.${assocName} → ${targetModel.name}`);
        }
      }
    }

    // 4. Vérifier association bidirectionnelle clé
    console.log('\n📊 Vérifications spécifiques:\n');

    // Company ↔ JournalEntry
    if (models.Company && models.JournalEntry) {
      const hasCompanyToJE = models.Company.associations?.entries;
      const hasJEToCompany = models.JournalEntry.associations?.company;
      
      if (hasCompanyToJE && hasJEToCompany) {
        logSuccess('Company ↔ JournalEntry: BIDIRECTIONNELLE');
      } else {
        logError('Company ↔ JournalEntry: INCOMPLÈTE');
        errors.push('Company.hasMany(JournalEntry) OU JournalEntry.belongsTo(Company) manquant');
      }
    }

    // Company ↔ ChartOfAccount
    if (models.Company && models.ChartOfAccount) {
      const hasCompanyToCOA = models.Company.associations?.chartsOfAccounts;
      const hasCOAToCompany = models.ChartOfAccount.associations?.company;
      
      if (hasCompanyToCOA && hasCOAToCompany) {
        logSuccess('Company ↔ ChartOfAccount: BIDIRECTIONNELLE');
      } else {
        logError('Company ↔ ChartOfAccount: INCOMPLÈTE');
        errors.push('Company.hasMany(ChartOfAccount) OU ChartOfAccount.belongsTo(Company) manquant');
      }
    }

    // User ↔ JournalEntry (si userId existe)
    if (models.User && models.JournalEntry) {
      const JEColumns = await sequelize.getQueryInterface().describeTable('journal_entries');
      if (JEColumns.userId) {
        const hasUserToJE = models.User.associations?.journalEntries;
        const hasJEToUser = models.JournalEntry.associations?.creator;
        
        if (hasUserToJE && hasJEToUser) {
          logSuccess('User ↔ JournalEntry: BIDIRECTIONNELLE');
        } else {
          logError('User ↔ JournalEntry: INCOMPLÈTE');
          errors.push('User.hasMany(JournalEntry) OU JournalEntry.belongsTo(User) manquant');
        }
      }
    }

    // 5. Résumé
    console.log('\n═══════════════════════════════════════');
    logInfo(`Total d'associations: ${associationCount}`);
    
    if (errors.length > 0) {
      console.log(`\n⚠️  ${errors.length} problème(s) détecté(s):\n`);
      errors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
      console.log('\n💡 Corriger ces associations dans src/models/associations.js');
    } else {
      logSuccess('Toutes les associations sont conformes!');
    }

    console.log('═══════════════════════════════════════\n');

    return errors.length === 0;
  } catch (error) {
    logError(`Erreur: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Exécuter
verifyAssociations().then(success => {
  process.exit(success ? 0 : 1);
});
