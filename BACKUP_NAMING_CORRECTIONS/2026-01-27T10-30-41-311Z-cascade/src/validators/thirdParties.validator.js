import Joi from 'joi';

/**
 * Validation SIRET (France - 14 chiffres)
 * Format: 9 chiffres SIREN + 5 chiffres NIC
 */
const siretPattern = /^[0-9]{14}$/;

/**
 * Validation IBAN (International)
 * Format: 2 lettres (pays) + 2 chiffres (clé) + max 30 caractères alphanumériques
 * Exemples: FR7630006000011234567890189, DE89370400440532013000
 */
const ibanPattern = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;

/**
 * Validation BIC/SWIFT
 * Format: 4 lettres (banque) + 2 lettres (pays) + 2 caractères (localisation) + 3 caractères optionnels (branche)
 */
const bicPattern = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;

/**
 * Validation RIB France
 * - Code banque: 5 chiffres
 * - Code guichet: 5 chiffres
 * - Numéro de compte: 11 caractères alphanumériques
 * - Clé RIB: 2 chiffres
 */
const bankCodePattern = /^[0-9]{5}$/;
const branchCodePattern = /^[0-9]{5}$/;
const accountNumberPattern = /^[A-Z0-9]{11}$/;
const ribKeyPattern = /^[0-9]{2}$/;

/**
 * Validation TVA intracommunautaire France
 * Format: FR + 2 chiffres (clé) + 9 chiffres (SIREN)
 * Exemple: FR12345678901
 */
const vatNumberPattern = /^[A-Z]{2}[A-Z0-9]{2,13}$/;

/**
 * Validation pour la création d'un tiers
 */
