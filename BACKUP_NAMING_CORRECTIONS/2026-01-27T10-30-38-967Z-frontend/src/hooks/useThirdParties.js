/**
 * Hooks personnalisés pour les Tiers
 */

import { useApiCall, usePaginatedList, useForm, useModal } from './useApi';
import * as thirdPartiesService from '@/services/thirdParties.service';

/**
 * Hook pour lister les tiers avec pagination et filtres
 * @param {Object} filters - Filtres initiaux (companyId requis)
 * @param {Object} options - Options du hook
 * @returns {Object} État de la liste et fonctions
 */
export const useThirdPartiesList = (filters = {}, options = {}) => {
  return usePaginatedList(
    thirdPartiesService.listThirdParties,
    filters,
    options
  );
};

/**
 * Hook pour rechercher des tiers
 * @param {Object} options - Options du hook
 * @returns {Object} Résultats de recherche et fonctions
 */
export const useThirdPartiesSearch = (options = {}) => {
  return useApiCall(thirdPartiesService.searchThirdParties, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour créer un tiers
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de création
 */
export const useCreateThirdParty = (options = {}) => {
  return useApiCall(thirdPartiesService.createThirdParty, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour mettre à jour un tiers
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de mise à jour
 */
export const useUpdateThirdParty = (options = {}) => {
  return useApiCall(
    (thirdPartyId, updates) => thirdPartiesService.updateThirdParty(thirdPartyId, updates),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour supprimer un tiers
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de suppression
 */
export const useDeleteThirdParty = (options = {}) => {
  return useApiCall(thirdPartiesService.deleteThirdParty, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour obtenir les statistiques des tiers
 * @param {Object} params - Paramètres (companyId requis)
 * @param {Object} options - Options du hook
 * @returns {Object} Statistiques et fonctions
 */
export const useThirdPartyStats = (params = {}, options = {}) => {
  return useApiCall(
    () => thirdPartiesService.getThirdPartyStats(params),
    {
      immediate: !!params.companyId,
      dependencies: [params.companyId],
      ...options,
    }
  );
};

/**
 * Hook pour obtenir les transactions d'un tiers
 * @param {number} thirdPartyId - ID du tiers
 * @param {Object} params - Paramètres de filtrage
 * @param {Object} options - Options du hook
 * @returns {Object} Transactions et fonctions
 */
export const useThirdPartyTransactions = (thirdPartyId, params = {}, options = {}) => {
  return useApiCall(
    () => thirdPartiesService.getThirdPartyTransactions(thirdPartyId, params),
    {
      immediate: !!thirdPartyId,
      dependencies: [thirdPartyId, params.startDate, params.endDate],
      ...options,
    }
  );
};

/**
 * Hook combiné pour gérer un formulaire de tiers
 * @param {Object} initialValues - Valeurs initiales
 * @param {Object} options - Options du hook
 * @returns {Object} État du formulaire et fonctions
 */
export const useThirdPartyForm = (initialValues = {}, options = {}) => {
  const {
    isEdit = false,
    onSuccess,
    onError,
  } = options;

  // Valeurs par défaut pour un nouveau tiers
  const defaultValues = {
    companyId: null,
    code: '',
    name: '',
    type: 'OTHER',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    taxId: '',
    ...initialValues,
  };

  const submitFunction = isEdit
    ? (values) => thirdPartiesService.updateThirdParty(values.id, values)
    : thirdPartiesService.createThirdParty;

  return useForm(submitFunction, defaultValues, {
    onSuccess,
    onError,
    resetOnSuccess: !isEdit,
  });
};

/**
 * Hook pour gérer un modal de tiers (création/édition)
 * @returns {Object} État du modal et fonctions
 */
export const useThirdPartyModal = () => {
  return useModal();
};

/**
 * Hook pour gérer un modal de transactions d'un tiers
 * @returns {Object} État du modal et fonctions
 */
export const useTransactionsModal = () => {
  return useModal();
};

/**
 * Hook pour filtrer les tiers par type
 * @param {Array} thirdParties - Liste des tiers
 * @param {string} type - Type de filtre
 * @returns {Array} Tiers filtrés
 */
export const useFilteredThirdParties = (thirdParties = [], type = 'ALL') => {
  if (type === 'ALL' || !type) {
    return thirdParties;
  }
  return thirdParties.filter((tp) => tp.type === type);
};

// Export par défaut avec tous les hooks
export default {
  useThirdPartiesList,
  useThirdPartiesSearch,
  useCreateThirdParty,
  useUpdateThirdParty,
  useDeleteThirdParty,
  useThirdPartyStats,
  useThirdPartyTransactions,
  useThirdPartyForm,
  useThirdPartyModal,
  useTransactionsModal,
  useFilteredThirdParties,
};
