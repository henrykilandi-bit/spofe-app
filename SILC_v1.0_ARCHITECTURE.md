# 🏗️ SILC v1.0 — ARCHITECTURE DIAGRAM

## Flux de données SILC v1.0

```
┌─────────────────────────────────────────────────────────────────────┐
│                     SILC v1.0 DATA FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

                                                                          
    LAYER 1: DATABASE                                                    
    ═════════════════                                                   
         
         ┌──────────────────┐                                           
         │  MySQL/XAMPP     │                                           
         │  ───────────────│                                            
         │  Tables:        │                                            
         │  - utilisateurs │  (snake_case, pluriel)                     
         │  - compagnies   │  ✅ Vérité structurelle                   
         │  - roles        │                                            
         │  - etc.         │                                            
         └────────┬─────────┘                                           
                  │                                                     
                  │ Instance Sequelize (snake_case)                     
                  │ { id, user_id, company_id, created_at, ... }       
                  │                                                     
                  ▼                                                     
    ┌──────────────────────────────────────────────────────────┐       
    │                                                          │       
    │           LAYER 2: BACKEND TRANSFORMATION               │       
    │           ════════════════════════════════               │       
    │                                                          │       
    │  ┌──────────────┐     ┌──────────────┐                  │       
    │  │ Controller   │────▶│  Service     │                  │       
    │  │              │     │              │                  │       
    │  │ @POST /users │     │ - business   │                  │       
    │  │              │     │ - validation │                  │       
    │  └──────┬───────┘     └──────┬───────┘                  │       
    │         │                    │                          │       
    │         │                    │                          │       
    │         │          ┌─────────▼────────┐                │       
    │         │          │    Sequelize     │                │       
    │         │          │    Model         │                │       
    │         │          │                  │                │       
    │         │          │ User.findByPk(1)│                │       
    │         │          └─────────┬────────┘                │       
    │         │                    │                          │       
    │         │                    │ Sequelize Instance       │       
    │         │                    │ { id: 1,                │       
    │         │                    │   user_id: 5,           │       
    │         │                    │   company_id: 2, ... }  │       
    │         │                    │                          │       
    │         └────────────────────▼──────────┐              │       
    │                                         │              │       
    │                   ┌─────────────────────▼──┐           │       
    │                   │  DTO TRANSFORMATION   │           │       
    │                   │  ═══════════════════  │           │       
    │                   │                       │           │       
    │                   │  userDto(seqInstance) │           │       
    │                   │                       │           │       
    │                   │  Input:  snake_case  │           │       
    │                   │  { id, user_id,     │           │       
    │                   │    company_id, ... } │           │       
    │                   │                       │           │       
    │                   │  Output: camelCase   │           │       
    │                   │  { id, userId,      │           │       
    │                   │    companyId, ... } │           │       
    │                   └──────────────────────┘           │       
    │                                                         │       
    │                    🔒 SECURITY FILTERING:              │       
    │                       - NO passwords                   │       
    │                       - NO tokens                      │       
    │                       - NO secrets                     │       
    │                                                         │       
    │  ┌──────────────────────────────────────────┐          │       
    │  │   API RESPONSE (STANDARD FORMAT)         │          │       
    │  │                                          │          │       
    │  │  {                                       │          │       
    │  │    "success": true,                      │          │       
    │  │    "data": {                             │          │       
    │  │      "id": 1,                            │          │       
    │  │      "username": "admin",                │          │       
    │  │      "email": "admin@spofe.local",       │          │       
    │  │      "companyId": 2,      ← camelCase  │          │       
    │  │      "roleId": 1,         ← camelCase  │          │       
    │  │      "isActive": true,                  │          │       
    │  │      "createdAt": "ISO-8601",           │          │       
    │  │      "updatedAt": "ISO-8601"            │          │       
    │  │    },                                    │          │       
    │  │    \"meta\": {                           │          │       
    │  │      \"timestamp\": \"ISO-8601\"         │          │       
    │  │    }                                     │          │       
    │  │  }                                       │          │       
    │  └──────────────────────────────────────────┘          │       
    │                                                         │       
    └─────────────────────────┬──────────────────────────────┘       
                              │                                       
                              │ HTTP Response (JSON)                  
                              │ camelCase + Standard format            
                              │                                       
                              ▼                                       
    ┌──────────────────────────────────────────────────────────┐      
    │                                                          │      
    │         LAYER 3: FRONTEND CONSUMPTION                   │      
    │         ════════════════════════════                    │      
    │                                                          │      
    │  ┌──────────────────────────────────────────┐           │      
    │  │  React Component                         │           │      
    │  │                                          │           │      
    │  │  // 1. Fetch API                         │           │      
    │  │  const response = await fetch(            │           │      
    │  │    '/api/users/1'                        │           │      
    │  │  ).then(r => r.json())                   │           │      
    │  │                                          │           │      
    │  │  // 2. Map API to State                  │           │      
    │  │  const user = mapUser(response.data)    │           │      
    │  │                                          │           │      
    │  │  // 3. Validate Structure                │           │      
    │  │  {                                       │           │      
    │  │    id, username, email,                 │           │      
    │  │    companyId,  ← camelCase ✅          │           │      
    │  │    roleId,     ← camelCase ✅          │           │      
    │  │    isActive,                            │           │      
    │  │    createdAt   ← ISO-8601 ✅           │           │      
    │  │  }                                       │           │      
    │  │                                          │           │      
    │  │  // 4. Render                            │           │      
    │  │  return <UserProfile user={user} />    │           │      
    │  │                                          │           │      
    │  └──────────────────────────────────────────┘           │      
    │                                                          │      
    │                ✅ 100% camelCase                        │      
    │                ✅ Mapper validé                        │      
    │                ✅ Structure contractée                 │      
    │                                                          │      
    └──────────────────────────────────────────────────────────┘      

```

