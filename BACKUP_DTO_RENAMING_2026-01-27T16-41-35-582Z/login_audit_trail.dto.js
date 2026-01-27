/**
 * 📋 DTO LoginAuditTrail - Généré automatiquement depuis login_audit_trails
 * 
 * @generated 2026-01-27T15:57:32.811Z
 * @source MySQL Table: login_audit_trails
 * @description DTO pour la table login_audit_trails
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class LoginAuditTrailDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.user_id = this.validateUserId(data.user_id) ;
    this.email = this.validateEmail(data.email) ;
    this.ip_address = this.validateIpAddress(data.ip_address) ;
    this.user_agent = this.validateUserAgent(data.user_agent) ;
    this.login_status = this.validateLoginStatus(data.login_status) ;
    this.failure_reason = this.validateFailureReason(data.failure_reason) ;
    this.two_factor_required = this.validateTwoFactorRequired(data.two_factor_required) || 0;
    this.session_token = this.validateSessionToken(data.session_token) ;
    this.remember_token_used = this.validateRememberTokenUsed(data.remember_token_used) || 0;
    this.login_attempts_before = this.validateLoginAttemptsBefore(data.login_attempts_before) || 0;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.811Z',
      source: 'login_audit_trails',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 12,
      relationships: 1
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get user_id() { return this.user_id; }
  get email() { return this.email; }
  get ip_address() { return this.ip_address; }
  get user_agent() { return this.user_agent; }
  get login_status() { return this.login_status; }
  get failure_reason() { return this.failure_reason; }
  get two_factor_required() { return this.two_factor_required; }
  get session_token() { return this.session_token; }
  get remember_token_used() { return this.remember_token_used; }
  get login_attempts_before() { return this.login_attempts_before; }
  get created_at() { return this.created_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set user_id(value) { this.user_id = this.validateUserId(value); }
  set email(value) { this.email = this.validateEmail(value); }
  set ip_address(value) { this.ip_address = this.validateIpAddress(value); }
  set user_agent(value) { this.user_agent = this.validateUserAgent(value); }
  set login_status(value) { this.login_status = this.validateLoginStatus(value); }
  set failure_reason(value) { this.failure_reason = this.validateFailureReason(value); }
  set two_factor_required(value) { this.two_factor_required = this.validateTwoFactorRequired(value); }
  set session_token(value) { this.session_token = this.validateSessionToken(value); }
  set remember_token_used(value) { this.remember_token_used = this.validateRememberTokenUsed(value); }
  set login_attempts_before(value) { this.login_attempts_before = this.validateLoginAttemptsBefore(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }
  validateEmail(value) { value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) }
  validateIpAddress(value) { typeof value === "string" }
  validateUserAgent(value) { typeof value === "string" }
  validateLoginStatus(value) { typeof value === "string" }
  validateFailureReason(value) { typeof value === "string" }
  validateTwoFactorRequired(value) { typeof value === "number" && !isNaN(value) }
  validateSessionToken(value) { typeof value === "string" && value.length >= 10 }
  validateRememberTokenUsed(value) { typeof value === "number" && !isNaN(value) }
  validateLoginAttemptsBefore(value) { typeof value === "number" && !isNaN(value) }
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
    if (this.email === undefined || this.email === null || this.email === '') {
      errors.push({
        field: 'email',
        message: 'email est requis',
        value: this.email
      });
    }
    if (this.login_status === undefined || this.login_status === null || this.login_status === '') {
      errors.push({
        field: 'login_status',
        message: 'login_status est requis',
        value: this.login_status
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
    if (this.email !== undefined && !this.validateEmail(this.email)) {
      errors.push({
        field: 'email',
        message: 'Format invalide pour email',
        value: this.email
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
    if (this.login_status !== undefined && !this.validateLoginStatus(this.login_status)) {
      errors.push({
        field: 'login_status',
        message: 'Format invalide pour login_status',
        value: this.login_status
      });
    }
    if (this.failure_reason !== undefined && !this.validateFailureReason(this.failure_reason)) {
      errors.push({
        field: 'failure_reason',
        message: 'Format invalide pour failure_reason',
        value: this.failure_reason
      });
    }
    if (this.two_factor_required !== undefined && !this.validateTwoFactorRequired(this.two_factor_required)) {
      errors.push({
        field: 'two_factor_required',
        message: 'Format invalide pour two_factor_required',
        value: this.two_factor_required
      });
    }
    if (this.session_token !== undefined && !this.validateSessionToken(this.session_token)) {
      errors.push({
        field: 'session_token',
        message: 'Format invalide pour session_token',
        value: this.session_token
      });
    }
    if (this.remember_token_used !== undefined && !this.validateRememberTokenUsed(this.remember_token_used)) {
      errors.push({
        field: 'remember_token_used',
        message: 'Format invalide pour remember_token_used',
        value: this.remember_token_used
      });
    }
    if (this.login_attempts_before !== undefined && !this.validateLoginAttemptsBefore(this.login_attempts_before)) {
      errors.push({
        field: 'login_attempts_before',
        message: 'Format invalide pour login_attempts_before',
        value: this.login_attempts_before
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
      email: this.email,
      ip_address: this.ip_address,
      user_agent: this.user_agent,
      login_status: this.login_status,
      failure_reason: this.failure_reason,
      two_factor_required: this.two_factor_required,
      session_token: this.session_token,
      remember_token_used: this.remember_token_used,
      login_attempts_before: this.login_attempts_before,
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
    return new LoginAuditTrailDTO({
      id: dbRow.id,
      user_id: dbRow.user_id,
      email: dbRow.email,
      ip_address: dbRow.ip_address,
      user_agent: dbRow.user_agent,
      login_status: dbRow.login_status,
      failure_reason: dbRow.failure_reason,
      two_factor_required: dbRow.two_factor_required,
      session_token: dbRow.session_token,
      remember_token_used: dbRow.remember_token_used,
      login_attempts_before: dbRow.login_attempts_before,
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
    
    return new LoginAuditTrailDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      user_id: { type: 'number', required: false, description: 'ID de l'utilisateur' },
      email: { type: 'string', required: true, description: 'Adresse email' },
      ip_address: { type: 'string', required: false, description: 'Propriété ip_address' },
      user_agent: { type: 'string', required: false, description: 'Propriété user_agent' },
      login_status: { type: 'string', required: true, description: 'Propriété login_status' },
      failure_reason: { type: 'string', required: false, description: 'Propriété failure_reason' },
      two_factor_required: { type: 'number', required: false, description: 'Propriété two_factor_required' },
      session_token: { type: 'string', required: false, description: 'Propriété session_token' },
      remember_token_used: { type: 'number', required: false, description: 'Propriété remember_token_used' },
      login_attempts_before: { type: 'number', required: false, description: 'Propriété login_attempts_before' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'LoginAuditTrail',
      table: 'login_audit_trails',
      generated: '2026-01-27T15:57:32.811Z',
      properties: 12,
      relationships: 1,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new LoginAuditTrailDTO({
      id: 1,
      user_id: 1,
      email: 'user@example.com',
      ip_address: 'example',
      user_agent: 'example',
      login_status: 'example',
      failure_reason: 'example',
      two_factor_required: 123,
      session_token: 'example',
      remember_token_used: 123,
      login_attempts_before: 123,
      created_at: '2026-01-27T15:57:32.811Z',
    });
  }

  // Méthodes de recherche
  static findById(id) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findById à implémenter');
}
  static findByEmail(email) {
  // Implémentation à définir dans le service
  throw new Error('Méthode findByEmail à implémenter');
}
}

// Export du DTO
module.exports = LoginAuditTrailDTO;

// Export des métadonnées
module.exports.schema = LoginAuditTrailDTO.getSchema();
module.exports.metadata = LoginAuditTrailDTO.getMetadata();
module.exports.properties = 'id', 'user_id', 'email', 'ip_address', 'user_agent', 'login_status', 'failure_reason', 'two_factor_required', 'session_token', 'remember_token_used', 'login_attempts_before', 'created_at';
module.exports.relationships = 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = LoginAuditTrailDTO.fromDatabase;
module.exports.fromAPI = LoginAuditTrailDTO.fromAPI;
module.exports.getExample = LoginAuditTrailDTO.getExample;
