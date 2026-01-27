# 🧪 Plan de Tests - Hooks Intégrés dans les Pages
**Date**: 24 Janvier 2026 | **Status**: 📋 **À FAIRE**

---

## 📊 Vue d'ensemble
- **Pages testées**: 7 (3 modifiées + 4 nouvelles)
- **Hooks testés**: 6 (useNotifications, useWebSocketConnection, useWorkflow, useApprovalQueue, useBanking, useBankReconciliation)
- **Composants testés**: 3 (NotificationCenter, WorkflowApprovalUI, BankingIntegrationUI)
- **Tests unitaires à créer**: 20+
- **Tests d'intégration à créer**: 15+
- **Coverage visé**: 80%+

---

## 🧪 Tests Unitaires

### 1. **App.jsx** - Tests
**Fichier**: `frontend/__tests__/integration/App.test.jsx`

```javascript
describe('App Integration', () => {
  test('NotificationCenter est rendu au niveau root', () => {
    // Vérifier que NotificationCenter existe dans le DOM
  });
  
  test('Routes /approvals et /banking sont enregistrées', () => {
    // Vérifier que les routes résolvent correctement
  });
  
  test('PrivateRoute protège les nouvelles routes', () => {
    // Vérifier que sans token, les routes redirigent vers /login
  });
});
```

**Checklist**:
- [ ] Component renders
- [ ] Notification center visible
- [ ] Routes accessible
- [ ] Error boundary works

---

### 2. **LoginPage.jsx** - Tests
**Fichier**: `frontend/__tests__/pages/LoginPage.integration.test.jsx`

```javascript
describe('LoginPage - useNotifications Integration', () => {
  test('Affiche notification de succès au login réussi', async () => {
    // Mock apiClient.post success
    // Vérifier que addNotification est appelé avec type: 'success'
  });
  
  test('Affiche notification d\'erreur au login échoué', async () => {
    // Mock apiClient.post error
    // Vérifier que addNotification est appelé avec type: 'error'
  });
  
  test('Affiche notification 2FA requise', async () => {
    // Mock requiresTwoFA: true
    // Vérifier notification type: 'info'
  });
  
  test('Notifications se ferment correctement', async () => {
    // Vérifier que les notifications disparaissent après la durée
  });
});
```

**Checklist**:
- [ ] Success notification triggered
- [ ] Error notification triggered
- [ ] 2FA info notification shown
- [ ] Notification duration respected
- [ ] Notification auto-close works

---

### 3. **DashboardPage.jsx** - Tests
**Fichier**: `frontend/__tests__/pages/DashboardPage.integration.test.jsx`

```javascript
describe('DashboardPage - Hooks Integration', () => {
  test('useNotifications initialise la notification bienvenue', async () => {
    // Render DashboardPage
    // Vérifier que notification "👋 Bienvenue" existe
  });
  
  test('useWebSocketConnection affiche le statut correct', async () => {
    // Mock WebSocket connected = true
    // Vérifier badge "🔗 WebSocket connecté" visible
    
    // Mock connected = false
    // Vérifier badge "⏳ Connexion WebSocket..." visible
  });
  
  test('Indicateur WebSocket se met à jour en temps réel', async () => {
    // Simuler changement connected
    // Vérifier que l'UI se met à jour
  });
  
  test('Tableau récapitulatif affiche le statut WebSocket', async () => {
    // Vérifier que "WebSocket: Connecté/Déconnecté" dans le tableau
  });
});
```

**Checklist**:
- [ ] Welcome notification shown
- [ ] WebSocket badge correct state
- [ ] Real-time updates work
- [ ] Status display accurate
- [ ] Accessibility OK

---

### 4. **ApprovalList.jsx** - Tests
**Fichier**: `frontend/__tests__/pages/ApprovalList.integration.test.jsx`

```javascript
describe('ApprovalList - Full Integration', () => {
  test('Charge les approbations au montage', async () => {
    // Mock API /workflow/approvals/queue
    // Vérifier loadQueue() est appelé
    // Vérifier notification de succès
  });
  
  test('Affiche ApprovalQueueDashboard avec les données', async () => {
    // Vérifier que le composant reçoit les bonnes props
    // Vérifier le tableau est rendu
  });
  
  test('Bouton Approuver appelle approveItem et notifie', async () => {
    // Cliquer sur Approuver
    // Vérifier approveItem() appelé
    // Vérifier notification succès
    // Vérifier navigation retour
  });
  
  test('Bouton Rejeter appelle rejectItem et notifie', async () => {
    // Cliquer sur Rejeter
    // Vérifier rejectItem() appelé
    // Vérifier notification avertissement
  });
  
  test('Statistiques sont correctes', async () => {
    // Vérifier que En attente, Approuvés, Rejetés affichent les bonnes valeurs
  });
  
  test('Navigation vers détail fonctionne', async () => {
    // Cliquer sur une approbation
    // Vérifier navigation vers /approvals/:id
  });
  
  test('Gère les erreurs API correctement', async () => {
    // Mock API error
    // Vérifier notification erreur
    // Vérifier affichage du message d'erreur
  });
});
```

