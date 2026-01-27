# 🚀 Plan d'Implémentation - Architecture Consultants Multi-Groupes

## 📊 **Analyse d'Impact Complète**

### ✅ **Architecture Existante - État Actuel**
- **Backend** : Node.js + Sequelize + MySQL ✅
- **Frontend** : React + Vite + Zustand ✅  
- **Authentification** : JWT + Refresh Token ✅
- **Rôles** : `admin`, `user`, `viewer`, `accountant` ✅
- **Groupes** : `GroupeEntreprise` ✅
- **Compagnies** : `Company` ✅

### 🎯 **Points d'Impact Identifiés**

#### **🔴 Modifications Critiques (Non-Destructives)**
1. **Model User** : Ajout champs `hierarchy_level`, `can_grant_permissions`
2. **Rôles** : Extension avec `super_consultant`, `consultant`, `super_utilisateur`, `utilisateur`
3. **Tables** : Création 4 nouvelles tables (consultant_group_assignments, consultant_company_access, consulting_firms, firm_consultants)
4. **RegisterPage** : Formulaire conditionnel par rôle
5. **Auth Controller** : Workflow d'approbation hiérarchique

#### **🟡 Extensions Fonctionnelles**
1. **Dashboard Consultant** : Vue multi-groupes
2. **Permission Service** : Accès granulaire par compagnie
3. **Interface Admin** : Gestion consultants par groupe
4. **Notifications** : Workflow d'approbation

---

## 🗄️ **Phase 1 - Base de Données (CRITIQUE)**

### ✅ **1.1 Extension Model User (Non-Destructive)**
```sql
-- Migration SQL - Ajout champs consultants
ALTER TABLE users 
ADD COLUMN hierarchy_level INT DEFAULT 99,
ADD COLUMN can_grant_permissions BOOLEAN DEFAULT false,
ADD COLUMN prenom VARCHAR(100) NULL,
ADD COLUMN nom VARCHAR(100) NULL,
ADD COLUMN telephone VARCHAR(20) NULL,
ADD COLUMN siret VARCHAR(14) NULL,
ADD COLUMN specialites JSON NULL,
ADD COLUMN tarif_horaire DECIMAL(10,2) NULL,
ADD COLUMN experience_years INT NULL;
```

### ✅ **1.2 Extension Énumération Rôles**
```sql
-- Mise à jour énumération roles
ALTER TABLE users 
MODIFY COLUMN role ENUM(
  'admin',           -- Niveau 1
  'super_utilisateur', -- Niveau 2  
  'utilisateur',     -- Niveau 3
  'super_consultant', -- Niveau 4
  'consultant',      -- Niveau 5
  'viewer',          -- Legacy
  'accountant'       -- Legacy
) DEFAULT 'utilisateur';
```

### ✅ **1.3 Nouvelles Tables Consultants**
```sql
-- Table 1: Affectations Consultants ↔ Groupes
CREATE TABLE consultant_group_assignments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consultant_id INT NOT NULL,
  groupe_id INT NOT NULL,
  status ENUM('active', 'pending', 'suspended', 'terminated') DEFAULT 'pending',
  contract_type VARCHAR(50),         -- 'audit', 'coaching', 'expertise', 'accompagnement'
  contract_reference VARCHAR(100),
  start_date DATE,
  end_date DATE,
  billing_rate DECIMAL(10,2),
  created_by INT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_consultant_group (consultant_id, groupe_id),
  FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table 2: Accès Consultants ↔ Compagnies
CREATE TABLE consultant_company_access (
  id INT PRIMARY KEY AUTO_INCREMENT,
  consultant_id INT NOT NULL,
  compagnie_id INT NOT NULL,
  groupe_id INT NOT NULL,
  access_level ENUM('read', 'write', 'audit', 'review') DEFAULT 'read',
  specific_permissions JSON,
  reason TEXT,
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id) ON DELETE CASCADE,
  FOREIGN KEY (groupe_id) REFERENCES groupes_entreprises(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_consultant_company (consultant_id, compagnie_id)
);

-- Table 3: Cabinets/Organismes
CREATE TABLE consulting_firms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nom VARCHAR(255) NOT NULL,
  siret VARCHAR(14) UNIQUE,
  type VARCHAR(50),                  -- 'cabinet_comptable', 'coaching', 'audit', 'expertise'
  adresse TEXT,
  contact_email VARCHAR(255),
  contact_telephone VARCHAR(20),
  website VARCHAR(255),
  description TEXT,
  logo_url VARCHAR(500),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Table 4: Lien Consultants ↔ Cabinets
CREATE TABLE firm_consultants (
  consultant_id INT PRIMARY KEY,
  firm_id INT NOT NULL,
  position VARCHAR(100),             -- 'associé', 'salarié', 'collaborateur'
  join_date DATE,
  FOREIGN KEY (consultant_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (firm_id) REFERENCES consulting_firms(id) ON DELETE CASCADE
);
```

