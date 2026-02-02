/**
 * SPOFE Contract-Enforced API Client
 * 
 * ⛔ UNIQUE point d'entrée pour TOUS les appels réseau
 * 
 * Remplace:
 *   ✗ services/ (api.config.js + 7 services)
 *   ✗ Axios interceptors
 *   ✗ useApi hook
 *   ✗ tous les appels axios directs
 * 
 * Utilise:
 *   ✓ sendCommand() du FCE (écritures)
 *   ✓ readModel() du FCE (lectures)
 *   ✓ Contrat frontend-backend (gouvernance)
 */

import { sendCommand, readModel } from '@/core/spofe-contract/index.js';

/**
 * API Client SPOFE - Interface unifiée
 * 
 * Tous les appels passent par le FCE:
 *   - readModel() pour GET
 *   - sendCommand() pour POST/PUT/DELETE (mutations)
 */
const spofeClient = {
  /**
   * Lecture contractuelle (GET)
   * 
   * @param {string} endpoint - Read-model path (ex: "/journal-entries")
   * @param {Object} options - Options (queryParams, cache, etc.)
   * @returns {Promise<Object>}
   * 
   * @example
   *   const entries = await spofeClient.read('/journal-entries', {
   *     queryParams: { company_id: 1, page: 1 }
   *   });
   */
  read: async (endpoint, options = {}) => {
    try {
      const data = await readModel(endpoint, options);
      return {
        success: true,
        data,
        status: 200,
      };
    } catch (error) {
      return _handleError(error, 'read', endpoint);
    }
  },

  /**
   * Exécution contractuelle de commande (POST/PUT/DELETE)
   * 
   * @param {string} commandName - Nom de la Command (ex: "PostJournalEntry")
   * @param {Object} payload - Données de la Command
   * @param {Object} options - Options supplémentaires
   * @returns {Promise<Object>}
   * 
   * @example
   *   const result = await spofeClient.execute('PostJournalEntry', {
   *     entryId: '123',
   *     reference: 'JNL-001'
   *   });
   */
  execute: async (commandName, payload = {}, options = {}) => {
    try {
      const result = await sendCommand(commandName, payload, options);
      return {
        success: true,
        data: result,
        status: 200,
      };
    } catch (error) {
      return _handleError(error, 'execute', commandName);
    }
  },

  /**
   * Alias pour execute() - pour compatibilité avec langage métier
   * 
   * @param {string} commandName - Nom de la Command
   * @param {Object} payload - Données
   * @param {Object} options - Options
   * @returns {Promise<Object>}
   */
  mutate: async (commandName, payload = {}, options = {}) => {
    return spofeClient.execute(commandName, payload, options);
  },

  /**
   * Alias pour read() - pour les workflows de liste
   * 
   * @param {string} endpoint - Read-model path
   * @param {Object} options - Options
   * @returns {Promise<Object>}
   */
  fetch: async (endpoint, options = {}) => {
    return spofeClient.read(endpoint, options);
  },
};

/**
 * Gestion centralisée des erreurs
 * @private
 */
function _handleError(error, operation, target) {
  console.error(`[SPOFE Client] ${operation} failed:`, {
    target,
    error: error.message,
    type: error.name,
  });

  return {
    success: false,
    error: error.message,
    code: error.code,
    details: error.details,
    status: error.status || 400,
  };
}

export default spofeClient;

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MIGRATION GUIDE (utiliser ce fichier pour remplacer services/)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * AVANT (Axios):
 *   import journalService from '@/services/journal.service'
 *   const entries = await journalService.listEntries({ company_id: 1 })
 * 
 * APRÈS (SPOFE):
 *   import spofeClient from '@/api/spofe-client'
 *   const response = await spofeClient.read('/journal-entries', {
 *     queryParams: { company_id: 1 }
 *   })
 *   const entries = response.data
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * AVANT (Axios mutation):
 *   import journalService from '@/services/journal.service'
 *   await journalService.postEntry({ entryId: '123' })
 * 
 * APRÈS (SPOFE):
 *   import spofeClient from '@/api/spofe-client'
 *   const result = await spofeClient.execute('PostJournalEntry', {
 *     entryId: '123'
 *   })
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */
