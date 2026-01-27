# 🔐 CONTRAT INTER-COUCHES OFFICIEL SPOFE
## SPOFE INTER-LAYER CONTRACT (SILC) — v1.0

**Validité:** 27 janvier 2026 - Indéfini  
**Statut:** 🟢 OFFICIEL - Tous les développements DOIVENT respecter ce contrat  
**Conformité:** SPOFE v2.2 + MySQL 8.0 + Node.js ES6 + React  

---

## 🎯 1. OBJECTIF DU CONTRAT

Ce contrat définit la **seule et unique manière autorisée** de faire circuler les données entre les 3 couches de SPOFE:

```
📊 Base de données (MySQL / XAMPP)
   ↓ snake_case + pluriel + paranoid soft-delete
⚙️  Backend (Node.js / Express / Sequelize)
   ↓ camelCase dans les APIs
🖥️  Frontend (React / Vite)
   ↓ camelCase dans l'interface
```

### Principe clé:
```
👉 Aucune couche n'a le droit d'"interpréter" librement les données
👉 Toute transformation est EXPLICITE, CENTRALISÉE et TRAÇABLE
👉 Un champ = UN contrat = UNE définition source de vérité
```

---

## 🧱 2. PRINCIPES FONDAMENTAUX (NON NÉGOCIABLES)

### 🔒 Principe 1 — Une couche = une responsabilité

| Couche | Rôle | Autorité |
|--------|------|----------|
| **Base de données** | Vérité structurelle | Définir la forme des données |
| **Backend** | Vérité métier | Appliquer les règles métier |
| **Frontend** | Vérité de présentation | Afficher à l'utilisateur |

**Règle:** Si le backend change un champ → la DB et le frontend sont informés  
**Violation:** Un champ dans le DTO sans mapping DB = **ERREUR CRITIQUE**

---

### 🔒 Principe 2 — Une donnée n'existe que si elle est contractée

**Contrat = Autorisation d'existence**

Si un champ n'est pas documenté dans le DTO:
- ❌ Il n'existe pas officiellement
- ❌ Aucun composant React ne doit l'utiliser
- ❌ Aucun controller ne doit l'exposer
- ❌ Aucune colonne DB ne doit le contenir

**Cela élimine:**
- ✅ Les champs fantômes (orphelins)
- ✅ Les bugs silencieux
- ✅ Les divergences progressives
- ✅ Les imports cassés

---

### 🔒 Principe 3 — Le contrat prime sur le code

**Hiérarchie d'autorité:**

```
1. 📋 SILC (ce contrat) + DTOs
   ↓ PRIME SUR
2. 🗄️ Modèles Sequelize
   ↓ PRIME SUR
3. 💻 Implémentation controllers/services
   ↓ PRIME SUR
4. 🎨 Utilisation frontend
```

**Cas de conflit:**
```
SI: Code dit DTO.field = "X"
ET: Contract dit DTO.field = "Y"
→  Le code est FAUX
→  Corriger le code, JAMAIS le contrat (sans approbation)
```

---

## 🗄️ 3. CONTRAT DATABASE → BACKEND

### 3.1 Convention absolue base de données

| Élément | Règle SPOFE |
|---------|------------|
| **Noms tables** | `snake_case`, PLURIEL |
| **Colonnes** | `snake_case`, minuscules |
| **Primary Key** | `id` (INTEGER AUTO_INCREMENT) |
| **Foreign Keys** | `{table_singular}_id` (ex: `user_id`, `compagnie_id`) |
| **Timestamps** | `created_at`, `updated_at`, `deleted_at` (obligatoires) |
| **Soft delete** | `deleted_at` (NOT NULL par défaut = NULL) |
| **Max 64 chars** | Tous les noms (limite MySQL) |
| **Pas de majuscules** | Tables, colonnes, clés strictement minuscules |

