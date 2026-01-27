/**
 * 🔐 Joi Validation Schemas for SPOFE API
 * 
 * Comprehensive validation for all 50+ endpoints
 * Phase 4 Frontend Integration
 */

import Joi from 'joi';

// ==========================================
// ❌ COMMON PATTERNS
// ==========================================

const commonSchemas = {
  // Email validation
  email: Joi.string().email().lowercase().trim().required(),
  optionalEmail: Joi.string().email().lowercase().trim().allow(null, ''),
  
  // Password validation (8+ chars, 1 uppercase, 1 number)
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least 1 uppercase letter and 1 number'
    }),
  
  // Username validation
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  // Phone validation
  phone: Joi.string()
    .pattern(/^[+]?[\d\s\-()]{8,20}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Invalid phone number format'
    }),
  
  // ISO Date validation
  isoDate: Joi.date().iso().required(),
  optionalIsoDate: Joi.date().iso().allow(null),
  
  // Decimal validation (max 15 digits, 2 decimals)
  decimal15_2: Joi.number().max(999999999999999.99).required(),
  
  // Percentage validation (0-100)
  percentage: Joi.number().min(0).max(100).required(),
  
  // UUID validation
  uuid: Joi.string().uuid().required(),
  optionalUuid: Joi.string().uuid().allow(null, ''),
  
  // URL validation
  url: Joi.string().uri().allow(null, ''),
  
  // SIRET validation (14 digits)
  siret: Joi.string()
    .pattern(/^\d{14}$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'SIRET must be 14 digits'
    }),
  
  // IBAN validation
  iban: Joi.string()
    .pattern(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/)
    .max(34)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Invalid IBAN format'
    }),
  
  // BIC validation
  bic: Joi.string()
    .pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Invalid BIC/SWIFT code'
    })
};

// ==========================================
// 👤 USER SCHEMAS (8 endpoints)
// ==========================================

export const userSchemas = {
  // POST /api/auth/register
  register: Joi.object({
    username: commonSchemas.username,
    email: commonSchemas.email,
    password: commonSchemas.password,
    prenom: Joi.string().max(100).allow(null, ''),
    nom: Joi.string().max(100).allow(null, ''),
    telephone: commonSchemas.phone,
    role: Joi.string()
      .valid('admin', 'super_utilisateur', 'utilisateur', 'super_consultant', 'consultant', 'viewer', 'accountant')
      .default('utilisateur')
  }).required(),

  // POST /api/auth/login
  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }).required(),

  // POST /api/auth/refresh-token
  refreshToken: Joi.object({
    refreshToken: Joi.string().required()
  }).required(),

  // PUT /api/users/:id
  updateUser: Joi.object({
    prenom: Joi.string().max(100).allow(null, ''),
    nom: Joi.string().max(100).allow(null, ''),
    telephone: commonSchemas.phone,
    email: commonSchemas.optionalEmail,
    role: Joi.string()
      .valid('admin', 'super_utilisateur', 'utilisateur', 'super_consultant', 'consultant', 'viewer', 'accountant'),
    isActive: Joi.boolean(),
    specialites: Joi.array().items(Joi.string()).allow(null),
    experience_years: Joi.number().min(0).max(50).allow(null)
  }).required().min(1),

  // POST /api/auth/reset-password
  resetPassword: Joi.object({
    email: commonSchemas.email
  }).required(),

  // POST /api/auth/confirm-reset-password
  confirmResetPassword: Joi.object({
    token: Joi.string().required(),
    newPassword: commonSchemas.password
  }).required(),

  // POST /api/users/:id/change-password
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password
  }).required(),

  // POST /api/users/:id/enable-2fa
  enable2FA: Joi.object({
    password: Joi.string().required()
  }).required()
};

// ==========================================
// 🏢 COMPAGNIE SCHEMAS (6 endpoints)
// ==========================================

