import React, { useState, useEffect } from 'react';
import { useBankingConnection, SUPPORTED_BANKS } from '@/hooks/useBanking';
import { useNotifications } from '@/hooks/useNotifications';
import { BankConnectionSetup, BankingDashboard } from '@/components/BankingIntegrationUI';
import apiClient from '@/services/api.config';

/**
 * Page de gestion des connexions bancaires
 * Permet de créer, modifier et gérer les connexions à plusieurs banques
 */
const BankingConnections = () => {
  const { addNotification } = useNotifications();
  const {
    load,
    create,
    connection,
    connections = [],
    loading,
    error,
    testConnection
  } = useBankingConnection();

  const [showSetup, setShowSetup] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [setupStep, setSetupStep] = useState('select'); // 'select', 'credentials', 'test', 'success'
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    username: '',
    password: '',
    accountName: ''
  });

  // Charger les connexions existantes au montage
  useEffect(() => {
    initConnections();
  }, []);

  const initConnections = async () => {
    try {
      const response = await apiClient.get('/banking/connections');
      console.log('[BankingConnections] Loaded:', response.data.data);
      await load();
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.response?.data?.message || 'Erreur lors du chargement',
        category: 'banking'
      });
    }
  };

  const handleBankSelect = (bankCode) => {
    setSelectedBank(bankCode);
    setSetupStep('credentials');
    setFormData({
      bankCode,
      accountNumber: '',
      username: '',
      password: '',
      accountName: ''
    });
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTestConnection = async () => {
    try {
      setIsCreating(true);
      const response = await testConnection(formData);
      
      if (response.success) {
        setSetupStep('success');
        addNotification({
          type: 'success',
          title: '✅ Connexion validée',
          message: 'Les identifiants sont corrects',
          category: 'banking',
          duration: 3000
        });
      } else {
        addNotification({
          type: 'error',
          title: '❌ Connexion invalide',
          message: response.error || 'Impossible de se connecter à la banque',
          category: 'banking'
        });
      }
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message,
        category: 'banking'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateConnection = async () => {
    try {
      setIsCreating(true);
      await create({
        ...formData,
        is_active: true,
        autoSync: false
      });

      addNotification({
        type: 'success',
        title: '✅ Connexion créée',
        message: `Connexion à ${selectedBank} établie`,
        category: 'banking',
        duration: 3000
      });

      // Réinitialiser le formulaire
      setShowSetup(false);
      setSelectedBank(null);
      setSetupStep('select');
      setFormData({
        bankCode: '',
        accountNumber: '',
        username: '',
        password: '',
        accountName: ''
      });

      // Recharger les connexions
      await initConnections();
    } catch (err) {
      addNotification({
        type: 'error',
        title: '❌ Erreur',
        message: err.message || 'Erreur lors de la création de la connexion',
        category: 'banking'
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🏦 Connexions Bancaires</h1>
            <p className="text-gray-600 mt-2">Gérez vos connexions aux institutions financières</p>
          </div>
          <button
            onClick={() => setShowSetup(!showSetup)}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              showSetup
                ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {showSetup ? '✕ Annuler' : '+ Nouvelle connexion'}
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Formulaire de setup */}
        {showSetup && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            {setupStep === 'select' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Sélectionnez votre banque</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(SUPPORTED_BANKS).map(([code, bank]) => (
                    <button
                      key={code}
                      onClick={() => handleBankSelect(code)}
                      className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-600 hover:bg-indigo-50 transition-all text-center"
                    >
                      <div className="text-3xl mb-2">{bank.icon}</div>
                      <div className="font-semibold text-gray-900">{bank.name}</div>
                      <div className="text-sm text-gray-500 mt-1">{code}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {setupStep === 'credentials' && selectedBank && (
              <BankConnectionSetup
                bankCode={selectedBank}
                bankName={SUPPORTED_BANKS[selectedBank].name}
                formData={formData}
                onFormChange={handleFormChange}
                onTest={handleTestConnection}
                isLoading={isCreating}
                onCancel={() => setSetupStep('select')}
              />
            )}

            {setupStep === 'success' && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Connexion validée!</h2>
                <p className="text-gray-600 mb-6">Les identifiants sont corrects</p>
                <button
                  onClick={handleCreateConnection}
                  disabled={isCreating}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {isCreating ? 'Création...' : 'Créer la connexion'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Connexions existantes */}
        {connections && connections.length > 0 ? (
          <BankingDashboard
            connections={connections}
            onSync={initConnections}
          />
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-4xl mb-4">🏦</div>
            <p className="text-lg text-gray-600">Aucune connexion bancaire configurée</p>
            <p className="text-sm text-gray-500 mt-2">
              Cliquez sur "Nouvelle connexion" pour configurer votre première banque
            </p>
          </div>
        )}

        {/* Statistiques */}
        {connections && connections.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-indigo-600">{connections.length}</div>
              <div className="text-gray-600 text-sm mt-2">Connexions actives</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-green-600">
                {connections.filter(c => c.is_active).length}
              </div>
              <div className="text-gray-600 text-sm mt-2">Activées</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl font-bold text-blue-600">
                {connections.filter(c => c.lastSync).length}
              </div>
              <div className="text-gray-600 text-sm mt-2">Synchronisées</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankingConnections;
