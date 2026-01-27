# Backend Registration & Approval Workflow - Corrections Appliquées

## Date: 24 Janvier 2026

### 📋 Résumé des Modifications

Corrections cohérentes et non-destructives du système d'enregistrement et d'approbation des utilisateurs, alignées avec la migration consultant complétée (100%).

---

## ✅ Corrections Appliquées

### 1️⃣ **auth.controller.js** - Gestion correcte des rôles et champs consultant

**Problème Identifié:**
- Tous les utilisateurs recevaient `role: 'utilisateur'` indépendamment du rôle demandé
- Les champs consultant (`siret`, `specialites`, `tarif_horaire`, `experience_years`) n'étaient pas sauvegardés

**Solution Implémentée:**
```javascript
// AVANT:
const user = await User.create({
  username, email, password,
  prenom, nom, telephone,
  role,  // ← Ignoré
  isActive: true
});

// APRÈS:
const user = await User.create({
  username, email, password,
  prenom, nom, telephone,
  role: finalRole,  // ← Utilise le rôle demandé
  isActive: true,
  // Champs consultant si fournis
  ...(specialites && { specialites }),
  ...(tarifHoraire && { tarif_horaire: tarifHoraire }),
  ...(experienceYears && { experience_years: experienceYears }),
  ...(siret && { siret })
});
```

**Fichier Modifié:** `cascade/src/controllers/auth.controller.js` (Ligne ~140-160)

---

### 2️⃣ **approvalProcessingService.js** - NOUVEAU Service

**Création d'un nouveau service dédié au traitement complet des approbations**

**Fonctionnalités:**
- ✅ Création d'utilisateur lors de l'approbation
- ✅ **Escalade de rôle** - Met à jour le rôle utilisateur après approbation
- ✅ Assignation automatique `hierarchy_level` et `can_grant_permissions`
- ✅ Support complet des champs consultant
- ✅ Gestion des rejets

**Méthodes principales:**
```javascript
approveRoleRequest(approvalId, approverId, notes)
  // Approuve et crée/escalade l'utilisateur avec le nouveau rôle

rejectRoleRequest(approvalId, rejecterId, reason)
  // Rejette la demande

getHierarchyLevel(role)
  // Retourne 1-5 selon le rôle (admin=1, utilisateur=3, consultant=4, viewer=5)

canGrantPermissions(role)
  // Retourne true pour admin, super_utilisateur, super_consultant
```

**Fichier Créé:** `cascade/src/services/approvalProcessingService.js` (224 lignes)

---

### 3️⃣ **approvalsController.js** - Migration vers pending_role_approvals

**Problèmes Corrigés:**
- ❌ Utilisait `pending_approvals` (ancienne table)
- ❌ N'escaladait jamais le rôle après approbation
- ❌ Permissions trop restrictives (admin only)

**Modifications:**

#### a) Mise à jour des imports
```javascript
import ApprovalProcessingService from '../services/approvalProcessingService.js';
const PendingRoleApproval = sequelize.models.PendingRoleApproval;
```

#### b) getStats() - Utilise PendingRoleApproval
```javascript
// Avant: sequelize.query(...pending_approvals)
// Après: PendingRoleApproval.count({where: {status}})
```

#### c) getPendingApprovals() - Utilise PendingRoleApproval avec ORM
```javascript
const approvals = await PendingRoleApproval.findAll({
  where: { status },
  attributes: ['id', 'email', 'prenom', 'nom', 'username', 'role', 'approver_role', 'status', ...],
  order: [[sortColumn, sortOrder]],
  limit, offset
});
```

#### d) approveApproval() - Utilise ApprovalProcessingService
```javascript
// Avant: Mettait à jour seulement pending_approvals.status
// Après: Utilise ApprovalProcessingService qui:
//        1. Crée l'utilisateur ou escalade le rôle
//        2. Met à jour hierarchy_level et can_grant_permissions
//        3. Retourne userId et rôle approuvé

const result = await ApprovalProcessingService.approveRoleRequest(id, userId, notes);
// result.success = true
// result.userId = 5
// result.role = 'consultant'
```

#### e) rejectApproval() - Utilise ApprovalProcessingService
```javascript
const result = await ApprovalProcessingService.rejectRoleRequest(id, userId, reason);
```

