#!/usr/bin/env node

/**
 * 🔍 ANALYSE COMPLÈTE DES BASES DE DONNÉES XAMPP
 * 
 * Diagnostic pour identifier la vraie base SPOFE et distinguer
 * les bases pertinentes de celles qui n'ont rien à voir
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

class DatabaseAnalyzer {
  constructor() {
    this.connection = null;
    this.results = {
      allDatabases: [],
      analysis: [],
      spofeCandidates: [],
      nonSpofeDatabases: []
    };
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
      });
      console.log('✅ Connexion établie avec MySQL');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion MySQL:', error.message);
      console.log('\n💡 Solutions possibles:');
      console.log('- Vérifier que XAMPP MySQL est démarré');
      console.log('- Vérifier les identifiants (root/mot de passe vide)');
      console.log('- Vérifier que MySQL écoute sur localhost:3306');
      return false;
    }
  }

  async listAllDatabases() {
    try {
      const [databases] = await this.connection.execute('SHOW DATABASES');
      this.results.allDatabases = databases.map(db => db.Database);
      
      console.log('\n📋 BASES DE DONNÉES DISPONIBLES:');
      console.log('='.repeat(50));
      this.results.allDatabases.forEach(db => {
        console.log(`- ${db}`);
      });
      console.log('');
      
      return this.results.allDatabases;
    } catch (error) {
      console.error('❌ Erreur listing bases:', error.message);
      return [];
    }
  }

  identifySuspiciousDatabases() {
    const suspiciousDbs = this.results.allDatabases.filter(db => 
      db.toLowerCase().includes('spofe') || 
      db.toLowerCase().includes('app') || 
      db.toLowerCase().includes('compta') ||
      db.toLowerCase().includes('finance') ||
      db.toLowerCase().includes('entreprise') ||
      db.toLowerCase().includes('comptabilite') ||
      db.toLowerCase().includes('gestion') ||
      !['information_schema', 'mysql', 'performance_schema', 'phpmyadmin', 'sys'].includes(db)
    );

    console.log('🔍 BASES DE DONNÉES SUSPECTES À ANALYSER:');
    console.log('='.repeat(50));
    suspiciousDbs.forEach(db => console.log(`- ${db}`));
    console.log('');

    return suspiciousDbs;
  }

  async analyzeDatabase(dbName) {
    console.log(`\n📊 Analyse de la base: ${dbName}`);
    console.log('-'.repeat(40));

    try {
      // Se connecter à la base spécifique
      const dbConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: dbName
      });

      // Lister les tables
      const [tables] = await dbConnection.execute('SHOW TABLES');
      const tableCount = tables.length;
      const tableNames = tables.map(t => Object.values(t)[0]);
      
      console.log(`Tables trouvées: ${tableCount}`);

      // Identifier les tables SPOFE
      const spofeTables = tableNames.filter(t => {
        const tableName = t.toLowerCase();
        return tableName.includes('user') || 
               tableName.includes('role') ||
               tableName.includes('company') ||
               tableName.includes('compagnie') ||
               tableName.includes('groupe') ||
               tableName.includes('journal') ||
               tableName.includes('account') ||
               tableName.includes('audit') ||
               tableName.includes('security') ||
               tableName.includes('permission') ||
               tableName.includes('session') ||
               tableName.includes('token') ||
               tableName.includes('balance') ||
               tableName.includes('chart') ||
               tableName.includes('entry') ||
               tableName.includes('line');
      });

      console.log(`Tables SPOFE suspectes: ${spofeTables.length}`);
      if (spofeTables.length > 0) {
        console.log('Tables SPOFE:', spofeTables.slice(0, 8).join(', ') + 
                    (spofeTables.length > 8 ? '...' : ''));
      }

      // Analyser les tables principales
      let totalRecords = 0;
      let sampleData = {};
      let tableStructures = {};
      
      for (const table of spofeTables.slice(0, 5)) {
        try {
          // Compter les enregistrements
          const [count] = await dbConnection.execute(`SELECT COUNT(*) as count FROM \`${table}\``);
          const recordCount = count[0].count;
          totalRecords += recordCount;
          
          if (recordCount > 0) {
            // Obtenir la structure
            const [structure] = await dbConnection.execute(`DESCRIBE \`${table}\``);
            tableStructures[table] = structure.map(col => ({
              field: col.Field,
              type: col.Type,
              null: col.Null,
              key: col.Key
            }));
            
            sampleData[table] = {
              records: recordCount,
              columns: structure.map(col => col.Field).slice(0, 6)
            };

            // Obtenir un échantillon de données
            try {
              const [sample] = await dbConnection.execute(`SELECT * FROM \`${table}\` LIMIT 3`);
              sampleData[table].sample = sample;
            } catch (sampleErr) {
              // Ignorer les erreurs d'échantillonnage
            }
          }
        } catch (err) {
          // Ignorer les erreurs de permission ou tables inexistantes
        }
      }

      console.log(`Total enregistrements (tables SPOFE): ${totalRecords}`);

      // Calculer le score de pertinence SPOFE
      let spofeScore = 0;
      
      // Nom de la base
      if (dbName.toLowerCase().includes('spofe')) spofeScore += 30;
      if (dbName.toLowerCase().includes('app')) spofeScore += 10;
      if (dbName.toLowerCase().includes('compta')) spofeScore += 15;
      if (dbName.toLowerCase().includes('finance')) spofeScore += 15;
      
      // Tables SPOFE
      spofeScore += Math.min(spofeTables.length * 5, 40);
      
      // Données
      if (totalRecords > 0) spofeScore += 10;
      if (totalRecords > 100) spofeScore += 5;
      
      // Structure
      if (tableCount > 5) spofeScore += 5;
      if (tableCount > 15) spofeScore += 5;

      const result = {
        database: dbName,
        tableCount,
        spofeTables: spofeTables.length,
        spofeTableNames: spofeTables,
        totalRecords,
        spofeScore,
        sampleData,
        tableStructures,
        isLikelySpofe: spofeScore >= 25,
        confidence: spofeScore >= 50 ? 'HIGH' : spofeScore >= 25 ? 'MEDIUM' : 'LOW'
      };

      console.log(`Score SPOFE: ${spofeScore}/100`);
      console.log(`Verdict: ${result.isLikelySpofe ? '🎯 PROBABLEMENT SPOFE' : '❌ Probablement pas SPOFE'}`);
      console.log(`Confiance: ${result.confidence}`);

      await dbConnection.end();
      return result;

    } catch (error) {
      console.log(`❌ Erreur analyse ${dbName}: ${error.message}`);
      return {
        database: dbName,
        error: error.message,
        spofeScore: 0,
        isLikelySpofe: false
      };
    }
  }

  async analyzeAllDatabases() {
    const suspiciousDbs = this.identifySuspiciousDatabases();
    
    console.log('🔍 ANALYSE DÉTAILLÉE DES BASES SUSPECTES:');
    console.log('='.repeat(60));

    for (const dbName of suspiciousDbs) {
      const result = await this.analyzeDatabase(dbName);
      this.results.analysis.push(result);
    }

    // Classifier les résultats
    this.results.spofeCandidates = this.results.analysis.filter(r => r.isLikelySpofe);
    this.results.nonSpofeDatabases = this.results.analysis.filter(r => !r.isLikelySpofe);
  }

  generateFinalReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT FINAL - DIAGNOSTIC BASES DE DONNÉES SPOFE');
    console.log('='.repeat(80));

    // Trier par score SPOFE
    this.results.analysis.sort((a, b) => b.spofeScore - a.spofeScore);

    console.log('\n🎯 BASES DE DONNÉES SPOFE IDENTIFIÉES:');
    console.log('-'.repeat(50));
    
    if (this.results.spofeCandidates.length > 0) {
      this.results.spofeCandidates.forEach((result, index) => {
        console.log(`\n${index + 1}. ${result.database}`);
        console.log(`   Score SPOFE: ${result.spofeScore}/100 (${result.confidence} confidence)`);
        console.log(`   Tables: ${result.tableCount} (SPOFE: ${result.spofeTables})`);
        console.log(`   Enregistrements: ${result.totalRecords}`);
        
        if (result.spofeTableNames.length > 0) {
          console.log(`   Tables clés: ${result.spofeTableNames.slice(0, 5).join(', ')}`);
        }
        
        if (Object.keys(result.sampleData).length > 0) {
          const sampleTables = Object.keys(result.sampleData).slice(0, 2);
          console.log(`   Données: ${sampleTables.map(t => `${t}(${result.sampleData[t].records})`).join(', ')}`);
        }
      });
    } else {
      console.log('❌ Aucune base de données SPOFE identifiée avec certitude');
    }

    console.log('\n🚨 BASES DE DONNÉES NON SPOFE:');
    console.log('-'.repeat(50));
    
    if (this.results.nonSpofeDatabases.length > 0) {
      this.results.nonSpofeDatabases.forEach(result => {
        console.log(`- ${result.database} (Score: ${result.spofeScore}/100)`);
        if (result.error) {
          console.log(`  Erreur: ${result.error}`);
        }
      });
    }

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    console.log('-'.repeat(50));
    
    if (this.results.spofeCandidates.length > 0) {
      const topCandidate = this.results.spofeCandidates[0];
      console.log(`🎯 Base principale recommandée: ${topCandidate.database}`);
      console.log(`   Score: ${topCandidate.spofeScore}/100`);
      console.log(`   Confiance: ${topCandidate.confidence}`);
      
      if (this.results.spofeCandidates.length > 1) {
        console.log('\n⚠️ Bases candidates additionnelles:');
        this.results.spofeCandidates.slice(1, 3).forEach((candidate, index) => {
          console.log(`   ${index + 2}. ${candidate.database} (Score: ${candidate.spofeScore}/100)`);
        });
      }
    } else {
      console.log('❌ Aucune base SPOFE trouvée - vérifier la configuration');
    }

    // Bases à nettoyer
    const cleanupCandidates = this.results.nonSpofeDatabases.filter(r => 
      !r.error && r.spofeScore < 10 && r.tableCount > 0
    );
    
    if (cleanupCandidates.length > 0) {
      console.log('\n🧹 Bases potentiellement à nettoyer:');
      cleanupCandidates.forEach(db => {
        console.log(`- ${db.database} (${db.tableCount} tables)`);
      });
    }
  }

  async saveReport() {
    const reportPath = path.join(__dirname, 'database-analysis-report.json');
    
    const report = {
      timestamp: new Date().toISOString(),
      version: 'SPOFE v2.2',
      summary: {
        totalDatabases: this.results.allDatabases.length,
        spofeCandidates: this.results.spofeCandidates.length,
        nonSpofeDatabases: this.results.nonSpofeDatabases.length,
        topCandidate: this.results.spofeCandidates[0]?.database || null
      },
      ...this.results
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);
    
    return reportPath;
  }

  async run() {
    console.log('🔍 ANALYSE COMPLÈTE DES BASES DE DONNÉES XAMPP');
    console.log('📊 Diagnostic pour identifier la vraie base SPOFE');
    console.log('');

    // 1. Connexion
    const connected = await this.connect();
    if (!connected) return false;

    // 2. Lister toutes les bases
    await this.listAllDatabases();

    // 3. Analyser les bases suspectes
    await this.analyzeAllDatabases();

    // 4. Générer le rapport final
    this.generateFinalReport();

    // 5. Sauvegarder le rapport
    await this.saveReport();

    // 6. Fermer la connexion
    if (this.connection) {
      await this.connection.end();
    }

    return true;
  }
}

// Point d'entrée
async function main() {
  const analyzer = new DatabaseAnalyzer();
  const success = await analyzer.run();
  
  if (!success) {
    console.log('\n❌ Analyse échouée - vérifier la configuration MySQL/XAMPP');
    process.exit(1);
  }
  
  console.log('\n✅ Analyse terminée avec succès');
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur inattendue:', error.message);
    process.exit(1);
  });
}

module.exports = DatabaseAnalyzer;
