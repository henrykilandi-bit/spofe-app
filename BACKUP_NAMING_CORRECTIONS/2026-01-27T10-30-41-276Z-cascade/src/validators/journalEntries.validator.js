import Joi from 'joi';

/**
 * Schéma de validation pour une ligne d'écriture
 */
const lineSchema = Joi.object({
  accountId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID du compte doit être un nombre',
      'number.integer': 'L\'ID du compte doit être un entier',
      'number.positive': 'L\'ID du compte doit être positif',
      'any.required': 'L\'ID du compte est requis'
    }),
  
  thirdPartyId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      'number.integer': 'L\'ID du tiers doit être un entier',
      'number.positive': 'L\'ID du tiers doit être positif'
    }),
  
  description: Joi.string()
    .max(500)
    .allow(null, '')
    .optional(),
  
  debitAmount: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.min': 'Le montant au débit doit être positif',
      'number.precision': 'Le montant au débit ne peut avoir plus de 2 décimales'
    }),
  
  creditAmount: Joi.number()
    .min(0)
    .precision(2)
    .default(0)
    .messages({
      'number.min': 'Le montant au crédit doit être positif',
      'number.precision': 'Le montant au crédit ne peut avoir plus de 2 décimales'
    }),
  
  maturityDate: Joi.date()
    .iso()
    .allow(null)
    .optional()
    .messages({
      'date.format': 'La date d\'échéance doit être au format ISO (YYYY-MM-DD)'
    }),
  
  costCenter: Joi.string()
    .max(50)
    .allow(null, '')
    .optional()
}).custom((value, helpers) => {
  // Validation: Une ligne ne peut avoir simultanément débit ET crédit > 0
  if (value.debitAmount > 0 && value.creditAmount > 0) {
    return helpers.error('any.invalid', {
      message: 'Une ligne ne peut avoir simultanément un débit et un crédit'
    });
  }
  
  // Validation: Une ligne doit avoir au moins un montant
  if (value.debitAmount === 0 && value.creditAmount === 0) {
    return helpers.error('any.invalid', {
      message: 'Une ligne doit avoir un montant au débit ou au crédit'
    });
  }
  
  return value;
});

/**
 * Validation pour la création d'une écriture
 */
export const createEntrySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID de l\'entreprise doit être un nombre',
      'number.integer': 'L\'ID de l\'entreprise doit être un entier',
      'number.positive': 'L\'ID de l\'entreprise doit être positif',
      'any.required': 'L\'ID de l\'entreprise est requis'
    }),
  
  journalCode: Joi.string()
    .max(10)
    .uppercase()
    .required()
    .messages({
      'string.max': 'Le code journal ne peut dépasser 10 caractères',
      'any.required': 'Le code journal est requis'
    }),
  
  entryDate: Joi.date()
    .iso()
    .max('now')
    .required()
    .messages({
      'date.format': 'La date d\'écriture doit être au format ISO (YYYY-MM-DD)',
      'date.max': 'La date d\'écriture ne peut être dans le futur',
      'any.required': 'La date d\'écriture est requise'
    }),
  
  description: Joi.string()
    .min(5)
    .max(500)
    .required()
    .messages({
      'string.min': 'La description doit contenir au moins 5 caractères',
      'string.max': 'La description ne peut dépasser 500 caractères',
      'any.required': 'La description est requise'
    }),
  
  referenceDocument: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'La référence du document ne peut dépasser 100 caractères'
    }),
  
  lines: Joi.array()
    .items(lineSchema)
    .min(2)
    .required()
    .messages({
      'array.min': 'Une écriture doit contenir au moins 2 lignes',
      'any.required': 'Les lignes d\'écriture sont requises'
    })
}).custom((value, helpers) => {
  // Validation globale: Équilibre débit/crédit
  let totalDebit = 0;
  let totalCredit = 0;
  
  for (const line of value.lines) {
    totalDebit += line.debitAmount || 0;
    totalCredit += line.creditAmount || 0;
  }
  
  const tolerance = 0.01; // Tolérance d'1 centime
  if (Math.abs(totalDebit - totalCredit) > tolerance) {
    return helpers.error('any.invalid', {
      message: `L'écriture n'est pas équilibrée: débit ${totalDebit.toFixed(2)} ≠ crédit ${totalCredit.toFixed(2)}`
    });
  }
  
  return value;
});

/**
 * Validation pour la mise à jour d'une écriture
 */
export const updateEntrySchema = Joi.object({
  description: Joi.string()
    .min(5)
    .max(500)
    .optional()
    .messages({
      'string.min': 'La description doit contenir au moins 5 caractères',
      'string.max': 'La description ne peut dépasser 500 caractères'
    }),
  
  referenceDocument: Joi.string()
    .max(100)
    .allow(null, '')
    .optional(),
  
  lines: Joi.array()
    .items(lineSchema)
    .min(2)
    .optional()
    .messages({
      'array.min': 'Une écriture doit contenir au moins 2 lignes'
    })
}).custom((value, helpers) => {
  // Si lignes fournies, valider l'équilibre
  if (value.lines && value.lines.length > 0) {
    let totalDebit = 0;
    let totalCredit = 0;
    
    for (const line of value.lines) {
      totalDebit += line.debitAmount || 0;
      totalCredit += line.creditAmount || 0;
    }
    
    const tolerance = 0.01;
    if (Math.abs(totalDebit - totalCredit) > tolerance) {
      return helpers.error('any.invalid', {
        message: `L'écriture n'est pas équilibrée: débit ${totalDebit.toFixed(2)} ≠ crédit ${totalCredit.toFixed(2)}`
      });
    }
  }
  
  return value;
});

/**
 * Validation des query parameters pour getAllEntries
 */
export const getEntriesQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID de l\'entreprise doit être un nombre',
      'any.required': 'L\'ID de l\'entreprise est requis'
    }),
  
  startDate: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'La date de début doit être au format ISO (YYYY-MM-DD)'
    }),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
    .messages({
      'date.format': 'La date de fin doit être au format ISO (YYYY-MM-DD)',
      'date.min': 'La date de fin doit être postérieure à la date de début'
    }),
  
  status: Joi.string()
    .valid('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REVERSED')
    .optional()
    .messages({
      'any.only': 'Le statut doit être: DRAFT, SUBMITTED, APPROVED, POSTED, ou REVERSED'
    }),
  
  journalCode: Joi.string()
    .max(10)
    .optional(),
  
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),
  
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(50)
    .optional()
});

/**
 * Validation des paramètres d'URL (ID)
 */
export const entryIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID doit être un nombre',
      'number.integer': 'L\'ID doit être un entier',
      'number.positive': 'L\'ID doit être positif',
      'any.required': 'L\'ID est requis'
    })
});
