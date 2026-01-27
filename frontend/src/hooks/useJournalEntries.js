/**
 * Hooks personnalisés pour les Écritures Comptables
 */

import { useApiCall, usePaginatedList, useForm, useModal } from './useApi';
import * as journalEntriesService from '@/services/journalEntries.service';

/**
 * Hook pour lister les écritures avec pagination et filtres
 * @param {Object} filters - Filtres initiaux (company_id requis)
 * @param {Object} options - Options du hook
 * @returns {Object} État de la liste et fonctions
 */
export const useEntriesList = (filters = {}, options = {}) => {
  return usePaginatedList(
    journalEntriesService.listEntries,
    filters,
    options
  );
};

/**
 * Hook pour créer une écriture
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de création
 */
export const useCreateEntry = (options = {}) => {
  return useApiCall(journalEntriesService.createEntry, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour mettre à jour une écriture
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de mise à jour
 */
export const useUpdateEntry = (options = {}) => {
  return useApiCall(
    (entryId, updates) => journalEntriesService.updateEntry(entryId, updates),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour supprimer une écriture
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de suppression
 */
export const useDeleteEntry = (options = {}) => {
  return useApiCall(journalEntriesService.deleteEntry, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour valider une écriture (DRAFT → POSTED)
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de validation
 */
export const usePostEntry = (options = {}) => {
  return useApiCall(journalEntriesService.postEntry, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook pour contrepasser une écriture
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de contrepassation
 */
export const useReverseEntry = (options = {}) => {
  return useApiCall(
    (entryId, reverseData) => journalEntriesService.reverseEntry(entryId, reverseData),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour valider plusieurs écritures en masse
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction de validation en masse
 */
export const useBulkPostEntries = (options = {}) => {
  return useApiCall(journalEntriesService.bulkPostEntries, {
    immediate: false,
    ...options,
  });
};

/**
 * Hook combiné pour gérer un formulaire d'écriture
 * @param {Object} initialValues - Valeurs initiales
 * @param {Object} options - Options du hook
 * @returns {Object} État du formulaire et fonctions
 */
export const useEntryForm = (initialValues = {}, options = {}) => {
  const {
    isEdit = false,
    onSuccess,
    onError,
  } = options;

  // Valeurs par défaut pour une nouvelle écriture
  const defaultValues = {
    company_id: null,
    entryDate: new Date().toISOString().split('T')[0],
    journalCode: 'OD',
    description: '',
    reference: '',
    lines: [
      { accountId: null, debit: 0, credit: 0, description: '', thirdPartyId: null },
      { accountId: null, debit: 0, credit: 0, description: '', thirdPartyId: null },
    ],
    ...initialValues,
  };

  const submitFunction = isEdit
    ? (values) => journalEntriesService.updateEntry(values.id, values)
    : journalEntriesService.createEntry;

  const form = useForm(submitFunction, defaultValues, {
    onSuccess,
    onError,
    resetOnSuccess: !isEdit,
  });

  // Fonctions helpers pour gérer les lignes d'écriture
  const addLine = () => {
    form.setFieldValue('lines', [
      ...form.values.lines,
      { accountId: null, debit: 0, credit: 0, description: '', thirdPartyId: null },
    ]);
  };

  const removeLine = (index) => {
    if (form.values.lines.length > 2) {
      const newLines = form.values.lines.filter((_, i) => i !== index);
      form.setFieldValue('lines', newLines);
    }
  };

  const updateLine = (index, field, value) => {
    const newLines = [...form.values.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    form.setFieldValue('lines', newLines);
  };

  // Calculer le total débit/crédit et vérifier l'équilibre
  const totalDebit = form.values.lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = form.values.lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return {
    ...form,
    addLine,
    removeLine,
    updateLine,
    totalDebit,
    totalCredit,
    isBalanced,
  };
};

/**
 * Hook pour gérer un modal d'écriture (création/édition)
 * @returns {Object} État du modal et fonctions
 */
export const useEntryModal = () => {
  return useModal();
};

/**
 * Hook pour gérer un modal de contrepassation
 * @returns {Object} État du modal et fonctions
 */
export const useReverseModal = () => {
  return useModal();
};

// Export par défaut avec tous les hooks
export default {
  useEntriesList,
  useCreateEntry,
  useUpdateEntry,
  useDeleteEntry,
  usePostEntry,
  useReverseEntry,
  useBulkPostEntries,
  useEntryForm,
  useEntryModal,
  useReverseModal,
};
