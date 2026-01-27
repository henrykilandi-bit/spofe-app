# 📊 SPOFE Super Utilisateur par Groupe - System Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SPOFE v2.1 Architecture                          │
└─────────────────────────────────────────────────────────────────────────┘

                              FRONTEND (Vite + React)
                              ├── LoginPage (existing) ✅
                              │   └── Register Link
                              │       ↓
                              └── RegisterPage (NEW) ✅
                                  ├─ useRegister hook
                                  └─ Form validation + submission
                              
                                        ↓ HTTP Requests ↓
                              
                              BACKEND (Express.js)
                              
    ┌──────────────────────────────────────────────────────────────┐
    │                      Routes (Express)                         │
    ├──────────────────────────────────────────────────────────────┤
    │                                                                │
    │  POST   /api/auth/register              [NEW] ✅             │
    │  POST   /api/auth/accept-invitation     [NEW] ✅             │
    │  GET    /api/auth/check-email           [NEW] ✅             │
    │  POST   /api/auth/invite-user           [NEW] ✅             │
    │                                                                │
    │  GET    /api/admin/groups/:id/pending   [NEW] ✅             │
    │  POST   /api/admin/.../approve          [NEW] ✅             │
    │  POST   /api/admin/.../reject           [NEW] ✅             │
    │  GET    /api/admin/.../approval-stats   [NEW] ✅             │
    │  POST   /api/admin/.../super-users      [NEW] ✅             │
    │  GET    /api/admin/.../super-users      [NEW] ✅             │
    │  DELETE /api/admin/.../super-users/:id  [NEW] ✅             │
    │                                                                │
    └──────────────────────────────────────────────────────────────┘
                              ↓
                    ┌─────────────────────┐
                    │   Auth Middleware   │
                    │ - JWT validation    │
                    │ - Token checking    │
                    └─────────────────────┘
                              ↓
                    ┌─────────────────────────────┐
                    │ Permission Middleware [NEW] │
                    │ - isGroupSuperUser()        │
                    │ - isGroupAdminOrSuperUser() │
                    │ - isCentralAdmin()          │
                    └─────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────────────┐
    │                      Services (Business Logic)               │
    ├──────────────────────────────────────────────────────────────┤
    │                                                                │
    │  GroupApprovalService [NEW] ✅                               │
    │  ├─ createPendingApproval()                                  │
    │  ├─ getPendingApprovalsForGroup()                            │
    │  ├─ approveApproval() → notify via email                     │
    │  ├─ rejectApproval() → notify via email                      │
    │  ├─ countPendingForGroup()                                   │
    │  └─ getApprovalStats()                                       │
    │                                                                │
    │  UserInvitationService [NEW] ✅                              │
    │  ├─ registerUser()                                           │
    │  ├─ inviteUserByEmail()                                      │
    │  ├─ acceptInvitation()                                       │
    │  └─ validateRegistrationData()                               │
    │                                                                │
    │  EmailService [NEW] ✅                                       │
    │  ├─ sendInvitationEmail()                                    │
    │  ├─ sendApprovalNotification()                               │
    │  ├─ sendRejectionNotification()                              │
    │  └─ sendApprovalStats()                                      │
    │                                                                │
    │  FeatureFlags [NEW] ✅                                       │
    │  ├─ isFeatureEnabled('superUserGroupApproval')              │
    │  └─ isFeatureEnabledForGroup(name, groupeId)               │
    │                                                                │
    └──────────────────────────────────────────────────────────────┘
                              ↓
    ┌──────────────────────────────────────────────────────────────┐
    │                  Sequelize ORM + Models                       │
    ├──────────────────────────────────────────────────────────────┤
    │                                                                │
    │  User (existing)                                             │
    │  ├─ id, email, username, password                            │
    │  ├─ prenom, nom, role, isActive                              │
    │  └─ Associations to PendingApproval, GroupeSuperUser         │
    │                                                                │
    │  GroupeEntreprise (existing)                                 │
    │  ├─ id, nom, code, isActive                                  │
    │  ├─ super_user_id [NEW]                                      │
    │  └─ Associations to PendingApproval, GroupeSuperUser         │
    │                                                                │
    │  GroupeSuperUser [NEW] ✅                                    │
    │  ├─ id, groupe_id, user_id, assigned_by                      │
    │  ├─ Unique constraint: (groupe_id, user_id)                  │
    │  └─ Associations: User (as superUser), GroupeEntreprise      │
    │                                                                │
    │  PendingApproval [NEW] ✅                                    │
    │  ├─ id, user_id, groupe_id, company_id                       │
    │  ├─ status (pending|approved|rejected)                       │
    │  ├─ approved_by, approved_at, rejection_reason               │
    │  └─ Associations: User, GroupeEntreprise, Compagnie, User    │
    │                                                                │
    └──────────────────────────────────────────────────────────────┘
                              ↓
                      ┌───────────────┐
                      │  MySQL 8.0    │
                      │               │
                      │ Tables [NEW]:  │
                      │ - groupe_super_users
                      │ - pending_approvals
                      │ - groupes_entreprises (modified)
                      └───────────────┘
