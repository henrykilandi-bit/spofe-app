// frontend/src/components/registration/ConsultantForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Award, 
  DollarSign, 
  Calendar, 
  Building, 
  Users, 
  Search,
  Plus,
  X,
  Star
} from 'lucide-react';

/**
 * ConsultantForm - Formulaire pour inscription consultant
 * Supporte consultant indépendant et cabinet/organisme
 */
const ConsultantForm = ({ formData, setFormData, errors, disabled = false, role = 'consultant' }) => {
  const [registrationType, setRegistrationType] = useState('independent');
  const [specialiteInput, setSpecialiteInput] = useState('');
  
  // Options de type selon le rôle
  const getTypeOptions = () => {
    if (role === 'super_consultant') {
      return [
        'coach',
        'mentor', 
        'cabinet',
        'Structure d\'accompagnement',
        'incubateur',
        'accelerateur',
        'autres'
      ];
    } else {
      return [
        'investisseurs',
        'bailleurs',
        'banquier',
        'associé',
        'actionnaire',
        'autres'
      ];
    }
  };
  const [availableSpecialites, setAvailableSpecialites] = useState([
    'Comptabilité générale',
    'Comptabilité analytique',
    'Fiscalité',
    'Audit financier',
    'Audit opérationnel',
    'Conseil en gestion',
    'Expertise comptable',
    'Gestion de paie',
    'Contrôle de gestion',
    'Finance d\'entreprise',
    'Consolidation',
    'Normes IFRS',
    'Normes OHADA',
    'Software comptable',
    'Business Intelligence'
  ]);
  const [filteredSpecialites, setFilteredSpecialites] = useState([]);
  const [showSpecialiteDropdown, setShowSpecialiteDropdown] = useState(false);

  // Types de contrats
  const contractTypes = [
    { id: 'audit', label: 'Audit', description: 'Mission d\'audit légal ou contractuel' },
    { id: 'coaching', label: 'Coaching', description: 'Accompagnement et formation' },
    { id: 'expertise', label: 'Expertise', description: 'Mission d\'expertise comptable' },
    { id: 'accompagnement', label: 'Accompagnement', description: 'Conseil stratégique' },
    { id: 'formation', label: 'Formation', description: 'Sessions de formation' }
  ];

  // Filtrer les spécialités
  useEffect(() => {
    if (specialiteInput.length > 0) {
      const filtered = availableSpecialites.filter(spec => 
        spec.toLowerCase().includes(specialiteInput.toLowerCase())
      );
      setFilteredSpecialites(filtered);
      setShowSpecialiteDropdown(true);
    } else {
      setFilteredSpecialites([]);
      setShowSpecialiteDropdown(false);
    }
  }, [specialiteInput]);

  // Ajouter une spécialité
  const addSpecialite = (specialite) => {
    const currentSpecialites = formData.specialites || [];
    if (!currentSpecialites.includes(specialite)) {
      setFormData(prev => ({
        ...prev,
        specialites: [...currentSpecialites, specialite]
      }));
    }
    setSpecialiteInput('');
    setShowSpecialiteDropdown(false);
  };

  // Supprimer une spécialité
  const removeSpecialite = (specialite) => {
    const currentSpecialites = formData.specialites || [];
    setFormData(prev => ({
      ...prev,
      specialites: currentSpecialites.filter(spec => spec !== specialite)
    }));
  };

  // Gestion du changement de type d'inscription
  const handleRegistrationTypeChange = (type) => {
    setRegistrationType(type);
    // Réinitialiser les champs spécifiques au type
    if (type === 'independent') {
      setFormData(prev => ({
        ...prev,
        firmType: '',
        firmName: '',
        firmSiret: '',
        firmDescription: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        siret: ''
      }));
    }
  };

  // Gestion des changements
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation du tarif horaire
  const validateTarif = (value) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue >= 0 && numValue <= 999999;
  };

  return (
    <div className="role-form consultant-form">
      <div className="role-form-header">
        <div className="role-icon">
          <Briefcase size={32} />
        </div>
        <div className="role-form-title">
          <h3>Inscription Consultant/Expert</h3>
          <p>Rejoignez SPOFE en tant que professionnel indépendant ou cabinet</p>
        </div>
      </div>

      {/* Carte d'information */}
      <div className="info-card">
        <div className="info-icon">
          <Award size={20} />
        </div>
        <div className="info-content">
          <h4>Consultant SPOFE</h4>
          <ul>
            <li>Accès multi-groupes et multi-compagnies</li>
            <li>Missions spécialisées selon vos expertises</li>
            <li>Rapports et analyses personnalisées</li>
            <li>Collaboration avec d'autres experts</li>
          </ul>
          <p className="approval-note">
            <strong>⏳ Validation requise :</strong> Votre inscription sera validée par un Super Utilisateur.
          </p>
        </div>
      </div>

      {/* Type d'inscription */}
      <div className="form-section">
        <h4 className="section-title">
          <Users size={18} />
          Type d'inscription
        </h4>
        
        <div className="registration-type-selector">
          <button
            type="button"
            className={`type-option ${registrationType === 'independent' ? 'active' : ''}`}
            onClick={() => handleRegistrationTypeChange('independent')}
            disabled={disabled}
          >
            <div className="type-icon">
              <Briefcase size={24} />
            </div>
            <div className="type-content">
              <h5>Consultant Indépendant</h5>
              <p>Professionnel libéral exerçant en nom propre</p>
            </div>
          </button>
          
          <button
            type="button"
            className={`type-option ${registrationType === 'firm' ? 'active' : ''}`}
            onClick={() => handleRegistrationTypeChange('firm')}
            disabled={disabled}
          >
            <div className="type-icon">
              <Building size={24} />
            </div>
            <div className="type-content">
              <h5>Cabinet/Organisme</h5>
              <p>Cabinet comptable, société de conseil ou organisme de formation</p>
            </div>
          </button>
        </div>
      </div>

      {/* Formulaire consultant indépendant */}
      {registrationType === 'independent' && (
        <div className="form-section">
          <h4 className="section-title">
            <Briefcase size={18} />
            Informations professionnelles
          </h4>

          {/* Type de consultant */}
          <div className="form-group">
            <label className="form-label required">
              <Star size={16} />
              Type de {role === 'super_consultant' ? 'Super Consultant' : 'Consultant'} *
            </label>
            <select
              value={formData.type_consultant || ''}
              onChange={(e) => setFormData({ ...formData, type_consultant: e.target.value })}
              className="form-select"
              disabled={disabled}
            >
              <option value="">Sélectionnez un type...</option>
              {getTypeOptions().map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
            {errors.type_consultant && (
              <div className="error-message">{errors.type_consultant}</div>
            )}
          </div>

          {/* Champ "autres" si sélectionné */}
          {formData.type_consultant === 'autres' && (
            <div className="form-group">
              <label className="form-label required">
                <Star size={16} />
                Veuillez spécifier *
              </label>
              <input
                type="text"
                value={formData.type_consultant_autres || ''}
                onChange={(e) => setFormData({ ...formData, type_consultant_autres: e.target.value })}
                placeholder="Précisez votre type..."
                className="form-input"
                disabled={disabled}
              />
              {errors.type_consultant_autres && (
                <div className="error-message">{errors.type_consultant_autres}</div>
              )}
            </div>
          )}

          {/* Spécialités */}
          <div className="form-group">
            <label className="form-label required">
              <Star size={16} />
              Spécialités *
            </label>
            <div className="specialites-input-container">
              <div className="input-wrapper">
                <input
                  type="text"
                  value={specialiteInput}
                  onChange={(e) => setSpecialiteInput(e.target.value)}
                  placeholder="Rechercher une spécialité..."
                  className="form-input"
                  onFocus={() => specialiteInput.length > 0 && setShowSpecialiteDropdown(true)}
                />
                <button
                  type="button"
                  className="add-specialite-btn"
                  onClick={() => addSpecialite(specialiteInput)}
                  disabled={!specialiteInput.trim() || (formData.specialites || []).includes(specialiteInput)}
                >
                  <Plus size={16} />
                </button>
              </div>
              
              {/* Dropdown des spécialités */}
              {showSpecialiteDropdown && (
                <div className="specialites-dropdown">
                  {filteredSpecialites.map((specialite, index) => (
                    <div
                      key={index}
                      className="specialite-option"
                      onClick={() => addSpecialite(specialite)}
                    >
                      <Search size={14} />
                      {specialite}
                    </div>
                  ))}
                  {filteredSpecialites.length === 0 && specialiteInput.length > 0 && (
                    <div className="specialite-option custom">
                      <Plus size={14} />
                      Ajouter "{specialiteInput}"
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Tags des spécialités sélectionnées */}
            <div className="specialites-tags">
              {(formData.specialites || []).map((specialite, index) => (
                <div key={index} className="specialite-tag">
                  <span>{specialite}</span>
                  <button
                    type="button"
                    className="remove-tag"
                    onClick={() => removeSpecialite(specialite)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            {errors?.specialites && (
              <div className="error-message">{errors.specialites}</div>
            )}
            <div className="hint">
              Sélectionnez au moins une spécialité (ex: Comptabilité, Fiscalité, Audit...)
            </div>
          </div>

          {/* Tarif horaire */}
          <div className="form-group">
            <label htmlFor="tarifHoraire" className="form-label required">
              <DollarSign size={16} />
              Tarif horaire (FCFA) *
            </label>
            <input
              type="number"
              id="tarifHoraire"
              name="tarifHoraire"
              value={formData.tarifHoraire || ''}
              onChange={handleInputChange}
              placeholder="25000"
              disabled={disabled}
              className={`form-input ${errors?.tarifHoraire ? 'error' : ''}`}
              min="0"
              max="999999"
              step="1000"
            />
            {errors?.tarifHoraire && (
              <div className="error-message">{errors.tarifHoraire}</div>
            )}
            <div className="hint">
              Tarif horaire en FCFA (ex: 25000 pour 25 000 FCFA/heure)
            </div>
          </div>

          {/* Années d'expérience */}
          <div className="form-group">
            <label htmlFor="experienceYears" className="form-label required">
              <Calendar size={16} />
              Années d'expérience *
            </label>
            <input
              type="number"
              id="experienceYears"
              name="experienceYears"
              value={formData.experienceYears || ''}
              onChange={handleInputChange}
              placeholder="5"
              disabled={disabled}
              className={`form-input ${errors?.experienceYears ? 'error' : ''}`}
              min="0"
              max="50"
            />
            {errors?.experienceYears && (
              <div className="error-message">{errors.experienceYears}</div>
            )}
            <div className="hint">
              Nombre d'années d'expérience professionnelle
            </div>
          </div>

          {/* SIRET (optionnel) */}
          <div className="form-group">
            <label htmlFor="siret" className="form-label">
              <Briefcase size={16} />
              SIRET (optionnel)
            </label>
            <input
              type="text"
              id="siret"
              name="siret"
              value={formData.siret || ''}
              onChange={handleInputChange}
              placeholder="12345678900012"
              disabled={disabled}
              className={`form-input ${errors?.siret ? 'error' : ''}`}
              maxLength={14}
              pattern="[\d]{14}"
            />
            {errors?.siret && (
              <div className="error-message">{errors.siret}</div>
            )}
            <div className="hint">
              Optionnel - Si vous avez un numéro SIRET d'indépendant
            </div>
          </div>
        </div>
      )}

      {/* Formulaire cabinet/organisme */}
      {registrationType === 'firm' && (
        <div className="form-section">
          <h4 className="section-title">
            <Building size={18} />
            Informations du cabinet/organisme
          </h4>

          {/* Type de cabinet */}
          <div className="form-group">
            <label htmlFor="firmType" className="form-label required">
              <Building size={16} />
              Type de cabinet/organisme *
            </label>
            <select
              id="firmType"
              name="firmType"
              value={formData.firmType || ''}
              onChange={handleInputChange}
              disabled={disabled}
              className={`form-select ${errors?.firmType ? 'error' : ''}`}
            >
              <option value="">Sélectionnez un type...</option>
              <option value="cabinet_comptable">Cabinet comptable</option>
              <option value="cabinet_audit">Cabinet d'audit</option>
              <option value="societe_conseil">Société de conseil</option>
              <option value="organisme_formation">Organisme de formation</option>
              <option value="expertise_judiciaire">Expertise judiciaire</option>
              <option value="autre">Autre</option>
            </select>
            {errors?.firmType && (
              <div className="error-message">{errors.firmType}</div>
            )}
          </div>

          {/* Nom du cabinet */}
          <div className="form-group">
            <label htmlFor="firmName" className="form-label required">
              <Building size={16} />
              Nom du cabinet/organisme *
            </label>
            <input
              type="text"
              id="firmName"
              name="firmName"
              value={formData.firmName || ''}
              onChange={handleInputChange}
              placeholder="Cabinet ABC Expertise"
              disabled={disabled}
              className={`form-input ${errors?.firmName ? 'error' : ''}`}
              maxLength={255}
            />
            {errors?.firmName && (
              <div className="error-message">{errors.firmName}</div>
            )}
          </div>

          {/* SIRET du cabinet */}
          <div className="form-group">
            <label htmlFor="firmSiret" className="form-label required">
              <Briefcase size={16} />
              SIRET du cabinet *
            </label>
            <input
              type="text"
              id="firmSiret"
              name="firmSiret"
              value={formData.firmSiret || ''}
              onChange={handleInputChange}
              placeholder="12345678900012"
              disabled={disabled}
              className={`form-input ${errors?.firmSiret ? 'error' : ''}`}
              maxLength={14}
              pattern="[\d]{14}"
            />
            {errors?.firmSiret && (
              <div className="error-message">{errors.firmSiret}</div>
            )}
            <div className="hint">
              Format : 14 chiffres (ex: 12345678900012)
            </div>
          </div>

          {/* Description du cabinet */}
          <div className="form-group">
            <label htmlFor="firmDescription" className="form-label">
              <Briefcase size={16} />
              Description du cabinet
            </label>
            <textarea
              id="firmDescription"
              name="firmDescription"
              value={formData.firmDescription || ''}
              onChange={handleInputChange}
              placeholder="Description des activités, domaines d'expertise, taille du cabinet..."
              disabled={disabled}
              className={`form-textarea ${errors?.firmDescription ? 'error' : ''}`}
              rows={4}
              maxLength={1000}
            />
            {errors?.firmDescription && (
              <div className="error-message">{errors.firmDescription}</div>
            )}
          </div>
        </div>
      )}

      {/* Types de contrats souhaités */}
      <div className="form-section">
        <h4 className="section-title">
          <Briefcase size={18} />
          Types de missions souhaitées
        </h4>
        
        <div className="contract-types-grid">
          {contractTypes.map((contract) => (
            <label key={contract.id} className="contract-type-option">
              <input
                type="checkbox"
                name="contractTypes"
                value={contract.id}
                checked={(formData.contractTypes || []).includes(contract.id)}
                onChange={(e) => {
                  const currentTypes = formData.contractTypes || [];
                  if (e.target.checked) {
                    setFormData(prev => ({
                      ...prev,
                      contractTypes: [...currentTypes, contract.id]
                    }));
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      contractTypes: currentTypes.filter(type => type !== contract.id)
                    }));
                  }
                }}
                disabled={disabled}
              />
              <div className="contract-type-content">
                <h5>{contract.label}</h5>
                <p>{contract.description}</p>
              </div>
            </label>
          ))}
        </div>
        
        <div className="hint">
          Sélectionnez les types de missions que vous souhaitez réaliser
        </div>
      </div>

      {/* Associations avec groupes (optionnel) */}
      <div className="form-section">
        <h4 className="section-title">
          <Users size={18} />
          Associations avec groupes (optionnel)
        </h4>
        
        <div className="group-association-note">
          <p>
            Vous pouvez demander à rejoindre des groupes maintenant ou plus tard.
            Les Super Utilisateurs des groupes pourront accepter ou refuser votre demande.
          </p>
        </div>
        
        {/* TODO: Ajouter le composant de recherche et demande de groupes */}
        <div className="group-search-placeholder">
          <Search size={16} />
          <p>Recherche de groupes disponible après validation de l'inscription</p>
        </div>
      </div>

      {/* Résumé de l'inscription */}
      <div className="creation-summary">
        <h4 className="summary-title">Résumé de l'inscription</h4>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Type de compte :</span>
            <span className="summary-value">
              {registrationType === 'independent' ? 'Consultant Indépendant' : 'Cabinet/Organisme'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Rôle :</span>
            <span className="summary-value">Consultant</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Validation requise :</span>
            <span className="summary-value approval-required">Oui (par Super Utilisateur)</span>
          </div>
          {(formData.specialites || []).length > 0 && (
            <div className="summary-item">
              <span className="summary-label">Spécialités :</span>
              <span className="summary-value">{formData.specialites.join(', ')}</span>
            </div>
          )}
          {formData.tarifHoraire && (
            <div className="summary-item">
              <span className="summary-label">Tarif horaire :</span>
              <span className="summary-value">{parseInt(formData.tarifHoraire).toLocaleString()} FCFA</span>
            </div>
          )}
          {formData.experienceYears && (
            <div className="summary-item">
              <span className="summary-label">Expérience :</span>
              <span className="summary-value">{formData.experienceYears} an(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Note importante */}
      <div className="important-note">
        <div className="note-icon">⚠️</div>
        <div className="note-content">
          <p>
            <strong>Important :</strong> Après validation de votre inscription, vous pourrez :
          </p>
          <ul>
            <li>Demander à rejoindre des groupes d'entreprises</li>
            <li>Accéder aux compagnies selon les permissions accordées</li>
            <li>Collaborer sur des missions multi-groupes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConsultantForm;
