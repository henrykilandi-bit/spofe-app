/**
 * Authentication Manager - Point centralisé pour l'auth
 * 
 * Principes:
 * - Un seul endroit pour gérer le token
 * - Frontend ne choisit jamais son rôle
 * - Identité transférée, pas l'autorité
 */

let currentToken = null;
let currentUser = null;

/**
 * Définit le token après authentification
 * 
 * @param {string} token - JWT token
 * @param {Object} user - User info { id, email, roles }
 */
export function setAuthToken(token, user = null) {
  if (!token) {
    throw new Error('Token cannot be empty');
  }

  currentToken = token;
  currentUser = user || { id: null, roles: [] };

  // Sauvegarder le token de façon sécurisée
  // Option 1: sessionStorage (session uniquement)
  // Option 2: Memory + refresh token (recommandé)
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('__spofe_auth_token', token);
  }

  console.log('[SPOFE Auth] Token set for user:', user?.id);
}

/**
 * Récupère le token courant
 * @returns {string} JWT token
 * @throws {Error} Si pas authentifié
 */
export function getAuthToken() {
  if (!currentToken) {
    // Essayer de charger depuis sessionStorage
    if (typeof window !== 'undefined') {
      currentToken = sessionStorage.getItem('__spofe_auth_token');
    }
  }

  if (!currentToken) {
    throw new Error(
      'Not authenticated. Call setAuthToken() after login.'
    );
  }

  return currentToken;
}

/**
 * Récupère les infos utilisateur
 * @returns {Object} { id, email, roles }
 */
export function getCurrentUser() {
  return currentUser || { id: null, roles: [] };
}

/**
 * Vérifie si authentifié
 * @returns {boolean}
 */
export function isAuthenticated() {
  try {
    return !!getAuthToken();
  } catch {
    return false;
  }
}

/**
 * Déconnexion
 */
export function logout() {
  currentToken = null;
  currentUser = null;

  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('__spofe_auth_token');
  }

  console.log('[SPOFE Auth] Logged out');
}

/**
 * Vérifie si l'utilisateur a un rôle
 * ⚠️ POUR L'UI SEULEMENT - Les permissions vraies sont au backend
 * 
 * @param {string} role
 * @returns {boolean}
 */
export function hasRole(role) {
  // ⚠️ Ceci est UNIQUEMENT pour afficher/cacher l'UI
  // Les permissions vraies sont validées par Guardian au backend
  return currentUser?.roles?.includes(role) || false;
}

/**
 * Récupère les headers d'authentification
 * Utilisés UNIQUEMENT par FCE (commandClient + readModelClient)
 * 
 * @returns {Object} Headers avec Authorization
 */
export function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${getAuthToken()}`
  };
}
