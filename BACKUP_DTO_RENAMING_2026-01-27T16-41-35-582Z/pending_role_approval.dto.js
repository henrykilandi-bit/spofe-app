/**
 * 📋 DTO PendingRoleApproval - Généré automatiquement depuis pending_role_approvals
 * 
 * @generated 2026-01-27T15:57:32.802Z
 * @source MySQL Table: pending_role_approvals
 * @description DTO pour la table pending_role_approvals
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class PendingRoleApprovalDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.user_data = this.validateUserData(data.user_data) ;
    this.requested_role = this.validateRequestedRole(data.requested_role) ;
    this.approver_role = this.validateApproverRole(data.approver_role) ;
    this.status = this.validateStatus(data.status) || pending;
    this.requires_group = this.validateRequiresGroup(data.requires_group) || 0;
    this.requires_company = this.validateRequiresCompany(data.requires_company) || 0;
    this.requested_by = this.validateRequestedBy(data.requested_by) ;
    this.approved_by = this.validateApprovedBy(data.approved_by) ;
    this.approval_date = this.validateApprovalDate(data.approval_date) ;
    this.rejection_reason = this.validateRejectionReason(data.rejection_reason) ;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.802Z',
      source: 'pending_role_approvals',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 13,
      relationships: 2
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_data() { return this.user_data; }
  get requested_role() { return this.requested_role; }
  get approver_role() { return this.approver_role; }
  get status() { return this.status; }
  get requires_group() { return this.requires_group; }
  get requires_company() { return this.requires_company; }
  get requested_by() { return this.requested_by; }
  get approved_by() { return this.approved_by; }
  get approval_date() { return this.approval_date; }
  get rejection_reason() { return this.rejection_reason; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_data(value) { this.user_data = this.validateUserData(value); }
  set requested_role(value) { this.requested_role = this.validateRequestedRole(value); }
  set approver_role(value) { this.approver_role = this.validateApproverRole(value); }
  set status(value) { this.status = this.validateStatus(value); }
  set requires_group(value) { this.requires_group = this.validateRequiresGroup(value); }
  set requires_company(value) { this.requires_company = this.validateRequiresCompany(value); }
  set requested_by(value) { this.requested_by = this.validateRequestedBy(value); }
  set approved_by(value) { this.approved_by = this.validateApprovedBy(value); }
  set approval_date(value) { this.approval_date = this.validateApprovalDate(value); }
  set rejection_reason(value) { this.rejection_reason = this.validateRejectionReason(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserData(value) { typeof value === "string" }
  validateRequestedRole(value) { typeof value === "string" }
  validateApproverRole(value) { typeof value === "string" }
  validateStatus(value) { typeof value === "string" }
  validateRequiresGroup(value) { typeof value === "number" && !isNaN(value) }
  validateRequiresCompany(value) { typeof value === "number" && !isNaN(value) }
  validateRequestedBy(value) { typeof value === "number" && !isNaN(value) }
  validateApprovedBy(value) { typeof value === "number" && !isNaN(value) }
  validateApprovalDate(value) { typeof value === "string" }
  validateRejectionReason(value) { typeof value === "string" }
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
    if (this.user_data === undefined || this.user_data === null || this.user_data === '') {
      errors.push({
        field: 'user_data',
        message: 'user_data est requis',
        value: this.user_data
      });
    }
    if (this.requested_role === undefined || this.requested_role === null || this.requested_role === '') {
      errors.push({
        field: 'requested_role',
        message: 'requested_role est requis',
        value: this.requested_role
      });
    }
    if (this.approver_role === undefined || this.approver_role === null || this.approver_role === '') {
      errors.push({
        field: 'approver_role',
        message: 'approver_role est requis',
        value: this.approver_role
      });
    }
    
    if (this.id !== undefined && !this.validateId(this.id)) {
      errors.push({
        field: 'id',
        message: 'Format invalide pour id',
        value: this.id
      });
    }
    if (this.user_data !== undefined && !this.validateUserData(this.user_data)) {
      errors.push({
        field: 'user_data',
        message: 'Format invalide pour user_data',
        value: this.user_data
      });
    }
    if (this.requested_role !== undefined && !this.validateRequestedRole(this.requested_role)) {
      errors.push({
        field: 'requested_role',
        message: 'Format invalide pour requested_role',
        value: this.requested_role
      });
    }
    if (this.approver_role !== undefined && !this.validateApproverRole(this.approver_role)) {
      errors.push({
        field: 'approver_role',
        message: 'Format invalide pour approver_role',
        value: this.approver_role
      });
    }
    if (this.status !== undefined && !this.validateStatus(this.status)) {
      errors.push({
        field: 'status',
        message: 'Format invalide pour status',
        value: this.status
      });
    }
    if (this.requires_group !== undefined && !this.validateRequiresGroup(this.requires_group)) {
      errors.push({
        field: 'requires_group',
        message: 'Format invalide pour requires_group',
        value: this.requires_group
      });
    }
    if (this.requires_company !== undefined && !this.validateRequiresCompany(this.requires_company)) {
      errors.push({
        field: 'requires_company',
        message: 'Format invalide pour requires_company',
        value: this.requires_company
      });
    }
    if (this.requested_by !== undefined && !this.validateRequestedBy(this.requested_by)) {
      errors.push({
        field: 'requested_by',
        message: 'Format invalide pour requested_by',
        value: this.requested_by
      });
    }
    if (this.approved_by !== undefined && !this.validateApprovedBy(this.approved_by)) {
      errors.push({
        field: 'approved_by',
        message: 'Format invalide pour approved_by',
        value: this.approved_by
      });
    }
    if (this.approval_date !== undefined && !this.validateApprovalDate(this.approval_date)) {
      errors.push({
        field: 'approval_date',
        message: 'Format invalide pour approval_date',
        value: this.approval_date
      });
    }
    if (this.rejection_reason !== undefined && !this.validateRejectionReason(this.rejection_reason)) {
      errors.push({
        field: 'rejection_reason',
        message: 'Format invalide pour rejection_reason',
        value: this.rejection_reason
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
      user_data: this.user_data,
      requested_role: this.requested_role,
      approver_role: this.approver_role,
      status: this.status,
      requires_group: this.requires_group,
      requires_company: this.requires_company,
      requested_by: this.requested_by,
      approved_by: this.approved_by,
      approval_date: this.approval_date,
      rejection_reason: this.rejection_reason,
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
    return new PendingRoleApprovalDTO({
      id: dbRow.id,
      user_data: dbRow.user_data,
      requested_role: dbRow.requested_role,
      approver_role: dbRow.approver_role,
      status: dbRow.status,
      requires_group: dbRow.requires_group,
      requires_company: dbRow.requires_company,
      requested_by: dbRow.requested_by,
      approved_by: dbRow.approved_by,
      approval_date: dbRow.approval_date,
      rejection_reason: dbRow.rejection_reason,
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
    
    return new PendingRoleApprovalDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_data: { type: 'string', required: true, description: 'Propriété user_data' },
      requested_role: { type: 'string', required: true, description: 'Propriété requested_role' },
      approver_role: { type: 'string', required: true, description: 'Propriété approver_role' },
      status: { type: 'string', required: false, description: 'Statut' },
      requires_group: { type: 'number', required: false, description: 'Propriété requires_group' },
      requires_company: { type: 'number', required: false, description: 'Propriété requires_company' },
      requested_by: { type: 'number', required: false, description: 'Propriété requested_by' },
      approved_by: { type: 'number', required: false, description: 'Propriété approved_by' },
      approval_date: { type: 'string', required: false, description: 'Propriété approval_date' },
      rejection_reason: { type: 'string', required: false, description: 'Propriété rejection_reason' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'PendingRoleApproval',
      table: 'pending_role_approvals',
      generated: '2026-01-27T15:57:32.802Z',
      properties: 13,
      relationships: 2,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new PendingRoleApprovalDTO({
      id: 1,
      user_data: 'example',
      requested_role: 'example',
      approver_role: 'example',
      status: 'example',
      requires_group: 123,
      requires_company: 123,
      requested_by: 123,
      approved_by: 123,
      approval_date: 'example',
      rejection_reason: 'example',
      created_at: '2026-01-27T15:57:32.802Z',
      updated_at: '2026-01-27T15:57:32.802Z',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = PendingRoleApprovalDTO;

// Export des métadonnées
module.exports.schema = PendingRoleApprovalDTO.getSchema();
module.exports.metadata = PendingRoleApprovalDTO.getMetadata();
module.exports.properties = 'id', 'user_data', 'requested_role', 'approver_role', 'status', 'requires_group', 'requires_company', 'requested_by', 'approved_by', 'approval_date', 'rejection_reason', 'created_at', 'updated_at';
module.exports.relationships = 'users', 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = PendingRoleApprovalDTO.fromDatabase;
module.exports.fromAPI = PendingRoleApprovalDTO.fromAPI;
module.exports.getExample = PendingRoleApprovalDTO.getExample;
