/**
 * useNotifications - Hook pour gérer les notifications WebSocket en temps réel
 * Fournit une interface unifiée pour se connecter, écouter et gérer les notifications
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';

/**
 * Interface de notification
 * @typedef {Object} Notification
 * @property {string} id - Identifiant unique
 * @property {string} type - Type: 'info', 'success', 'warning', 'error'
 * @property {string} title - Titre de la notification
 * @property {string} message - Corps du message
 * @property {string} [category] - Catégorie: 'accounting', 'workflow', 'banking', 'system'
 * @property {Object} [data] - Données associées
 * @property {number} timestamp - Timestamp de création
 * @property {boolean} [read] - Si la notification a été lue
 * @property {number} [duration] - Durée d'affichage en ms (null = persistant)
 */

/**
 * Configuration WebSocket
 * @typedef {Object} WebSocketConfig
 * @property {string} url - URL WebSocket (défaut: ws://localhost:3001)
 * @property {number} reconnectInterval - Intervalle de reconnexion en ms
 * @property {number} maxReconnectAttempts - Nombre max de tentatives
 * @property {string[]} rooms - Salles à rejoindre (défaut: ['notifications'])
 * @property {boolean} autoConnect - Auto-connexion au montage
 */

const DEFAULT_WS_CONFIG = {
  url: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  rooms: ['notifications'],
  autoConnect: true,
};

/**
 * Hook useNotifications
 * @param {Partial<WebSocketConfig>} config - Configuration WebSocket
 * @returns {Object} État et fonctions de contrôle des notifications
 */
export const useNotifications = (config = {}) => {
  let token = null;
  try {
    // Essayer d'obtenir le token depuis AuthContext
    const auth = useAuth();
    token = auth?.token || localStorage.getItem('token');
  } catch (err) {
    // Si AuthContext n'est pas disponible, utiliser localStorage
    token = localStorage.getItem('token');
  }
  
  const finalConfig = { ...DEFAULT_WS_CONFIG, ...config };

  // État
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Références
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const notificationTimeoutsRef = useRef(new Map());

  /**
   * Créer une nouvelle notification
   */
  const addNotification = useCallback((notification) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const notif = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };

    setNotifications((prev) => [notif, ...prev]);
    
    // Incrémenter le compteur non-lus
    setUnreadCount((prev) => prev + 1);

    // Auto-suppression si durée spécifiée
    if (notif.duration) {
      const timeout = setTimeout(() => {
        removeNotification(id);
      }, notif.duration);
      notificationTimeoutsRef.current.set(id, timeout);
    }

    return id;
  }, []);

  /**
   * Supprimer une notification
   */
  const removeNotification = useCallback((id) => {
    const timeout = notificationTimeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      notificationTimeoutsRef.current.delete(id);
    }

    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  }, []);

  /**
   * Effacer toutes les notifications
   */
  const clearAll = useCallback(() => {
    notificationTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    notificationTimeoutsRef.current.clear();
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  /**
   * Filtrer les notifications par catégorie
   */
  const getByCategory = useCallback((category) => {
    return notifications.filter((n) => n.category === category);
  }, [notifications]);

  /**
   * Se connecter au WebSocket
   */
  const connect = useCallback(async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Déjà connecté
    }

    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const wsUrl = `${finalConfig.url}?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Rejoindre les salles
        finalConfig.rooms.forEach((room) => {
          ws.send(JSON.stringify({
            type: 'JOIN_ROOM',
            room,
            timestamp: Date.now(),
          }));
        });
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'NOTIFICATION') {
            addNotification({
              type: data.severity || 'info',
              title: data.title || 'Notification',
              message: data.message,
              category: data.category,
              data: data.data,
              duration: data.duration || null,
            });
          }
        } catch (err) {
          console.error('Erreur parsing notification:', err);
        }
      };

      ws.onerror = (event) => {
        const errorMsg = 'Erreur WebSocket';
        setError(errorMsg);
        console.error(errorMsg, event);
      };

      ws.onclose = () => {
        setConnected(false);
        
        // Tentative de reconnexion
        if (reconnectAttemptsRef.current < finalConfig.maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setTimeout(() => {
            connect();
          }, finalConfig.reconnectInterval);
        }
      };

      wsRef.current = ws;
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [token, finalConfig, addNotification]);

  /**
   * Déconnecter du WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  /**
   * Envoyer un message via WebSocket
   */
  const send = useCallback((type, payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        ...payload,
        timestamp: Date.now(),
      }));
    }
  }, []);

  // Auto-connexion au montage
  useEffect(() => {
    // Ne connecter que si on a un token ET autoConnect est activé
    if (finalConfig.autoConnect && token && token.trim()) {
      connect();
    } else {
      // Si pas de token, s'assurer que la connexion est fermée
      disconnect();
      setConnected(false);
      setError(null);
    }

    return () => {
      disconnect();
      notificationTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    };
  }, [token, finalConfig.autoConnect, connect, disconnect]);

  return {
    // État
    notifications,
    unreadCount,
    connected,
    error,
    loading,

    // Fonctions
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    getByCategory,
    connect,
    disconnect,
    send,
  };
};

/**
 * Hook useWebSocketConnection - Connexion brute au WebSocket
 * Utile pour des cas avancés ou des connexions personnalisées
 * @param {string} url - URL WebSocket
 * @param {Object} options - Options
 * @returns {Object} État et fonctions de la connexion WebSocket
 */
export const useWebSocketConnection = (url = DEFAULT_WS_CONFIG.url, options = {}) => {
  const { autoConnect = true, onMessage } = options;
  
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onmessage = (event) => {
        if (onMessage) {
          onMessage(JSON.parse(event.data));
        }
      };

      ws.onerror = (err) => {
        setError('Erreur de connexion WebSocket');
        console.error('WS Error:', err);
      };

      ws.onclose = () => {
        setConnected(false);
      };

      wsRef.current = ws;
    } catch (err) {
      setError(err.message);
    }
  }, [url, onMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return disconnect;
  }, [autoConnect, connect, disconnect]);

  return {
    connected,
    error,
    connect,
    disconnect,
    send,
    ws: wsRef.current,
  };
};

export default useNotifications;