```

---

## User Registration Flow

```
SCENARIO 1: Self-Registration (Feature Flag OFF)
═════════════════════════════════════════════════

  User
    ↓
    ├─ Visits /register page
    │  │
    │  └─ Sees RegisterPage component
    │     │
    │     ├─ Real-time email validation
    │     │  └─ GET /api/auth/check-email
    │     │     └─ Email available? ✅ Show checkmark
    │     │
    │     └─ Fills form
    │        ├─ Email: john@example.com
    │        ├─ Username: jdupont
    │        ├─ Password: Secure123!
    │        ├─ Prenom: John
    │        └─ Nom: Dupont
    │
    ├─ Submits form
    │  │
    │  └─ POST /api/auth/register
    │     │
    │     ├─ Validate input (Joi schema)
    │     │  ├─ Email format ✅
    │     │  ├─ Username length ✅
    │     │  └─ Password strength ✅
    │     │
    │     ├─ Check email uniqueness ✅
    │     │
    │     ├─ Hash password (BCrypt)
    │     │
    │     ├─ Create User in database
    │     │  └─ role='user', isActive=true
    │     │
    │     └─ Return success (no approval needed)
    │        └─ requiresApproval = false
    │
    └─ Redirect to /login
       │
       ├─ Success message: "Vous pouvez maintenant vous connecter"
       │
       └─ Login with email + password
          └─ ✅ Access dashboard


SCENARIO 2: Group-Based Registration (Feature Flag ON)
══════════════════════════════════════════════════════

  User
    ↓
    ├─ Visits /register?groupeId=1
    │  │
    │  └─ Sees RegisterPage with group context
    │
    ├─ Fills form (same as Scenario 1)
    │
    ├─ Submits form
    │  │
    │  └─ POST /api/auth/register
    │     │
    │     ├─ Create User (role='user')
    │     │
    │     └─ Create PendingApproval
    │        ├─ user_id = 42
    │        ├─ groupe_id = 1
    │        ├─ status = 'pending'
    │        └─ created_at = NOW()
    │
    └─ Redirect to /login
       │
       ├─ Message: "En attente d'approbation"
       │
       └─ Email sent to super users of groupe_id=1
          └─ "New registration pending approval: john@example.com"


APPROVAL WORKFLOW
═════════════════

  Super User (of groupe_id=1)
    ↓
    ├─ Sees notification: "1 pending approval"
    │
    ├─ Views pending approvals dashboard [Phase 2]
    │  │
    │  ├─ GET /api/admin/groups/1/pending-approvals
    │  │  │
    │  │  └─ Returns pending list:
    │  │     └─ [{ id: 1, user: John Dupont, ... }]
    │  │
    │  └─ Sees: John Dupont (john@example.com)
    │     │
    │     ├─ [Approve] button
    │     │  │
    │     │  └─ POST /api/admin/pending-approvals/1/approve
    │     │     │
    │     │     ├─ Verify super user of groupe ✅
    │     │     │
    │     │     ├─ Update PendingApproval
    │     │     │  ├─ status = 'approved'
    │     │     │  ├─ approved_by = 5 (super user id)
    │     │     │  └─ approved_at = NOW()
    │     │     │
    │     │     ├─ Email John:
    │     │     │  └─ "Your registration is approved!"
    │     │     │
    │     │     └─ Return success
    │     │
    │     └─ [Reject] button
    │        │
    │        └─ POST /api/admin/pending-approvals/1/reject
    │           │
    │           ├─ Enter reason: "Email domain not approved"
    │           │
    │           ├─ Update PendingApproval
    │           │  ├─ status = 'rejected'
    │           │  └─ rejection_reason = "Email domain not approved"
    │           │
    │           ├─ Email John:
    │           │  └─ "Your registration was rejected"
    │           │     └─ "Reason: Email domain not approved"
    │           │
    │           └─ Return success
    │
    └─ View stats
       │
       └─ GET /api/admin/groups/1/approval-stats
          │
          └─ Returns:
             ├─ total: 50
             ├─ pending: 2
             ├─ approved: 45
             ├─ rejected: 3
             └─ approvalRate: 90%