**Exemples conformes:**
```sql
-- ✅ CONFORME
CREATE TABLE utilisateurs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  compagnie_id INT NOT NULL,
  role_id INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  FOREIGN KEY (compagnie_id) REFERENCES compagnies(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- ❌ NON-CONFORME
CREATE TABLE User (                      -- Majuscules
  ID INT PRIMARY KEY AUTO_INCREMENT,     -- Majuscules
  emailAddress VARCHAR(100),             -- camelCase
  Company_ID INT,                        -- Mixte
  -- Pas de timestamps
);
```

---

### 3.2 Obligation Sequelize (Modèles)

Chaque table DOIT avoir un fichier modèle correspondant:

```javascript
// ✅ CONFORME: cascade/src/models/user.model.js

const User = sequelize.define('User', {
  // Champs...
}, {
  tableName: 'utilisateurs',           // snake_case exact
  underscored: true,                    // Force camelCase → snake_case
  timestamps: true,                     // created_at, updated_at auto
  paranoid: true,                       // deleted_at soft-delete
  freezeTableName: true,                // Pas de pluralisation auto
  created_at: 'created_at',
  updated_at: 'updated_at',
  deletedAt: 'deleted_at'
});

export default User;
```

**Interdictions absolues:**
```javascript
❌ sequelize.query('SELECT * FROM user')  // Access sans modèle
❌ User.sequelize.query('...')              // Raw query sans DTO
❌ raw: true                                 // Retourner résultat brut
❌ nest: false                               // Aplatir les associations
```

---

## ⚙️ 4. CONTRAT BACKEND (CŒUR DU SYSTÈME)

### 4.1 Architecture contractuelle obligatoire

```
HTTP Request (avec validation)
        ↓
📍 Controller
   └─ Reçoit: req.body (camelCase validé)
        ↓
📍 Service (logique métier)
   └─ Appelle: model.findOne(), create(), update()
        ↓
📍 Model (Sequelize)
   └─ Retourne: instance Sequelize (snake_case)
        ↓
📍 DTO (transformation contractuelle)
   └─ Convertit: snake_case → camelCase
   └─ Filtre: champs sensibles cachés
        ↓
📍 Response (API contractée)
   └─ Retourne: { success, data: DTO, meta }
```

**Règle d'or:**
```javascript
❌ Un controller ne retourne JAMAIS un modèle Sequelize brut
✅ Un controller retourne TOUJOURS un DTO transformé
```

---

### 4.2 Le DTO — Pierre angulaire du contrat

**Définition:** Data Transfer Object = Contrat entre Backend et Frontend

**Rôle:**
- ✅ Transformation snake_case → camelCase
- ✅ Filtrage des champs sensibles (passwords, tokens, etc.)
- ✅ Mapping explicite 1:1
- ✅ Validation de structure

**Localisation obligatoire:**
```
cascade/src/dto/
├── user.dto.js
├── role.dto.js
├── compagnie.dto.js
├── journalEntry.dto.js
├── chartOfAccount.dto.js
├── groupeEntreprise.dto.js
└── index.js (export central)
```

**Structure normative d'un DTO:**

```javascript
// cascade/src/dto/user.dto.js
// 📋 Contrat strict: instance Sequelize → objet API

export const userDto = (user) => {
  // Null-safety
  if (!user) return null;

  // Transformation explicite: CHAQUE champ est mappé
  return {
    // ID
    id: user.id,

    // Identity
    username: user.username,
    email: user.email,
    firstName: user.prenom,
    lastName: user.nom,

    // Roles & Company
    roleId: user.role_id,
    companyId: user.company_id,

    // Status
    isActive: user.is_active,
    isLocked: user.is_locked,

    // Timestamps
    createdAt: user.created_at,
    updatedAt: user.updated_at

    // ❌ NOT INCLUDED (forbidden):
    // password: user.password,        // Jamais exposer
    // specialites: user.specialites,  // Sauf autorisé
    // tarifHoraire: user.tarif_horaire // Confidentiel
  };
};

// 🔢 Array helper
export const userDtoArray = (users) => {
  return Array.isArray(users) 
    ? users.map(userDto) 
    : [];
};
```

