#!/usr/bin/env node

/**
 * 🔍 SCAN COMPLET CONVENTIONS SPOFE v2.2
 * Analyse l'application SANS corrections
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = __dirname;

// ============ CONVENTIONS v2.2 ============
const conventions = {
  database: {
    caseStyle: 'snake_case',
    plural: true,
    maxLength: 64,
    allowedChars: /^[a-z0-9_]+$/,
    forbiddenTerms: ['user', 'company', 'entry', 'account', 'role', 'group'],
    replacements: {
      'user': 'utilisateur',
      'users': 'utilisateurs',
      'company': 'compagnie',
      'companies': 'compagnies',
      'entry': 'ecriture',
      'entries': 'ecritures',
      'account': 'compte',
      'accounts': 'comptes',
      'role': 'role',
      'group': 'groupe'
    }
  },
  javascript: {
    controller: /\.controller\.js$/,
    model: /\.model\.js$/,
    service: /\.service\.js$/,
    middleware: /\.middleware\.js$/,
    validator: /\.validator\.js$/,
    route: /\.routes?\.js$/
  },
  frontend: {
    component: /^[A-Z][a-zA-Z0-9]*\.jsx$/,
    hook: /^use[A-Z][a-zA-Z0-9]*\.js$/,
    util: /^[a-z][a-z0-9]*\.js$/
  }
};

// ============ RAPPORTS ============
const report = {
  summary: {
    timestamp: new Date().toISOString(),
    totalFilesScanned: 0,
    conformeFiles: 0,
    nonConformeFiles: 0,
    conformityScore: 0
  },
  backend: {
    models: [],
    controllers: [],
    services: [],
    middleware: [],
    other: []
  },
  frontend: {
    components: [],
    hooks: [],
    utils: [],
    other: []
  },
  database: {
    tables: [],
    columns: []
  }
};

// ============ FONCTIONS UTILITAIRES ============

function isSnakeCase(str) {
  return /^[a-z0-9_]+$/.test(str) && !str.startsWith('_') && !str.endsWith('_');
}

function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

// ============ SCAN BACKEND ============

async function scanBackend() {
  console.log('🔍 Scanning Backend...');
  
  const modelDir = path.join(rootDir, 'cascade', 'src', 'models');
  const controllerDir = path.join(rootDir, 'cascade', 'src', 'controllers');
  const serviceDir = path.join(rootDir, 'cascade', 'src', 'services');
  const middlewareDir = path.join(rootDir, 'cascade', 'src', 'middleware');
  
  // Scan models
  if (fs.existsSync(modelDir)) {
    const files = fs.readdirSync(modelDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(modelDir, file);
      const stat = fs.statSync(filePath);
      report.summary.totalFilesScanned++;
      
      const violation = {};
      
      // Check filename pattern
      if (!file.match(/^[A-Za-z0-9]+\.model\.js$/)) {
        violation.file = file;
        violation.issue = 'Invalid model filename pattern';
        violation.expected = '{EntityName}.model.js';
        violation.severity = 'major';
        report.backend.models.push(violation);
        report.summary.nonConformeFiles++;
      } else {
        report.summary.conformeFiles++;
      }
    }
  }
  
  // Scan controllers
  if (fs.existsSync(controllerDir)) {
    const files = fs.readdirSync(controllerDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      report.summary.totalFilesScanned++;
      
      const violation = {};
      if (!file.match(/^[a-z][a-zA-Z0-9]*\.controller\.js$/)) {
        violation.file = file;
        violation.issue = 'Invalid controller filename';
        violation.expected = '{entityName}.controller.js (camelCase)';
        violation.severity = 'major';
        report.backend.controllers.push(violation);
        report.summary.nonConformeFiles++;
      } else {
        report.summary.conformeFiles++;
      }
    }
  }
  
  // Scan services
  if (fs.existsSync(serviceDir)) {
    const files = fs.readdirSync(serviceDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      report.summary.totalFilesScanned++;
      
      const violation = {};
      if (!file.match(/^[a-z][a-zA-Z0-9]*\.service\.js$/) && !file.match(/^[a-z][a-zA-Z0-9]*\.js$/)) {
        violation.file = file;
        violation.issue = 'Invalid service filename';
        violation.expected = '{serviceName}.service.js (camelCase)';
        violation.severity = 'minor';
        report.backend.services.push(violation);
        report.summary.nonConformeFiles++;
      } else {
        report.summary.conformeFiles++;
      }
    }
  }
}

// ============ SCAN FRONTEND ============

async function scanFrontend() {
  console.log('🔍 Scanning Frontend...');
  
  const componentDir = path.join(rootDir, 'frontend', 'src', 'pages');
  const hooksDir = path.join(rootDir, 'frontend', 'src', 'hooks');
  const utilsDir = path.join(rootDir, 'frontend', 'src', 'utils');
  
  // Scan components
  if (fs.existsSync(componentDir)) {
    const files = fs.readdirSync(componentDir).filter(f => f.endsWith('.jsx'));
    for (const file of files) {
      report.summary.totalFilesScanned++;
      
      const violation = {};
      // PascalCase check
      if (!file.match(/^[A-Z][a-zA-Z0-9]*\.jsx$/) && !file.match(/^[A-Z][a-zA-Z0-9\-]*\.jsx$/)) {
        violation.file = file;
        violation.issue = 'Invalid component filename';
        violation.expected = '{ComponentName}.jsx (PascalCase)';
        violation.severity = 'major';
        report.frontend.components.push(violation);
        report.summary.nonConformeFiles++;
      } else {
        report.summary.conformeFiles++;
      }
    }
  }
  
  // Scan hooks
  if (fs.existsSync(hooksDir)) {
    const files = fs.readdirSync(hooksDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      report.summary.totalFilesScanned++;
      
      const violation = {};
      if (!file.match(/^use[A-Z][a-zA-Z0-9]*\.js$/)) {
        violation.file = file;
        violation.issue = 'Invalid hook filename';
        violation.expected = 'use{HookName}.js (camelCase with use prefix)';
        violation.severity = 'major';
        report.frontend.hooks.push(violation);
        report.summary.nonConformeFiles++;
      } else {
        report.summary.conformeFiles++;
      }
    }
  }
  
  // Scan utils
  if (fs.existsSync(utilsDir)) {
    const files = fs.readdirSync(utilsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
      report.summary.totalFilesScanned++;
      
      const violation = {};
      if (!file.match(/^[a-z][a-zA-Z0-9]*\.js$/)) {
        violation.file = file;
        violation.issue = 'Invalid utils filename';
        violation.expected = '{utilName}.js (camelCase)';
        violation.severity = 'minor';
        report.frontend.utils.push(violation);
        report.summary.nonConformeFiles++;
      } else {
        report.summary.conformeFiles++;
      }
    }
  }
}

// ============ SCAN DATABASE ============

async function scanDatabase() {
  console.log('🔍 Scanning Database...');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofeapp'
    });
    
    // Get all tables
    const [tables] = await connection.query(`
      SELECT TABLE_NAME, TABLE_SCHEMA 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'spofeapp'
    `);
    
    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const violation = {};
      
      // Check table naming
      if (!isSnakeCase(tableName)) {
        violation.table = tableName;
        violation.issue = 'Table name not in snake_case';
        violation.expected = tableName.toLowerCase().replace(/([A-Z])/g, '_$1');
        violation.severity = 'critical';
        report.database.tables.push(violation);
      }
      
      // Check table is plural
      if (tableName.slice(-1) !== 's' && !['information_schema'].includes(tableName)) {
        violation.table = tableName;
        violation.issue = 'Table name should be plural';
        violation.expected = tableName + 's';
        violation.severity = 'major';
        if (!report.database.tables.find(v => v.table === tableName)) {
          report.database.tables.push(violation);
        }
      }
      
      // Get columns
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = 'spofeapp' AND TABLE_NAME = ?
      `, [tableName]);
      
      for (const col of columns) {
        const colName = col.COLUMN_NAME;
        const colViolation = {};
        
        // Check column naming
        if (!isSnakeCase(colName)) {
          colViolation.table = tableName;
          colViolation.column = colName;
          colViolation.issue = 'Column name not in snake_case';
          colViolation.expected = colName.toLowerCase().replace(/([A-Z])/g, '_$1');
          colViolation.severity = 'critical';
          report.database.columns.push(colViolation);
        }
        
        // Check foreign keys format
        if (colName.includes('_id') && colName !== 'id') {
          // This should reference a table
          if (!colName.match(/^[a-z0-9]+_id$/)) {
            colViolation.table = tableName;
            colViolation.column = colName;
            colViolation.issue = 'Foreign key not in format: {table}_id';
            colViolation.severity = 'minor';
            if (!report.database.columns.find(v => v.column === colName && v.table === tableName)) {
              report.database.columns.push(colViolation);
            }
          }
        }
        
        // Check timestamps
        if (['created_at', 'updated_at', 'deleted_at'].includes(colName)) {
          if (!col.COLUMN_TYPE.includes('TIMESTAMP') && !col.COLUMN_TYPE.includes('DATETIME')) {
            colViolation.table = tableName;
            colViolation.column = colName;
            colViolation.issue = 'Timestamp column should be TIMESTAMP or DATETIME';
            colViolation.type = col.COLUMN_TYPE;
            colViolation.severity = 'minor';
            report.database.columns.push(colViolation);
          }
        }
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database scan error:', error.message);
    report.database.error = error.message;
  }
}

// ============ GÉNÉRATION DU RAPPORT ============

function generateReport() {
  const total = report.summary.totalFilesScanned;
  const conforme = report.summary.conformeFiles;
  const score = total > 0 ? Math.round((conforme / total) * 100) : 0;
  
  report.summary.conformityScore = `${score}%`;
  report.summary.nonConformeCount = total - conforme;
  
  return report;
}

// ============ MAIN ============

async function main() {
  console.log('🚀 SPOFE v2.2 CONVENTIONS SCANNER');
  console.log('=' .repeat(50));
  
  await scanBackend();
  await scanFrontend();
  await scanDatabase();
  
  const finalReport = generateReport();
  
  // Sauvegarder le rapport
  const reportPath = path.join(rootDir, 'SCAN_CONVENTIONS_v2.2.json');
  fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));
  
  console.log('\n✅ Scan complete!');
  console.log(`📊 Conformité: ${finalReport.summary.conformityScore}`);
  console.log(`📁 Files scanned: ${finalReport.summary.totalFilesScanned}`);
  console.log(`✅ Conforme: ${finalReport.summary.conformeFiles}`);
  console.log(`❌ Non-conforme: ${finalReport.summary.nonConformeCount}`);
  console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
}

main().catch(console.error);
