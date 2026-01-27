#!/usr/bin/env node

/**
 * 🤖 GÉNÉRATEUR DE DTO AMÉLIORÉ POUR SPOFE
 * 
 * Création intelligente des DTOs manquants basée sur:
 * - Structure complète de la base de données MySQL
 * - Conventions SPOFE v2.2
 * - Analyse des endpoints existants
 * - Mapping automatique endpoint ↔ DTO
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

class DTOGeneratorEnhanced {
  constructor() {
    this.appPath = __dirname;
    this.backendPath = path.join(this.appPath, 'cascade/src');
    this.dtoPath = path.join(this.backendPath, 'dto');
    this.contractPath = path.join(this.appPath, 'frontend-contract.json');
    this.mysqlConnection = null;
    
    this.stats = {
      dtosCreated: 0,
      dtosUpdated: 0,
      endpointsMapped: 0,
      propertiesGenerated: 0
    };

    // Mapping complet des tables vers DTOs SPOFE
    this.tableToDTOMapping = {
      // Tables utilisateurs et authentification
      'users': 'user',
      'roles': 'role',
      'password_reset_tokens': 'password_reset_token',
      'remember_tokens': 'remember_token',
      'token_blacklists': 'token_blacklist',
      
      // Tables compagnies et permissions
      'compagnies': 'company',
      'company_permissions': 'company_permission',
      'compagnies_permissions_backup': 'compagnie_permission_backup',
      'consultant_company_access': 'consultant_company_access',
      'groupe_super_users': 'groupe_super_user',
      'groupes_entreprises': 'groupe_entreprise',
      
      // Tables workflow et approbation
      'pending_role_approvals': 'pending_role_approval',
      'role_approval_workflow': 'role_approval_workflow',
      'approval_audit_logs': 'approval_audit_log',
      
      // Tables comptabilité
      'charts_of_accounts': 'chart_of_account',
      'journal_entries': 'journal_entry',
      'journal_entry_lines': 'journal_entry_line',
      'account_balances': 'account_balance',
      
      // Tables audit et sécurité
      'audit_trails': 'audit_trail',
      'login_audit_trails': 'login_audit_trail',
      'security_events': 'security_event'
    };

    // Mapping des routes vers DTOs
    this.routeToDTOMapping = {
      '/api/users': 'user',
      '/api/auth': 'user',
      '/api/companies': 'company',
      '/api/roles': 'role',
      '/api/permissions': 'permission',
      '/api/chart-of-accounts': 'chart_of_account',
      '/api/journal-entries': 'journal_entry',
      '/api/account-balances': 'account_balance',
      '/api/audit': 'audit_trail',
      '/api/security': 'security_event'
    };
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

  async generateAllDTOs() {
    console.log('🤖 GÉNÉRATION AUTOMATIQUE DES DTOS MANQUANTS');
    console.log('='.repeat(60));

    try {
      // 1. Connexion à la base de données
      const connected = await this.connectToMySQL();
      if (!connected) {
        throw new Error('Impossible de se connecter à MySQL');
      }

      // 2. Analyser la structure complète
      console.log('\n📊 ANALYSE DE LA STRUCTURE DE LA BASE DE DONNÉES');
      const dbStructure = await this.analyzeDatabaseStructure();
      console.log(`📋 Tables analysées: ${Object.keys(dbStructure).length}`);

      // 3. Analyser les endpoints existants
      console.log('\n📡 ANALYSE DES ENDPOINTS EXISTANTS');
      const endpoints = await this.analyzeEndpoints();
      console.log(`🎯 Endpoints analysés: ${endpoints.length}`);

      // 4. Identifier les DTOs manquants
      console.log('\n🔍 IDENTIFICATION DES DTOS MANQUANTS');
      const missingDTOs = this.identifyMissingDTOs(endpoints, dbStructure);
      console.log(`📁 DTOs manquants: ${missingDTOs.length}`);

      // 5. Générer les DTOs manquants
      console.log('\n🤖 GÉNÉRATION DES DTOS MANQUANTS');
      for (const dtoInfo of missingDTOs) {
        await this.generateDTO(dtoInfo, dbStructure);
      }

      // 6. Mettre à jour le contrat
      console.log('\n🔄 MISE À JOUR DU CONTRAT');
      await this.updateContract();

      // 7. Générer le rapport
      console.log('\n📋 GÉNÉRATION DU RAPPORT');
      await this.generateReport();

      console.log('\n✅ GÉNÉRATION DES DTOS TERMINÉE');
      this.displayResults();

    } catch (error) {
      console.error('❌ Erreur génération DTOs:', error.message);
      throw error;
    } finally {
      if (this.mysqlConnection) {
        await this.mysqlConnection.end();
      }
    }
  }

  async analyzeDatabaseStructure() {
    const structure = {};
    
    // Récupérer toutes les tables
    const [tables] = await this.mysqlConnection.execute('SHOW TABLES');
    
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];
      
      // Récupérer la structure détaillée
      const [columns] = await this.mysqlConnection.execute(
        `DESCRIBE ${tableName}`
      );
      
      // Récupérer les clés étrangères
      const [foreignKeys] = await this.mysqlConnection.execute(`
        SELECT 
          COLUMN_NAME, 
          REFERENCED_TABLE_NAME, 
          REFERENCED_COLUMN_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = 'spofe_v2_1' 
        AND TABLE_NAME = '${tableName}' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      
      structure[tableName] = {
        columns: columns.map(col => ({
          name: col.Field,
          type: this.mapMySQLTypeToJSType(col.Type),
          mysqlType: col.Type,
          nullable: col.Null === 'YES',
          key: col.Key,
          default: col.Default,
          extra: col.Extra
        })),
        primaryKeys: columns
          .filter(col => col.Key === 'PRI')
          .map(col => col.Field),
        foreignKeys: foreignKeys.map(fk => ({
          column: fk.COLUMN_NAME,
          referencedTable: fk.REFERENCED_TABLE_NAME,
          referencedColumn: fk.REFERENCED_COLUMN_NAME
        }))
      };
    }
    
    return structure;
  }

  mapMySQLTypeToJSType(mysqlType) {
    const typeMap = {
      'int': 'number',
      'bigint': 'number',
      'tinyint': 'number',
      'smallint': 'number',
      'mediumint': 'number',
      'float': 'number',
      'double': 'number',
      'decimal': 'number',
      'varchar': 'string',
      'char': 'string',
      'text': 'string',
      'longtext': 'string',
      'mediumtext': 'string',
      'tinytext': 'string',
      'json': 'object',
      'date': 'string',
      'datetime': 'string',
      'timestamp': 'string',
      'time': 'string',
      'boolean': 'boolean',
      'bool': 'boolean'
    };

    const baseType = mysqlType.split('(')[0].toLowerCase();
    return typeMap[baseType] || 'string';
  }

  async analyzeEndpoints() {
    const endpoints = [];
    
    // Analyser les fichiers de routes et contrôleurs
    const routesPath = path.join(this.backendPath, 'routes');
    const controllersPath = path.join(this.backendPath, 'controllers');
    
    const routeFiles = this.scanDirectory(routesPath, '.js');
    const controllerFiles = this.scanDirectory(controllersPath, '.js');
    
    for (const file of [...routeFiles, ...controllerFiles]) {
      const fileEndpoints = await this.extractEndpointsFromFile(file);
      endpoints.push(...fileEndpoints);
    }
    
    return endpoints;
  }

  scanDirectory(dirPath, extension) {
    const files = [];
    
    if (!fs.existsSync(dirPath)) {
      return files;
    }

    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...this.scanDirectory(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  async extractEndpointsFromFile(filePath) {
    const endpoints = [];
    
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Regex pour trouver les définitions d'endpoints
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
            file: path.relative(this.appPath, filePath)
          });
        }
      }
    } catch (error) {
      console.warn(`⚠️ Erreur lecture fichier ${filePath}:`, error.message);
    }
    
    return endpoints;
  }

  identifyMissingDTOs(endpoints, dbStructure) {
    const missingDTOs = [];
    const processedTables = new Set();
    
    for (const endpoint of endpoints) {
      // Identifier le DTO requis pour cet endpoint
      const requiredDTO = this.identifyRequiredDTO(endpoint);
      
      if (requiredDTO && !processedTables.has(requiredDTO.table)) {
        processedTables.add(requiredDTO.table);
        
        // Vérifier si le DTO existe déjà
        const dtoFile = path.join(this.dtoPath, `${requiredDTO.name}.dto.js`);
        if (!fs.existsSync(dtoFile)) {
          missingDTOs.push({
            name: requiredDTO.name,
            table: requiredDTO.table,
            endpoints: [endpoint],
            description: requiredDTO.description
          });
        }
      }
    }
    
    return missingDTOs;
  }

  identifyRequiredDTO(endpoint) {
    const route = endpoint.route;
    
    // Mapping direct par route
    for (const [routePattern, dtoName] of Object.entries(this.routeToDTOMapping)) {
      if (route.startsWith(routePattern)) {
        const tableName = this.findTableForDTO(dtoName);
        return {
          name: dtoName,
          table: tableName,
          description: `DTO pour ${routePattern}`
        };
      }
    }
    
    // Extraction par nom de ressource
    const resourceName = this.extractResourceFromRoute(route);
    if (resourceName) {
      const tableName = this.findTableForResource(resourceName);
      if (tableName) {
        return {
          name: resourceName,
          table: tableName,
          description: `DTO pour ${resourceName}`
        };
      }
    }
    
    return null;
  }

  extractResourceFromRoute(route) {
    const parts = route.split('/').filter(p => p && !p.startsWith(':'));
    
    // Patterns courants
    if (parts.includes('users') || parts.includes('auth')) return 'user';
    if (parts.includes('companies')) return 'company';
    if (parts.includes('roles')) return 'role';
    if (parts.includes('permissions')) return 'permission';
    if (parts.includes('chart-of-accounts')) return 'chart_of_account';
    if (parts.includes('journal-entries')) return 'journal_entry';
    if (parts.includes('account-balances')) return 'account_balance';
    if (parts.includes('audit')) return 'audit_trail';
    if (parts.includes('security')) return 'security_event';
    
    // Extraction générique
    if (parts.length >= 2) {
      const resource = parts[1];
      return this.singularize(resource);
    }
    
    return null;
  }

  findTableForDTO(dtoName) {
    for (const [table, dto] of Object.entries(this.tableToDTOMapping)) {
      if (dto === dtoName) {
        return table;
      }
    }
    return null;
  }

  findTableForResource(resourceName) {
    // Mapping direct
    if (this.tableToDTOMapping[resourceName]) {
      return resourceName;
    }
    
    // Mapping inversé
    for (const [table, dto] of Object.entries(this.tableToDTOMapping)) {
      if (dto === resourceName) {
        return table;
      }
    }
    
    return null;
  }

  singularize(word) {
    const rules = [
      { pattern: /ies$/, replacement: 'y' },
      { pattern: /s$/, replacement: '' }
    ];

    for (const rule of rules) {
      if (rule.pattern.test(word)) {
        return word.replace(rule.pattern, rule.replacement);
      }
    }

    return word;
  }

  async generateDTO(dtoInfo, dbStructure) {
    const tableStructure = dbStructure[dtoInfo.table];
    if (!tableStructure) {
      console.warn(`⚠️ Structure non trouvée pour la table ${dtoInfo.table}`);
      return;
    }

    const dtoFileName = `${dtoInfo.name}.dto.js`;
    const dtoFilePath = path.join(this.dtoPath, dtoFileName);

    // S'assurer que le répertoire existe
    if (!fs.existsSync(this.dtoPath)) {
      fs.mkdirSync(this.dtoPath, { recursive: true });
    }

    // Générer le contenu du DTO
    const dtoContent = this.generateDTOContent(dtoInfo, tableStructure);
    
    // Écrire le fichier
    fs.writeFileSync(dtoFilePath, dtoContent);
    console.log(`✅ DTO créé: ${dtoFileName}`);
    
    this.stats.dtosCreated++;
    this.stats.propertiesGenerated += tableStructure.columns.length;
  }

  generateDTOContent(dtoInfo, tableStructure) {
    const className = this.toPascalCase(dtoInfo.name);
    const properties = this.generateProperties(tableStructure);
    const relationships = this.generateRelationships(tableStructure);
    const validations = this.generateValidations(tableStructure);
    const timestamp = new Date().toISOString();

    return `/**
 * 📋 DTO ${className} - Généré automatiquement depuis ${dtoInfo.table}
 * 
 * @generated ${timestamp}
 * @source MySQL Table: ${dtoInfo.table}
 * @description ${dtoInfo.description}
 * @version SPOFE v2.2
 */

