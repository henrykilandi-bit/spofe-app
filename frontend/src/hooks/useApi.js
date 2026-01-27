/**
 * Hooks React personnalisés pour gérer les opérations API
 * 
 * Ces hooks encapsulent:
 * - États de chargement
 * - Gestion d'erreurs
 * - Cache des données
 * - Rafraîchissement automatique
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook générique pour les appels API avec états de chargement et d'erreur
 * @param {Function} apiFunction - Fonction API à appeler
 * @param {Object} options - Options du hook
 * @param {boolean} [options.immediate=true] - Appeler immédiatement au montage
 * @param {Array} [options.dependencies=[]] - Dépendances pour rafraîchir
 * @param {Function} [options.onSuccess] - Callback de succès
 * @param {Function} [options.onError] - Callback d'erreur
 * @returns {Object} État et fonctions de contrôle
 */
export const useApiCall = (apiFunction, options = {}) => {
  const {
    immediate = true,
    dependencies = [],
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiFunction(...args);
      
      if (mountedRef.current) {
        setData(result.data || result);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(result.data || result);
        }
      }

      return result;
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
        
        if (onError) {
          onError(err);
        }
      }
      throw err;
    }
  }, [apiFunction, onSuccess, onError]);

  useEffect(() => {
    if (immediate && dependencies.length > 0) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

/**
 * Hook pour gérer une liste paginée avec recherche et filtres
 * @param {Function} fetchFunction - Fonction de récupération des données
 * @param {Object} initialFilters - Filtres initiaux
 * @param {Object} options - Options du hook
 * @returns {Object} État de la liste et fonctions de contrôle
 */
export const usePaginatedList = (fetchFunction, initialFilters = {}, options = {}) => {
  const {
    pageSize = 20,
    immediate = true,
  } = options;

  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        page: currentPage,
        limit: pageSize,
      };

      const result = await fetchFunction(params);
      
      setItems(result.data || result.items || []);
      setTotalCount(result.totalCount || result.total || 0);
      setLoading(false);

      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [fetchFunction, filters, currentPage, pageSize]);

  useEffect(() => {
    if (immediate) {
      fetchItems();
    }
  }, [fetchItems, immediate]);

  const goToPage = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalCount, pageSize]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setCurrentPage(1);
  }, [initialFilters]);

  const refresh = useCallback(() => {
    return fetchItems();
  }, [fetchItems]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    items,
    totalCount,
    currentPage,
    totalPages,
    filters,
    loading,
    error,
    goToPage,
    nextPage,
    prevPage,
    updateFilters,
    resetFilters,
    refresh,
  };
};

/**
 * Hook pour gérer un formulaire avec validation et soumission
 * @param {Function} submitFunction - Fonction de soumission
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Object} options - Options du hook
 * @returns {Object} État du formulaire et fonctions de contrôle
 */
export const useForm = (submitFunction, initialValues = {}, options = {}) => {
  const {
    onSuccess,
    onError,
    resetOnSuccess = false,
  } = options;

  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }

    try {
      setSubmitting(true);
      setErrors({});

      const result = await submitFunction(values);

      if (onSuccess) {
        onSuccess(result);
      }

      if (resetOnSuccess) {
        resetForm();
      }

      setSubmitting(false);
      return result;
    } catch (err) {
      // Gérer les erreurs de validation du serveur
      if (err.errors) {
        setErrors(err.errors);
      }

      if (onError) {
        onError(err);
      }

      setSubmitting(false);
      throw err;
    }
  }, [submitFunction, values, onSuccess, onError, resetOnSuccess, resetForm]);

  return {
    values,
    errors,
    touched,
    submitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    resetForm,
  };
};

/**
 * Hook pour gérer un modal/dialog
 * @param {boolean} initialState - État initial (ouvert/fermé)
 * @returns {Object} État du modal et fonctions de contrôle
 */
export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);
  const [data, setData] = useState(null);

  const open = useCallback((modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setData(null);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
};

/**
 * Hook pour gérer le debounce d'une valeur
 * @param {any} value - Valeur à debouncer
 * @param {number} delay - Délai en millisecondes
 * @returns {any} Valeur debouncée
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook pour gérer les toasts/notifications
 * @returns {Object} Fonctions pour afficher des notifications
 */
export const useToast = () => {
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    // Implémentation basique - à remplacer par une vraie librairie de toasts
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // TODO: Intégrer avec react-toastify ou une autre librairie
    // toast[type](message, { autoClose: duration });
  }, []);

  return {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration),
  };
};
