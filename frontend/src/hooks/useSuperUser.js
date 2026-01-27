import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Hook personnalisé pour les opérations du super utilisateur
 * Gère tous les appels API pour l'approbation et la validation
 */
const useSuperUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
  const token = localStorage.getItem('auth_token');

  const axiosInstance = axios.create({
    baseURL: apiUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  /**
   * Charger les statistiques d'approbation
   */
  const loadApprovalStats = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/admin/stats/approvals', {
        params: filters
      });
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
      setError(errorMsg);
      console.error('Error loading approval stats:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Charger les utilisateurs en attente d'approbation
   */
  const loadPendingUsers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get('/admin/users/pending', {
        params: filters
      });
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des utilisateurs';
      setError(errorMsg);
      console.error('Error loading pending users:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Approuver un utilisateur
   */
  const approveUser = useCallback(async (user_id, notes = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post(
        `/admin/users/${user_id}/approve`,
        { notes }
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'approbation';
      setError(errorMsg);
      console.error('Error approving user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Rejeter un utilisateur
   */
  const rejectUser = useCallback(async (user_id, reason, notes = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post(
        `/admin/users/${user_id}/reject`,
        { reason, notes }
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du rejet';
      setError(errorMsg);
      console.error('Error rejecting user:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Demander des modifications
   */
  const requestChanges = useCallback(async (user_id, requirements) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post(
        `/admin/users/${user_id}/request-changes`,
        { requirements }
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de la demande de modifications';
      setError(errorMsg);
      console.error('Error requesting changes:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Approbation en masse
   */
  const bulkApprove = useCallback(async (userIds, notes = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.post(
        '/admin/users/bulk-approve',
        { userIds, notes }
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors de l\'approbation en masse';
      setError(errorMsg);
      console.error('Error bulk approving users:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Télécharger le rapport d'approbation
   */
  const downloadReport = useCallback(async (format = 'excel') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(
        '/admin/reports/approvals',
        { params: { format }, responseType: 'blob' }
      );
      
      // Create download link
      const blob = new Blob([response.data], {
        type: format === 'excel' 
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'text/csv'
      });
      
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = `rapport_approbations_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du téléchargement du rapport';
      setError(errorMsg);
      console.error('Error downloading report:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Charger le journal d'audit
   */
  const loadAuditLogs = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(
        '/admin/audit/logs',
        { params: filters }
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement du journal';
      setError(errorMsg);
      console.error('Error loading audit logs:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  /**
   * Charger les détails d'un utilisateur
   */
  const getUserDetails = useCallback(async (user_id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axiosInstance.get(
        `/admin/users/${user_id}/details`
      );
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Erreur lors du chargement des détails';
      setError(errorMsg);
      console.error('Error loading user details:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    loading,
    error,
    loadApprovalStats,
    loadPendingUsers,
    approveUser,
    rejectUser,
    requestChanges,
    bulkApprove,
    downloadReport,
    loadAuditLogs,
    getUserDetails
  };
};

export default useSuperUser;
