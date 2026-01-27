// ================================================================
// CASCADE - Objective Joi Validation Schemas
// ================================================================
// File: cascade/src/validators/objectiveSchemas.js
// Description: Validation schemas for Strategic Objectives module
// ================================================================

import Joi from 'joi';

// ================================================================
// COMMON PATTERNS
// ================================================================

const datePattern = Joi.date().iso().required();
const optionalDatePattern = Joi.date().iso();
const decimalPattern = Joi.number().precision(2).positive();
const percentPattern = Joi.number().min(0).max(100).precision(2);

// ================================================================
// STRATEGIC OBJECTIVES SCHEMAS
// ================================================================

/**
 * Create Strategic Objective
 */
export const createStrategicObjectiveSchema = Joi.object({
  compagnieId: Joi.number().integer().positive().required()
    .messages({
      'any.required': 'compagnieId est requis',
      'number.base': 'compagnieId doit être un nombre'
    }),

  parentObjectiveId: Joi.number().integer().positive().optional(),

  niveau: Joi.string()
    .valid('strategique', 'tactique', 'operationnel')
    .required()
    .messages({
      'any.only': 'niveau doit être: strategique, tactique ou operationnel'
    }),

  type: Joi.string()
    .valid('vente', 'production', 'rh', 'finance', 'innovation', 'qualite', 'durabilite')
    .required()
    .messages({
      'any.only': 'type doit être: vente, production, rh, finance, innovation, qualite ou durabilite'
    }),

  titre: Joi.string()
    .min(3)
    .max(255)
    .required()
    .trim()
    .messages({
      'string.min': 'Le titre doit contenir au minimum 3 caractères',
      'string.max': 'Le titre ne doit pas dépasser 255 caractères'
    }),

  description: Joi.string()
    .max(5000)
    .optional()
    .trim(),

  valeurCible: decimalPattern
    .required()
    .messages({
      'number.positive': 'valeurCible doit être positive'
    }),

  unite: Joi.string()
    .valid('EUR', 'USD', 'XOF', 'CFA', 'KG', 'UNITE', '%', 'JOURS', 'HEURES')
    .required()
    .messages({
      'any.only': 'unite doit être: EUR, USD, XOF, CFA, KG, UNITE, %, JOURS ou HEURES'
    }),

  direction: Joi.string()
    .valid('maximiser', 'minimiser', 'atteindre')
    .required()
    .default('maximiser'),

  periodeType: Joi.string()
    .valid('quotidien', 'hebdomadaire', 'mensuel', 'trimestriel', 'annuel')
    .required()
    .default('mensuel'),

  dateDebut: datePattern,

  dateFin: datePattern,

  responsableUserId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'Un responsable doit être assigné'
    }),

  coResponsablesIds: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([])
}).with('dateDebut', 'dateFin');

/**
 * Update Strategic Objective
 */
export const updateStrategicObjectiveSchema = Joi.object({
  titre: Joi.string()
    .min(3)
    .max(255)
    .optional()
    .trim(),

  description: Joi.string()
    .max(5000)
    .optional()
    .trim(),

  valeurCible: decimalPattern.optional(),

  statut: Joi.string()
    .valid('nouveau', 'en_cours', 'atteint', 'en_retard', 'abandonne')
    .optional()
    .messages({
      'any.only': 'statut invalide'
    }),

  progression: percentPattern.optional(),

  responsableUserId: Joi.number()
    .integer()
    .positive()
    .optional(),

  coResponsablesIds: Joi.array()
    .items(Joi.number().integer().positive())
    .optional(),

  probabiliteAtteinte: percentPattern.optional(),

  facteursRisques: Joi.array()
    .items(Joi.object({
      facteur: Joi.string().required(),
      impact: Joi.string().valid('bas', 'moyen', 'eleve').required(),
      mitigation: Joi.string().optional()
    }))
    .optional(),

  recommandationsIa: Joi.array()
    .items(Joi.string())
    .optional()
});

// ================================================================
// PERFORMANCE INDICATORS SCHEMAS
// ================================================================

/**
 * Create Performance Indicator
 */
export const createPerformanceIndicatorSchema = Joi.object({
  strategicObjectiveId: Joi.number()
    .integer()
    .positive()
    .required(),

  nom: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim(),

  formule: Joi.string()
    .optional(),

  sourceDonnee: Joi.string()
    .valid('comptable', 'crm', 'production', 'externe')
    .required()
    .default('comptable'),

  frequenceMesure: Joi.string()
    .valid('horaire', 'quotidien', 'hebdomadaire', 'mensuel')
    .required()
    .default('mensuel'),

  seuilVert: decimalPattern.optional(),

  seuilJaune: decimalPattern.optional(),

  seuilRouge: decimalPattern.optional()
});

/**
 * Record KPI Value
 */
export const recordKpiValueSchema = Joi.object({
  date: Joi.date().iso().required(),

  value: Joi.number()
    .required()
    .messages({
      'any.required': 'Une valeur est requise'
    })
});

// ================================================================
// OBJECTIVE ACTIONS SCHEMAS
// ================================================================

/**
 * Create Objective Action
 */
export const createObjectiveActionSchema = Joi.object({
  strategicObjectiveId: Joi.number()
    .integer()
    .positive()
    .required(),

  description: Joi.string()
    .min(5)
    .max(5000)
    .required()
    .trim()
    .messages({
      'string.min': 'La description doit contenir au minimum 5 caractères'
    }),

  priorite: Joi.string()
    .valid('critique', 'haute', 'moyenne', 'basse')
    .required()
    .default('moyenne'),

  dateEcheance: datePattern,

  dateDebutPlanifiee: optionalDatePattern,

  coutEstime: decimalPattern.optional(),

  ressourcesRequises: Joi.array()
    .items(Joi.object({
      type: Joi.string().required(),
      quantite: Joi.number().positive().required(),
      description: Joi.string().optional()
    }))
    .optional(),

  difficulteEstimee: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .default(3),

  impactEstime: percentPattern.optional(),

  dependancesIds: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .default([]),

  assigneeUserId: Joi.number()
    .integer()
    .positive()
    .optional()
});

