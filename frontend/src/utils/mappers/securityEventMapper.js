/**
 * 🧠 SECURITY EVENT MAPPER - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend ↔ Frontend (strictement aligné)
 * Contrat: Basé sur securityEvent.dto.js du backend
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * DTO Backend (securityEvent.dto.js):
 * {
 *   id, userId, eventType, description, ipAddress, createdAt
 * }
 */

/**
 * 🔄 Mapper: DTO Backend → Frontend
 * Transforme les données du DTO backend en format frontend
 */
export const toFrontend = (securityEventDto, options = {}) => {
  if (!securityEventDto) return null;

  const {
    includeMetadata = true,
    formatDates = true,
    includeUserInfo = true,
    includeSeverity = true
  } = options;

  return {
    // Identité (toujours incluse)
    id: securityEventDto.id,
    
    // Événement
    eventType: securityEventDto.eventType || '',
    description: securityEventDto.description || '',
    
    // Utilisateur (optionnel)
    ...(includeUserInfo && {
      userId: securityEventDto.userId || null
    }),
    
    // Sécurité
    ipAddress: securityEventDto.ipAddress || '',
    
    // Sévérité (optionnelle)
    ...(includeSeverity && {
      severity: getEventSeverity(securityEventDto.eventType),
      severityLabel: getEventSeverityLabel(securityEventDto.eventType),
      isCritical: isCriticalEvent(securityEventDto.eventType)
    }),
    
    // Métadonnées (optionnelles)
    ...(includeMetadata && {
      createdAt: formatDates ? formatDate(securityEventDto.createdAt) : securityEventDto.createdAt
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
    
    // Événement
    eventType: frontendData.eventType || '',
    description: frontendData.description || '',
    
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
export const validate = (securityEventDto, options = {}) => {
  const { strict = false } = options;
  const errors = [];
  const warnings = [];

  // Champs obligatoires
  const requiredFields = ['id', 'eventType', 'description'];
  requiredFields.forEach(field => {
    if (!securityEventDto[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Types de données
  if (securityEventDto.id && typeof securityEventDto.id !== 'number') {
    errors.push('id must be a number');
  }

  if (securityEventDto.eventType && typeof securityEventDto.eventType !== 'string') {
    errors.push('eventType must be a string');
  }

  if (securityEventDto.description && typeof securityEventDto.description !== 'string') {
    errors.push('description must be a string');
  }

  if (securityEventDto.userId && typeof securityEventDto.userId !== 'number') {
    errors.push('userId must be a number');
  }

  // Validation du type d'événement
  const validEventTypes = [
    'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'PASSWORD_CHANGE',
    'ACCOUNT_LOCKED', 'ACCOUNT_UNLOCKED', 'PERMISSION_DENIED',
    'DATA_ACCESS', 'DATA_MODIFICATION', 'SECURITY_BREACH', 'SUSPICIOUS_ACTIVITY'
  ];
  if (securityEventDto.eventType && !validEventTypes.includes(securityEventDto.eventType)) {
    errors.push(`eventType must be one of: ${validEventTypes.join(', ')}`);
  }

  // Validation de la description
  if (securityEventDto.description && securityEventDto.description.length > 500) {
    errors.push('description must be less than 500 characters');
  }

  // Validation de l'adresse IP
  if (securityEventDto.ipAddress && !isValidIPAddress(securityEventDto.ipAddress)) {
    errors.push('ipAddress must be a valid IP address');
  }

  // Avertissements (mode strict)
  if (strict) {
    const allowedFields = [
      'id', 'userId', 'eventType', 'description', 'ipAddress', 'createdAt'
    ];

    Object.keys(securityEventDto).forEach(field => {
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
 * Mapping intelligent de tableaux d'événements de sécurité
 */
export const batchToFrontend = (securityEventDtos, options = {}) => {
  if (!Array.isArray(securityEventDtos)) return [];
  
  return securityEventDtos
    .map(dto => toFrontend(dto, options))
    .filter(Boolean);
};

export const batchToBackend = (frontendSecurityEvents, options = {}) => {
  if (!Array.isArray(frontendSecurityEvents)) return [];
  
  return frontendSecurityEvents
    .map(event => toBackend(event, options))
    .filter(Boolean);
};

/**
 * 🛡️ Safe Mapper: Avec fallback
 */
export const safeToFrontend = (securityEventDto, fallback = null, options = {}) => {
  try {
    return toFrontend(securityEventDto, options);
  } catch (error) {
    console.warn('SecurityEventMapper safeToFrontend error:', error.message);
    return fallback;
  }
};

export const safeToBackend = (frontendData, fallback = null, options = {}) => {
  try {
    return toBackend(frontendData, options);
  } catch (error) {
    console.warn('SecurityEventMapper safeToBackend error:', error.message);
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

const getEventSeverity = (eventType) => {
  const severityMap = {
    'LOGIN_SUCCESS': 'info',
    'LOGIN_FAILED': 'warning',
    'LOGOUT': 'info',
    'PASSWORD_CHANGE': 'info',
    'ACCOUNT_LOCKED': 'warning',
    'ACCOUNT_UNLOCKED': 'info',
    'PERMISSION_DENIED': 'warning',
    'DATA_ACCESS': 'info',
    'DATA_MODIFICATION': 'warning',
    'SECURITY_BREACH': 'critical',
    'SUSPICIOUS_ACTIVITY': 'critical'
  };
  return severityMap[eventType] || 'info';
};

const getEventSeverityLabel = (eventType) => {
  const labels = {
    'info': 'Information',
    'warning': 'Avertissement',
    'critical': 'Critique'
  };
  const severity = getEventSeverity(eventType);
  return labels[severity] || severity;
};

const isCriticalEvent = (eventType) => {
  const criticalEvents = ['SECURITY_BREACH', 'SUSPICIOUS_ACTIVITY'];
  return criticalEvents.includes(eventType);
};

/**
 * 🧪 Testeur de conformité
 */
export const testConformity = () => {
  const testDto = {
    id: 1,
    userId: 1,
    eventType: 'LOGIN_FAILED',
    description: 'Tentative de connexion échouée',
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