### ✅ **1.4 Table Workflow Approbation**
```sql
-- Table 5: Workflow d'approbation hiérarchique
CREATE TABLE role_approval_workflow (
  id INT PRIMARY KEY AUTO_INCREMENT,
  requested_role VARCHAR(50) NOT NULL,
  approver_role VARCHAR(50) NOT NULL,
  min_hierarchy_level INT,
  requires_group_creation BOOLEAN DEFAULT false,
  requires_company_creation BOOLEAN DEFAULT false,
  auto_approve_if_creator_has_role BOOLEAN DEFAULT false
);

-- Données initiales workflow
INSERT INTO role_approval_workflow VALUES
(1, 'super_utilisateur', 'admin', 1, true, false, false),
(2, 'utilisateur', 'super_utilisateur', 2, false, true, false),
(3, 'super_consultant', 'super_utilisateur', 3, false, false, false),
(4, 'consultant', 'super_utilisateur', 3, false, false, false);
```

---

## 🔧 **Phase 2 - Modèles Sequelize (CRITIQUE)**

### ✅ **2.1 Mise à jour User Model**
```javascript
// cascade/src/models/user.model.js - Version Étendue
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    
    // 🆕 Champs Hiérarchie
    role: {
        type: DataTypes.ENUM('admin', 'super_utilisateur', 'utilisateur', 'super_consultant', 'consultant', 'viewer', 'accountant'),
        defaultValue: 'utilisateur'
    },
    hierarchy_level: { type: DataTypes.INTEGER, defaultValue: 99 },
    can_grant_permissions: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // 🆕 Champs Profil Consultant
    prenom: { type: DataTypes.STRING(100), allowNull: true },
    nom: { type: DataTypes.STRING(100), allowNull: true },
    telephone: { type: DataTypes.STRING(20), allowNull: true },
    siret: { type: DataTypes.STRING(14), allowNull: true },
    specialites: { type: DataTypes.JSON, allowNull: true },
    tarif_horaire: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    experience_years: { type: DataTypes.INTEGER, allowNull: true },
    
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true,
    defaultScope: { attributes: { exclude: ['password'] } },
    scopes: {
        withPassword: { attributes: { include: ['password'] } },
        withProfile: { attributes: { include: ['prenom', 'nom', 'telephone', 'specialites'] } }
    }
});
```

