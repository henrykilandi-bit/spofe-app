// frontend/src/components/registration/SuperUtilisateurForm.jsx
import React, { useState, useEffect } from 'react';
import { Building, FileText, MapPin, Phone, Mail, Globe, Users } from 'lucide-react';

/**
 * SuperUtilisateurForm - Formulaire pour création groupe d'entreprises
 * Utilisé par les Super Utilisateurs qui veulent créer leur propre groupe
 */
const SuperUtilisateurForm = ({ formData, setFormData, errors, disabled = false }) => {
  const [siretValidating, setSiretValidating] = useState(false);
  const [siretValid, setSiretValid] = useState(null);

  // Validation du format RCCM
  const validateSiret = (rccm) => {
    if (!rccm) return true; // Optionnel
    
    // Vérifier format : lettres, chiffres, tirets et slashs (ex: CD/RCCM/MAT/15-A-2589)
    const rccmRegex = /^[A-Z0-9\/-]+$/i;
    const cleanRccm = rccm.replace(/\s/g, '');
    
    if (!rccmRegex.test(cleanRccm)) {
      return false;
    }
    
    return true;
  };

  // Gestion des changements avec validation SIRET
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Pour RCCM, nettoyer les espaces
    const cleanValue = name === 'groupeSiret' ? value.replace(/\s/g, '') : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: cleanValue
    }));

    // Validation spécifique pour RCCM
    if (name === 'groupeSiret') {
      setSiretValidating(true);
      
      setTimeout(() => {
        const isValid = validateSiret(cleanValue);
        setSiretValid(isValid);
        setSiretValidating(false);
        
        if (cleanValue && !isValid) {
          // Mettre à jour les erreurs
          setFormData(prev => ({
            ...prev,
            errors: {
              ...prev.errors,
              groupeSiret: 'Format RCCM invalide (lettres, chiffres, tirets et slashs)'
            }
          }));
        } else {
          // Nettoyer l'erreur si valide
          setFormData(prev => {
            const newErrors = { ...prev.errors };
            delete newErrors.groupeSiret;
            return { ...prev, errors: newErrors };
          });
        }
      }, 500);
    }
  };

  // Formater le SIRET pendant la saisie
  const formatSiret = (value) => {
    const cleaned = value.replace(/\s/g, '');
    if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{5})/, '$1 $2 $3 $4');
    }
    return value;
  };

  return (
    <div className="role-form super-utilisateur-form">
      <div className="role-form-header">
        <div className="role-icon">
          <Building size={32} />
        </div>
        <div className="role-form-title">
          <h3>Création de Groupe d'Entreprises</h3>
          <p>En tant que Super Utilisateur, vous allez créer et administrer un groupe d'entreprises</p>
        </div>
      </div>

      {/* Carte d'information */}
      <div className="info-card">
        <div className="info-icon">
          <Users size={20} />
        </div>
        <div className="info-content">
          <h4>Qu'est-ce qu'un Super Utilisateur ?</h4>
          <ul>
            <li>Administre un groupe d'entreprises</li>
            <li>Gère les utilisateurs du groupe</li>
            <li>Approuve les inscriptions</li>
            <li>A accès à toutes les compagnies du groupe</li>
          </ul>
          <p className="approval-note">
            <strong>⏳ Validation requise :</strong> Votre inscription sera validée par un administrateur système.
          </p>
        </div>
      </div>

      {/* Formulaire de création de groupe */}
      <div className="form-section">
        <h4 className="section-title">
          <Building size={18} />
          Informations du Groupe
        </h4>

        {/* Nom du groupe */}
        <div className="form-group">
          <label htmlFor="groupeName" className="form-label required">
            <Building size={16} />
            Nom du groupe *
          </label>
          <input
            type="text"
            id="groupeName"
            name="groupeName"
            value={formData.groupeName || ''}
            onChange={handleInputChange}
            placeholder="Ex: Groupe ABC Holding, Société XYZ Group"
            disabled={disabled}
            className={`form-input ${errors?.groupeName ? 'error' : ''}`}
            maxLength={255}
            required
          />
          {errors?.groupeName && (
            <div className="error-message">{errors.groupeName}</div>
          )}
          <div className="hint">
            Nom qui identifiera votre groupe d'entreprises dans SPOFE
          </div>
        </div>

        {/* Description du groupe */}
        <div className="form-group">
          <label htmlFor="groupeDescription" className="form-label">
            <FileText size={16} />
            Description du groupe
          </label>
          <textarea
            id="groupeDescription"
            name="groupeDescription"
            value={formData.groupeDescription || ''}
            onChange={handleInputChange}
            placeholder="Décrivez les activités, le secteur d'activité et la taille de votre groupe..."
            disabled={disabled}
            className={`form-textarea ${errors?.groupeDescription ? 'error' : ''}`}
            rows={4}
            maxLength={1000}
          />
          {errors?.groupeDescription && (
            <div className="error-message">{errors.groupeDescription}</div>
          )}
          <div className="hint">
            Optionnel - Aide les utilisateurs à comprendre le périmètre du groupe
          </div>
        </div>

        {/* Numéro RCCM du groupe */}
        <div className="form-group">
          <label htmlFor="groupeSiret" className="form-label">
            <FileText size={16} />
            Numéro RCCM
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              id="groupeSiret"
              name="groupeSiret"
              value={formData.groupeSiret ? formatSiret(formData.groupeSiret) : ''}
              onChange={handleInputChange}
              placeholder="CD/RCCM/MAT/15-A-2589"
              disabled={disabled}
              className={`form-input ${errors?.groupeSiret ? 'error' : ''} ${siretValid === true ? 'success' : ''}`}
            />
            <div className="input-status">
              {siretValidating && <div className="spinner-small"></div>}
              {siretValid === true && <span className="success-icon">✓</span>}
              {siretValid === false && <span className="error-icon">✗</span>}
            </div>
          </div>
          {errors?.groupeSiret && (
            <div className="error-message">{errors.groupeSiret}</div>
          )}
          <div className="hint">
            Optionnel - Lettres, chiffres, tirets et slashs (ex: CD/RCCM/MAT/15-A-2589)
          </div>
        </div>

        {/* Adresse du groupe */}
        <div className="form-group">
          <label htmlFor="groupeAdresse" className="form-label">
            <MapPin size={16} />
            Adresse du siège social
          </label>
          <textarea
            id="groupeAdresse"
            name="groupeAdresse"
            value={formData.groupeAdresse || ''}
            onChange={handleInputChange}
            placeholder="123 Rue de la République&#10;75001 Paris&#10;France"
            disabled={disabled}
            className={`form-textarea ${errors?.groupeAdresse ? 'error' : ''}`}
            rows={3}
          />
          {errors?.groupeAdresse && (
            <div className="error-message">{errors.groupeAdresse}</div>
          )}
          <div className="hint">
            Optionnel - Adresse principale du groupe
          </div>
        </div>

        {/* Contact du groupe */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="groupeEmail" className="form-label">
              <Mail size={16} />
              Email du groupe
            </label>
            <input
              type="email"
              id="groupeEmail"
              name="groupeEmail"
              value={formData.groupeEmail || ''}
              onChange={handleInputChange}
              placeholder="contact@groupe-abc.com"
              disabled={disabled}
              className={`form-input ${errors?.groupeEmail ? 'error' : ''}`}
            />
            {errors?.groupeEmail && (
              <div className="error-message">{errors.groupeEmail}</div>
            )}
            <div className="hint">
              Optionnel - Email de contact officiel du groupe
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="groupeTelephone" className="form-label">
              <Phone size={16} />
              Téléphone du groupe
            </label>
            <input
              type="tel"
              id="groupeTelephone"
              name="groupeTelephone"
              value={formData.groupeTelephone || ''}
              onChange={handleInputChange}
              placeholder="+33 1 23 45 67 89"
              disabled={disabled}
              className={`form-input ${errors?.groupeTelephone ? 'error' : ''}`}
            />
            {errors?.groupeTelephone && (
              <div className="error-message">{errors.groupeTelephone}</div>
            )}
            <div className="hint">
              Optionnel - Format international recommandé
            </div>
          </div>
        </div>

        {/* Site web */}
        <div className="form-group">
          <label htmlFor="groupeWebsite" className="form-label">
            <Globe size={16} />
            Site web du groupe
          </label>
          <input
            type="url"
            id="groupeWebsite"
            name="groupeWebsite"
            value={formData.groupeWebsite || ''}
            onChange={handleInputChange}
            placeholder="https://www.groupe-abc.com"
            disabled={disabled}
            className={`form-input ${errors?.groupeWebsite ? 'error' : ''}`}
          />
          {errors?.groupeWebsite && (
            <div className="error-message">{errors.groupeWebsite}</div>
          )}
          <div className="hint">
            Optionnel - Site web officiel du groupe
          </div>
        </div>
      </div>

      {/* Résumé de la création */}
      <div className="creation-summary">
        <h4 className="summary-title">Résumé de la création</h4>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Type de compte :</span>
            <span className="summary-value">Super Utilisateur</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Permissions :</span>
            <span className="summary-value">Administration complète du groupe</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Validation requise :</span>
            <span className="summary-value approval-required">Oui (par Admin Système)</span>
          </div>
          {formData.groupeName && (
            <div className="summary-item">
              <span className="summary-label">Nom du groupe :</span>
              <span className="summary-value">{formData.groupeName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Note importante */}
      <div className="important-note">
        <div className="note-icon">⚠️</div>
        <div className="note-content">
          <p>
            <strong>Important :</strong> Après validation de votre inscription, vous recevrez un email 
            de confirmation avec les accès à votre espace Super Utilisateur.
          </p>
          <p>
            Vous pourrez ensuite inviter d'autres utilisateurs à rejoindre votre groupe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuperUtilisateurForm;
