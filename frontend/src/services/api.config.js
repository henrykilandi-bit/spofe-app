/**
 * Configuration centrale de l'API pour tous les services
 * 
 * Gère:
 * - Base URL et timeout
 * - Intercepteurs (auth, loading, errors)
 * - Gestion centralisée des erreurs
 */

import axios from 'axios';

// Configuration de base - Utilise 127.0.0.1 pour éviter les problèmes CORS
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api';
const API_TIMEOUT = 30000; // 30 secondes

// Création de l'instance axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// État de chargement (pour intégration avec zustand)
let loadingCallbacks = [];
export const registerLoadingCallback = (callback) => {
  loadingCallbacks.push(callback);
};

// Intercepteur de requête - Ajoute le token JWT
apiClient.interceptors.request.use(
  (config) => {
    // Notifier le début du chargement
    loadingCallbacks.forEach(cb => cb(true));

    // Ajouter le token si disponible
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Notifier la fin du chargement même en cas d'erreur
    loadingCallbacks.forEach(cb => cb(false));
    return Promise.reject(error);
  }
);

// Intercepteur de réponse - Gestion des erreurs
apiClient.interceptors.response.use(
  (response) => {
    // Notifier la fin du chargement
    loadingCallbacks.forEach(cb => cb(false));
    return response;
  },
  (error) => {
    // Notifier la fin du chargement
    loadingCallbacks.forEach(cb => cb(false));

    // Gestion centralisée des erreurs
    if (error.response) {
      // Erreur HTTP avec réponse du serveur
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Token invalide ou expiré
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Accès refusé:', data.message);
          break;
        case 404:
          console.error('Ressource non trouvée:', data.message);
          break;
        case 422:
          console.error('Erreur de validation:', data.errors);
          break;
        case 500:
          console.error('Erreur serveur:', data.message);
          break;
        default:
          console.error('Erreur API:', data.message || error.message);
      }

      // Retourner une erreur structurée
      return Promise.reject({
        status,
        message: data.message || 'Une erreur est survenue',
        errors: data.errors || null,
        data: data.data || null,
      });
    } else if (error.request) {
      // Requête envoyée mais pas de réponse
      console.error('Pas de réponse du serveur');
      return Promise.reject({
        status: 0,
        message: 'Impossible de contacter le serveur',
        errors: null,
        data: null,
      });
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de configuration:', error.message);
      return Promise.reject({
        status: 0,
        message: error.message,
        errors: null,
        data: null,
      });
    }
  }
);

/**
 * Helper pour construire des query strings
 * @param {Object} params - Paramètres à encoder
 * @returns {string} Query string encodée
 */
export const buildQueryString = (params) => {
  const filtered = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  
  return filtered ? `?${filtered}` : '';
};

/**
 * Helper pour gérer les erreurs de manière uniforme
 * @param {Error} error - Erreur capturée
 * @param {string} context - Contexte de l'erreur
 * @returns {Object} Erreur formatée
 */
export const handleApiError = (error, context = '') => {
  const errorDetails = {
    context,
    status: error.status || 0,
    message: error.message || 'Erreur inconnue',
    errors: error.errors || null,
    timestamp: new Date().toISOString(),
  };

  console.error(`[API Error - ${context}]:`, errorDetails);
  return errorDetails;
};

export default apiClient;