INVITATION WORKFLOW
═══════════════════

  Super User (or Admin)
    ↓
    ├─ Invite user by email
    │  │
    │  └─ POST /api/auth/invite-user
    │     │
    │     ├─ body: { email: "sophie@example.com", groupeId: 1 }
    │     │
    │     ├─ Check if user exists
    │     │  │
    │     │  ├─ If YES (existing user):
    │     │  │  └─ Create PendingApproval directly
    │     │  │
    │     │  └─ If NO (new user):
    │     │     │
    │     │     ├─ Create User
    │     │     │  ├─ role = 'user_invited'
    │     │     │  ├─ isActive = false
    │     │     │  ├─ invitationToken = crypto.randomBytes(32)
    │     │     │  └─ invitationTokenExpiry = NOW + 7 days
    │     │     │
    │     │     └─ Send invitation email
    │     │        └─ Link: /accept-invitation?token=xxx&email=sophie...
    │     │
    │     └─ Return success
    │
    └─ Sophie receives email
       │
       ├─ Clicks invitation link
       │  └─ /accept-invitation?token=xxx&email=sophie...
       │
       ├─ Sees activation form
       │  ├─ Password field
       │  ├─ Prenom field
       │  └─ Nom field
       │
       ├─ Fills form
       │
       ├─ Submits
       │  │
       │  └─ POST /api/auth/accept-invitation
       │     │
       │     ├─ Verify token is valid
       │     │
       │     ├─ Verify token not expired
       │     │
       │     ├─ Update User
       │     │  ├─ password = hash(input)
       │     │  ├─ prenom = 'Sophie'
       │     │  ├─ nom = 'Bernard'
       │     │  ├─ role = 'user'
       │     │  ├─ isActive = true
       │     │  ├─ invitationToken = null
       │     │  └─ invitationTokenExpiry = null
       │     │
       │     └─ Return success
       │
       └─ Redirect to /login
          └─ Can now login with email + password
```

---

## Feature Flag Logic

```
┌─────────────────────────────────────────────────────────┐
│          FEATURE FLAG: superUserGroupApproval           │
└─────────────────────────────────────────────────────────┘

FEATURE_SUPER_USER_APPROVAL=false (DEFAULT)
════════════════════════════════════════════

User Registration Flow:
┌─────────────────────┐
│  Create User        │
│  requiresApproval:  │ ──→ Login immediately ✅
│  FALSE              │
└─────────────────────┘

Behavior:
├─ No pending approvals created
├─ No emails to super users
├─ User can login immediately
└─ RegisterPage works but doesn't ask for group


FEATURE_SUPER_USER_APPROVAL=true
═════════════════════════════════

User Registration Flow (without group):
┌─────────────────────┐
│  Create User        │
│  requiresApproval:  │ ──→ Login immediately ✅
│  FALSE              │
└─────────────────────┘

User Registration Flow (with groupeId):
┌───────────────────────────┐
│  Create User              │
│  Create PendingApproval   │
│  requiresApproval: TRUE   │ ──→ Wait for approval ⏳
│  Send email to super user │
└───────────────────────────┘

Behavior:
├─ PendingApproval created for group
├─ Super user notified
├─ User cannot login yet
├─ Super user must approve/reject
└─ After approval: user can login
```

---

## Database Schema (Simplified)

```
users
┌────────────────┐
│ id (PK)        │
│ email (UNIQUE) │
│ username       │
│ password       │
│ prenom         │
│ nom            │
│ role           │
│ isActive       │
└────────────────┘
        ↑
        ├─ (1 to N) ─→ groupe_super_users
        │                └─ user_id (FK)
        │
        └─ (1 to N) ─→ pending_approvals
                         ├─ user_id (FK)
                         └─ approved_by (FK)


groupes_entreprises
┌────────────────┐
│ id (PK)        │
│ nom            │
│ code           │
│ super_user_id  │ [NEW - nullable]
│ isActive       │
└────────────────┘
        ↓
        ├─ (1 to N) ─→ groupe_super_users [NEW]
        │
        └─ (1 to N) ─→ pending_approvals [NEW]


groupe_super_users [NEW TABLE]
┌──────────────────────┐
│ id (PK)              │
│ groupe_id (FK)       │
│ user_id (FK)         │
│ assigned_by (FK)     │
│ createdAt            │
│ updatedAt            │
│ UNIQUE(groupe_id,    │
│    user_id)          │ ← Prevents duplicates
└──────────────────────┘


pending_approvals [NEW TABLE]
┌───────────────────────┐
│ id (PK)               │
│ user_id (FK)          │
│ groupe_id (FK)        │
│ company_id (FK)       │
│ status (ENUM)         │ ← pending|approved|rejected
│ rejection_reason      │
│ approved_by (FK)      │
│ approved_at           │
│ createdAt             │
│ updatedAt             │
│ INDEX(groupe_id,      │
│    status, createdAt) │ ← Query performance
└───────────────────────┘
```

---

## Security Permissions

```
┌─────────────────────────────────────────────────────┐
│              Permission Matrix                       │
├─────────────────────────────────────────────────────┤

                central_admin  group_super_user  user
                ─────────────  ────────────────  ────

