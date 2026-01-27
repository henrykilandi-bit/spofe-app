/**
 * 📋 DTO CompagniePermissionBackup - Généré automatiquement depuis compagnies_permissions_backup
 * 
 * @generated 2026-01-27T15:57:32.797Z
 * @source MySQL Table: compagnies_permissions_backup
 * @description DTO pour la table compagnies_permissions_backup
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class CompagniePermissionBackupDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) || 0;
    this.user_id = this.validateUserId(data.user_id) ;
    this.compagnie_id = this.validateCompagnieId(data.compagnie_id) ;
    this.permission = this.validatePermission(data.permission) ;
    this.granted_by = this.validateGrantedBy(data.granted_by) ;
    this.granted_at = this.validateGrantedAt(data.granted_at) || current_timestamp();
    this.expires_at = this.validateExpiresAt(data.expires_at) ;
    this.is_active = this.validateIsActive(data.is_active) || 1;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.797Z',
      source: 'compagnies_permissions_backup',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 8,
      relationships: 0
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get compagnie_id() { return this.compagnie_id; }
  get permission() { return this.permission; }
  get granted_by() { return this.granted_by; }
  get granted_at() { return this.granted_at; }
  get expires_at() { return this.expires_at; }
  get is_active() { return this.is_active; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_id(value) { this.user_id = this.validateUserId(value); }
  set compagnie_id(value) { this.compagnie_id = this.validateCompagnieId(value); }
  set permission(value) { this.permission = this.validatePermission(value); }
  set granted_by(value) { this.granted_by = this.validateGrantedBy(value); }
  set granted_at(value) { this.granted_at = this.validateGrantedAt(value); }
  set expires_at(value) { this.expires_at = this.validateExpiresAt(value); }
  set is_active(value) { this.is_active = this.validateIsActive(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateCompagnieId(value) { typeof value === "number" && !isNaN(value) }
  validatePermission(value) { typeof value === "string" }
  validateGrantedBy(value) { typeof value === "number" && !isNaN(value) }
  validateGrantedAt(value) { typeof value === "string" }
  validateExpiresAt(value) { typeof value === "string" }
  validateIsActive(value) { typeof value === "number" && !isNaN(value) }

  // Validation complète avec messages d'erreur détaillés
  validate() {
    const errors = [];
    if (this.user_id === undefined || this.user_id === null || this.user_id === '') {
      errors.push({
        field: 'user_id',
        message: 'user_id est requis',
        value: this.user_id
      });
    }
    if (this.compagnie_id === undefined || this.compagnie_id === null || this.compagnie_id === '') {
      errors.push({
        field: 'compagnie_id',
        message: 'compagnie_id est requis',
        value: this.compagnie_id
      });
    }
    if (this.permission === undefined || this.permission === null || this.permission === '') {
      errors.push({
        field: 'permission',
        message: 'permission est requis',
        value: this.permission
      });
    }
    if (this.granted_by === undefined || this.granted_by === null || this.granted_by === '') {
      errors.push({
        field: 'granted_by',
        message: 'granted_by est requis',
        value: this.granted_by
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
    if (this.compagnie_id !== undefined && !this.validateCompagnieId(this.compagnie_id)) {
      errors.push({
        field: 'compagnie_id',
        message: 'Format invalide pour compagnie_id',
        value: this.compagnie_id
      });
    }
    if (this.permission !== undefined && !this.validatePermission(this.permission)) {
      errors.push({
        field: 'permission',
        message: 'Format invalide pour permission',
        value: this.permission
      });
    }
    if (this.granted_by !== undefined && !this.validateGrantedBy(this.granted_by)) {
      errors.push({
        field: 'granted_by',
        message: 'Format invalide pour granted_by',
        value: this.granted_by
      });
    }
    if (this.granted_at !== undefined && !this.validateGrantedAt(this.granted_at)) {
      errors.push({
        field: 'granted_at',
        message: 'Format invalide pour granted_at',
        value: this.granted_at
      });
    }
    if (this.expires_at !== undefined && !this.validateExpiresAt(this.expires_at)) {
      errors.push({
        field: 'expires_at',
        message: 'Format invalide pour expires_at',
        value: this.expires_at
      });
    }
    if (this.is_active !== undefined && !this.validateIsActive(this.is_active)) {
      errors.push({
        field: 'is_active',
        message: 'Format invalide pour is_active',
        value: this.is_active
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
      compagnie_id: this.compagnie_id,
      permission: this.permission,
      granted_by: this.granted_by,
      granted_at: this.granted_at,
      expires_at: this.expires_at,
      is_active: this.is_active,
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
    return new CompagniePermissionBackupDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      compagnie_id: dbRow.compagnie_id,
      permission: dbRow.permission,
      granted_by: dbRow.granted_by,
      granted_at: dbRow.granted_at,
      expires_at: dbRow.expires_at,
      is_active: dbRow.is_active,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new CompagniePermissionBackupDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: false, description: 'Identifiant unique' },
      user_id: { type: 'number', required: true, description: 'ID de l'utilisateur' },
      compagnie_id: { type: 'number', required: true, description: 'Propriété compagnie_id' },
      permission: { type: 'string', required: true, description: 'Propriété permission' },
      granted_by: { type: 'number', required: true, description: 'Propriété granted_by' },
      granted_at: { type: 'string', required: false, description: 'Propriété granted_at' },
      expires_at: { type: 'string', required: false, description: 'Date d'expiration' },
      is_active: { type: 'number', required: false, description: 'Indique si l'élément est actif' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'CompagniePermissionBackup',
      table: 'compagnies_permissions_backup',
      generated: '2026-01-27T15:57:32.797Z',
      properties: 8,
      relationships: 0,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new CompagniePermissionBackupDTO({
      id: 1,
      user_id: 1,
      compagnie_id: 1,
      permission: 'example',
      granted_by: 123,
      granted_at: 'example',
      expires_at: 'example',
      is_active: true,
    });
  }

  // Méthodes de recherche
  
}

// Export du DTO
module.exports = CompagniePermissionBackupDTO;

// Export des métadonnées
module.exports.schema = CompagniePermissionBackupDTO.getSchema();
module.exports.metadata = CompagniePermissionBackupDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'compagnie_id', 'permission', 'granted_by', 'granted_at', 'expires_at', 'is_active';
module.exports.relationships = ;

// Export des méthodes utilitaires
module.exports.fromDatabase = CompagniePermissionBackupDTO.fromDatabase;
module.exports.fromAPI = CompagniePermissionBackupDTO.fromAPI;
module.exports.getExample = CompagniePermissionBackupDTO.getExample;
