/**
 * 🧠 ROLE MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur role.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (role.dto.js):
 * {
 *   id, name, description, permissions, isActive, createdAt, updatedAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (roleDto, options = {}) => {
  if (!roleDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    includePermissions = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: roleDto.id,
    name: roleDto.name || '',
    description: roleDto.description || '',
    
    // État
    isActive: Boolean(roleDto.isActive),
    status: roleDto.isActive ? 'active' : 'inactive',
    
    // Permissions (optionnelles)
    ...(includePermissions && {
      permissions: Array.isArray(roleDto.permissions) ? roleDto.permissions : []
    }),
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(roleDto.createdAt) : roleDto.createdAt,
      updatedAt: formatDates ? formatDate(roleDto.updatedAt) : roleDto.updatedAt
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
    
    // État
    isActive: Boolean(frontendData.isActive),
    
    // Permissions
    permissions: Array.isArray(frontendData.permissions) ? frontendData.permissions : []
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
export const validate = (roleDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'name'];
  requiredFields.forEach(field => {
    if (!roleDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (roleDto.id && typeof roleDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (roleDto.name && typeof roleDto.name !== 'string') {
    errors.push('name must be a string');
  }

  if (roleDto.isActive !== undefined && typeof roleDto.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  // Validation des permissions
  if (roleDto.permissions && !Array.isArray(roleDto.permissions)) {
    errors.push('permissions must be an array');
  }

  // Validation du nom (format)
  if (roleDto.name && !/^[a-zA-Z0-9_\-\s]{2,50}$/.test(roleDto.name)) {
    errors.push('name must be 2-50 characters (letters, numbers, spaces, hyphens, underscores)');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'name', 'description', 'permissions', 'isActive', 'createdAt', 'updatedAt'
    ];

    Object.keys(roleDto).forEach(field => {
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
 * Mapping intelligent de tableaux de rôles
 */
export const batchToFrontend = (roleDtos, options = {}) => {
  if (!Array.isArray(roleDtos)) return [];
  
  return roleDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendRoles, options = {}) => {
  if (!Array.isArray(frontendRoles)) return [];
  
  return frontendRoles
    .map(role => toBackend(role, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (roleDto, fallback = null, options = {}) => {
  try {
    return toFrontend(roleDto, options);
  } catch (error) {
    console.warn('RoleMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('RoleMapper safeToBackend error:', error.message);
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
    name: 'admin',
    description: 'Administrateur système',
    permissions: ['read', 'write', 'delete', 'admin'],
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
