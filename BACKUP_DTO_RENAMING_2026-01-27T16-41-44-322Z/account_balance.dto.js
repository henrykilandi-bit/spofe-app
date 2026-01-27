/**
 * 📋 DTO AccountBalance - Généré automatiquement depuis account_balances
 * 
 * @generated 2026-01-27T15:48:13.626Z
 * @source MySQL Table: account_balances
 * @description DTO pour account_balance
 * @version SPOFE v2.2
 */

class AccountBalanceDTO {
  constructor(data = {}) {
    // Propriétés principales
    this.id = data.id ;
    this.numero_compte_id = data.numero_compte_id ;
    this.periode = data.periode ;
    this.solde_debit = data.solde_debit || 0.00;
    this.solde_credit = data.solde_credit || 0.00;
    this.created_at = data.created_at || current_timestamp();
    this.updated_at = data.updated_at || current_timestamp();
    this.deleted_at = data.deleted_at ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:48:13.626Z',
      source: 'account_balances',
      version: 'SPOFE v2.2'
    };
  }

  // Getters
  get id() { return this.id; }
  get numero_compte_id() { return this.numero_compte_id; }
  get periode() { return this.periode; }
  get solde_debit() { return this.solde_debit; }
  get solde_credit() { return this.solde_credit; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get deleted_at() { return this.deleted_at; }

  // Setters avec validation
  set id(value) { if (!this.validateId(value)) { throw new Error('Invalid id'); } this.id = value; }
  set numero_compte_id(value) { if (!this.validateNumeroCompteId(value)) { throw new Error('Invalid numero_compte_id'); } this.numero_compte_id = value; }
  set periode(value) { if (!this.validatePeriode(value)) { throw new Error('Invalid periode'); } this.periode = value; }
  set solde_debit(value) { if (!this.validateSoldeDebit(value)) { throw new Error('Invalid solde_debit'); } this.solde_debit = value; }
  set solde_credit(value) { if (!this.validateSoldeCredit(value)) { throw new Error('Invalid solde_credit'); } this.solde_credit = value; }
  set created_at(value) { if (!this.validateCreatedAt(value)) { throw new Error('Invalid created_at'); } this.created_at = value; }
  set updated_at(value) { if (!this.validateUpdatedAt(value)) { throw new Error('Invalid updated_at'); } this.updated_at = value; }
  set deleted_at(value) { if (!this.validateDeletedAt(value)) { throw new Error('Invalid deleted_at'); } this.deleted_at = value; }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateNumeroCompteId(value) { typeof value === "number" && !isNaN(value) }
  validatePeriode(value) { typeof value === "string" }
  validateSoldeDebit(value) { typeof value === "number" && !isNaN(value) }
  validateSoldeCredit(value) { typeof value === "number" && !isNaN(value) }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }
  validateDeletedAt(value) { typeof value === "string" }

  // Validation complète
  validate() {
    const errors = [];
    if (!this.id) errors.push('id is required');
    if (!this.numero_compte_id) errors.push('numero_compte_id is required');
    if (this.id && !this.validateId(this.id)) errors.push('Invalid id');
    if (this.numero_compte_id && !this.validateNumeroCompteId(this.numero_compte_id)) errors.push('Invalid numero_compte_id');
    if (this.periode && !this.validatePeriode(this.periode)) errors.push('Invalid periode');
    if (this.solde_debit && !this.validateSoldeDebit(this.solde_debit)) errors.push('Invalid solde_debit');
    if (this.solde_credit && !this.validateSoldeCredit(this.solde_credit)) errors.push('Invalid solde_credit');
    if (this.created_at && !this.validateCreatedAt(this.created_at)) errors.push('Invalid created_at');
    if (this.updated_at && !this.validateUpdatedAt(this.updated_at)) errors.push('Invalid updated_at');
    if (this.deleted_at && !this.validateDeletedAt(this.deleted_at)) errors.push('Invalid deleted_at');
    return errors;
  }

  // Conversion objet brut
  toPlainObject() {
    return {
      id: this.id,
      numero_compte_id: this.numero_compte_id,
      periode: this.periode,
      solde_debit: this.solde_debit,
      solde_credit: this.solde_credit,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
    };
  }

  // Conversion JSON
  toJSON() {
    return JSON.stringify(this.toPlainObject());
  }

  // Statique: créer depuis la base de données
  static fromDatabase(dbRow) {
    return new AccountBalanceDTO({
      id: dbRow.id,
      numero_compte_id: dbRow.numero_compte_id,
      periode: dbRow.periode,
      solde_debit: dbRow.solde_debit,
      solde_credit: dbRow.solde_credit,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      deleted_at: dbRow.deleted_at,
    });
  }

  // Statique: créer pour l'API
  static fromAPI(apiData) {
    return new AccountBalanceDTO({
      id: apiData.id,
      numero_compte_id: apiData.numero_compte_id,
      periode: apiData.periode,
      solde_debit: apiData.solde_debit,
      solde_credit: apiData.solde_credit,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
      deleted_at: apiData.deleted_at,
    });
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      numero_compte_id: { type: 'number', required: true, description: 'Propriété numero_compte_id de type number' },
      periode: { type: 'string', required: false, description: 'Propriété periode de type string' },
      solde_debit: { type: 'number', required: false, description: 'Propriété solde_debit de type number' },
      solde_credit: { type: 'number', required: false, description: 'Propriété solde_credit de type number' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
      deleted_at: { type: 'string', required: false, description: 'Propriété deleted_at de type string' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'AccountBalance',
      table: 'account_balances',
      generated: '2026-01-27T15:48:13.626Z',
      properties: 8,
      relationships: 1
    };
  }
}

// Export du DTO
module.exports = AccountBalanceDTO;

// Export des métadonnées
module.exports.schema = AccountBalanceDTO.getSchema();
module.exports.metadata = AccountBalanceDTO.getMetadata();
module.exports.properties = 'id', 'numero_compte_id', 'periode', 'solde_debit', 'solde_credit', 'created_at', 'updated_at', 'deleted_at';
module.exports.relationships = 'charts_of_accounts';

// Export des méthodes utilitaires
module.exports.fromDatabase = AccountBalanceDTO.fromDatabase;
module.exports.fromAPI = AccountBalanceDTO.fromAPI;
