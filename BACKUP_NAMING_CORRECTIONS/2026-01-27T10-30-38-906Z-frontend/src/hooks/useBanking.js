/**
 * useBankingConnection - Hook pour gérer les connexions bancaires
 * Gère l'authentification et la synchronisation avec les API bancaires
 */

import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Banques supportées
 * @typedef {'ECOBANK'|'UBA'|'CBA'|'OTHER'} BankCode
 */

/**
 * Connexion bancaire
 * @typedef {Object} BankConnection
 * @property {string} id - Identifiant unique
 * @property {BankCode} bankCode - Code de la banque
 * @property {string} bankName - Nom de la banque
 * @property {string} accountNumber - Numéro de compte
 * @property {string} accountHolder - Titulaire du compte
 * @property {string} currency - Devise (XOF, USD, EUR, etc.)
 * @property {number} balance - Solde actuel
 * @property {string} status - Statut: 'connected', 'disconnected', 'error'
 * @property {Date} lastSync - Date du dernier sync
 * @property {Object} credentials - Informations d'identification (chiffrées côté serveur)
 * @property {Date} createdAt - Date de création
 */

/**
 * Supporté banks configuration
 */
const SUPPORTED_BANKS = {
  ECOBANK: {
    code: 'ECOBANK',
    name: 'Ecobank',
    countries: ['BF', 'CI', 'ML', 'SN', 'TG'],
    apiEndpoint: 'https://api.ecobank.com/v2',
  },
  UBA: {
    code: 'UBA',
    name: 'United Bank for Africa',
    countries: ['BF', 'CI', 'ML', 'SN', 'TG'],
    apiEndpoint: 'https://api.ubagroup.com/v1',
  },
  CBA: {
    code: 'CBA',
    name: 'Coris Bank International',
    countries: ['BF', 'CI', 'ML', 'SN'],
    apiEndpoint: 'https://api.corisbank.bf/v1',
  },
};

/**
 * Hook useBankingConnection - Gérer une connexion bancaire
 * @param {string} connectionId - ID de la connexion (optionnel pour création)
 * @returns {Object} État et fonctions de gestion de la connexion
 */
