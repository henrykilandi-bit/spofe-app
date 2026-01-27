#!/usr/bin/env node

/**
 * 🤖 CRÉATION BATCH DE TOUS LES DTOS MANQUANTS
 * 
 * Création intelligente et massive des DTOs manquants pour atteindre 100% de conformité
 * Basée sur l'analyse complète de la base de données et des endpoints existants
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

class CreateAllMissingDTOsBatch {
  constructor() {
    this.appPath = __dirname;
    this.backendPath = path.join(this.appPath, 'cascade/src');
    this.dtoPath = path.join(this.backendPath, 'dto');
    this.mysqlConnection = null;
    
    this.stats = {
      totalEndpoints: 0,
      dtosExisting: 0,
      dtosToCreate: 0,
      dtosCreated: 0,
      propertiesGenerated: 0,
      errors: 0
    };

    // Mapping complet des tables vers DTOs
    this.tableToDTOMapping = {
      // Tables utilisateurs et authentification
      'users': 'user',
      'roles': 'role',
      'permissions': 'permission',
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

    // Mapping intelligent des routes vers DTOs
    this.routeToDTOMapping = {
      '/api/users': 'user',
      '/api/auth': 'user',
      '/api/companies': 'company',
      '/api/roles': 'role',
      '/api/permissions': 'permission',
      '/api/chart-of-accounts': 'chart_of_account',
      '/api/journal-entries': 'journal_entry',
      '/api/journal-entry-lines': 'journal_entry_line',
      '/api/account-balances': 'account_balance',
      '/api/audit': 'audit_trail',
      '/api/login-audit': 'login_audit_trail',
      '/api/security': 'security_event',
      '/api/password-reset': 'password_reset_token',
      '/api/remember-tokens': 'remember_token',
      '/api/token-blacklist': 'token_blacklist',
      '/api/company-permissions': 'company_permission',
      '/api/consultant-access': 'consultant_company_access',
      '/api/super-users': 'groupe_super_user',
      '/api/entreprises': 'groupe_entreprise',
      '/api/role-approvals': 'pending_role_approval',
      '/api/approval-workflow': 'role_approval_workflow',
      '/api/approval-audit': 'approval_audit_log'
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

  async createAllMissingDTOs() {
    console.log('🤖 CRÉATION BATCH DE TOUS LES DTOS MANQUANTS');
    console.log('='.repeat(70));

    try {
      // 1. Connexion à la base de données
      const connected = await this.connectToMySQL();
      if (!connected) {
        throw new Error('Impossible de se connecter à MySQL');
      }

      // 2. Analyser la structure complète de la base
      console.log('\n📊 ANALYSE COMPLÈTE DE LA BASE DE DONNÉES');
      const dbStructure = await this.analyzeDatabaseStructure();
      console.log(`📋 Tables analysées: ${Object.keys(dbStructure).length}`);

      // 3. Analyser tous les endpoints existants
      console.log('\n📡 ANALYSE COMPLÈTE DES ENDPOINTS');
      const allEndpoints = await this.analyzeAllEndpoints();
      console.log(`🎯 Endpoints analysés: ${allEndpoints.length}`);

      // 4. Identifier tous les DTOs manquants
      console.log('\n🔍 IDENTIFICATION COMPLÈTE DES DTOS MANQUANTS');
      const missingDTOs = await this.identifyAllMissingDTOs(allEndpoints, dbStructure);
      console.log(`📁 DTOs manquants identifiés: ${missingDTOs.length}`);

      // 5. Créer tous les DTOs manquants
      console.log('\n🤖 CRÉATION MASSIVE DES DTOS MANQUANTS');
      await this.createAllMissingDTOsBatch(missingDTOs, dbStructure);

      // 6. Mettre à jour le contrat
      console.log('\n🔄 MISE À JOUR DU CONTRAT FRONTEND');
      await this.updateContract();

      // 7. Générer le rapport final
      console.log('\n📋 GÉNÉRATION DU RAPPORT FINAL');
      await this.generateFinalReport();

      console.log('\n✅ CRÉATION BATCH DES DTOS TERMINÉE');
      this.displayFinalResults();

    } catch (error) {
      console.error('❌ Erreur création batch DTOs:', error.message);
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
          extra: col.Extra,
          description: this.generateColumnDescription(col.Field)
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

  generateColumnDescription(columnName) {
    const descriptions = {
      'id': 'Identifiant unique',
      'uuid': 'UUID unique',
      'created_at': 'Date de création',
      'updated_at': 'Date de mise à jour',
      'deleted_at': 'Date de suppression',
      'email': 'Adresse email',
      'password': 'Mot de passe hashé',
      'first_name': 'Prénom',
      'last_name': 'Nom de famille',
      'name': 'Nom',
      'description': 'Description',
      'status': 'Statut',
      'is_active': 'Indique si l\'élément est actif',
      'is_deleted': 'Indique si l\'élément est supprimé',
      'token': 'Jeton d\'authentification',
      'expires_at': 'Date d\'expiration',
      'user_id': 'ID de l\'utilisateur',
      'company_id': 'ID de la compagnie',
      'role_id': 'ID du rôle',
      'permission_id': 'ID de la permission'
    };

    return descriptions[columnName] || `Propriété ${columnName}`;
  }

  async analyzeAllEndpoints() {
    const endpoints = [];
    
    // Analyser tous les fichiers backend
    const backendPaths = [
      path.join(this.backendPath, 'routes'),
      path.join(this.backendPath, 'controllers'),
      path.join(this.backendPath, 'services')
    ];
    
    for (const backendPath of backendPaths) {
      const files = this.scanDirectory(backendPath, '.js');
      
      for (const file of files) {
        const fileEndpoints = await this.extractEndpointsFromFile(file);
        endpoints.push(...fileEndpoints);
      }
    }
    
    // Dédupliquer les endpoints
    const uniqueEndpoints = endpoints.filter((endpoint, index, self) =>
      index === self.findIndex(e => e.method === endpoint.method && e.route === endpoint.route)
    );
    
    return uniqueEndpoints;
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

  async identifyAllMissingDTOs(endpoints, dbStructure) {
    const missingDTOs = [];
    const processedTables = new Set();
    const existingDTOs = this.getExistingDTOs();
    
    console.log(`📁 DTOs existants: ${existingDTOs.length}`);
    
    for (const endpoint of endpoints) {
      // Identifier le DTO requis pour cet endpoint
      const requiredDTO = this.identifyRequiredDTO(endpoint);
      
      if (requiredDTO && !processedTables.has(requiredDTO.table)) {
        processedTables.add(requiredDTO.table);
        
        // Vérifier si le DTO existe déjà
        const dtoFile = path.join(this.dtoPath, `${requiredDTO.name}.dto.js`);
        const exists = fs.existsSync(dtoFile);
        
        if (!exists) {
          missingDTOs.push({
            name: requiredDTO.name,
            table: requiredDTO.table,
            endpoints: [endpoint],
            description: requiredDTO.description,
            priority: this.calculatePriority(requiredDTO.name, endpoint.method)
          });
        } else {
          this.stats.dtosExisting++;
        }
      }
    }
    
    // Ajouter les DTOs manquants basés sur les tables sans endpoints directs
    for (const [table, dtoName] of Object.entries(this.tableToDTOMapping)) {
      if (!processedTables.has(table) && dbStructure[table]) {
        const dtoFile = path.join(this.dtoPath, `${dtoName}.dto.js`);
        if (!fs.existsSync(dtoFile)) {
          missingDTOs.push({
            name: dtoName,
            table: table,
            endpoints: [],
            description: `DTO pour la table ${table}`,
            priority: 'MEDIUM'
          });
        }
      }
    }
    
    // Trier par priorité
    missingDTOs.sort((a, b) => {
      const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    return missingDTOs;
  }

  getExistingDTOs() {
    if (!fs.existsSync(this.dtoPath)) {
      return [];
    }
    
    return fs.readdirSync(this.dtoPath)
      .filter(file => file.endsWith('.dto.js'))
      .map(file => file.replace('.dto.js', ''));
  }

  identifyRequiredDTO(endpoint) {
    const route = endpoint.route;
    
    // Mapping direct par route
    for (const [routePattern, dtoName] of Object.entries(this.routeToDTOMapping)) {
      if (route.startsWith(routePattern)) {
        const tableName = this.findTableForDTO(dtoName);
        if (tableName) {
          return {
            name: dtoName,
            table: tableName,
            description: `DTO pour ${routePattern}`
          };
        }
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
    if (parts.includes('journal-entry-lines')) return 'journal_entry_line';
    if (parts.includes('account-balances')) return 'account_balance';
    if (parts.includes('audit')) return 'audit_trail';
    if (parts.includes('login-audit')) return 'login_audit_trail';
    if (parts.includes('security')) return 'security_event';
    if (parts.includes('password-reset')) return 'password_reset_token';
    if (parts.includes('remember-tokens')) return 'remember_token';
    if (parts.includes('token-blacklist')) return 'token_blacklist';
    if (parts.includes('company-permissions')) return 'company_permission';
    if (parts.includes('consultant-access')) return 'consultant_company_access';
    if (parts.includes('super-users')) return 'groupe_super_user';
    if (parts.includes('entreprises')) return 'groupe_entreprise';
    if (parts.includes('role-approvals')) return 'pending_role_approval';
    if (parts.includes('approval-workflow')) return 'role_approval_workflow';
    if (parts.includes('approval-audit')) return 'approval_audit_log';
    
    // Extraction générique
    if (parts.length >= 2) {
      const resource = parts[1];
      return this.singularize(resource);
    }
    
    return null;
  }

  calculatePriority(dtoName, method) {
    // Priorité basée sur l'importance et la méthode HTTP
    const highPriorityDTOs = ['user', 'company', 'role', 'permission'];
    const mediumPriorityDTOs = ['chart_of_account', 'journal_entry', 'account_balance'];
    
    if (highPriorityDTOs.includes(dtoName)) {
      return 'HIGH';
    }
    if (mediumPriorityDTOs.includes(dtoName)) {
      return 'MEDIUM';
    }
    
    // Les méthodes POST/PUT sont plus prioritaires
    if (['POST', 'PUT'].includes(method)) {
      return 'MEDIUM';
    }
    
    return 'LOW';
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

  async createAllMissingDTOsBatch(missingDTOs, dbStructure) {
    this.stats.dtosToCreate = missingDTOs.length;
    console.log(`📁 DTOs à créer: ${missingDTOs.length}`);
    
    // S'assurer que le répertoire DTO existe
    if (!fs.existsSync(this.dtoPath)) {
      fs.mkdirSync(this.dtoPath, { recursive: true });
    }
    
    for (const dtoInfo of missingDTOs) {
      try {
        await this.createSingleDTO(dtoInfo, dbStructure);
        this.stats.dtosCreated++;
        this.stats.propertiesGenerated += dbStructure[dtoInfo.table]?.columns?.length || 0;
      } catch (error) {
        console.error(`❌ Erreur création DTO ${dtoInfo.name}:`, error.message);
        this.stats.errors++;
      }
    }
    
    console.log(`✅ DTOs créés: ${this.stats.dtosCreated}/${missingDTOs.length}`);
  }

  async createSingleDTO(dtoInfo, dbStructure) {
    const tableStructure = dbStructure[dtoInfo.table];
    if (!tableStructure) {
      console.warn(`⚠️ Structure non trouvée pour la table ${dtoInfo.table}`);
      return;
    }

    const dtoFileName = `${dtoInfo.name}.dto.js`;
    const dtoFilePath = path.join(this.dtoPath, dtoFileName);

    // Générer le contenu du DTO
    const dtoContent = this.generateAdvancedDTOContent(dtoInfo, tableStructure);
    
    // Écrire le fichier
    fs.writeFileSync(dtoFilePath, dtoContent);
    console.log(`✅ DTO créé: ${dtoFileName} (${tableStructure.columns.length} propriétés)`);
  }

  generateAdvancedDTOContent(dtoInfo, tableStructure) {
    const className = this.toPascalCase(dtoInfo.name);
    const properties = this.generateAdvancedProperties(tableStructure);
    const relationships = this.generateRelationships(tableStructure);
    const validations = this.generateAdvancedValidations(tableStructure);
    const methods = this.generateAdvancedMethods(dtoInfo, tableStructure);
    const timestamp = new Date().toISOString();

    return `/**
 * 📋 DTO ${className} - Généré automatiquement depuis ${dtoInfo.table}
 * 
 * @generated ${timestamp}
 * @source MySQL Table: ${dtoInfo.table}
 * @description ${dtoInfo.description}
 * @priority ${dtoInfo.priority}
 * @version SPOFE v2.2
 */

