import Joi from 'joi';

/**
 * Validation pour la balance générale
 */
export const balanceQuerySchema = Joi.object({
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
  
  level: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .optional()
    .messages({
      'number.min': 'Le niveau doit être entre 1 et 8',
      'number.max': 'Le niveau doit être entre 1 et 8'
    })
});

/**
 * Validation pour la balance auxiliaire
 */
export const balanceAuxiliaryQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required(),
  
  startDate: Joi.date()
    .iso()
    .optional(),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional(),
  
  thirdPartyType: Joi.string()
    .valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER')
    .optional()
    .messages({
      'any.only': 'Le type doit être: CUSTOMER, SUPPLIER, EMPLOYEE, ou OTHER'
    })
});

/**
 * Validation pour le grand livre
 */
export const generalLedgerQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required(),
  
  accountId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'L\'ID du compte est requis'
    }),
  
  startDate: Joi.date()
    .iso()
    .optional(),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
});

/**
 * Validation pour le compte de résultat
 */
export const incomeStatementQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required(),
  
  fiscalYear: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .optional()
    .messages({
      'number.min': 'L\'année fiscale doit être entre 2000 et 2100',
      'number.max': 'L\'année fiscale doit être entre 2000 et 2100'
    }),
  
  startDate: Joi.date()
    .iso()
    .optional(),
  
  endDate: Joi.date()
    .iso()
    .min(Joi.ref('startDate'))
    .optional()
}).or('fiscalYear', 'startDate')
  .messages({
    'object.missing': 'Vous devez fournir soit fiscalYear, soit startDate et endDate'
  });

/**
 * Validation pour le bilan comptable
 */
export const balanceSheetQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required(),
  
  date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'La date doit être au format ISO (YYYY-MM-DD)'
    })
});
