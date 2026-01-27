/**
 * Service API pour les Tiers (Third Parties)
 * 
 * Endpoints disponibles:
 * - POST   /api/third-parties                    - Créer un tiers
 * - PUT    /api/third-parties/:id                - Modifier un tiers
 * - DELETE /api/third-parties/:id                - Supprimer un tiers
 * - GET    /api/third-parties                    - Lister les tiers
 * - GET    /api/third-parties/search             - Rechercher des tiers
 * - GET    /api/third-parties/stats              - Statistiques des tiers
 * - GET    /api/third-parties/:id/transactions   - Transactions d'un tiers
 */

import apiClient, { buildQueryString, handleApiError } from './api.config';

const ENDPOINT = '/third-parties';

/**
 * Créer un nouveau tiers
 * @param {Object} thirdPartyData - Données du tiers
 * @param {number} thirdPartyData.company_id - ID de l'entreprise
 * @param {string} thirdPartyData.code - Code unique du tiers
 * @param {string} thirdPartyData.name - Nom du tiers
 * @param {string} thirdPartyData.type - Type (CUSTOMER, SUPPLIER, EMPLOYEE, OTHER)
 * @param {string} [thirdPartyData.email] - Email
 * @param {string} [thirdPartyData.phone] - Téléphone
 * @param {string} [thirdPartyData.address] - Adresse
 * @param {string} [thirdPartyData.city] - Ville
 * @param {string} [thirdPartyData.country] - Pays
 * @param {string} [thirdPartyData.taxId] - Numéro fiscal
 * @returns {Promise<Object>} Tiers créé
 */
export const createThirdParty = async (thirdPartyData) => {
  try {
    const response = await apiClient.post(ENDPOINT, thirdPartyData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createThirdParty');
  }
};

/**
 * Modifier un tiers existant
 * @param {number} thirdPartyId - ID du tiers
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<Object>} Tiers modifié
 */
export const updateThirdParty = async (thirdPartyId, updates) => {
  try {
    const response = await apiClient.put(`${ENDPOINT}/${thirdPartyId}`, updates);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateThirdParty');
  }
};

/**
 * Supprimer un tiers (soft delete si utilisé)
 * @param {number} thirdPartyId - ID du tiers
 * @returns {Promise<Object>} Confirmation de suppression
 */
export const deleteThirdParty = async (thirdPartyId) => {
  try {
    const response = await apiClient.delete(`${ENDPOINT}/${thirdPartyId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteThirdParty');
  }
};

/**
 * Lister les tiers avec filtres et pagination
 * @param {Object} params - Paramètres de requête
 * @param {number} params.company_id - ID de l'entreprise
 * @param {string} [params.type] - Filtrer par type
 * @param {boolean} [params.is_active] - Filtrer par statut
 * @param {number} [params.page] - Page actuelle
 * @param {number} [params.limit] - Éléments par page
 * @returns {Promise<Object>} Liste paginée de tiers
 */
export const listThirdParties = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'listThirdParties');
  }
};

/**
 * Rechercher des tiers par code ou nom
 * @param {Object} params - Paramètres de recherche
 * @param {number} params.company_id - ID de l'entreprise
 * @param {string} params.query - Texte de recherche
 * @param {string} [params.type] - Filtrer par type
 * @param {number} [params.limit] - Nombre maximum de résultats
 * @returns {Promise<Object>} Résultats de recherche
 */
export const searchThirdParties = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/search${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'searchThirdParties');
  }
};

/**
 * Obtenir les statistiques des tiers
 * @param {Object} params - Paramètres de requête
 * @param {number} params.company_id - ID de l'entreprise
 * @returns {Promise<Object>} Statistiques (total, par type, actifs/inactifs)
 */
export const getThirdPartyStats = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/stats${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getThirdPartyStats');
  }
};

/**
 * Obtenir les transactions d'un tiers
 * @param {number} thirdPartyId - ID du tiers
 * @param {Object} params - Paramètres de requête
 * @param {string} [params.startDate] - Date de début
 * @param {string} [params.endDate] - Date de fin
 * @param {number} [params.page] - Page actuelle
 * @param {number} [params.limit] - Éléments par page
 * @returns {Promise<Object>} Liste des transactions du tiers
 */
export const getThirdPartyTransactions = async (thirdPartyId, params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/${thirdPartyId}/transactions${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getThirdPartyTransactions');
  }
};

// Export par défaut avec toutes les fonctions
export default {
  createThirdParty,
  updateThirdParty,
  deleteThirdParty,
  listThirdParties,
  searchThirdParties,
  getThirdPartyStats,
  getThirdPartyTransactions,
};
