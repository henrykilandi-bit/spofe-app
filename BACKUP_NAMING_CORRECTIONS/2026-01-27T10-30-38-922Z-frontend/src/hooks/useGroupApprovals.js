/**
 * useGroupApprovals Hook
 * Gère les approbations d'inscriptions par groupe
 */

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export const useGroupApprovals = (groupeId = null, authToken = null) => {
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
    if (!groupeId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${groupeId}/pending-approvals`,
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
  }, [groupeId, headers]);

  /**
   * Récupérer statistiques approbations
   */
  const fetchApprovalStats = useCallback(async () => {
    if (!groupeId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${groupeId}/approval-stats`,
        { headers }
      );

      setStats(response.data.data);
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des statistiques';
      setError(errorMessage);
      return null;
    }
  }, [groupeId, headers]);

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
  const assignSuperUser = useCallback(async (userId) => {
    if (!groupeId) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/admin/groups/${groupeId}/super-users`,
        { userId },
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
  }, [groupeId, headers]);

  /**
   * Lister super-utilisateurs
   */
  const fetchSuperUsers = useCallback(async () => {
    if (!groupeId) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/admin/groups/${groupeId}/super-users`,
        { headers }
      );

      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erreur lors du chargement des super-utilisateurs';
      setError(errorMessage);
      return null;
    }
  }, [groupeId, headers]);

  /**
   * Supprimer super-utilisateur
   */
  const removeSuperUser = useCallback(async (userId) => {
    if (!groupeId) return;

    try {
      const response = await axios.delete(
        `${API_BASE_URL}/admin/groups/${groupeId}/super-users/${userId}`,
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
  }, [groupeId, headers]);

  /**
   * Inviter utilisateur
   */
  const inviteUser = useCallback(async (email) => {
    if (!groupeId) return;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/invite-user`,
        { email, groupeId },
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
  }, [groupeId, headers]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les données au montage
  useEffect(() => {
    if (groupeId && authToken) {
      fetchPendingApprovals();
      fetchApprovalStats();
    }
  }, [groupeId, authToken]);

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
