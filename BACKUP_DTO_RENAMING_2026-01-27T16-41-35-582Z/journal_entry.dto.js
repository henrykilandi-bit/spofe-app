/**
 * 📋 DTO JournalEntry - Généré automatiquement depuis journal_entries
 * 
 * @generated 2026-01-27T15:48:13.618Z
 * @source MySQL Table: journal_entries
 * @description DTO pour journal_entry
 * @version SPOFE v2.2
 */

class JournalEntryDTO {
  constructor(data = {}) {
    // Propriétés principales
    this.id = data.id ;
    this.company_id = data.company_id ;
    this.journal_code = data.journal_code ;
    this.entry_number = data.entry_number ;
    this.entry_date = data.entry_date ;
    this.description = data.description ;
    this.status = data.status || POSTED;
    this.total_debit = data.total_debit || 0.00;
    this.total_credit = data.total_credit || 0.00;
    this.created_at = data.created_at ;
    this.updated_at = data.updated_at ;
    this.deleted_at = data.deleted_at ;
    this.user_id = data.user_id ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:48:13.618Z',
      source: 'journal_entries',
      version: 'SPOFE v2.2'
    };
  }

  // Getters
  get id() { return this.id; }
  get company_id() { return this.company_id; }
  get journal_code() { return this.journal_code; }
  get entry_number() { return this.entry_number; }
  get entry_date() { return this.entry_date; }
  get description() { return this.description; }
  get status() { return this.status; }
  get total_debit() { return this.total_debit; }
  get total_credit() { return this.total_credit; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get deleted_at() { return this.deleted_at; }
  get user_id() { return this.user_id; }

  // Setters avec validation
  set id(value) { if (!this.validateId(value)) { throw new Error('Invalid id'); } this.id = value; }
  set company_id(value) { if (!this.validateCompanyId(value)) { throw new Error('Invalid company_id'); } this.company_id = value; }
  set journal_code(value) { if (!this.validateJournalCode(value)) { throw new Error('Invalid journal_code'); } this.journal_code = value; }
  set entry_number(value) { if (!this.validateEntryNumber(value)) { throw new Error('Invalid entry_number'); } this.entry_number = value; }
  set entry_date(value) { if (!this.validateEntryDate(value)) { throw new Error('Invalid entry_date'); } this.entry_date = value; }
  set description(value) { if (!this.validateDescription(value)) { throw new Error('Invalid description'); } this.description = value; }
  set status(value) { if (!this.validateStatus(value)) { throw new Error('Invalid status'); } this.status = value; }
  set total_debit(value) { if (!this.validateTotalDebit(value)) { throw new Error('Invalid total_debit'); } this.total_debit = value; }
  set total_credit(value) { if (!this.validateTotalCredit(value)) { throw new Error('Invalid total_credit'); } this.total_credit = value; }
  set created_at(value) { if (!this.validateCreatedAt(value)) { throw new Error('Invalid created_at'); } this.created_at = value; }
  set updated_at(value) { if (!this.validateUpdatedAt(value)) { throw new Error('Invalid updated_at'); } this.updated_at = value; }
  set deleted_at(value) { if (!this.validateDeletedAt(value)) { throw new Error('Invalid deleted_at'); } this.deleted_at = value; }
  set user_id(value) { if (!this.validateUserId(value)) { throw new Error('Invalid user_id'); } this.user_id = value; }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateCompanyId(value) { typeof value === "number" && !isNaN(value) }
  validateJournalCode(value) { typeof value === "string" }
  validateEntryNumber(value) { typeof value === "string" }
  validateEntryDate(value) { typeof value === "string" }
  validateDescription(value) { typeof value === "string" }
  validateStatus(value) { typeof value === "string" }
  validateTotalDebit(value) { typeof value === "number" && !isNaN(value) }
  validateTotalCredit(value) { typeof value === "number" && !isNaN(value) }
  validateCreatedAt(value) { typeof value === "string" }
  validateUpdatedAt(value) { typeof value === "string" }
  validateDeletedAt(value) { typeof value === "string" }
  validateUserId(value) { typeof value === "number" && !isNaN(value) }

  // Validation complète
  validate() {
    const errors = [];
    if (!this.id) errors.push('id is required');
    if (!this.company_id) errors.push('company_id is required');
    if (!this.journal_code) errors.push('journal_code is required');
    if (!this.entry_number) errors.push('entry_number is required');
    if (!this.entry_date) errors.push('entry_date is required');
    if (!this.created_at) errors.push('created_at is required');
    if (!this.updated_at) errors.push('updated_at is required');
    if (this.id && !this.validateId(this.id)) errors.push('Invalid id');
    if (this.company_id && !this.validateCompanyId(this.company_id)) errors.push('Invalid company_id');
    if (this.journal_code && !this.validateJournalCode(this.journal_code)) errors.push('Invalid journal_code');
    if (this.entry_number && !this.validateEntryNumber(this.entry_number)) errors.push('Invalid entry_number');
    if (this.entry_date && !this.validateEntryDate(this.entry_date)) errors.push('Invalid entry_date');
    if (this.description && !this.validateDescription(this.description)) errors.push('Invalid description');
    if (this.status && !this.validateStatus(this.status)) errors.push('Invalid status');
    if (this.total_debit && !this.validateTotalDebit(this.total_debit)) errors.push('Invalid total_debit');
    if (this.total_credit && !this.validateTotalCredit(this.total_credit)) errors.push('Invalid total_credit');
    if (this.created_at && !this.validateCreatedAt(this.created_at)) errors.push('Invalid created_at');
    if (this.updated_at && !this.validateUpdatedAt(this.updated_at)) errors.push('Invalid updated_at');
    if (this.deleted_at && !this.validateDeletedAt(this.deleted_at)) errors.push('Invalid deleted_at');
    if (this.user_id && !this.validateUserId(this.user_id)) errors.push('Invalid user_id');
    return errors;
  }

  // Conversion objet brut
  toPlainObject() {
    return {
      id: this.id,
      company_id: this.company_id,
      journal_code: this.journal_code,
      entry_number: this.entry_number,
      entry_date: this.entry_date,
      description: this.description,
      status: this.status,
      total_debit: this.total_debit,
      total_credit: this.total_credit,
      created_at: this.created_at,
      updated_at: this.updated_at,
      deleted_at: this.deleted_at,
      user_id: this.user_id,
    };
  }

  // Conversion JSON
  toJSON() {
    return JSON.stringify(this.toPlainObject());
  }

  // Statique: créer depuis la base de données
  static fromDatabase(dbRow) {
    return new JournalEntryDTO({
      id: dbRow.id,
      company_id: dbRow.company_id,
      journal_code: dbRow.journal_code,
      entry_number: dbRow.entry_number,
      entry_date: dbRow.entry_date,
      description: dbRow.description,
      status: dbRow.status,
      total_debit: dbRow.total_debit,
      total_credit: dbRow.total_credit,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      deleted_at: dbRow.deleted_at,
      user_id: dbRow.user_id,
    });
  }

  // Statique: créer pour l'API
  static fromAPI(apiData) {
    return new JournalEntryDTO({
      id: apiData.id,
      company_id: apiData.company_id,
      journal_code: apiData.journal_code,
      entry_number: apiData.entry_number,
      entry_date: apiData.entry_date,
      description: apiData.description,
      status: apiData.status,
      total_debit: apiData.total_debit,
      total_credit: apiData.total_credit,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
      deleted_at: apiData.deleted_at,
      user_id: apiData.user_id,
    });
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      company_id: { type: 'number', required: true, description: 'Propriété company_id de type number' },
      journal_code: { type: 'string', required: true, description: 'Propriété journal_code de type string' },
      entry_number: { type: 'string', required: true, description: 'Propriété entry_number de type string' },
      entry_date: { type: 'string', required: true, description: 'Propriété entry_date de type string' },
      description: { type: 'string', required: false, description: 'Description' },
      status: { type: 'string', required: false, description: 'Statut' },
      total_debit: { type: 'number', required: false, description: 'Propriété total_debit de type number' },
      total_credit: { type: 'number', required: false, description: 'Propriété total_credit de type number' },
      created_at: { type: 'string', required: true, description: 'Date de création' },
      updated_at: { type: 'string', required: true, description: 'Date de mise à jour' },
      deleted_at: { type: 'string', required: false, description: 'Propriété deleted_at de type string' },
      user_id: { type: 'number', required: false, description: 'Propriété user_id de type number' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'JournalEntry',
      table: 'journal_entries',
      generated: '2026-01-27T15:48:13.618Z',
      properties: 13,
      relationships: 2
    };
  }
}

// Export du DTO
module.exports = JournalEntryDTO;

// Export des métadonnées
module.exports.schema = JournalEntryDTO.getSchema();
module.exports.metadata = JournalEntryDTO.getMetadata();
module.exports.properties = 'id', 'company_id', 'journal_code', 'entry_number', 'entry_date', 'description', 'status', 'total_debit', 'total_credit', 'created_at', 'updated_at', 'deleted_at', 'user_id';
module.exports.relationships = 'compagnies', 'users';

// Export des méthodes utilitaires
module.exports.fromDatabase = JournalEntryDTO.fromDatabase;
module.exports.fromAPI = JournalEntryDTO.fromAPI;