export const createThirdPartySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'L\'ID de l\'entreprise doit être un nombre',
      'any.required': 'L\'ID de l\'entreprise est requis'
    }),
  
  type: Joi.string()
    .valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER')
    .required()
    .messages({
      'any.only': 'Le type doit être: CUSTOMER, SUPPLIER, EMPLOYEE, ou OTHER',
      'any.required': 'Le type de tiers est requis'
    }),
  
  code: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.max': 'Le code ne peut dépasser 50 caractères',
      'any.required': 'Le code du tiers est requis'
    }),
  
  name: Joi.string()
    .min(2)
    .max(255)
    .required()
    .messages({
      'string.min': 'Le nom doit contenir au moins 2 caractères',
      'string.max': 'Le nom ne peut dépasser 255 caractères',
      'any.required': 'Le nom du tiers est requis'
    }),
  
  legalForm: Joi.string()
    .max(100)
    .allow(null, '')
    .optional()
    .messages({
      'string.max': 'La forme juridique ne peut dépasser 100 caractères'
    }),
  
  siret: Joi.string()
    .pattern(siretPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le SIRET doit contenir exactement 14 chiffres (format: 12345678901234)'
    }),
  
  vatNumber: Joi.string()
    .pattern(vatNumberPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le numéro de TVA intracommunautaire est invalide (format: FR12345678901)'
    }),
  
  email: Joi.string()
    .email()
    .allow(null, '')
    .optional()
    .messages({
      'string.email': 'L\'email doit être valide'
    }),
  
  phone: Joi.string()
    .max(20)
    .allow(null, '')
    .optional(),
  
  mobile: Joi.string()
    .max(20)
    .allow(null, '')
    .optional(),
  
  fax: Joi.string()
    .max(20)
    .allow(null, '')
    .optional(),
  
  website: Joi.string()
    .uri()
    .allow(null, '')
    .optional()
    .messages({
      'string.uri': 'Le site web doit être une URL valide'
    }),
  
  // Adresse
  address: Joi.string()
    .max(255)
    .allow(null, '')
    .optional(),
  
  addressComplement: Joi.string()
    .max(255)
    .allow(null, '')
    .optional(),
  
  postalCode: Joi.string()
    .max(10)
    .allow(null, '')
    .optional(),
  
  city: Joi.string()
    .max(100)
    .allow(null, '')
    .optional(),
  
  country: Joi.string()
    .max(100)
    .default('France')
    .optional(),
  
  // Coordonnées bancaires
  bankName: Joi.string()
    .max(255)
    .allow(null, '')
    .optional(),
  
  iban: Joi.string()
    .pattern(ibanPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'L\'IBAN est invalide (format: FR7630006000011234567890189)'
    }),
  
  bic: Joi.string()
    .pattern(bicPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le BIC/SWIFT est invalide (format: BNPAFRPPXXX)'
    }),
  
  // RIB France (optionnel si IBAN fourni)
  bankCode: Joi.string()
    .pattern(bankCodePattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le code banque doit contenir 5 chiffres'
    }),
  
  branchCode: Joi.string()
    .pattern(branchCodePattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le code guichet doit contenir 5 chiffres'
    }),
  
  accountNumber: Joi.string()
    .pattern(accountNumberPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le numéro de compte doit contenir 11 caractères alphanumériques'
    }),
  
  ribKey: Joi.string()
    .pattern(ribKeyPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'La clé RIB doit contenir 2 chiffres'
    }),
  
  // Conditions commerciales
  paymentTerms: Joi.number()
    .integer()
    .min(0)
    .max(365)
    .default(30)
    .optional()
    .messages({
      'number.min': 'Le délai de paiement doit être positif',
      'number.max': 'Le délai de paiement ne peut dépasser 365 jours'
    }),
  
  paymentMethod: Joi.string()
    .valid('CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT', 'OTHER')
    .default('TRANSFER')
    .optional(),
  
  discountRate: Joi.number()
    .min(0)
    .max(100)
    .precision(2)
    .default(0)
    .optional()
    .messages({
      'number.min': 'Le taux de remise doit être positif',
      'number.max': 'Le taux de remise ne peut dépasser 100%'
    }),
  
  creditLimit: Joi.number()
    .min(0)
    .precision(2)
    .allow(null)
    .optional()
    .messages({
      'number.min': 'L\'encours maximum doit être positif'
    }),
  
  // Informations complémentaires
  notes: Joi.string()
    .allow(null, '')
    .optional(),
  
  contactPerson: Joi.string()
    .max(255)
    .allow(null, '')
    .optional(),
  
  contactEmail: Joi.string()
    .email()
    .allow(null, '')
    .optional()
    .messages({
      'string.email': 'L\'email du contact doit être valide'
    }),
  
  contactPhone: Joi.string()
    .max(20)
    .allow(null, '')
    .optional()
}).custom((value, helpers) => {
  // Validation: Si RIB fourni, tous les champs doivent être présents
  const hasRibFields = value.bankCode || value.branchCode || value.accountNumber || value.ribKey;
  if (hasRibFields) {
    if (!value.bankCode || !value.branchCode || !value.accountNumber || !value.ribKey) {
      return helpers.error('any.invalid', {
        message: 'Si un RIB est fourni, tous les champs (code banque, code guichet, numéro de compte, clé RIB) sont requis'
      });
    }
    
    // Validation clé RIB (algorithme de contrôle)
    const key = calculateRibKey(value.bankCode, value.branchCode, value.accountNumber);
    if (key !== parseInt(value.ribKey)) {
      return helpers.error('any.invalid', {
        message: `La clé RIB est invalide. Clé attendue: ${key.toString().padStart(2, '0')}`
      });
    }
  }
  
  return value;
});

/**
 * Validation pour la mise à jour d'un tiers
 */