**Règles DTO (obligatoires):**

| Aspect | Règle |
|--------|-------|
| **Nullability** | Toujours vérifier `if (!user) return null` |
| **Cas Tableau** | Créer `{entity}DtoArray()` pour collections |
| **Pas de logique** | DTO = mapping seulement, pas de calculs |
| **Pas de dépendances** | DTO ne doit pas importer les services |
| **Champs camelCase** | Toujours en camelCase, JAMAIS snake_case |
| **Export unique** | 1 fonction = 1 entité |

---

### 4.3 Contrat API (Backend → Frontend)

**Format obligatoire:** Toutes les réponses API

```javascript
{
  "success": true,                    // boolean (toujours présent)
  "data": { ...DTO } || null,        // Objet transformé ou null
  "meta": {
    "timestamp": "2026-01-27T10:30:00.000Z",  // ISO-8601
    "version": "v2.2",
    "path": "/api/users"
  },
  "error": null                       // string ou null
}
```

**Exemples API conformes:**

```javascript
// ✅ GET /api/users/:id (succès)
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@spofe.local",
    "companyId": 5,
    "roleId": 1,
    "isActive": true,
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-01-27T10:30:00Z"
  },
  "meta": {
    "timestamp": "2026-01-27T10:30:00Z",
    "version": "v2.2"
  }
}

// ✅ GET /api/users (collection)
{
  "success": true,
  "data": [
    { id: 1, username: "admin", ... },
    { id: 2, username: "consultant", ... }
  ],
  "meta": {
    "timestamp": "2026-01-27T10:30:00Z",
    "version": "v2.2",
    "count": 2,
    "total": 150,
    "page": 1,
    "pageSize": 50
  }
}

// ❌ GET /api/users/:id (erreur)
{
  "success": false,
  "data": null,
  "error": "User not found",
  "meta": {
    "timestamp": "2026-01-27T10:30:00Z",
    "version": "v2.2"
  }
}
```

**Interdictions API:**

```javascript
❌ res.json(user)                     // Sequelize instance brute
❌ res.json({ user: sequelizeUser })  // Instance imbriquée
❌ res.json({ ...user.toJSON() })     // Conversion automatique
❌ res.json(users.map(u => u.toJSON()))  // Sans DTO
❌ res.json({ status: 200, data: [...] }) // Format non-standard

✅ res.json({
     success: true,
     data: userDto(user),
     meta: { timestamp: new Date().toISOString() }
   })
```

---

## 🖥️ 5. CONTRAT FRONTEND (CONSOMMATEUR STRICT)

### 5.1 Règle absolue

```javascript
🚫 Le frontend n'a PAS le droit de deviner la structure backend
🚫 Le frontend n'a PAS le droit de créer des champs ad-hoc
🚫 Le frontend n'a PAS le droit d'utiliser snake_case
```

---

### 5.2 Mapper Frontend obligatoire

**Localisation:**
```
frontend/src/mappers/
├── user.mapper.js
├── role.mapper.js
├── compagnie.mapper.js
└── index.js
```

**Exemple normatif:**

```javascript
// frontend/src/mappers/user.mapper.js
// 🗺️ Transformer API response → Application state

export const mapUser = (apiResponse) => {
  // Null-safety
  if (!apiResponse) return null;

  // Structure contractée (DTO backend → State frontend)
  return {
    id: apiResponse.id,
    username: apiResponse.username,
    email: apiResponse.email,
    companyId: apiResponse.companyId,
    roleId: apiResponse.roleId,
    isActive: apiResponse.isActive,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt
  };
};

// Array helper
export const mapUserArray = (apiUsers) => {
  return Array.isArray(apiUsers)
    ? apiUsers.map(mapUser)
    : [];
};
```

