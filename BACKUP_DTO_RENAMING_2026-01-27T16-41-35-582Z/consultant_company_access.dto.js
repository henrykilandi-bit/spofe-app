/**
 * 📋 DTO ConsultantCompanyAccess - Généré automatiquement depuis consultant_company_access
 * 
 * @generated 2026-01-27T15:57:32.798Z
 * @source MySQL Table: consultant_company_access
 * @description DTO pour la table consultant_company_access
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class ConsultantCompanyAccessDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.consultant_id = this.validateConsultantId(data.consultant_id) ;
    this.compagnie_id = this.validateCompagnieId(data.compagnie_id) ;
    this.groupe_id = this.validateGroupeId(data.groupe_id) ;
    this.access_level = this.validateAccessLevel(data.access_level) || read;
    this.specific_permissions = this.validateSpecificPermissions(data.specific_permissions) ;
    this.reason = this.validateReason(data.reason) ;
    this.approved_by = this.validateApprovedBy(data.approved_by) ;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();
    this.expires_at = this.validateExpiresAt(data.expires_at) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.798Z',
      source: 'consultant_company_access',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 11,
      relationships: 4
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get consultant_id() { return this.consultant_id; }
  get compagnie_id() { return this.compagnie_id; }
  get groupe_id() { return this.groupe_id; }
  get access_level() { return this.access_level; }
  get specific_permissions() { return this.specific_permissions; }
  get reason() { return this.reason; }
  get approved_by() { return this.approved_by; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get expires_at() { return this.expires_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set consultant_id(value) { this.consultant_id = this.validateConsultantId(value); }
  set compagnie_id(value) { this.compagnie_id = this.validateCompagnieId(value); }
  set groupe_id(value) { this.groupe_id = this.validateGroupeId(value); }
  set access_level(value) { this.access_level = this.validateAccessLevel(value); }
  set specific_permissions(value) { this.specific_permissions = this.validateSpecificPermissions(value); }
  set reason(value) { this.reason = this.validateReason(value); }
  set approved_by(value) { this.approved_by = this.validateApprovedBy(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }
  set expires_at(value) { this.expires_at = this.validateExpiresAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateConsultantId(value) { typeof value === "number" && !isNaN(value) }
  validateCompagnieId(value) { typeof value === "number" && !isNaN(value) }
  validateGroupeId(value) { typeof value === "number" && !isNaN(value) }
  validateAccessLevel(value) { typeof value === "string" }
  validateSpecificPermissions(value) { typeof value === "string" }
  validateReason(value) { typeof value === "string" }
  validateApprovedBy(value) { typeof value === "number" && !isNaN(value) }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }
  validateExpiresAt(value) { typeof value === "string" }

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
    if (this.consultant_id === undefined || this.consultant_id === null || this.consultant_id === '') {
      errors.push({
        field: 'consultant_id',
        message: 'consultant_id est requis',
        value: this.consultant_id
      });
    }
    if (this.compagnie_id === undefined || this.compagnie_id === null || this.compagnie_id === '') {
      errors.push({
        field: 'compagnie_id',
        message: 'compagnie_id est requis',
        value: this.compagnie_id
      });
    }
    if (this.groupe_id === undefined || this.groupe_id === null || this.groupe_id === '') {
      errors.push({
        field: 'groupe_id',
        message: 'groupe_id est requis',
        value: this.groupe_id
      });
    }
    
    if (this.id !== undefined && !this.validateId(this.id)) {
      errors.push({
        field: 'id',
        message: 'Format invalide pour id',
        value: this.id
      });
    }
    if (this.consultant_id !== undefined && !this.validateConsultantId(this.consultant_id)) {
      errors.push({
        field: 'consultant_id',
        message: 'Format invalide pour consultant_id',
        value: this.consultant_id
      });
    }
    if (this.compagnie_id !== undefined && !this.validateCompagnieId(this.compagnie_id)) {
      errors.push({
        field: 'compagnie_id',
        message: 'Format invalide pour compagnie_id',
        value: this.compagnie_id
      });
    }
    if (this.groupe_id !== undefined && !this.validateGroupeId(this.groupe_id)) {
      errors.push({
        field: 'groupe_id',
        message: 'Format invalide pour groupe_id',
        value: this.groupe_id
      });
    }
    if (this.access_level !== undefined && !this.validateAccessLevel(this.access_level)) {
      errors.push({
        field: 'access_level',
        message: 'Format invalide pour access_level',
        value: this.access_level
      });
    }
    if (this.specific_permissions !== undefined && !this.validateSpecificPermissions(this.specific_permissions)) {
      errors.push({
        field: 'specific_permissions',
        message: 'Format invalide pour specific_permissions',
        value: this.specific_permissions
      });
    }
    if (this.reason !== undefined && !this.validateReason(this.reason)) {
      errors.push({
        field: 'reason',
        message: 'Format invalide pour reason',
        value: this.reason
      });
    }
    if (this.approved_by !== undefined && !this.validateApprovedBy(this.approved_by)) {
      errors.push({
        field: 'approved_by',
        message: 'Format invalide pour approved_by',
        value: this.approved_by
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
    if (this.expires_at !== undefined && !this.validateExpiresAt(this.expires_at)) {
      errors.push({
        field: 'expires_at',
        message: 'Format invalide pour expires_at',
        value: this.expires_at
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
      consultant_id: this.consultant_id,
      compagnie_id: this.compagnie_id,
      groupe_id: this.groupe_id,
      access_level: this.access_level,
      specific_permissions: this.specific_permissions,
      reason: this.reason,
      approved_by: this.approved_by,
      created_at: this.created_at,
      updated_at: this.updated_at,
      expires_at: this.expires_at,
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
    return new ConsultantCompanyAccessDTO({
      id: dbRow.id,
      consultant_id: dbRow.consultant_id,
      compagnie_id: dbRow.compagnie_id,
      groupe_id: dbRow.groupe_id,
      access_level: dbRow.access_level,
      specific_permissions: dbRow.specific_permissions,
      reason: dbRow.reason,
      approved_by: dbRow.approved_by,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      expires_at: dbRow.expires_at,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new ConsultantCompanyAccessDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      consultant_id: { type: 'number', required: true, description: 'Propriété consultant_id' },
      compagnie_id: { type: 'number', required: true, description: 'Propriété compagnie_id' },
      groupe_id: { type: 'number', required: true, description: 'Propriété groupe_id' },
      access_level: { type: 'string', required: false, description: 'Propriété access_level' },
      specific_permissions: { type: 'string', required: false, description: 'Propriété specific_permissions' },
      reason: { type: 'string', required: false, description: 'Propriété reason' },
      approved_by: { type: 'number', required: false, description: 'Propriété approved_by' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
      expires_at: { type: 'string', required: false, description: 'Date d'expiration' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'ConsultantCompanyAccess',
      table: 'consultant_company_access',
      generated: '2026-01-27T15:57:32.798Z',
      properties: 11,
      relationships: 4,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new ConsultantCompanyAccessDTO({
      id: 1,
      consultant_id: 1,
      compagnie_id: 1,
      groupe_id: 1,
      access_level: 'example',
      specific_permissions: 'example',
      reason: 'example',
      approved_by: 123,
      created_at: '2026-01-27T15:57:32.798Z',
      updated_at: '2026-01-27T15:57:32.798Z',
      expires_at: 'example',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = ConsultantCompanyAccessDTO;

// Export des métadonnées
module.exports.schema = ConsultantCompanyAccessDTO.getSchema();
module.exports.metadata = ConsultantCompanyAccessDTO.getMetadata();
module.exports.properties = 'id', 'consultant_id', 'compagnie_id', 'groupe_id', 'access_level', 'specific_permissions', 'reason', 'approved_by', 'created_at', 'updated_at', 'expires_at';
module.exports.relationships = 'users', 'compagnies', 'groupes_entreprises', 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = ConsultantCompanyAccessDTO.fromDatabase;
module.exports.fromAPI = ConsultantCompanyAccessDTO.fromAPI;
module.exports.getExample = ConsultantCompanyAccessDTO.getExample;
