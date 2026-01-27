#!/usr/bin/env node

/**
 * 🔍 VALIDATION COMPLÈTE DE LA CONSISTANCE CODE/CONTRAT
 * 
 * Validation complète de la consistance entre:
 * - Le contrat frontend JSON
 * - Le code backend (routes, contrôleurs, services)
 * - Les DTOs générés
 * - La structure de la base de données
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

class ValidateFullConsistency {
  constructor() {
    this.appPath = __dirname;
    this.backendPath = path.join(this.appPath, 'cascade/src');
    this.contractPath = path.join(this.appPath, 'frontend-contract.json');
    this.mysqlConnection = null;
    
    this.validationResults = {
      contractConsistency: {
        total: 0,
        valid: 0,
        invalid: 0,
        issues: []
      },
      codeConsistency: {
        total: 0,
        valid: 0,
        invalid: 0,
        issues: []
      },
      databaseConsistency: {
        total: 0,
        valid: 0,
        invalid: 0,
        issues: []
      },
      dtoConsistency: {
        total: 0,
        valid: 0,
        invalid: 0,
        issues: []
      }
    };
  }

  async validateAllConsistency() {
    console.log('🔍 VALIDATION COMPLÈTE DE LA CONSISTANCE CODE/CONTRAT');
    console.log('='.repeat(70));

    try {
      // 1. Connexion à la base de données
      const connected = await this.connectToMySQL();
      if (!connected) {
        throw new Error('Impossible de se connecter à MySQL');
      }

      // 2. Charger le contrat
      console.log('\n📋 CHARGEMENT DU CONTRAT FRONTEND');
      const contract = await this.loadContract();
      
      // 3. Valider la consistance du contrat
      console.log('\n🔍 VALIDATION DE LA CONSISTANCE DU CONTRAT');
      await this.validateContractConsistency(contract);
      
      // 4. Valider la consistance du code backend
      console.log('\n🔍 VALIDATION DE LA CONSISTANCE DU CODE BACKEND');
      await this.validateCodeConsistency(contract);
      
      // 5. Valider la consistance de la base de données
      console.log('\n🔍 VALIDATION DE LA CONSISTANCE DE LA BASE DE DONNÉES');
      await this.validateDatabaseConsistency(contract);
      
      // 6. Valider la consistance des DTOs
      console.log('\n🔍 VALIDATION DE LA CONSISTANCE DES DTOS');
      await this.validateDTOConsistency(contract);
      
      // 7. Générer le rapport final
      console.log('\n📋 GÉNÉRATION DU RAPPORT DE CONSISTANCE');
      await this.generateConsistencyReport();
      
      console.log('\n✅ VALIDATION DE CONSISTANCE TERMINÉE');
      this.displayResults();

    } catch (error) {
      console.error('❌ Erreur validation consistance:', error.message);
      throw error;
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
      }
    }
  }

  async connectToMySQL() {
    try {
      this.mysqlConnection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'spofe_v2_1'
      });
      console.log('✅ Connexion MySQL établie');
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion MySQL:', error.message);
      return false;
    }
  }

  async loadContract() {
    try {
      const contractContent = fs.readFileSync(this.contractPath, 'utf8');
      const contract = JSON.parse(contractContent);
      console.log(`✅ Contrat chargé: ${Object.keys(contract.endpoints || {}).length} endpoints`);
      return contract;
    } catch (error) {
      throw new Error('Impossible de charger le contrat frontend');
    }
  }

  async validateContractConsistency(contract) {
    const issues = [];
    const endpoints = contract.endpoints || {};
    
    for (const [endpointKey, endpoint] of Object.entries(endpoints)) {
      this.validationResults.contractConsistency.total++;
      
      // Vérifier la structure de l'endpoint
      if (!endpoint.method || !endpoint.route) {
        issues.push({
          type: 'invalid_endpoint_structure',
          endpoint: endpointKey,
          message: 'Structure d\'endpoint invalide (method/route manquant)',
          severity: 'HIGH'
        });
        this.validationResults.contractConsistency.invalid++;
        continue;
      }
      
      // Vérifier la présence du DTO
      if (!endpoint.dto) {
        issues.push({
          type: 'missing_dto',
          endpoint: endpointKey,
          message: 'DTO manquant pour cet endpoint',
          severity: 'HIGH'
        });
        this.validationResults.contractConsistency.invalid++;
        continue;
      }
      
      // Vérifier la structure du DTO
      if (!endpoint.dto.properties || Object.keys(endpoint.dto.properties).length === 0) {
        issues.push({
          type: 'empty_dto',
          endpoint: endpointKey,
          message: 'DTO vide ou sans propriétés',
          severity: 'MEDIUM'
        });
        this.validationResults.contractConsistency.invalid++;
        continue;
      }
      
      // Vérifier les types de propriétés
      for (const [propName, prop] of Object.entries(endpoint.dto.properties)) {
        if (!prop.type) {
          issues.push({
            type: 'missing_property_type',
            endpoint: endpointKey,
            property: propName,
            message: `Type manquant pour la propriété ${propName}`,
            severity: 'MEDIUM'
          });
        }
      }
      
      this.validationResults.contractConsistency.valid++;
    }
    
    this.validationResults.contractConsistency.issues = issues;
    console.log(`📊 Contrat: ${this.validationResults.contractConsistency.valid}/${this.validationResults.contractConsistency.total} valides`);
    console.log(`🚨 Issues: ${issues.length}`);
  }

  async validateCodeConsistency(contract) {
    const issues = [];
    const backendFiles = this.scanBackendFiles();
    const contractEndpoints = Object.keys(contract.endpoints || {});
    
    // Vérifier que chaque endpoint du contrat existe dans le code
    for (const endpointKey of contractEndpoints) {
      this.validationResults.codeConsistency.total++;
      
      const [method, route] = endpointKey.split(':');
      const exists = backendFiles.some(file => this.hasEndpointInFile(file, method, route));
      
      if (!exists) {
        issues.push({
          type: 'orphaned_endpoint',
          endpoint: endpointKey,
          message: `Endpoint ${endpointKey} existe dans le contrat mais pas dans le code`,
          severity: 'HIGH'
        });
        this.validationResults.codeConsistency.invalid++;
      } else {
        this.validationResults.codeConsistency.valid++;
      }
    }
    
    // Vérifier les endpoints dans le code qui ne sont pas dans le contrat
    const codeEndpoints = await this.extractAllCodeEndpoints(backendFiles);
    const contractEndpointKeys = new Set(contractEndpoints);
    
    for (const codeEndpoint of codeEndpoints) {
      const endpointKey = `${codeEndpoint.method}:${codeEndpoint.route}`;
      if (!contractEndpointKeys.has(endpointKey)) {
        issues.push({
          type: 'unregistered_endpoint',
          endpoint: endpointKey,
          message: `Endpoint ${endpointKey} existe dans le code mais pas dans le contrat`,
          severity: 'MEDIUM'
        });
      }
    }
    
    this.validationResults.codeConsistency.issues = issues;
    console.log(`📊 Code: ${this.validationResults.codeConsistency.valid}/${this.validationResults.codeConsistency.total} valides`);
    console.log(`🚨 Issues: ${issues.length}`);
  }

  async validateDatabaseConsistency(contract) {
    const issues = [];
    
    // Récupérer la structure de la base de données
    const [tables] = await this.mysqlConnection.execute('SHOW TABLES');
    const dbTables = tables.map(row => Object.values(row)[0]);
    
    // Analyser les DTOs du contrat
    const contractDTOs = new Set();
    for (const endpoint of Object.values(contract.endpoints || {})) {
      if (endpoint.dto && endpoint.dto.name) {
        contractDTOs.add(endpoint.dto.name);
      }
    }
    
    // Vérifier que chaque DTO a une table correspondante
    for (const dtoName of contractDTOs) {
      this.validationResults.databaseConsistency.total++;
      
      // Mapping DTO vers table
      const tableMapping = {
        'user': 'users',
        'company': 'compagnies',
        'role': 'roles',
        'permission': 'permissions',
        'chart_of_account': 'charts_of_accounts',
        'journal_entry': 'journal_entries',
        'journal_entry_line': 'journal_entry_lines',
        'account_balance': 'account_balances',
        'audit_trail': 'audit_trails',
        'login_audit_trail': 'login_audit_trails',
        'security_event': 'security_events',
        'password_reset_token': 'password_reset_tokens',
        'remember_token': 'remember_tokens',
        'token_blacklist': 'token_blacklists',
        'company_permission': 'company_permissions',
        'consultant_company_access': 'consultant_company_access',
        'groupe_super_user': 'groupe_super_users',
        'groupe_entreprise': 'groupes_entreprises',
        'pending_role_approval': 'pending_role_approvals',
        'role_approval_workflow': 'role_approval_workflow',
        'approval_audit_log': 'approval_audit_logs'
      };
      
      const expectedTable = tableMapping[dtoName];
      
      if (!expectedTable) {
        issues.push({
          type: 'unknown_dto_mapping',
          dto: dtoName,
          message: `Aucune table correspondante connue pour le DTO ${dtoName}`,
          severity: 'MEDIUM'
        });
        this.validationResults.databaseConsistency.invalid++;
        continue;
      }
      
      if (!dbTables.includes(expectedTable)) {
        issues.push({
          type: 'missing_table',
          dto: dtoName,
          table: expectedTable,
          message: `Table ${expectedTable} manquante pour le DTO ${dtoName}`,
          severity: 'HIGH'
        });
        this.validationResults.databaseConsistency.invalid++;
      } else {
        this.validationResults.databaseConsistency.valid++;
      }
    }
    
    this.validationResults.databaseConsistency.issues = issues;
    console.log(`📊 Base de données: ${this.validationResults.databaseConsistency.valid}/${this.validationResults.databaseConsistency.total} valides`);
    console.log(`🚨 Issues: ${issues.length}`);
  }

  async validateDTOConsistency(contract) {
    const issues = [];
    const dtoPath = path.join(this.backendPath, 'dto');
    
    if (!fs.existsSync(dtoPath)) {
      console.log('⚠️ Répertoire DTO non trouvé');
      return;
    }
    
    const dtoFiles = fs.readdirSync(dtoPath).filter(file => file.endsWith('.dto.js'));
    const contractDTOs = new Set();
    
    // Collecter les DTOs du contrat
    for (const endpoint of Object.values(contract.endpoints || {})) {
      if (endpoint.dto && endpoint.dto.name) {
        contractDTOs.add(endpoint.dto.name);
      }
    }
    
    // Vérifier chaque fichier DTO
    for (const dtoFile of dtoFiles) {
      this.validationResults.dtoConsistency.total++;
      
      const dtoName = dtoFile.replace('.dto.js', '');
      
      // Vérifier que le DTO est utilisé dans le contrat
      if (!contractDTOs.has(dtoName)) {
        issues.push({
          type: 'unused_dto',
          dto: dtoName,
          file: dtoFile,
          message: `DTO ${dtoName} non utilisé dans le contrat`,
          severity: 'LOW'
        });
        this.validationResults.dtoConsistency.invalid++;
        continue;
      }
      
      // Vérifier la structure du fichier DTO
      try {
        const dtoContent = fs.readFileSync(path.join(dtoPath, dtoFile), 'utf8');
        
        // Vérifier la présence de la classe
        if (!dtoContent.includes('class ') || !dtoContent.includes('module.exports')) {
          issues.push({
            type: 'invalid_dto_structure',
            dto: dtoName,
            file: dtoFile,
            message: `Structure du DTO ${dtoName} invalide`,
            severity: 'HIGH'
          });
          this.validationResults.dtoConsistency.invalid++;
          continue;
        }
        
        // Vérifier la présence des méthodes requises
        const requiredMethods = ['constructor', 'validate', 'toPlainObject', 'fromDatabase'];
        for (const method of requiredMethods) {
          if (!dtoContent.includes(method)) {
            issues.push({
              type: 'missing_dto_method',
              dto: dtoName,
              method: method,
              message: `Méthode ${method} manquante dans le DTO ${dtoName}`,
              severity: 'MEDIUM'
            });
          }
        }
        
        this.validationResults.dtoConsistency.valid++;
        
      } catch (error) {
        issues.push({
          type: 'dto_read_error',
          dto: dtoName,
          file: dtoFile,
          message: `Erreur lecture du DTO ${dtoName}: ${error.message}`,
          severity: 'HIGH'
        });
        this.validationResults.dtoConsistency.invalid++;
      }
    }
    
    this.validationResults.dtoConsistency.issues = issues;
    console.log(`📊 DTOs: ${this.validationResults.dtoConsistency.valid}/${this.validationResults.dtoConsistency.total} valides`);
    console.log(`🚨 Issues: ${issues.length}`);
  }

  scanBackendFiles() {
    const files = [];
    const scanDir = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(this.backendPath);
    return files;
  }

  async extractAllCodeEndpoints(backendFiles) {
    const endpoints = [];
    
    for (const file of backendFiles) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const patterns = [
          /router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g,
          /app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g
        ];

        for (const pattern of patterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            endpoints.push({
              method: match[1].toUpperCase(),
              route: match[2],
              file: path.relative(this.appPath, file)
            });
          }
        }
      } catch (error) {
        console.warn(`⚠️ Erreur lecture fichier ${file}:`, error.message);
      }
    }
    
    return endpoints;
  }

  hasEndpointInFile(filePath, method, route) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const pattern = new RegExp(`\\.(get|post|put|delete|patch)\\s*\\(\\s*['"\`]${route}['"\`]`, 'i');
      return pattern.test(content);
    } catch (error) {
      return false;
    }
  }

  async generateConsistencyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      version: 'SPOFE v2.2',
      operation: 'Full Consistency Validation',
      results: this.validationResults,
      summary: {
        totalValidations: Object.values(this.validationResults).reduce((sum, r) => sum + r.total, 0),
        totalValid: Object.values(this.validationResults).reduce((sum, r) => sum + r.valid, 0),
        totalInvalid: Object.values(this.validationResults).reduce((sum, r) => sum + r.invalid, 0),
        totalIssues: Object.values(this.validationResults).reduce((sum, r) => sum + r.issues.length, 0),
        overallConsistency: this.calculateOverallConsistency()
      },
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.appPath, 'full-consistency-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Rapport généré: ${reportPath}`);
  }

  calculateOverallConsistency() {
    const totalValidations = Object.values(this.validationResults).reduce((sum, r) => sum + r.total, 0);
    const totalValid = Object.values(this.validationResults).reduce((sum, r) => sum + r.valid, 0);
    
    if (totalValidations === 0) return 100;
    return ((totalValid / totalValidations) * 100).toFixed(2);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Recommandations pour la consistance du contrat
    if (this.validationResults.contractConsistency.issues.length > 0) {
      const highSeverityIssues = this.validationResults.contractConsistency.issues.filter(i => i.severity === 'HIGH');
      if (highSeverityIssues.length > 0) {
        recommendations.push({
          category: 'Contract',
          priority: 'HIGH',
          message: `${highSeverityIssues.length} problèmes critiques dans le contrat`,
          actions: [
            'Créer les DTOs manquants',
            'Ajouter les propriétés manquantes',
            'Corriger les types invalides'
          ]
        });
      }
    }
    
    // Recommandations pour la consistance du code
    if (this.validationResults.codeConsistency.issues.length > 0) {
      recommendations.push({
        category: 'Code',
        priority: 'MEDIUM',
        message: `${this.validationResults.codeConsistency.issues.length} problèmes de consistance code/contrat`,
        actions: [
          'Implémenter les endpoints manquants',
          'Supprimer les endpoints orphelins',
          'Mettre à jour le contrat'
        ]
      });
    }
    
    // Recommandations pour la consistance de la base de données
    if (this.validationResults.databaseConsistency.issues.length > 0) {
      recommendations.push({
        category: 'Database',
        priority: 'HIGH',
        message: `${this.validationResults.databaseConsistency.issues.length} problèmes de consistance base de données`,
        actions: [
          'Créer les tables manquantes',
          'Mettre à jour le mapping DTO/table',
          'Valider la structure de la base'
        ]
      });
    }
    
    // Recommandations pour la consistance des DTOs
    if (this.validationResults.dtoConsistency.issues.length > 0) {
      recommendations.push({
        category: 'DTOs',
        priority: 'MEDIUM',
        message: `${this.validationResults.dtoConsistency.issues.length} problèmes de consistance des DTOs`,
        actions: [
          'Corriger la structure des DTOs',
          'Ajouter les méthodes manquantes',
          'Nettoyer les DTOs non utilisés'
        ]
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  displayResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSULTATS DE LA VALIDATION DE CONSISTANCE');
    console.log('='.repeat(70));
    
    console.log('\n📈 RÉSUMÉ GLOBAL:');
    const totalValidations = Object.values(this.validationResults).reduce((sum, r) => sum + r.total, 0);
    const totalValid = Object.values(this.validationResults).reduce((sum, r) => sum + r.valid, 0);
    const totalInvalid = Object.values(this.validationResults).reduce((sum, r) => sum + r.invalid, 0);
    const totalIssues = Object.values(this.validationResults).reduce((sum, r) => sum + r.issues.length, 0);
    
    console.log(`   • Validations totales: ${totalValidations}`);
    console.log(`   • Validées: ${totalValid}`);
    console.log(`   • Invalidées: ${totalInvalid}`);
    console.log(`   • Issues: ${totalIssues}`);
    console.log(`   • Consistance globale: ${this.calculateOverallConsistency()}%`);
    
    console.log('\n📋 RÉSULTATS PAR CATÉGORIE:');
    console.log(`   • Contrat: ${this.validationResults.contractConsistency.valid}/${this.validationResults.contractConsistency.total} (${this.validationResults.contractConsistency.issues.length} issues)`);
    console.log(`   • Code: ${this.validationResults.codeConsistency.valid}/${this.validationResults.codeConsistency.total} (${this.validationResults.codeConsistency.issues.length} issues)`);
    console.log(`   • Base de données: ${this.validationResults.databaseConsistency.valid}/${this.validationResults.databaseConsistency.total} (${this.validationResults.databaseConsistency.issues.length} issues)`);
    console.log(`   • DTOs: ${this.validationResults.dtoConsistency.valid}/${this.validationResults.dtoConsistency.total} (${this.validationResults.dtoConsistency.issues.length} issues)`);
    
    console.log('\n📁 FICHIERS GÉNÉRÉS:');
    console.log(`   • Rapport: full-consistency-validation-report.json`);
    
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n🎯 RECOMMANDATIONS PRIORITAIRES:');
      recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.category}: ${rec.message}`);
      });
    }
  }
}

// Point d'entrée
if (require.main === module) {
  const validator = new ValidateFullConsistency();
  validator.validateAllConsistency()
    .then(() => {
      console.log('\n🎉 VALIDATION DE CONSISTANCE TERMINÉE AVEC SUCCÈS');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ ERREUR LORS DE LA VALIDATION:', error.message);
      process.exit(1);
    });
}

module.exports = ValidateFullConsistency;