export const updateThirdPartySchema = Joi.object({
  type: Joi.string()
    .valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER')
    .optional(),
  
  name: Joi.string()
    .min(2)
    .max(255)
    .optional(),
  
  legalForm: Joi.string()
    .max(100)
    .allow(null, '')
    .optional(),
  
  siret: Joi.string()
    .pattern(siretPattern)
    .allow(null, '')
    .optional()
    .messages({
      'string.pattern.base': 'Le SIRET doit contenir exactement 14 chiffres'
    }),
  
  vatNumber: Joi.string()
    .pattern(vatNumberPattern)
    .allow(null, '')
    .optional(),
  
  email: Joi.string()
    .email()
    .allow(null, '')
    .optional(),
  
  phone: Joi.string().max(20).allow(null, '').optional(),
  mobile: Joi.string().max(20).allow(null, '').optional(),
  fax: Joi.string().max(20).allow(null, '').optional(),
  website: Joi.string().uri().allow(null, '').optional(),
  
  address: Joi.string().max(255).allow(null, '').optional(),
  addressComplement: Joi.string().max(255).allow(null, '').optional(),
  postalCode: Joi.string().max(10).allow(null, '').optional(),
  city: Joi.string().max(100).allow(null, '').optional(),
  country: Joi.string().max(100).optional(),
  
  bankName: Joi.string().max(255).allow(null, '').optional(),
  iban: Joi.string().pattern(ibanPattern).allow(null, '').optional(),
  bic: Joi.string().pattern(bicPattern).allow(null, '').optional(),
  
  bankCode: Joi.string().pattern(bankCodePattern).allow(null, '').optional(),
  branchCode: Joi.string().pattern(branchCodePattern).allow(null, '').optional(),
  accountNumber: Joi.string().pattern(accountNumberPattern).allow(null, '').optional(),
  ribKey: Joi.string().pattern(ribKeyPattern).allow(null, '').optional(),
  
  paymentTerms: Joi.number().integer().min(0).max(365).optional(),
  paymentMethod: Joi.string().valid('CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT', 'OTHER').optional(),
  discountRate: Joi.number().min(0).max(100).precision(2).optional(),
  creditLimit: Joi.number().min(0).precision(2).allow(null).optional(),
  
  notes: Joi.string().allow(null, '').optional(),
  isActive: Joi.boolean().optional(),
  isBlocked: Joi.boolean().optional(),
  
  contactPerson: Joi.string().max(255).allow(null, '').optional(),
  contactEmail: Joi.string().email().allow(null, '').optional(),
  contactPhone: Joi.string().max(20).allow(null, '').optional()
});

/**
 * Validation des query parameters pour getAllThirdParties
 */
export const getThirdPartiesQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'L\'ID de l\'entreprise est requis'
    }),
  
  type: Joi.string()
    .valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER')
    .optional(),
  
  isActive: Joi.string()
    .valid('true', 'false')
    .optional(),
  
  search: Joi.string()
    .min(1)
    .max(100)
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
 * Validation pour la recherche de tiers
 */
export const searchThirdPartiesQuerySchema = Joi.object({
  companyId: Joi.number()
    .integer()
    .positive()
    .required(),
  
  search: Joi.string()
    .min(1)
    .max(100)
    .optional(),
  
  type: Joi.string()
    .valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER')
    .optional()
});

/**
 * Validation pour bloquer/débloquer un tiers
 */
export const toggleBlockSchema = Joi.object({
  block: Joi.boolean()
    .required()
    .messages({
      'any.required': 'Le statut de blocage est requis'
    }),
  
  reason: Joi.string()
    .max(500)
    .allow(null, '')
    .optional()
});

/**
 * Validation des paramètres d'URL (ID)
 */
export const thirdPartyIdParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'any.required': 'L\'ID est requis'
    })
});

/**
 * Calculer la clé RIB (algorithme de contrôle)
 * @param {string} bankCode - Code banque (5 chiffres)
 * @param {string} branchCode - Code guichet (5 chiffres)
 * @param {string} accountNumber - Numéro de compte (11 caractères)
 * @returns {number} - Clé RIB (0-97)
 */
function calculateRibKey(bankCode, branchCode, accountNumber) {
  // Remplacer les lettres par des chiffres (A=1, B=2, ..., Z=26 modulo 9)
  const letterToNumber = (char) => {
    if (/[0-9]/.test(char)) return parseInt(char);
    return ((char.charCodeAt(0) - 64) % 9) + 1;
  };
  
  const accountConverted = accountNumber
    .toUpperCase()
    .split('')
    .map(letterToNumber)
    .join('');
  
  const ribNumber = bankCode + branchCode + accountConverted;
  const key = 97 - (parseInt(ribNumber) % 97);
  
  return key;
}
