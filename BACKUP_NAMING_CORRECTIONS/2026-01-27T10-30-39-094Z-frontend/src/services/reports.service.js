/**
 * Service API pour les Rapports Financiers (Reports)
 * 
 * Endpoints disponibles:
 * - GET /api/reports/balance              - Balance générale
 * - GET /api/reports/balance-auxiliary    - Balance auxiliaire
 * - GET /api/reports/general-ledger       - Grand livre
 * - GET /api/reports/income-statement     - Compte de résultat
 * - GET /api/reports/balance-sheet        - Bilan comptable
 */

import apiClient, { buildQueryString, handleApiError } from './api.config';

const ENDPOINT = '/reports';

/**
 * Générer la balance générale
 * @param {Object} params - Paramètres de requête
 * @param {number} params.companyId - ID de l'entreprise
 * @param {string} [params.startDate] - Date de début (YYYY-MM-DD)
 * @param {string} [params.endDate] - Date de fin (YYYY-MM-DD)
 * @param {number} [params.level] - Niveau de compte (1-8)
 * @returns {Promise<Object>} Balance générale avec totaux débit/crédit
 */
export const getBalance = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/balance${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getBalance');
  }
};

/**
 * Générer la balance auxiliaire (par tiers)
 * @param {Object} params - Paramètres de requête
 * @param {number} params.companyId - ID de l'entreprise
 * @param {string} [params.startDate] - Date de début (YYYY-MM-DD)
 * @param {string} [params.endDate] - Date de fin (YYYY-MM-DD)
 * @param {string} [params.thirdPartyType] - Type de tiers (CUSTOMER, SUPPLIER, etc.)
 * @returns {Promise<Object>} Balance auxiliaire par tiers
 */
export const getBalanceAuxiliary = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/balance-auxiliary${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getBalanceAuxiliary');
  }
};

/**
 * Générer le grand livre d'un compte
 * @param {Object} params - Paramètres de requête
 * @param {number} params.companyId - ID de l'entreprise
 * @param {number} params.accountId - ID du compte
 * @param {string} [params.startDate] - Date de début (YYYY-MM-DD)
 * @param {string} [params.endDate] - Date de fin (YYYY-MM-DD)
 * @returns {Promise<Object>} Grand livre avec solde progressif
 */
export const getGeneralLedger = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/general-ledger${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getGeneralLedger');
  }
};

/**
 * Générer le compte de résultat
 * @param {Object} params - Paramètres de requête
 * @param {number} params.companyId - ID de l'entreprise
 * @param {number} [params.fiscalYear] - Année fiscale (2000-2100)
 * @param {string} [params.startDate] - Date de début (alternative à fiscalYear)
 * @param {string} [params.endDate] - Date de fin (alternative à fiscalYear)
 * @returns {Promise<Object>} Compte de résultat (charges, produits, résultat)
 */
export const getIncomeStatement = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/income-statement${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getIncomeStatement');
  }
};

/**
 * Générer le bilan comptable
 * @param {Object} params - Paramètres de requête
 * @param {number} params.companyId - ID de l'entreprise
 * @param {string} [params.date] - Date de clôture (YYYY-MM-DD, défaut: aujourd'hui)
 * @returns {Promise<Object>} Bilan comptable (actif, passif, équilibre)
 */
export const getBalanceSheet = async (params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/balance-sheet${queryString}`);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'getBalanceSheet');
  }
};

/**
 * Exporter un rapport en PDF (fonctionnalité future)
 * @param {string} reportType - Type de rapport
 * @param {Object} params - Paramètres du rapport
 * @returns {Promise<Blob>} Fichier PDF
 */
export const exportReportToPDF = async (reportType, params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/${reportType}/export/pdf${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'exportReportToPDF');
  }
};

/**
 * Exporter un rapport en Excel (fonctionnalité future)
 * @param {string} reportType - Type de rapport
 * @param {Object} params - Paramètres du rapport
 * @returns {Promise<Blob>} Fichier Excel
 */
export const exportReportToExcel = async (reportType, params) => {
  try {
    const queryString = buildQueryString(params);
    const response = await apiClient.get(`${ENDPOINT}/${reportType}/export/excel${queryString}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'exportReportToExcel');
  }
};

// Export par défaut avec toutes les fonctions
export default {
  getBalance,
  getBalanceAuxiliary,
  getGeneralLedger,
  getIncomeStatement,
  getBalanceSheet,
  exportReportToPDF,
  exportReportToExcel,
};