#### f) Permissions élargies
```javascript
// Avant: if (req.user?.role !== 'admin')
// Après: if (req.user?.role !== 'admin' && req.user?.role !== 'super_utilisateur')
```

**Fichier Modifié:** `cascade/src/controllers/approvalsController.js`

---

## 🔄 Workflow Complet Après Corrections

```
1. INSCRIPTION (auth/register)
   ├─ Utilisateur soumet: email, username, password, role='consultant'
   ├─ RoleApprovalService.createApprovalRequest()
   │  └─ Crée PendingRoleApproval (pas de User encore)
   └─ Réponse: {requiresApproval: true, requestId: 123}

2. ATTENTE D'APPROBATION
   ├─ Admin/Super-Utilisateur accède /admin/approvals/pending
   ├─ Voit la demande avec email, prénom, nom, rôle demandé
   └─ Clique sur "Approuver"

3. APPROBATION (POST /admin/approvals/:id/approve)
   ├─ ApprovalProcessingService.approveRoleRequest()
   │  ├─ Récupère PendingRoleApproval
   │  ├─ Crée User avec role='consultant' (ou escalade si existe)
   │  ├─ Assigne hierarchy_level=4, can_grant_permissions=false
   │  ├─ Sauvegarde les champs: siret, specialites, tarif_horaire, experience_years
   │  └─ Met à jour PendingRoleApproval.status='approved'
   └─ Réponse: {userId: 5, email, role: 'consultant'}

4. CONNEXION (auth/login)
   ├─ Utilisateur se connecte avec email/password
   ├─ JWT généré avec role='consultant'
   └─ Accès contrôlé par role dans les endpoints
```

---

## 🧪 Test des Modifications

Un script de test a été créé pour valider le workflow complet:

```bash
cd cascade
node test-approval-workflow.js
```

**Tests inclus:**
1. ✅ Login admin
2. ✅ Register consultant avec role spécifié
3. ✅ Get pending approvals
4. ✅ Approve request → création user + escalade rôle
5. ✅ Role escalation verification → login nouveau user

---

## 🚀 Points Clés de Cohérence

### Alignement avec la Migration Consultant (100%)
- ✅ Utilise les 9 colonnes ajoutées: siret, specialites, tarif_horaire, experience_years, hierarchy_level, can_grant_permissions, prenom, nom, telephone
- ✅ Respect des 7 rôles: admin, super_utilisateur, utilisateur, super_consultant, consultant, viewer, accountant
- ✅ Utilise pending_role_approvals (nouvelle table)

### Cohérence avec RoleApprovalService
- ✅ RoleApprovalService crée PendingRoleApproval (correct ✓)
- ✅ ApprovalProcessingService traite l'approbation et crée l'User
- ✅ Flux hiérarchique respecté: admin approuve super_utilisateur, super_utilisateur approuve consultant/utilisateur

### Sécurité
- ✅ Permissions élargies (admin ET super_utilisateur peuvent approuver)
- ✅ Rôle n'est assigné QUE après approbation
- ✅ User inactive jusqu'à approbation

### Non-Destructif
- ✅ Ancien code dans approvalsController commenté/remplacé (pas supprimé)
- ✅ Nouveau service complètement indépendant
- ✅ Aucune modification de schéma MySQL nécessaire

---

## ⚠️ Points à Valider Post-Déploiement

1. **Frontend**: Ajouter sélecteur de rôle à RegisterPage
2. **Email**: Vérifier que les notifications d'approbation sont envoyées
3. **Audit**: Vérifier que les logs d'approbation sont enregistrés correctement
4. **Permissions**: Tester que les endpoints respectent la hiérarchie des rôles

---

## 📊 Récapitulatif

| Élément | Avant | Après |
|---------|-------|-------|
| **Rôle à l'inscription** | Toujours 'utilisateur' | Rôle demandé respecté |
| **Champs consultant** | Perdus | Sauvegardés |
| **Escalade rôle** | ❌ Jamais | ✅ Automatique après approbation |
| **Table utilisée** | pending_approvals | pending_role_approvals |
| **Service dédié** | ❌ Non | ✅ ApprovalProcessingService |
| **Permissions** | Admin only | Admin + Super-Utilisateur |
| **User creation** | Immédiate (sans validation) | Après approbation |

---

## ✅ Status: PRÊT POUR TEST
