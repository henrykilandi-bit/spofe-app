/**
 * EXEMPLE DE CONVERSION - Nouveau Hook Métier avec SPOFE
 * 
 * Ce hook remplace useJournalEntries.js (ancien pattern Axios)
 * 
 * ✓ Utilise spofeClient au lieu de services
 * ✓ État local pour UI uniquement (loading, error)
 * ✓ Contrat apposé à chaque appel
 * ✓ Zéro business logic, juste orchestration
 */

import { useState, useCallback } from 'react';
import spofeClient from '@/api/spofe-client';

/**
 * Hook: Lister les écritures comptables
 * 
 * @param {Object} filters - Filtres ({companyId, page, pageSize})
 * @returns {Object} {data, loading, error, refetch}
 * 
 * @example
 *   const { data: entries, loading } = useJournalEntriesList({ companyId: 1 })
 */
export const useJournalEntriesList = (filters = {}) => {
  const [state, setState] = useState({
    data: [],
    loading: false,
    error: null,
  });

  const fetch = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await spofeClient.read('/journal-entries', {
        queryParams: filters,
      });
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          data: response.data || [],
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(response.error || 'Failed to fetch entries');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  }, [filters]);

  return { ...state, refetch: fetch, fetch };
};

/**
 * Hook: Créer une nouvelle écriture (Command)
 * 
 * @returns {Object} {create, loading, error}
 * 
 * @example
 *   const { create, loading } = useCreateJournalEntry()
 *   await create({ date: '2024-01-01', description: '...' })
 */
export const useCreateJournalEntry = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
  });

  const create = useCallback(async (payload) => {
    setState({ loading: true, error: null });
    
    try {
      // ✓ Passe par le contrat SPOFE
      const response = await spofeClient.execute('CreateJournalEntry', payload);
      
      if (response.success) {
        setState({ loading: false, error: null });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create entry');
      }
    } catch (error) {
      setState({ loading: false, error: error.message });
      throw error;
    }
  }, []);

  return { create, ...state };
};

/**
 * Hook: Poster une écriture (Command)
 * 
 * @returns {Object} {post, loading, error}
 */
export const usePostJournalEntry = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
  });

  const post = useCallback(async (entryId) => {
    setState({ loading: true, error: null });
    
    try {
      // ✓ Passe par le contrat SPOFE
      const response = await spofeClient.execute('PostJournalEntry', { entryId });
      
      if (response.success) {
        setState({ loading: false, error: null });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to post entry');
      }
    } catch (error) {
      setState({ loading: false, error: error.message });
      throw error;
    }
  }, []);

  return { post, ...state };
};

/**
 * Hook: Inverser une écriture (Command)
 * 
 * @returns {Object} {reverse, loading, error}
 */
export const useReverseJournalEntry = () => {
  const [state, setState] = useState({
    loading: false,
    error: null,
  });

  const reverse = useCallback(async (entryId, reversalDate) => {
    setState({ loading: true, error: null });
    
    try {
      // ✓ Passe par le contrat SPOFE
      const response = await spofeClient.execute('ReverseJournalEntry', {
        entryId,
        reversalDate,
      });
      
      if (response.success) {
        setState({ loading: false, error: null });
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to reverse entry');
      }
    } catch (error) {
      setState({ loading: false, error: error.message });
      throw error;
    }
  }, []);

  return { reverse, ...state };
};

export default {
  useJournalEntriesList,
  useCreateJournalEntry,
  usePostJournalEntry,
  useReverseJournalEntry,
};
