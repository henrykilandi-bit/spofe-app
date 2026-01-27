/**
 * 🧠 USER MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur user.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (user.dto.js):
 * {
 *   id, roleId, companyId, username, email, firstName, lastName,
 *   phoneNumber, isActive, isLocked, lastLoginAt, passwordChangedAt,
 *   createdAt, updatedAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (userDto, options = {}) => {
  if (!userDto) return null;

  const {
    includeSensitive = false,
    includeMetadata = true,
    formatDates = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: userDto.id,
    username: userDto.username,
    email: userDto.email,
    
    // Profil utilisateur
    firstName: userDto.firstName || '',
    lastName: userDto.lastName || '',
    fullName: `${userDto.firstName || ''} ${userDto.lastName || ''}`.trim(),
    phoneNumber: userDto.phoneNumber || null,
    
    // Relations
    roleId: userDto.roleId || null,
    companyId: userDto.companyId || null,
    
    // État
    isActive: Boolean(userDto.isActive),
    isLocked: Boolean(userDto.isLocked),
    status: userDto.isLocked ? 'locked' : userDto.isActive ? 'active' : 'inactive',
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      lastLoginAt: formatDates ? formatDate(userDto.lastLoginAt) : userDto.lastLoginAt,
      passwordChangedAt: formatDates ? formatDate(userDto.passwordChangedAt) : userDto.passwordChangedAt,
      createdAt: formatDates ? formatDate(userDto.createdAt) : userDto.createdAt,
      updatedAt: formatDates ? formatDate(userDto.updatedAt) : userDto.updatedAt
    }),
    
    // Champs sensibles (uniquement si explicitement demandé)
    ...(includeSensitive && {
      // Aucun champ sensible pour le user (sécurité)
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
    username: frontendData.username,
    email: frontendData.email,
    
    // Profil
    firstName: frontendData.firstName || '',
    lastName: frontendData.lastName || '',
    phoneNumber: frontendData.phoneNumber || null,
    
    // Relations
    roleId: frontendData.roleId || null,
    companyId: frontendData.companyId || null,
    
    // État
    isActive: Boolean(frontendData.isActive),
    isLocked: Boolean(frontendData.isLocked)
  };

  // Métadonnées (optionnelles)
  if (includeMetadata) {
    backendDto.createdAt = frontendData.createdAt;
    backendDto.updatedAt = frontendData.updatedAt;
    backendDto.lastLoginAt = frontendData.lastLoginAt;
    backendDto.passwordChangedAt = frontendData.passwordChangedAt;
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
export const validate = (userDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'username', 'email'];
  requiredFields.forEach(field => {
    if (!userDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Format email
  if (userDto.email && !isValidEmail(userDto.email)) {
    errors.push('Invalid email format');
  }

  // Types de données
  if (userDto.id && typeof userDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (userDto.isActive !== undefined && typeof userDto.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
  }

  if (userDto.isLocked !== undefined && typeof userDto.isLocked !== 'boolean') {
    errors.push('isLocked must be a boolean');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'roleId', 'companyId', 'username', 'email', 'firstName', 'lastName',
      'phoneNumber', 'isActive', 'isLocked', 'lastLoginAt', 'passwordChangedAt',
      'createdAt', 'updatedAt'
    ];

    Object.keys(userDto).forEach(field => {
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
 * Mapping intelligent de tableaux d'utilisateurs
 */
export const batchToFrontend = (userDtos, options = {}) => {
  if (!Array.isArray(userDtos)) return [];
  
  return userDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendUsers, options = {}) => {
  if (!Array.isArray(frontendUsers)) return [];
  
  return frontendUsers
    .map(user => toBackend(user, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (userDto, fallback = null, options = {}) => {
  try {
    return toFrontend(userDto, options);
  } catch (error) {
    console.warn('UserMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('UserMapper safeToBackend error:', error.message);
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

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    roleId: 2,
    companyId: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '+33612345678',
    isActive: true,
    isLocked: false,
    lastLoginAt: '2026-01-27T10:00:00Z',
    passwordChangedAt: '2026-01-20T10:00:00Z',
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