Register              ✅             ✅            ✅
Login                 ✅             ✅            ✅
View own profile      ✅             ✅            ✅

View group            ✅             ✅*           ✅*
 *only own groups

Approve registration  ✅             ✅*           ❌
 *only own group

Reject registration   ✅             ✅*           ❌
 *only own group

Invite user           ✅             ✅*           ❌
 *to own group

Assign super user     ✅             ❌            ❌
Remove super user     ✅             ❌            ❌

View admin panel      ✅             ✅*           ❌
 *limited to own groups
```

---

## Component Relationships

```
Frontend
════════

App
├── Router
│   ├── /login → LoginPage (existing) ✅
│   │   └── Link to /register
│   │
│   └── /register → RegisterPage [NEW] ✅
│       │
│       ├── useRegister hook [NEW] ✅
│       │   ├── register()
│       │   ├── checkEmailAvailability()
│       │   └── checkRegistrationStatus()
│       │
│       └── useGroupApprovals hook [NEW] ✅ (for Phase 2)
│           ├── fetchPendingApprovals()
│           ├── approveApproval()
│           ├── rejectApproval()
│           └── assignSuperUser()


Backend
═══════

app.js
├── auth middleware
├── permission middleware
│
├── /api/auth routes [NEW]
│   ├── POST   /register
│   ├── POST   /accept-invitation
│   ├── GET    /check-email
│   ├── POST   /invite-user
│   └── Services:
│       └── UserInvitationService [NEW]
│
├── /api/admin routes [NEW]
│   ├── GET    /groups/:id/pending-approvals
│   ├── POST   /pending-approvals/:id/approve
│   ├── POST   /pending-approvals/:id/reject
│   ├── GET    /groups/:id/approval-stats
│   ├── POST   /groups/:id/super-users
│   ├── GET    /groups/:id/super-users
│   └── Services:
│       ├── GroupApprovalService [NEW]
│       └── EmailService [NEW]
```

---

## Deployment Strategy

```
┌─────────────────────────────────────────────────┐
│        Zero-Downtime Deployment Process         │
└─────────────────────────────────────────────────┘

Phase 1: Code Deployment
═════════════════════════
Deploy with FEATURE_SUPER_USER_APPROVAL=false

├─ Users cannot access /register (Feature off)
├─ New code doesn't activate
├─ Existing functionality unchanged
└─ Zero user impact ✅


Phase 2: Feature Validation
════════════════════════════
Test in staging environment

├─ Set FEATURE_SUPER_USER_APPROVAL=true
├─ Run full test suite
├─ Verify no regressions
└─ Production-ready ✅


Phase 3: Progressive Rollout
══════════════════════════════
Enable feature gradually

Week 1: Pilot groups
├─ Enable for 1-2 groups
├─ Monitor closely
└─ Gather feedback

Week 2: Expand
├─ Enable for 25% of groups
├─ Monitor metrics
└─ Fix issues

Week 3: General availability
├─ Enable for all groups
├─ Feature fully live
└─ Monitor for 1 week

Week 4+: Stable state
├─ Feature working normally
├─ Optimize if needed
└─ Plan Phase 2


Emergency Rollback (< 5 minutes)
═════════════════════════════════
If issues found:

1. Set FEATURE_SUPER_USER_APPROVAL=false
2. Verify feature is off
3. No user impact
4. Investigate issue
5. Fix code
6. Re-enable when ready
```

---

## What's New vs Existing

```
EXISTING (Unchanged)
════════════════════
├── LoginPage.jsx          (only: added register link)
├── User model
├── Auth middleware
├── JWT authentication
├── Existing routes
├── Dashboard
├── Other features
└── All working as before ✅


NEW [14 Files Created]
═══════════════════════
Backend:
├── Models:
│   ├── GroupeSuperUser.js
│   └── PendingApproval.js
│
├── Services:
│   ├── GroupApprovalService.js
│   ├── UserInvitationService.js
│   └── EmailService.js
│
├── Middleware:
│   └── groupPermissions.middleware.js
│
├── Config:
│   └── featureFlags.js
│
├── Routes:
│   ├── groupeApprovals.routes.js
│   └── auth.registration.routes.js
│
└── Database:
    └── 001-groupe-super-users.js (migration)

Frontend:
├── Pages:
│   ├── RegisterPage.jsx
│   └── RegisterPage.css
│
└── Hooks:
    ├── useRegister.js
    └── useGroupApprovals.js


MODIFIED [4 Files Touched]
═══════════════════════════
├── LoginPage.jsx          (added register link)
├── LoginPage.css          (added footer styling)
├── NotificationCenter.jsx (auth check)
└── useNotifications.js    (token validation)
```

---

*Architecture & Flow Diagram*  
*SPOFE Super Utilisateur par Groupe*  
*January 24, 2026*  
*Version: 1.0*
