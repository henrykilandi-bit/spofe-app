import Joi from 'joi';

/**
 * Validation pour la création d'un compte
 */
export const createAccountSchema = Joi.object({
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
  
  accountNumber: Joi.string()
    .pattern(/^[1-8]\d{0,7}$/)
    .required()
    .messages({
      'string.pattern.base': 'Le numéro de compte doit être au format OHADA (commence par 1-8, max 8 chiffres)',
      'any.required': 'Le numéro de compte est requis'
    }),
  
  accountName: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Le nom du compte doit contenir au moins 2 caractères',
      'string.max': 'Le nom du compte ne peut pas dépasser 255 caractères',
      'any.required': 'Le nom du compte est requis'
    }),
  
  accountType: Joi.string()
    .valid('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUES', 'EXPENSES', 'OTHER')
    .required()
    .messages({
      'any.only': 'Le type de compte doit être: ASSETS, LIABILITIES, EQUITY, REVENUES, EXPENSES, ou OTHER',
      'any.required': 'Le type de compte est requis'
    }),
  
  subAccountType: Joi.string()
    .max(100)
    .allow(null, '')
    .optional(),
  
  description: Joi.string()
    .max(1000)
    .allow(null, '')
    .optional(),
  
  parentAccountId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional()
    .messages({
      'number.integer': 'L\'ID du compte parent doit être un entier',
      'number.positive': 'L\'ID du compte parent doit être positif'
    }),
  
  isActive: Joi.boolean()
    .optional()
    .default(true),
  
  isTaxable: Joi.boolean()
    .optional()
    .default(false),
  
  allowSubAccounts: Joi.boolean()
    .optional()
    .default(true)
});

/**
 * Validation pour la mise à jour d'un compte
 */
export const updateAccountSchema = Joi.object({
  accountName: Joi.string()
    .min(2)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Le nom du compte doit contenir au moins 2 caractères',
      'string.max': 'Le nom du compte ne peut pas dépasser 255 caractères'
    }),
  
  accountType: Joi.string()
    .valid('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUES', 'EXPENSES', 'OTHER')
    .optional()
    .messages({
      'any.only': 'Le type de compte doit être: ASSETS, LIABILITIES, EQUITY, REVENUES, EXPENSES, ou OTHER'
    }),
  
  subAccountType: Joi.string()
    .max(100)
    .allow(null, '')
    .optional(),
  
  description: Joi.string()
    .max(1000)
    .allow(null, '')
    .optional(),
  
  isActive: Joi.boolean()
    .optional(),
  
  isTaxable: Joi.boolean()
    .optional(),
  
  allowSubAccounts: Joi.boolean()
    .optional()
});

/**
 * Validation des query parameters pour getAllAccounts
 */
export const getAccountsQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .optional()
    .messages({
      'number.base': 'L\'ID de l\'entreprise doit être un nombre'
    }),
  
  includeInactive: Joi.string()
    .valid('true', 'false')
    .optional()
    .default('false')
});

/**
 * Validation pour la recherche de comptes
 */
export const searchAccountsQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID de l\'entreprise doit être un nombre',
      'any.required': 'L\'ID de l\'entreprise est requis'
    }),
  
  search: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Le terme de recherche doit contenir au moins 1 caractère'
    }),
  
  accountType: Joi.string()
    .valid('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUES', 'EXPENSES', 'OTHER')
    .optional()
});

/**
 * Validation des paramètres d'URL (ID)
 */
export const accountIdParamSchema = Joi.object({
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