export const useBankingConnection = (connectionId = null) => {
  const [connection, setConnection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const syncIntervalRef = useRef(null);

  /**
   * Charger une connexion existante
   */
  const load = useCallback(async () => {
    if (!connectionId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/banking/connections/${connectionId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!response.ok) throw new Error('Erreur chargement connexion');

      const data = await response.json();
      setConnection(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  /**
   * Créer une nouvelle connexion bancaire
   */
  const create = useCallback(async (bankCode, credentials, accountInfo) => {
    try {
      setLoading(true);
      const response = await fetch('/api/banking/connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          bankCode,
          credentials, // Will be encrypted server-side
          accountInfo,
        }),
      });

      if (!response.ok) throw new Error('Erreur création connexion');

      const data = await response.json();
      setConnection(data);
      setError(null);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mettre à jour les credentials
   */
  const updateCredentials = useCallback(async (credentials) => {
    if (!connection) throw new Error('Aucune connexion active');

    try {
      setLoading(true);
      const response = await fetch(
        `/api/banking/connections/${connection.id}/credentials`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ credentials }),
        }
      );

      if (!response.ok) throw new Error('Erreur mise à jour credentials');

      const data = await response.json();
      setConnection(data);
      setError(null);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connection]);

  /**
   * Tester la connexion
   */
  const testConnection = useCallback(async () => {
    if (!connection) throw new Error('Aucune connexion à tester');

    try {
      setLoading(true);
      const response = await fetch(
        `/api/banking/connections/${connection.id}/test`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (!response.ok) throw new Error('Test échoué');

      const result = await response.json();
      setError(null);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connection]);

  /**
   * Synchroniser les transactions
   */
  const sync = useCallback(async (options = {}) => {
    if (!connection) throw new Error('Aucune connexion à synchroniser');

    const { startDate, endDate, force = false } = options;

    try {
      setSyncing(true);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());
      if (force) params.append('force', 'true');

      const response = await fetch(
        `/api/banking/connections/${connection.id}/sync?${params}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (!response.ok) throw new Error('Erreur synchronisation');

      const result = await response.json();
      setSyncError(null);

      // Rafraîchir la connexion
      await load();

      return result;
    } catch (err) {
      setSyncError(err.message);
      throw err;
    } finally {
      setSyncing(false);
    }
  }, [connection, load]);

  /**
   * Activer la synchronisation automatique
   */
  const enableAutoSync = useCallback((intervalMinutes = 60) => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

    syncIntervalRef.current = setInterval(() => {
      sync({ force: true });
    }, intervalMinutes * 60 * 1000);
  }, [sync]);

  /**
   * Désactiver la synchronisation automatique
   */
  const disableAutoSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  /**
   * Déconnecter
   */
  const disconnect = useCallback(async () => {
    if (!connection) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/banking/connections/${connection.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (!response.ok) throw new Error('Erreur déconnexion');

      setConnection(null);
      setError(null);
      disableAutoSync();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connection, disableAutoSync]);

  // Auto-chargement au montage
  useEffect(() => {
    if (connectionId) {
      load();
    }

    return () => {
      disableAutoSync();
    };
  }, [connectionId, load, disableAutoSync]);

  return {
    // État
    connection,
    loading,
    error,
    syncing,
    syncError,

    // Fonctions
    load,
    create,
    updateCredentials,
    testConnection,
    sync,
    enableAutoSync,
    disableAutoSync,
    disconnect,
  };
};

/**
 * Hook useBankReconciliation - Gérer le rapprochement bancaire
 * Aligne les transactions bancaires avec les écritures comptables
 * @param {string} connectionId - ID de la connexion bancaire
 * @returns {Object} État et fonctions de rapprochement
 */
export const useBankReconciliation = (connectionId) => {
  const [statements, setStatements] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [matched, setMatched] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reconciliationStatus, setReconciliationStatus] = useState(null);

  /**
   * Charger les relevés de compte
   */
  const loadStatements = useCallback(async (dateRange) => {
    if (!connectionId) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange?.from) params.append('from', dateRange.from.toISOString());
      if (dateRange?.to) params.append('to', dateRange.to.toISOString());

      const response = await fetch(
        `/api/banking/connections/${connectionId}/statements?${params}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!response.ok) throw new Error('Erreur chargement relevés');

      const data = await response.json();
      setStatements(data.statements || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  /**
   * Effectuer le rapprochement automatique
   */
  const performReconciliation = useCallback(async (options = {}) => {
    if (!connectionId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/banking/connections/${connectionId}/reconcile`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(options),
        }
      );

      if (!response.ok) throw new Error('Erreur rapprochement');

      const result = await response.json();
      setMatched(result.matched || []);
      setUnmatched(result.unmatched || []);
      setDiscrepancies(result.discrepancies || []);
      setReconciliationStatus(result.status);
      setError(null);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  /**
   * Rapprocher manuellement deux transactions
   */
  const matchTransaction = useCallback(async (statementTxId, journalEntryId) => {
    try {
      const response = await fetch(
        `/api/banking/reconciliation/match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            statementTransactionId: statementTxId,
            journalEntryId,
            connectionId,
          }),
        }
      );

      if (!response.ok) throw new Error('Erreur rapprochement');

      const result = await response.json();
      
      // Mettre à jour l'état
      setMatched((prev) => [...prev, result.match]);
      setUnmatched((prev) =>
        prev.filter((tx) => tx.id !== statementTxId)
      );

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [connectionId]);

  /**
   * Annuler un rapprochement
   */
  const unmatchTransaction = useCallback(async (matchId) => {
    try {
      const response = await fetch(
        `/api/banking/reconciliation/unmatch/${matchId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      if (!response.ok) throw new Error('Erreur annulation');

      // Mettre à jour l'état
      setMatched((prev) => prev.filter((m) => m.id !== matchId));

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  /**
   * Clôturer le rapprochement
   */
  const closeReconciliation = useCallback(async (closingBalance) => {
    if (!connectionId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `/api/banking/connections/${connectionId}/reconciliation/close`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ closingBalance }),
        }
      );

      if (!response.ok) throw new Error('Erreur clôture');

      const result = await response.json();
      setReconciliationStatus(result.status);

      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connectionId]);

  /**
   * Exporter le rapport de rapprochement
   */
  const exportReport = useCallback(async (format = 'pdf') => {
    if (!connectionId) return;

    try {
      const response = await fetch(
        `/api/banking/connections/${connectionId}/reconciliation/export?format=${format}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!response.ok) throw new Error('Erreur export');

      // Télécharger le fichier
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reconciliation.${format}`;
      a.click();

      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [connectionId]);

  // Auto-chargement au montage
  useEffect(() => {
    if (connectionId) {
      loadStatements();
    }
  }, [connectionId, loadStatements]);

  return {
    // État
    statements,
    unmatched,
    matched,
    discrepancies,
    loading,
    error,
    reconciliationStatus,

    // Fonctions
    loadStatements,
    performReconciliation,
    matchTransaction,
    unmatchTransaction,
    closeReconciliation,
    exportReport,
  };
};

// Exporter les banques supportées
export { SUPPORTED_BANKS };

export default useBankingConnection;
