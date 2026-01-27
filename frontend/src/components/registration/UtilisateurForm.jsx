// frontend/src/components/registration/UtilisateurForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Users, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Globe,
  Briefcase,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

/**
 * UtilisateurForm - Formulaire pour utilisateur (admin compagnie)
 * Permet de rejoindre un groupe existant et créer une compagnie
 */
const UtilisateurForm = ({ formData, setFormData, errors, disabled = false }) => {
  const [availableGroups, setAvailableGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);

  // Charger les groupes disponibles
  useEffect(() => {
    loadAvailableGroups();
  }, []);

  // Charger les groupes depuis l'API
  const loadAvailableGroups = async () => {
    setGroupLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/groupes/available`
      );
      if (response.ok) {
        const groups = await response.json();
        setAvailableGroups(groups);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    } finally {
      setGroupLoading(false);
    }
  };

  // Filtrer les groupes selon la recherche
  const filteredGroups = availableGroups.filter(group =>
    group.nom.toLowerCase().includes(groupSearch.toLowerCase()) ||
    group.description?.toLowerCase().includes(groupSearch.toLowerCase())
  );

  // Sélectionner un groupe
  const selectGroup = (group) => {
    setSelectedGroup(group);
    setFormData(prev => ({
      ...prev,
      groupe_id: group.id,
      groupeName: group.nom
    }));
    setGroupSearch(group.nom);
    setShowGroupDropdown(false);
  };

  // Gestion des changements
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Gestion spécifique pour la recherche de groupe
    if (name === 'groupSearch') {
      setGroupSearch(value);
      setShowGroupDropdown(true);
      if (value === '') {
        setSelectedGroup(null);
        setFormData(prev => ({
          ...prev,
          groupe_id: null,
          groupeName: ''
        }));
      }
    }
  };

  // Validation du SIRET
  const validateSiret = (siret) => {
    if (!siret) return true; // Optionnel
    
    const siretRegex = /^[\d]{14}$/;
    return siretRegex.test(siret.replace(/\s/g, ''));
  };

  // Formater le SIRET
  const formatSiret = (value) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
    }
    return value;
  };

  return (
    <div className="role-form utilisateur-form">
      <div className="role-form-header">
        <div className="role-icon">
          <Users size={32} />
        </div>
        <div className="role-form-title">
          <h3>Inscription Utilisateur</h3>
          <p>Rejoignez un groupe existant et créez votre entreprise</p>
        </div>
      </div>

      {/* Carte d'information */}
      <div className="info-card">
        <div className="info-icon">
          <Building size={20} />
        </div>
        <div className="info-content">
          <h4>Qu'est-ce qu'un Utilisateur ?</h4>
          <ul>
            <li>Administre une entreprise au sein d'un groupe</li>
            <li>Gère les écritures comptables de sa compagnie</li>
            <li>Manage les permissions de son équipe</li>
            <li>Collabore avec d'autres entreprises du groupe</li>
          </ul>
          <p className="approval-note">
            <strong>⏳ Validation requise :</strong> Votre inscription sera validée par le Super Utilisateur du groupe.
          </p>
        </div>
      </div>

      {/* Sélection du groupe */}
      <div className="form-section">
        <h4 className="section-title">
          <Building size={18} />
          Rejoindre un groupe existant
        </h4>

        <div className="form-group">
          <label className="form-label required">
            <Search size={16} />
            Groupe d'entreprises *
          </label>
          <div className="group-search-container">
            <div className="input-wrapper">
              <input
                type="text"
                name="groupSearch"
                value={groupSearch}
                onChange={handleInputChange}
                placeholder="Rechercher un groupe..."
                disabled={disabled || groupLoading}
                className={`form-input ${errors?.groupe_id ? 'error' : ''} ${selectedGroup ? 'success' : ''}`}
                onFocus={() => !groupLoading && setShowGroupDropdown(true)}
              />
              <div className="input-status">
                {groupLoading && <div className="spinner-small"></div>}
                {selectedGroup && <CheckCircle size={16} className="success-icon" />}
              </div>
            </div>

            {/* Dropdown des groupes */}
            {showGroupDropdown && !groupLoading && (
              <div className="groups-dropdown">
                {filteredGroups.length > 0 ? (
                  filteredGroups.map((group) => (
                    <div
                      key={group.id}
                      className="group-option"
                      onClick={() => selectGroup(group)}
                    >
                      <div className="group-info">
                        <h5>{group.nom}</h5>
                        {group.description && (
                          <p>{group.description}</p>
                        )}
                        <div className="group-meta">
                          <span className="group-companies-count">
                            {group.compagnies_count || 0} entreprise(s)
                          </span>
                          {group.created_at && (
                            <span className="group-date">
                              Créé le {new Date(group.created_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-groups">
                    <AlertCircle size={16} />
                    {groupSearch ? 'Aucun groupe trouvé' : 'Aucun groupe disponible'}
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedGroup && (
            <div className="selected-group-info">
              <CheckCircle size={16} className="success-icon" />
              <div>
                <strong>Groupe sélectionné :</strong> {selectedGroup.nom}
                {selectedGroup.description && (
                  <p>{selectedGroup.description}</p>
                )}
              </div>
            </div>
          )}

          {errors?.groupe_id && (
            <div className="error-message">{errors.groupe_id}</div>
          )}
          <div className="hint">
            Sélectionnez le groupe auquel votre entreprise appartient
          </div>
        </div>
      </div>

      {/* Informations de la compagnie */}
      <div className="form-section">
        <h4 className="section-title">
          <Briefcase size={18} />
          Informations de votre entreprise
        </h4>

        {/* Nom de la compagnie */}
        <div className="form-group">
          <label htmlFor="compagnieName" className="form-label required">
            <Building size={16} />
            Nom de l'entreprise *
          </label>
          <input
            type="text"
            id="compagnieName"
            name="compagnieName"
            value={formData.compagnieName || ''}
            onChange={handleInputChange}
            placeholder="Ma Société SARL"
            disabled={disabled}
            className={`form-input ${errors?.compagnieName ? 'error' : ''}`}
            maxLength={255}
          />
          {errors?.compagnieName && (
            <div className="error-message">{errors.compagnieName}</div>
          )}
          <div className="hint">
            Nom officiel de votre entreprise
          </div>
        </div>

        {/* SIRET de la compagnie */}
        <div className="form-group">
          <label htmlFor="compagnieSiret" className="form-label required">
            <Briefcase size={16} />
            SIRET de l'entreprise *
          </label>
          <input
            type="text"
            id="compagnieSiret"
            name="compagnieSiret"
            value={formData.compagnieSiret ? formatSiret(formData.compagnieSiret) : ''}
            onChange={(e) => handleInputChange({
              ...e,
              target: { ...e.target, value: e.target.value.replace(/\s/g, '') }
            })}
            placeholder="12345678900012"
            disabled={disabled}
            className={`form-input ${errors?.compagnieSiret ? 'error' : ''}`}
            maxLength={17} // 14 chiffres + 3 espaces
          />
          {errors?.compagnieSiret && (
            <div className="error-message">{errors.compagnieSiret}</div>
          )}
          <div className="hint">
            Format : 14 chiffres (ex: 12345678900012)
          </div>
        </div>

        {/* Description de la compagnie */}
        <div className="form-group">
          <label htmlFor="compagnieDescription" className="form-label">
            <Briefcase size={16} />
            Description de l'entreprise
          </label>
          <textarea
            id="compagnieDescription"
            name="compagnieDescription"
            value={formData.compagnieDescription || ''}
            onChange={handleInputChange}
            placeholder="Description des activités, secteur d'activité, taille de l'entreprise..."
            disabled={disabled}
            className={`form-textarea ${errors?.compagnieDescription ? 'error' : ''}`}
            rows={3}
            maxLength={1000}
          />
          {errors?.compagnieDescription && (
            <div className="error-message">{errors.compagnieDescription}</div>
          )}
          <div className="hint">
            Optionnel - Aide à identifier votre entreprise dans le groupe
          </div>
        </div>

        {/* Contact de la compagnie */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="compagnieEmail" className="form-label">
              <Mail size={16} />
              Email de l'entreprise
            </label>
            <input
              type="email"
              id="compagnieEmail"
              name="compagnieEmail"
              value={formData.compagnieEmail || ''}
              onChange={handleInputChange}
              placeholder="contact@ma-societe.com"
              disabled={disabled}
              className={`form-input ${errors?.compagnieEmail ? 'error' : ''}`}
            />
            {errors?.compagnieEmail && (
              <div className="error-message">{errors.compagnieEmail}</div>
            )}
            <div className="hint">
              Optionnel - Email professionnel de l'entreprise
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="compagnieTelephone" className="form-label">
              <Phone size={16} />
              Téléphone de l'entreprise
            </label>
            <input
              type="tel"
              id="compagnieTelephone"
              name="compagnieTelephone"
              value={formData.compagnieTelephone || ''}
              onChange={handleInputChange}
              placeholder="+221 33 123 45 67"
              disabled={disabled}
              className={`form-input ${errors?.compagnieTelephone ? 'error' : ''}`}
            />
            {errors?.compagnieTelephone && (
              <div className="error-message">{errors.compagnieTelephone}</div>
            )}
            <div className="hint">
              Optionnel - Format international recommandé
            </div>
          </div>
        </div>

        {/* Adresse de la compagnie */}
        <div className="form-group">
          <label htmlFor="compagnieAdresse" className="form-label">
            <MapPin size={16} />
            Adresse de l'entreprise
          </label>
          <textarea
            id="compagnieAdresse"
            name="compagnieAdresse"
            value={formData.compagnieAdresse || ''}
            onChange={handleInputChange}
            placeholder="123 Rue du Commerce&#10;Dakar, Sénégal"
            disabled={disabled}
            className={`form-textarea ${errors?.compagnieAdresse ? 'error' : ''}`}
            rows={2}
          />
          {errors?.compagnieAdresse && (
            <div className="error-message">{errors.compagnieAdresse}</div>
          )}
          <div className="hint">
            Optionnel - Adresse principale de l'entreprise
          </div>
        </div>

        {/* Site web de la compagnie */}
        <div className="form-group">
          <label htmlFor="compagnieWebsite" className="form-label">
            <Globe size={16} />
            Site web de l'entreprise
          </label>
          <input
            type="url"
            id="compagnieWebsite"
            name="compagnieWebsite"
            value={formData.compagnieWebsite || ''}
            onChange={handleInputChange}
            placeholder="https://www.ma-societe.com"
            disabled={disabled}
            className={`form-input ${errors?.compagnieWebsite ? 'error' : ''}`}
          />
          {errors?.compagnieWebsite && (
            <div className="error-message">{errors.compagnieWebsite}</div>
          )}
          <div className="hint">
            Optionnel - Site web officiel de l'entreprise
          </div>
        </div>
      </div>

      {/* Résumé de l'inscription */}
      <div className="creation-summary">
        <h4 className="summary-title">Résumé de l'inscription</h4>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Type de compte :</span>
            <span className="summary-value">Utilisateur (Admin Compagnie)</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Permissions :</span>
            <span className="summary-value">Gestion complète de votre entreprise</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Validation requise :</span>
            <span className="summary-value approval-required">Oui (par Super Utilisateur)</span>
          </div>
          {selectedGroup && (
            <div className="summary-item">
              <span className="summary-label">Groupe :</span>
              <span className="summary-value">{selectedGroup.nom}</span>
            </div>
          )}
          {formData.compagnieName && (
            <div className="summary-item">
              <span className="summary-label">Entreprise :</span>
              <span className="summary-value">{formData.compagnieName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Note importante */}
      <div className="important-note">
        <div className="note-icon">⚠️</div>
        <div className="note-content">
          <p>
            <strong>Important :</strong> Après validation de votre inscription par le Super Utilisateur du groupe :
          </p>
          <ul>
            <li>Vous pourrez accéder à votre espace entreprise</li>
            <li>Vous gérerez les écritures comptables de votre compagnie</li>
            <li>Vous pourrez inviter des membres dans votre équipe</li>
            <li>Vous collaborerez avec les autres entreprises du groupe</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UtilisateurForm;
