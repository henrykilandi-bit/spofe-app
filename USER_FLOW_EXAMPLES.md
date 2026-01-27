# SPOFE User Registration Flow - Complete Examples

This document provides complete, real-world examples of how the Super Utilisateur par Groupe system works.

---

## Scenario 1: Self-Registration (Feature Flag OFF)

**Prerequisite**: `FEATURE_SUPER_USER_APPROVAL=false` in `.env`

### User Journey

```
User John Dupont
├─ Visits http://localhost:5173/login
├─ Clicks "Créer un compte" link
├─ Fills registration form:
│  ├─ Email: john.dupont@example.com
│  ├─ Username: jdupont
│  ├─ Password: SecurePass123!
│  ├─ Prenom: John
│  └─ Nom: Dupont
├─ System creates user immediately
├─ User redirected to login page
├─ User logs in with email + password
└─ ✅ User can access dashboard
```

### API Calls

```bash
# 1. Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.dupont@example.com",
    "username": "jdupont",
    "password": "SecurePass123!",
    "prenom": "John",
    "nom": "Dupont"
  }'

# Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 42,
      "email": "john.dupont@example.com",
      "username": "jdupont",
      "prenom": "John",
      "nom": "Dupont"
    },
    "requiresApproval": false,
    "message": "Inscription réussie. Vous pouvez maintenant vous connecter."
  }
}

# 2. User logs in
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.dupont@example.com",
    "password": "SecurePass123!"
  }'

# Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

# 3. ✅ User can now access protected endpoints
curl -X GET http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Frontend Example

```jsx
// RegisterPage automatically handles this
const handleRegister = async (formData) => {
  const response = await axios.post(
    'http://localhost:3001/api/auth/register',
    formData
  );

  if (response.data.data.requiresApproval === false) {
    // No approval needed, redirect to login
    navigate('/login', {
      state: {
        message: 'Inscription réussie! Vous pouvez maintenant vous connecter.',
        type: 'success',
        email: formData.email
      }
    });
  }
};
```

---

## Scenario 2: Group-Based Registration with Approval

**Prerequisite**: `FEATURE_SUPER_USER_APPROVAL=true` in `.env`

### User Journey

```
User Marie Dupont
├─ Visits http://localhost:5173/login
├─ Clicks "Créer un compte"
├─ Registers (same as Scenario 1)
├─ System creates PENDING APPROVAL entry
├─ Redirected with message: "En attente d'approbation"
├─ Email notification sent to super user
│
Super User (Admin of Group)
├─ Receives notification: "New registration waiting approval"
├─ Logs in to admin dashboard
├─ Views pending approvals: 1 (Marie Dupont)
├─ Clicks "Approve" button
├─ System updates approval status
├─ Email sent to Marie: "Your registration is approved!"
│
User Marie (After Approval)
├─ Visits http://localhost:5173/login
├─ Tries to login with credentials
├─ ✅ Login succeeds (approval was granted)
└─ Can now access dashboard
```

### Database State Changes

**After Registration (Before Approval)**:

```sql
-- User created, marked as user (not active in group yet)
SELECT * FROM users WHERE email='marie.dupont@example.com';
-- Result: id=43, role='user', isActive=true

-- Pending approval created
SELECT * FROM pending_approvals WHERE user_id=43;
-- Result: id=1, user_id=43, groupe_id=1, status='pending', 
--         created_at='2026-01-24 10:00:00', approved_by=null
```

**After Super User Approves**:

```sql
-- Same user, no change
SELECT * FROM users WHERE id=43;
-- Result: unchanged

-- Approval updated
SELECT * FROM pending_approvals WHERE id=1;
-- Result: status='approved', approved_by=2 (super user),
--         approved_at='2026-01-24 10:15:00'
```

### API Calls - Super User Workflow

```bash
# 1. Super user logs in
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@group1.com",
    "password": "AdminPassword123!"
  }'