---

### 5.3 Interdictions frontend

| Action | Raison | Conséquence |
|--------|--------|------------|
| ❌ Utiliser snake_case | Contrainte de contrat | BUG, data perte |
| ❌ `response.data.data.xxx` | Pas d'accès direct | Champ disparu = undefined |
| ❌ Créer champ inexistant | Contrat violé | Donnée fantôme |
| ❌ Assumer structure API | Pas de documentation | Divergence progressive |

**Pattern d'utilisation correct:**

```javascript
// ✅ CORRECT: Utiliser le mapper
import { mapUser } from '@/mappers/user.mapper';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(response => setUser(mapUser(response.data)))  // Mapper!
      .catch(err => console.error(err));
  }, [userId]);

  return user ? (
    <div>
      <p>{user.username}</p>           {/* camelCase ✅ */}
      <p>{user.companyId}</p>          {/* mapé du backend ✅ */}
    </div>
  ) : <p>Loading...</p>;
};

// ❌ INCORRECT: Accès direct sans mapper
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(response => setUser(response.data))  // ❌ Pas de mapper!
      .catch(err => console.error(err));
  }, [userId]);

  return user ? (
    <div>
      <p>{user.user_name}</p>         {/* Inventé, n'existe pas ❌ */}
      <p>{user.company_id}</p>        {/* snake_case, contrat violé ❌ */}
    </div>
  ) : <p>Loading...</p>;
};
```

---

## 🔍 6. CONTRAT DE VALIDATION & AUDIT

### 6.1 Checklist automatique (pour CI/CD)

À chaque pull request et merge:

- [ ] **DB Conformité**: Chaque table → naming v2.2 (snake_case, pluriel, paranoid)
- [ ] **Modèles Sequelize**: Tous les modèles définis, aucune table orpheline
- [ ] **DTOs Présents**: Chaque entité exposée → DTO défini
- [ ] **Controllers Valides**: Toutes les réponses utilisent DTOs
- [ ] **Frontend Mappers**: Chaque entité consommée → mapper défini
- [ ] **Pas de snake_case frontend**: Audit grep pour vérifier

**Commandes d'audit:**

```bash
# Vérifier les DTOs
ls -la cascade/src/dto/

# Chercher raw Sequelize (❌ forbidden)
grep -r "raw: true" cascade/src/

# Chercher snake_case frontend (❌ forbidden)
grep -r "_" frontend/src/ | grep -v "__" | grep -v node_modules

# Chercher DTO imports
grep -r "userDto\|companyDto\|journalEntryDto" cascade/src/

# Valider structure réponses
npm run test:contract
```

---

### 6.2 Indicateurs de conformité SILC

| Score | État | Signification |
|-------|------|---------------|
| < 70% | ❌ ROUGE | Système instable, divergence majeure |
| 70–85% | ⚠️ ORANGE | Dette technique, risque de divergence |
| 85–95% | ✅ VERT | Sain, respects des contrats |
| > 95% | 🟢 SUPER | Industriel, système stable |

**Audit complet:**
```bash
# Générer rapport conformité SILC
node scripts/audit-silc.js
```

---

## 🚀 7. PROCESSUS D'ÉVOLUTION DU CONTRAT

### Ajouter une nouvelle entité (ex: Consultant)

```
1️⃣  Modifier le contrat (SILC_v1.0)
    └─ Documenter la nouvelle entité

2️⃣  Créer table DB
    └─ consultant_id INT PRIMARY KEY
    └─ consulting_firm_id INT NOT NULL
    └─ specialites JSON
    └─ created_at, updated_at, deleted_at

3️⃣  Créer modèle Sequelize
    └─ cascade/src/models/consultant.model.js
    └─ tableName: 'consultants'
    └─ underscored: true, paranoid: true

4️⃣  Créer DTO
    └─ cascade/src/dto/consultant.dto.js
    └─ Mapper tous les champs contrat

5️⃣  Créer frontend mapper
    └─ frontend/src/mappers/consultant.mapper.js

6️⃣  Implémenter controller
    └─ Utiliser DTO dans réponse

7️⃣  Tester avec audit-silc.js
    └─ Vérifier 100% conformité
```

