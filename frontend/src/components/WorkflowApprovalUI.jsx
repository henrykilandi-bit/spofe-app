/**
 * WorkflowApprovalUI - Composant pour gérer les approbations de workflow
 * Interface configurable pour les différents types d'approbations
 */

import React, { useState } from 'react';
import { useWorkflowInstance, useApprovalQueue } from '../hooks/useWorkflow';

/**
 * Composant WorkflowApprovalUI
 * @param {Object} props
 * @param {string} props.entityType - Type d'entité concernée
 * @param {string} props.entityId - ID de l'entité
 * @param {Function} [props.onApproved] - Callback après approbation
 * @param {Function} [props.onRejected] - Callback après rejet
 * @returns {JSX.Element}
 */
export const WorkflowApprovalUI = ({
  entityType,
  entityId,
  onApproved,
  onRejected,
}) => {
  const {
    workflow,
    currentStep,
    loading,
    error,
    getProgress,
    can_approve,
    approve,
    reject,
  } = useWorkflowInstance(entityType, entityId);

  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleApprove = async () => {
    try {
      await approve(approvalComment);
      setApprovalComment('');
      if (onApproved) onApproved();
    } catch (err) {
      console.error('Erreur approbation:', err);
    }
  };

  const handleReject = async () => {
    try {
      await reject(rejectionReason);
      setRejectionReason('');
      setShowRejectionForm(false);
      if (onRejected) onRejected();
    } catch (err) {
      console.error('Erreur rejet:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg">
        <p className="text-gray-600">Aucun workflow actif</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      {/* En-tête */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold">Workflow d'Approbation</h3>
        <p className="text-sm text-gray-600">
          Statut: <span className="font-semibold">{workflow.status}</span>
        </p>
      </div>

      {/* Barre de progression */}
      {workflow.steps && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Progression</span>
            <span className="text-sm text-gray-600">{getProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Étapes */}
      {workflow.steps && (
        <div className="space-y-2">
          {workflow.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start p-3 rounded-lg ${
                step.status === 'approved'
                  ? 'bg-green-50'
                  : step.status === 'rejected'
                  ? 'bg-red-50'
                  : 'bg-gray-50'
              }`}
            >
              <div className="mr-3">
                {step.status === 'approved' && (
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                    ✓
                  </div>
                )}
                {step.status === 'rejected' && (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                    ✕
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{step.name}</p>
                <p className="text-sm text-gray-600">
                  Rôle requis: <span className="font-semibold">{step.approverRole}</span>
                </p>
                {step.approvedAt && (
                  <p className="text-sm text-green-700">
                    Approuvé par {step.approvedBy} le{' '}
                    {new Date(step.approvedAt).toLocaleDateString('fr-FR')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Étape actuelle */}
      {currentStep && (
        <div className="border-t pt-4 mt-4 space-y-4">
          <h4 className="font-bold">Étape Actuelle: {currentStep.name}</h4>

          {can_approve() ? (
            <>
              {/* Formulaire d'approbation */}
              {!showRejectionForm && (
                <div className="space-y-3">
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="Commentaire d'approbation (optionnel)..."
                    className="w-full p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => setShowRejectionForm(true)}
                      disabled={loading}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      Rejeter
                    </button>
                  </div>
                </div>
              )}

              {/* Formulaire de rejet */}
              {showRejectionForm && (
                <div className="space-y-3 bg-red-50 p-4 rounded-lg">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Motif du rejet..."
                    className="w-full p-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows="3"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReject}
                      disabled={loading || !rejectionReason}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      Confirmer le Rejet
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectionForm(false);
                        setRejectionReason('');
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600 text-sm">
              Vous n'avez pas les permissions pour approuver cette étape.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
};

/**
 * Composant ApprovalQueueDashboard
 * Tableau de bord pour gérer la queue d'approbations
 * @param {Object} props
 * @returns {JSX.Element}
 */
export const ApprovalQueueDashboard = () => {
  const { queue, loading, filters, updateFilters, approveItem, rejectItem } =
    useApprovalQueue();

  const [selectedItemId, setSelectedItemId] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold">Queue d'Approbations</h3>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        <select
          value={filters.entityType || ''}
          onChange={(e) => updateFilters({ entityType: e.target.value || null })}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Tous les types</option>
          <option value="journal_entry">Écritures Journal</option>
          <option value="purchase">Achats</option>
          <option value="expense">Dépenses</option>
        </select>

        <select
          value={filters.priority || ''}
          onChange={(e) => updateFilters({ priority: e.target.value || null })}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="">Toutes les priorités</option>
          <option value="high">Haute</option>
          <option value="medium">Moyenne</option>
          <option value="low">Basse</option>
        </select>
      </div>

      {/* Tableau */}
      {loading ? (
        <div className="text-center py-8 text-gray-600">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Entité</th>
                <th className="text-left p-2">Type</th>
                <th className="text-left p-2">Priorité</th>
                <th className="text-left p-2">Créée le</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{item.entityName}</td>
                  <td className="p-2 text-gray-600">{item.entityType}</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        item.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : item.priority === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </td>
                  <td className="p-2 text-gray-600">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-2 flex gap-2">
                    <button
                      onClick={() => approveItem(item.id)}
                      className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                    >
                      Approuver
                    </button>
                    <button
                      onClick={() => rejectItem(item.id, 'Rejet manuel')}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                    >
                      Rejeter
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {queue.length === 0 && (
            <div className="text-center py-8 text-gray-600">
              Aucune approbation en attente
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowApprovalUI;
