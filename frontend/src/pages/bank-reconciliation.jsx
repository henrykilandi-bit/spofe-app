import React, { useState, useEffect } from 'react';
import { useBankReconciliation } from '@/hooks/useBanking';
import { useNotifications } from '@/hooks/useNotifications';
import apiClient from '@/services/api.config';

/**
 * Page de réconciliation bancaire
 * Permet de synchroniser et réconcilier les transactions bancaires
 */
const BankReconciliation = () => {
  const { addNotification } = useNotifications();
  const {
    loadStatements,
    performReconciliation,
    matchTransaction,
    unmatchTransaction,
    closeReconciliation,
    exportReport,
    statements = [],
    matched = [],
    unmatched = [],
    reconciliationStatus,
    loading,
    error
  } = useBankReconciliation();

  const [selectedBank, setSelectedBank] = useState(null);
  const [reconciliationInProgress, setReconciliationInProgress] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all', // 'all', 'matched', 'unmatched'
    dateFrom: '',
    dateTo: '',
    searchText: ''
  });

  // Charger les relevés au montage
  useEffect(() => {
    initStatements();
  }, []);

  const initStatements = async () => {
    try {
      const response = await apiClient.get('/banking/statements');
      console.log('[BankReconciliation] Statements loaded:', response.data.data);
      await loadStatements();
      addNotification({
        type: 'success',
        title: '✅ Relevés chargés',
        message: `${statements?.length || 0} relevés disponibles`,
        category: 'banking',
        duration: 2000
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.response?.data?.message || 'Erreur lors du chargement',
        category: 'banking'
      });
    }
  };

  const handleStartReconciliation = async (bankId) => {
    try {
      setReconciliationInProgress(true);
      setSelectedBank(bankId);
      
      await performReconciliation(bankId);
      
      addNotification({
        type: 'info',
        title: '🔄 Réconciliation en cours',
        message: 'Analyse des transactions...',
        category: 'banking'
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'banking'
      });
    } finally {
      setReconciliationInProgress(false);
    }
  };

  const handleMatchTransaction = async (transactionId, bookEntryId) => {
    try {
      await matchTransaction(transactionId, bookEntryId);
      addNotification({
        type: 'success',
        title: '✅ Transaction appariée',
        message: 'La transaction a été liée à l\'écriture comptable',
        category: 'banking',
        duration: 2000
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'banking'
      });
    }
  };

  const handleUnmatchTransaction = async (transactionId) => {
    try {
      await unmatchTransaction(transactionId);
      addNotification({
        type: 'warning',
        title: '⚠️ Appariement annulé',
        message: 'La transaction est à nouveau non appariée',
        category: 'banking',
        duration: 2000
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'banking'
      });
    }
  };

  const handleCloseReconciliation = async () => {
    try {
      setReconciliationInProgress(true);
      await closeReconciliation(selectedBank);
      addNotification({
        type: 'success',
        title: '✅ Réconciliation fermée',
        message: 'La période de réconciliation est maintenant fermée',
        category: 'banking',
        duration: 3000
      });
      setSelectedBank(null);
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'banking'
      });
    } finally {
      setReconciliationInProgress(false);
    }
  };

  const handleExportReport = async () => {
    try {
      const data = await exportReport(selectedBank);
      addNotification({
        type: 'success',
        title: '✅ Rapport généré',
        message: 'Le rapport a été téléchargé',
        category: 'banking',
        duration: 3000
      });
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'banking'
      });
    }
  };

  // Filtrer les transactions
  const getFilteredTransactions = () => {
    let filtered = filters.status === 'unmatched' ? unmatched : 
                   filters.status === 'matched' ? matched :
                   [...(matched || []), ...(unmatched || [])];

    if (filters.searchText) {
      filtered = filtered.filter(t =>
        t.reference?.toLowerCase().includes(filters.searchText.toLowerCase()) ||
        t.description?.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();
  const matchedCount = matched?.length || 0;
  const unmatchedCount = unmatched?.length || 0;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">💼 Réconciliation Bancaire</h1>
          <p className="text-gray-600 mt-2">Synchronisez et réconciliez vos transactions</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-indigo-600">{statements?.length || 0}</div>
            <div className="text-gray-600 text-sm mt-2">Relevés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{matchedCount}</div>
            <div className="text-gray-600 text-sm mt-2">Appariées</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{unmatchedCount}</div>
            <div className="text-gray-600 text-sm mt-2">Non appariées</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {matchedCount + unmatchedCount > 0 
                ? Math.round((matchedCount / (matchedCount + unmatchedCount)) * 100) 
                : 0}%
            </div>
            <div className="text-gray-600 text-sm mt-2">Taux d'appariement</div>
          </div>
        </div>

        {/* Actions principales */}
        {selectedBank ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  🔄 Réconciliation en cours pour {selectedBank}
                </h2>
                <p className="text-sm text-blue-700 mt-1">
                  {matchedCount} appariées, {unmatchedCount} à traiter
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleExportReport}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  📄 Exporter rapport
                </button>
                <button
                  onClick={handleCloseReconciliation}
                  disabled={reconciliationInProgress || unmatchedCount > 0}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✅ Fermer réconciliation
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statements?.slice(0, 3).map((statement) => (
              <div
                key={statement.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleStartReconciliation(statement.bankId)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{statement.bankName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(statement.startDate).toLocaleDateString('fr-FR')} - {new Date(statement.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    statement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {statement.status === 'pending' ? '⏳ En attente' : '✅ Complété'}
                  </span>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {Number(statement.balance).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0
                  })}
                </div>
                <button className="mt-4 w-full px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 font-medium">
                  🔄 Réconcilier
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tableau des transactions */}
        {selectedBank && (
          <div className="bg-white rounded-lg shadow">
            {/* Filtres */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filters.searchText}
                  onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border rounded-lg"
                >
                  <option value="all">Tous</option>
                  <option value="matched">Appariées</option>
                  <option value="unmatched">Non appariées</option>
                </select>
              </div>
            </div>

            {/* Liste */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Référence</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Montant</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions?.map((transaction) => {
                    const isMatched = matched?.some(m => m.id === transaction.id);
                    return (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-700">
                          {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-700">{transaction.reference}</td>
                        <td className="px-6 py-3 text-sm text-gray-700">{transaction.description}</td>
                        <td className="px-6 py-3 text-sm text-right font-medium text-gray-900">
                          {Number(transaction.amount).toLocaleString('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0
                          })}
                        </td>
                        <td className="px-6 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            isMatched
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {isMatched ? '✅ Appariée' : '⚠️ Non appariée'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {isMatched ? (
                            <button
                              onClick={() => handleUnmatchTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-700 font-medium text-sm"
                            >
                              Dissocier
                            </button>
                          ) : (
                            <button
                              onClick={() => handleMatchTransaction(transaction.id, null)}
                              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              Apparier
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredTransactions?.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Aucune transaction trouvée
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankReconciliation;
