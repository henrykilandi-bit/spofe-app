/**
 * useWorkflowInstance - Hook pour gérer les instances de workflow d'approbation
 * Gère le cycle de vie complet d'un workflow configurable
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useApiCall } from './useApi';

/**
 * Statut d'une instance de workflow
 * @typedef {'draft'|'pending'|'approved'|'rejected'|'expired'|'cancelled'} WorkflowStatus
 */

/**
 * État d'une étape de workflow
 * @typedef {Object} WorkflowStep
 * @property {string} id - Identifiant unique
 * @property {number} sequence - Numéro de séquence
 * @property {string} name - Nom de l'étape
 * @property {string} status - Statut: 'pending', 'approved', 'rejected'
 * @property {string} approverRole - Rôle requis pour approuver
 * @property {string} [approvedBy] - ID utilisateur qui a approuvé
 * @property {Date} [approvedAt] - Date d'approbation
 * @property {string} [comment] - Commentaire d'approbation
 * @property {number} [requiredApprovers] - Nombre d'approbateurs requis
 * @property {string[]} [approvers] - Liste des approbateurs actuels
 */

/**
 * Instance de workflow
 * @typedef {Object} WorkflowInstance
 * @property {string} id - Identifiant unique
 * @property {string} templateId - ID du template
 * @property {string} entityType - Type d'entité: 'journal_entry', 'purchase', 'expense', etc.
 * @property {string} entityId - ID de l'entité
 * @property {WorkflowStatus} status - Statut global
 * @property {WorkflowStep[]} steps - Étapes du workflow
 * @property {number} currentStepIndex - Index de l'étape actuelle
 * @property {Object} context - Données contextuelles
 * @property {Date} created_at - Date de création
 * @property {Date} [completedAt] - Date de complétion
 * @property {Date} [expiresAt] - Date d'expiration
 */

/**
 * Hook useWorkflowInstance
 * @param {string} entityType - Type d'entité concernée
 * @param {string} entityId - ID de l'entité
 * @returns {Object} État et fonctions de gestion du workflow
 */
export const useWorkflowInstance = (entityType, entityId) => {
  const [workflow, setWorkflow] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  /**
   * Charger le workflow pour l'entité
   */
  const loadWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/workflows/instance?entityType=${entityType}&entityId=${entityId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!response.ok) throw new Error('Erreur chargement workflow');

      const data = await response.json();
      setWorkflow(data.workflow);
      setSteps(data.workflow.steps || []);
      setCurrentStep(data.workflow.steps?.[data.workflow.currentStepIndex]);
      setHistory(data.history || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  /**
   * Initier un nouveau workflow
   */
  const initiate = useCallback(async (templateId, context = {}) => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflows/instance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          templateId,
          entityType,
          entityId,
          context,
        }),
      });

      if (!response.ok) throw new Error('Erreur création workflow');

      const data = await response.json();
      setWorkflow(data);
      setSteps(data.steps || []);
      setCurrentStep(data.steps?.[0]);
      setError(null);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  /**
   * Approuver l'étape actuelle
   */
  const approve = useCallback(async (comment = '') => {
    if (!currentStep) {
      throw new Error('Aucune étape à approuver');
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/workflows/instance/${workflow.id}/steps/${currentStep.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) throw new Error('Erreur approbation');

      const data = await response.json();
      setWorkflow(data);
      setSteps(data.steps);
      
      // Passer à l'étape suivante
      if (data.currentStepIndex < data.steps.length) {
        setCurrentStep(data.steps[data.currentStepIndex]);
      }

      // Ajouter à l'historique
      setHistory((prev) => [
        ...prev,
        {
          action: 'APPROVED',
          stepId: currentStep.id,
          comment,
          timestamp: Date.now(),
        },
      ]);

      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow?.id, currentStep]);

  /**
   * Rejeter l'étape actuelle
   */
  const reject = useCallback(async (reason) => {
    if (!currentStep) {
      throw new Error('Aucune étape à rejeter');
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/workflows/instance/${workflow.id}/steps/${currentStep.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error('Erreur rejet');

      const data = await response.json();
      setWorkflow(data);
      setSteps(data.steps);
      setCurrentStep(null);

      // Ajouter à l'historique
      setHistory((prev) => [
        ...prev,
        {
          action: 'REJECTED',
          stepId: currentStep.id,
          reason,
          timestamp: Date.now(),
        },
      ]);

      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow?.id, currentStep]);

  /**
   * Annuler le workflow
   */
  const cancel = useCallback(async (reason) => {
    if (!workflow) {
      throw new Error('Aucun workflow actif');
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/workflows/instance/${workflow.id}/cancel`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error('Erreur annulation');

      const data = await response.json();
      setWorkflow(data);
      setCurrentStep(null);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [workflow?.id]);

  /**
   * Obtenir la progression du workflow
   */
  const getProgress = useCallback(() => {
    if (!workflow?.steps) return 0;
    const approved = workflow.steps.filter((s) => s.status === 'approved').length;
    return Math.round((approved / workflow.steps.length) * 100);
  }, [workflow]);

  /**
   * Vérifier si l'utilisateur peut approuver
   */
  const can_approve = useCallback(() => {
    if (!currentStep) return false;
    return currentStep.status === 'pending';
  }, [currentStep]);

  // Auto-chargement au montage
  useEffect(() => {
    if (entityType && entityId) {
      loadWorkflow();
    }
  }, [entityType, entityId, loadWorkflow]);

  return {
    // État
    workflow,
    steps,
    currentStep,
    loading,
    error,
    history,

    // Fonctions
    loadWorkflow,
    initiate,
    approve,
    reject,
    cancel,
    getProgress,
    can_approve,
  };
};

/**
 * Hook useApprovalQueue - Gérer une queue d'approbations en attente
 * Utile pour les dashboards d'administrateurs
 * @returns {Object} État et fonctions de gestion de la queue
 */
export const useApprovalQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    entityType: null,
    priority: null,
  });

  /**
   * Charger la queue d'approbations
   */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await fetch(
        `/api/workflows/approvals/queue?${params}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!response.ok) throw new Error('Erreur chargement queue');

      const data = await response.json();
      setQueue(data.items || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Approuver un élément de la queue
   */
  const approveItem = useCallback(async (itemId, comment = '') => {
    try {
      const response = await fetch(
        `/api/workflows/approvals/${itemId}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ comment }),
        }
      );

      if (!response.ok) throw new Error('Erreur approbation');

      // Rafraîchir la queue
      await load();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [load]);

  /**
   * Rejeter un élément de la queue
   */
  const rejectItem = useCallback(async (itemId, reason) => {
    try {
      const response = await fetch(
        `/api/workflows/approvals/${itemId}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error('Erreur rejet');

      // Rafraîchir la queue
      await load();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [load]);

  /**
   * Mettre à jour les filtres et recharger
   */
  const updateFilters = useCallback(async (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // Auto-chargement au montage
  useEffect(() => {
    load();
  }, [filters, load]);

  return {
    // État
    queue,
    loading,
    error,
    filters,

    // Fonctions
    load,
    approveItem,
    rejectItem,
    updateFilters,
  };
};

export default useWorkflowInstance;
