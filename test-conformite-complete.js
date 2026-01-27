#!/usr/bin/env node

/**
 * 🧪 TEST DE CONFORMITÉ COMPLET - SPOFE v2.2
 * 
 * Analyse comparative des noms entre:
 * - Base de données (XAMPP MySQL)
 * - Backend (modèles Sequelize)
 * - Frontend (variables et API calls)
 * 
 * Objectif: Vérifier l'alignement parfait selon conventions v2.2
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

class ConformityTester {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.results = {
      database: { tables: [], columns: [], issues: [] },
      backend: { models: [], references: [], issues: [] },
      frontend: { variables: [], apiCalls: [], issues: [] },
      crossValidation: { mismatches: [], alignments: [], issues: [] },
      summary: { totalIssues: 0, conformityScore: 0 }
    };
    
    // Conventions v2.2
    this.conventions = {
      database: {
        naming: 'snake_case',
        primaryKey: 'id',
        foreignKey: '{table}_id',
        timestamps: ['created_at', 'updated_at'],
        booleans: 'is_*|can_*|has_*'
      },
      backend: {
        models: 'PascalCase',
        references: 'snake_case',
        associations: 'camelCase'
      },
      frontend: {
        variables: 'camelCase',
        apiFields: 'snake_case',
        components: 'PascalCase'
      }
    };
  }

  async runCompleteTest() {
    console.log('🧪 TEST DE CONFORMITÉ COMPLET - SPOFE v2.2');
    console.log('📋 Analyse comparative Base de données ↔ Backend ↔ Frontend');
    console.log('🎯 Objectif: Vérifier alignement parfait selon conventions v2.2');
    console.log('');

    try {
      // Phase 1: Analyse Base de données
      console.log('🔍 Phase 1: Analyse Base de données...');
      await this.analyzeDatabase();
      
      // Phase 2: Analyse Backend
      console.log('🔍 Phase 2: Analyse Backend...');
      await this.analyzeBackend();
      
      // Phase 3: Analyse Frontend
      console.log('🔍 Phase 3: Analyse Frontend...');
      await this.analyzeFrontend();
      
      // Phase 4: Validation Croisée
      console.log('🔍 Phase 4: Validation Croisée...');
      await this.performCrossValidation();
      
      // Phase 5: Génération du rapport
      console.log('📊 Phase 5: Génération du rapport...');
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Erreur lors du test:', error.message);
      throw error;
    }
  }

  async analyzeDatabase() {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe_v2_1'
    });

    try {
      // Analyser les tables
      const [tables] = await connection.execute('SHOW TABLES');
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        const tableInfo = await this.analyzeTable(connection, tableName);
        this.results.database.tables.push(tableInfo);
      }

      // Analyser les colonnes
      for (const tableInfo of this.results.database.tables) {
        const columnIssues = this.validateTableColumns(tableInfo);
        this.results.database.issues.push(...columnIssues);
      }

      console.log(`✅ Base de données: ${this.results.database.tables.length} tables analysées`);
      
    } finally {
      await connection.end();
    }
  }

  async analyzeTable(connection, tableName) {
    const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
    const [indexes] = await connection.execute(`SHOW INDEX FROM ${tableName}`);
    
    const tableInfo = {
      name: tableName,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        key: col.Key,
        default: col.Default
      })),
      indexes: indexes.map(idx => idx.Key_name),
      conventions: {
        naming: this.validateNaming(tableName, 'table'),
        primaryKey: this.validatePrimaryKey(tableName, columns),
        foreignKeys: this.validateForeignKeys(tableName, columns),
        timestamps: this.validateTimestamps(columns),
        booleans: this.validateBooleans(columns)
      }
    };

    return tableInfo;
  }

  validateNaming(name, type) {
    const snakeCasePattern = /^[a-z_]+$/;
    const isCorrect = snakeCasePattern.test(name);
    
    return {
      compliant: isCorrect,
      pattern: isCorrect ? 'snake_case' : 'INVALID',
      suggestion: isCorrect ? null : this.suggestNaming(name, type)
    };
  }

  validatePrimaryKey(tableName, columns) {
    const primaryKeys = columns.filter(col => col.Key === 'PRI');
    const hasCorrectPK = primaryKeys.length === 1 && primaryKeys[0].Field === 'id';
    
    return {
      compliant: hasCorrectPK,
      primaryKey: primaryKeys.map(col => col.Field),
      issue: hasCorrectPK ? null : `Primary key should be 'id', found: ${primaryKeys.map(col => col.Field).join(', ')}`
    };
  }

  validateForeignKeys(tableName, columns) {
    const foreignKeys = columns.filter(col => col.Field.endsWith('_id'));
    const issues = [];
    
    foreignKeys.forEach(fk => {
      if (!fk.Field.match(/^[a-z_]+_id$/)) {
        issues.push(`Foreign key '${fk.Field}' should follow snake_case pattern`);
      }
    });
    
    return {
      compliant: issues.length === 0,
      foreignKeys: foreignKeys.map(col => col.Field),
      issues
    };
  }

  validateTimestamps(columns) {
    const timestampCols = columns.filter(col => 
      col.Field.includes('created_at') || col.Field.includes('updated_at')
    );
    
    const hasCreatedAt = timestampCols.some(col => col.Field === 'created_at');
    const hasUpdatedAt = timestampCols.some(col => col.Field === 'updated_at');
    
    return {
      compliant: hasCreatedAt && hasUpdatedAt,
      timestamps: timestampCols.map(col => col.Field),
      missing: {
        created_at: !hasCreatedAt,
        updated_at: !hasUpdatedAt
      }
    };
  }

  validateBooleans(columns) {
    const booleanCols = columns.filter(col => 
      col.Type.includes('BOOLEAN') || col.Type.includes('TINYINT(1)')
    );
    
    const issues = [];
    booleanCols.forEach(col => {
      if (!col.Field.match(/^(is_|can_|has_)/)) {
        issues.push(`Boolean column '${col.Field}' should start with is_, can_, or has_`);
      }
    });
    
    return {
      compliant: issues.length === 0,
      booleans: booleanCols.map(col => col.Field),
      issues
    };
  }

  validateTableColumns(tableInfo) {
    const issues = [];
    
    // Valider les conventions de chaque colonne
    tableInfo.columns.forEach(col => {
      if (col.name !== 'id' && !col.name.match(/^[a-z_]+$/)) {
        issues.push({
          table: tableInfo.name,
          column: col.name,
          issue: 'Column name should be snake_case',
          suggestion: this.suggestNaming(col.name, 'column')
        });
      }
    });
    
    return issues;
  }

  suggestNaming(name, type) {
    // Convertir camelCase/PascalCase en snake_case
    return name
      .replace(/([A-Z])/g, '_$1')
      .replace(/^_/, '')
      .toLowerCase();
  }

  async analyzeBackend() {
    const modelsDir = path.join(this.projectRoot, 'cascade', 'src', 'models');
    
    if (!fs.existsSync(modelsDir)) {
      console.log('❌ Dossier models backend non trouvé');
      return;
    }

    const modelFiles = fs.readdirSync(modelsDir).filter(file => file.endsWith('.model.js'));
    
    for (const modelFile of modelFiles) {
      const modelPath = path.join(modelsDir, modelFile);
      const modelInfo = await this.analyzeModel(modelPath);
      this.results.backend.models.push(modelInfo);
    }

    // Analyser les références dans les contrôleurs et routes
    await this.analyzeBackendReferences();

    console.log(`✅ Backend: ${this.results.backend.models.length} modèles analysés`);
  }

  async analyzeModel(modelPath) {
    const content = fs.readFileSync(modelPath, 'utf8');
    const modelName = path.basename(modelPath, '.model.js');
    
    // Extraire le nom de la table Sequelize
    const tableMatch = content.match(/sequelize\.define\(['"]([^'"]+)['"]/);
    const tableName = tableMatch ? tableMatch[1] : null;
    
    // Extraire les définitions de colonnes
    const columnMatches = content.matchAll(/(\w+):\s*{\s*type:\s*[^}]+}/g);
    const columns = Array.from(columnMatches).map(match => match[1]);
    
    const modelInfo = {
      file: path.basename(modelPath),
      name: modelName,
      table: tableName,
      columns: columns,
      conventions: {
        naming: this.validateModelNaming(modelName),
        tableMapping: this.validateTableMapping(modelName, tableName),
        columnNaming: this.validateColumnNaming(columns)
      }
    };

    return modelInfo;
  }

  validateModelNaming(modelName) {
    const pascalCasePattern = /^[A-Z][a-zA-Z0-9]*$/;
    const isCorrect = pascalCasePattern.test(modelName);
    
    return {
      compliant: isCorrect,
      pattern: isCorrect ? 'PascalCase' : 'INVALID',
      suggestion: isCorrect ? null : this.suggestModelNaming(modelName)
    };
  }

  suggestModelNaming(modelName) {
    // Convertir en PascalCase
    return modelName
      .replace(/(^|_)([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/_/g, '');
  }

  validateTableMapping(modelName, tableName) {
    if (!tableName) {
      return {
        compliant: false,
        issue: 'No table mapping found'
      };
    }
    
    // Vérifier si le nom de table suit les conventions
    const expectedTable = this.suggestNaming(modelName);
    const isCorrect = tableName === expectedTable || tableName === expectedTable + 's';
    
    return {
      compliant: isCorrect,
      modelName,
      tableName,
      expected: expectedTable,
      issue: isCorrect ? null : `Table name should be '${expectedTable}' or '${expectedTable}s'`
    };
  }

  validateColumnNaming(columns) {
    const issues = [];
    
    columns.forEach(col => {
      if (col !== 'id' && !col.match(/^[a-z_]+$/)) {
        issues.push(`Column '${col}' should be snake_case`);
      }
    });
    
    return {
      compliant: issues.length === 0,
      issues
    };
  }

  async analyzeBackendReferences() {
    const controllersDir = path.join(this.projectRoot, 'cascade', 'src', 'controllers');
    
    if (!fs.existsSync(controllersDir)) {
      return;
    }

    const controllerFiles = fs.readdirSync(controllersDir).filter(file => file.endsWith('.js'));
    
    for (const controllerFile of controllerFiles) {
      const controllerPath = path.join(controllersDir, controllerFile);
      const references = await this.analyzeControllerReferences(controllerPath);
      this.results.backend.references.push(...references);
    }
  }

  async analyzeControllerReferences(controllerPath) {
    const content = fs.readFileSync(controllerPath, 'utf8');
    const references = [];
    
    // Chercher les références aux colonnes de base de données
    const columnRefs = content.matchAll(/['"]([a-z_]+)['"]:/g);
    Array.from(columnRefs).forEach(match => {
      references.push({
        file: path.basename(controllerPath),
        type: 'column_reference',
        name: match[1],
        context: 'database_field'
      });
    });
    
    return references;
  }

  async analyzeFrontend() {
    const frontendDir = path.join(this.projectRoot, 'frontend', 'src');
    
    if (!fs.existsSync(frontendDir)) {
      console.log('❌ Dossier frontend non trouvé');
      return;
    }

    // Analyser les fichiers JS/JSX
    await this.scanFrontendDirectory(frontendDir);
    
    console.log(`✅ Frontend: ${this.results.frontend.variables.length + this.results.frontend.apiCalls.length} éléments analysés`);
  }

  async scanFrontendDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        await this.scanFrontendDirectory(itemPath);
      } else if (stat.isFile() && (item.endsWith('.js') || item.endsWith('.jsx'))) {
        await this.analyzeFrontendFile(itemPath);
      }
    }
  }

  async analyzeFrontendFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.relative(this.projectRoot, filePath);
    
    // Analyser les variables camelCase
    const camelCaseVars = content.matchAll(/\b([a-z][a-zA-Z0-9]*Id)\b/g);
    Array.from(camelCaseVars).forEach(match => {
      this.results.frontend.variables.push({
        file: fileName,
        name: match[1],
        type: 'camelCase_variable',
        suggestion: this.suggestNaming(match[1], 'variable')
      });
    });
    
    // Analyser les appels API
    const apiCalls = content.matchAll(/['"]([a-z_]+)['"]/g);
    Array.from(apiCalls).forEach(match => {
      this.results.frontend.apiCalls.push({
        file: fileName,
        field: match[1],
        type: 'api_field',
        context: 'api_call'
      });
    });
  }

  async performCrossValidation() {
    console.log('🔍 Validation croisée...');
    
    // 1. Tables ↔ Modèles
    await this.validateTablesModelsAlignment();
    
    // 2. Colonnes ↔ Variables Frontend
    await this.validateColumnsVariablesAlignment();
    
    // 3. Références API
    await this.validateApiAlignment();
    
    console.log(`✅ Validation: ${this.results.crossValidation.alignments.length} alignements trouvés`);
  }

  async validateTablesModelsAlignment() {
    const dbTables = this.results.database.tables.map(t => t.name);
    const modelTables = this.results.backend.models
      .filter(m => m.table)
      .map(m => m.table);
    
    // Vérifier les tables sans modèle
    dbTables.forEach(table => {
      if (!modelTables.includes(table)) {
        this.results.crossValidation.mismatches.push({
          type: 'table_without_model',
          table,
          issue: 'Database table has no corresponding Sequelize model'
        });
      } else {
        this.results.crossValidation.alignments.push({
          type: 'table_model_aligned',
          table,
          status: 'OK'
        });
      }
    });
    
    // Vérifier les modèles sans table
    modelTables.forEach(table => {
      if (!dbTables.includes(table)) {
        this.results.crossValidation.mismatches.push({
          type: 'model_without_table',
          table,
          issue: 'Sequelize model has no corresponding database table'
        });
      }
    });
  }

  async validateColumnsVariablesAlignment() {
    // Collecter toutes les colonnes de la base de données
    const dbColumns = new Set();
    this.results.database.tables.forEach(table => {
      table.columns.forEach(col => {
        dbColumns.add(col.name);
      });
    });
    
    // Vérifier les variables frontend
    this.results.frontend.variables.forEach(variable => {
      const expectedDbField = this.suggestNaming(variable.name, 'variable');
      
      if (dbColumns.has(expectedDbField)) {
        this.results.crossValidation.alignments.push({
          type: 'variable_column_aligned',
          frontend: variable.name,
          database: expectedDbField,
          status: 'OK'
        });
      } else {
        this.results.crossValidation.mismatches.push({
          type: 'variable_column_mismatch',
          frontend: variable.name,
          expectedDatabase: expectedDbField,
          issue: 'Frontend variable has no corresponding database column'
        });
      }
    });
  }

  async validateApiAlignment() {
    // Vérifier que les champs API correspondent aux colonnes BD
    const dbColumns = new Set();
    this.results.database.tables.forEach(table => {
      table.columns.forEach(col => {
        dbColumns.add(col.name);
      });
    });
    
    this.results.frontend.apiCalls.forEach(apiCall => {
      if (dbColumns.has(apiCall.field)) {
        this.results.crossValidation.alignments.push({
          type: 'api_column_aligned',
          apiField: apiCall.field,
          status: 'OK'
        });
      } else {
        this.results.crossValidation.mismatches.push({
          type: 'api_column_mismatch',
          apiField: apiCall.field,
          file: apiCall.file,
          issue: 'API field has no corresponding database column'
        });
      }
    });
  }

  generateReport() {
    // Calculer le score de conformité
    const totalChecks = this.calculateTotalChecks();
    const passedChecks = totalChecks - this.calculateTotalIssues();
    const conformityScore = Math.round((passedChecks / totalChecks) * 100);
    
    this.results.summary = {
      totalIssues: this.calculateTotalIssues(),
      conformityScore,
      status: conformityScore >= 95 ? 'EXCELLENT' : conformityScore >= 85 ? 'BON' : 'À AMÉLIORER'
    };
    
    // Générer le rapport détaillé
    const report = {
      timestamp: new Date().toISOString(),
      version: 'SPOFE v2.2',
      conventions: this.conventions,
      results: this.results,
      recommendations: this.generateRecommendations()
    };
    
    // Sauvegarder le rapport
    const reportPath = path.join(this.projectRoot, 'test-conformite-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Afficher le résumé
    this.displaySummary();
    
    console.log(`\n📄 Rapport détaillé sauvegardé: ${reportPath}`);
  }

  calculateTotalChecks() {
    let total = 0;
    
    // Tables
    total += this.results.database.tables.length * 5; // 5 checks par table
    
    // Modèles
    total += this.results.backend.models.length * 3; // 3 checks par modèle
    
    // Variables frontend
    total += this.results.frontend.variables.length;
    
    // Appels API
    total += this.results.frontend.apiCalls.length;
    
    return total;
  }

  calculateTotalIssues() {
    let total = 0;
    
    total += this.results.database.issues.length;
    total += this.results.crossValidation.mismatches.length;
    
    // Ajouter les problèmes de conventions
    this.results.database.tables.forEach(table => {
      if (!table.conventions.naming.compliant) total++;
      if (!table.conventions.primaryKey.compliant) total++;
      if (!table.conventions.foreignKeys.compliant) total++;
      if (!table.conventions.timestamps.compliant) total++;
      if (!table.conventions.booleans.compliant) total++;
    });
    
    this.results.backend.models.forEach(model => {
      if (!model.conventions.naming.compliant) total++;
      if (!model.conventions.tableMapping.compliant) total++;
      if (!model.conventions.columnNaming.compliant) total++;
    });
    
    return total;
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.summary.conformityScore < 95) {
      recommendations.push('🔧 Améliorer la conformité pour atteindre 95%');
    }
    
    if (this.results.crossValidation.mismatches.length > 0) {
      recommendations.push('🔄 Corriger les incohérences entre Base de données, Backend et Frontend');
    }
    
    if (this.results.database.issues.length > 0) {
      recommendations.push('🗄️ Standardiser les noms de tables et colonnes selon snake_case');
    }
    
    if (this.results.backend.models.some(m => !m.conventions.tableMapping.compliant)) {
      recommendations.push('📝 Aligner les noms de tables Sequelize avec la base de données');
    }
    
    if (this.results.frontend.variables.length > 0) {
      recommendations.push('⚛️ Standardiser les variables frontend en camelCase avec mapping correct');
    }
    
    recommendations.push('✅ Maintenir les conventions v2.2 pour tout nouveau développement');
    
    return recommendations;
  }

  displaySummary() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE CONFORMITÉ COMPLET - SPOFE v2.2');
    console.log('='.repeat(80));
    
    console.log(`📈 Score de conformité: ${this.results.summary.conformityScore}%`);
    console.log(`📊 Statut: ${this.results.summary.status}`);
    console.log(`🔍 Problèmes identifiés: ${this.results.summary.totalIssues}`);
    
    console.log('\n📋 Détail par composante:');
    console.log(`   🗄️ Base de données: ${this.results.database.tables.length} tables`);
    console.log(`   🔧 Backend: ${this.results.backend.models.length} modèles`);
    console.log(`   ⚛️ Frontend: ${this.results.frontend.variables.length + this.results.frontend.apiCalls.length} éléments`);
    
    console.log('\n🔄 Validation croisée:');
    console.log(`   ✅ Alignements: ${this.results.crossValidation.alignments.length}`);
    console.log(`   ❌ Incohérences: ${this.results.crossValidation.mismatches.length}`);
    
    if (this.results.crossValidation.mismatches.length > 0) {
      console.log('\n🚨 Incohérences principales:');
      this.results.crossValidation.mismatches.slice(0, 5).forEach(mismatch => {
        console.log(`   - ${mismatch.type}: ${mismatch.issue}`);
      });
      
      if (this.results.crossValidation.mismatches.length > 5) {
        console.log(`   ... et ${this.results.crossValidation.mismatches.length - 5} autres`);
      }
    }
    
    console.log('\n💡 Recommandations:');
    this.generateRecommendations().forEach(rec => {
      console.log(`   ${rec}`);
    });
    
    console.log('='.repeat(80));
    
    if (this.results.summary.conformityScore >= 95) {
      console.log('🎉 EXCELLENT! L\'application est parfaitement alignée avec les conventions v2.2');
    } else if (this.results.summary.conformityScore >= 85) {
      console.log('✅ BON! Quelques améliorations possibles pour atteindre l\'excellence');
    } else {
      console.log('⚠️ Des améliorations sont nécessaires pour une meilleure conformité');
    }
  }
}

// Point d'entrée
async function runConformityTest() {
  const tester = new ConformityTester(__dirname);
  await tester.runCompleteTest();
}

if (require.main === module) {
  runConformityTest().catch(error => {
    console.error('❌ Erreur fatale:', error.message);
    process.exit(1);
  });
}

module.exports = { ConformityTester, runConformityTest };