### ✅ **2.2 Nouveaux Modèles**
```javascript
// cascade/src/models/consultantGroupAssignment.model.js
export default (sequelize) => {
  const ConsultantGroupAssignment = sequelize.define('ConsultantGroupAssignment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    consultant_id: { type: DataTypes.INTEGER, allowNull: false },
    groupe_id: { type: DataTypes.INTEGER, allowNull: false },
    status: { 
        type: DataTypes.ENUM('active', 'pending', 'suspended', 'terminated'), 
        defaultValue: 'pending' 
    },
    contract_type: { type: DataTypes.STRING(50), allowNull: true },
    contract_reference: { type: DataTypes.STRING(100), allowNull: true },
    start_date: { type: DataTypes.DATE, allowNull: true },
    end_date: { type: DataTypes.DATE, allowNull: true },
    billing_rate: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    approved_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'consultant_group_assignments',
    timestamps: true,
    underscored: true
  });

  return ConsultantGroupAssignment;
};

// cascade/src/models/consultantCompanyAccess.model.js
export default (sequelize) => {
  const ConsultantCompanyAccess = sequelize.define('ConsultantCompanyAccess', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    consultant_id: { type: DataTypes.INTEGER, allowNull: false },
    compagnie_id: { type: DataTypes.INTEGER, allowNull: false },
    groupe_id: { type: DataTypes.INTEGER, allowNull: false },
    access_level: { 
        type: DataTypes.ENUM('read', 'write', 'audit', 'review'), 
        defaultValue: 'read' 
    },
    specific_permissions: { type: DataTypes.JSON, allowNull: true },
    reason: { type: DataTypes.TEXT, allowNull: true },
    approved_by: { type: DataTypes.INTEGER, allowNull: true },
    expires_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'consultant_company_access',
    timestamps: true,
    underscored: true
  });

  return ConsultantCompanyAccess;
};
```

---

## 🎯 **Phase 3 - RegisterPage Évoluée (CRITIQUE)**

### ✅ **3.1 Logique Conditionnelle par Rôle**
```jsx
// frontend/src/pages/RegisterPage.jsx - Version Multi-Groupes
const RegisterPage = () => {
  const [selectedRole, setSelectedRole] = useState('');
  const [registrationType, setRegistrationType] = useState('');
  const [formData, setFormData] = useState({
    // Base fields
    username: '',
    email: '',
    password: '',
    prenom: '',
    nom: '',
    telephone: '',
    
    // Role-specific fields
    groupeName: '',           // For super_utilisateur
    groupeId: '',             // For utilisateur
    compagnieName: '',        // For utilisateur
    firmType: '',             // For consultant
    specialites: [],          // For consultant
    tarifHoraire: '',         // For consultant
    experienceYears: ''       // For consultant
  });

  return (
    <div className="register-page">
      <h1>Créer un Compte SPOFE</h1>
      
      {/* Étape 1: Informations de base */}
      <BasicInfoForm formData={formData} setFormData={setFormData} />
      
      {/* Étape 2: Sélection du rôle */}
      <RoleSelector selectedRole={selectedRole} onRoleChange={setSelectedRole} />
      
      {/* Étape 3: Formulaire conditionnel */}
      {selectedRole === 'super_utilisateur' && (
        <SuperUtilisateurForm 
          formData={formData} 
          setFormData={setFormData} 
        />
      )}
      
      {selectedRole === 'utilisateur' && (
        <UtilisateurForm 
          formData={formData} 
          setFormData={setFormData} 
        />
      )}
      
      {selectedRole === 'super_consultant' && (
        <SuperConsultantForm 
          formData={formData} 
          setFormData={setFormData} 
        />
      )}
      
      {selectedRole === 'consultant' && (
        <ConsultantForm 
          formData={formData} 
          setFormData={setFormData} 
          registrationType={registrationType}
          setRegistrationType={setRegistrationType}
        />
      )}
      
      <SubmitButton 
        selectedRole={selectedRole}
        formData={formData}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
```

