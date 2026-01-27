# ANALYSE RegisterPage vs Modifications Backend

## 📊 COMPARAISON ACTUELLE vs NÉCESSAIRE

### État Actuel
- ✅ Page structurée en 2 étapes (Compte / Profil)
- ✅ Validation temps réel complète
- ✅ Champs: email, username, password, prenom, nom, telephone, groupeId
- ❌ **Sélecteur de rôle ABSENT**
- ❌ **Champs consultant NON présents**
- ❌ **Messages d'approbation génériques**

---

## 🔴 MISES À JOUR REQUISES PAR RAPPORT AU BACKEND

### CATÉGORIE 1: SÉLECTEUR DE RÔLE (CRITIQUE)

#### **Problème**
Backend accepte maintenant `role` en paramètre de registration, mais la page n'a aucun moyen de le spécifier

#### **Implémentation Requise**
```javascript
// 1. AJOUTER STATE
const [formData, setFormData] = useState({
  ...existing fields,
  role: 'utilisateur'  // ← AJOUTER
});

// 2. AJOUTER CHAMP À ÉTAPE 1
<div className="form-group">
  <label htmlFor="role" className="form-label">
    <UserPlus size={16} />
    <span>Type de compte *</span>
  </label>
  <select
    id="role"
    name="role"
    value={formData.role}
    onChange={handleInputChange}
    className="form-input"
  >
    <option value="">-- Sélectionner un type --</option>
    <option value="utilisateur">Utilisateur Standard</option>
    <option value="consultant">Consultant</option>
    <option value="super_consultant">Super Consultant</option>
  </select>
  <div className="hint">Détermine votre rôle et vos permissions</div>
</div>

// 3. ENVOYER AU BACKEND
const payload = {
  ...existing,
  role: formData.role  // ← INCLURE
};
```

**Location**: Étape 1, après le champ Username

---

### CATÉGORIE 2: CHAMPS CONDITIONNELS PAR RÔLE (IMPORTANT)

#### **Problème**
Backend sauvegarde 4 champs consultant, mais la page ne les capture pas

#### **Implémentation Requise**

**Champs à Ajouter (Étape 2):**
```javascript
// AJOUTER À formData.useState
const [formData, setFormData] = useState({
  ...existing,
  // Champs consultant
  siret: '',                    // varchar(14)
  specialites: '',              // longtext (JSON array)
  tarif_horaire: '',            // decimal(10,2)
  experience_years: ''          // int(11)
});

// AJOUTER À handleInputChange (case statement)
case 'siret':
  if (value && !/^\d{14}$/.test(value)) {
    newErrors.siret = 'SIRET invalide (14 chiffres)';
  } else {
    delete newErrors.siret;
  }
  break;

case 'specialites':
  // Accepter comme string ou JSON
  delete newErrors.specialites;
  break;

case 'tarif_horaire':
  if (value && isNaN(value)) {
    newErrors.tarif_horaire = 'Montant invalide';
  } else {
    delete newErrors.tarif_horaire;
  }
  break;

case 'experience_years':
  if (value && (isNaN(value) || value < 0)) {
    newErrors.experience_years = 'Nombre d\'années invalide';
  } else {
    delete newErrors.experience_years;
  }
  break;
```

**Affichage Conditionnel (Étape 2):**
```javascript
{/* AFFICHER SEULEMENT SI role = 'consultant' OU 'super_consultant' */}
{(formData.role === 'consultant' || formData.role === 'super_consultant') && (
  <>
    <h4 className="section-title">Informations Consultant</h4>
    
    {/* SIRET */}
    <div className="form-group">
      <label htmlFor="siret" className="form-label">
        <span>SIRET *</span>
      </label>
      <input
        type="text"
        id="siret"
        name="siret"
        value={formData.siret}
        onChange={handleInputChange}
        placeholder="12345678901234"
        disabled={loading}
        className={`form-input ${errors.siret ? 'error' : ''}`}
      />
      {errors.siret && <div className="error-message">{errors.siret}</div>}
      <div className="hint">Numéro SIRET à 14 chiffres</div>
    </div>

    {/* Spécialités */}
    <div className="form-group">
      <label htmlFor="specialites" className="form-label">
        <span>Spécialités *</span>
      </label>
      <textarea
        id="specialites"
        name="specialites"
        value={formData.specialites}
        onChange={handleInputChange}
        placeholder="Audit, Conseil fiscal, Conseil RH, etc."
        disabled={loading}
        className={`form-input ${errors.specialites ? 'error' : ''}`}
        rows="3"
      />
      {errors.specialites && <div className="error-message">{errors.specialites}</div>}
      <div className="hint">Séparez les spécialités par des virgules</div>
    </div>

    {/* Tarif Horaire */}
    <div className="form-group">
      <label htmlFor="tarif_horaire" className="form-label">
        <span>Tarif Horaire (XOF) *</span>
      </label>
      <input
        type="number"
        id="tarif_horaire"
        name="tarif_horaire"
        value={formData.tarif_horaire}
        onChange={handleInputChange}
        placeholder="150.00"
        disabled={loading}
        step="0.01"
        min="0"
        className={`form-input ${errors.tarif_horaire ? 'error' : ''}`}
      />
      {errors.tarif_horaire && <div className="error-message">{errors.tarif_horaire}</div>}
    </div>

    {/* Années d'expérience */}
    <div className="form-group">
      <label htmlFor="experience_years" className="form-label">
        <span>Années d'expérience *</span>
      </label>
      <input
        type="number"
        id="experience_years"
        name="experience_years"
        value={formData.experience_years}
        onChange={handleInputChange}
        placeholder="5"
        disabled={loading}
        min="0"
        max="70"
        className={`form-input ${errors.experience_years ? 'error' : ''}`}
      />
      {errors.experience_years && <div className="error-message">{errors.experience_years}</div>}
    </div>
  </>
)}
```

