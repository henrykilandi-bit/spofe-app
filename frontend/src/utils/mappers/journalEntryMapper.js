/**
 * 🧠 JOURNAL ENTRY MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur journalEntry.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (journalEntry.dto.js):
 * {
 *   id, companyId, reference, description, entryDate, 
 *   status, totalAmount, createdBy, createdAt, updatedAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (journalEntryDto, options = {}) => {
  if (!journalEntryDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    includeAudit = true,
    formatCurrency = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: journalEntryDto.id,
    reference: journalEntryDto.reference || '',
    description: journalEntryDto.description || '',
    
    // Relations
    companyId: journalEntryDto.companyId || null,
    
    // Dates
    entryDate: formatDates ? formatDate(journalEntryDto.entryDate) : journalEntryDto.entryDate,
    
    // Montants
    totalAmount: formatCurrency ? formatAmount(journalEntryDto.totalAmount) : journalEntryDto.totalAmount,
    
    // État
    status: journalEntryDto.status || 'draft',
    statusLabel: getStatusLabel(journalEntryDto.status),
    
    // Audit (optionnel)
    ...(includeAudit && {
      createdBy: journalEntryDto.createdBy || null
    }),
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(journalEntryDto.createdAt) : journalEntryDto.createdAt,
      updatedAt: formatDates ? formatDate(journalEntryDto.updatedAt) : journalEntryDto.updatedAt
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
    reference: frontendData.reference || '',
    description: frontendData.description || '',
    
    // Relations
    companyId: frontendData.companyId || null,
    
    // Dates
    entryDate: frontendData.entryDate,
    
    // Montants
    totalAmount: parseAmount(frontendData.totalAmount),
    
    // État
    status: frontendData.status || 'draft'
  };

  // Audit (optionnel)
  if (frontendData.createdBy) {
    backendDto.createdBy = frontendData.createdBy;
  }

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
export const validate = (journalEntryDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'companyId', 'entryDate'];
  requiredFields.forEach(field => {
    if (!journalEntryDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (journalEntryDto.id && typeof journalEntryDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (journalEntryDto.companyId && typeof journalEntryDto.companyId !== 'number') {
    errors.push('companyId must be a number');
  }

  if (journalEntryDto.totalAmount && typeof journalEntryDto.totalAmount !== 'number') {
    errors.push('totalAmount must be a number');
  }

  // Validation du statut
  const validStatuses = ['draft', 'validated', 'posted', 'cancelled'];
  if (journalEntryDto.status && !validStatuses.includes(journalEntryDto.status)) {
    errors.push(`status must be one of: ${validStatuses.join(', ')}`);
  }

  // Validation de la date
  if (journalEntryDto.entryDate && !isValidDate(journalEntryDto.entryDate)) {
    errors.push('entryDate must be a valid date');
  }

  // Validation du montant
  if (journalEntryDto.totalAmount && journalEntryDto.totalAmount < 0) {
    errors.push('totalAmount must be positive');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'companyId', 'reference', 'description', 'entryDate',
      'status', 'totalAmount', 'createdBy', 'createdAt', 'updatedAt'
    ];

    Object.keys(journalEntryDto).forEach(field => {
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
 * Mapping intelligent de tableaux d'écritures comptables
 */
export const batchToFrontend = (journalEntryDtos, options = {}) => {
  if (!Array.isArray(journalEntryDtos)) return [];
  
  return journalEntryDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendJournalEntries, options = {}) => {
  if (!Array.isArray(frontendJournalEntries)) return [];
  
  return frontendJournalEntries
    .map(entry => toBackend(entry, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (journalEntryDto, fallback = null, options = {}) => {
  try {
    return toFrontend(journalEntryDto, options);
  } catch (error) {
    console.warn('JournalEntryMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('JournalEntryMapper safeToBackend error:', error.message);
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
  if (amount === null || amount === undefined) return 0;
  return Number(amount).toFixed(2);
};

const parseAmount = (amount) => {
  if (amount === null || amount === undefined) return 0;
  return Number(amount) || 0;
};

const getStatusLabel = (status) => {
  const labels = {
    draft: 'Brouillon',
    validated: 'Validé',
    posted: 'Comptabilisé',
    cancelled: 'Annulé'
  };
  return labels[status] || status;
};

const isValidDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    companyId: 1,
    reference: 'EC2026-001',
    description: 'Écriture de test',
    entryDate: '2026-01-27',
    status: 'draft',
    totalAmount: 1000.00,
    createdBy: 1,
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