### ✅ **3.2 Composants Spécifiques**
```jsx
// SuperUtilisateurForm.jsx - Création Groupe
const SuperUtilisateurForm = ({ formData, setFormData }) => (
  <div className="role-form">
    <h3>🏢 Création Groupe d'Entreprises</h3>
    
    <div className="form-group">
      <label>Nom du Groupe *</label>
      <input
        type="text"
        value={formData.groupeName}
        onChange={(e) => setFormData({...formData, groupeName: e.target.value})}
        placeholder="Ex: Groupe ABC Holding"
        required
      />
    </div>
    
    <div className="form-group">
      <label>Description du Groupe</label>
      <textarea
        value={formData.groupeDescription}
        onChange={(e) => setFormData({...formData, groupeDescription: e.target.value})}
        placeholder="Description des activités du groupe..."
      />
    </div>
    
    <div className="info-box">
      <p>📋 En tant que Super Utilisateur, vous allez créer un groupe d'entreprises.</p>
      <p>⏳ Votre inscription sera validée par un Administrateur.</p>
    </div>
  </div>
);

// ConsultantForm.jsx - Inscription Consultant
const ConsultantForm = ({ formData, setFormData, registrationType, setRegistrationType }) => (
  <div className="role-form">
    <h3>🎯 Inscription Consultant/Expert</h3>
    
    {/* Type d'inscription */}
    <div className="registration-options">
      <button 
        className={registrationType === 'independent' ? 'active' : ''}
        onClick={() => setRegistrationType('independent')}
      >
        🏢 Consultant Indépendant
      </button>
      <button 
        className={registrationType === 'firm' ? 'active' : ''}
        onClick={() => setRegistrationType('firm')}
      >
        🏛️ Cabinet/Organisme
      </button>
    </div>
    
    {/* Formulaire consultant indépendant */}
    {registrationType === 'independent' && (
      <IndependentConsultantForm formData={formData} setFormData={setFormData} />
    )}
    
    {/* Formulaire cabinet */}
    {registrationType === 'firm' && (
      <ConsultingFirmForm formData={formData} setFormData={setFormData} />
    )}
    
    {/* Association groupes (optionnelle) */}
    <div className="group-association">
      <h4>Associations avec Groupes (Optionnel)</h4>
      <p>Vous pouvez demander à rejoindre des groupes maintenant ou plus tard</p>
      <GroupSearchAndRequest formData={formData} setFormData={setFormData} />
    </div>
  </div>
);
```

---

## 🔧 **Phase 4 - Backend Services (CRITIQUE)**

### ✅ **4.1 Service d'Approbation Hiérarchique**
```javascript
// cascade/src/services/roleApprovalService.js
class RoleApprovalService {
  async createRegistrationRequest(userData, creatorRoleId) {
    const workflow = await RoleApprovalWorkflow.findOne({
      where: { requested_role: userData.role }
    });
    
    if (!workflow) {
      throw new Error(`Workflow non défini pour le rôle: ${userData.role}`);
    }
    
    // Vérifier auto-approbation
    if (workflow.auto_approve_if_creator_has_role && 
        creatorRoleId === workflow.approver_role) {
      return this.autoApprove(userData);
    }
    
    // Créer demande d'approbation
    const approvalRequest = await PendingRoleApproval.create({
      user_data: userData,
      requested_role: userData.role,
      approver_role: workflow.approver_role,
      status: 'pending',
      requires_group: workflow.requires_group_creation,
      requires_company: workflow.requires_company_creation
    });
    
    // Notifier le valideur
    await this.notifyApprover(workflow.approver_role, approvalRequest);
    
    return {
      requiresApproval: true,
      approvalRequestId: approvalRequest.id,
      approverRole: workflow.approver_role,
      nextSteps: this.getNextSteps(workflow, userData)
    };
  }
  
  async autoApprove(userData) {
    // Créer directement l'utilisateur
    const user = await User.create({
      username: userData.username,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
      role: userData.role,
      hierarchy_level: this.getHierarchyLevel(userData.role),
      prenom: userData.prenom,
      nom: userData.nom,
      telephone: userData.telephone,
      specialites: userData.specialites,
      tarif_horaire: userData.tarifHoraire,
      experience_years: userData.experienceYears
    });
    
    // Créer groupe/compagnie si nécessaire
    if (userData.role === 'super_utilisateur' && userData.groupeName) {
      await this.createGroupeForUser(user.id, userData);
    }
    
    if (userData.role === 'utilisateur' && userData.compagnieName) {
      await this.createCompagnieForUser(user.id, userData);
    }
    
    return {
      requiresApproval: false,
      user: user.get({ plain: true }),
      message: 'Compte créé avec succès'
    };
  }
  
  getHierarchyLevel(role) {
    const levels = {
      'admin': 1,
      'super_utilisateur': 2,
      'utilisateur': 3,
      'super_consultant': 4,
      'consultant': 5,
      'viewer': 6,
      'accountant': 7
    };
    return levels[role] || 99;
  }
}

export default new RoleApprovalService();
```

