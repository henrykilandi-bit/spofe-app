import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '@/services/api.config';
import { useAuthContext } from '@/context/AuthContext';

// ===============================================
// CONNECTION HEALTH MONITOR
// ===============================================

/**
 * Composant de surveillance de la santé de connexion
 * Affiche un indicateur en temps réel et permet les tests manuels
 */
export default function ConnectionHealthMonitor() {
  const { token, user, isAuthenticated } = useAuthContext();
  const [healthStatus, setHealthStatus] = useState({
    backend: 'unknown',
    database: 'unknown',
    auth: 'unknown',
    lastCheck: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Vérifier la santé du backend
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await apiClient.get('/health');
      return {
        status: 'success',
        responseTime: response.headers['x-response-time'] || 'N/A',
        uptime: response.data?.uptime || 'N/A',
        database: response.data?.database || 'unknown'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.response?.data?.message || error.message,
        responseTime: 'N/A'
      };
    }
  }, []);

  // Vérifier la validité du token
  const checkTokenValidity = useCallback(async () => {
    if (!token) return { status: 'no_token' };
    
    try {
      const response = await apiClient.get('/auth/verify-token');
      return {
        status: 'valid',
        user: response.data?.user,
        expiresAt: response.data?.expiresAt
      };
    } catch (error) {
      return {
        status: 'invalid',
        error: error.response?.data?.message || error.message
      };
    }
  }, [token]);

  // Vérifier la connexion à la base de données
  const checkDatabaseConnection = useCallback(async () => {
    try {
      const response = await apiClient.get('/health/database');
      return {
        status: 'connected',
        connectionTime: response.data?.connectionTime || 'N/A',
        poolSize: response.data?.poolSize || 'N/A'
      };
    } catch (error) {
      return {
        status: 'disconnected',
        error: error.response?.data?.message || error.message
      };
    }
  }, []);

  // Test de connexion complet
  const runFullConnectionTest = useCallback(async () => {
    setIsLoading(true);
    const timestamp = new Date().toLocaleString();
    
    try {
      const results = [];
      
      // Test 1: Santé backend
      console.log('[HealthMonitor] 🔍 Checking backend health...');
      const backendResult = await checkBackendHealth();
      results.push({
        test: 'Backend Health',
        status: backendResult.status,
        details: backendResult,
        timestamp
      });

      // Test 2: Validité token
      console.log('[HealthMonitor] 🔍 Checking token validity...');
      const tokenResult = await checkTokenValidity();
      results.push({
        test: 'Token Validity',
        status: tokenResult.status,
        details: tokenResult,
        timestamp
      });

      // Test 3: Connexion base de données
      console.log('[HealthMonitor] 🔍 Checking database connection...');
      const dbResult = await checkDatabaseConnection();
      results.push({
        test: 'Database Connection',
        status: dbResult.status,
        details: dbResult,
        timestamp
      });

      setTestResults(results);
      
      // Mettre à jour le statut global
      const overallStatus = results.every(r => r.status === 'success' || r.status === 'valid' || r.status === 'connected');
      setHealthStatus({
        backend: backendResult.status,
        database: dbResult.status,
        auth: tokenResult.status,
        lastCheck: timestamp,
        overall: overallStatus ? 'healthy' : 'degraded'
      });

      console.log('[HealthMonitor] ✅ Full connection test completed');
      
    } catch (error) {
      console.error('[HealthMonitor] ❌ Connection test failed:', error);
      setTestResults([{
        test: 'Full Connection Test',
        status: 'error',
        details: { error: error.message },
        timestamp: new Date().toLocaleString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [checkBackendHealth, checkTokenValidity, checkDatabaseConnection]);

  // Surveillance automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(async () => {
      const backendHealth = await checkBackendHealth();
      const tokenValidity = await checkTokenValidity();
      
      setHealthStatus(prev => ({
        ...prev,
        backend: backendHealth.status,
        auth: tokenValidity.status,
        lastCheck: new Date().toLocaleString()
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, [checkBackendHealth, checkTokenValidity]);

  // Vérification initiale au montage
  useEffect(() => {
    runFullConnectionTest();
  }, [runFullConnectionTest]);

  // Obtenir la couleur du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'valid':
      case 'connected':
      case 'healthy':
        return 'text-green-600';
      case 'error':
      case 'invalid':
      case 'disconnected':
      case 'degraded':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  // Obtenir l'icône du statut
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'valid':
      case 'connected':
      case 'healthy':
        return '✅';
      case 'error':
      case 'invalid':
      case 'disconnected':
      case 'degraded':
        return '❌';
      default:
        return '⚠️';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          🏥 Moniteur Santé Connexion
        </h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${getStatusColor(healthStatus.overall)}`}>
            {getStatusIcon(healthStatus.overall)} {healthStatus.overall?.toUpperCase()}
          </span>
          <button
            onClick={runFullConnectionTest}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md transition"
          >
            {isLoading ? 'Test en cours...' : 'Test Complet'}
          </button>
        </div>
      </div>

      {/* Indicateurs de statut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Backend API</span>
            <span className={`text-lg ${getStatusColor(healthStatus.backend)}`}>
              {getStatusIcon(healthStatus.backend)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {healthStatus.backend === 'success' ? 'Opérationnel' : 'Indisponible'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Base de Données</span>
            <span className={`text-lg ${getStatusColor(healthStatus.database)}`}>
              {getStatusIcon(healthStatus.database)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {healthStatus.database === 'connected' ? 'Connectée' : 'Déconnectée'}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Authentification</span>
            <span className={`text-lg ${getStatusColor(healthStatus.auth)}`}>
              {getStatusIcon(healthStatus.auth)}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {healthStatus.auth === 'valid' ? 'Token valide' : 'Token invalide'}
          </div>
        </div>
      </div>

      {/* Informations utilisateur */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">👤 Informations Connexion</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Utilisateur:</span>
            <span className="font-medium ml-1">{user?.email || 'Non connecté'}</span>
          </div>
          <div>
            <span className="text-gray-600">Statut:</span>
            <span className={`font-medium ml-1 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? 'Authentifié' : 'Non authentifié'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Token:</span>
            <span className="font-mono text-xs ml-1">
              {token ? `${token.substring(0, 20)}...` : 'Aucun'}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Dernière vérif:</span>
            <span className="font-medium ml-1">{healthStatus.lastCheck || 'Jamais'}</span>
          </div>
        </div>
      </div>

      {/* Résultats des tests détaillés */}
      {testResults.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            📋 Résultats des Tests
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {testResults.map((result, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {result.test}
                  </span>
                  <span className={`text-sm ${getStatusColor(result.status)}`}>
                    {getStatusIcon(result.status)} {result.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {result.timestamp}
                </div>
                {result.details && (
                  <div className="mt-2 text-xs bg-white rounded p-2">
                    <pre className="text-gray-700 overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions rapides */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.reload();
          }}
          className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition"
        >
          🔄 Forcer Déconnexion
        </button>
        <button
          onClick={() => window.open('/api/health', '_blank')}
          className="px-3 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-md transition"
        >
          📊 API Health (JSON)
        </button>
      </div>
    </div>
  );
}