class ${className}DTO {
  constructor(data = {}) {
    // Propriétés principales
${properties.map(prop => `    this.${prop.name} = data.${prop.name} ${prop.default ? `|| ${prop.default}` : ''};`).join('\n')}

    // Métadonnées
    this._dtoMetadata = {
      generated: '${timestamp}',
      source: '${dtoInfo.table}',
      version: 'SPOFE v2.2'
    };
  }

  // Getters
${properties.map(prop => `  get ${prop.name}() { return this.${prop.name}; }`).join('\n')}

  // Setters avec validation
${properties.map(prop => `  set ${prop.name}(value) { ${prop.validation ? `if (!this.validate${this.toPascalCase(prop.name)}(value)) { throw new Error('Invalid ${prop.name}'); }` : ''} this.${prop.name} = value; }`).join('\n')}

  // Validation des propriétés
${validations.map(val => `  validate${this.toPascalCase(val.name)}(value) { ${val.rule} }`).join('\n')}

  // Validation complète
  validate() {
    const errors = [];
${properties.filter(prop => prop.required).map(prop => `    if (!this.${prop.name}) errors.push('${prop.name} is required');`).join('\n')}
${properties.map(prop => `    if (this.${prop.name} && !this.validate${this.toPascalCase(prop.name)}(this.${prop.name})) errors.push('Invalid ${prop.name}');`).join('\n')}
    return errors;
  }

