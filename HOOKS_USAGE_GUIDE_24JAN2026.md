# 🎣 Guide d'Utilisation - Hooks React Avancés SPOFE v2.1

**Date:** 24 janvier 2026  
**Version:** 1.0  
**Status:** ✅ Implémenté et Documenté

---

## 📚 Vue d'Ensemble

Ce guide fournit des exemples pratiques et détaillés pour utiliser les 6 hooks avancés implémentés dans SPOFE v2.1:

1. **useNotifications** - Notifications WebSocket en temps réel
2. **useWebSocketConnection** - Connexion WebSocket brute
3. **useWorkflowInstance** - Gestion des workflows d'approbation
4. **useApprovalQueue** - Queue d'approbations pour admin
5. **useBankingConnection** - Connexion bancaire
6. **useBankReconciliation** - Rapprochement bancaire

---

## 🔔 **useNotifications - Notifications Temps Réel**

### Installation Rapide

```javascript
import { useNotifications } from '@/hooks';

function MyComponent() {
  const notifications = useNotifications();
  // ... utiliser notifications
}
```

### Exemple Complet

```javascript
import React, { useEffect } from 'react';
import { useNotifications } from '@/hooks';

export function DashboardWithNotifications() {
  const {
    notifications,
    unreadCount,
    connected,
    error,
    addNotification,
    removeNotification,
    markAsRead,
    clearAll,
    getByCategory,
    send,
  } = useNotifications({
    url: 'ws://localhost:3001',
    rooms: ['notifications', 'accounting'],
    autoConnect: true,
  });

  // Simuler une notification (pour test)
  const testNotification = () => {
    addNotification({
      type: 'success',
      title: 'Opération réussie',
      message: 'L\'écriture a été enregistrée',
      category: 'accounting',
      duration: 5000, // Auto-suppression après 5s
    });
  };

  return (
    <div className="dashboard">
      {/* Statut de connexion */}
      <div className={connected ? 'connected' : 'disconnected'}>
        {connected ? '✓ Connecté' : '✕ Déconnecté'}
      </div>

      {/* Badge notifications */}
      {unreadCount > 0 && (
        <span className="badge">{unreadCount}</span>
      )}

      {/* Affichage des notifications */}
      <div className="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id} className={`notification ${notif.type}`}>
            <h4>{notif.title}</h4>
            <p>{notif.message}</p>
            <div className="actions">
              <button onClick={() => markAsRead(notif.id)}>
                Marquer comme lue
              </button>
              <button onClick={() => removeNotification(notif.id)}>
                Fermer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button onClick={testNotification}>Test Notification</button>
      <button onClick={clearAll}>Tout effacer</button>

      {/* Gestion d'erreurs */}
      {error && <div className="alert-error">{error}</div>}
    </div>
  );
}
```

### Configuration Avancée

```javascript
const { send } = useNotifications();

// Envoyer un message via WebSocket
const broadcastMessage = () => {
  send('CUSTOM_MESSAGE', {
    type: 'alert',
    priority: 'high',
    target: 'accounting_team',
  });
};

// Filtrer par catégorie
const accountingNotifications = getByCategory('accounting');
const bankingNotifications = getByCategory('banking');
```

### Composant Pré-construit

```javascript
import { NotificationCenter } from '@/components';

// Dans votre App.jsx
<NotificationCenter position="top-right" maxVisible={5} />
```

---

## 🔄 **useWorkflowInstance - Workflows d'Approbation**

### Installation Rapide

```javascript
import { useWorkflowInstance } from '@/hooks';

function ApprovalPage({ entryId }) {
  const workflow = useWorkflowInstance('journal_entry', entryId);
  // ... utiliser workflow
}
```

### Exemple Complet: Approbation d'Écriture

