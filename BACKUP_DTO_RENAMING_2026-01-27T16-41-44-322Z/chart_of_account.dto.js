/**
 * 📋 DTO ChartOfAccount - Généré automatiquement depuis charts_of_accounts
 * 
 * @generated 2026-01-27T15:57:32.807Z
 * @source MySQL Table: charts_of_accounts
 * @description DTO pour la table charts_of_accounts
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class ChartOfAccountDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.company_id = this.validateCompanyId(data.company_id) ;
    this.account_number = this.validateAccountNumber(data.account_number) ;
    this.account_name = this.validateAccountName(data.account_name) ;
    this.account_type = this.validateAccountType(data.account_type) ;
    this.sub_account_type = this.validateSubAccountType(data.sub_account_type) ;
    this.description = this.validateDescription(data.description) ;
    this.parent_account_id = this.validateParentAccountId(data.parent_account_id) ;
    this.is_active = this.validateIsActive(data.is_active) || 1;
    this.is_taxable = this.validateIsTaxable(data.is_taxable) || 0;
    this.allow_sub_accounts = this.validateAllowSubAccounts(data.allow_sub_accounts) || 1;
    this.level = this.validateLevel(data.level) || 1;
    this.created_at = this.validateCreatedAt(data.created_at) ;
    this.updated_at = this.validateUpdatedAt(data.updated_at) ;
    this.deleted_at = this.validateDeletedAt(data.deleted_at) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.807Z',
      source: 'charts_of_accounts',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 15,
      relationships: 2
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get company_id() { return this.company_id; }
  get account_number() { return this.account_number; }
  get account_name() { return this.account_name; }
  get account_type() { return this.account_type; }
  get sub_account_type() { return this.sub_account_type; }
  get description() { return this.description; }
  get parent_account_id() { return this.parent_account_id; }
  get is_active() { return this.is_active; }
  get is_taxable() { return this.is_taxable; }
  get allow_sub_accounts() { return this.allow_sub_accounts; }
  get level() { return this.level; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get deleted_at() { return this.deleted_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set company_id(value) { this.company_id = this.validateCompanyId(value); }
  set account_number(value) { this.account_number = this.validateAccountNumber(value); }
  set account_name(value) { this.account_name = this.validateAccountName(value); }
  set account_type(value) { this.account_type = this.validateAccountType(value); }
  set sub_account_type(value) { this.sub_account_type = this.validateSubAccountType(value); }
  set description(value) { this.description = this.validateDescription(value); }
  set parent_account_id(value) { this.parent_account_id = this.validateParentAccountId(value); }
  set is_active(value) { this.is_active = this.validateIsActive(value); }
  set is_taxable(value) { this.is_taxable = this.validateIsTaxable(value); }
  set allow_sub_accounts(value) { this.allow_sub_accounts = this.validateAllowSubAccounts(value); }
  set level(value) { this.level = this.validateLevel(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }
  set deleted_at(value) { this.deleted_at = this.validateDeletedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateCompanyId(value) { typeof value === "number" && !isNaN(value) }
  validateAccountNumber(value) { typeof value === "string" }
  validateAccountName(value) { typeof value === "string" }
  validateAccountType(value) { typeof value === "string" }
  validateSubAccountType(value) { typeof value === "string" }
  validateDescription(value) { typeof value === "string" }
  validateParentAccountId(value) { typeof value === "number" && !isNaN(value) }
  validateIsActive(value) { typeof value === "number" && !isNaN(value) }
  validateIsTaxable(value) { typeof value === "number" && !isNaN(value) }
  validateAllowSubAccounts(value) { typeof value === "number" && !isNaN(value) }
  validateLevel(value) { typeof value === "number" && !isNaN(value) }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }
  validateDeletedAt(value) { typeof value === "string" }

  // Validation complète avec messages d'erreur détaillés
  validate() {
    const errors = [];
    if (this.id === undefined || this.id === null || this.id === '') {
      errors.push({
        field: 'id',
        message: 'id est requis',
        value: this.id
      });
    }
    if (this.company_id === undefined || this.company_id === null || this.company_id === '') {
      errors.push({
        field: 'company_id',
        message: 'company_id est requis',
        value: this.company_id
      });
    }
    if (this.account_number === undefined || this.account_number === null || this.account_number === '') {
      errors.push({
        field: 'account_number',
        message: 'account_number est requis',
        value: this.account_number
      });
    }
    if (this.account_name === undefined || this.account_name === null || this.account_name === '') {
      errors.push({
        field: 'account_name',
        message: 'account_name est requis',
        value: this.account_name
      });
    }
    if (this.account_type === undefined || this.account_type === null || this.account_type === '') {
      errors.push({
        field: 'account_type',
        message: 'account_type est requis',
        value: this.account_type
      });
    }
    if (this.created_at === undefined || this.created_at === null || this.created_at === '') {
      errors.push({
        field: 'created_at',
        message: 'created_at est requis',
        value: this.created_at
      });
    }
    if (this.updated_at === undefined || this.updated_at === null || this.updated_at === '') {
      errors.push({
        field: 'updated_at',
        message: 'updated_at est requis',
        value: this.updated_at
      });
    }
    
    if (this.id !== undefined && !this.validateId(this.id)) {
      errors.push({
        field: 'id',
        message: 'Format invalide pour id',
        value: this.id
      });
    }
    if (this.company_id !== undefined && !this.validateCompanyId(this.company_id)) {
      errors.push({
        field: 'company_id',
        message: 'Format invalide pour company_id',
        value: this.company_id
      });
    }
    if (this.account_number !== undefined && !this.validateAccountNumber(this.account_number)) {
      errors.push({
        field: 'account_number',
        message: 'Format invalide pour account_number',
        value: this.account_number
      });
    }
    if (this.account_name !== undefined && !this.validateAccountName(this.account_name)) {
      errors.push({
        field: 'account_name',
        message: 'Format invalide pour account_name',
        value: this.account_name
      });
    }
    if (this.account_type !== undefined && !this.validateAccountType(this.account_type)) {
      errors.push({
        field: 'account_type',
        message: 'Format invalide pour account_type',
        value: this.account_type
      });
    }
    if (this.sub_account_type !== undefined && !this.validateSubAccountType(this.sub_account_type)) {
      errors.push({
        field: 'sub_account_type',
        message: 'Format invalide pour sub_account_type',
        value: this.sub_account_type
      });
    }
    if (this.description !== undefined && !this.validateDescription(this.description)) {
      errors.push({
        field: 'description',
        message: 'Format invalide pour description',
        value: this.description
      });
    }
    if (this.parent_account_id !== undefined && !this.validateParentAccountId(this.parent_account_id)) {
      errors.push({
        field: 'parent_account_id',
        message: 'Format invalide pour parent_account_id',
        value: this.parent_account_id
      });
    }
    if (this.is_active !== undefined && !this.validateIsActive(this.is_active)) {
      errors.push({
        field: 'is_active',
        message: 'Format invalide pour is_active',
        value: this.is_active
      });
    }
    if (this.is_taxable !== undefined && !this.validateIsTaxable(this.is_taxable)) {
      errors.push({
        field: 'is_taxable',
        message: 'Format invalide pour is_taxable',
        value: this.is_taxable
      });
    }
    if (this.allow_sub_accounts !== undefined && !this.validateAllowSubAccounts(this.allow_sub_accounts)) {
      errors.push({
        field: 'allow_sub_accounts',
        message: 'Format invalide pour allow_sub_accounts',
        value: this.allow_sub_accounts
      });
    }
    if (this.level !== undefined && !this.validateLevel(this.level)) {
      errors.push({
        field: 'level',
        message: 'Format invalide pour level',
        value: this.level
      });
    }
    if (this.created_at !== undefined && !this.validateCreatedAt(this.created_at)) {
      errors.push({
        field: 'created_at',
        message: 'Format invalide pour created_at',
        value: this.created_at
      });
    }
    if (this.updated_at !== undefined && !this.validateUpdatedAt(this.updated_at)) {
      errors.push({
        field: 'updated_at',
        message: 'Format invalide pour updated_at',
        value: this.updated_at
      });
    }
    if (this.deleted_at !== undefined && !this.validateDeletedAt(this.deleted_at)) {
      errors.push({
        field: 'deleted_at',
        message: 'Format invalide pour deleted_at',
        value: this.deleted_at
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      summary: `${errors.length} erreur(s) de validation`
    };
  }

  // Conversion objet brut
  toPlainObject() {
    return {
      id: this.id,
      company_id: this.company_id,
      account_number: this.account_number,
      account_name: this.account_name,
      account_type: this.account_type,
      sub_account_type: this.sub_account_type,
      description: this.description,
      parent_account_id: this.parent_account_id,
      is_active: this.is_active,
      is_taxable: this.is_taxable,
      allow_sub_accounts: this.allow_sub_accounts,
      level: this.level,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
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
    return new ChartOfAccountDTO({
      id: dbRow.id,
      company_id: dbRow.company_id,
      account_number: dbRow.account_number,
      account_name: dbRow.account_name,
      account_type: dbRow.account_type,
      sub_account_type: dbRow.sub_account_type,
      description: dbRow.description,
      parent_account_id: dbRow.parent_account_id,
      is_active: dbRow.is_active,
      is_taxable: dbRow.is_taxable,
      allow_sub_accounts: dbRow.allow_sub_accounts,
      level: dbRow.level,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      deleted_at: dbRow.deleted_at,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new ChartOfAccountDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      company_id: { type: 'number', required: true, description: 'ID de la compagnie' },
      account_number: { type: 'string', required: true, description: 'Propriété account_number' },
      account_name: { type: 'string', required: true, description: 'Propriété account_name' },
      account_type: { type: 'string', required: true, description: 'Propriété account_type' },
      sub_account_type: { type: 'string', required: false, description: 'Propriété sub_account_type' },
      description: { type: 'string', required: false, description: 'Description' },
      parent_account_id: { type: 'number', required: false, description: 'Propriété parent_account_id' },
      is_active: { type: 'number', required: false, description: 'Indique si l'élément est actif' },
      is_taxable: { type: 'number', required: false, description: 'Propriété is_taxable' },
      allow_sub_accounts: { type: 'number', required: false, description: 'Propriété allow_sub_accounts' },
      level: { type: 'number', required: false, description: 'Propriété level' },
      created_at: { type: 'string', required: true, description: 'Date de création' },
      updated_at: { type: 'string', required: true, description: 'Date de mise à jour' },
      deleted_at: { type: 'string', required: false, description: 'Date de suppression' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'ChartOfAccount',
      table: 'charts_of_accounts',
      generated: '2026-01-27T15:57:32.807Z',
      properties: 15,
      relationships: 2,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new ChartOfAccountDTO({
      id: 1,
      company_id: 1,
      account_number: 'example',
      account_name: 'Example Name',
      account_type: 'example',
      sub_account_type: 'example',
      description: 'example',
      parent_account_id: 1,
      is_active: true,
      is_taxable: true,
      allow_sub_accounts: 123,
      level: 123,
      created_at: '2026-01-27T15:57:32.807Z',
      updated_at: '2026-01-27T15:57:32.807Z',
      deleted_at: 'example',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
  static findByCompanyId(companyId) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findByCompanyId à implémenter');
}
}

// Export du DTO
module.exports = ChartOfAccountDTO;

// Export des métadonnées
module.exports.schema = ChartOfAccountDTO.getSchema();
module.exports.metadata = ChartOfAccountDTO.getMetadata();
module.exports.properties = 'id', 'company_id', 'account_number', 'account_name', 'account_type', 'sub_account_type', 'description', 'parent_account_id', 'is_active', 'is_taxable', 'allow_sub_accounts', 'level', 'created_at', 'updated_at', 'deleted_at';
module.exports.relationships = 'compagnies', 'charts_of_accounts';

// Export des méthodes utilitaires
module.exports.fromDatabase = ChartOfAccountDTO.fromDatabase;
module.exports.fromAPI = ChartOfAccountDTO.fromAPI;
module.exports.getExample = ChartOfAccountDTO.getExample;
