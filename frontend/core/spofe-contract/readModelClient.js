/**
 * Read-model Client
 * 
 * Point d'entrée pour toutes les lectures (Read-models)
 * Valide contre le contrat avant envoi
 */

import { loadContract, getLoadedContract } from './contractLoader.js';
import { ContractViolation, VIOLATIONS, logViolation } from './violations.js';
import { INTERNAL_FETCH } from '../internal-fetch.js';

/**
 * Lit un read-model depuis le backend
 * 
 * @param {string} endpoint - Chemin du read-model (ex: "/aggregates/active")
 * @param {Object} options - Options additionnelles (query params, cache, etc)
 * @returns {Promise<Object>} Données du read-model
 * @throws {ContractViolation} Si le read-model n'est pas autorisé
 * @throws {Error} Si le backend retourne une erreur
 * 
 * @example
 *   try {
 *     const aggregates = await readModel('/aggregates/active');
 *     console.log('Aggregates:', aggregates);
 *   } catch (error) {
 *     if (error instanceof ContractViolation) {
 *       console.error('Contract violation:', error.message);
 *     } else {
 *       console.error('Backend error:', error.message);
 *     }
 *   }
 * 
 * @example
 *   // Avec query params
 *   const limited = await readModel('/aggregates/active', {
 *     queryParams: { limit: 10, offset: 20 }
 *   });
 */
export async function readModel(endpoint, options = {}) {
  // Valider le contrat
  const contract = await loadContract();

  // Vérifier que le read-model est autorisé
  _validateReadModelAccess(endpoint, contract);

  // Construire l'URL avec query params si fournis
  const url = _buildReadModelUrl(endpoint, options.queryParams);

  // Vérifier le cache si enabled
  if (options.useCache !== false) {
    const cached = _getFromCache(url);
    if (cached) {
      return cached;
    }
  }

  // Envoyer la requête
  const response = await _sendHttpRequest(url, options);

  // Mettre en cache si enabled
  if (options.useCache !== false) {
    _setInCache(url, response, options.cacheTTL);
  }

  return response;
}

/**
 * Alias pour readModel (noms alternatifs)
 */
export const fetchReadModel = readModel;
export const getReadModel = readModel;

/**
 * Valide que le read-model est autorisé par le contrat
 * @private
 */
function _validateReadModelAccess(endpoint, contract) {
  const allowed = contract.readModels.some(pattern =>
    _matchesPattern(endpoint, pattern)
  );

  if (!allowed) {
    const violation = new ContractViolation(
      VIOLATIONS.READ_MODEL_NOT_ALLOWED,
      `Read-model '${endpoint}' is not allowed by SPOFE contract v${contract.version}`,
      {
        endpoint,
        contractVersion: contract.version,
        allowedReadModels: contract.readModels
      }
    );

    logViolation(violation);
    throw violation;
  }
}

/**
 * Teste si un endpoint correspond à un pattern (avec support des paramètres)
 * 
 * @private
 * @example
 *   _matchesPattern('/aggregates/123', '/aggregates/{id}') // true
 *   _matchesPattern('/aggregates/123', '/aggregates') // false
 */
function _matchesPattern(endpoint, pattern) {
  // Remplacer {id}, {uuid}, etc par regex
  const regexPattern = pattern
    .replace(/\{[^}]+\}/g, '[^/]+')
    .replace(/\//g, '\\/')
    .replace(/\*/g, '.*');

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(endpoint);
}

/**
 * Construit l'URL avec query params
 * @private
 */
function _buildReadModelUrl(endpoint, queryParams = {}) {
  const params = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
}

/**
 * Envoie une requête HTTP GET de manière sûre
 * @private
 */
async function _sendHttpRequest(url, options = {}) {
  const token = _getAuthToken();

  if (!token) {
    const violation = new ContractViolation(
      VIOLATIONS.MISSING_AUTHORIZATION,
      'Missing authorization token. Cannot communicate with SPOFE backend.'
    );
    logViolation(violation);
    throw violation;
  }

  const fetchOptions = {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await INTERNAL_FETCH(url, fetchOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `${response.status} ${response.statusText}`
      }));

      const error = new Error(errorData.message || 'Read-model request failed');
      error.status = response.status;
      error.code = errorData.code;
      error.details = errorData;

      throw error;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Network error while fetching read-model: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Récupère le token d'authentification
 * @private
 */
function _getAuthToken() {
  let token = localStorage.getItem('spofe_token') || 
              localStorage.getItem('auth_token');

  if (!token) {
    token = sessionStorage.getItem('spofe_token') ||
            sessionStorage.getItem('auth_token');
  }

  if (!token && typeof window.getAuthToken === 'function') {
    token = window.getAuthToken();
  }

  return token;
}

/**
 * Cache en mémoire pour les read-models
 * Améliorable avec IndexedDB pour un cache persistant
 */
const memoryCache = new Map();

/**
 * Récupère une valeur du cache
 * @private
 */
function _getFromCache(key) {
  const entry = memoryCache.get(key);

  if (!entry) {
    return null;
  }

  // Vérifier l'expiration
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Stocke une valeur dans le cache
 * @private
 */
function _setInCache(key, value, ttlMs = 300000) { // 5 minutes par défaut
  memoryCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs
  });

  // Nettoyer le cache si trop volumineux
  if (memoryCache.size > 100) {
    const firstKey = memoryCache.keys().next().value;
    memoryCache.delete(firstKey);
  }
}

/**
 * Invalide une clé du cache
 * 
 * @example
 *   await command.execute();
 *   invalidateCache('/aggregates');
 */
export function invalidateCache(pattern) {
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Vide complètement le cache
 */
export function clearCache() {
  memoryCache.clear();
}
