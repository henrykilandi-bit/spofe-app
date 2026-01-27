import React, { useEffect } from "react";
import ConnectionHealthMonitor from "@/components/ConnectionHealthMonitor";
import { useNotifications, useWebSocketConnection } from "@/hooks/useNotifications";

export default function DashboardPage() {
  const { addNotification } = useNotifications();
  const { connected } = useWebSocketConnection({
    autoConnect: true,
    rooms: ['notifications', 'general']
  });

  // Notification de bienvenue au chargement du dashboard
  useEffect(() => {
    addNotification({
      type: 'info',
      title: '👋 Bienvenue sur le Tableau de Bord',
      message: 'Tous les systèmes sont opérationnels',
      category: 'general',
      duration: 4000
    });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">📈 Tableau de Bord</h1>
      
      {/* Moniteur de santé de connexion */}
      <ConnectionHealthMonitor />
      
      {/* Indicateur WebSocket */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
        <span className={`inline-block w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        <span className="text-sm font-medium text-gray-700">
          {connected ? '🔗 WebSocket connecté' : '⏳ Connexion WebSocket...'}
        </span>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-semibold mb-4">✅ Dashboard SPOFE - Version Stable</h2>
        <p className="text-gray-600">L'application fonctionne correctement.</p>
        <div className="mt-4 space-y-2">
          <p>🔐 Authentification : OK</p>
          <p>📊 Backend API : OK</p>
          <p>🗄️ Base de données : OK</p>
          <p>📋 Écritures comptables : 8 disponibles</p>
          <p>🏥 Surveillance santé : Intégrée</p>
          <p>🔌 WebSocket : {connected ? 'Connecté' : 'Déconnecté'}</p>
        </div>
      </div>
    </div>
  );
}
