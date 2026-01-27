/**
 * 📋 DTO SecurityEvent - Généré automatiquement depuis security_events
 * 
 * @generated 2026-01-27T15:57:32.813Z
 * @source MySQL Table: security_events
 * @description DTO pour la table security_events
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class SecurityEventDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.user_id = this.validateUserId(data.user_id) ;
    this.event_type = this.validateEventType(data.event_type) ;
    this.description = this.validateDescription(data.description) ;
    this.ip_address = this.validateIpAddress(data.ip_address) ;
    this.user_agent = this.validateUserAgent(data.user_agent) ;
    this.status = this.validateStatus(data.status) ;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();
    this.deleted_at = this.validateDeletedAt(data.deleted_at) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.813Z',
      source: 'security_events',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 10,
      relationships: 1
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get event_type() { return this.event_type; }
  get description() { return this.description; }
  get ip_address() { return this.ip_address; }
  get user_agent() { return this.user_agent; }
  get status() { return this.status; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get deleted_at() { return this.deleted_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_id(value) { this.user_id = this.validateUserId(value); }
  set event_type(value) { this.event_type = this.validateEventType(value); }
  set description(value) { this.description = this.validateDescription(value); }
  set ip_address(value) { this.ip_address = this.validateIpAddress(value); }
  set user_agent(value) { this.user_agent = this.validateUserAgent(value); }
  set status(value) { this.status = this.validateStatus(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }
  set deleted_at(value) { this.deleted_at = this.validateDeletedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateEventType(value) { typeof value === "string" }
  validateDescription(value) { typeof value === "string" }
  validateIpAddress(value) { typeof value === "string" }
  validateUserAgent(value) { typeof value === "string" }
  validateStatus(value) { typeof value === "string" }
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
    if (this.event_type !== undefined && !this.validateEventType(this.event_type)) {
      errors.push({
        field: 'event_type',
        message: 'Format invalide pour event_type',
        value: this.event_type
      });
    }
    if (this.description !== undefined && !this.validateDescription(this.description)) {
      errors.push({
        field: 'description',
        message: 'Format invalide pour description',
        value: this.description
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
    if (this.status !== undefined && !this.validateStatus(this.status)) {
      errors.push({
        field: 'status',
        message: 'Format invalide pour status',
        value: this.status
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
      user_id: this.user_id,
      event_type: this.event_type,
      description: this.description,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      status: this.status,
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
    return new SecurityEventDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      event_type: dbRow.event_type,
      description: dbRow.description,
      ip_address: dbRow.ip_address,
      user_agent: dbRow.user_agent,
      status: dbRow.status,
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
    
    return new SecurityEventDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_id: { type: 'number', required: false, description: 'ID de l'utilisateur' },
      event_type: { type: 'string', required: false, description: 'Propriété event_type' },
      description: { type: 'string', required: false, description: 'Description' },
      ip_address: { type: 'string', required: false, description: 'Propriété ip_address' },
      user_agent: { type: 'string', required: false, description: 'Propriété user_agent' },
      status: { type: 'string', required: false, description: 'Statut' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
      deleted_at: { type: 'string', required: false, description: 'Date de suppression' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'SecurityEvent',
      table: 'security_events',
      generated: '2026-01-27T15:57:32.813Z',
      properties: 10,
      relationships: 1,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new SecurityEventDTO({
      id: 1,
      user_id: 1,
      event_type: 'example',
      description: 'example',
      ip_address: 'example',
      user_agent: 'example',
      status: 'example',
      created_at: '2026-01-27T15:57:32.813Z',
      updated_at: '2026-01-27T15:57:32.813Z',
      deleted_at: 'example',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = SecurityEventDTO;

// Export des métadonnées
module.exports.schema = SecurityEventDTO.getSchema();
module.exports.metadata = SecurityEventDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'event_type', 'description', 'ip_address', 'user_agent', 'status', 'created_at', 'updated_at', 'deleted_at';
module.exports.relationships = 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = SecurityEventDTO.fromDatabase;
module.exports.fromAPI = SecurityEventDTO.fromAPI;
module.exports.getExample = SecurityEventDTO.getExample;
