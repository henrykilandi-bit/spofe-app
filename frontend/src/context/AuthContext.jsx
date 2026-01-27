import React, { createContext, useState, useEffect, useCallback } from 'react'

export const AuthContext = createContext()

/**
 * Hook pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider')
  }
  return context
}

/**
 * Alias pour useAuth pour compatibilité
 */
export const useAuthContext = useAuth

/**
 * Provider pour gérer l'authentification globale
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Child elements
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(null)
  const [loading, setLoading] = useState(true)

  // Initialiser depuis localStorage au chargement du composant
  useEffect(() => {
    // Vérifier les deux clés possibles (authToken ou token)
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    console.log('[AuthContext] Initializing - storedToken:', !!storedToken, 'storedUser:', !!storedUser)
    
    if (storedToken) {
      setTokenState(storedToken)
      console.log('[AuthContext] ✅ Token restored from localStorage')
    }
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
        console.log('[AuthContext] ✅ User restored from localStorage')
      } catch (err) {
        console.error('[AuthContext] Error parsing stored user:', err)
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  // Fonction pour sauvegarder le token et l'utilisateur
  const setToken = useCallback((tokenValue) => {
    if (tokenValue) {
      // Sauvegarder les deux clés pour compatibilité
      localStorage.setItem('authToken', tokenValue)
      localStorage.setItem('token', tokenValue)
      setTokenState(tokenValue)
      console.log('[AuthContext] ✅ Token saved to localStorage')
    } else {
      localStorage.removeItem('authToken')
      localStorage.removeItem('token')
      setTokenState(null)
      console.log('[AuthContext] ✅ Token cleared from localStorage')
    }
  }, [])

  // Fonction pour sauvegarder l'utilisateur
  const setUserData = useCallback((userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData))
      setUser(userData)
    } else {
      localStorage.removeItem('user')
      setUser(null)
    }
  }, [])

  // Fonction de login
  const login = useCallback((userData, tokenValue) => {
    console.log('[AuthContext] Login:', { user: userData?.email, hasToken: !!tokenValue })
    setToken(tokenValue)
    setUserData(userData)
  }, [setToken, setUserData])

  // Fonction de logout
  const logout = useCallback(() => {
    console.log('[AuthContext] 🚪 Logout')
    setTokenState(null)
    setUser(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }, [])

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    setToken,
    setUserData,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