---

## Variantes de DTOs

```
STANDARD DTO:
└─ userDto(instance)
   ├─ Tous les champs contractés
   ├─ Utilisé pour: Detail views, Profile pages
   └─ Exemple: GET /api/users/:id

ARRAY DTO:
└─ userDtoArray(instances)
   ├─ Tableau de standard DTOs
   ├─ Utilisé pour: Collections, Listings
   └─ Exemple: GET /api/users?page=1&limit=50

MINIMAL DTO:
└─ userDtoMinimal(instance)
   ├─ Champs essentiels seulement
   ├─ Utilisé pour: Dropdowns, Quick-selection lists
   └─ Exemple: GET /api/users/dropdown

ADMIN DTO:
└─ userDtoAdmin(instance)
   ├─ Inclut champs sensibles supplémentaires
   ├─ Utilisé pour: Admin dashboard, Moderation
   └─ Exemple: GET /api/admin/users/:id
```

---

## Conformité par couche

```
DATABASE LAYER:
├─ Tables: snake_case, pluriel
├─ Colonnes: snake_case, minuscules
├─ PK: id
├─ FK: {table_singular}_id
├─ Timestamps: created_at, updated_at, deleted_at
├─ Soft delete: paranoid: true
└─ ✅ FIXE (ne pas changer)

BACKEND LAYER:
├─ Controllers: camelCase functions
├─ Services: camelCase functions
├─ Models: PascalCase classes
├─ DTOs: camelCase export functions
├─ Responses: { success, data: DTO, meta }
├─ Timestamps: ISO-8601
└─ ✅ CRITICAL (doit respecter SILC)

FRONTEND LAYER:
├─ Components: PascalCase .jsx
├─ Hooks: use{Name} format
├─ Utils: camelCase .js
├─ State: camelCase
├─ API calls: mapUser(response.data)
├─ NO snake_case: JAMAIS!
└─ ✅ REQUIRED (contrat strict)
```

---

## Cycle de vie d'une demande

```
USER ACTION
│
├─ Click button
│  └─ fetch('/api/users/1')
│
▼
FRONTEND REQUEST
│
├─ GET /api/users/1
│  Headers: { Authorization: Bearer $TOKEN }
│
▼
BACKEND CONTROLLER
│
├─ @GET /users/:id
│  ├─ Reçoit: req.params.id = 1
│  ├─ Valide input
│  └─ Appelle service
│
▼
BACKEND SERVICE
│
├─ Logique métier
│  ├─ Vérifications
│  ├─ Transformations
│  └─ Appelle model
│
▼
SEQUELIZE MODEL
│
├─ User.findByPk(1)
│  └─ Retourne instance Sequelize (snake_case)
│
▼
DTO TRANSFORMATION
│
├─ userDto(instance)
│  ├─ Input: { id, user_id, company_id, created_at, ... }
│  ├─ Transform: snake_case → camelCase
│  └─ Output: { id, companyId, createdAt, ... }
│
▼
API RESPONSE
│
├─ {
│    "success": true,
│    "data": { DTO en camelCase },
│    "meta": { timestamp: "ISO-8601" }
│  }
│
▼
FRONTEND RECEPTION
│
├─ Response arrives as JSON
│  └─ response.data = DTO camelCase
│
▼
FRONTEND MAPPER
│
├─ mapUser(response.data)
│  ├─ Valide structure
│  └─ Retourne state object
│
▼
REACT STATE
│
├─ setState(user) = DTO mappé
│
▼
COMPONENT RENDER
│
├─ <UserProfile user={user} />
│  ├─ {user.companyId}  ✅
│  ├─ {user.roleId}     ✅
│  └─ NO user.company_id ❌
│
▼
USER SEES RESULT
│
└─ Page displays correctly!
```