```javascript
import React from 'react';
import { useWorkflowInstance } from '@/hooks';

export function JournalEntryApproval({ entryId }) {
  const {
    workflow,
    currentStep,
    steps,
    loading,
    error,
    history,
    approve,
    reject,
    cancel,
    getProgress,
    canApprove,
  } = useWorkflowInstance('journal_entry', entryId);

  const [comment, setComment] = React.useState('');
  const [rejectionReason, setRejectionReason] = React.useState('');

  const handleApprove = async () => {
    try {
      await approve(comment);
      alert('Approbation enregistrée');
      setComment('');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  const handleReject = async () => {
    try {
      await reject(rejectionReason);
      alert('Rejet enregistré');
      setRejectionReason('');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!workflow) return <div>Pas de workflow</div>;

  return (
    <div className="approval-container">
      {/* En-tête */}
      <h2>Approbation d'Écriture #{entryId}</h2>
      <p>Statut: <strong>{workflow.status}</strong></p>

      {/* Barre de progression */}
      <div className="progress-bar">
        <div style={{ width: `${getProgress()}%` }} className="progress-fill">
          {getProgress()}%
        </div>
      </div>

      {/* Étapes visibles */}
      <div className="steps">
        {steps.map((step, index) => (
          <div key={step.id} className={`step ${step.status}`}>
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <h4>{step.name}</h4>
              <p className="step-role">Rôle: {step.approverRole}</p>
              {step.approvedAt && (
                <p className="step-approved">
                  ✓ Approuvé par {step.approvedBy}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Étape actuelle - Formulaire d'approbation */}
      {currentStep && canApprove() && (
        <div className="approval-form">
          <h3>Étape Actuelle: {currentStep.name}</h3>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Commentaire d'approbation..."
            rows="3"
          />

          <div className="actions">
            <button
              onClick={handleApprove}
              className="btn-approve"
            >
              ✓ Approuver
            </button>
            <button
              onClick={handleReject}
              className="btn-reject"
            >
              ✕ Rejeter
            </button>
            <button
              onClick={() => cancel('Annulation par utilisateur')}
              className="btn-cancel"
            >
              ◉ Annuler le Workflow
            </button>
          </div>
        </div>
      )}

      {/* Historique */}
      {history.length > 0 && (
        <div className="history">
          <h3>Historique</h3>
          {history.map((event, idx) => (
            <div key={idx} className="history-entry">
              <span className="action">{event.action}</span>
              <span className="timestamp">
                {new Date(event.timestamp).toLocaleString('fr-FR')}
              </span>
              {event.comment && <p>{event.comment}</p>}
            </div>
          ))}
        </div>
      )}

      {error && <div className="alert-error">{error}</div>}
    </div>
  );
}
```

### Composant Pré-construit

```javascript
import { WorkflowApprovalUI } from '@/components';

// Utilisation simple
<WorkflowApprovalUI
  entityType="journal_entry"
  entityId={entryId}
  onApproved={() => console.log('Approuvé!')}
  onRejected={() => console.log('Rejeté!')}
/>
```

---

## 👥 **useApprovalQueue - Dashboard Administrateur**

### Tableau de Bord des Approbations Attendues

```javascript
import React from 'react';
import { useApprovalQueue } from '@/hooks';

export function AdminApprovalDashboard() {
  const {
    queue,
    loading,
    filters,
    updateFilters,
    approveItem,
    rejectItem,
  } = useApprovalQueue();

  return (
    <div className="approval-dashboard">
      <h2>Queue d'Approbations ({queue.length})</h2>

      {/* Filtres */}
      <div className="filters">
        <select
          value={filters.entityType || ''}
          onChange={(e) =>
            updateFilters({ entityType: e.target.value || null })
          }
        >
          <option value="">Tous les types</option>
          <option value="journal_entry">Écritures Journal</option>
          <option value="purchase">Achats</option>
          <option value="expense">Dépenses</option>
        </select>
      </div>

      {/* Tableau */}
      <table className="approval-table">
        <thead>
          <tr>
            <th>Document</th>
            <th>Type</th>
            <th>Montant</th>
            <th>Créé le</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {queue.map(item => (
            <tr key={item.id}>
              <td>{item.entityName}</td>
              <td>{item.entityType}</td>
              <td>{item.amount?.toFixed(2)}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  onClick={() => approveItem(item.id, 'OK')}
                  className="btn-small btn-approve"
                >
                  Approuver
                </button>
                <button
                  onClick={() =>
                    rejectItem(item.id, 'Données incomplètes')
                  }
                  className="btn-small btn-reject"
                >
                  Rejeter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Chargement...</p>}
      {queue.length === 0 && <p>Aucune approbation en attente</p>}
    </div>
  );
}
```

