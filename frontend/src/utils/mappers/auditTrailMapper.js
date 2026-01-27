/**
 * 🧠 AUDIT TRAIL MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur auditTrail.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (auditTrail.dto.js):
 * {
 *   id, userId, action, entity, entityId, ipAddress, createdAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (auditTrailDto, options = {}) => {
  if (!auditTrailDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    includeUserInfo = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: auditTrailDto.id,
    
    // Action et entité
    action: auditTrailDto.action || '',
    entity: auditTrailDto.entity || '',
    entityId: auditTrailDto.entityId || null,
    
    // Utilisateur (optionnel)
    ...(includeUserInfo && {
      userId: auditTrailDto.userId || null
    }),
    
    // Sécurité
    ipAddress: auditTrailDto.ipAddress || '',
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(auditTrailDto.createdAt) : auditTrailDto.createdAt
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
    
    // Action et entité
    action: frontendData.action || '',
    entity: frontendData.entity || '',
    entityId: frontendData.entityId || null,
    
    // Utilisateur
    userId: frontendData.userId || null,
    
    // Sécurité
    ipAddress: frontendData.ipAddress || ''
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
export const validate = (auditTrailDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'action', 'entity'];
  requiredFields.forEach(field => {
    if (!auditTrailDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (auditTrailDto.id && typeof auditTrailDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (auditTrailDto.action && typeof auditTrailDto.action !== 'string') {
    errors.push('action must be a string');
  }

  if (auditTrailDto.entity && typeof auditTrailDto.entity !== 'string') {
    errors.push('entity must be a string');
  }

  if (auditTrailDto.userId && typeof auditTrailDto.userId !== 'number') {
    errors.push('userId must be a number');
  }

  if (auditTrailDto.entityId && typeof auditTrailDto.entityId !== 'number') {
    errors.push('entityId must be a number');
  }

  // Validation de l'action
  const validActions = ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'];
  if (auditTrailDto.action && !validActions.includes(auditTrailDto.action.toUpperCase())) {
    warnings.push(`action should be one of: ${validActions.join(', ')}`);
  }

  // Validation de l'entité
  const validEntities = ['user', 'company', 'journal_entry', 'chart_of_account', 'role', 'group'];
  if (auditTrailDto.entity && !validEntities.includes(auditTrailDto.entity)) {
    warnings.push(`entity should be one of: ${validEntities.join(', ')}`);
  }

  // Validation de l'adresse IP
  if (auditTrailDto.ipAddress && !isValidIPAddress(auditTrailDto.ipAddress)) {
    errors.push('ipAddress must be a valid IP address');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'userId', 'action', 'entity', 'entityId', 'ipAddress', 'createdAt'
    ];

    Object.keys(auditTrailDto).forEach(field => {
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
 * Mapping intelligent de tableaux d'audits
 */
export const batchToFrontend = (auditTrailDtos, options = {}) => {
  if (!Array.isArray(auditTrailDtos)) return [];
  
  return auditTrailDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendAuditTrails, options = {}) => {
  if (!Array.isArray(frontendAuditTrails)) return [];
  
  return frontendAuditTrails
    .map(audit => toBackend(audit, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (auditTrailDto, fallback = null, options = {}) => {
  try {
    return toFrontend(auditTrailDto, options);
  } catch (error) {
    console.warn('AuditTrailMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('AuditTrailMapper safeToBackend error:', error.message);
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

const isValidIPAddress = (ip) => {
  // IPv4 regex simple
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    userId: 1,
    action: 'CREATE',
    entity: 'user',
    entityId: 2,
    ipAddress: '192.168.1.100',
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
