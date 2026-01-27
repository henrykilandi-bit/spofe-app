import React, { useState } from 'react';
import { X, Filter, Download, Calendar, User } from 'lucide-react';

/**
 * Visionneuse du journal d'audit des approbations
 */
const AuditLogViewer = ({
  logs,
  onClose,
  loading
}) => {
  const [filterAction, setFilterAction] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [searchUser, setSearchUser] = useState('');

  // Action types available
  const actionTypes = [
    { value: 'all', label: 'Toutes les actions' },
    { value: 'approve', label: 'Approbations' },
    { value: 'reject', label: 'Rejets' },
    { value: 'request_changes', label: 'Demandes de modification' },
    { value: 'view', label: 'Consultation' },
    { value: 'export', label: 'Exports' }
  ];

  // Filter logs
  const filteredLogs = (logs || []).filter(log => {
    // Filter by action
    if (filterAction !== 'all' && log.action !== filterAction) {
      return false;
    }

    // Filter by date range
    const logDate = new Date(log.createdAt);
    if (filterStartDate) {
      const startDate = new Date(filterStartDate);
      if (logDate < startDate) return false;
    }
    if (filterEndDate) {
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      if (logDate > endDate) return false;
    }

    // Filter by user search
    if (searchUser) {
      const searchLower = searchUser.toLowerCase();
      const userMatch = (log.userName || '').toLowerCase().includes(searchLower) ||
                       (log.affectedUserName || '').toLowerCase().includes(searchLower);
      if (!userMatch) return false;
    }

    return true;
  });

  // Get action label and color
  const getActionInfo = (action) => {
    switch(action) {
      case 'approve':
        return { label: 'Approuvé', color: 'success', icon: '✓' };
      case 'reject':
        return { label: 'Rejeté', color: 'danger', icon: '✗' };
      case 'request_changes':
        return { label: 'Modifications demandées', color: 'warning', icon: '⚠' };
      case 'view':
        return { label: 'Consulté', color: 'info', icon: '👁' };
      case 'export':
        return { label: 'Rapport exporté', color: 'secondary', icon: '📥' };
      default:
        return { label: action, color: 'default', icon: '•' };
    }
  };

  const handleDownloadAudit = () => {
    const csvContent = [
      ['Date', 'Heure', 'Action', 'Utilisateur', 'Utilisateur affecté', 'Détails'],
      ...filteredLogs.map(log => [
        new Date(log.createdAt).toLocaleDateString('fr-FR'),
        new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        getActionInfo(log.action).label,
        log.userName || 'Système',
        log.affectedUserName || '-',
        log.details || log.notes || '-'
      ])
    ];

    const csv = csvContent.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content audit-log-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <h2>Journal d'audit complet</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Filters */}
        <div className="audit-filters">
          <div className="filter-section">
            <h3>
              <Filter size={18} />
              Filtres
            </h3>

            <div className="filters-grid">
              {/* Action filter */}
              <div className="filter-item">
                <label>Type d'action</label>
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="select-input"
                >
                  {actionTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date range filters */}
              <div className="filter-item">
                <label>Du</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="input-date"
                />
              </div>

              <div className="filter-item">
                <label>Au</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="input-date"
                />
              </div>

              {/* User search filter */}
              <div className="filter-item">
                <label>Chercher un utilisateur</label>
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Nom ou utilisateur..."
                  className="input-text"
                />
              </div>
            </div>

            <div className="filter-actions">
              <button
                onClick={handleDownloadAudit}
                className="btn-download"
              >
                <Download size={16} />
                Télécharger en CSV
              </button>
              <span className="result-count">
                {filteredLogs.length} entrée(s)
              </span>
            </div>
          </div>
        </div>

        {/* Logs Content */}
        <div className="audit-logs-container">
          {loading ? (
            <div className="loading-logs">
              <div className="spinner"></div>
              <p>Chargement du journal...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-logs">
              <Filter size={32} />
              <p>Aucune entrée ne correspond aux filtres sélectionnés.</p>
            </div>
          ) : (
            <div className="logs-timeline">
              {filteredLogs.map((log, idx) => {
                const actionInfo = getActionInfo(log.action);
                return (
                  <div key={idx} className={`log-entry log-${actionInfo.color}`}>
                    <div className="log-marker">
                      <div className="marker-dot"></div>
                    </div>

                    <div className="log-content">
                      {/* Main info line */}
                      <div className="log-main">
                        <span className={`action-badge badge-${actionInfo.color}`}>
                          {actionInfo.icon} {actionInfo.label}
                        </span>
                        
                        <span className="log-actor">
                          <User size={14} />
                          {log.userName || 'Système'}
                        </span>

                        <span className="log-timestamp">
                          <Calendar size={14} />
                          {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                          {' '}
                          {new Date(log.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Affected user */}
                      {log.affectedUserName && (
                        <div className="log-affected">
                          Utilisateur affecté: <strong>{log.affectedUserName}</strong>
                        </div>
                      )}

                      {/* Details/Notes */}
                      {(log.details || log.notes) && (
                        <div className="log-details">
                          {log.details || log.notes}
                        </div>
                      )}

                      {/* Metadata */}
                      {(log.ipAddress || log.userAgent) && (
                        <div className="log-metadata">
                          {log.ipAddress && (
                            <span className="metadata-item">IP: {log.ipAddress}</span>
                          )}
                          {log.userAgent && (
                            <span className="metadata-item">
                              Navigateur: {log.userAgent.substring(0, 50)}...
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Footer */}
        {filteredLogs.length > 0 && (
          <div className="audit-stats">
            <div className="stat-item">
              <span className="stat-label">Approbations:</span>
              <span className="stat-value">
                {filteredLogs.filter(l => l.action === 'approve').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rejets:</span>
              <span className="stat-value">
                {filteredLogs.filter(l => l.action === 'reject').length}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Modifications:</span>
              <span className="stat-value">
                {filteredLogs.filter(l => l.action === 'request_changes').length}
              </span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuditLogViewer;