### Composant Pré-construit

```javascript
import { ApprovalQueueDashboard } from '@/components';

<ApprovalQueueDashboard />
```

---

## 🏦 **useBankingConnection - Connexion Bancaire**

### Setup Initial

```javascript
import React from 'react';
import { useBankingConnection, SUPPORTED_BANKS } from '@/hooks';

export function BankingSetup() {
  const { create, testConnection } = useBankingConnection();
  const [bankCode, setBankCode] = React.useState('');
  const [credentials, setCredentials] = React.useState({});

  const handleConnect = async () => {
    try {
      const connection = await create(bankCode, credentials, {});
      await testConnection();
      alert('Connexion réussie!');
    } catch (err) {
      alert('Erreur: ' + err.message);
    }
  };

  return (
    <div>
      <h2>Configurer une Connexion Bancaire</h2>

      {/* Sélection de la banque */}
      <div className="bank-selection">
        {Object.values(SUPPORTED_BANKS).map(bank => (
          <button
            key={bank.code}
            onClick={() => setBankCode(bank.code)}
            className={bankCode === bank.code ? 'selected' : ''}
          >
            {bank.name}
          </button>
        ))}
      </div>

      {/* Formulaire de credentials */}
      {bankCode && (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleConnect();
        }}>
          <input
            type="text"
            placeholder="Identifiant"
            value={credentials.username || ''}
            onChange={(e) =>
              setCredentials({...credentials, username: e.target.value})
            }
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={credentials.password || ''}
            onChange={(e) =>
              setCredentials({...credentials, password: e.target.value})
            }
          />
          <button type="submit">Connecter</button>
        </form>
      )}
    </div>
  );
}
```

### Synchronisation Automatique

```javascript
import React, { useEffect } from 'react';
import { useBankingConnection } from '@/hooks';

export function BankSync({ connectionId }) {
  const {
    connection,
    syncing,
    sync,
    enableAutoSync,
    disableAutoSync,
  } = useBankingConnection(connectionId);

  useEffect(() => {
    // Sync automatique toutes les heures
    enableAutoSync(60);
    return () => disableAutoSync();
  }, []);

  return (
    <div>
      <h3>{connection?.bankName}</h3>
      <p>Solde: {connection?.balance} {connection?.currency}</p>

      <button
        onClick={() => sync({ force: true })}
        disabled={syncing}
      >
        {syncing ? 'Synchronisation...' : 'Synchroniser'}
      </button>
    </div>
  );
}
```

### Composant Pré-construit

```javascript
import { BankConnectionSetup, BankingDashboard } from '@/components';

// Setup initial
<BankConnectionSetup onConnected={(conn) => setConnectionId(conn.id)} />

// Après connexion
<BankingDashboard connectionId={connectionId} />
```

---

## 💰 **useBankReconciliation - Rapprochement Bancaire**

### Exemple Complet

