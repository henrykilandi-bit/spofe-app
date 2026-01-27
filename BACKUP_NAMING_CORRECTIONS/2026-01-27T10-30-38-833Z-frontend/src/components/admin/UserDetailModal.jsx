import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, MessageSquare, History, Send } from 'lucide-react';

/**
 * Modal de détail de l'utilisateur avec validation et approbation
 */
const UserDetailModal = ({
  user,
  auditLog,
  onClose,
  onApprove,
  onReject,
  onRequestChanges,
  loading
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [changesRequired, setChangesRequired] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // profile, validation, audit, actions

  if (!user) return null;

  const verificationChecklist = [
    { id: 1, label: 'Email vérifié', status: user.emailVerified },
    { id: 2, label: 'Téléphone valide', status: user.phoneVerified },
    { id: 3, label: 'Profil complet', status: user.profileComplete },
    { id: 4, label: 'Documents requis', status: user.documentsSubmitted },
    { id: 5, label: 'Accord CGU signé', status: user.termsAccepted },
    { id: 6, label: 'Politique confidentialité', status: user.privacyAccepted }
  ];

  const completionRate = (
    verificationChecklist.filter(item => item.status).length / 
    verificationChecklist.length * 100
  ).toFixed(0);

  const handleApproveClick = () => {
    if (onApprove) {
      onApprove(user.id);
    }
  };

  const handleRejectClick = () => {
    if (!rejectionReason) {
      alert('Veuillez sélectionner une raison de rejet');
      return;
    }
    if (onReject) {
      onReject(user.id, rejectionReason, rejectionNotes);
    }
  };

  const handleRequestChanges = () => {
    if (!changesRequired) {
      alert('Veuillez spécifier les modifications requises');
      return;
    }
    if (onRequestChanges) {
      onRequestChanges(user.id, changesRequired);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-detail-modal" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <h2>Détail de l'inscription</h2>
            <span className="user-badge">
              {user.prenom} {user.nom}
            </span>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>Profil</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'validation' ? 'active' : ''}`}
            onClick={() => setActiveTab('validation')}
          >
            <span>Validation</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'audit' ? 'active' : ''}`}
            onClick={() => setActiveTab('audit')}
          >
            <span>Historique</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'actions' ? 'active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            <span>Actions</span>
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          
          {/* Tab: Profile */}
          {activeTab === 'profile' && (
            <div className="tab-content profile-content">
              <div className="profile-section">
                <h3>Informations personnelles</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Prénom</label>
                    <span>{user.prenom}</span>
                  </div>
                  <div className="info-item">
                    <label>Nom</label>
                    <span>{user.nom}</span>
                  </div>
                  <div className="info-item">
                    <label>Nom d'utilisateur</label>
                    <span className="username">@{user.username}</span>
                  </div>
                  <div className="info-item">
                    <label>Email</label>
                    <span className="email">{user.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Téléphone</label>
                    <span>{user.telephone || 'Non fourni'}</span>
                  </div>
                  <div className="info-item">
                    <label>Date de création</label>
                    <span>{new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Affiliation</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Groupe</label>
                    <span className="badge-group">{user.groupeNom || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Compagnie</label>
                    <span className="badge-company">{user.compagnieNom || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Département</label>
                    <span>{user.departement || 'Non défini'}</span>
                  </div>
                  <div className="info-item">
                    <label>Fonction</label>
                    <span>{user.fonction || 'Non définie'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Validation */}
          {activeTab === 'validation' && (
            <div className="tab-content validation-content">
              <div className="validation-section">
                <div className="completion-header">
                  <h3>Checklist de validation</h3>
                  <div className="completion-rate">
                    <div className="rate-bar">
                      <div 
                        className="rate-fill" 
                        style={{ width: `${completionRate}%` }}
                      ></div>
                    </div>
                    <span>{completionRate}%</span>
                  </div>
                </div>

                <div className="checklist">
                  {verificationChecklist.map(item => (
                    <div key={item.id} className="checklist-item">
                      <div className={`check-icon ${item.status ? 'verified' : 'pending'}`}>
                        {item.status ? (
                          <CheckCircle size={20} />
                        ) : (
                          <AlertCircle size={20} />
                        )}
                      </div>
                      <span className="check-label">{item.label}</span>
                      <span className={`check-status ${item.status ? 'ok' : 'ko'}`}>
                        {item.status ? '✓ Vérifié' : '✗ En attente'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {user.missingDocuments && user.missingDocuments.length > 0 && (
                <div className="missing-docs-section">
                  <h3>Documents manquants</h3>
                  <ul className="missing-docs-list">
                    {user.missingDocuments.map((doc, idx) => (
                      <li key={idx}>
                        <AlertCircle size={16} />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="validation-notes">
                <h3>Remarques de vérification</h3>
                <p>{user.verificationNotes || 'Aucune remarque'}</p>
              </div>
            </div>
          )}

          {/* Tab: Audit */}
          {activeTab === 'audit' && (
            <div className="tab-content audit-content">
              {auditLog && auditLog.length > 0 ? (
                <div className="audit-timeline">
                  {auditLog.map((log, idx) => (
                    <div key={idx} className="audit-entry">
                      <div className="audit-marker"></div>
                      <div className="audit-details">
                        <div className="audit-header">
                          <span className="audit-action">{log.action}</span>
                          <span className="audit-date">
                            {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <div className="audit-actor">
                          Par: <strong>{log.actorName || 'Système'}</strong>
                        </div>
                        {log.notes && (
                          <div className="audit-notes">{log.notes}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-audit">
                  <History size={32} />
                  <p>Aucun historique disponible</p>
                </div>
              )}
            </div>
          )}

          {/* Tab: Actions */}
          {activeTab === 'actions' && (
            <div className="tab-content actions-content">
              
              {/* Approval Section */}
              <div className="action-section approval-section">
                <h3>Approuver l'inscription</h3>
                <p className="section-description">
                  Cette action marquera l'utilisateur comme approuvé et activera son compte.
                </p>
                <button
                  onClick={handleApproveClick}
                  disabled={loading}
                  className="btn-action-large btn-approve-large"
                >
                  <CheckCircle size={18} />
                  {loading ? 'Traitement...' : 'Approuver cet utilisateur'}
                </button>
              </div>

              {/* Request Changes Section */}
              <div className="action-section changes-section">
                <h3>Demander des modifications</h3>
                <p className="section-description">
                  L'utilisateur devra fournir des informations supplémentaires.
                </p>
                <div className="form-group">
                  <label>Modifications requises</label>
                  <textarea
                    value={changesRequired}
                    onChange={(e) => setChangesRequired(e.target.value)}
                    placeholder="Spécifiez les modifications demandées..."
                    rows={3}
                    className="textarea-input"
                  />
                </div>
                <button
                  onClick={handleRequestChanges}
                  disabled={loading}
                  className="btn-action-large btn-changes-large"
                >
                  <MessageSquare size={18} />
                  {loading ? 'Traitement...' : 'Envoyer la demande de modification'}
                </button>
              </div>

              {/* Rejection Section */}
              <div className="action-section rejection-section">
                <h3>Rejeter l'inscription</h3>
                <p className="section-description">
                  Cela notifiera l'utilisateur du rejet. Cette action est permanente.
                </p>
                <div className="form-group">
                  <label>Raison du rejet</label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="select-input"
                  >
                    <option value="">-- Sélectionner une raison --</option>
                    <option value="informations_incompletes">Informations incomplètes</option>
                    <option value="documents_non_verifies">Documents non vérifiés</option>
                    <option value="non_conforme">Non conforme aux exigences</option>
                    <option value="duplication">Compte en doublon</option>
                    <option value="activite_suspecte">Activité suspecte</option>
                    <option value="autre">Autre raison</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Commentaires additionnels (optionnel)</label>
                  <textarea
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Vous pouvez ajouter des détails supplémentaires..."
                    rows={3}
                    className="textarea-input"
                  />
                </div>
                <button
                  onClick={handleRejectClick}
                  disabled={loading}
                  className="btn-action-large btn-reject-large"
                >
                  <X size={18} />
                  {loading ? 'Traitement...' : 'Rejeter cet utilisateur'}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default UserDetailModal;