# Response: token received
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Super user gets pending approvals for their group
curl -X GET "http://localhost:3001/api/admin/groups/1/pending-approvals?status=pending" \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "success": true,
  "data": {
    "approvals": [
      {
        "id": 1,
        "user_id": 43,
        "groupe_id": 1,
        "status": "pending",
        "user": {
          "id": 43,
          "email": "marie.dupont@example.com",
          "username": "mdupont",
          "prenom": "Marie",
          "nom": "Dupont"
        },
        "createdAt": "2026-01-24T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 50,
      "offset": 0
    }
  }
}

# 3. Super user approves Marie's registration
curl -X POST http://localhost:3001/api/admin/pending-approvals/1/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Response:
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 43,
    "groupe_id": 1,
    "status": "approved",
    "approved_by": 2,
    "approved_at": "2026-01-24T10:15:00.000Z"
  },
  "message": "Inscription approuvée"
}

# 4. Check approval statistics
curl -X GET http://localhost:3001/api/admin/groups/1/approval-stats \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "success": true,
  "data": {
    "total": 1,
    "pending": 0,
    "approved": 1,
    "rejected": 0,
    "approvalRate": "100.00"
  }
}
```

### Email Notifications (MVP - Console Output)

```
=============================================================
NOTIFICATION D'APPROBATION
=============================================================
À: marie.dupont@example.com
Groupe: Groupe Comptabilité Sud
Approuvé par: admin_group1
Lien d'accès: http://localhost:5173/dashboard
=============================================================
```

---

## Scenario 3: Admin Invites User

**Super User (or Central Admin) invites new user via email**

### User Journey

```
Super User (Jean Martin)
├─ Has admin dashboard access
├─ Clicks "Inviter nouvel utilisateur"
├─ Enters email: sophie.bernard@company.com
├─ Clicks "Envoyer invitation"
├─ System sends invitation link
│
New User (Sophie Bernard) - receives email
├─ Clicks link in email: 
│  └─ http://localhost:5173/accept-invitation?token=xxx&email=sophie...
├─ Redirected to registration page
├─ Fills: password, prenom, nom
├─ Clicks "Accepter invitation"
├─ Account activated
├─ Redirected to login
│
Sophie
├─ Logs in with email + password
└─ ✅ Can access dashboard
```

### API Calls - Invitation Flow

```bash
# 1. Super user sends invitation
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/auth/invite-user \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sophie.bernard@company.com",
    "groupeId": 1
  }'

# Response:
{
  "success": true,
  "data": {
    "existingUser": false,
    "userId": 44,
    "message": "Invitation envoyée à sophie.bernard@company.com"
  }
}

# 2. Email received (MVP - console logs):
=============================================================
EMAIL D'INVITATION
=============================================================
À: sophie.bernard@company.com
Lien d'invitation: http://localhost:5173/accept-invitation?token=abcd1234...&email=sophie.bernard@company.com
Expire dans: 7 jours
=============================================================

# 3. Sophie accepts invitation (via UI form)
# Or via API directly:
curl -X POST http://localhost:3001/api/auth/accept-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sophie.bernard@company.com",
    "token": "abcd1234...",
    "password": "SecurePass456!",
    "prenom": "Sophie",
    "nom": "Bernard"
  }'

# Response:
{
  "success": true,
  "data": {
    "userId": 44,
    "message": "Bienvenue! Votre compte est maintenant actif."
  }
}

# 4. Sophie logs in
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sophie.bernard@company.com",
    "password": "SecurePass456!"
  }'

# ✅ Login successful
```

---

## Scenario 4: Rejection Flow

**Super User rejects a registration**

### User Journey

```
New User (Thomas Durand) registers
├─ System creates pending approval
│
Super User (Jean Martin)
├─ Reviews pending approvals
├─ Sees "Thomas Durand - thomas.durand@example.com"
├─ Clicks "Rejeter"
├─ Enters reason: "Email domain not approved"
├─ Clicks confirm
│
System
├─ Updates approval status to "rejected"
├─ Sends email to Thomas: "Registration rejected"
│
Thomas
├─ Receives email: "Your registration was rejected"
├─ Reason: "Email domain not approved"
├─ Contact info: support@spofe.com
└─ Can try registering with different email
```

### API Calls - Rejection

```bash
# Super user rejects application
TOKEN="superuser_token..."

