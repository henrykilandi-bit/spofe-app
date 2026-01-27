/**
 * 📋 DTO JournalEntryLine - Généré automatiquement depuis journal_entry_lines
 * 
 * @generated 2026-01-27T15:57:32.809Z
 * @source MySQL Table: journal_entry_lines
 * @description DTO pour la table journal_entry_lines
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class JournalEntryLineDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.journal_entry_id = this.validateJournalEntryId(data.journal_entry_id) ;
    this.numero_compte_id = this.validateNumeroCompteId(data.numero_compte_id) ;
    this.description = this.validateDescription(data.description) ;
    this.montant_debit = this.validateMontantDebit(data.montant_debit) || 0.00;
    this.montant_credit = this.validateMontantCredit(data.montant_credit) || 0.00;
    this.order_in_entry = this.validateOrderInEntry(data.order_in_entry) ;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();
    this.deleted_at = this.validateDeletedAt(data.deleted_at) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.809Z',
      source: 'journal_entry_lines',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 10,
      relationships: 2
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get journal_entry_id() { return this.journal_entry_id; }
  get numero_compte_id() { return this.numero_compte_id; }
  get description() { return this.description; }
  get montant_debit() { return this.montant_debit; }
  get montant_credit() { return this.montant_credit; }
  get order_in_entry() { return this.order_in_entry; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get deleted_at() { return this.deleted_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set journal_entry_id(value) { this.journal_entry_id = this.validateJournalEntryId(value); }
  set numero_compte_id(value) { this.numero_compte_id = this.validateNumeroCompteId(value); }
  set description(value) { this.description = this.validateDescription(value); }
  set montant_debit(value) { this.montant_debit = this.validateMontantDebit(value); }
  set montant_credit(value) { this.montant_credit = this.validateMontantCredit(value); }
  set order_in_entry(value) { this.order_in_entry = this.validateOrderInEntry(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }
  set deleted_at(value) { this.deleted_at = this.validateDeletedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateJournalEntryId(value) { typeof value === "number" && !isNaN(value) }
  validateNumeroCompteId(value) { typeof value === "number" && !isNaN(value) }
  validateDescription(value) { typeof value === "string" }
  validateMontantDebit(value) { typeof value === "number" && !isNaN(value) }
  validateMontantCredit(value) { typeof value === "number" && !isNaN(value) }
  validateOrderInEntry(value) { typeof value === "number" && !isNaN(value) }
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
    if (this.journal_entry_id === undefined || this.journal_entry_id === null || this.journal_entry_id === '') {
      errors.push({
        field: 'journal_entry_id',
        message: 'journal_entry_id est requis',
        value: this.journal_entry_id
      });
    }
    if (this.numero_compte_id === undefined || this.numero_compte_id === null || this.numero_compte_id === '') {
      errors.push({
        field: 'numero_compte_id',
        message: 'numero_compte_id est requis',
        value: this.numero_compte_id
      });
    }
    
    if (this.id !== undefined && !this.validateId(this.id)) {
      errors.push({
        field: 'id',
        message: 'Format invalide pour id',
        value: this.id
      });
    }
    if (this.journal_entry_id !== undefined && !this.validateJournalEntryId(this.journal_entry_id)) {
      errors.push({
        field: 'journal_entry_id',
        message: 'Format invalide pour journal_entry_id',
        value: this.journal_entry_id
      });
    }
    if (this.numero_compte_id !== undefined && !this.validateNumeroCompteId(this.numero_compte_id)) {
      errors.push({
        field: 'numero_compte_id',
        message: 'Format invalide pour numero_compte_id',
        value: this.numero_compte_id
      });
    }
    if (this.description !== undefined && !this.validateDescription(this.description)) {
      errors.push({
        field: 'description',
        message: 'Format invalide pour description',
        value: this.description
      });
    }
    if (this.montant_debit !== undefined && !this.validateMontantDebit(this.montant_debit)) {
      errors.push({
        field: 'montant_debit',
        message: 'Format invalide pour montant_debit',
        value: this.montant_debit
      });
    }
    if (this.montant_credit !== undefined && !this.validateMontantCredit(this.montant_credit)) {
      errors.push({
        field: 'montant_credit',
        message: 'Format invalide pour montant_credit',
        value: this.montant_credit
      });
    }
    if (this.order_in_entry !== undefined && !this.validateOrderInEntry(this.order_in_entry)) {
      errors.push({
        field: 'order_in_entry',
        message: 'Format invalide pour order_in_entry',
        value: this.order_in_entry
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
      journal_entry_id: this.journal_entry_id,
      numero_compte_id: this.numero_compte_id,
      description: this.description,
      montant_debit: this.montant_debit,
      montant_credit: this.montant_credit,
      order_in_entry: this.order_in_entry,
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
    return new JournalEntryLineDTO({
      id: dbRow.id,
      journal_entry_id: dbRow.journal_entry_id,
      numero_compte_id: dbRow.numero_compte_id,
      description: dbRow.description,
      montant_debit: dbRow.montant_debit,
      montant_credit: dbRow.montant_credit,
      order_in_entry: dbRow.order_in_entry,
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
    
    return new JournalEntryLineDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      journal_entry_id: { type: 'number', required: true, description: 'Propriété journal_entry_id' },
      numero_compte_id: { type: 'number', required: true, description: 'Propriété numero_compte_id' },
      description: { type: 'string', required: false, description: 'Description' },
      montant_debit: { type: 'number', required: false, description: 'Propriété montant_debit' },
      montant_credit: { type: 'number', required: false, description: 'Propriété montant_credit' },
      order_in_entry: { type: 'number', required: false, description: 'Propriété order_in_entry' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
      deleted_at: { type: 'string', required: false, description: 'Date de suppression' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'JournalEntryLine',
      table: 'journal_entry_lines',
      generated: '2026-01-27T15:57:32.809Z',
      properties: 10,
      relationships: 2,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new JournalEntryLineDTO({
      id: 1,
      journal_entry_id: 1,
      numero_compte_id: 1,
      description: 'example',
      montant_debit: 123,
      montant_credit: 123,
      order_in_entry: 123,
      created_at: '2026-01-27T15:57:32.809Z',
      updated_at: '2026-01-27T15:57:32.809Z',
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
module.exports = JournalEntryLineDTO;

// Export des métadonnées
module.exports.schema = JournalEntryLineDTO.getSchema();
module.exports.metadata = JournalEntryLineDTO.getMetadata();
module.exports.properties = 'id', 'journal_entry_id', 'numero_compte_id', 'description', 'montant_debit', 'montant_credit', 'order_in_entry', 'created_at', 'updated_at', 'deleted_at';
module.exports.relationships = 'journal_entries', 'charts_of_accounts';

// Export des méthodes utilitaires
module.exports.fromDatabase = JournalEntryLineDTO.fromDatabase;
module.exports.fromAPI = JournalEntryLineDTO.fromAPI;
module.exports.getExample = JournalEntryLineDTO.getExample;