**Checklist**:
- [ ] Approvals loaded on mount
- [ ] Dashboard component renders
- [ ] Approve action works
- [ ] Reject action works
- [ ] Statistics accurate
- [ ] Detail navigation works
- [ ] Error handling OK
- [ ] Loading state correct

---

### 5. **ApprovalDetail.jsx** - Tests
**Fichier**: `frontend/__tests__/pages/ApprovalDetail.integration.test.jsx`

```javascript
describe('ApprovalDetail - Full Integration', () => {
  test('Charge le workflow au montage avec l\'ID de la route', async () => {
    // Render avec params ID
    // Vérifier loadWorkflow() appelé
  });
  
  test('Affiche la barre de progression correctement', async () => {
    // Mock workflow avec progress
    // Vérifier barre calculée correctement
  });
  
  test('Affiche les étapes du workflow avec statuts', async () => {
    // Vérifier que les étapes sont affichées
    // Vérifier que les badges de statut sont corrects
  });
  
  test('Bouton Approuver nécessite un commentaire', async () => {
    // Cliquer sans commentaire
    // Vérifier notification warning
    // Vérifier que l'action ne procède pas
  });
  
  test('Approbation complète: commentaire -> API -> notification -> navigation', async () => {
    // Entrer un commentaire
    // Cliquer Approuver
    // Vérifier approve() API appelée
    // Vérifier notification succès
    // Vérifier navigation vers /approvals
  });
  
  test('Rejet demande une raison', async () => {
    // Cliquer sans raison
    // Vérifier notification warning
  });
  
  test('Rejet complet: raison -> API -> notification -> navigation', async () => {
    // Entrer une raison
    // Cliquer Rejeter
    // Vérifier reject() appelé
    // Vérifier notification avertissement
    // Vérifier navigation
  });
  
  test('Vérifie les autorisations d\'approbation', async () => {
    // Si canApprove = false
    // Vérifier boutons désactivés
    // Vérifier message d'info
  });
  
  test('Gère manquant workflow', async () => {
    // Pas de données workflow
    // Vérifier message "non trouvé"
    // Vérifier bouton retour
  });
});
```

**Checklist**:
- [ ] Workflow loaded on mount
- [ ] Progress bar correct
- [ ] Steps displayed
- [ ] Comment required for approval
- [ ] Approval flow complete
- [ ] Rejection reason required
- [ ] Rejection flow complete
- [ ] Permissions checked
- [ ] Error handling works

---

### 6. **BankingConnections.jsx** - Tests
**Fichier**: `frontend/__tests__/pages/BankingConnections.integration.test.jsx`

```javascript
describe('BankingConnections - Full Integration', () => {
  test('Charge les connexions existantes au montage', async () => {
    // Mock API /banking/connections
    // Vérifier load() appelé
  });
  
  test('Formulaire de setup progresse par étapes', async () => {
    // Step 1: Sélection banque
    // Cliquer sur ECOBANK
    // Vérifier passage à étape "credentials"
  });
  
  test('Validation des credentials et test connexion', async () => {
    // Remplir form
    // Cliquer "Tester la connexion"
    // Vérifier testConnection() appelé
    // Vérifier passage à "success"
  });
  
  test('Création de connexion avec succès', async () => {
    // Compléter setup
    // Cliquer "Créer la connexion"
    // Vérifier create() appelé
    // Vérifier notification succès
    // Vérifier réinitialisation du form
  });
  
  test('Affiche les connexions existantes correctement', async () => {
    // Avec des connexions
    // Vérifier BankingDashboard rendu
    // Vérifier les données affichées
  });
  
  test('Statistiques affichées correctement', async () => {
    // Vérifier Connexions actives
    // Vérifier Activées
    // Vérifier Synchronisées
  });
  
  test('Gère les erreurs de connexion bancaire', async () => {
    // Mock testConnection() error
    // Vérifier notification erreur
    // Vérifier message d'erreur
  });
});
```

**Checklist**:
- [ ] Connections loaded on mount
- [ ] Setup form steps correct
- [ ] Bank selection works
- [ ] Credentials form renders
- [ ] Connection test works
- [ ] Success step shows
- [ ] Create connection successful
- [ ] Existing connections displayed
- [ ] Statistics accurate
- [ ] Error handling OK

---

### 7. **BankReconciliation.jsx** - Tests
**Fichier**: `frontend/__tests__/pages/BankReconciliation.integration.test.jsx`

