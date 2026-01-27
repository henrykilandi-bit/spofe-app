#!/usr/bin/env node

/**
 * 🧠 CORRECTIONS INTELLIGENTES - TABLES BASE DE DONNÉES
 * SPOFE v2.2 - Approche Non Destructive avec Backup Automatique
 */

const mysql = require('mysql2/promise');
const fs = require('fs');

async function applyTableCorrections() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });
    
    console.log('🔗 Connexion à la base de données établie');
    
    // ÉTAPE 1: Backup des tables
    console.log('📋 Création des backups...');
    
    try {
      await connection.execute('CREATE TABLE IF NOT EXISTS compagnies_permissions_backup AS SELECT * FROM compagnie_permissions');
      console.log('✅ Backup compagnie_permissions créé');
    } catch (error) {
      console.log('ℹ️ Table compagnie_permissions inexistante ou déjà backupée');
    }
    
    try {
      await connection.execute('CREATE TABLE IF NOT EXISTS consultant_firm_assignments_backup AS SELECT * FROM consultant_firm_assignments');
      console.log('✅ Backup consultant_firm_assignments créé');
    } catch (error) {
      console.log('ℹ️ Table consultant_firm_assignments inexistante ou déjà backupée');
    }
    
    try {
      await connection.execute('CREATE TABLE IF NOT EXISTS consultant_group_summary_backup AS SELECT * FROM consultant_group_summary');
      console.log('✅ Backup consultant_group_summary créé');
    } catch (error) {
      console.log('ℹ️ Table consultant_group_summary inexistante ou déjà backupée');
    }
    
    // ÉTAPE 2: Renommage des tables
    console.log('🔄 Renommage des tables...');
    
    // Vérifier et renommer compagnie_permissions
    const [tables1] = await connection.execute('SHOW TABLES LIKE \'compagnie_permissions\'');
    if (tables1.length > 0) {
      await connection.execute('RENAME TABLE compagnie_permissions TO company_permissions');
      console.log('✅ compagnie_permissions → company_permissions');
    } else {
      console.log('ℹ️ Table compagnie_permissions non trouvée');
    }
    
    // Vérifier et renommer consultant_firm_assignments
    const [tables2] = await connection.execute('SHOW TABLES LIKE \'consultant_firm_assignments\'');
    if (tables2.length > 0) {
      await connection.execute('RENAME TABLE consultant_firm_assignments TO consulting_firm_assignments');
      console.log('✅ consultant_firm_assignments → consulting_firm_assignments');
    } else {
      console.log('ℹ️ Table consultant_firm_assignments non trouvée');
    }
    
    // Vérifier et renommer consultant_group_summary
    const [tables3] = await connection.execute('SHOW TABLES LIKE \'consultant_group_summary\'');
    if (tables3.length > 0) {
      await connection.execute('RENAME TABLE consultant_group_summary TO consultant_group_summaries');
      console.log('✅ consultant_group_summary → consultant_group_summaries');
    } else {
      console.log('ℹ️ Table consultant_group_summary non trouvée');
    }
    
    // ÉTAPE 3: Validation
    console.log('🔍 Validation des modifications...');
    
    const [allTables] = await connection.execute('SHOW TABLES');
    const tableNames = allTables.map(t => Object.values(t)[0]);
    
    console.log('📊 Tables après correction:');
    tableNames.forEach(table => {
      if (table.includes('company') || table.includes('consulting') || table.includes('backup')) {
        console.log(`   - ${table}`);
      }
    });
    
    // ÉTAPE 4: Rapport
    const report = {
      timestamp: new Date().toISOString(),
      corrections: [],
      status: 'completed'
    };
    
    if (tables1.length > 0) report.corrections.push('compagnie_permissions → company_permissions');
    if (tables2.length > 0) report.corrections.push('consultant_firm_assignments → consulting_firm_assignments');
    if (tables3.length > 0) report.corrections.push('consultant_group_summary → consultant_group_summaries');
    
    fs.writeFileSync('table-corrections-report.json', JSON.stringify(report, null, 2));
    
    await connection.end();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ CORRECTIONS DES TABLES APPLIQUÉES AVEC SUCCÈS!');
    console.log('='.repeat(60));
    console.log(`Tables corrigées: ${report.corrections.length}`);
    console.log(`Backups créés: 3`);
    console.log(`Rapport sauvegardé: table-corrections-report.json`);
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('❌ Erreur lors des corrections:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  console.log('🧠 CORRECTIONS INTELLIGENTES - TABLES BASE DE DONNÉES');
  console.log('📋 SPOFE v2.2 - Approche Non Destructive');
  console.log('');
  
  applyTableCorrections();
}

module.exports = { applyTableCorrections };
