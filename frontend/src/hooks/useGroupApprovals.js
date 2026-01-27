/**
 * useGroupApprovals Hook
 * Gère les approbations d'inscriptions par groupe
 */

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const useGroupApprovals = (groupe_id = null, authToken = null) => {
  const [approvals, setApprovals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0
  });

  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  /**
   * Récupérer approbations en attente
   */
  const fetchPendingApprovals = useCallback(async (limit = 50, offset = 0, status = 'pending') => {
    if (!groupe_id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${groupe_id}/pending-approvals`,
        {
          params: { status, limit, offset },
          headers
        }
      );

      setApprovals(response.data.data.approvals);
      setPagination(response.data.data.pagination);

      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des approbations';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [groupe_id, headers]);

  /**
   * Récupérer statistiques approbations
   */
  const fetchApprovalStats = useCallback(async () => {
    if (!groupe_id) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${groupe_id}/approval-stats`,
        { headers }
      );

      setStats(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      return null;
    }
  }, [groupe_id, headers]);

  /**
   * Approuver une inscription
   */
  const approveApproval = useCallback(async (approvalId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/pending-approvals/${approvalId}/approve`,
        {},
        { headers }
      );

      // Mettre à jour la liste locale
      setApprovals(prev =>
        prev.map(a => a.id === approvalId ? response.data.data : a)
      );

      // Recharger statistiques
      await fetchApprovalStats();

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'approbation';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [headers, fetchApprovalStats]);

  /**
   * Rejeter une inscription
   */
  const rejectApproval = useCallback(async (approvalId, rejectionReason) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/pending-approvals/${approvalId}/reject`,
        { rejectionReason },
        { headers }
      );

      // Mettre à jour la liste locale
      setApprovals(prev =>
        prev.map(a => a.id === approvalId ? response.data.data : a)
      );

      // Recharger statistiques
      await fetchApprovalStats();

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du rejet';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [headers, fetchApprovalStats]);

  /**
   * Assigner super-utilisateur
   */
  const assignSuperUser = useCallback(async (user_id) => {
    if (!groupe_id) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/groups/${groupe_id}/super-users`,
        { user_id },
        { headers }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'assignation';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [groupe_id, headers]);

  /**
   * Lister super-utilisateurs
   */
  const fetchSuperUsers = useCallback(async () => {
    if (!groupe_id) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${groupe_id}/super-users`,
        { headers }
      );

      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des super-utilisateurs';
      setError(errorMessage);
      return null;
    }
  }, [groupe_id, headers]);

  /**
   * Supprimer super-utilisateur
   */
  const removeSuperUser = useCallback(async (user_id) => {
    if (!groupe_id) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/groups/${groupe_id}/super-users/${user_id}`,
        { headers }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [groupe_id, headers]);

  /**
   * Inviter utilisateur
   */
  const inviteUser = useCallback(async (email) => {
    if (!groupe_id) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/invite-user`,
        { email, groupe_id },
        { headers }
      );

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors de l\'invitation';
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage
      };
    }
  }, [groupe_id, headers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les données au montage
  useEffect(() => {
    if (groupe_id && authToken) {
      fetchPendingApprovals();
      fetchApprovalStats();
    }
  }, [groupe_id, authToken]);

  return {
    // États
    approvals,
    stats,
    loading,
    error,
    pagination,

    // Méthodes
    fetchPendingApprovals,
    fetchApprovalStats,
    approveApproval,
    rejectApproval,
    assignSuperUser,
    fetchSuperUsers,
    removeSuperUser,
    inviteUser,
    clearError
  };
};

export default useGroupApprovals;