### ✅ **4.2 Mise à jour Auth Controller**
```javascript
// cascade/src/controllers/auth.controller.js - Version Étendue
export const register = async (req, res, next) => {
    try {
        const { 
            username, 
            email, 
            password, 
            role = 'utilisateur',
            prenom,
            nom,
            telephone,
            // Champs spécifiques selon rôle
            groupeName,
            groupeDescription,
            groupeId,
            compagnieName,
            specialites,
            tarifHoraire,
            experienceYears,
            registrationType
        } = req.body;

        // Vérifications existantes...
        
        // 🆕 Workflow d'approbation hiérarchique
        const userData = {
            username,
            email,
            password,
            role,
            prenom,
            nom,
            telephone,
            groupeName,
            groupeDescription,
            groupeId,
            compagnieName,
            specialites,
            tarifHoraire,
            experienceYears,
            registrationType
        };
        
        const result = await roleApprovalService.createRegistrationRequest(userData, req.user?.role);
        
        if (result.requiresApproval) {
            return success(res, {
                message: 'Inscription enregistrée, en attente de validation',
                approvalRequestId: result.approvalRequestId,
                approverRole: result.approverRole,
                nextSteps: result.nextSteps
            }, 201, 'Inscription soumise pour validation');
        }
        
        // Auto-approuvé
        const token = generateToken(result.user);
        const refreshToken = generateRefreshToken(result.user);
        
        success(res, {
            user: result.user,
            token,
            refreshToken,
            message: result.message
        }, 201, 'Compte créé avec succès');
        
    } catch (error) {
        next(error);
    }
};
```

---

## 🎯 **Phase 5 - Dashboard Consultant**

### ✅ **5.1 Dashboard Multi-Groupes**
```jsx
// frontend/src/pages/ConsultantDashboard.jsx
const ConsultantDashboard = () => {
  const { consultant } = useAuth();
  const [activeGroups, setActiveGroups] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [billingSummary, setBillingSummary] = useState({});
  
  useEffect(() => {
    loadConsultantData();
  }, []);
  
  const loadConsultantData = async () => {
    try {
      const [groups, requests, billing] = await Promise.all([
        consultantService.getActiveGroups(consultant.id),
        consultantService.getPendingRequests(consultant.id),
        consultantService.getBillingSummary(consultant.id)
      ]);
      
      setActiveGroups(groups);
      setPendingRequests(requests);
      setBillingSummary(billing);
    } catch (error) {
      console.error('Error loading consultant data:', error);
    }
  };
  
  return (
    <div className="consultant-dashboard">
      <header className="dashboard-header">
        <h2>🎯 Tableau de Bord Consultant</h2>
        <ConsultantProfileSummary consultant={consultant} />
      </header>
      
      <div className="dashboard-grid">
        {/* Card 1: Groupes Actifs */}
        <div className="card active-groups">
          <h3>🎯 Groupes Actifs ({activeGroups.length})</h3>
          <GroupList groups={activeGroups} />
          <button onClick={requestNewGroup} className="btn-primary">
            + Demander nouveau groupe
          </button>
        </div>
        
        {/* Card 2: Demandes en Attente */}
        <div className="card pending-requests">
          <h3>⏳ Demandes en Attente ({pendingRequests.length})</h3>
          <PendingRequestsList requests={pendingRequests} />
        </div>
        
        {/* Card 3: Contrats & Facturation */}
        <div className="card contracts-billing">
          <h3>💰 Contrats & Facturation</h3>
          <BillingSummary summary={billingSummary} />
          <button onClick={generateInvoice} className="btn-secondary">
            Générer Facture
          </button>
        </div>
        
        {/* Card 4: Accès Compagnies */}
        <div className="card company-access">
          <h3>🏢 Accès Compagnies</h3>
          <CompanyAccessMatrix consultant={consultant} />
        </div>
      </div>
      
      {/* Section Rapports Multi-Groupes */}
      <section className="reports-section">
        <h3>📊 Rapports Multi-Groupes</h3>
        <CrossGroupReports consultant={consultant} />
      </section>
    </div>
  );
};
```

