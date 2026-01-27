/**
 * useAuth.js - Hook personnalisé pour l'authentification
 * Fournit une interface simplifiée pour interagir avec le contexte d'authentification
 */

import { useAuthContext } from '../context/AuthContext';

/**
 * Hook useAuth - Wrapper simplifié autour du contexte d'authentification
 * @returns {object} Objet d'authentification avec login, logout, user, token, etc.
 */
export const useAuth = () => {
  const context = useAuthContext();

  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }

  // Wrapper pour la fonction login avec support 2FA
  const login = async (email, password) => {
    try {
      // Appeler la fonction login du contexte
      const result = await context.login?.(email, password);
      
      // Si le contexte n'a pas de fonction login, utiliser setToken/setUserData directement
      if (!context.login) {
        // Simulation de login pour test
        console.log('[useAuth] 🔐 Simulating login for:', email);
        
        // Simuler une réponse API
        const mockResponse = {
          user: {
            id: 1,
            email: email,
            name: 'Utilisateur Test',
            role: 'admin'
          },
          token: 'mock-jwt-token-' + Date.now(),
          requires2FA: false // Pour le test, désactiver 2FA
        };
        
        // Utiliser les fonctions du contexte
        context.setToken(mockResponse.token);
        context.setUserData(mockResponse.user);
        
        return mockResponse;
      }
      
      return result;
    } catch (error) {
      console.error('[useAuth] Login error:', error);
      throw error;
    }
  };

  return {
    // État
    user: context.user,
    token: context.token,
    loading: context.loading,
    isAuthenticated: !!context.token && !!context.user,
    error: context.error,

    // Méthodes
    login: login,
    logout: context.logout,
    verify2FA: context.verify2FA,
    setToken: context.setToken,
    setUserData: context.setUserData,
    updateUser: context.updateUser,
  };
};

export default useAuth;