curl -X POST http://localhost:3001/api/admin/pending-approvals/2/reject \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rejectionReason": "Email domain not approved"
  }'

# Response:
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 45,
    "groupe_id": 1,
    "status": "rejected",
    "rejection_reason": "Email domain not approved",
    "approved_by": 2,
    "approved_at": "2026-01-24T10:30:00.000Z"
  },
  "message": "Inscription rejetée"
}

# Email sent to rejected user (MVP - console):
=============================================================
NOTIFICATION DE REJET
=============================================================
À: thomas.durand@example.com
Groupe: Groupe Comptabilité Sud
Raison du rejet: Email domain not approved
Rejeté par: jean_martin
Contact: support@spofe.com
=============================================================
```

---

## Scenario 5: Admin Dashboard - Approval Management

**Central admin (super_admin) manages all super users**

### Admin View

```
Admin Dashboard
├─ Groups Section
│  ├─ Groupe 1 "Sud"
│  │  ├─ Super Users: 2
│  │  │  ├─ Jean Martin (jean@group.com)
│  │  │  └─ Marie Dupont (marie@group.com)
│  │  ├─ Pending Approvals: 3
│  │  ├─ Total Registered: 45
│  │  └─ Approval Rate: 92%
│  │
│  └─ Groupe 2 "Nord"
│     ├─ Super Users: 1
│     │  └─ Claude Bernard (claude@group.com)
│     ├─ Pending Approvals: 0
│     ├─ Total Registered: 28
│     └─ Approval Rate: 100%
│
├─ Actions
│  ├─ Assign Super User
│  ├─ Remove Super User
│  ├─ View Pending Approvals
│  └─ Export Statistics
```

### API Calls - Admin Operations

```bash
# Admin token
ADMIN_TOKEN="admin_token..."

# 1. List super users for group
curl -X GET http://localhost:3001/api/admin/groups/1/super-users \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "groupe_id": 1,
      "user_id": 2,
      "assigned_by": 1,
      "createdAt": "2026-01-20T09:00:00.000Z",
      "superUser": {
        "id": 2,
        "username": "jmartin",
        "email": "jean.martin@group.com",
        "prenom": "Jean",
        "nom": "Martin"
      }
    },
    {
      "id": 2,
      "groupe_id": 1,
      "user_id": 5,
      "assigned_by": 1,
      "createdAt": "2026-01-22T14:30:00.000Z",
      "superUser": {
        "id": 5,
        "username": "mdupont",
        "email": "marie.dupont@group.com",
        "prenom": "Marie",
        "nom": "Dupont"
      }
    }
  ]
}

# 2. Assign new super user to group
curl -X POST http://localhost:3001/api/admin/groups/1/super-users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 10
  }'

# Response:
{
  "success": true,
  "data": {
    "id": 3,
    "groupe_id": 1,
    "user_id": 10,
    "assigned_by": 1,
    "createdAt": "2026-01-24T11:00:00.000Z"
  },
  "message": "Super-utilisateur assigné"
}

# 3. Remove super user
curl -X DELETE http://localhost:3001/api/admin/groups/1/super-users/5 \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "groupeId": 1,
    "userId": 5
  },
  "message": "Super-utilisateur supprimé"
}

# 4. Get detailed approval statistics
curl -X GET http://localhost:3001/api/admin/groups/1/approval-stats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
{
  "success": true,
  "data": {
    "total": 50,
    "pending": 3,
    "approved": 45,
    "rejected": 2,
    "approvalRate": "90.00"
  }
}
```

---

## Scenario 6: Frontend Integration - useRegister Hook

```jsx
// Component using useRegister hook
import { useRegister } from '../hooks/useRegister';