```javascript
import React from 'react';
import { useBankReconciliation } from '@/hooks';

export function BankReconciliation({ connectionId }) {
  const {
    statements,
    matched,
    unmatched,
    discrepancies,
    loading,
    reconciliationStatus,
    performReconciliation,
    matchTransaction,
    closeReconciliation,
    exportReport,
  } = useBankReconciliation(connectionId);

  return (
    <div className="reconciliation">
      <h2>Rapprochement Bancaire</h2>

      {/* Stats */}
      <div className="stats">
        <div>Rapprochés: {matched.length}</div>
        <div>En attente: {unmatched.length}</div>
        {discrepancies.length > 0 && (
          <div className="alert">
            ⚠ Écarts détectés: {discrepancies.length}
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="actions">
        <button onClick={performReconciliation}>
          Effectuer le Rapprochement Auto
        </button>
        <button onClick={() => closeReconciliation(closingBalance)}>
          Clôturer Période
        </button>
        <button onClick={() => exportReport('pdf')}>
          Exporter en PDF
        </button>
      </div>

      {/* Transactions en attente */}
      <div className="unmatched-transactions">
        <h3>Transactions Non Rapprochées</h3>
        {unmatched.map(tx => (
          <div key={tx.id} className="transaction">
            <span>{tx.reference}</span>
            <span>{tx.amount}</span>
            <button
              onClick={() => {
                // Dialog pour sélectionner l'écriture à rapprocher
                const journalEntryId = prompt('ID de l\'écriture:');
                if (journalEntryId) {
                  matchTransaction(tx.id, journalEntryId);
                }
              }}
            >
              Rapprocher
            </button>
          </div>
        ))}
      </div>

      {loading && <p>Chargement...</p>}
    </div>
  );
}
```

---

## 🌐 **useWebSocketConnection - Connexion WebSocket Brute**

### Cas Avancés

```javascript
import React from 'react';
import { useWebSocketConnection } from '@/hooks';

export function CustomWebSocketApp() {
  const { connected, error, send, ws } = useWebSocketConnection(
    'ws://localhost:3001',
    {
      autoConnect: true,
      onMessage: (data) => {
        console.log('Reçu:', data);
      }
    }
  );

  const sendCustomMessage = () => {
    send({
      type: 'CUSTOM_ACTION',
      data: { foo: 'bar' },
      timestamp: Date.now(),
    });
  };

  return (
    <div>
      <p>Status: {connected ? '🟢' : '🔴'}</p>
      {error && <p className="error">{error}</p>}
      <button onClick={sendCustomMessage}>Envoyer Message</button>
    </div>
  );
}
```

---

## 📋 Bonnes Pratiques

### 1. Cleanup Automatique
```javascript
// Les hooks gèrent automatiquement le cleanup
useEffect(() => {
  return () => {
    // Cleanup automatique au unmount
  };
}, []);
```

### 2. Gestion d'Erreurs
```javascript
const { error } = useNotifications();
if (error) {
  // Afficher message d'erreur à l'utilisateur
  showErrorNotification(error);
}
```

### 3. États de Chargement
```javascript
const { loading } = useWorkflowInstance(...);
if (loading) return <LoadingSpinner />;
```

### 4. Optimisation Performance
```javascript
// Utiliser les callbacks mémorisés
const { approve } = useWorkflowInstance(...);
const memoizedApprove = useCallback(approve, [approve]);
```

---

## 🔗 Intégration dans les Pages

### Exemple: Dashboard Complet

```javascript
import React from 'react';
import { useNotifications, useApprovalQueue } from '@/hooks';
import { NotificationCenter, ApprovalQueueDashboard } from '@/components';

export function AdminDashboard() {
  const notifications = useNotifications();
  const approvals = useApprovalQueue();

  return (
    <div>
      <NotificationCenter />

      <h1>Tableau de Bord Administrateur</h1>

      <div className="grid">
        <div>
          <h2>Notifications</h2>
          <p>Non lues: {notifications.unreadCount}</p>
        </div>

        <div>
          <h2>Approbations</h2>
          <p>En attente: {approvals.queue.length}</p>
        </div>
      </div>

      <ApprovalQueueDashboard />
    </div>
  );
}
```

---

## 📚 Ressources

- **Hooks Source**: `frontend/src/hooks/`
- **Composants**: `frontend/src/components/`
- **Documentation Principale**: `DOCUMENTATION_COMPLETE_SPOFE_v2.1.md`
- **Pages à Développer**: `LISTE_COMPLETE_PAGES_FRONTEND.md`

---

**Document généré:** 24 janvier 2026 02:35 UTC  
**Version:** 1.0  
**Status:** ✅ Documentation Complète et Prête à l'Emploi
