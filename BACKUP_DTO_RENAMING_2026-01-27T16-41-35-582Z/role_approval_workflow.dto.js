/**
 * 📋 DTO RoleApprovalWorkflow - Généré automatiquement depuis role_approval_workflow
 * 
 * @generated 2026-01-27T15:57:32.803Z
 * @source MySQL Table: role_approval_workflow
 * @description DTO pour la table role_approval_workflow
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class RoleApprovalWorkflowDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.requested_role = this.validateRequestedRole(data.requested_role) ;
    this.approver_role = this.validateApproverRole(data.approver_role) ;
    this.min_hierarchy_level = this.validateMinHierarchyLevel(data.min_hierarchy_level) ;
    this.requires_group_creation = this.validateRequiresGroupCreation(data.requires_group_creation) || 0;
    this.requires_company_creation = this.validateRequiresCompanyCreation(data.requires_company_creation) || 0;
    this.auto_approve_if_creator_has_role = this.validateAutoApproveIfCreatorHasRole(data.auto_approve_if_creator_has_role) || 0;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.803Z',
      source: 'role_approval_workflow',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 9,
      relationships: 0
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get requested_role() { return this.requested_role; }
  get approver_role() { return this.approver_role; }
  get min_hierarchy_level() { return this.min_hierarchy_level; }
  get requires_group_creation() { return this.requires_group_creation; }
  get requires_company_creation() { return this.requires_company_creation; }
  get auto_approve_if_creator_has_role() { return this.auto_approve_if_creator_has_role; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set requested_role(value) { this.requested_role = this.validateRequestedRole(value); }
  set approver_role(value) { this.approver_role = this.validateApproverRole(value); }
  set min_hierarchy_level(value) { this.min_hierarchy_level = this.validateMinHierarchyLevel(value); }
  set requires_group_creation(value) { this.requires_group_creation = this.validateRequiresGroupCreation(value); }
  set requires_company_creation(value) { this.requires_company_creation = this.validateRequiresCompanyCreation(value); }
  set auto_approve_if_creator_has_role(value) { this.auto_approve_if_creator_has_role = this.validateAutoApproveIfCreatorHasRole(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateRequestedRole(value) { typeof value === "string" }
  validateApproverRole(value) { typeof value === "string" }
  validateMinHierarchyLevel(value) { typeof value === "number" && !isNaN(value) }
  validateRequiresGroupCreation(value) { typeof value === "number" && !isNaN(value) }
  validateRequiresCompanyCreation(value) { typeof value === "number" && !isNaN(value) }
  validateAutoApproveIfCreatorHasRole(value) { typeof value === "number" && !isNaN(value) }
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
    if (this.min_hierarchy_level !== undefined && !this.validateMinHierarchyLevel(this.min_hierarchy_level)) {
      errors.push({
        field: 'min_hierarchy_level',
        message: 'Format invalide pour min_hierarchy_level',
        value: this.min_hierarchy_level
      });
    }
    if (this.requires_group_creation !== undefined && !this.validateRequiresGroupCreation(this.requires_group_creation)) {
      errors.push({
        field: 'requires_group_creation',
        message: 'Format invalide pour requires_group_creation',
        value: this.requires_group_creation
      });
    }
    if (this.requires_company_creation !== undefined && !this.validateRequiresCompanyCreation(this.requires_company_creation)) {
      errors.push({
        field: 'requires_company_creation',
        message: 'Format invalide pour requires_company_creation',
        value: this.requires_company_creation
      });
    }
    if (this.auto_approve_if_creator_has_role !== undefined && !this.validateAutoApproveIfCreatorHasRole(this.auto_approve_if_creator_has_role)) {
      errors.push({
        field: 'auto_approve_if_creator_has_role',
        message: 'Format invalide pour auto_approve_if_creator_has_role',
        value: this.auto_approve_if_creator_has_role
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
      requested_role: this.requested_role,
      approver_role: this.approver_role,
      min_hierarchy_level: this.min_hierarchy_level,
      requires_group_creation: this.requires_group_creation,
      requires_company_creation: this.requires_company_creation,
      auto_approve_if_creator_has_role: this.auto_approve_if_creator_has_role,
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
    return new RoleApprovalWorkflowDTO({
      id: dbRow.id,
      requested_role: dbRow.requested_role,
      approver_role: dbRow.approver_role,
      min_hierarchy_level: dbRow.min_hierarchy_level,
      requires_group_creation: dbRow.requires_group_creation,
      requires_company_creation: dbRow.requires_company_creation,
      auto_approve_if_creator_has_role: dbRow.auto_approve_if_creator_has_role,
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
    
    return new RoleApprovalWorkflowDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      requested_role: { type: 'string', required: true, description: 'Propriété requested_role' },
      approver_role: { type: 'string', required: true, description: 'Propriété approver_role' },
      min_hierarchy_level: { type: 'number', required: false, description: 'Propriété min_hierarchy_level' },
      requires_group_creation: { type: 'number', required: false, description: 'Propriété requires_group_creation' },
      requires_company_creation: { type: 'number', required: false, description: 'Propriété requires_company_creation' },
      auto_approve_if_creator_has_role: { type: 'number', required: false, description: 'Propriété auto_approve_if_creator_has_role' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'RoleApprovalWorkflow',
      table: 'role_approval_workflow',
      generated: '2026-01-27T15:57:32.803Z',
      properties: 9,
      relationships: 0,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new RoleApprovalWorkflowDTO({
      id: 1,
      requested_role: 'example',
      approver_role: 'example',
      min_hierarchy_level: 123,
      requires_group_creation: 123,
      requires_company_creation: 123,
      auto_approve_if_creator_has_role: 123,
      created_at: '2026-01-27T15:57:32.803Z',
      updated_at: '2026-01-27T15:57:32.803Z',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
}

// Export du DTO
module.exports = RoleApprovalWorkflowDTO;

// Export des métadonnées
module.exports.schema = RoleApprovalWorkflowDTO.getSchema();
module.exports.metadata = RoleApprovalWorkflowDTO.getMetadata();
module.exports.properties = 'id', 'requested_role', 'approver_role', 'min_hierarchy_level', 'requires_group_creation', 'requires_company_creation', 'auto_approve_if_creator_has_role', 'created_at', 'updated_at';
module.exports.relationships = ;

// Export des méthodes utilitaires
module.exports.fromDatabase = RoleApprovalWorkflowDTO.fromDatabase;
module.exports.fromAPI = RoleApprovalWorkflowDTO.fromAPI;
module.exports.getExample = RoleApprovalWorkflowDTO.getExample;
