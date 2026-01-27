/**
 * 🧠 JOURNAL ENTRY LINE MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur journalEntryLine.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (journalEntryLine.dto.js):
 * {
 *   id, journalEntryId, accountId, debitAmount, creditAmount,
 *   description, reference, createdAt, updatedAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (journalEntryLineDto, options = {}) => {
  if (!journalEntryLineDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    formatCurrency = true,
    includeCalculations = true
  } = options;

  // Calculs dérivés
  const netAmount = (journalEntryLineDto.debitAmount || 0) - (journalEntryLineDto.creditAmount || 0);
  const hasAmount = (journalEntryLineDto.debitAmount || 0) > 0 || (journalEntryLineDto.creditAmount || 0) > 0;

  return {
    // Identité (toujours incluse)
    id: journalEntryLineDto.id,
    
    // Relations
    journalEntryId: journalEntryLineDto.journalEntryId || null,
    accountId: journalEntryLineDto.accountId || null,
    
    // Montants
    debitAmount: formatCurrency ? formatAmount(journalEntryLineDto.debitAmount) : journalEntryLineDto.debitAmount,
    creditAmount: formatCurrency ? formatAmount(journalEntryLineDto.creditAmount) : journalEntryLineDto.creditAmount,
    
    // Détails
    description: journalEntryLineDto.description || '',
    reference: journalEntryLineDto.reference || '',
    
    // Calculs dérivés (optionnels)
    ...(includeCalculations && {
      netAmount: formatCurrency ? formatAmount(netAmount) : netAmount,
      amountType: netAmount >= 0 ? 'debit' : 'credit',
      hasBalance: hasAmount,
      isBalanced: (journalEntryLineDto.debitAmount || 0) === (journalEntryLineDto.creditAmount || 0)
    }),
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(journalEntryLineDto.createdAt) : journalEntryLineDto.createdAt,
      updatedAt: formatDates ? formatDate(journalEntryLineDto.updatedAt) : journalEntryLineDto.updatedAt
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
    journalEntryId: frontendData.journalEntryId || null,
    accountId: frontendData.accountId || null,
    
    // Montants
    debitAmount: parseAmount(frontendData.debitAmount),
    creditAmount: parseAmount(frontendData.creditAmount),
    
    // Détails
    description: frontendData.description || '',
    reference: frontendData.reference || ''
  };

  // Métadonnées (optionnelles)
  if (includeMetadata) {
    backendDto.createdAt = frontendData.createdAt;
    backendDto.updatedAt = frontendData.updatedAt;
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
export const validate = (journalEntryLineDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'journalEntryId', 'accountId'];
  requiredFields.forEach(field => {
    if (!journalEntryLineDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (journalEntryLineDto.id && typeof journalEntryLineDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (journalEntryLineDto.journalEntryId && typeof journalEntryLineDto.journalEntryId !== 'number') {
    errors.push('journalEntryId must be a number');
  }

  if (journalEntryLineDto.accountId && typeof journalEntryLineDto.accountId !== 'number') {
    errors.push('accountId must be a number');
  }

  if (journalEntryLineDto.debitAmount !== undefined && typeof journalEntryLineDto.debitAmount !== 'number') {
    errors.push('debitAmount must be a number');
  }

  if (journalEntryLineDto.creditAmount !== undefined && typeof journalEntryLineDto.creditAmount !== 'number') {
    errors.push('creditAmount must be a number');
  }

  // Validation des montants (positifs ou nuls)
  if (journalEntryLineDto.debitAmount !== null && journalEntryLineDto.debitAmount < 0) {
    errors.push('debitAmount must be positive or zero');
  }

  if (journalEntryLineDto.creditAmount !== null && journalEntryLineDto.creditAmount < 0) {
    errors.push('creditAmount must be positive or zero');
  }

  // Validation logique: au moins un montant non nul
  const hasDebit = (journalEntryLineDto.debitAmount || 0) > 0;
  const hasCredit = (journalEntryLineDto.creditAmount || 0) > 0;
  if (!hasDebit && !hasCredit) {
    errors.push('At least one of debitAmount or creditAmount must be positive');
  }

  // Validation logique: pas les deux montants positifs
  if (hasDebit && hasCredit) {
    warnings.push('Both debitAmount and creditAmount are positive - this may indicate an error');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'journalEntryId', 'accountId', 'debitAmount', 'creditAmount',
      'description', 'reference', 'createdAt', 'updatedAt'
    ];

    Object.keys(journalEntryLineDto).forEach(field => {
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
 * Mapping intelligent de tableaux de lignes d'écriture
 */
export const batchToFrontend = (journalEntryLineDtos, options = {}) => {
  if (!Array.isArray(journalEntryLineDtos)) return [];
  
  return journalEntryLineDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendJournalEntryLines, options = {}) => {
  if (!Array.isArray(frontendJournalEntryLines)) return [];
  
  return frontendJournalEntryLines
    .map(line => toBackend(line, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (journalEntryLineDto, fallback = null, options = {}) => {
  try {
    return toFrontend(journalEntryLineDto, options);
  } catch (error) {
    console.warn('JournalEntryLineMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('JournalEntryLineMapper safeToBackend error:', error.message);
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
    journalEntryId: 1,
    accountId: 101000,
    debitAmount: 1000.00,
    creditAmount: 0.00,
    description: 'Ligne de test',
    reference: 'REF001',
    createdAt: '2026-01-27T10:00:00Z',
    updatedAt: '2026-01-27T10:00:00Z'
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
