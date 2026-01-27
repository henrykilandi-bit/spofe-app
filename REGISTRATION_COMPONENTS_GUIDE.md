# Guide des Composants Registration - SPOFE v2.1

**Date**: 24 janvier 2026  
**Version**: 1.0  
**Type**: Architectural Guide  
**Statut**: ✅ Documentation

---

## 📋 Table des Matières

1. [Vue d'ensemble Composants](#vue-densemble-composants)
2. [RoleSelector](#roleselector)
3. [SuperUtilisateurForm](#superutilisateurform)
4. [UtilisateurForm](#utilisateurform)
5. [ConsultantForm](#consultantform)
6. [Shared Styles](#shared-styles)
7. [Architecture & Intégration](#architecture--intégration)
8. [Best Practices](#best-practices)

---

## Vue d'Ensemble Composants

La page RegisterPage-Extended utilise 4 composants enfants pour gérer les formulaires spécifiques à chaque rôle:

```
RegisterPage-Extended.jsx
├── RoleSelector.jsx              (Étape 2: Sélection rôle)
├── SuperUtilisateurForm.jsx      (Étape 3: Formulaire SU)
├── UtilisateurForm.jsx           (Étape 3: Formulaire User)
├── ConsultantForm.jsx            (Étape 3: Formulaire Consultant)
└── RegistrationForms.css         (Styles partagés)
```

**Localisation:**
```
frontend/src/components/registration/
├── RoleSelector.jsx
├── SuperUtilisateurForm.jsx
├── UtilisateurForm.jsx
├── ConsultantForm.jsx
└── RegistrationForms.css
```

---

## RoleSelector

**Fichier**: `frontend/src/components/registration/RoleSelector.jsx`

**Responsabilité**: Présenter les 4 rôles disponibles et permettre à l'utilisateur de sélectionner un

### Props

```javascript
interface RoleSelectorProps {
  selectedRole: string | null;        // Rôle actuellement sélectionné
  onSelect: (role: string) => void;  // Callback quand rôle sélectionné
  errors?: { role?: string };        // Erreur si rôle non sélectionné
  disabled?: boolean;                // Désactiver sélection (optionnel)
}
```

### Rôles Disponibles

```javascript
const ROLES = [
  {
    id: 'super_utilisateur',
    label: '👨‍💼 Super Utilisateur',
    description: 'Gère le groupe et les utilisateurs',
    details: [
      'Créer et gérer utilisateurs du groupe',
      'Configurer permissions et rôles',
      'Accéder aux rapports groupe',
      'Superviser écritures comptables'
    ],
    icon: '👨‍💼',
    color: 'primary'
  },
  {
    id: 'utilisateur',
    label: '📊 Utilisateur',
    description: 'Comptable ou DAF dans une compagnie',
    details: [
      'Saisir écritures comptables',
      'Générer états financiers',
      'Accéder tableau de bord',
      'Valider écritures'
    ],
    icon: '📊',
    color: 'success'
  },
  {
    id: 'consultant',
    label: '🎯 Consultant',
    description: 'Prestataire indépendant ou entreprise',
    details: [
      'Accès audit et consultance',
      'Gestion portefeuille clients',
      'Rapports de mission',
      'Facturation services'
    ],
    icon: '🎯',
    color: 'info'
  }
];
```

### Rendu (Simplifiée)

```jsx
export default function RoleSelector({ selectedRole, onSelect, errors }) {
  return (
    <div className="role-selector-container">
      <div className="role-selector-grid">
        {ROLES.map(role => (
          <button
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => onSelect(role.id)}
            type="button"
          >
            <span className="role-icon">{role.icon}</span>
            <h4 className="role-label">{role.label}</h4>
            <p className="role-description">{role.description}</p>
            
            {/* Détails complets quand sélectionné */}
            {selectedRole === role.id && (
              <ul className="role-details">
                {role.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>
      
      {errors?.role && <span className="error-message">{errors.role}</span>}
    </div>
  );
}
```

### Styling (CSS)

```css
.role-selector-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 1.5rem 0;
}

.role-card {
  background: var(--bg-primary);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.role-card.selected {
  border-color: var(--primary-color);
  background: rgba(79, 70, 229, 0.05);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.role-icon {
  font-size: 2.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.role-label {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0.5rem 0;
}

.role-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0;
}

.role-details {
  display: none;
  list-style: none;
  padding: 1rem 0 0 0;
  margin: 1rem 0 0 0;
  border-top: 1px solid var(--border-color);
  text-align: left;
  font-size: 0.8rem;
}

.role-card.selected .role-details {
  display: block;
}

.role-details li {
  padding: 0.25rem 0;
  color: var(--text-secondary);
}

.role-details li:before {
  content: '✓ ';
  color: var(--success-color);
  font-weight: bold;
  margin-right: 0.5rem;
}
```

---

## SuperUtilisateurForm

**Fichier**: `frontend/src/components/registration/SuperUtilisateurForm.jsx`

**Responsabilité**: Formulaire pour créer un Super Utilisateur + groupe associé

### Props

```javascript
interface SuperUtilisateurFormProps {
  formData: {
    groupeName?: string;
    groupeDescription?: string;
    groupeSiret?: string;
    groupeAdresse?: string;
    groupeEmail?: string;
    groupeTelephone?: string;
    groupeWebsite?: string;
  };
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}
```

### Champs du Formulaire

| Champ | Type | Requis | Validation | Placeholder |
|-------|------|--------|-----------|------------|
| **groupeName** | text | ✅ | 3-100 chars | "Nom du groupe" |
| **groupeDescription** | textarea | ✅ | 10-500 chars | "Décrire le groupe" |
| **groupeSiret** | text | ✅ | Format SIRET (14 chiffres) | "12345678901234" |
| **groupeAdresse** | text | ✅ | 10-200 chars | "Siège social" |
| **groupeEmail** | email | ✅ | Format email | "groupe@example.com" |
| **groupeTelephone** | tel | ❌ | Format int'l | "+33..." |
| **groupeWebsite** | url | ❌ | URL valide | "https://..." |

### Rendu

```jsx
export default function SuperUtilisateurForm({ formData, onChange, errors }) {
  return (
    <div className="form-section">
      <h3 className="section-title">Informations du Groupe</h3>
      
      <div className="form-group">
        <label>Nom du groupe *</label>
        <input
          type="text"
          value={formData.groupeName || ''}
          onChange={(e) => onChange('groupeName', e.target.value)}
          className={errors?.groupeName ? 'error' : ''}
        />
        {errors?.groupeName && <span className="error-text">{errors.groupeName}</span>}
      </div>
      
      <div className="form-group">
        <label>Description *</label>
        <textarea
          value={formData.groupeDescription || ''}
          onChange={(e) => onChange('groupeDescription', e.target.value)}
          className={errors?.groupeDescription ? 'error' : ''}
          rows="4"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>SIRET *</label>
          <input
            type="text"
            value={formData.groupeSiret || ''}
            onChange={(e) => onChange('groupeSiret', e.target.value)}
            maxLength="14"
            placeholder="12345678901234"
          />
        </div>
        
        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="tel"
            value={formData.groupeTelephone || ''}
            onChange={(e) => onChange('groupeTelephone', e.target.value)}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Adresse *</label>
        <input
          type="text"
          value={formData.groupeAdresse || ''}
          onChange={(e) => onChange('groupeAdresse', e.target.value)}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.groupeEmail || ''}
            onChange={(e) => onChange('groupeEmail', e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Website</label>
          <input
            type="url"
            value={formData.groupeWebsite || ''}
            onChange={(e) => onChange('groupeWebsite', e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
}
```

---

## UtilisateurForm

**Fichier**: `frontend/src/components/registration/UtilisateurForm.jsx`

**Responsabilité**: Formulaire pour créer un Utilisateur standard (comptable/DAF)

### Props

```javascript
interface UtilisateurFormProps {
  formData: {
    groupeId?: number;           // Groupe sélectionné
    groupeName?: string;         // Ou créer groupe
    compagnieName?: string;      // Compagnie
    compagnieSiret?: string;
    compagnieDescription?: string;
    compagnieEmail?: string;
    compagnieTelephone?: string;
    compagnieAdresse?: string;
    compagnieWebsite?: string;
  };
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
  disponibleGroupes?: Array;  // Liste groupes pour dropdown
  loadingGroupes?: boolean;
}
```

### Champs du Formulaire

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| **groupeId** | select | ✅ | Dropdown groupes existants |
| **groupeName** | text | ❌ | Si création groupe nouveau |
| **compagnieName** | text | ✅ | Nom compagnie |
| **compagnieSiret** | text | ✅ | 14 chiffres |
| **compagnieDescription** | textarea | ✅ | Description métier |
| **compagnieEmail** | email | ✅ | Email contact |
| **compagnieTelephone** | tel | ❌ | Optionnel |
| **compagnieAdresse** | text | ✅ | Adresse siège |
| **compagnieWebsite** | url | ❌ | Optionnel |

### Rendu

```jsx
export default function UtilisateurForm({ 
  formData, onChange, errors, disponibleGroupes, loadingGroupes 
}) {
  const [showNewGroupe, setShowNewGroupe] = React.useState(false);
  
  return (
    <div className="form-section">
      <h3 className="section-title">Informations Utilisateur</h3>
      
      <div className="form-group">
        <label>Groupe d'entreprise *</label>
        <div className="group-selector">
          <select
            value={formData.groupeId || ''}
            onChange={(e) => onChange('groupeId', e.target.value)}
            disabled={loadingGroupes}
          >
            <option value="">Sélectionner un groupe...</option>
            {disponibleGroupes?.map(g => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
          
          <button
            type="button"
            onClick={() => setShowNewGroupe(!showNewGroupe)}
            className="btn-secondary-small"
          >
            {showNewGroupe ? '✕ Annuler' : '+ Nouveau groupe'}
          </button>
        </div>
      </div>
      
      {showNewGroupe && (
        <div className="form-group">
          <label>Nom du groupe (nouveau) *</label>
          <input
            type="text"
            value={formData.groupeName || ''}
            onChange={(e) => onChange('groupeName', e.target.value)}
          />
        </div>
      )}
      
      <hr className="form-divider" />
      
      <h3 className="section-title">Informations Compagnie</h3>
      
      <div className="form-group">
        <label>Nom compagnie *</label>
        <input
          type="text"
          value={formData.compagnieName || ''}
          onChange={(e) => onChange('compagnieName', e.target.value)}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>SIRET *</label>
          <input
            type="text"
            value={formData.compagnieSiret || ''}
            onChange={(e) => onChange('compagnieSiret', e.target.value)}
            maxLength="14"
          />
        </div>
        
        <div className="form-group">
          <label>Téléphone</label>
          <input
            type="tel"
            value={formData.compagnieTelephone || ''}
            onChange={(e) => onChange('compagnieTelephone', e.target.value)}
          />
        </div>
      </div>
      
      {/* Reste des champs... */}
    </div>
  );
}
```

---

## ConsultantForm

**Fichier**: `frontend/src/components/registration/ConsultantForm.jsx`

**Responsabilité**: Formulaire pour créer un Consultant (indépendant ou entreprise)

### Props

```javascript
interface ConsultantFormProps {
  formData: {
    registrationType: 'independent' | 'firm';  // Type consultant
    specialites: string[];         // Multiselect
    tarifHoraire: string;         // Montant
    experienceYears: string;      // Années
    contractTypes: string[];      // Types contrats
    siret?: string;               // Si indépendant
    // Si firm:
    firmName?: string;
    firmSiret?: string;
    firmDescription?: string;
  };
  onChange: (fieldName: string, value: any) => void;
  errors?: Record<string, string>;
}
```

### Rôle Consultant

**Types:**
- 🎯 **Indépendant** - Consultant solo
- 🏢 **Entreprise** - Cabinet/agence

### Champs (Indépendant)

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| **siret** | text | ❌ | SIRET auto-entrepreneur |
| **specialites** | multiselect | ✅ | Audit, Fiscalité, etc. |
| **tarifHoraire** | number | ✅ | EUR/heure |
| **experienceYears** | number | ❌ | 0-80 ans |
| **contractTypes** | multiselect | ✅ | CDI, CDH, Freelance |

### Champs (Entreprise)

| Champ | Type | Requis | Notes |
|-------|------|--------|-------|
| **firmName** | text | ✅ | Nom cabinet |
| **firmSiret** | text | ✅ | SIRET entreprise |
| **firmDescription** | textarea | ✅ | Activités |
| **specialites** | multiselect | ✅ | Domaines expertise |

### Rendu Simplifié

```jsx
export default function ConsultantForm({ formData, onChange, errors }) {
  return (
    <div className="form-section">
      <h3 className="section-title">Type de Consultant</h3>
      
      <div className="consultant-type-selector">
        <button
          type="button"
          className={formData.registrationType === 'independent' ? 'active' : ''}
          onClick={() => onChange('registrationType', 'independent')}
        >
          🎯 Indépendant
        </button>
        <button
          type="button"
          className={formData.registrationType === 'firm' ? 'active' : ''}
          onClick={() => onChange('registrationType', 'firm')}
        >
          🏢 Entreprise
        </button>
      </div>
      
      {formData.registrationType === 'independent' && (
        <IndependentFields formData={formData} onChange={onChange} errors={errors} />
      )}
      
      {formData.registrationType === 'firm' && (
        <FirmFields formData={formData} onChange={onChange} errors={errors} />
      )}
      
      {/* Champs communs */}
      <div className="form-group">
        <label>Spécialités *</label>
        <MultiSelect
          value={formData.specialites}
          onChange={(vals) => onChange('specialites', vals)}
          options={[
            { value: 'audit', label: 'Audit' },
            { value: 'fiscalite', label: 'Fiscalité' },
            { value: 'social', label: 'Droit Social' },
            // ...
          ]}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Tarif horaire (EUR) *</label>
          <input
            type="number"
            value={formData.tarifHoraire || ''}
            onChange={(e) => onChange('tarifHoraire', e.target.value)}
            min="0"
            step="10"
          />
        </div>
        
        <div className="form-group">
          <label>Expérience (années)</label>
          <input
            type="number"
            value={formData.experienceYears || ''}
            onChange={(e) => onChange('experienceYears', e.target.value)}
            min="0"
            max="80"
          />
        </div>
      </div>
      
      <div className="form-group">
        <label>Types de contrats *</label>
        <MultiSelect
          value={formData.contractTypes}
          onChange={(vals) => onChange('contractTypes', vals)}
          options={[
            { value: 'cdi', label: 'CDI' },
            { value: 'cdh', label: 'CDH' },
            { value: 'freelance', label: 'Freelance' },
          ]}
        />
      </div>
    </div>
  );
}
```

---

## Shared Styles

**Fichier**: `frontend/src/components/registration/RegistrationForms.css`

**Contient:** Styles partagés pour tous les formulaires de registration

### Variables CSS

```css
:root {
  --form-label-size: 0.875rem;      /* 14px */
  --form-input-height: 2.5rem;      /* 40px */
  --form-gap: 1rem;                 /* Spacing champs */
  --form-border-width: 1px;
  --form-border-radius: 8px;
}
```

### Classes Principales

```css
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--primary-dark);
  margin: 1rem 0 0.5rem 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: var(--primary-dark);
  font-size: var(--form-label-size);
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: var(--form-border-width) solid var(--border-color);
  border-radius: var(--form-border-radius);
  font-size: var(--form-label-size);
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: var(--error-color);
}

.error-text {
  font-size: 0.75rem;
  color: var(--error-color);
  font-weight: 500;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.form-divider {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1.5rem 0;
}
```

---

## Architecture & Intégration

### Flow de Données

```
RegisterPage-Extended.jsx
    ↓
    ├── formData state (gère tous les champs)
    ├── errors state (gère erreurs)
    ├── currentStep state (1-4)
    └── onChange handler (distribué aux enfants)
        ↓
        ├── RoleSelector
        │   └── Appelle onChange('role', value)
        ├── SuperUtilisateurForm
        │   └── Appelle onChange('groupeName', value)
        ├── UtilisateurForm
        │   └── Appelle onChange('compagnieName', value)
        └── ConsultantForm
            └── Appelle onChange('specialites', value)
```

### Validation Pipeline

1. **Client-side (Joi)** - Validation format
2. **Real-time checks** - Email/username API calls
3. **Server-side** - Validation backend avant création

### Gestion Erreurs

```javascript
// Dans RegisterPage-Extended
const [errors, setErrors] = useState({});

const validateStep = (step) => {
  const stepSchema = schemas[`step${step}`];
  const { error, value } = stepSchema.validate(
    getFieldsForStep(step),
    { abortEarly: false }
  );
  
  if (error) {
    const fieldErrors = {};
    error.details.forEach(detail => {
      fieldErrors[detail.path[0]] = detail.message;
    });
    setErrors(fieldErrors);
    return false;
  }
  
  setErrors({});
  return true;
};
```

---

## Best Practices

### 1. Validation Temps Réel

```javascript
const checkEmailAvailability = async (email) => {
  setEmailChecking(true);
  try {
    const response = await axios.get(
      `/api/auth/check-email/${email}`
    );
    setEmailAvailable(response.data.available);
  } catch (error) {
    setErrors(prev => ({
      ...prev,
      email: 'Erreur vérification email'
    }));
  } finally {
    setEmailChecking(false);
  }
};

// Utiliser debounce
const debouncedCheck = debounce(checkEmailAvailability, 300);
```

### 2. Gestion Multi-Étapes

```javascript
const goToNextStep = async () => {
  if (!validateStep(currentStep)) return;
  setCurrentStep(currentStep + 1);
};

const goToPreviousStep = () => {
  setCurrentStep(currentStep - 1);
};
```

### 3. Accessibilité

```jsx
<label htmlFor="email-input" className="form-label">
  Email *
  <span aria-label="requis">*</span>
</label>
<input
  id="email-input"
  type="email"
  aria-required="true"
  aria-describedby="email-help"
/>
<small id="email-help" className="form-hint">
  Utilisé pour la connexion
</small>
```

### 4. Performance

```javascript
// Utiliser useCallback pour éviter re-renders inutiles
const handleChange = useCallback((field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
}, []);

// Utiliser useMemo pour formules complexes
const passwordStrength = useMemo(() => {
  return calculateStrength(formData.password);
}, [formData.password]);
```

### 5. Responsive Design

```css
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;  /* Stack sur mobile */
  }
  
  .form-label {
    font-size: 0.8rem;           /* Réduit sur small screens */
  }
}
```

---

## Checklist d'Intégration

- [ ] Importer tous les composants dans RegisterPage-Extended
- [ ] Passer props correctement (formData, onChange, errors)
- [ ] Vérifier validation fonctionne étape par étape
- [ ] Tester responsive (3 breakpoints)
- [ ] Tester accessibilité (keyboard nav, screen reader)
- [ ] Tester envoi formulaire (API call)
- [ ] Vérifier error messages affichés
- [ ] Tester nav précédent/suivant
- [ ] Performance: Debounce checks, useCallback, useMemo

---

**Dernière Mise à Jour**: 24 janvier 2026  
**Maintenu par**: Équipe Frontend SPOFE  
**Status**: ✅ Documentation Complète
