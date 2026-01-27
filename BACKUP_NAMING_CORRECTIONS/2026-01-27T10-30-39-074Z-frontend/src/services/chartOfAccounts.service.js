/**
 * Service API pour le Plan Comptable (Chart of Accounts)
 * 
 * Endpoints disponibles:
 * - POST   /api/chart-of-accounts          - Créer un compte
 * - PUT    /api/chart-of-accounts/:id      - Modifier un compte
 * - DELETE /api/chart-of-accounts/:id      - Supprimer un compte
 * - GET    /api/chart-of-accounts          - Lister les comptes
 * - GET    /api/chart-of-accounts/search   - Rechercher des comptes
 * - PATCH  /api/chart-of-accounts/:id/activate   - Activer un compte
 * - PATCH  /api/chart-of-accounts/:id/deactivate - Désactiver un compte
 */

import apiClient, { buildQueryString, handleApiError } from './api.config';

const ENDPOINT = '/chart-of-accounts';

/**
 * Créer un nouveau compte
 * @param {Object} accountData - Données du compte
 * @param {number} accountData.companyId - ID de l'entreprise
 * @param {string} accountData.accountNumber - Numéro de compte OHADA
 * @param {string} accountData.accountName - Nom du compte
 * @param {string} accountData.accountType - Type (ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE)
 * @param {string} [accountData.description] - Description optionnelle
 * @returns {Promise<Object>} Compte créé
 */
export const createAccount = async (accountData) => {
  try {
    const response = await apiClient.post(ENDPOINT, accountData);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'createAccount');
  }
};

/**
 * Modifier un compte existant
 * @param {number} accountId - ID du compte
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<Object>} Compte modifié
 */
export const updateAccount = async (accountId, updates) => {
  try {
    const response = await apiClient.put(`${ENDPOINT}/${accountId}`, updates);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'updateAccount');
  }
};

/**
 * Supprimer un compte (soft delete si utilisé)
 * @param {number} accountId - ID du compte
 * @returns {Promise<Object>} Confirmation de suppression
 */
export const deleteAccount = async (accountId) => {
  try {
    const response = await apiClient.delete(`${ENDPOINT}/${accountId}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deleteAccount');
  }
};

/**
 * Lister les comptes avec filtres et pagination
 * @param {Object} params - Paramètres de requête
 * @param {number} params.companyId - ID de l'entreprise
 * @param {string} [params.type] - Filtrer par type
 * @param {boolean} [params.isActive] - Filtrer par statut
 * @param {number} [params.page] - Page actuelle (défaut: 1)
 * @param {number} [params.limit] - Éléments par page (défaut: 50)
 * @returns {Promise<Object>} Liste paginée de comptes
 */
export const listAccounts = async (params = {}) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'listAccounts');
  }
};

/**
 * Rechercher des comptes par numéro ou nom
 * @param {Object} params - Paramètres de recherche
 * @param {number} params.companyId - ID de l'entreprise
 * @param {string} params.query - Texte de recherche
 * @param {number} [params.limit] - Nombre maximum de résultats
 * @returns {Promise<Object>} Résultats de recherche
 */
export const searchAccounts = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/search${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'searchAccounts');
  }
};

/**
 * Activer un compte
 * @param {number} accountId - ID du compte
 * @returns {Promise<Object>} Compte activé
 */
export const activateAccount = async (accountId) => {
  try {
    const response = await apiClient.patch(`${ENDPOINT}/${accountId}/activate`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'activateAccount');
  }
};

/**
 * Désactiver un compte
 * @param {number} accountId - ID du compte
 * @returns {Promise<Object>} Compte désactivé
 */
export const deactivateAccount = async (accountId) => {
  try {
    const response = await apiClient.patch(`${ENDPOINT}/${accountId}/deactivate`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'deactivateAccount');
  }
};

// Export par défaut avec toutes les fonctions
export default {
  createAccount,
  updateAccount,
  deleteAccount,
  listAccounts,
  searchAccounts,
  activateAccount,
  deactivateAccount,
};