---

## 🔧 **Phase 6 - Services Permissions**

### ✅ **6.1 Service Permissions Consultant**
```javascript
// cascade/src/services/consultantPermissionService.js
class ConsultantPermissionService {
  async hasAccessToCompany(consultantId, compagnieId, requiredPermission = 'read') {
    // 1. Vérifier accès direct à la compagnie
    const directAccess = await ConsultantCompanyAccess.findOne({
      where: { 
        consultant_id: consultantId, 
        compagnie_id: compagnieId,
        expires_at: { [Op.or]: [null, { [Op.gt]: new Date() }] }
      },
      include: [{ model: User, as: 'approvedBy' }]
    });
    
    if (directAccess && this.checkPermissionLevel(directAccess, requiredPermission)) {
      return { 
        hasAccess: true, 
        source: 'direct', 
        accessLevel: directAccess.access_level,
        approvedBy: directAccess.approvedBy
      };
    }
    
    // 2. Vérifier via groupe (accès à toutes les compagnies du groupe)
    const viaGroup = await this.hasGroupWideAccess(consultantId, compagnieId);
    
    return viaGroup || { hasAccess: false, reason: 'No access granted' };
  }
  
  async grantCompanyAccess(consultantId, compagnieId, accessData) {
    const { accessLevel, permissions, reason, grantedBy, expiresAt, groupeId } = accessData;
    
    // Vérifier autorisation du grantor
    const isAuthorized = await this.isGrantorAuthorized(grantedBy, compagnieId, groupeId);
    
    if (!isAuthorized) {
      throw new Error('Non autorisé à accorder cet accès');
    }
    
    // Créer/Modifier l'accès
    const access = await ConsultantCompanyAccess.upsert({
      consultant_id: consultantId,
      compagnie_id: compagnieId,
      groupe_id: groupeId,
      access_level: accessLevel,
      specific_permissions: permissions,
      reason: reason,
      approved_by: grantedBy,
      expires_at: expiresAt
    });
    
    // Audit log
    await this.logAccessGrant(consultantId, compagnieId, grantedBy, accessData);
    
    // Notification au consultant
    await notificationService.notifyAccessGranted(consultantId, {
      compagnieId,
      accessLevel,
      grantedBy
    });
    
    return access;
  }
  
  checkPermissionLevel(access, requiredPermission) {
    const levels = {
      'read': 1,
      'write': 2,
      'audit': 3,
      'review': 4
    };
    
    return levels[access.access_level] >= levels[requiredPermission];
  }
  
  async isGrantorAuthorized(grantorId, compagnieId, groupeId) {
    const grantor = await User.findByPk(grantorId);
    
    // Super Utilisateur du groupe peut accorder accès
    if (grantor.role === 'super_utilisateur') {
      const groupAccess = await GroupeEntreprise.findByPk(groupeId);
      return groupAccess && await this.isUserSuperUserOfGroup(grantorId, groupeId);
    }
    
    // Admin de la compagnie peut accorder accès
    if (grantor.role === 'utilisateur') {
      return await this.isUserAdminOfCompagnie(grantorId, compagnieId);
    }
    
    return false;
  }
}

export default new ConsultantPermissionService();
```