---

## Exemple détaillé: GET /api/users/:id

```
DATABASE QUERY:
└─ SELECT * FROM utilisateurs WHERE id = 1

SEQUELIZE RESULT:
{
  id: 1,
  username: 'admin',
  email: 'admin@spofe.local',
  company_id: 2,        ← snake_case
  role_id: 1,
  prenom: 'Admin',
  nom: 'User',
  is_active: true,
  is_locked: false,
  can_grant_permissions: false,
  hierarchy_level: 1,
  created_at: Date object,
  updated_at: Date object
}

DTO TRANSFORMATION (userDto):
{
  id: 1,
  username: 'admin',
  email: 'admin@spofe.local',
  firstName: 'Admin',
  lastName: 'User',
  companyId: 2,         ← camelCase ✅
  roleId: 1,
  isActive: true,
  isLocked: false,
  canGrantPermissions: false,
  hierarchyLevel: 1,
  createdAt: '2026-01-15T08:00:00.000Z',    ← ISO-8601
  updatedAt: '2026-01-27T10:30:00.000Z'
}

HTTP RESPONSE:
{
  "success": true,
  "data": { ... DTO above ... },
  "meta": {
    "timestamp": "2026-01-27T10:30:00.000Z"
  }
}

FRONTEND MAPPER (mapUser):
const mappedUser = {
  id: 1,
  username: 'admin',
  email: 'admin@spofe.local',
  companyId: 2,
  roleId: 1,
  isActive: true,
  firstName: 'Admin',
  lastName: 'User',
  createdAt: '2026-01-15T08:00:00.000Z',
  updatedAt: '2026-01-27T10:30:00.000Z'
}

REACT COMPONENT:
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(response => setUser(mapUser(response.data)))  ← Mapper!
      .catch(err => console.error(err));
  }, [userId]);
  
  return user ? (
    <div>
      <h1>{user.firstName} {user.lastName}</h1>      ← camelCase ✅
      <p>Email: {user.email}</p>                     ← camelCase ✅
      <p>Company: {user.companyId}</p>               ← camelCase ✅
      <p>Role: {user.roleId}</p>                     ← camelCase ✅
      <small>Created: {user.createdAt}</small>       ← ISO-8601 ✅
    </div>
  ) : <p>Loading...</p>;
}
```

---

## Hiérarchie de conformité

```
TIER 1 - CRITICAL (Must-have):
├─ ✅ Tous les DTOs retournés
├─ ✅ Format API { success, data, meta }
├─ ✅ Timestamps ISO-8601
├─ ✅ camelCase en frontend
└─ Impact: Application fonctionne

TIER 2 - IMPORTANT (Should-have):
├─ ✅ 3 variantes par DTO (standard, array, minimal)
├─ ✅ Mappers frontend
├─ ✅ Aucun snake_case exposé
└─ Impact: Stabilité, maintenabilité

TIER 3 - NICE-TO-HAVE (Could-have):
├─ ✅ Tests unitaires DTO
├─ ✅ Audit SILC score 100%
├─ ✅ Documentation mise à jour
└─ Impact: Qualité, traçabilité
```

---

## Checklist de validation SILC v1.0

```
☑️  DATABASE:
  ├─ ☑️ Tables snake_case, pluriel
  ├─ ☑️ Colonnes snake_case
  ├─ ☑️ created_at, updated_at, deleted_at
  └─ ☑️ Soft delete paranoid: true

☑️  BACKEND:
  ├─ ☑️ Tous les controllers importent DTOs
  ├─ ☑️ Tous les res.json() utilisent userDto()
  ├─ ☑️ Meta.timestamp ISO-8601 sur chaque réponse
  ├─ ☑️ Aucun .toJSON() sans DTO
  └─ ☑️ Aucune instance Sequelize brute

☑️  FRONTEND:
  ├─ ☑️ Mappers créés pour chaque entité
  ├─ ☑️ Aucun snake_case dans state
  ├─ ☑️ Aucun accès direct response.data sans mapper
  └─ ☑️ Tous les composants utilisent mappers

☑️  TESTING:
  ├─ ☑️ Tests unitaires DTO
  ├─ ☑️ Tests intégration API
  ├─ ☑️ Tests E2E avec mappers
  └─ ☑️ Audit SILC passé

☑️  DEPLOYMENT:
  ├─ ☑️ Code review OK
  ├─ ☑️ Aucune violation SILC détectée
  ├─ ☑️ Documentation mise à jour
  └─ ☑️ Équipe notifiée
```

---

*SILC v1.0 Architecture Diagram — 27 janvier 2026*
