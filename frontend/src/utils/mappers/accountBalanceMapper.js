/**
 * 🧠 ACCOUNT BALANCE MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur accountBalance.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (accountBalance.dto.js):
 * {
 *   id, accountId, debitBalance, creditBalance, period, createdAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (accountBalanceDto, options = {}) => {
  if (!accountBalanceDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    formatCurrency = true,
    includeCalculations = true
  } = options;

  // Calculs dérivés
  const netBalance = (accountBalanceDto.debitBalance || 0) - (accountBalanceDto.creditBalance || 0);

  return {
    // Identité (toujours incluse)
    id: accountBalanceDto.id,
    
    // Relations
    accountId: accountBalanceDto.accountId || null,
    
    // Soldes
    debitBalance: formatCurrency ? formatAmount(accountBalanceDto.debitBalance) : accountBalanceDto.debitBalance,
    creditBalance: formatCurrency ? formatAmount(accountBalanceDto.creditBalance) : accountBalanceDto.creditBalance,
    
    // Période
    period: accountBalanceDto.period || '',
    
    // Calculs dérivés (optionnels)
    ...(includeCalculations && {
      netBalance: formatCurrency ? formatAmount(netBalance) : netBalance,
      balanceType: netBalance >= 0 ? 'debit' : 'credit',
      hasBalance: netBalance !== 0
    }),
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(accountBalanceDto.createdAt) : accountBalanceDto.createdAt
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
    
    // Relations
    accountId: frontendData.accountId || null,
    
    // Soldes
    debitBalance: parseAmount(frontendData.debitBalance),
    creditBalance: parseAmount(frontendData.creditBalance),
    
    // Période
    period: frontendData.period || ''
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
export const validate = (accountBalanceDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'accountId'];
  requiredFields.forEach(field => {
    if (!accountBalanceDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (accountBalanceDto.id && typeof accountBalanceDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (accountBalanceDto.accountId && typeof accountBalanceDto.accountId !== 'number') {
    errors.push('accountId must be a number');
  }

  if (accountBalanceDto.debitBalance !== undefined && typeof accountBalanceDto.debitBalance !== 'number') {
    errors.push('debitBalance must be a number');
  }

  if (accountBalanceDto.creditBalance !== undefined && typeof accountBalanceDto.creditBalance !== 'number') {
    errors.push('creditBalance must be a number');
  }

  // Validation des soldes (positifs ou nuls)
  if (accountBalanceDto.debitBalance !== null && accountBalanceDto.debitBalance < 0) {
    errors.push('debitBalance must be positive or zero');
  }

  if (accountBalanceDto.creditBalance !== null && accountBalanceDto.creditBalance < 0) {
    errors.push('creditBalance must be positive or zero');
  }

  // Validation de la période (format YYYY-MM)
  if (accountBalanceDto.period && !/^[0-9]{4}-[0-9]{2}$/.test(accountBalanceDto.period)) {
    errors.push('period must be in YYYY-MM format');
  }

  // Validation logique: au moins un solde non nul
  const hasDebit = accountBalanceDto.debitBalance > 0;
  const hasCredit = accountBalanceDto.creditBalance > 0;
  if (!hasDebit && !hasCredit) {
    warnings.push('Both debitBalance and creditBalance are zero');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'accountId', 'debitBalance', 'creditBalance', 'period', 'createdAt'
    ];

    Object.keys(accountBalanceDto).forEach(field => {
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
 * Mapping intelligent de tableaux de soldes
 */
export const batchToFrontend = (accountBalanceDtos, options = {}) => {
  if (!Array.isArray(accountBalanceDtos)) return [];
  
  return accountBalanceDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendAccountBalances, options = {}) => {
  if (!Array.isArray(frontendAccountBalances)) return [];
  
  return frontendAccountBalances
    .map(balance => toBackend(balance, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (accountBalanceDto, fallback = null, options = {}) => {
  try {
    return toFrontend(accountBalanceDto, options);
  } catch (error) {
    console.warn('AccountBalanceMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('AccountBalanceMapper safeToBackend error:', error.message);
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

const formatAmount = (amount) => {
  if (amount === null || amount === undefined) return '0.00';
  return Number(amount).toFixed(2);
};

const parseAmount = (amount) => {
  if (amount === null || amount === undefined) return 0;
  return Number(amount) || 0;
};

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    accountId: 101000,
    debitBalance: 10000.00,
    creditBalance: 0.00,
    period: '2026-01',
    createdAt: '2026-01-27T10:00:00Z'
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
