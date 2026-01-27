// frontend/src/components/registration/RoleSelector.jsx
import React from 'react';
import { 
  User, 
  Users, 
  Briefcase, 
  Award, 
  Building, 
  UserCheck 
} from 'lucide-react';
import './RoleSelector.css';

/**
 * RoleSelector - Sélecteur de rôle hiérarchique pour inscription
 * Affiche les options selon la logique multi-groupes
 */
const RoleSelector = ({ selectedRole, onRoleChange, disabled = false }) => {
  
  // Définition des rôles avec descriptions et icônes
  const roles = [
    {
      id: 'super_utilisateur',
      title: 'Super Utilisateur',
      description: 'Admin Groupe - Crée et gère un groupe d\'entreprises',
      icon: Building,
      color: '#8b5cf6',
      features: [
        'Créer un groupe d\'entreprises',
        'Gérer les utilisateurs du groupe',
        'Approuver les inscriptions',
        'Accès à toutes les compagnies du groupe'
      ],
      requiresApproval: true,
      approverRole: 'admin'
    },
    {
      id: 'utilisateur',
      title: 'Utilisateur',
      description: 'Admin Compagnie - Gère une entreprise spécifique',
      icon: Users,
      color: '#3b82f6',
      features: [
        'Gérer une compagnie',
        'Accès aux écritures comptables',
        'Gérer les permissions de son équipe',
        'Rejoindre un groupe existant'
      ],
      requiresApproval: true,
      approverRole: 'super_utilisateur'
    },
    {
      id: 'super_consultant',
      title: 'Super Consultant',
      description: 'Expert Senior - Multi-groupes et multi-compagnies',
      icon: Award,
      color: '#10b981',
      features: [
        'Accès multi-groupes',
        'Audit et expertise avancée',
        'Gestion de projets complexes',
        'Mentorat consultants'
      ],
      requiresApproval: true,
      approverRole: 'super_utilisateur',
      hasTypeField: true,
      typeOptions: ['coach', 'mentor', 'cabinet', 'Structure d\'accompagnement', 'incubateur', 'accelerateur', 'autres']
    },
    {
      id: 'consultant',
      title: 'Consultant',
      description: 'Expert - Spécialisé dans un domaine',
      icon: Briefcase,
      color: '#f59e0b',
      features: [
        'Spécialités métier',
        'Accès aux compagnies assignées',
        'Rapports et analyses',
        'Collaboration multi-groupes'
      ],
      requiresApproval: true,
      approverRole: 'super_utilisateur',
      hasTypeField: true,
      typeOptions: ['investisseurs', 'bailleurs', 'banquier', 'associé', 'actionnaire', 'autres']
    }
  ];

  const handleRoleSelect = (roleId) => {
    if (!disabled) {
      onRoleChange(roleId);
    }
  };

  return (
    <div className="role-selector">
      <div className="role-selector-header">
        <h3 className="role-selector-title">
          <UserCheck size={24} />
          Sélectionnez votre rôle
        </h3>
        <p className="role-selector-subtitle">
          Choisissez le rôle qui correspond le mieux à votre fonction dans SPOFE
        </p>
      </div>

      <div className="roles-grid">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          
          return (
            <div
              key={role.id}
              className={`role-card ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleRoleSelect(role.id)}
              style={{
                '--role-color': role.color,
                '--role-color-light': `${role.color}20`
              }}
            >
              {/* Header de la carte */}
              <div className="role-card-header">
                <div className="role-icon-container" style={{ backgroundColor: role.color }}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="role-title-section">
                  <h4 className="role-title">{role.title}</h4>
                  <span className="role-id">ID: {role.id}</span>
                </div>
                {isSelected && (
                  <div className="selected-indicator">
                    <span>✓</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="role-description">{role.description}</p>

              {/* Fonctionnalités */}
              <div className="role-features">
                <h5 className="features-title">Fonctionnalités principales :</h5>
                <ul className="features-list">
                  {role.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <span className="feature-bullet">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Information d'approbation */}
              {role.requiresApproval && (
                <div className="approval-info">
                  <div className="approval-badge">
                    <span className="approval-icon">⏳</span>
                    <span className="approval-text">
                      Nécessite l'approbation d'un {role.approverRole.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              )}

              {/* Badge de sélection */}
              {isSelected && (
                <div className="selection-badge">
                  <span>Rôle sélectionné</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Légende des couleurs */}
      <div className="role-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
          <span>Admin Groupe</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
          <span>Admin Compagnie</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
          <span>Expert Senior</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
          <span>Expert Spécialisé</span>
        </div>
      </div>

      {/* Note informative */}
      <div className="role-selector-note">
        <div className="note-icon">ℹ️</div>
        <div className="note-content">
          <p>
            <strong>Important :</strong> Selon votre rôle, vous devrez peut-être être approuvé 
            par un administrateur avant de pouvoir utiliser la plateforme.
          </p>
          <p>
            Les rôles déterminent vos permissions et votre niveau d'accès dans SPOFE.
          </p>
        </div>
      </div>

    </div>
  );
};

export default RoleSelector;