```javascript
describe('BankReconciliation - Full Integration', () => {
  test('Charge les relevés bancaires au montage', async () => {
    // Mock API /banking/statements
    // Vérifier loadStatements() appelé
  });
  
  test('Affiche les statistiques correctement', async () => {
    // Vérifier Relevés count
    // Vérifier Appariées count
    // Vérifier Non-appariées count
    // Vérifier Taux d\'appariement %
  });
  
  test('Sélection d\'un relevé lance la réconciliation', async () => {
    // Cliquer sur un relevé
    // Vérifier performReconciliation() appelé
    // Vérifier notification info
  });
  
  test('Filtres de transaction fonctionnent', async () => {
    // Status filter
    // Date range filter
    // Search text filter
    // Vérifier que les transactions sont filtrées
  });
  
  test('Appariement de transaction fonctionne', async () => {
    // Cliquer "Apparier"
    // Vérifier matchTransaction() appelé
    // Vérifier notification succès
    // Vérifier statut mis à jour
  });
  
  test('Dissociation de transaction fonctionne', async () => {
    // Cliquer "Dissocier" (transaction appariée)
    // Vérifier unmatchTransaction() appelé
    // Vérifier notification avertissement
  });
  
  test('Fermeture de réconciliation', async () => {
    // Toutes les transactions appariées
    // Cliquer "Fermer réconciliation"
    // Vérifier closeReconciliation() appelé
    // Vérifier notification succès
    // Vérifier retour état normal
  });
  
  test('Export de rapport fonctionne', async () => {
    // Cliquer "Exporter rapport"
    // Vérifier exportReport() appelé
    // Vérifier notification succès
  });
});
```

**Checklist**:
- [ ] Statements loaded on mount
- [ ] Statistics accurate
- [ ] Statement selection triggers reconciliation
- [ ] Filters work correctly
- [ ] Transaction matching works
- [ ] Transaction unmatching works
- [ ] Reconciliation close works
- [ ] Export report works
- [ ] Notifications correct
- [ ] Data persistence OK

---

## 🔄 Tests d'Intégration Cross-Hooks

### Test Suite: `frontend/__tests__/integration/hooks-pages.integration.test.jsx`

```javascript
describe('Hooks Integration Across Pages', () => {
  test('useNotifications fonctionne sur toutes les pages', () => {
    // Tester que chaque page peut ajouter une notification
    // Vérifier qu\'elle s\'affiche via NotificationCenter
  });
  
  test('Navigation préserve l\'état des notifications', () => {
    // Ajouter notification
    // Naviguer vers autre page
    // Vérifier que la notification persiste
  });
  
  test('WebSocket reconnecte automatiquement après déconnexion', () => {
    // Simuler déconnexion WebSocket
    // Vérifier reconnect logic
    // Vérifier les notifications de reconnexion
  });
  
  test('Les hooks gèrent les timeouts API correctement', () => {
    // Mock API timeout
    // Vérifier que les hooks affichent notification erreur
    // Vérifier que loading state se termine
  });
  
  test('Cleanup effects évitent les memory leaks', () => {
    // Mount et unmount chaque page
    // Vérifier que tous les listeners sont supprimés
    // Vérifier qu\'il n\'y a pas de console warnings
  });
});
```

---

## 📋 Checklist de Tests à Exécuter

### Avant le Merge
- [ ] Tous les tests unitaires passent
- [ ] Tous les tests d'intégration passent
- [ ] Coverage > 80%
- [ ] Pas d'erreurs console
- [ ] Pas de memory leaks
- [ ] Pas de lintings warnings

### Manuel
- [ ] Naviguer entre les pages
- [ ] Vérifier les notifications s'affichent
- [ ] Vérifier WebSocket se connecte
- [ ] Tester les workflows d'approbation
- [ ] Tester les connexions bancaires
- [ ] Tester les filtres et recherches

---

## 🎯 Commandes de Test

```bash
# Tous les tests
npm run test

# Tests spécifiques
npm run test -- App.test.jsx
npm run test -- LoginPage.integration.test.jsx
npm run test -- ApprovalList.integration.test.jsx
npm run test -- BankingConnections.integration.test.jsx

# Avec coverage
npm run test:coverage

# Watch mode
npm run test -- --watch

# Régler les snapshots
npm run test -- -u
```

---

## 📊 Métriques de Succès

| Métrique | Cible | Status |
|----------|-------|--------|
| Tests unitaires | 20+ | ❌ À faire |
| Tests intégration | 15+ | ❌ À faire |
| Coverage | 80%+ | ❌ À faire |
| Erreurs console | 0 | ❌ À vérifier |
| Memory leaks | 0 | ❌ À vérifier |
| Lint warnings | 0 | ❌ À vérifier |

---

## 🚀 Timeline

| Phase | Durée | Tasks |
|-------|-------|-------|
| Unit Tests | 2-3h | Écrire tests hooks et pages |
| Integration Tests | 2-3h | Tester flux complets |
| Manual Testing | 1-2h | QA and validation |
| Bug Fixes | 1-2h | Corrections |
| Code Review | 1h | Review par senior dev |
| Merge | 30min | Merge vers main |

**Total**: ~10 heures

---

## ✅ Status

- 📋 Plan créé
- ❌ Tests unitaires - À écrire
- ❌ Tests intégration - À écrire
- ❌ Tests manuels - À exécuter
- ❌ Coverage - À mesurer

---

Generated: 24 Janvier 2026 03:20 UTC  
Status: 📋 **READY FOR TESTING**