/**
 * Update Objective Action
 */
export const updateObjectiveActionSchema = Joi.object({
  description: Joi.string()
    .min(5)
    .max(5000)
    .optional()
    .trim(),

  statut: Joi.string()
    .valid('a_faire', 'en_cours', 'termine', 'bloque')
    .optional(),

  priorite: Joi.string()
    .valid('critique', 'haute', 'moyenne', 'basse')
    .optional(),

  dateEcheance: optionalDatePattern,

  coutEstime: decimalPattern.optional(),

  assigneeUserId: Joi.number()
    .integer()
    .positive()
    .optional()
});

// ================================================================
// EXTERNAL DATA SOURCES SCHEMAS
// ================================================================

/**
 * Create External Data Source
 */
export const createExternalDataSourceSchema = Joi.object({
  type: Joi.string()
    .valid('sectoriel', 'economique', 'meteo', 'marche', 'concurrence')
    .required(),

  source: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim(),

  paysCode: Joi.string()
    .length(2)
    .uppercase()
    .optional()
    .messages({
      'string.length': 'Le code pays doit être sur 2 caractères (ISO 3166-1 alpha-2)'
    }),

  region: Joi.string()
    .max(100)
    .optional()
    .trim(),

  indicateur: Joi.string()
    .min(3)
    .max(100)
    .required()
    .trim(),

  valeur: Joi.object()
    .required()
    .messages({
      'object.base': 'La valeur doit être un objet JSON'
    }),

  fiabilite: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .default(3)
    .messages({
      'number.min': 'La fiabilité doit être entre 1 et 5',
      'number.max': 'La fiabilité doit être entre 1 et 5'
    }),

  sourceUrl: Joi.string()
    .uri()
    .optional()
});

/**
 * Update External Data Source
 */
export const updateExternalDataSourceSchema = Joi.object({
  valeur: Joi.object().optional(),

  fiabilite: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),

  sourceUrl: Joi.string()
    .uri()
    .optional()
});

// ================================================================
// BATCH OPERATIONS
// ================================================================

/**
 * Batch update objectives progression
 */
export const batchUpdateProgressionSchema = Joi.object({
  updates: Joi.array()
    .items(Joi.object({
      objectiveId: Joi.number().integer().positive().required(),
      progression: percentPattern.required()
    }))
    .required()
    .min(1)
    .messages({
      'array.min': 'Au moins une mise à jour doit être fournie'
    })
});

/**
 * Bulk create actions
 */
export const bulkCreateActionsSchema = Joi.object({
  strategicObjectiveId: Joi.number()
    .integer()
    .positive()
    .required(),

  actions: Joi.array()
    .items(Joi.object({
      description: Joi.string().min(5).required(),
      priorite: Joi.string().valid('critique', 'haute', 'moyenne', 'basse'),
      dateEcheance: datePattern,
      assigneeUserId: Joi.number().integer().positive().optional(),
      difficulteEstimee: Joi.number().integer().min(1).max(5)
    }))
    .required()
    .min(1)
});

// ================================================================
// FILTERING & SEARCH SCHEMAS
// ================================================================

/**
 * List objectives with filters
 */
export const listObjectivesFilterSchema = Joi.object({
  compagnieId: Joi.number().integer().positive(),

  type: Joi.string()
    .valid('vente', 'production', 'rh', 'finance', 'innovation', 'qualite', 'durabilite'),

  statut: Joi.string()
    .valid('nouveau', 'en_cours', 'atteint', 'en_retard', 'abandonne'),

  niveau: Joi.string()
    .valid('strategique', 'tactique', 'operationnel'),

  responsableUserId: Joi.number().integer().positive(),

  searchText: Joi.string().max(255),

  dateDebut: optionalDatePattern,

  dateFin: optionalDatePattern,

  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(20),

  sortBy: Joi.string()
    .valid('dateDebut', 'dateFin', 'progression', 'createdAt')
    .default('dateDebut'),

  sortOrder: Joi.string()
    .valid('ASC', 'DESC')
    .default('ASC')
});

// ================================================================
// BULK OPERATIONS
// ================================================================

/**
 * Bulk Create Indicator Values
 */
export const bulkCreateIndicatorValuesSchema = Joi.object({
  records: Joi.array()
    .items(
      Joi.object({
        indicatorId: Joi.number().integer().positive().required(),
        date: datePattern,
        value: decimalPattern.required()
      })
    )
    .min(1)
    .required()
});

// ================================================================
// EXPORT
// ================================================================

export const objectiveSchemas = {
  createStrategicObjective: createStrategicObjectiveSchema,
  updateStrategicObjective: updateStrategicObjectiveSchema,
  createPerformanceIndicator: createPerformanceIndicatorSchema,
  recordKpiValue: recordKpiValueSchema,
  createObjectiveAction: createObjectiveActionSchema,
  updateObjectiveAction: updateObjectiveActionSchema,
  createExternalDataSource: createExternalDataSourceSchema,
  updateExternalDataSource: updateExternalDataSourceSchema,
  batchUpdateProgression: batchUpdateProgressionSchema,
  bulkCreateActions: bulkCreateActionsSchema,
  bulkCreateIndicatorValues: bulkCreateIndicatorValuesSchema,
  listObjectivesFilter: listObjectivesFilterSchema
};

export default objectiveSchemas;
