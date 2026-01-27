/**
 * 🧠 GROUP MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur group.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (group.dto.js):
 * {
 *   id, name, description, country, isActive, createdAt, updatedAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (groupDto, options = {}) => {
  if (!groupDto) return null;

  const {
    includeMetadata = true,
    formatDates = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: groupDto.id,
    name: groupDto.name || '',
    description: groupDto.description || '',
    
    // Localisation
    country: groupDto.country || '',
    
    // État
    isActive: Boolean(groupDto.isActive),
    status: groupDto.isActive ? 'active' : 'inactive',
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(groupDto.createdAt) : groupDto.createdAt,
      updatedAt: formatDates ? formatDate(groupDto.updatedAt) : groupDto.updatedAt
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
    name: frontendData.name || '',
    description: frontendData.description || '',
    
    // Localisation
    country: frontendData.country || '',
    
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
export const validate = (groupDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'name'];
  requiredFields.forEach(field => {
    if (!groupDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (groupDto.id && typeof groupDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (groupDto.name && typeof groupDto.name !== 'string') {
    errors.push('name must be a string');
  }

  if (groupDto.isActive !== undefined && typeof groupDto.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  // Validation du nom (format)
  if (groupDto.name && !/^[a-zA-Z0-9_\-\s]{2,100}$/.test(groupDto.name)) {
    errors.push('name must be 2-100 characters (letters, numbers, spaces, hyphens, underscores)');
  }

  // Validation du pays (si présent)
  if (groupDto.country && !/^[A-Z]{2,3}$/.test(groupDto.country)) {
    errors.push('country must be a 2-3 letter ISO country code');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'name', 'description', 'country', 'isActive', 'createdAt', 'updatedAt'
    ];

    Object.keys(groupDto).forEach(field => {
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
 * Mapping intelligent de tableaux de groupes
 */
export const batchToFrontend = (groupDtos, options = {}) => {
  if (!Array.isArray(groupDtos)) return [];
  
  return groupDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendGroups, options = {}) => {
  if (!Array.isArray(frontendGroups)) return [];
  
  return frontendGroups
    .map(group => toBackend(group, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (groupDto, fallback = null, options = {}) => {
  try {
    return toFrontend(groupDto, options);
  } catch (error) {
    console.warn('GroupMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('GroupMapper safeToBackend error:', error.message);
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
    name: 'Groupe SPOFE France',
    description: 'Groupe des entreprises françaises',
    country: 'FRA',
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
