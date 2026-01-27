import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, CheckCircle, XCircle, Clock, TrendingUp, 
  Filter, Download, Search, AlertCircle, Bell,
  UserCheck, UserX, RefreshCw, Eye, Edit, Trash2
} from 'lucide-react';
import './admin-dashboard.css';

// Composants
import ApprovalStats from '../../components/admin/ApprovalStats';
import PendingApprovalsTable from '../../components/admin/PendingApprovalsTable';
import UserDetailModal from '../../components/admin/UserDetailModal';
import AuditLogViewer from '../../components/admin/AuditLogViewer';

/**
 * Dashboard de validation des inscriptions pour Super User
 * Phase 2 - Super Utilisateur par Groupe
 */
const UserApprovalDashboard = () => {
  const navigate = useNavigate();
  
  // États principaux
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: '7days',
    search: ''
  });
  
  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    pending24h: 0,
    approvalRate: 0,
    avgResponseTime: '0h 0m'
  });
  
  // État pour les actions en masse
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Vérifier l'authentification
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadDashboardData();
    
    // Polling pour nouvelles inscriptions toutes les 30 secondes
    const interval = setInterval(() => {
      if (!showDetailModal && !showAuditLog) {
        loadDashboardData(false);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [filters, showDetailModal, showAuditLog]);

  // Charger les données du dashboard
  const loadDashboardData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      // Charger les statistiques
      const statsResponse = await axios.get(
        `${apiUrl}/api/admin/stats/approvals`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: filters
        }
      );
      
      if (statsResponse.data) {
        setStats(statsResponse.data);
      }
      
      // Charger les utilisateurs en attente
      const usersResponse = await axios.get(
        `${apiUrl}/api/admin/users/pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            limit: 50,
            ...filters
          }
        }
      );
      
      setUsers(usersResponse.data.users || []);
      setPendingUsers((usersResponse.data.users || []).filter(u => u.status === 'PENDING_APPROVAL'));
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  // Afficher les détails d'un utilisateur
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };
  
  // Approuver un utilisateur
  const approveUser = async (user_id, bulk = false) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      const note = bulk ? "Approbation en masse" : "";
      
      const response = await axios.post(
        `${apiUrl}/api/admin/users/${user_id}/approve`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Utilisateur approuvé avec succès !');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Mettre à jour la liste
        setUsers(prev => prev.filter(u => u.id !== user_id));
        setPendingUsers(prev => prev.filter(u => u.id !== user_id));
        setSelectedIds(prev => prev.filter(id => id !== user_id));
        
        if (!bulk) {
          setShowDetailModal(false);
        }
        
        // Recharger les statistiques
        loadDashboardData(false);
      }
    } catch (error) {
      console.error('Erreur approbation:', error);
      alert(error.response?.data?.message || 'Erreur lors de l\'approbation');
    }
  };
  
  // Rejeter un utilisateur
  const rejectUser = async (user_id, reason, note = '') => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await axios.post(
        `${apiUrl}/api/admin/users/${user_id}/reject`,
        { reason, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Utilisateur rejeté avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Mettre à jour la liste
        setUsers(prev => prev.filter(u => u.id !== user_id));
        setPendingUsers(prev => prev.filter(u => u.id !== user_id));
        setSelectedIds(prev => prev.filter(id => id !== user_id));
        
        setShowDetailModal(false);
        loadDashboardData(false);
      }
    } catch (error) {
      console.error('Erreur rejet:', error);
      alert(error.response?.data?.message || 'Erreur lors du rejet');
    }
  };
  
  // Demander des modifications
  const requestChanges = async (user_id, requirements) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await axios.post(
        `${apiUrl}/api/admin/users/${user_id}/request-changes`,
        { requirements },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Demande de modifications envoyée');
        setTimeout(() => setSuccessMessage(''), 3000);
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Erreur demande modifications:', error);
      alert('Erreur lors de la demande de modifications');
    }
  };
  
  // Actions en masse
  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.length === 0) {
      alert('Sélectionnez une action et des utilisateurs');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      if (bulkAction === 'approve') {
        const response = await axios.post(
          `${apiUrl}/api/admin/users/bulk-approve`,
          { userIds: selectedIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          setSuccessMessage(`${selectedIds.length} utilisateurs approuvés`);
          setTimeout(() => setSuccessMessage(''), 3000);
          
          // Mettre à jour les listes
          setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
          setPendingUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
          setSelectedIds([]);
          setBulkAction('');
          
          loadDashboardData(false);
        }
      }
    } catch (error) {
      console.error('Erreur action en masse:', error);
      alert('Erreur lors de l\'action en masse');
    }
  };
  
  // Télécharger le rapport
  const downloadReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      const response = await axios.get(
        `${apiUrl}/api/admin/reports/approvals`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
          responseType: 'blob',
          params: filters
        }
      );
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-approbations-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSuccessMessage('Rapport téléchargé avec succès');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur téléchargement rapport:', error);
      alert('Erreur lors du téléchargement du rapport');
    }
  };
  
  // Filtrer les utilisateurs
  const filteredUsers = users.filter(user => {
    if (filters.status !== 'all' && user.status !== filters.status) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.email.toLowerCase().includes(searchLower) ||
        (user.prenom && user.prenom.toLowerCase().includes(searchLower)) ||
        (user.nom && user.nom.toLowerCase().includes(searchLower)) ||
        (user.username && user.username.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });
  
  return (
    <div className="super-user-dashboard">
      {/* Message de succès */}
      {successMessage && (
        <div className="success-message">
          <span>{successMessage}</span>
        </div>
      )}

      {/* En-tête */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">
            <Users size={32} />
            <span>Validation des Inscriptions</span>
          </h1>
          <p className="dashboard-subtitle">
            Gestion des nouvelles inscriptions et approbations
          </p>
        </div>
        
        <div className="header-right">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAuditLog(true)}
          >
            <Eye size={16} />
            <span>Journal d'audit</span>
          </button>
          
          <button 
            className="btn btn-primary"
            onClick={downloadReport}
            disabled={loading}
          >
            <Download size={16} />
            <span>Exporter rapport</span>
          </button>
          
          <button 
            className="btn btn-icon"
            onClick={() => loadDashboardData()}
            disabled={loading}
            title="Rafraîchir"
          >
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>
      
      {/* Panneau de statistiques */}
      <ApprovalStats 
        stats={stats}
        loading={loading}
      />
      
      {/* Barre de filtres et recherche */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, email..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING_APPROVAL">En attente</option>
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Rejetés</option>
            <option value="CHANGES_REQUESTED">Modifications demandées</option>
          </select>
          
          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            className="filter-select"
          >
            <option value="today">Aujourd'hui</option>
            <option value="24h">24 dernières heures</option>
            <option value="7days">7 derniers jours</option>
            <option value="30days">30 derniers jours</option>
            <option value="all">Toutes les dates</option>
          </select>
        </div>
      </div>
      
      {/* Section d'actions en masse */}
      {selectedIds.length > 0 && (
        <div className="bulk-actions-bar">
          <div className="bulk-info">
            <span className="selected-count">
              {selectedIds.length} utilisateur(s) sélectionné(s)
            </span>
          </div>
          
          <div className="bulk-actions">
            <select 
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="bulk-select"
            >
              <option value="">Action en masse</option>
              <option value="approve">✅ Approuver sélection</option>
              <option value="reject">❌ Rejeter sélection</option>
              <option value="export">📄 Exporter sélection</option>
            </select>
            
            <button 
              className="btn btn-primary"
              onClick={handleBulkAction}
              disabled={!bulkAction}
            >
              Appliquer
            </button>
            
            <button 
              className="btn btn-secondary"
              onClick={() => setSelectedIds([])}
            >
              Annuler
            </button>
          </div>
        </div>
      )}
      
      {/* Tableau des approbations */}
      <div className="approvals-section">
        <div className="section-header">
          <h2>
            <Clock size={24} />
            <span>Inscriptions en attente ({pendingUsers.length})</span>
          </h2>
          
          <div className="section-actions">
            {pendingUsers.length > 0 && (
              <span className="warning-badge">
                <AlertCircle size={16} />
                <span>Action requise</span>
              </span>
            )}
          </div>
        </div>
        
        <PendingApprovalsTable
          users={pendingUsers}
          loading={loading}
          onViewDetails={viewUserDetails}
          onApprove={approveUser}
          onReject={rejectUser}
          selectedIds={selectedIds}
          onSelect={(id) => {
            setSelectedIds(prev => 
              prev.includes(id) 
                ? prev.filter(selectedId => selectedId !== id)
                : [...prev, id]
            );
          }}
          onSelectAll={() => {
            if (selectedIds.length === pendingUsers.length) {
              setSelectedIds([]);
            } else {
              setSelectedIds(pendingUsers.map(u => u.id));
            }
          }}
        />
      </div>
      
      {/* Tableau des décisions récentes */}
      <div className="recent-decisions-section">
        <div className="section-header">
          <h2>
            <TrendingUp size={24} />
            <span>Décisions récentes</span>
          </h2>
        </div>
        
        <div className="decisions-grid">
          {filteredUsers
            .filter(u => u.status !== 'PENDING_APPROVAL')
            .slice(0, 10)
            .map(user => (
              <div key={user.id} className="decision-card">
                <div className="decision-header">
                  <div className="user-avatar">
                    {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                  </div>
                  <div className="user-info">
                    <strong>{user.prenom} {user.nom}</strong>
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status === 'APPROVED' ? '✅ Approuvé' : 
                     user.status === 'REJECTED' ? '❌ Rejeté' : '📝 Modifs demandées'}
                  </div>
                </div>
                
                <div className="decision-meta">
                  <span className="meta-item">
                    📅 {new Date(user.updated_at).toLocaleDateString()}
                  </span>
                  <span className="meta-item">
                    ⏱️ {user.processingTime || 'N/A'}
                  </span>
                </div>
                
                {user.rejectionReason && (
                  <div className="rejection-reason">
                    <strong>Motif :</strong> {user.rejectionReason}
                  </div>
                )}
                
                <button 
                  className="btn-view-details"
                  onClick={() => viewUserDetails(user)}
                >
                  <Eye size={14} />
                  <span>Voir détails</span>
                </button>
              </div>
            ))
          }
          
          {filteredUsers.filter(u => u.status !== 'PENDING_APPROVAL').length === 0 && (
            <div className="empty-state">
              <Users size={48} />
              <p>Aucune décision récente</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Modals */}
      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
          onApprove={approveUser}
          onReject={rejectUser}
          onRequestChanges={requestChanges}
        />
      )}
      
      {showAuditLog && (
        <AuditLogViewer
          onClose={() => setShowAuditLog(false)}
          filters={filters}
        />
      )}
    </div>
  );
};

export default UserApprovalDashboard;
