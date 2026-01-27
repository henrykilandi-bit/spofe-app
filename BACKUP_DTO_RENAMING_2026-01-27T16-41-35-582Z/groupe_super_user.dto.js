/**
 * 📋 DTO GroupeSuperUser - Généré automatiquement depuis groupe_super_users
 * 
 * @generated 2026-01-27T15:57:32.786Z
 * @source MySQL Table: groupe_super_users
 * @description DTO pour groupe_super_user
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class GroupeSuperUserDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.user_id = this.validateUserId(data.user_id) ;
    this.groupe_id = this.validateGroupeId(data.groupe_id) ;
    this.role = this.validateRole(data.role) || approver;
    this.permissions = this.validatePermissions(data.permissions) ;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();
    this.created_by = this.validateCreatedBy(data.created_by) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.786Z',
      source: 'groupe_super_users',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 8,
      relationships: 2
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get groupe_id() { return this.groupe_id; }
  get role() { return this.role; }
  get permissions() { return this.permissions; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get created_by() { return this.created_by; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_id(value) { this.user_id = this.validateUserId(value); }
  set groupe_id(value) { this.groupe_id = this.validateGroupeId(value); }
  set role(value) { this.role = this.validateRole(value); }
  set permissions(value) { this.permissions = this.validatePermissions(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }
  set created_by(value) { this.created_by = this.validateCreatedBy(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateGroupeId(value) { typeof value === "number" && !isNaN(value) }
  validateRole(value) { typeof value === "string" }
  validatePermissions(value) { typeof value === "string" }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }
  validateCreatedBy(value) { typeof value === "number" && !isNaN(value) }

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
    if (this.user_id === undefined || this.user_id === null || this.user_id === '') {
      errors.push({
        field: 'user_id',
        message: 'user_id est requis',
        value: this.user_id
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
    if (this.user_id !== undefined && !this.validateUserId(this.user_id)) {
      errors.push({
        field: 'user_id',
        message: 'Format invalide pour user_id',
        value: this.user_id
      });
    }
    if (this.groupe_id !== undefined && !this.validateGroupeId(this.groupe_id)) {
      errors.push({
        field: 'groupe_id',
        message: 'Format invalide pour groupe_id',
        value: this.groupe_id
      });
    }
    if (this.role !== undefined && !this.validateRole(this.role)) {
      errors.push({
        field: 'role',
        message: 'Format invalide pour role',
        value: this.role
      });
    }
    if (this.permissions !== undefined && !this.validatePermissions(this.permissions)) {
      errors.push({
        field: 'permissions',
        message: 'Format invalide pour permissions',
        value: this.permissions
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
    if (this.created_by !== undefined && !this.validateCreatedBy(this.created_by)) {
      errors.push({
        field: 'created_by',
        message: 'Format invalide pour created_by',
        value: this.created_by
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
      user_id: this.user_id,
      groupe_id: this.groupe_id,
      role: this.role,
      permissions: this.permissions,
      created_at: this.created_at,
      updated_at: this.updated_at,
      created_by: this.created_by,
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
    return new GroupeSuperUserDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      groupe_id: dbRow.groupe_id,
      role: dbRow.role,
      permissions: dbRow.permissions,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      created_by: dbRow.created_by,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new GroupeSuperUserDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_id: { type: 'number', required: true, description: 'ID de l'utilisateur' },
      groupe_id: { type: 'number', required: true, description: 'Propriété groupe_id' },
      role: { type: 'string', required: false, description: 'Propriété role' },
      permissions: { type: 'string', required: false, description: 'Propriété permissions' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
      created_by: { type: 'number', required: false, description: 'Propriété created_by' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'GroupeSuperUser',
      table: 'groupe_super_users',
      generated: '2026-01-27T15:57:32.786Z',
      properties: 8,
      relationships: 2,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new GroupeSuperUserDTO({
      id: 1,
      user_id: 1,
      groupe_id: 1,
      role: 'example',
      permissions: 'example',
      created_at: '2026-01-27T15:57:32.788Z',
      updated_at: '2026-01-27T15:57:32.788Z',
      created_by: 123,
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = GroupeSuperUserDTO;

// Export des métadonnées
module.exports.schema = GroupeSuperUserDTO.getSchema();
module.exports.metadata = GroupeSuperUserDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'groupe_id', 'role', 'permissions', 'created_at', 'updated_at', 'created_by';
module.exports.relationships = 'users', 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = GroupeSuperUserDTO.fromDatabase;
module.exports.fromAPI = GroupeSuperUserDTO.fromAPI;
module.exports.getExample = GroupeSuperUserDTO.getExample;
