/**
 * 📋 DTO GroupeEntreprise - Généré automatiquement depuis groupes_entreprises
 * 
 * @generated 2026-01-27T15:57:32.800Z
 * @source MySQL Table: groupes_entreprises
 * @description DTO pour la table groupes_entreprises
 * @priority MEDIUM
 * @version SPOFE v2.2
 */

class GroupeEntrepriseDTO {
  constructor(data = {}) {
    // Propriétés principales avec validation
    this.id = this.validateId(data.id) ;
    this.nom = this.validateNom(data.nom) ;
    this.description = this.validateDescription(data.description) ;
    this.pays = this.validatePays(data.pays) ;
    this.devise = this.validateDevise(data.devise) || XOF;
    this.created_at = this.validateCreatedAt(data.created_at) || current_timestamp();
    this.updated_at = this.validateUpdatedAt(data.updated_at) || current_timestamp();
    this.deleted_at = this.validateDeletedAt(data.deleted_at) ;

    // Métadonnées
    this._dtoMetadata = {
      generated: '2026-01-27T15:57:32.800Z',
      source: 'groupes_entreprises',
      version: 'SPOFE v2.2',
      priority: 'MEDIUM',
      properties: 8,
      relationships: 0
    };
  }

  // Getters avec validation
  get id() { return this.id; }
  get nom() { return this.nom; }
  get description() { return this.description; }
  get pays() { return this.pays; }
  get devise() { return this.devise; }
  get created_at() { return this.created_at; }
  get updated_at() { return this.updated_at; }
  get deleted_at() { return this.deleted_at; }

  // Setters avec validation avancée
  set id(value) { this.id = this.validateId(value); }
  set nom(value) { this.nom = this.validateNom(value); }
  set description(value) { this.description = this.validateDescription(value); }
  set pays(value) { this.pays = this.validatePays(value); }
  set devise(value) { this.devise = this.validateDevise(value); }
  set created_at(value) { this.created_at = this.validateCreatedAt(value); }
  set updated_at(value) { this.updated_at = this.validateUpdatedAt(value); }
  set deleted_at(value) { this.deleted_at = this.validateDeletedAt(value); }

  // Validation des propriétés
  validateId(value) { typeof value === "number" && !isNaN(value) }
  validateNom(value) { typeof value === "string" }
  validateDescription(value) { typeof value === "string" }
  validatePays(value) { typeof value === "string" }
  validateDevise(value) { typeof value === "string" }
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
    if (this.nom === undefined || this.nom === null || this.nom === '') {
      errors.push({
        field: 'nom',
        message: 'nom est requis',
        value: this.nom
      });
    }
    
    if (this.id !== undefined && !this.validateId(this.id)) {
      errors.push({
        field: 'id',
        message: 'Format invalide pour id',
        value: this.id
      });
    }
    if (this.nom !== undefined && !this.validateNom(this.nom)) {
      errors.push({
        field: 'nom',
        message: 'Format invalide pour nom',
        value: this.nom
      });
    }
    if (this.description !== undefined && !this.validateDescription(this.description)) {
      errors.push({
        field: 'description',
        message: 'Format invalide pour description',
        value: this.description
      });
    }
    if (this.pays !== undefined && !this.validatePays(this.pays)) {
      errors.push({
        field: 'pays',
        message: 'Format invalide pour pays',
        value: this.pays
      });
    }
    if (this.devise !== undefined && !this.validateDevise(this.devise)) {
      errors.push({
        field: 'devise',
        message: 'Format invalide pour devise',
        value: this.devise
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
      nom: this.nom,
      description: this.description,
      pays: this.pays,
      devise: this.devise,
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
    return new GroupeEntrepriseDTO({
      id: dbRow.id,
      nom: dbRow.nom,
      description: dbRow.description,
      pays: dbRow.pays,
      devise: dbRow.devise,
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
    
    return new GroupeEntrepriseDTO(dbData);
  }

  // Statique: validation de schéma
  static getSchema() {
    return {
      id: { type: 'number', required: true, description: 'Identifiant unique' },
      nom: { type: 'string', required: true, description: 'Propriété nom' },
      description: { type: 'string', required: false, description: 'Description' },
      pays: { type: 'string', required: false, description: 'Propriété pays' },
      devise: { type: 'string', required: false, description: 'Propriété devise' },
      created_at: { type: 'string', required: false, description: 'Date de création' },
      updated_at: { type: 'string', required: false, description: 'Date de mise à jour' },
      deleted_at: { type: 'string', required: false, description: 'Date de suppression' },
    };
  }

  // Statique: métadonnées
  static getMetadata() {
    return {
      name: 'GroupeEntreprise',
      table: 'groupes_entreprises',
      generated: '2026-01-27T15:57:32.800Z',
      properties: 8,
      relationships: 0,
      priority: 'MEDIUM'
    };
  }

  // Statique: exemple de données
  static getExample() {
    return new GroupeEntrepriseDTO({
      id: 1,
      nom: 'example',
      description: 'example',
      pays: 'example',
      devise: 'example',
      created_at: '2026-01-27T15:57:32.800Z',
      updated_at: '2026-01-27T15:57:32.800Z',
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
module.exports = GroupeEntrepriseDTO;

// Export des métadonnées
module.exports.schema = GroupeEntrepriseDTO.getSchema();
module.exports.metadata = GroupeEntrepriseDTO.getMetadata();
module.exports.properties = 'id', 'nom', 'description', 'pays', 'devise', 'created_at', 'updated_at', 'deleted_at';
module.exports.relationships = ;

// Export des méthodes utilitaires
module.exports.fromDatabase = GroupeEntrepriseDTO.fromDatabase;
module.exports.fromAPI = GroupeEntrepriseDTO.fromAPI;
module.exports.getExample = GroupeEntrepriseDTO.getExample;
