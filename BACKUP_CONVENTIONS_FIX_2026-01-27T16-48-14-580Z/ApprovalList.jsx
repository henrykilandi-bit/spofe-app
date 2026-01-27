import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApprovalQueue, useWorkflowInstance } from '@/hooks/useWorkflow';
import { useNotifications } from '@/hooks/useNotifications';
import { ApprovalQueueDashboard } from '@/components/WorkflowApprovalUI';
import apiClient from '@/services/api.config';

/**
 * Page de liste des approbations en attente
 * Affiche un tableau des approbations avec filtres et actions rapides
 */
const ApprovalList = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const { load: loadQueue, approveItem, rejectItem, queue, filters, updateFilters } = useApprovalQueue();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApproval, setSelectedApproval] = useState(null);

  // Charger les approbations au montage
  useEffect(() => {
    const initializeApprovals = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Charger les approbations depuis l'API
        const response = await apiClient.get('/workflow/approvals/queue');
        console.log('[ApprovalList] Queue loaded:', response.data.data);
        
        // Charger dans le hook
        await loadQueue();
        
        addNotification({
          type: 'success',
          title: '✅ Approbations chargées',
          message: `${queue.length || 0} approbations en attente`,
          category: 'approvals',
          duration: 3000
        });
      } catch (err) {
        const msg = err.response?.data?.message || 'Erreur lors du chargement des approbations';
        setError(msg);
        addNotification({
          type: 'error',
          title: '❌ Erreur',
          message: msg,
          category: 'approvals'
        });
      } finally {
        setLoading(false);
      }
    };

    initializeApprovals();
  }, []);

  const handleApprove = async (approvalId, comment = '') => {
    try {
      await approveItem(approvalId, { comment });
      addNotification({
        type: 'success',
        title: '✅ Approbé',
        message: `Approbation ${approvalId} confirmée`,
        category: 'approvals',
        duration: 3000
      });
      setSelectedApproval(null);
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message || 'Erreur lors de l\'approbation',
        category: 'approvals'
      });
    }
  };

  const handleReject = async (approvalId, reason = '') => {
    try {
      await rejectItem(approvalId, { reason });
      addNotification({
        type: 'warning',
        title: '⛔ Rejeté',
        message: `Approbation ${approvalId} rejetée`,
        category: 'approvals',
        duration: 3000
      });
      setSelectedApproval(null);
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message || 'Erreur lors du rejet',
        category: 'approvals'
      });
    }
  };

  const handleViewDetails = (approval) => {
    navigate(`/approvals/${approval.id}`, {
      state: { approval }
    });
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700">❌ Erreur</h2>
          <p className="text-red-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📋 Approbations en Attente</h1>
          <p className="text-gray-600 mt-2">Gérez les approbations de workflow</p>
        </div>

        {/* Tableau des approbations */}
        {queue && queue.length > 0 ? (
          <ApprovalQueueDashboard
            approvals={queue}
            filters={filters}
            onFilterChange={updateFilters}
            onApprove={handleApprove}
            onReject={handleReject}
            onViewDetails={handleViewDetails}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">✅ Aucune approbation en attente</p>
          </div>
        )}

        {/* Statistiques rapides */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-indigo-600">{queue?.length || 0}</div>
            <div className="text-gray-600 text-sm mt-2">En attente</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-green-600">
              {queue?.filter(a => a.status === 'approved').length || 0}
            </div>
            <div className="text-gray-600 text-sm mt-2">Approuvés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-red-600">
              {queue?.filter(a => a.status === 'rejected').length || 0}
            </div>
            <div className="text-gray-600 text-sm mt-2">Rejetés</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalList;