class ${className}DTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
${properties.map(prop => `    this.${prop.name} = this.validate${this.toPascalCase(prop.name)}(data.${prop.name}) ${prop.default ? `|| ${prop.default}` : ''};`).join('\n')}

    // Métadonnées
    this._dtoMetadata = {
      generated: '${timestamp}',
      source: '${dtoInfo.table}',
      version: 'SPOFE v2.2',
      priority: '${dtoInfo.priority}',
      properties: ${properties.length},
      relationships: ${relationships.length}
    };
  }

  // Getters avec validation
${properties.map(prop => `  get ${prop.name}() { return this.${prop.name}; }`).join('\n')}

  // Setters avec validation avancée
${properties.map(prop => `  set ${prop.name}(value) { this.${prop.name} = this.validate${this.toPascalCase(prop.name)}(value); }`).join('\n')}

  // Validation des propriétés
${validations.map(val => `  validate${this.toPascalCase(val.name)}(value) { ${val.rule} }`).join('\n')}

  // Validation complète avec messages d'erreur détaillés
  validate() {
    const errors = [];
${properties.filter(prop => prop.required).map(prop => `    if (this.${prop.name} === undefined || this.${prop.name} === null || this.${prop.name} === '') {
      errors.push({
        field: '${prop.name}',
        message: '${prop.name} est requis',
        value: this.${prop.name}
      });
    }`).join('\n')}
    
${properties.map(prop => `    if (this.${prop.name} !== undefined && !this.validate${this.toPascalCase(prop.name)}(this.${prop.name})) {
      errors.push({
        field: '${prop.name}',
        message: 'Format invalide pour ${prop.name}',
        value: this.${prop.name}
      });
    }`).join('\n')}
    
    return {
      isValid: errors.length === 0,
      errors,
      summary: \`\${errors.length} erreur(s) de validation\`
    };
  }

  // Conversion objet brut
  toPlainObject() {
    return {
${properties.map(prop => `      ${prop.name}: this.${prop.name},`).join('\n')}
    };
  }

  // Conversion JSON
  toJSON() {
    return JSON.stringify(this.toPlainObject(), null, 2);
  }

  // Conversion pour API (camelCase)
  toAPIObject() {
    const plain = this.toPlainObject();
    const apiObject = {};
    
    for (const [key, value] of Object.entries(plain)) {
      const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
      apiObject[camelKey] = value;
    }
    
    return apiObject;
  }

  // Statique: créer depuis la base de données
  static fromDatabase(dbRow) {
    return new ${className}DTO({
${properties.map(prop => `      ${prop.name}: dbRow.${prop.name},`).join('\n')}
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new ${className}DTO(dbData);
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
      relationships: ${relationships.length},
      priority: '${dtoInfo.priority}'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new ${className}DTO({
${properties.map(prop => `      ${prop.name}: ${this.generateExampleValue(prop)},`).join('\n')}
    });
  }

  // Méthodes de recherche
  ${methods.join('\n  ')}
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
module.exports.getExample = ${className}DTO.getExample;
`;
  }

  generateAdvancedProperties(tableStructure) {
    return tableStructure.columns.map(col => ({
      name: col.name,
      type: col.type,
      required: !col.nullable && col.default === null,
      default: col.default,
      description: col.description,
      validation: this.generatePropertyValidation(col)
    }));
  }

  generatePropertyValidation(col) {
    if (col.type === 'string') {
      if (col.name === 'email') {
        return 'value && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)';
      }
      if (col.name.includes('token')) {
        return 'typeof value === "string" && value.length >= 10';
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
      return 'typeof value === "object" && value !== null && !Array.isArray(value)';
    }
    return 'true';
  }

  generateAdvancedValidations(tableStructure) {
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

  generateAdvancedMethods(dtoInfo, tableStructure) {
    const methods = [];
    
    // Méthodes de recherche basées sur les colonnes
    for (const col of tableStructure.columns) {
      if (col.key === 'PRI') {
        methods.push(`static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}`);
      }
      
      if (col.name.includes('email')) {
        methods.push(`static findByEmail(email) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findByEmail à implémenter');
}`);
      }
      
      if (col.name.includes('company_id')) {
        methods.push(`static findByCompanyId(companyId) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findByCompanyId à implémenter');
}`);
      }
    }
    
    return methods;
  }

  generateExampleValue(prop) {
    const examples = {
      'string': `'example'`,
      'number': '123',
      'boolean': 'true',
      'object': '{}',
      'date': `'2026-01-27T15:30:00.000Z'`
    };
    
    if (prop.name.includes('id')) return 1;
    if (prop.name.includes('email')) return `'user@example.com'`;
    if (prop.name.includes('name')) return `'Example Name'`;
    if (prop.name.includes('created_at') || prop.name.includes('updated_at')) return `'${new Date().toISOString()}'`;
    if (prop.name.includes('is_')) return true;
    
    return examples[prop.type] || 'null';
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

  async generateFinalReport() {
    const report = {
      timestamp: new Date().toISOString(),
      version: 'SPOFE v2.2',
      operation: 'Batch DTO Creation',
      stats: this.stats,
      results: {
        dtosCreated: this.stats.dtosCreated,
        propertiesGenerated: this.stats.propertiesGenerated,
        successRate: this.stats.dtosToCreate > 0 ? (this.stats.dtosCreated / this.stats.dtosToCreate * 100).toFixed(2) : 100
      },
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.appPath, 'batch-dto-creation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📋 Rapport généré: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.stats.dtosCreated > 0) {
      recommendations.push({
        type: 'DTOs Created',
        message: `${this.stats.dtosCreated} DTOs créés avec succès`,
        action: 'Valider les DTOs générés et tester les endpoints associés'
      });
    }
    
    if (this.stats.errors > 0) {
      recommendations.push({
        type: 'Errors',
        message: `${this.stats.errors} erreurs rencontrées`,
        action: 'Vérifier les logs et corriger les problèmes manuellement'
      });
    }
    
    if (this.stats.propertiesGenerated > 0) {
      recommendations.push({
        type: 'Properties',
        message: `${this.stats.propertiesGenerated} propriétés générées`,
        action: 'Vérifier les types et validations des propriétés'
      });
    }
    
    return recommendations;
  }

  displayFinalResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 RÉSULTATS FINAUX DE LA CRÉATION BATCH DES DTOS');
    console.log('='.repeat(70));
    
    console.log('\n📈 STATISTIQUES:');
    console.log(`   • Total endpoints analysés: ${this.stats.totalEndpoints}`);
    console.log(`   • DTOs existants: ${this.stats.dtosExisting}`);
    console.log(`   • DTOs à créer: ${this.stats.dtosToCreate}`);
    console.log(`   • DTOs créés: ${this.stats.dtosCreated}`);
    console.log(`   • Propriétés générées: ${this.stats.propertiesGenerated}`);
    console.log(`   • Erreurs: ${this.stats.errors}`);
    
    const successRate = this.stats.dtosToCreate > 0 ? 
      ((this.stats.dtosCreated / this.stats.dtosToCreate) * 100).toFixed(2) : 100;
    
    console.log(`\n🎯 TAUX DE SUCCÈS: ${successRate}%`);
    
    console.log('\n📋 IMPACT:');
    console.log('   • Couverture des endpoints améliorée');
    console.log('   • Conformité "un endpoint = un DTO" renforcée');
    console.log('   • Types et validations automatiques');
    console.log('   • Documentation intégrée aux DTOs');
    
    console.log('\n🎯 PROCHAINES ÉTAPES:');
    console.log('   1. Valider les DTOs générés');
    console.log('   2. Tester les endpoints associés');
    console.log('   3. Exécuter la validation SILC complète');
    console.log('   4. Mettre à jour les imports si nécessaire');
  }
}

// Point d'entrée
if (require.main === module) {
  const batchCreator = new CreateAllMissingDTOsBatch();
  batchCreator.createAllMissingDTOs()
    .then(() => {
      console.log('\n🎉 CRÉATION BATCH DES DTOS TERMINÉE AVEC SUCCÈS');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ ERREUR LORS DE LA CRÉATION BATCH:', error.message);
      process.exit(1);
    });
}

module.exports = CreateAllMissingDTOsBatch;
