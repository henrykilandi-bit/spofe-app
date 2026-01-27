import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useWorkflowInstance } from '@/hooks/useWorkflow';
import { useNotifications } from '@/hooks/useNotifications';
import { WorkflowApprovalUI } from '@/components/WorkflowApprovalUI';
import apiClient from '@/services/api.config';

/**
 * Page de détail d'une approbation de workflow
 * Affiche le détail complet du workflow et permet d'approuver/rejeter
 */
const ApprovalDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const {
    loadWorkflow,
    workflow,
    steps,
    currentStep,
    approve,
    reject,
    cancel,
    getProgress,
    can_approve,
    loading,
    error
  } = useWorkflowInstance();

  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Charger le workflow
  useEffect(() => {
    const initWorkflow = async () => {
      try {
        const approvalData = location.state?.approval;
        if (approvalData) {
          // Charger depuis les données passées en state
          await loadWorkflow(approvalData.workflowId || id);
        } else {
          // Charger depuis l'API
          const response = await apiClient.get(`/workflow/approvals/${id}`);
          await loadWorkflow(response.data.data.workflowId);
        }
      } catch (err) {
        addNotification({
          type: 'error',
          title: '❌ Erreur',
          message: err.message || 'Erreur lors du chargement du workflow',
          category: 'approvals'
        });
      }
    };

    initWorkflow();
  }, [id, location]);

  const handleApprove = async () => {
    if (!comment.trim()) {
      addNotification({
        type: 'warning',
        title: '⚠️ Commentaire requis',
        message: 'Veuillez ajouter un commentaire',
        category: 'approvals'
      });
      return;
    }

    try {
      setIsProcessing(true);
      await approve(comment);
      addNotification({
        type: 'success',
        title: '✅ Approbé',
        message: 'Le workflow a été approuvé avec succès',
        category: 'approvals',
        duration: 3000
      });
      setTimeout(() => navigate('/approvals'), 2000);
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'approvals'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      addNotification({
        type: 'warning',
        title: '⚠️ Raison requise',
        message: 'Veuillez expliquer le rejet',
        category: 'approvals'
      });
      return;
    }

    try {
      setIsProcessing(true);
      await reject(rejectionReason);
      addNotification({
        type: 'warning',
        title: '⛔ Rejeté',
        message: 'Le workflow a été rejeté',
        category: 'approvals',
        duration: 3000
      });
      setTimeout(() => navigate('/approvals'), 2000);
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'approvals'
      });
    } finally {
      setIsProcessing(false);
    }
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
          <button
            onClick={() => navigate('/approvals')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-yellow-700">⚠️ Workflow non trouvé</h2>
          <button
            onClick={() => navigate('/approvals')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const canCurrentUserApprove = can_approve();
  const progressPercent = getProgress();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/approvals')}
            className="text-indigo-600 hover:text-indigo-700 font-medium mb-4"
          >
            ← Retour à la liste
          </button>
          <h1 className="text-3xl font-bold text-gray-900">📋 Détail du Workflow</h1>
          <p className="text-gray-600 mt-2">ID: {workflow.id}</p>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-3 gap-6">
          {/* Colonne principale - Workflow */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              {/* Barre de progression */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression</span>
                  <span className="text-sm font-bold text-indigo-600">{progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Informations du workflow */}
              <div className="space-y-4 mb-6 pb-6 border-b">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="text-lg font-semibold text-gray-900">{workflow.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="text-lg font-semibold">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        workflow.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        workflow.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {workflow.status === 'pending' ? '⏳ En attente' :
                         workflow.status === 'approved' ? '✅ Approuvé' :
                         '❌ Rejeté'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* UI de workflow */}
              <WorkflowApprovalUI
                workflow={workflow}
                steps={steps || []}
                currentStep={currentStep}
                onApprove={handleApprove}
                onReject={handleReject}
                isProcessing={isProcessing}
                can_approve={canCurrentUserApprove}
                comment={comment}
                onCommentChange={setComment}
                rejectionReason={rejectionReason}
                onRejectionReasonChange={setRejectionReason}
              />
            </div>
          </div>

          {/* Colonne latérale - Détails */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Détails</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Créé le</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(workflow.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Créé par</p>
                  <p className="text-sm font-medium text-gray-900">{workflow.createdBy}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Étapes</p>
                  <div className="space-y-2">
                    {steps?.map((step, idx) => (
                      <div
                        key={idx}
                        className={`text-sm p-2 rounded ${
                          step.status === 'completed' ? 'bg-green-50 text-green-700' :
                          step.status === 'pending' ? 'bg-blue-50 text-blue-700' :
                          'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {idx + 1}. {step.name || step.approverRole}
                      </div>
                    ))}
                  </div>
                </div>

                {!canCurrentUserApprove && workflow.status === 'pending' && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                    ℹ️ Vous n'êtes pas autorisé à approuver cette demande
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalDetail;
