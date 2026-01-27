/**
 * 📋 DTO TokenBlacklist - Généré automatiquement depuis token_blacklists
 * 
 * @generated 2026-01-27T15:57:32.793Z
 * @source MySQL Table: token_blacklists
 * @description DTO pour la table token_blacklists
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class TokenBlacklistDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.user_id = this.validateUserId(data.user_id) ;
    this.token = this.validateToken(data.token) ;
    this.expires_at = this.validateExpiresAt(data.expires_at) || current_timestamp();
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.793Z',
      source: 'token_blacklists',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 6,
      relationships: 1
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get token() { return this.token; }
  get expires_at() { return this.expires_at; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_id(value) { this.user_id = this.validateUserId(value); }
  set token(value) { this.token = this.validateToken(value); }
  set expires_at(value) { this.expires_at = this.validateExpiresAt(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateToken(value) { typeof value === "string" && value.length >= 10 }
  validateExpiresAt(value) { typeof value === "string" }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }

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
    if (this.token === undefined || this.token === null || this.token === '') {
      errors.push({
        field: 'token',
        message: 'token est requis',
        value: this.token
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
    if (this.token !== undefined && !this.validateToken(this.token)) {
      errors.push({
        field: 'token',
        message: 'Format invalide pour token',
        value: this.token
      });
    }
    if (this.expires_at !== undefined && !this.validateExpiresAt(this.expires_at)) {
      errors.push({
        field: 'expires_at',
        message: 'Format invalide pour expires_at',
        value: this.expires_at
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
      token: this.token,
      expires_at: this.expires_at,
      created_at: this.created_at,
      updated_at: this.updated_at,
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
    return new TokenBlacklistDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      token: dbRow.token,
      expires_at: dbRow.expires_at,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new TokenBlacklistDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_id: { type: 'number', required: false, description: 'ID de l'utilisateur' },
      token: { type: 'string', required: true, description: 'Jeton d'authentification' },
      expires_at: { type: 'string', required: false, description: 'Date d'expiration' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'TokenBlacklist',
      table: 'token_blacklists',
      generated: '2026-01-27T15:57:32.793Z',
      properties: 6,
      relationships: 1,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new TokenBlacklistDTO({
      id: 1,
      user_id: 1,
      token: 'example',
      expires_at: 'example',
      created_at: '2026-01-27T15:57:32.794Z',
      updated_at: '2026-01-27T15:57:32.794Z',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = TokenBlacklistDTO;

// Export des métadonnées
module.exports.schema = TokenBlacklistDTO.getSchema();
module.exports.metadata = TokenBlacklistDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'token', 'expires_at', 'created_at', 'updated_at';
module.exports.relationships = 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = TokenBlacklistDTO.fromDatabase;
module.exports.fromAPI = TokenBlacklistDTO.fromAPI;
module.exports.getExample = TokenBlacklistDTO.getExample;
