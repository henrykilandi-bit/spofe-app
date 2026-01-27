/**
 * Hooks personnalisés pour le Plan Comptable
 */

import { useApiCall, usePaginatedList, useForm, useModal } from './useApi';
import * as chartOfAccountsService from '@/services/chartOfAccounts.service';

/**
 * Hook pour lister les comptes avec pagination et filtres
 * @param {Object} filters - Filtres initiaux (companyId requis)
 * @param {Object} options - Options du hook
 * @returns {Object} État de la liste et fonctions
 */
export const useAccountsList = (filters = {}, options = {}) => {
  return usePaginatedList(
    chartOfAccountsService.listAccounts,
    filters,
    options
  );
};

/**
 * Hook pour rechercher des comptes
 * @param {Object} searchParams - Paramètres de recherche
 * @param {Object} options - Options du hook
 * @returns {Object} Résultats de recherche et fonctions
 */
export const useAccountsSearch = (options = {}) => {
  return useApiCall(chartOfAccountsService.searchAccounts, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour créer un compte
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de création
 */
export const useCreateAccount = (options = {}) => {
  return useApiCall(chartOfAccountsService.createAccount, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour mettre à jour un compte
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de mise à jour
 */
export const useUpdateAccount = (options = {}) => {
  return useApiCall(
    (accountId, updates) => chartOfAccountsService.updateAccount(accountId, updates),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour supprimer un compte
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de suppression
 */
export const useDeleteAccount = (options = {}) => {
  return useApiCall(chartOfAccountsService.deleteAccount, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour activer/désactiver un compte
 * @param {Object} options - Options du hook
 * @returns {Object} Fonctions d'activation/désactivation
 */
export const useToggleAccount = (options = {}) => {
  const activate = useApiCall(chartOfAccountsService.activateAccount, {
    immediate: false,
    ...options,
  });

  const deactivate = useApiCall(chartOfAccountsService.deactivateAccount, {
    immediate: false,
    ...options,
  });

  return {
    activate: activate.execute,
    deactivate: deactivate.execute,
    loading: activate.loading || deactivate.loading,
    error: activate.error || deactivate.error,
  };
};

/**
 * Hook combiné pour gérer un formulaire de compte
 * @param {Object} initialValues - Valeurs initiales
 * @param {Object} options - Options du hook
 * @returns {Object} État du formulaire et fonctions
 */
export const useAccountForm = (initialValues = {}, options = {}) => {
  const { isEdit = false, onSuccess, onError } = options;

  const submitFunction = isEdit
    ? (values) => chartOfAccountsService.updateAccount(values.id, values)
    : chartOfAccountsService.createAccount;

  return useForm(submitFunction, initialValues, {
    onSuccess,
    onError,
    resetOnSuccess: !isEdit,
  });
};

/**
 * Hook pour gérer un modal de compte (création/édition)
 * @returns {Object} État du modal et fonctions
 */
export const useAccountModal = () => {
  return useModal();
};

// Export par défaut avec tous les hooks
export default {
  useAccountsList,
  useAccountsSearch,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useToggleAccount,
  useAccountForm,
  useAccountModal,
};
