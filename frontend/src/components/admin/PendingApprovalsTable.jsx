import React from 'react';
import { 
  CheckCircle, XCircle, AlertCircle, Eye,
  Mail, Phone, Calendar, Building
} from 'lucide-react';

/**
 * Tableau des approbations en attente
 */
const PendingApprovalsTable = ({
  users,
  loading,
  onViewDetails,
  onApprove,
  onReject,
  selectedIds,
  onSelect,
  onSelectAll
}) => {
  if (loading) {
    return (
      <div className="loading-table">
        <div className="spinner"></div>
        <p>Chargement des inscriptions...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="empty-table">
        <CheckCircle size={48} />
        <h3>Aucune inscription en attente</h3>
        <p>Toutes les inscriptions ont été traitées.</p>
      </div>
    );
  }

  return (
    <div className="approvals-table-container">
      <table className="approvals-table">
        <thead>
          <tr>
            <th style={{ width: '40px' }}>
              <input
                type="checkbox"
                checked={selectedIds.length === users.length && users.length > 0}
                onChange={onSelectAll}
                className="select-checkbox"
              />
            </th>
            <th>Date</th>
            <th>Utilisateur</th>
            <th>Contact</th>
            <th>Groupe / Compagnie</th>
            <th>Statut vérification</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={`user-row ${user.isPriority ? 'priority' : ''}`}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(user.id)}
                  onChange={() => onSelect(user.id)}
                  className="select-checkbox"
                />
              </td>
              
              <td className="date-cell">
                <div className="date-info">
                  <Calendar size={14} />
                  <span>{new Date(user.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="time-info">
                  {new Date(user.created_at).toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </td>
              
              <td className="user-cell">
                <div className="user-avatar">
                  {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                </div>
                <div className="user-details">
                  <strong>{user.prenom} {user.nom}</strong>
                  <span className="username">@{user.username}</span>
                </div>
              </td>
              
              <td className="contact-cell">
                <div className="contact-info">
                  <div className="contact-item">
                    <Mail size={14} />
                    <span>{user.email}</span>
                  </div>
                  {user.telephone && (
                    <div className="contact-item">
                      <Phone size={14} />
                      <span>{user.telephone}</span>
                    </div>
                  )}
                </div>
              </td>
              
              <td className="group-cell">
                <div className="group-info">
                  <div className="group-item">
                    <Building size={14} />
                    <span>{user.groupeNom || 'N/A'}</span>
                  </div>
                  {user.compagnieNom && (
                    <div className="company-tag">
                      {user.compagnieNom}
                    </div>
                  )}
                </div>
              </td>
              
              <td className="verification-cell">
                <div className="verification-status">
                  {user.emailVerified ? (
                    <span className="verified">
                      <CheckCircle size={14} />
                      <span>Email vérifié</span>
                    </span>
                  ) : (
                    <span className="not-verified">
                      <AlertCircle size={14} />
                      <span>Email non vérifié</span>
                    </span>
                  )}
                </div>
                <div className="data-completeness">
                  Complétude: {user.dataCompleteness || '100%'}
                </div>
              </td>
              
              <td className="actions-cell">
                <div className="action-buttons">
                  <button
                    onClick={() => onViewDetails(user)}
                    className="btn-action btn-view"
                    title="Voir détails"
                  >
                    <Eye size={16} />
                  </button>
                  
                  <button
                    onClick={() => onApprove(user.id)}
                    className="btn-action btn-approve"
                    title="Approuver"
                  >
                    <CheckCircle size={16} />
                  </button>
                  
                  <button
                    onClick={() => onReject(user.id, 'À définir')}
                    className="btn-action btn-reject"
                    title="Rejeter"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="table-footer">
        <div className="footer-info">
          <span>{users.length} inscription(s) en attente</span>
          <span className="priority-count">
            <AlertCircle size={14} />
            {users.filter(u => u.isPriority).length} prioritaire(s)
          </span>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalsTable;
