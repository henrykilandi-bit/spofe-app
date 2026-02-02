/**
 * Command Client
 * 
 * Point d'entrée pour toutes les écritures (Commands)
 * Valide contre le contrat avant envoi
 */

import { loadContract, getLoadedContract } from './contractLoader.js';
import { ContractViolation, VIOLATIONS, logViolation } from './violations.js';
import { INTERNAL_FETCH } from '../internal-fetch.js';

/**
 * Envoie une Command au backend
 * 
 * @param {string} commandName - Nom de la Command (ex: "CloseAggregate")
 * @param {Object} payload - Données de la Command
 * @param {Object} options - Options additionnelles
 * @returns {Promise<Object>} Réponse du backend
 * @throws {ContractViolation} Si la Command n'est pas autorisée
 * @throws {Error} Si le backend refuse la Command
 * 
 * @example
 *   try {
 *     const result = await sendCommand('CloseAggregate', {
 *       aggregateId: '123e4567-e89b-12d3-a456-426614174000'
 *     });
 *     console.log('Command executed:', result);
 *   } catch (error) {
 *     if (error instanceof ContractViolation) {
 *       console.error('Contract violation:', error.message);
 *     } else {
 *       console.error('Backend error:', error.message);
 *     }
 *   }
 */
export async function sendCommand(commandName, payload = {}, options = {}) {
  // Valider le contrat
  const contract = await loadContract();

  // Vérifier que la Command est autorisée
  if (!contract.commands.includes(commandName)) {
    const violation = new ContractViolation(
      VIOLATIONS.COMMAND_NOT_ALLOWED,
      `Command '${commandName}' is not allowed by SPOFE contract v${contract.version}`,
      {
        commandName,
        contractVersion: contract.version,
        allowedCommands: contract.commands
      }
    );

    logViolation(violation, { payload });
    throw violation;
  }

  // Obtenir les détails de la Command pour validation additionnelle
  const commandDetails = contract.commandDetails.find(c => c.name === commandName);

  // Valider le payload si un schéma est défini
  if (commandDetails?.schema && !options.skipValidation) {
    _validatePayload(payload, commandDetails.schema, commandName);
  }

  // Construire la requête
  const endpoint = commandDetails?.endpoint || `/commands/${commandName}`;
  const method = endpoint.split(' ')[0] || 'POST';
  const url = endpoint.split(' ').slice(1).join(' ');

  // Envoyer la Command
  const response = await _sendHttpRequest(method, url, payload, {
    ...options,
    commandName
  });

  return response;
}

/**
 * Alias pour sendCommand (nom alternatif)
 */
export const executeCommand = sendCommand;

/**
 * Valide le payload contre le schéma de la Command
 * @private
 */
function _validatePayload(payload, schema, commandName) {
  if (!schema || typeof schema !== 'object') {
    return; // Pas de schéma à valider
  }

  // Validation basique des champs requis
  Object.entries(schema).forEach(([field, fieldType]) => {
    if (fieldType.includes('required') && !(field in payload)) {
      throw new ContractViolation(
        VIOLATIONS.INVALID_COMMAND_PAYLOAD,
        `Missing required field '${field}' in '${commandName}' payload`,
        { field, commandName }
      );
    }
  });
}

/**
 * Envoie une requête HTTP de manière sûre
 * @private
 */
async function _sendHttpRequest(method, url, payload, options = {}) {
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
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  if (method !== 'GET' && Object.keys(payload).length > 0) {
    fetchOptions.body = JSON.stringify(payload);
  }

  try {
    const response = await INTERNAL_FETCH(url, fetchOptions);

    if (!response.ok) {
      // Erreur du backend - propager telle quelle
      // Le backend décide, pas le frontend
      const errorData = await response.json().catch(() => ({
        message: `${response.status} ${response.statusText}`
      }));

      const error = new Error(errorData.message || 'Command rejected by backend');
      error.status = response.status;
      error.code = errorData.code;
      error.details = errorData;

      throw error;
    }

    return await response.json();
  } catch (error) {
    // Erreur réseau ou parsing
    if (error instanceof TypeError) {
      throw new Error(`Network error while executing command: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Récupère le token d'authentification
 * À adapter selon votre mécanisme d'auth (localStorage, sessionStorage, etc)
 * @private
 */
function _getAuthToken() {
  // Stratégie 1: localStorage
  let token = localStorage.getItem('spofe_token') || 
              localStorage.getItem('auth_token');

  // Stratégie 2: sessionStorage
  if (!token) {
    token = sessionStorage.getItem('spofe_token') ||
            sessionStorage.getItem('auth_token');
  }

  // Stratégie 3: Fonction callback personnalisée
  if (!token && typeof window.getAuthToken === 'function') {
    token = window.getAuthToken();
  }

  return token;
}

/**
 * Définit le provider de token (pour tests ou auth personnalisée)
 * 
 * @example
 *   setTokenProvider(() => {
 *     return authService.getToken();
 *   });
 */
let customTokenProvider = null;

export function setTokenProvider(provider) {
  customTokenProvider = provider;
  // Surcharger _getAuthToken
  _getAuthToken = () => customTokenProvider?.() || null;
}
