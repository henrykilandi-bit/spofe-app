/**
 * 📋 DTO ApprovalAuditLog - Généré automatiquement depuis approval_audit_logs
 * 
 * @generated 2026-01-27T15:57:32.805Z
 * @source MySQL Table: approval_audit_logs
 * @description DTO pour la table approval_audit_logs
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class ApprovalAuditLogDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.pending_approval_id = this.validatePendingApprovalId(data.pending_approval_id) ;
    this.action = this.validateAction(data.action) || submitted;
    this.action_by = this.validateActionBy(data.action_by) ;
    this.action_date = this.validateActionDate(data.action_date) || current_timestamp();
    this.comment = this.validateComment(data.comment) ;
    this.metadata = this.validateMetadata(data.metadata) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.805Z',
      source: 'approval_audit_logs',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 7,
      relationships: 1
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get pending_approval_id() { return this.pending_approval_id; }
  get action() { return this.action; }
  get action_by() { return this.action_by; }
  get action_date() { return this.action_date; }
  get comment() { return this.comment; }
  get metadata() { return this.metadata; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set pending_approval_id(value) { this.pending_approval_id = this.validatePendingApprovalId(value); }
  set action(value) { this.action = this.validateAction(value); }
  set action_by(value) { this.action_by = this.validateActionBy(value); }
  set action_date(value) { this.action_date = this.validateActionDate(value); }
  set comment(value) { this.comment = this.validateComment(value); }
  set metadata(value) { this.metadata = this.validateMetadata(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validatePendingApprovalId(value) { typeof value === "number" && !isNaN(value) }
  validateAction(value) { typeof value === "string" }
  validateActionBy(value) { typeof value === "number" && !isNaN(value) }
  validateActionDate(value) { typeof value === "string" }
  validateComment(value) { typeof value === "string" }
  validateMetadata(value) { typeof value === "string" }

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
    if (this.pending_approval_id === undefined || this.pending_approval_id === null || this.pending_approval_id === '') {
      errors.push({
        field: 'pending_approval_id',
        message: 'pending_approval_id est requis',
        value: this.pending_approval_id
      });
    }
    if (this.action_by === undefined || this.action_by === null || this.action_by === '') {
      errors.push({
        field: 'action_by',
        message: 'action_by est requis',
        value: this.action_by
      });
    }
    
    if (this.id !== undefined && !this.validateId(this.id)) {
      errors.push({
        field: 'id',
        message: 'Format invalide pour id',
        value: this.id
      });
    }
    if (this.pending_approval_id !== undefined && !this.validatePendingApprovalId(this.pending_approval_id)) {
      errors.push({
        field: 'pending_approval_id',
        message: 'Format invalide pour pending_approval_id',
        value: this.pending_approval_id
      });
    }
    if (this.action !== undefined && !this.validateAction(this.action)) {
      errors.push({
        field: 'action',
        message: 'Format invalide pour action',
        value: this.action
      });
    }
    if (this.action_by !== undefined && !this.validateActionBy(this.action_by)) {
      errors.push({
        field: 'action_by',
        message: 'Format invalide pour action_by',
        value: this.action_by
      });
    }
    if (this.action_date !== undefined && !this.validateActionDate(this.action_date)) {
      errors.push({
        field: 'action_date',
        message: 'Format invalide pour action_date',
        value: this.action_date
      });
    }
    if (this.comment !== undefined && !this.validateComment(this.comment)) {
      errors.push({
        field: 'comment',
        message: 'Format invalide pour comment',
        value: this.comment
      });
    }
    if (this.metadata !== undefined && !this.validateMetadata(this.metadata)) {
      errors.push({
        field: 'metadata',
        message: 'Format invalide pour metadata',
        value: this.metadata
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
      pending_approval_id: this.pending_approval_id,
      action: this.action,
      action_by: this.action_by,
      action_date: this.action_date,
      comment: this.comment,
      metadata: this.metadata,
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
    return new ApprovalAuditLogDTO({
      id: dbRow.id,
      pending_approval_id: dbRow.pending_approval_id,
      action: dbRow.action,
      action_by: dbRow.action_by,
      action_date: dbRow.action_date,
      comment: dbRow.comment,
      metadata: dbRow.metadata,
    });
  }

  // Statique: créer depuis l'API (camelCase vers snake_case)
  static fromAPI(apiData) {
    const dbData = {};
    
    for (const [key, value] of Object.entries(apiData)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      dbData[snakeKey] = value;
    }
    
    return new ApprovalAuditLogDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      pending_approval_id: { type: 'number', required: true, description: 'Propriété pending_approval_id' },
      action: { type: 'string', required: false, description: 'Propriété action' },
      action_by: { type: 'number', required: true, description: 'Propriété action_by' },
      action_date: { type: 'string', required: false, description: 'Propriété action_date' },
      comment: { type: 'string', required: false, description: 'Propriété comment' },
      metadata: { type: 'string', required: false, description: 'Propriété metadata' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'ApprovalAuditLog',
      table: 'approval_audit_logs',
      generated: '2026-01-27T15:57:32.805Z',
      properties: 7,
      relationships: 1,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new ApprovalAuditLogDTO({
      id: 1,
      pending_approval_id: 1,
      action: 'example',
      action_by: 123,
      action_date: 'example',
      comment: 'example',
      metadata: 'example',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = ApprovalAuditLogDTO;

// Export des métadonnées
module.exports.schema = ApprovalAuditLogDTO.getSchema();
module.exports.metadata = ApprovalAuditLogDTO.getMetadata();
module.exports.properties = 'id', 'pending_approval_id', 'action', 'action_by', 'action_date', 'comment', 'metadata';
module.exports.relationships = 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = ApprovalAuditLogDTO.fromDatabase;
module.exports.fromAPI = ApprovalAuditLogDTO.fromAPI;
module.exports.getExample = ApprovalAuditLogDTO.getExample;
