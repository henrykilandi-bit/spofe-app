/**
 * 🧠 COMPANY MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur company.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (company.dto.js):
 * {
 *   id, groupId, code, name, legalForm, taxId, country, 
 *   currency, isActive, createdAt, updatedAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (companyDto, options = {}) => {
  if (!companyDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    includeLegalInfo = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: companyDto.id,
    code: companyDto.code || '',
    name: companyDto.name || '',
    
    // Relations
    groupId: companyDto.groupId || null,
    
    // Informations légales (optionnelles)
    ...(includeLegalInfo && {
      legalForm: companyDto.legalForm || '',
      taxId: companyDto.taxId || ''
    }),
    
    // Localisation
    country: companyDto.country || '',
    currency: companyDto.currency || 'EUR',
    
    // État
    isActive: Boolean(companyDto.isActive),
    status: companyDto.isActive ? 'active' : 'inactive',
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(companyDto.createdAt) : companyDto.createdAt,
      updatedAt: formatDates ? formatDate(companyDto.updatedAt) : companyDto.updatedAt
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
    code: frontendData.code || '',
    name: frontendData.name || '',
    
    // Relations
    groupId: frontendData.groupId || null,
    
    // Informations légales
    legalForm: frontendData.legalForm || '',
    taxId: frontendData.taxId || '',
    
    // Localisation
    country: frontendData.country || '',
    currency: frontendData.currency || 'EUR',
    
    // État
    isActive: Boolean(frontendData.isActive)
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
export const validate = (companyDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'name'];
  requiredFields.forEach(field => {
    if (!companyDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (companyDto.id && typeof companyDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (companyDto.name && typeof companyDto.name !== 'string') {
    errors.push('name must be a string');
  }

  if (companyDto.isActive !== undefined && typeof companyDto.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  // Validation du code (si présent)
  if (companyDto.code && !/^[A-Z0-9]{3,10}$/.test(companyDto.code)) {
    errors.push('code must be 3-10 uppercase alphanumeric characters');
  }

  // Validation de la devise
  if (companyDto.currency && !/^[A-Z]{3}$/.test(companyDto.currency)) {
    errors.push('currency must be a 3-letter ISO currency code');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'groupId', 'code', 'name', 'legalForm', 'taxId', 
      'country', 'currency', 'isActive', 'createdAt', 'updatedAt'
    ];

    Object.keys(companyDto).forEach(field => {
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
 * Mapping intelligent de tableaux d'entreprises
 */
export const batchToFrontend = (companyDtos, options = {}) => {
  if (!Array.isArray(companyDtos)) return [];
  
  return companyDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendCompanies, options = {}) => {
  if (!Array.isArray(frontendCompanies)) return [];
  
  return frontendCompanies
    .map(company => toBackend(company, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (companyDto, fallback = null, options = {}) => {
  try {
    return toFrontend(companyDto, options);
  } catch (error) {
    console.warn('CompanyMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('CompanyMapper safeToBackend error:', error.message);
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

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    groupId: 2,
    code: 'COMP001',
    name: 'SPOFE Corporation',
    legalForm: 'SAS',
    taxId: 'FR12345678901',
    country: 'France',
    currency: 'EUR',
    isActive: true,
    createdAt: '2026-01-01T10:00:00Z',
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
