/**
 * NotificationCenter - Composant d'affichage des notifications WebSocket
 * Affiche les notifications en temps réel avec gestion intelligente
 */

import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

/**
 * Composant NotificationCenter
 * @param {Object} props
 * @param {boolean} [props.position='top-right'] - Position à l'écran
 * @param {number} [props.maxVisible=5] - Nombre max de notifications visibles
 * @returns {JSX.Element}
 */
export const NotificationCenter = ({ position = 'top-right', maxVisible = 5 }) => {
  const {
    notifications,
    unreadCount,
    connected,
    error,
    removeNotification,
    markAsRead,
  } = useNotifications();

  const [showPanel, setShowPanel] = useState(false);

  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!localStorage.getItem('token');

  // Notifications visibles (limitées par maxVisible)
  const visibleNotifications = notifications.slice(0, maxVisible);

  // Mappage des positions CSS
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  const typeClasses = {
    info: 'bg-blue-100 border-blue-400 text-blue-700',
    success: 'bg-green-100 border-green-400 text-green-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    error: 'bg-red-100 border-red-400 text-red-700',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-2 max-w-sm`}>
      {/* Affichage des toasts */}
      {visibleNotifications.map((notif) => (
        <div
          key={notif.id}
          className={`border-l-4 p-4 rounded shadow-lg animate-slideIn ${
            typeClasses[notif.type] || typeClasses.info
          }`}
          role="alert"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold">{notif.title}</h3>
              <p className="text-sm">{notif.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notif.id)}
              className="ml-2 text-gray-400 hover:text-gray-600"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      {/* Badge de notifications non lues */}
      {unreadCount > 0 && (
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="fixed bottom-4 right-4 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold shadow-lg hover:bg-red-600"
        >
          {unreadCount}
        </button>
      )}

      {/* Statut de connexion WebSocket - Affichage uniquement si authentifié */}
      {!connected && isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 p-4 text-sm text-blue-700 rounded shadow-md flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <span className="font-medium">Reconnexion en cours...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 text-sm text-red-700">
          Erreur: {error}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