---

## 📊 8. EXEMPLE COMPLET: WORKFLOW USER

### Cas d'usage: Récupérer un utilisateur

```
🖥️ Frontend
│
├─ GET /api/users/1
│
⚙️ Backend
│
├─ Controller: @GET /users/:id
│  ├─ userService.getUserById(1)
│  │
│  ├─ Service: Model.findByPk(1)
│  │  └─ Retourne: Instance Sequelize (snake_case)
│  │
│  ├─ DTO: userDto(instance)
│  │  └─ Retourne: { id, username, email, companyId, ... }
│  │
│  └─ Response: res.json({
│       success: true,
│       data: userDto,
│       meta: { timestamp, version }
│     })
│
🗄️ Frontend
│
├─ Reçoit: { success, data: { id, username, ... }, meta }
│
├─ Mapper: mapUser(response.data)
│  └─ Valide structure attendue
│
├─ State: useState(mappedUser)
│  └─ Utilise user.username, user.companyId, etc.
│
└─ Render: <Component user={user} />
```

---

## 🎯 9. CONFORMITÉ SPOFE v2.2

Ce contrat SILC est **100% aligné** avec les conventions SPOFE v2.2:

| Aspect | Convention | SILC Respect |
|--------|-----------|-------------|
| **Nommage DB** | snake_case, pluriel | ✅ Mandatoire |
| **Nommage Backend** | camelCase functions | ✅ DTOs en camelCase |
| **Nommage Files** | {entity}.dto.js | ✅ Centralisé |
| **Nommage Frontend** | camelCase, PascalCase | ✅ Mappers |
| **Soft Delete** | paranoid: true | ✅ Obligatoire |
| **Timestamps** | created_at, updated_at | ✅ Auto Sequelize |

---

## 📋 10. CHECKLIST IMPLÉMENTATION SILC

### Pour chaque nouvelle entité:

```markdown
## Entity: [NOM]

- [ ] Table DB créée (snake_case, pluriel, paranoid)
- [ ] Modèle Sequelize (cascade/src/models/{entity}.model.js)
- [ ] DTO créé (cascade/src/dto/{entity}.dto.js)
- [ ] Exporte dans cascade/src/dto/index.js
- [ ] Frontend mapper créé (frontend/src/mappers/{entity}.mapper.js)
- [ ] Controller utilise DTO dans réponses
- [ ] Tests API contractés (API Contract Tests)
- [ ] Audit SILC passé (npm run test:contract)
- [ ] Documentation SILC mise à jour
- [ ] Aucune violation grep snake_case frontend
```

---

## ✅ 11. VALIDATION FINALE

Ce contrat SILC est valide quand:

✅ 100% des tables DB respectent v2.2  
✅ 100% des modèles Sequelize configurés  
✅ 100% des entités exposées ont DTO  
✅ 100% des controllers retournent DTOs  
✅ 100% des réponses API standardisées  
✅ 100% des frontends utilisent mappers  
✅ 0% de snake_case en frontend  
✅ Audit SILC score > 95%  

---

## 📞 CONTACTS & ESCALADE

**Violation SILC détectée?**

1. Documenter: Quel champ? Quelle couche?
2. Vérifier: Le contrat local ou une ignorance?
3. Escalader: Créer issue GitHub avec tag `silc-violation`
4. Corriger: Adapter le code, JAMAIS le contrat (sans approbation)

---

**SILC v1.0 — 27 janvier 2026**  
**Statut:** 🟢 OFFICIEL ET EFFECTIF  
**Validation:** Tous les projets SPOFE  
**Révisions:** Autorisées avec approbation architecture  

---
