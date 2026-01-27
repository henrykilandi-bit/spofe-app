/**
 * 🧠 CHART OF ACCOUNT MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur chartOfAccount.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (chartOfAccount.dto.js):
 * {
 *   id, companyId, accountNumber, label, accountType, createdAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (chartOfAccountDto, options = {}) => {
  if (!chartOfAccountDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    includeTypeInfo = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: chartOfAccountDto.id,
    accountNumber: chartOfAccountDto.accountNumber || '',
    label: chartOfAccountDto.label || '',
    
    // Relations
    companyId: chartOfAccountDto.companyId || null,
    
    // Type de compte (optionnel)
    ...(includeTypeInfo && {
      accountType: chartOfAccountDto.accountType || '',
      accountTypeLabel: getAccountTypeLabel(chartOfAccountDto.accountType),
      accountCategory: getAccountCategory(chartOfAccountDto.accountType)
    }),
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(chartOfAccountDto.createdAt) : chartOfAccountDto.createdAt
    })
  };
};

/**
 * 🔄 Mapper: Frontend → DTO Backend
 * Transforme les données du frontend en format DTO backend
 */
export const toBackend = (frontendData, options = {}) => {
  if (!frontendData) return null;

  const {
    includeMetadata = true,
    validateFields = true
  } = options;

  const backendDto = {
    // Identité
    id: frontendData.id,
    accountNumber: frontendData.accountNumber || '',
    label: frontendData.label || '',
    
    // Relations
    companyId: frontendData.companyId || null,
    
    // Type de compte
    accountType: frontendData.accountType || ''
  };

  // Métadonnées (optionnelles)
  if (includeMetadata) {
    backendDto.createdAt = frontendData.createdAt;
  }

  // Validation si demandée
  if (validateFields) {
    const validation = validate(backendDto);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
  }

  return backendDto;
};

/**
 * ✅ Validateur: DTO Backend
 * Valide la conformité avec le contrat DTO
 */
export const validate = (chartOfAccountDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'accountNumber', 'label'];
  requiredFields.forEach(field => {
    if (!chartOfAccountDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (chartOfAccountDto.id && typeof chartOfAccountDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (chartOfAccountDto.accountNumber && typeof chartOfAccountDto.accountNumber !== 'string') {
    errors.push('accountNumber must be a string');
  }

  if (chartOfAccountDto.label && typeof chartOfAccountDto.label !== 'string') {
    errors.push('label must be a string');
  }

  // Validation du numéro de compte
  if (chartOfAccountDto.accountNumber && !/^[0-9]{1,6}$/.test(chartOfAccountDto.accountNumber)) {
    errors.push('accountNumber must be 1-6 digits');
  }

  // Validation du type de compte
  const validAccountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
  if (chartOfAccountDto.accountType && !validAccountTypes.includes(chartOfAccountDto.accountType)) {
    errors.push(`accountType must be one of: ${validAccountTypes.join(', ')}`);
  }

  // Validation du libellé
  if (chartOfAccountDto.label && chartOfAccountDto.label.length > 200) {
    errors.push('label must be less than 200 characters');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'companyId', 'accountNumber', 'label', 'accountType', 'createdAt'
    ];

    Object.keys(chartOfAccountDto).forEach(field => {
      if (!allowedFields.includes(field)) {
        warnings.push(`Unexpected field: ${field}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2))
  };
};

/**
 * 🔄 Mapper: Tableau (Batch)
 * Mapping intelligent de tableaux de comptes
 */
export const batchToFrontend = (chartOfAccountDtos, options = {}) => {
  if (!Array.isArray(chartOfAccountDtos)) return [];
  
  return chartOfAccountDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendChartOfAccounts, options = {}) => {
  if (!Array.isArray(frontendChartOfAccounts)) return [];
  
  return frontendChartOfAccounts
    .map(account => toBackend(account, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (chartOfAccountDto, fallback = null, options = {}) => {
  try {
    return toFrontend(chartOfAccountDto, options);
  } catch (error) {
    console.warn('ChartOfAccountMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('ChartOfAccountMapper safeToBackend error:', error.message);
    return fallback;
  }
};

// 🛠️ Utilitaires
const formatDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch {
    return dateString;
  }
};

const getAccountTypeLabel = (accountType) => {
  const labels = {
    asset: 'Actif',
    liability: 'Passif',
    equity: 'Capitaux propres',
    revenue: 'Produits',
    expense: 'Charges'
  };
  return labels[accountType] || accountType;
};

const getAccountCategory = (accountType) => {
  const categories = {
    asset: 'balance_sheet',
    liability: 'balance_sheet',
    equity: 'balance_sheet',
    revenue: 'income_statement',
    expense: 'income_statement'
  };
  return categories[accountType] || 'other';
};

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    companyId: 1,
    accountNumber: '101000',
    label: 'Capital social',
    accountType: 'equity',
    createdAt: '2026-01-01T10:00:00Z'
  };

  const frontend = toFrontend(testDto);
  const backend = toBackend(frontend);
  const validation = validate(backend);

  return {
    original: testDto,
    frontend,
    roundTrip: backend,
    validation,
    conformity: validation.isValid ? '✅ CONFORM' : '❌ NON-CONFORM'
  };
};

// Export par défaut
export default {
  toFrontend,
  toBackend,
  validate,
  batchToFrontend,
  batchToBackend,
  safeToFrontend,
  safeToBackend,
  testConformity
};