export const compagnieSchemas = {
  // POST /api/compagnies
  createCompagnie: Joi.object({
    groupeId: Joi.number().integer().positive().required(),
    nom: Joi.string().min(2).max(255).required(),
    sigle: Joi.string().max(50).allow(null, ''),
    numeroRegistreCommerce: Joi.string()
      .pattern(/^\d{14}$/)
      .allow(null, '')
      .messages({
        'string.pattern.base': 'Registre commerce must be 14 digits'
      }),
    adresse: Joi.string().max(1000).allow(null, ''),
    telephone: commonSchemas.phone,
    email: commonSchemas.optionalEmail,
    devise: Joi.string().length(3).default('XOF'),
    isActive: Joi.boolean().default(true)
  }).required(),

  // PUT /api/compagnies/:id
  updateCompagnie: Joi.object({
    nom: Joi.string().min(2).max(255),
    sigle: Joi.string().max(50).allow(null, ''),
    numeroRegistreCommerce: commonSchemas.siret,
    adresse: Joi.string().max(1000).allow(null, ''),
    telephone: commonSchemas.phone,
    email: commonSchemas.optionalEmail,
    devise: Joi.string().length(3),
    isActive: Joi.boolean()
  }).required().min(1),

  // GET /api/compagnies/:id - validation for URL params
  getCompagnie: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // DELETE /api/compagnies/:id
  deleteCompagnie: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // GET /api/compagnies?groupeId=X
  listCompagnies: Joi.object({
    groupeId: Joi.number().integer().positive(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().allow('nom', 'created_at', '-nom', '-created_at').default('nom')
  }),

  // POST /api/compagnies/:id/archive
  archiveCompagnie: Joi.object({
    id: Joi.number().integer().positive().required(),
    reason: Joi.string().max(500).required()
  }).required()
};

// ==========================================
// 📊 JOURNAL ENTRY SCHEMAS (8 endpoints)
// ==========================================

export const journalEntrySchemas = {
  // POST /api/journal-entries
  createJournalEntry: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    journalCode: Joi.string()
      .length(2)
      .uppercase()
      .required()
      .messages({
        'string.length': 'Journal code must be 2 characters'
      }),
    entryDate: commonSchemas.isoDate,
    description: Joi.string().max(255).allow(null, ''),
    status: Joi.string()
      .valid('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED')
      .default('DRAFT'),
    lines: Joi.array()
      .items(
        Joi.object({
          accountId: Joi.number().integer().positive().required(),
          amount: Joi.number().positive().required(),
          type: Joi.string().valid('DEBIT', 'CREDIT').required(),
          description: Joi.string().max(500).allow(null, ''),
          thirdPartyId: Joi.number().integer().allow(null)
        })
      )
      .min(2)
      .required()
  }).required(),

  // PUT /api/journal-entries/:id
  updateJournalEntry: Joi.object({
    entryDate: commonSchemas.optionalIsoDate,
    description: Joi.string().max(255).allow(null, ''),
    status: Joi.string().valid('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REVERSED')
  }).required().min(1),

  // GET /api/journal-entries/:id
  getJournalEntry: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // DELETE /api/journal-entries/:id
  deleteJournalEntry: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // GET /api/journal-entries?companyId=X&status=POSTED
  listJournalEntries: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    status: Joi.string().valid('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REVERSED'),
    journalCode: Joi.string().length(2),
    startDate: commonSchemas.optionalIsoDate,
    endDate: commonSchemas.optionalIsoDate,
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).required(),

  // POST /api/journal-entries/:id/submit
  submitJournalEntry: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // POST /api/journal-entries/:id/approve
  approveJournalEntry: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // POST /api/journal-entries/:id/post
  postJournalEntry: Joi.object({
    id: Joi.number().integer().positive().required(),
    reverseOnError: Joi.boolean().default(false)
  }).required()
};

// ==========================================
// 📈 CHART OF ACCOUNTS SCHEMAS (6 endpoints)
// ==========================================

export const chartOfAccountSchemas = {
  // POST /api/charts-of-accounts
  createChartOfAccount: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    accountNumber: Joi.string()
      .pattern(/^\d{1,3}$/)
      .required()
      .messages({
        'string.pattern.base': 'Account number must be 1-3 digits'
      }),
    accountName: Joi.string().min(2).max(255).required(),
    accountType: Joi.string()
      .valid('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUES', 'EXPENSES', 'OTHER')
      .required(),
    subAccountType: Joi.string().max(100).allow(null, ''),
    description: Joi.string().max(1000).allow(null, ''),
    parentAccountId: Joi.number().integer().allow(null),
    isActive: Joi.boolean().default(true),
    isTaxable: Joi.boolean().default(false),
    allowSubAccounts: Joi.boolean().default(true)
  }).required(),

  // PUT /api/charts-of-accounts/:id
  updateChartOfAccount: Joi.object({
    accountName: Joi.string().min(2).max(255),
    description: Joi.string().max(1000).allow(null, ''),
    subAccountType: Joi.string().max(100).allow(null, ''),
    isActive: Joi.boolean(),
    isTaxable: Joi.boolean(),
    allowSubAccounts: Joi.boolean()
  }).required().min(1),

  // GET /api/charts-of-accounts/:id
  getChartOfAccount: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // GET /api/charts-of-accounts?companyId=X&accountType=ASSETS
  listChartsOfAccounts: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    accountType: Joi.string().valid('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUES', 'EXPENSES', 'OTHER'),
    isActive: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).required(),

  // POST /api/charts-of-accounts/import-ohada
  importOHADA: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    overwrite: Joi.boolean().default(false)
  }).required()
};

