/**
 * 📋 DTO AuditTrail - Généré automatiquement depuis audit_trails
 * 
 * @generated 2026-01-27T15:48:13.628Z
 * @source MySQL Table: audit_trails
 * @description DTO pour audit_trail
 * @version SPOFE v2.2
 */

class AuditTrailDTO {
  constructor(data = {}) {
    // Propriétés principales
    this.id = data.id ;
    this.user_id = data.user_id ;
    this.entity_type = data.entity_type ;
    this.entity_id = data.entity_id ;
    this.action = data.action ;
    this.old_values = data.old_values ;
    this.new_values = data.new_values ;
    this.ip_address = data.ip_address ;
    this.created_at = data.created_at || current_timestamp();
    this.updated_at = data.updated_at || current_timestamp();

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:48:13.628Z',
      source: 'audit_trails',
      version: 'SPOFE v2.2'
    };
  }

  // Getters
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get entity_type() { return this.entity_type; }
  get entity_id() { return this.entity_id; }
  get action() { return this.action; }
  get old_values() { return this.old_values; }
  get new_values() { return this.new_values; }
  get ip_address() { return this.ip_address; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }

  // Setters avec validation
  set id(value) { if (!this.validateId(value)) { throw new Error('Invalid id'); } this.id = value; }
  set user_id(value) { if (!this.validateUserId(value)) { throw new Error('Invalid user_id'); } this.user_id = value; }
  set entity_type(value) { if (!this.validateEntityType(value)) { throw new Error('Invalid entity_type'); } this.entity_type = value; }
  set entity_id(value) { if (!this.validateEntityId(value)) { throw new Error('Invalid entity_id'); } this.entity_id = value; }
  set action(value) { if (!this.validateAction(value)) { throw new Error('Invalid action'); } this.action = value; }
  set old_values(value) { if (!this.validateOldValues(value)) { throw new Error('Invalid old_values'); } this.old_values = value; }
  set new_values(value) { if (!this.validateNewValues(value)) { throw new Error('Invalid new_values'); } this.new_values = value; }
  set ip_address(value) { if (!this.validateIpAddress(value)) { throw new Error('Invalid ip_address'); } this.ip_address = value; }
  set created_at(value) { if (!this.validateCreatedAt(value)) { throw new Error('Invalid created_at'); } this.created_at = value; }
  set updated_at(value) { if (!this.validateUpdatedAt(value)) { throw new Error('Invalid updated_at'); } this.updated_at = value; }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateEntityType(value) { typeof value === "string" }
  validateEntityId(value) { typeof value === "number" && !isNaN(value) }
  validateAction(value) { typeof value === "string" }
  validateOldValues(value) { typeof value === "string" }
  validateNewValues(value) { typeof value === "string" }
  validateIpAddress(value) { typeof value === "string" }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }

  // Validation complète
  validate() {
    const errors = [];
    if (!this.id) errors.push('id is required');
    if (this.id && !this.validateId(this.id)) errors.push('Invalid id');
    if (this.user_id && !this.validateUserId(this.user_id)) errors.push('Invalid user_id');
    if (this.entity_type && !this.validateEntityType(this.entity_type)) errors.push('Invalid entity_type');
    if (this.entity_id && !this.validateEntityId(this.entity_id)) errors.push('Invalid entity_id');
    if (this.action && !this.validateAction(this.action)) errors.push('Invalid action');
    if (this.old_values && !this.validateOldValues(this.old_values)) errors.push('Invalid old_values');
    if (this.new_values && !this.validateNewValues(this.new_values)) errors.push('Invalid new_values');
    if (this.ip_address && !this.validateIpAddress(this.ip_address)) errors.push('Invalid ip_address');
    if (this.created_at && !this.validateCreatedAt(this.created_at)) errors.push('Invalid created_at');
    if (this.updated_at && !this.validateUpdatedAt(this.updated_at)) errors.push('Invalid updated_at');
    return errors;
  }

  // Conversion objet brut
  toPlainObject() {
    return {
      id: this.id,
      user_id: this.user_id,
      entity_type: this.entity_type,
      entity_id: this.entity_id,
      action: this.action,
      old_values: this.old_values,
      new_values: this.new_values,
      ip_address: this.ip_address,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }

  // Conversion JSON
  toJSON() {
    return JSON.stringify(this.toPlainObject());
  }

  // Statique: créer depuis la base de données
  static fromDatabase(dbRow) {
    return new AuditTrailDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      entity_type: dbRow.entity_type,
      entity_id: dbRow.entity_id,
      action: dbRow.action,
      old_values: dbRow.old_values,
      new_values: dbRow.new_values,
      ip_address: dbRow.ip_address,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
    });
  }

  // Statique: créer pour l'API
  static fromAPI(apiData) {
    return new AuditTrailDTO({
      id: apiData.id,
      user_id: apiData.user_id,
      entity_type: apiData.entity_type,
      entity_id: apiData.entity_id,
      action: apiData.action,
      old_values: apiData.old_values,
      new_values: apiData.new_values,
      ip_address: apiData.ip_address,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
    });
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_id: { type: 'number', required: false, description: 'Propriété user_id de type number' },
      entity_type: { type: 'string', required: false, description: 'Propriété entity_type de type string' },
      entity_id: { type: 'number', required: false, description: 'Propriété entity_id de type number' },
      action: { type: 'string', required: false, description: 'Propriété action de type string' },
      old_values: { type: 'string', required: false, description: 'Propriété old_values de type string' },
      new_values: { type: 'string', required: false, description: 'Propriété new_values de type string' },
      ip_address: { type: 'string', required: false, description: 'Propriété ip_address de type string' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'AuditTrail',
      table: 'audit_trails',
      generated: '2026-01-27T15:48:13.628Z',
      properties: 10,
      relationships: 1
    };
  }
}

// Export du DTO
module.exports = AuditTrailDTO;

// Export des métadonnées
module.exports.schema = AuditTrailDTO.getSchema();
module.exports.metadata = AuditTrailDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'entity_type', 'entity_id', 'action', 'old_values', 'new_values', 'ip_address', 'created_at', 'updated_at';
module.exports.relationships = 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = AuditTrailDTO.fromDatabase;
module.exports.fromAPI = AuditTrailDTO.fromAPI;