---

## 🎯 **Phase 7 - Interface Gestion Super Utilisateur**

### ✅ **7.1 Gestion Consultants par Groupe**
```jsx
// frontend/src/components/GroupConsultantManager.jsx
const GroupConsultantManager = ({ groupeId }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [consultants, setConsultants] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  
  return (
    <div className="group-consultant-manager">
      <h3>🎯 Gestion Consultants du Groupe</h3>
      
      <div className="tabs">
        <button 
          className={activeTab === 'active' ? 'active' : ''}
          onClick={() => setActiveTab('active')}
        >
          Consultants Actifs
        </button>
        <button 
          className={activeTab === 'pending' ? 'active' : ''}
          onClick={() => setActiveTab('pending')}
        >
          Demandes en Attente
        </button>
        <button 
          className={activeTab === 'access' ? 'active' : ''}
          onClick={() => setActiveTab('access')}
        >
          Gestion Accès
        </button>
        <button 
          className={activeTab === 'contracts' ? 'active' : ''}
          onClick={() => setActiveTab('contracts')}
        >
          Contrats & Facturation
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'active' && (
          <ActiveConsultantsTab 
            groupeId={groupeId} 
            consultants={consultants}
            onInvite={inviteConsultant}
          />
        )}
        
        {activeTab === 'pending' && (
          <PendingRequestsTab 
            groupeId={groupeId}
            requests={pendingRequests}
            onApprove={approveRequest}
            onReject={rejectRequest}
          />
        )}
        
        {activeTab === 'access' && (
          <CompanyAccessManagerTab groupeId={groupeId} />
        )}
        
        {activeTab === 'contracts' && (
          <ContractsManagerTab groupeId={groupeId} />
        )}
      </div>
    </div>
  );
};

// ActiveConsultantsTab.jsx
const ActiveConsultantsTab = ({ groupeId, consultants, onInvite }) => (
  <div className="active-consultants">
    <div className="consultants-list">
      {consultants.map(consultant => (
        <div key={consultant.id} className="consultant-card">
          <div className="consultant-info">
            <h4>{consultant.prenom} {consultant.nom}</h4>
            <p>{consultant.email}</p>
            <div className="specialties">
              {consultant.specialites?.map(spec => (
                <span key={spec} className="specialty-tag">{spec}</span>
              ))}
            </div>
          </div>
          
          <div className="consultant-actions">
            <button onClick={() => manageAccess(consultant.id)}>
              Gérer Accès
            </button>
            <button onClick={() => viewContracts(consultant.id)}>
              Contrats
            </button>
            <button onClick={() => suspendConsultant(consultant.id)}>
              Suspendre
            </button>
          </div>
        </div>
      ))}
    </div>
    
    <button onClick={onInvite} className="btn-primary">
      + Inviter nouveau consultant
    </button>
  </div>
);
```

---

## 📊 **Phase 8 - Recherche & Découverte**

### ✅ **8.1 Vue Recherche Consultants**
```sql
-- Vue pour recherche consultants
CREATE VIEW available_consultants AS
SELECT 
  u.id,
  u.prenom,
  u.nom,
  u.email,
  u.telephone,
  u.specialites,
  u.tarif_horaire,
  u.experience_years,
  u.role,
  cf.nom as firm_name,
  cf.type as firm_type,
  cga.contract_type,
  cga.billing_rate,
  cga.status as assignment_status,
  -- Expertises (JSON array)
  u.specialites,
  -- Note moyenne (si implémenté)
  0 as avg_rating,
  -- Nombre de groupes actifs
  (SELECT COUNT(*) 
   FROM consultant_group_assignments cga2 
   WHERE cga2.consultant_id = u.id AND cga2.status = 'active') as active_groups_count
FROM users u
LEFT JOIN firm_consultants fc ON u.id = fc.consultant_id
LEFT JOIN consulting_firms cf ON fc.firm_id = cf.id
LEFT JOIN consultant_group_assignments cga ON u.id = cga.consultant_id
WHERE u.role IN ('super_consultant', 'consultant')
  AND u.is_active = true
GROUP BY u.id;
```

