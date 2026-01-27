/**
 * Service API pour les Écritures Comptables (Journal Entries)
 * 
 * Endpoints disponibles:
 * - POST   /api/journal-entries            - Créer une écriture
 * - PUT    /api/journal-entries/:id        - Modifier une écriture (brouillon)
 * - DELETE /api/journal-entries/:id        - Supprimer une écriture (brouillon)
 * - GET    /api/journal-entries            - Lister les écritures
 * - POST   /api/journal-entries/:id/post   - Valider une écriture
 * - POST   /api/journal-entries/:id/reverse - Contrepasser une écriture
 */

import apiClient, { buildQueryString, handleApiError } from './api.config';

const ENDPOINT = '/journal-entries';

/**
 * Créer une nouvelle écriture comptable
 * @param {Object} entryData - Données de l'écriture
 * @param {number} entryData.company_id - ID de l'entreprise
 * @param {string} entryData.entryDate - Date de l'écriture (YYYY-MM-DD)
 * @param {string} entryData.journalCode - Code du journal (VT, AC, BQ, OD, etc.)
 * @param {string} entryData.description - Description de l'écriture
 * @param {string} [entryData.reference] - Référence externe
 * @param {Array} entryData.lines - Lignes d'écriture
 * @param {number} entryData.lines[].accountId - ID du compte
 * @param {number} entryData.lines[].debit - Montant au débit
 * @param {number} entryData.lines[].credit - Montant au crédit
 * @param {string} [entryData.lines[].description] - Description de la ligne
 * @param {number} [entryData.lines[].thirdPartyId] - ID du tiers
 * @returns {Promise<Object>} Écriture créée
 */
export const createEntry = async (entryData) => {
  try {
    const response = await apiClient.post(ENDPOINT, entryData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createEntry');
  }
};

/**
 * Modifier une écriture en brouillon
 * @param {number} entryId - ID de l'écriture
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<Object>} Écriture modifiée
 */
export const updateEntry = async (entryId, updates) => {
  try {
    const response = await apiClient.put(`${ENDPOINT}/${entryId}`, updates);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateEntry');
  }
};

/**
 * Supprimer une écriture en brouillon
 * @param {number} entryId - ID de l'écriture
 * @returns {Promise<Object>} Confirmation de suppression
 */
export const deleteEntry = async (entryId) => {
  try {
    const response = await apiClient.delete(`${ENDPOINT}/${entryId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteEntry');
  }
};

/**
 * Lister les écritures avec filtres et pagination
 * @param {Object} params - Paramètres de requête
 * @param {number} params.company_id - ID de l'entreprise
 * @param {string} [params.status] - Filtrer par statut (DRAFT, POSTED, REVERSED)
 * @param {string} [params.journalCode] - Filtrer par code journal
 * @param {string} [params.startDate] - Date de début (YYYY-MM-DD)
 * @param {string} [params.endDate] - Date de fin (YYYY-MM-DD)
 * @param {number} [params.page] - Page actuelle
 * @param {number} [params.limit] - Éléments par page
 * @returns {Promise<Object>} Liste paginée d'écritures
 */
export const listEntries = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'listEntries');
  }
};

/**
 * Valider une écriture (changement de statut DRAFT → POSTED)
 * @param {number} entryId - ID de l'écriture
 * @returns {Promise<Object>} Écriture validée
 */
export const postEntry = async (entryId) => {
  try {
    const response = await apiClient.post(`${ENDPOINT}/${entryId}/post`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'postEntry');
  }
};

/**
 * Contrepasser une écriture validée (créer une écriture inverse)
 * @param {number} entryId - ID de l'écriture à contrepasser
 * @param {Object} reverseData - Données de contrepassation
 * @param {string} reverseData.reverseDate - Date de la contrepassation
 * @param {string} [reverseData.reason] - Raison de la contrepassation
 * @returns {Promise<Object>} Écriture de contrepassation créée
 */
export const reverseEntry = async (entryId, reverseData) => {
  try {
    const response = await apiClient.post(`${ENDPOINT}/${entryId}/reverse`, reverseData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'reverseEntry');
  }
};

/**
 * Valider en masse plusieurs écritures en brouillon
 * @param {Array<number>} entryIds - IDs des écritures à valider
 * @returns {Promise<Object>} Résultat de la validation en masse
 */
export const bulkPostEntries = async (entryIds) => {
  try {
    const promises = entryIds.map(id => postEntry(id));
    const results = await Promise.allSettled(promises);
    
    const succeeded = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return {
      total: entryIds.length,
      succeeded,
      failed,
      results,
    };
  } catch (error) {
    throw handleApiError(error, 'bulkPostEntries');
  }
};

// Export par défaut avec toutes les fonctions
export default {
  createEntry,
  updateEntry,
  deleteEntry,
  listEntries,
  postEntry,
  reverseEntry,
  bulkPostEntries,
};
