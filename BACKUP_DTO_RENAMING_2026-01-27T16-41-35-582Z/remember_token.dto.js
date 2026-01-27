/**
 * 📋 DTO RememberToken - Généré automatiquement depuis remember_tokens
 * 
 * @generated 2026-01-27T15:57:32.792Z
 * @source MySQL Table: remember_tokens
 * @description DTO pour la table remember_tokens
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class RememberTokenDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.user_id = this.validateUserId(data.user_id) ;
    this.token = this.validateToken(data.token) ;
    this.expires_at = this.validateExpiresAt(data.expires_at) || current_timestamp();
    this.last_used_at = this.validateLastUsedAt(data.last_used_at) ;
    this.ip_address = this.validateIpAddress(data.ip_address) ;
    this.user_agent = this.validateUserAgent(data.user_agent) ;
    this.is_active = this.validateIsActive(data.is_active) || 1;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.792Z',
      source: 'remember_tokens',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 9,
      relationships: 1
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get token() { return this.token; }
  get expires_at() { return this.expires_at; }
  get last_used_at() { return this.last_used_at; }
  get ip_address() { return this.ip_address; }
  get user_agent() { return this.user_agent; }
  get is_active() { return this.is_active; }
  get created_at() { return this.created_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_id(value) { this.user_id = this.validateUserId(value); }
  set token(value) { this.token = this.validateToken(value); }
  set expires_at(value) { this.expires_at = this.validateExpiresAt(value); }
  set last_used_at(value) { this.last_used_at = this.validateLastUsedAt(value); }
  set ip_address(value) { this.ip_address = this.validateIpAddress(value); }
  set user_agent(value) { this.user_agent = this.validateUserAgent(value); }
  set is_active(value) { this.is_active = this.validateIsActive(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateToken(value) { typeof value === "string" && value.length >= 10 }
  validateExpiresAt(value) { typeof value === "string" }
  validateLastUsedAt(value) { typeof value === "string" }
  validateIpAddress(value) { typeof value === "string" }
  validateUserAgent(value) { typeof value === "string" }
  validateIsActive(value) { typeof value === "number" && !isNaN(value) }
  validateCreatedAt(value) { typeof value === "string" }

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
    if (this.last_used_at !== undefined && !this.validateLastUsedAt(this.last_used_at)) {
      errors.push({
        field: 'last_used_at',
        message: 'Format invalide pour last_used_at',
        value: this.last_used_at
      });
    }
    if (this.ip_address !== undefined && !this.validateIpAddress(this.ip_address)) {
      errors.push({
        field: 'ip_address',
        message: 'Format invalide pour ip_address',
        value: this.ip_address
      });
    }
    if (this.user_agent !== undefined && !this.validateUserAgent(this.user_agent)) {
      errors.push({
        field: 'user_agent',
        message: 'Format invalide pour user_agent',
        value: this.user_agent
      });
    }
    if (this.is_active !== undefined && !this.validateIsActive(this.is_active)) {
      errors.push({
        field: 'is_active',
        message: 'Format invalide pour is_active',
        value: this.is_active
      });
    }
    if (this.created_at !== undefined && !this.validateCreatedAt(this.created_at)) {
      errors.push({
        field: 'created_at',
        message: 'Format invalide pour created_at',
        value: this.created_at
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
      last_used_at: this.last_used_at,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      is_active: this.is_active,
      created_at: this.created_at,
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
    return new RememberTokenDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      token: dbRow.token,
      expires_at: dbRow.expires_at,
      last_used_at: dbRow.last_used_at,
      ip_address: dbRow.ip_address,
      user_agent: dbRow.user_agent,
      is_active: dbRow.is_active,
      created_at: dbRow.created_at,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new RememberTokenDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_id: { type: 'number', required: true, description: 'ID de l'utilisateur' },
      token: { type: 'string', required: true, description: 'Jeton d'authentification' },
      expires_at: { type: 'string', required: false, description: 'Date d'expiration' },
      last_used_at: { type: 'string', required: false, description: 'Propriété last_used_at' },
      ip_address: { type: 'string', required: false, description: 'Propriété ip_address' },
      user_agent: { type: 'string', required: false, description: 'Propriété user_agent' },
      is_active: { type: 'number', required: false, description: 'Indique si l'élément est actif' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'RememberToken',
      table: 'remember_tokens',
      generated: '2026-01-27T15:57:32.792Z',
      properties: 9,
      relationships: 1,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new RememberTokenDTO({
      id: 1,
      user_id: 1,
      token: 'example',
      expires_at: 'example',
      last_used_at: 'example',
      ip_address: 'example',
      user_agent: 'example',
      is_active: true,
      created_at: '2026-01-27T15:57:32.792Z',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = RememberTokenDTO;

// Export des métadonnées
module.exports.schema = RememberTokenDTO.getSchema();
module.exports.metadata = RememberTokenDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'token', 'expires_at', 'last_used_at', 'ip_address', 'user_agent', 'is_active', 'created_at';
module.exports.relationships = 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = RememberTokenDTO.fromDatabase;
module.exports.fromAPI = RememberTokenDTO.fromAPI;
module.exports.getExample = RememberTokenDTO.getExample;
