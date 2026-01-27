/**
 * BankingIntegrationUI - Composant pour gérer les connexions et rapprochements bancaires
 * Interface complète pour la gestion des comptes bancaires
 */

import React, { useState } from 'react';
import { useBankingConnection, usebank-reconciliation, SUPPORTED_BANKS } from '../hooks/useBanking';

/**
 * Composant BankConnectionSetup
 * Configuration initiale d'une connexion bancaire
 * @param {Object} props
 * @param {Function} props.onConnected - Callback après connexion
 * @returns {JSX.Element}
 */
export const BankConnectionSetup = ({ onConnected }) => {
  const [bankCode, setBankCode] = useState('');
  const [credentials, setCredentials] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { create, testConnection } = useBankingConnection();

  const handleBankSelect = (code) => {
    setBankCode(code);
    setCredentials({});
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      const connection = await create(bankCode, credentials, {});
      
      // Tester la connexion
      await testConnection();
      
      setError(null);
      if (onConnected) onConnected(connection);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4">Configurer une Connexion Bancaire</h3>

        {/* Sélection de la banque */}
        {!bankCode && (
          <div className="space-y-3">
            <p className="text-gray-600 font-medium">Choisir une banque:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(SUPPORTED_BANKS).map((bank) => (
                <button
                  key={bank.code}
                  onClick={() => handleBankSelect(bank.code)}
                  className="p-4 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition"
                >
                  <div className="font-semibold">{bank.name}</div>
                  <div className="text-sm text-gray-600">{bank.code}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire de credentials */}
        {bankCode && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">
                Identifiants - {SUPPORTED_BANKS[bankCode]?.name}
              </h4>
              <button
                onClick={() => setBankCode('')}
                className="text-sm text-blue-600 hover:underline"
              >
                Changer
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                value={credentials.username || ''}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                placeholder="Votre identifiant bancaire"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={credentials.password || ''}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                placeholder="Votre mot de passe"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Clé d'API (si applicable)
              </label>
              <input
                type="password"
                value={credentials.apiKey || ''}
                onChange={(e) =>
                  setCredentials({ ...credentials, apiKey: e.target.value })
                }
                placeholder="Clé d'API fournie par la banque"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading || !credentials.username || !credentials.password}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Connecter'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Composant BankingDashboard
 * Tableau de bord de gestion bancaire
 * @param {Object} props
 * @param {string} props.connectionId - ID de la connexion bancaire
 * @returns {JSX.Element}
 */
export const BankingDashboard = ({ connectionId }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const { connection, loading, syncing, sync, enableAutoSync, disableAutoSync } =
    useBankingConnection(connectionId);

  const { statements, matched, unmatched, reconciliationStatus, performReconciliation } =
    useBankReconciliation(connectionId);

  const handleSync = async () => {
    await sync({ force: true });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* En-tête */}
      <div className="border-b pb-4">
        <h3 className="text-lg font-bold">Gestion Bancaire</h3>
        {connection && (
          <p className="text-sm text-gray-600">
            Compte: {connection.accountNumber} ({connection.bankName})
          </p>
        )}
      </div>

      {/* État de la connexion */}
      {connection && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Solde</p>
            <p className="text-2xl font-bold">
              {connection.balance?.toFixed(2) || '0.00'} {connection.currency}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Statut</p>
            <p
              className={`text-2xl font-bold ${
                connection.status === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {connection.status === 'connected' ? '✓ Connecté' : '✕ Déconnecté'}
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Dernier sync</p>
            <p className="text-sm font-mono">
              {connection.lastSync
                ? new Date(connection.lastSync).toLocaleDateString('fr-FR')
                : 'Jamais'}
            </p>
          </div>
        </div>
      )}

      {/* Onglets */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Vue d'Ensemble
          </button>
          <button
            onClick={() => setActiveTab('reconciliation')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'reconciliation'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Rapprochement
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 font-medium border-b-2 ${
              activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Paramètres
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Relevés de Compte</h4>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {syncing ? 'Synchronisation...' : 'Synchroniser Maintenant'}
            </button>
          </div>

          {statements.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Montant</th>
                    <th className="text-left p-2">Référence</th>
                    <th className="text-left p-2">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {statements.map((statement) => (
                    <tr key={statement.id} className="border-b">
                      <td className="p-2">
                        {new Date(statement.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-2 font-mono">
                        {statement.amount?.toFixed(2)}
                      </td>
                      <td className="p-2 text-gray-600">{statement.reference}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            statement.status === 'matched'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {statement.status === 'matched' ? 'Rapproché' : 'En attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">Aucun relevé disponible</p>
          )}
        </div>
      )}

      {activeTab === 'reconciliation' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold">Rapprochement Bancaire</h4>
            <button
              onClick={performReconciliation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Effectuer le Rapprochement
            </button>
          </div>

          {reconciliationStatus && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm font-medium">Statut: {reconciliationStatus.status}</p>
              <p className="text-sm text-gray-600">
                Rapprochés: {matched.length} | En attente: {unmatched.length}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2">Transactions Rapprochées</h5>
              <div className="bg-green-50 p-3 rounded-lg text-sm">
                {matched.length} transactions rapprochées
              </div>
            </div>
            <div>
              <h5 className="font-semibold mb-2">En Attente</h5>
              <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                {unmatched.length} transactions en attente
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          <h4 className="font-bold">Paramètres de Synchronisation</h4>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={false}
              onChange={(e) => {
                if (e.target.checked) {
                  enableAutoSync(60); // Sync toutes les heures
                } else {
                  disableAutoSync();
                }
              }}
              className="w-4 h-4 rounded"
            />
            <span>Synchronisation automatique (toutes les heures)</span>
          </label>

          <div className="text-sm text-gray-600">
            <p>Les données seront synchronisées automatiquement chaque heure.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankConnectionSetup;