### ✅ **8.2 API Recherche Consultants**
```javascript
// cascade/src/controllers/consultantController.js
export const searchConsultants = async (req, res, next) => {
  try {
    const { 
      query, 
      specialite, 
      groupeId, 
      minExperience, 
      maxTarif,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const whereClause = {
      role: { [Op.in]: ['super_consultant', 'consultant'] },
      isActive: true
    };
    
    // Filtres
    if (query) {
      whereClause[Op.or] = [
        { prenom: { [Op.like]: `%${query}%` } },
        { nom: { [Op.like]: `%${query}%` } },
        { email: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (specialite) {
      whereClause.specialites = { 
        [Op.contains]: [specialite] 
      };
    }
    
    if (minExperience) {
      whereClause.experience_years = { [Op.gte]: minExperience };
    }
    
    if (maxTarif) {
      whereClause.tarif_horaire = { [Op.lte]: maxTarif };
    }
    
    const consultants = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: ConsultantGroupAssignment,
          where: groupeId ? { groupe_id: groupeId } : undefined,
          include: [{ model: GroupeEntreprise }]
        },
        {
          model: FirmConsultants,
          include: [{ model: ConsultingFirm }]
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['experience_years', 'DESC']]
    });
    
    success(res, {
      consultants: consultants.rows,
      total: consultants.count,
      page: parseInt(page),
      totalPages: Math.ceil(consultants.count / limit)
    }, 200, 'Consultants trouvés');
    
  } catch (error) {
    next(error);
  }
};
```

---

## 🚀 **Roadmap d'Implémentation**

### ✅ **Phase 1 - CRITIQUE (Cette Semaine)**
1. **Base de Données** : Créer toutes les tables SQL
2. **Modèles Sequelize** : Implémenter tous les modèles
3. **RegisterPage** : Formulaire conditionnel par rôle
4. **Auth Controller** : Workflow d'approbation hiérarchique

### ✅ **Phase 2 - IMPORTANTE (Semaine Suivante)**
5. **Dashboard Consultant** : Vue multi-groupes
6. **Permission Service** : Accès granulaire
7. **Interface Admin** : Gestion consultants par groupe

### ✅ **Phase 3 - AVANCÉE (Mois Suivant)**
8. **Recherche Consultants** : API et interface
9. **Facturation** : Intégration billing
10. **Notifications** : Workflow complet

---

## 📋 **Checklist Validation**

### ✅ **Non-Destructif**
- ✅ Tables existantes non modifiées (sauf User avec ALTER TABLE ADD)
- ✅ Rôles legacy conservés (`viewer`, `accountant`)
- ✅ Backward compatibility maintenu

### ✅ **Constructif & Progressif**
- ✅ Extension fonctionnelle par ajout
- ✅ Workflow d'approbation hiérarchique
- ✅ Permissions granulaires
- ✅ Architecture multi-groupes

### ✅ **Intelligent & Cohérent**
- ✅ Aligné avec architecture existante
- ✅ Séparation des responsabilités
- ✅ Audit trail complet
- ✅ Sécurité renforcée

---

## 🎯 **Prochaines Actions Immédiates**

1. **Exécuter les scripts SQL** de création de tables
2. **Mettre à jour les modèles Sequelize**
3. **Tester RegisterPage** avec nouveaux rôles
4. **Valider workflow** d'approbation

**L'architecture est prête pour une implémentation progressive et non-destructive !** 🚀