**Location**: Étape 2, après Téléphone

---

### CATÉGORIE 3: VALIDATION DYNAMIQUE PAR RÔLE

#### **Problème**
Validation doit être différente selon le rôle (consultant = siret requis, utilisateur = non)

#### **Implémentation Requise**
```javascript
const validateForm = () => {
  const newErrors = {};
  
  // ... existing validations ...

  // VALIDATION SPÉCIFIQUE AU RÔLE
  if (formData.role === 'consultant' || formData.role === 'super_consultant') {
    if (!formData.siret) {
      newErrors.siret = 'SIRET requis pour un consultant';
    } else if (!/^\d{14}$/.test(formData.siret)) {
      newErrors.siret = 'SIRET invalide (14 chiffres)';
    }
    
    if (!formData.specialites) {
      newErrors.specialites = 'Spécialités requises';
    }
    
    if (!formData.tarif_horaire) {
      newErrors.tarif_horaire = 'Tarif horaire requis';
    } else if (isNaN(formData.tarif_horaire) || parseFloat(formData.tarif_horaire) <= 0) {
      newErrors.tarif_horaire = 'Tarif horaire invalide';
    }
    
    if (!formData.experience_years) {
      newErrors.experience_years = 'Années d\'expérience requises';
    }
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

---

### CATÉGORIE 4: MESSAGES D'APPROBATION PERSONNALISÉS

#### **Problème**
Messages génériques sans contexte du rôle et de l'approbateur

#### **Implémentation Requise**
```javascript
const getApprovalMessage = (role) => {
  const approverMap = {
    'utilisateur': 'un super utilisateur',
    'consultant': 'un super utilisateur ou administrateur',
    'super_consultant': 'un super utilisateur ou administrateur',
    'super_utilisateur': 'un administrateur'
  };
  
  return approverMap[role] || 'un administrateur';
};

// DANS handleSubmit, remplacer le bloc requiresApproval:
if (requiresApproval) {
  const approver = getApprovalMessage(formData.role);
  
  addNotification({ 
    type: 'info', 
    title: 'Demande soumise pour approbation', 
    message: `Votre demande d'inscription en tant que "${formData.role}" 
              devra être approuvée par ${approver}.` 
  });
  
  navigate('/login', {
    state: {
      message: `✋ Votre compte est en attente d'approbation.
                Rôle demandé: ${formData.role.toUpperCase()}
                Approbateur requis: ${approver}
                Vous recevrez un email de confirmation.`,
      email: formData.email,
      role: formData.role
    }
  });
}
```

---

### CATÉGORIE 5: AFFICHAGE DU RÔLE AVEC BADGE

#### **Problème**
Utilisateur ne voit pas clairement quel rôle il a choisi

#### **Implémentation Requise**
```javascript
// AJOUTER COMPOSANT BADGE
const getRoleBadge = (role) => {
  const badges = {
    'utilisateur': { color: '#3b82f6', label: 'Utilisateur' },
    'consultant': { color: '#8b5cf6', label: 'Consultant' },
    'super_consultant': { color: '#ec4899', label: 'Super Consultant' },
    'super_utilisateur': { color: '#f59e0b', label: 'Super Utilisateur' }
  };
  
  const badge = badges[role] || { color: '#6b7280', label: 'Non défini' };
  
  return (
    <div style={{
      backgroundColor: badge.color,
      color: 'white',
      padding: '4px 12px',
      borderRadius: '16px',
      fontSize: '12px',
      fontWeight: 'bold'
    }}>
      {badge.label}
    </div>
  );
};

