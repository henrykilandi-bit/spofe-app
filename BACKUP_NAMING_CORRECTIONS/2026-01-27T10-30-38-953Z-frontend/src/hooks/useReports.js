/**
 * Hooks personnalisés pour les Rapports Financiers
 */

import { useApiCall } from './useApi';
import * as reportsService from '@/services/reports.service';

/**
 * Hook pour générer la balance générale
 * @param {Object} params - Paramètres du rapport
 * @param {Object} options - Options du hook
 * @returns {Object} Balance et fonctions
 */
export const useBalance = (params = {}, options = {}) => {
  return useApiCall(
    () => reportsService.getBalance(params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour générer la balance auxiliaire
 * @param {Object} params - Paramètres du rapport
 * @param {Object} options - Options du hook
 * @returns {Object} Balance auxiliaire et fonctions
 */
export const useBalanceAuxiliary = (params = {}, options = {}) => {
  return useApiCall(
    () => reportsService.getBalanceAuxiliary(params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour générer le grand livre
 * @param {Object} params - Paramètres du rapport
 * @param {Object} options - Options du hook
 * @returns {Object} Grand livre et fonctions
 */
export const useGeneralLedger = (params = {}, options = {}) => {
  return useApiCall(
    () => reportsService.getGeneralLedger(params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour générer le compte de résultat
 * @param {Object} params - Paramètres du rapport
 * @param {Object} options - Options du hook
 * @returns {Object} Compte de résultat et fonctions
 */
export const useIncomeStatement = (params = {}, options = {}) => {
  return useApiCall(
    () => reportsService.getIncomeStatement(params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour générer le bilan comptable
 * @param {Object} params - Paramètres du rapport
 * @param {Object} options - Options du hook
 * @returns {Object} Bilan et fonctions
 */
export const useBalanceSheet = (params = {}, options = {}) => {
  return useApiCall(
    () => reportsService.getBalanceSheet(params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour exporter un rapport en PDF
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction d'export
 */
export const useExportPDF = (options = {}) => {
  return useApiCall(
    (reportType, params) => reportsService.exportReportToPDF(reportType, params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook pour exporter un rapport en Excel
 * @param {Object} options - Options du hook
 * @returns {Object} État et fonction d'export
 */
export const useExportExcel = (options = {}) => {
  return useApiCall(
    (reportType, params) => reportsService.exportReportToExcel(reportType, params),
    {
      immediate: false,
      ...options,
    }
  );
};

/**
 * Hook combiné pour gérer les filtres de rapports
 * @param {Object} initialFilters - Filtres initiaux
 * @returns {Object} État des filtres et fonctions
 */
export const useReportFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState({
    companyId: null,
    startDate: '',
    endDate: '',
    fiscalYear: new Date().getFullYear(),
    ...initialFilters,
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      companyId: initialFilters.companyId || null,
      startDate: '',
      endDate: '',
      fiscalYear: new Date().getFullYear(),
    });
  };

  const setDateRange = (startDate, endDate) => {
    setFilters((prev) => ({ ...prev, startDate, endDate, fiscalYear: null }));
  };

  const setFiscalYear = (year) => {
    setFilters((prev) => ({ ...prev, fiscalYear: year, startDate: '', endDate: '' }));
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    setDateRange,
    setFiscalYear,
  };
};

/**
 * Hook pour télécharger un fichier exporté
 * @param {Blob} blob - Blob du fichier
 * @param {string} filename - Nom du fichier
 */
export const useDownloadFile = () => {
  const download = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return { download };
};

// Import nécessaire pour useReportFilters
import { useState } from 'react';

// Export par défaut avec tous les hooks
export default {
  useBalance,
  useBalanceAuxiliary,
  useGeneralLedger,
  useIncomeStatement,
  useBalanceSheet,
  useExportPDF,
  useExportExcel,
  useReportFilters,
  useDownloadFile,
};
