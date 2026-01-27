/**
 * 🧠 INTELLIGENT MAPPERS - SPOFE v2.2
 * 
 * Rôle: Mapping DTO Backend (camelCase) ↔ Frontend (camelCase)
 * Contrat: Strictement aligné avec les DTO SPOFE
 * Approche: Non destructive, intelligente, cohérente, alignée
 * 
 * Structure:
 * - userMapper.js
 * - roleMapper.js
 * - companyMapper.js
 * - groupMapper.js
 * - journalEntryMapper.js
 * - journalEntryLineMapper.js
 * - chartOfAccountMapper.js
 * - accountBalanceMapper.js
 * - auditTrailMapper.js
 * - securityEventMapper.js
 */

export * from './userMapper.js';
export * from './roleMapper.js';
export * from './companyMapper.js';
export * from './groupMapper.js';
export * from './journalEntryMapper.js';
export * from './journalEntryLineMapper.js';
export * from './chartOfAccountMapper.js';
export * from './accountBalanceMapper.js';
export * from './auditTrailMapper.js';
export * from './securityEventMapper.js';

/**
 * 🧠 MAPPER FACTORY - Création intelligente de mappers
 */
export const createMapper = async (mapperType, options = {}) => {
  const mappers = {
    user: await import('./userMapper.js'),
    role: await import('./roleMapper.js'),
    company: await import('./companyMapper.js'),
    group: await import('./groupMapper.js'),
    journalEntry: await import('./journalEntryMapper.js'),
    journalEntryLine: await import('./journalEntryLineMapper.js'),
    chartOfAccount: await import('./chartOfAccountMapper.js'),
    accountBalance: await import('./accountBalanceMapper.js'),
    auditTrail: await import('./auditTrailMapper.js'),
    securityEvent: await import('./securityEventMapper.js')
  };

  const mapper = mappers[mapperType];
  if (!mapper) {
    throw new Error(`Mapper not found: ${mapperType}`);
  }

  return {
    toFrontend: (data) => mapper.default.toFrontend(data, options),
    toBackend: (data) => mapper.default.toBackend(data, options),
    validate: (data) => mapper.default.validate(data, options)
  };
};

/**
 * 🔄 BATCH MAPPER - Mapping intelligent de tableaux
 */
export const batchMapper = async (mapperType, dataArray, options = {}) => {
  const mapper = await createMapper(mapperType, options);
  
  if (!Array.isArray(dataArray)) {
    return [];
  }

  return dataArray
    .map(item => mapper.toFrontend(item))
    .filter(Boolean);
};

/**
 * 🛡️ SAFE MAPPER - Mapping avec validation et fallback
 */
export const safeMapper = async (mapperType, data, fallback = null, options = {}) => {
  try {
    const mapper = await createMapper(mapperType, options);
    const result = mapper.toFrontend(data);
    return result || fallback;
  } catch (error) {
    console.warn(`Mapper error for ${mapperType}:`, error.message);
    return fallback;
  }
};