// AFFICHER DANS ÉTAPE 2 (header ou summary)
{formData.role && (
  <div className="role-summary">
    <p><strong>Rôle sélectionné:</strong></p>
    {getRoleBadge(formData.role)}
  </div>
)}
```

---

## 📋 RÉSUMÉ DES MISES À JOUR

| Item | Catégorie | État | Impact |
|------|-----------|------|--------|
| **Sélecteur de rôle** | 1 | ❌ Absent | CRITIQUE |
| **Champs consultant** | 2 | ❌ Absent | IMPORTANT |
| **Validation dynamique** | 3 | ⚠️ Partielle | IMPORTANT |
| **Messages approbation** | 4 | ⚠️ Génériques | MOYEN |
| **Badge rôle** | 5 | ❌ Absent | MOYEN |
| **Envoi rôle au backend** | - | ❌ Non envoyé | CRITIQUE |

---

## 🎯 ORDRE D'IMPLÉMENTATION RECOMMANDÉ

### Phase 1 (URGENT) - Corrections Critiques
1. ✅ Ajouter `role` à formData.useState
2. ✅ Ajouter sélecteur rôle à Étape 1
3. ✅ Envoyer `role` dans payload au backend
4. ✅ Ajouter validation de rôle

### Phase 2 (IMPORTANT) - Champs Consultant
1. ✅ Ajouter 4 champs consultant à formData
2. ✅ Ajouter validation par rôle
3. ✅ Afficher champs conditionnellement (étape 2)

### Phase 3 (MOYEN) - UX Améliorée
1. ✅ Personnaliser messages approbation par rôle
2. ✅ Ajouter badge rôle en step 2
3. ✅ Ajouter descriptions par rôle
4. ✅ Améliorer CSS pour champs consultants

---

## ⚙️ DÉTAILS TECHNIQUES

### State à Ajouter
```javascript
const [formData, setFormData] = useState({
  // Existant
  email: invitedEmail,
  username: '',
  password: '',
  confirmPassword: '',
  prenom: '',
  nom: '',
  telephone: '',
  groupeId: groupeId,
  invitationToken: invitationToken,
  // NOUVEAU
  role: 'utilisateur',           // ← AJOUTER
  siret: '',                      // ← AJOUTER
  specialites: '',                // ← AJOUTER
  tarif_horaire: '',              // ← AJOUTER
  experience_years: ''            // ← AJOUTER
});
```

### Payload au Backend
```javascript
const payload = {
  // Existant
  email: formData.email,
  username: formData.username,
  password: formData.password,
  prenom: formData.prenom,
  nom: formData.nom,
  telephone: formData.telephone || null,
  groupeId: formData.groupeId,
  invitationToken: formData.invitationToken || null,
  // NOUVEAU
  role: formData.role,                    // ← INCLURE
  siret: formData.siret || null,          // ← INCLURE (si consultant)
  specialites: formData.specialites || null, // ← INCLURE (si consultant)
  tarifHoraire: formData.tarif_horaire || null, // ← INCLURE (si consultant)
  experienceYears: formData.experience_years || null // ← INCLURE (si consultant)
};
```

---

## 📊 IMPACT SUR LE WORKFLOW

```
AVANT (Actuel)
═════════════
Register → email/username/password/prenom/nom/telephone
         → Backend crée user avec role='utilisateur' (TOUJOURS)
         → Backend crée PendingApproval (ÉCHOUE)

APRÈS (Avec mises à jour)
═════════════════════════
Register → Utilisateur choisit: role='consultant'
         → Si consultant: saisit siret/specialites/tarif/experience
         → Envoie: role + champs consultant au backend
         → Backend crée PendingRoleApproval (CORRECT)
         → Backend approuve → crée user avec role='consultant'
         → Backend escalade hierarchy_level & can_grant_permissions
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

**Frontend RegisterPage.jsx:**
- [ ] Ajouter 5 champs à formData.useState
- [ ] Ajouter sélecteur rôle (dropdown) à Étape 1
- [ ] Ajouter 4 champs consultant à formData (avec validation)
- [ ] Ajouter affichage conditionnel des champs consultant
- [ ] Modifier handleInputChange pour les 4 nouveaux champs
- [ ] Modifier validateForm pour validation par rôle
- [ ] Modifier payload pour inclure role + champs consultant
- [ ] Personnaliser messages approbation par rôle
- [ ] Ajouter badge rôle en Étape 2
- [ ] Tester validation complète

**CSS RegisterPage.css (si nécessaire):**
- [ ] Styles pour section "Informations Consultant"
- [ ] Styles pour badge rôle
- [ ] Styles pour conditional display

**Tests:**
- [ ] Enregistrement utilisateur standard
- [ ] Enregistrement consultant avec tous les champs
- [ ] Validation siret (14 chiffres uniquement)
- [ ] Champs consultant masqués pour utilisateur standard
- [ ] Message approbation personnalisé par rôle

---

## 🚀 STATUS: PRÊT POUR IMPLÉMENTATION