  // Conversion objet brut
  toPlainObject() {
    return {
${properties.map(prop => `      ${prop.name}: this.${prop.name},`).join('\n')}
    };
  }

  // Conversion JSON
  toJSON() {
    return JSON.stringify(this.toPlainObject());
  }

  // Statique: créer depuis la base de données
  static fromDatabase(dbRow) {
    return new ${className}DTO({
${properties.map(prop => `      ${prop.name}: dbRow.${prop.name},`).join('\n')}
    });
  }

  // Statique: créer pour l'API
  static fromAPI(apiData) {
    return new ${className}DTO({
${properties.map(prop => `      ${prop.name}: apiData.${prop.name},`).join('\n')}
    });
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
${properties.map(prop => `      ${prop.name}: { type: '${prop.type}', required: ${prop.required}, description: '${prop.description}' },`).join('\n')}
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: '${className}',
      table: '${dtoInfo.table}',
      generated: '${timestamp}',
      properties: ${properties.length},
      relationships: ${relationships.length}
    };
  }
}

// Export du DTO
module.exports = ${className}DTO;

// Export des métadonnées
module.exports.schema = ${className}DTO.getSchema();
module.exports.metadata = ${className}DTO.getMetadata();
module.exports.properties = ${properties.map(prop => `'${prop.name}'`).join(', ')};
module.exports.relationships = ${relationships.map(rel => `'${rel.name}'`).join(', ')};