// ==========================================
// 💳 THIRD PARTY SCHEMAS (6 endpoints)
// ==========================================

export const thirdPartySchemas = {
  // POST /api/third-parties
  createThirdParty: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    type: Joi.string()
      .valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER')
      .required(),
    name: Joi.string().min(2).max(255).required(),
    legalForm: Joi.string().max(100).allow(null, ''),
    siret: commonSchemas.siret,
    vatNumber: Joi.string().max(50).allow(null, ''),
    email: commonSchemas.optionalEmail,
    phone: commonSchemas.phone,
    address: Joi.string().max(500).allow(null, ''),
    city: Joi.string().max(100).allow(null, ''),
    postalCode: Joi.string().max(10).allow(null, ''),
    iban: commonSchemas.iban,
    bic: commonSchemas.bic,
    paymentTerms: Joi.number().integer().min(0).max(365).default(30),
    discountRate: commonSchemas.percentage,
    creditLimit: Joi.number().allow(null),
    contactPerson: Joi.string().max(255).allow(null, ''),
    contactEmail: commonSchemas.optionalEmail
  }).required(),

  // PUT /api/third-parties/:id
  updateThirdParty: Joi.object({
    name: Joi.string().min(2).max(255),
    email: commonSchemas.optionalEmail,
    phone: commonSchemas.phone,
    iban: commonSchemas.iban,
    bic: commonSchemas.bic,
    paymentTerms: Joi.number().integer().min(0).max(365),
    discountRate: commonSchemas.percentage,
    creditLimit: Joi.number().allow(null),
    isActive: Joi.boolean(),
    isBlocked: Joi.boolean()
  }).required().min(1),

  // GET /api/third-parties/:id
  getThirdParty: Joi.object({
    id: Joi.number().integer().positive().required()
  }).required(),

  // GET /api/third-parties?companyId=X&type=CUSTOMER
  listThirdParties: Joi.object({
    companyId: Joi.number().integer().positive().required(),
    type: Joi.string().valid('CUSTOMER', 'SUPPLIER', 'EMPLOYEE', 'OTHER'),
    isActive: Joi.boolean(),
    isBlocked: Joi.boolean(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20)
  }).required(),

  // POST /api/third-parties/:id/block
  blockThirdParty: Joi.object({
    id: Joi.number().integer().positive().required(),
    reason: Joi.string().max(500).required()
  }).required()
};

// ==========================================
// 🔧 UTILITY FUNCTIONS
// ==========================================

/**
 * Validate request data against schema
 * @param {Object} data - Data to validate
 * @param {Joi.Schema} schema - Joi schema
 * @returns {Object} { error, value }
 */
export const validateData = (data, schema) => {
  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    convert: true
  });
};

/**
 * Create validation middleware
 * @param {Joi.Schema} schema
 * @param {String} source - 'body', 'params', 'query'
 * @returns {Function} Express middleware
 */
export const validationMiddleware = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = validateData(dataToValidate, schema);

    if (error) {
      const messages = error.details.map(d => ({
        field: d.path.join('.'),
        message: d.message
      }));
      return res.status(400).json({
        error: 'Validation failed',
        details: messages
      });
    }

    req[source] = value;
    next();
  };
};

// ==========================================
// EXPORT ALL SCHEMAS
// ==========================================

export const allSchemas = {
  ...userSchemas,
  ...compagnieSchemas,
  ...journalEntrySchemas,
  ...chartOfAccountSchemas,
  ...thirdPartySchemas,
  commonSchemas,
  validateData,
  validationMiddleware
};

export default allSchemas;