export const MyRegistrationComponent = () => {
  const {
    register,
    checkEmailAvailability,
    loading,
    errors,
    success
  } = useRegister();

  const handleRegister = async (formData) => {
    const result = await register(formData);
    
    if (result.success) {
      // Show success message
      alert(result.message);
      // Redirect to login
      navigate('/login');
    } else {
      // Show errors
      console.error(result.errors);
    }
  };

  const handleEmailChange = async (email) => {
    const available = await checkEmailAvailability(email);
    // Update UI based on availability
  };

  return (
    <form onSubmit={handleRegister}>
      {/* Form fields */}
    </form>
  );
};
```

---

## Scenario 7: Frontend Integration - useGroupApprovals Hook

```jsx
// Component using useGroupApprovals hook
import { useGroupApprovals } from '../hooks/useGroupApprovals';

export const ApprovalsPage = ({ groupeId }) => {
  const authToken = localStorage.getItem('token');
  
  const {
    approvals,
    stats,
    loading,
    fetchPendingApprovals,
    approveApproval,
    rejectApproval
  } = useGroupApprovals(groupeId, authToken);

  useEffect(() => {
    // Data auto-loads on component mount
  }, []);

  const handleApprove = async (approvalId) => {
    const result = await approveApproval(approvalId);
    if (result.success) {
      // Show success message
      alert('Approval sent!');
      // List automatically updated
    }
  };

  const handleReject = async (approvalId, reason) => {
    const result = await rejectApproval(approvalId, reason);
    if (result.success) {
      // Show success message
      alert('Registration rejected');
    }
  };

  return (
    <div>
      <h2>Pending Approvals ({stats?.pending})</h2>
      {approvals.map(approval => (
        <div key={approval.id}>
          <p>{approval.user.email}</p>
          <button onClick={() => handleApprove(approval.id)}>Approve</button>
          <button onClick={() => handleReject(approval.id, 'Not approved')}>Reject</button>
        </div>
      ))}
    </div>
  );
};
```

---

## Feature Flag Behavior

### With `FEATURE_SUPER_USER_APPROVAL=false`

```
User Registration
├─ No approval required
├─ User created with role='user'
├─ Can login immediately
└─ No pending approvals created
```

### With `FEATURE_SUPER_USER_APPROVAL=true`

```
User Registration
├─ Approval required (if groupeId provided)
├─ User created with role='user'
├─ Pending approval created
├─ Status: 'pending'
├─ Super user notified
├─ User receives status message
├─ Can login AFTER approval
└─ Email notification on approval/rejection
```

---

## Error Scenarios

### Invalid Email
```json
{
  "success": false,
  "errors": ["Email invalide"],
  "message": "Données invalides"
}
```

### Email Already Exists
```json
{
  "success": false,
  "errors": ["Cet email est déjà utilisé"],
  "message": "Inscription invalide"
}
```

### Weak Password
```json
{
  "success": false,
  "errors": ["Mot de passe minimum 8 caractères"],
  "message": "Inscription invalide"
}
```

### Invalid Invitation Token
```json
{
  "success": false,
  "errors": ["Token d'invitation invalide ou expiré"],
  "message": "Erreur lors de l'acceptation de l'invitation"
}
```

### Insufficient Permissions
```json
{
  "success": false,
  "message": "Accès refusé",
  "statusCode": 403
}
```

---

## Testing Checklist

- [ ] Register user without group → can login immediately
- [ ] Register user with group → requires approval
- [ ] Super user approves registration → user can login
- [ ] Super user rejects registration → user gets notification
- [ ] Admin invites user → receives email
- [ ] User accepts invitation → account activated
- [ ] Email availability check works → prevents duplicates
- [ ] Feature flag toggle → approval flow changes

---

*Complete User Flow Examples - SPOFE Super Utilisateur par Groupe*  
*Version: 1.0 | Date: January 24, 2026*