// Export des méthodes utilitaires
module.exports.fromDatabase = ${className}DTO.fromDatabase;
module.exports.fromAPI = ${className}DTO.fromAPI;
`;
  }

  generateProperties(tableStructure) {
    return tableStructure.columns.map(col => ({
      name: col.name,
      type: col.type,
      required: !col.nullable && col.default === null,
      default: col.default,
      description: this.generatePropertyDescription(col),
      validation: this.generatePropertyValidation(col)
    }));
  }

  generatePropertyDescription(col) {
    const descriptions = {
      'id': 'Identifiant unique',
      'created_at': 'Date de création',
      'updated_at': 'Date de mise à jour',
      'email': 'Adresse email',
      'password': 'Mot de passe hashé',
      'first_name': 'Prénom',
      'last_name': 'Nom de famille',
      'name': 'Nom',
      'description': 'Description',
      'status': 'Statut',
      'is_active': 'Indique si l\'élément est actif',
      'is_deleted': 'Indique si l\'élément est supprimé'
    };

    return descriptions[col.name] || `Propriété ${col.name} de type ${col.type}`;
  }

  generatePropertyValidation(col) {
    if (col.type === 'string') {
      if (col.name === 'email') {
        return 'value && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)';
      }
      return 'typeof value === "string"';
    }
    if (col.type === 'number') {
      return 'typeof value === "number" && !isNaN(value)';
    }
    if (col.type === 'boolean') {
      return 'typeof value === "boolean"';
    }
    if (col.type === 'object') {
      return 'typeof value === "object" && value !== null';
    }
    return 'true';
  }

  generateValidations(tableStructure) {
    return tableStructure.columns.map(col => ({
      name: col.name,
      rule: this.generatePropertyValidation(col)
    }));
  }

  generateRelationships(tableStructure) {
    const relationships = [];
    
    for (const fk of tableStructure.foreignKeys) {
      const referencedDTO = this.tableToDTOMapping[fk.referencedTable];
      if (referencedDTO) {
        relationships.push({
          name: fk.referencedTable,
          type: 'belongsTo',
          foreignKey: fk.column,
          referencedKey: fk.referencedColumn
        });
      }
    }
    
    return relationships;
  }

  toPascalCase(str) {
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  async updateContract() {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['contract-generator.js'], {
        cwd: this.appPath,
        stdio: 'inherit'
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          console.log('✅ Contrat mis à jour');
          resolve();
        } else {
          reject(new Error('Erreur mise à jour contrat'));
        }
      });
    });
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      version: 'SPOFE v2.2',
      operation: 'DTO Generation',
      stats: this.stats,
      results: {
        dtosCreated: this.stats.dtosCreated,
        propertiesGenerated: this.stats.propertiesGenerated,
        endpointsMapped: this.stats.endpointsMapped
      }
    };

    const reportPath = path.join(this.appPath, 'dto-generation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📋 Rapport généré: ${reportPath}`);
  }

  displayResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSULTATS DE LA GÉNÉRATION DES DTOS');
    console.log('='.repeat(60));
    
    console.log('\n📈 STATISTIQUES:');
    console.log(`   • DTOs créés: ${this.stats.dtosCreated}`);
    console.log(`   • Propriétés générées: ${this.stats.propertiesGenerated}`);
    console.log(`   • Endpoints mappés: ${this.stats.endpointsMapped}`);
    
    console.log('\n📋 FICHIERS CRÉÉS:');
    console.log(`   • DTOs: ${this.stats.dtosCreated} nouveaux fichiers`);
    console.log(`   • Contrat: frontend-contract.json mis à jour`);
    console.log(`   • Rapport: dto-generation-report.json`);
    
    console.log('\n🎯 IMPACT:');
    console.log('   • Couverture des endpoints améliorée');
    console.log('   • Conformité "un endpoint = un DTO" renforcée');
    console.log('   • Types et validations automatiques');
  }
}

// Point d'entrée
if (require.main === module) {
  const generator = new DTOGeneratorEnhanced();
  generator.generateAllDTOs()
    .then(() => {
      console.log('\n🎉 GÉNÉRATION DES DTOS TERMINÉE AVEC SUCCÈS');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ ERREUR LORS DE LA GÉNÉRATION:', error.message);
      process.exit(1);
    });
}

module.exports = DTOGeneratorEnhanced;
