# 🚀 GUIDE D'IMPLÉMENTATION SILC v1.0

## SPOFE Inter-Layer Contract (SILC) — Guide de déploiement

**Date:** 27 janvier 2026  
**Version:** 1.0  
**Statut:** 🟢 READY FOR DEPLOYMENT  
**Fichiers fournis:** 11 DTOs + 1 index central + 1 contrat officiel  

---

## 📂 Structure créée

```
cascade/src/dto/
├── user.dto.js                    ✅ 4 variantes (standard, array, minimal, admin)
├── role.dto.js                    ✅ 3 variantes
├── company.dto.js                 ✅ 3 variantes
├── group.dto.js                   ✅ 3 variantes (GroupeEntreprise)
├── journalEntry.dto.js            ✅ 3 variantes
├── journalEntryLine.dto.js        ✅ 3 variantes
├── chartOfAccount.dto.js          ✅ 3 variantes
├── accountBalance.dto.js          ✅ 3 variantes
├── auditTrail.dto.js              ✅ 3 variantes
├── securityEvent.dto.js           ✅ 3 variantes
└── index.js                       ✅ Export central

Racine du projet:
├── SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md  (Contrat officiel)
```

---

## ✅ Checklist de validation

- [x] **SILC v1.0 créé et documenté** - Contrat officiel en place
- [x] **11 DTOs créés** - Tous les cas d'usage couverts
- [x] **3 variantes par DTO** - standard, array, minimal
- [x] **Export central** - cascade/src/dto/index.js complet
- [x] **Conforme v2.2** - Tous les champs en camelCase
- [x] **Null-safety** - Tous les DTOs testent null/undefined
- [x] **ISO-8601 timestamps** - Tous les DTOs convertissent les dates
- [x] **Aucune dépendance circulaire** - DTOs isolés
- [x] **Mapping explicite** - Chaque champ mappé volontairement

---

## 🎯 Prochaines étapes (Implémentation)

### Phase 1: Adapter les controllers existants (2-3 heures)

**Objectif:** Tous les controllers retournent des DTOs

**Exemple avant (NON-CONFORME):**

```javascript
// ❌ cascade/src/controllers/auth.controller.js

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    
    res.json({
      success: true,
      data: user.toJSON(),  // ❌ Retourne l'instance brute
      meta: { timestamp: new Date() }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Exemple après (CONFORME SILC):**

```javascript
// ✅ cascade/src/controllers/auth.controller.js

import { userDto } from '../dto/index.js';

export const login = async (req, res) => {
  try {
    const user = await User.findOne({ where: { email: req.body.email } });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'Invalid credentials',
        meta: { timestamp: new Date().toISOString() }
      });
    }
    
    res.json({
      success: true,
      data: userDto(user),  // ✅ Utilise le DTO
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: error.message,
      meta: { timestamp: new Date().toISOString() }
    });
  }
};
```

### Checklist par controller:

```bash
# 1. Importer les DTOs nécessaires
import { userDto, userDtoArray, companyDto, companyDtoArray } from '../dto/index.js';

# 2. Remplacer tous les:
#    - res.json(user)          →  res.json({ success: true, data: userDto(user), meta: {...} })
#    - res.json(users)         →  res.json({ success: true, data: userDtoArray(users), meta: {...} })
#    - user.toJSON()           →  userDto(user)
#    - users.map(u => u.toJSON()) →  userDtoArray(users)

# 3. Ajouter meta.timestamp à chaque réponse
#    meta: { timestamp: new Date().toISOString() }

# 4. Tester: npm run dev
```

---

### Phase 2: Vérifier les routes et réponses API (1-2 heures)

**Utiliser Postman ou curl pour tester:**

```bash
# Test GET /api/users/:id
curl -X GET http://localhost:3001/api/users/1 \
  -H "Authorization: Bearer $TOKEN"

# Vérifier que la réponse ressemble à:
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@spofe.local",
    "companyId": 5,
    "roleId": 1,
    "isActive": true,
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-27T10:30:00.000Z"
  },
  "meta": {
    "timestamp": "2026-01-27T10:30:00.000Z"
  }
}

# ❌ Si vous voyez user_id, company_id, prenom au lieu de 
#    companyId, firstName → DTOs non appliqués!
```

---

### Phase 3: Créer frontend mappers (2-3 heures)

**Créer le dossier frontend et mappers:**

```bash
mkdir -p frontend/src/mappers
```

**Exemple mapper (frontend/src/mappers/user.mapper.js):**

```javascript
/**
 * 🗺️ User Mapper — Frontend → State
 * 
 * Transforme la réponse API en state application
 * Valide la structure contrat
 */

export const mapUser = (apiResponse) => {
  if (!apiResponse) return null;

  // Valider la structure API (contrat)
  if (!apiResponse.id || !apiResponse.username) {
    console.error('Invalid user DTO:', apiResponse);
    return null;
  }

  return {
    // Tous en camelCase
    id: apiResponse.id,
    username: apiResponse.username,
    email: apiResponse.email,
    companyId: apiResponse.companyId,
    roleId: apiResponse.roleId,
    isActive: apiResponse.isActive,
    firstName: apiResponse.firstName,
    lastName: apiResponse.lastName,
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt
  };
};

export const mapUserArray = (apiUsers) => {
  return Array.isArray(apiUsers)
    ? apiUsers.map(mapUser).filter(Boolean)
    : [];
};
```

**Utilisation dans un composant React:**

```javascript
import { mapUser, mapUserArray } from '@/mappers/user.mapper';

const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(response => {
        if (response.success) {
          setUser(mapUser(response.data));  // Mapper!
        }
      })
      .catch(err => console.error(err));
  }, [userId]);

  return user ? (
    <div>
      <p>Username: {user.username}</p>        {/* camelCase ✅ */}
      <p>Email: {user.email}</p>              {/* mappé ✅ */}
      <p>Company: {user.companyId}</p>        {/* contrat ✅ */}
    </div>
  ) : <p>Loading...</p>;
};
```

---

### Phase 4: Tester et valider (1 heure)

#### Test unitaire DTO:

```javascript
// tests/dto/user.dto.test.js
import { userDto, userDtoArray, userDtoMinimal } from '../../src/dto/index.js';

describe('User DTO', () => {
  it('should transform Sequelize instance to DTO', () => {
    const user = {
      id: 1,
      username: 'admin',
      email: 'admin@spofe.local',
      company_id: 5,
      role_id: 1,
      prenom: 'Admin',
      nom: 'User',
      is_active: true,
      created_at: new Date('2026-01-15'),
      updated_at: new Date()
    };

    const dto = userDto(user);

    expect(dto).toEqual({
      id: 1,
      username: 'admin',
      email: 'admin@spofe.local',
      firstName: 'Admin',
      lastName: 'User',
      companyId: 5,
      roleId: 1,
      isActive: true,
      createdAt: expect.any(String)  // ISO-8601
    });
  });

  it('should return null for null input', () => {
    expect(userDto(null)).toBeNull();
  });

  it('should handle array of users', () => {
    const users = [
      { id: 1, username: 'admin', ... },
      { id: 2, username: 'consultant', ... }
    ];

    const dtos = userDtoArray(users);
    expect(dtos).toHaveLength(2);
    expect(dtos[0].username).toBe('admin');
  });
});
```

#### Test d'intégration API:

```bash
# Test via npm
npm run test:integration

# Test via Postman:
# 1. Importer la collection SPOFE API
# 2. Vérifier que chaque endpoint retourne le bon DTO
# 3. Vérifier qu'aucun snake_case n'est exposé

# Test via curl:
curl -X GET http://localhost:3001/api/users \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[0]'

# Résultat attendu: tous les champs en camelCase
```

---

## 📋 Checklist complète de déploiement

### Avant de déployer:

- [ ] **Lire SILC_v1.0** - Comprendre le contrat
- [ ] **Audit des controllers** - Lister tous les endpoints
- [ ] **Audit des réponses** - Vérifier format actuel
- [ ] **Tests existants** - Adapter si nécessaire

### Pendant le déploiement (Phase 1-4):

- [ ] **Phase 1** - Adapter controllers (avec DTOs)
- [ ] **Phase 2** - Vérifier routes API (tests Postman)
- [ ] **Phase 3** - Créer mappers frontend
- [ ] **Phase 4** - Tests unitaires + intégration
- [ ] **Commit** - git commit -m "feat: implement SILC v1.0 contract"

### Après déploiement:

- [ ] **Monitoring** - Vérifier logs pour erreurs DTO
- [ ] **Audit** - Lancer audit-silc.js pour vérifier conformité
- [ ] **Documentation** - Mettre à jour API docs
- [ ] **Formation** - Notifier l'équipe (nouvelle structure API)

---

## 🔍 Audit et monitoring

### Script audit SILC (à créer):

```bash
# cascade/scripts/audit-silc.js

const fs = require('fs');
const path = require('path');

const controllersDir = './cascade/src/controllers';
const files = fs.readdirSync(controllersDir);

let violations = [];

files.forEach(file => {
  if (!file.endsWith('.js')) return;
  
  const content = fs.readFileSync(path.join(controllersDir, file), 'utf8');
  
  // Chercher violations de SILC
  if (content.includes('res.json(user') || content.includes('res.json(users')) {
    violations.push(`${file}: Retourne instance brute (pas de DTO)`);
  }
  
  if (content.includes('toJSON()') && !content.includes('dto')) {
    violations.push(`${file}: Utilise .toJSON() sans DTO`);
  }
  
  if (!content.includes('success:') || !content.includes('meta:')) {
    violations.push(`${file}: Format réponse non-standard`);
  }
});

console.log(`SILC Audit: ${violations.length} violations trouvées`);
violations.forEach(v => console.log(`  - ${v}`));

process.exit(violations.length === 0 ? 0 : 1);
```

**Lancer l'audit:**

```bash
node cascade/scripts/audit-silc.js
```

---

## 💡 Tips et best practices

### ✅ À faire:

```javascript
// Import local
import { userDto, companyDtoArray } from '../dto/index.js';

// Utiliser DTOs dans controllers
res.json({
  success: true,
  data: userDto(user),
  meta: { timestamp: new Date().toISOString() }
});

// Utiliser mappers dans React
const mappedUsers = mapUserArray(response.data);

// Tester null-safety
if (!user) return null;

// Utiliser ISO-8601 pour timestamps
createdAt: new Date().toISOString()
```

### ❌ À éviter:

```javascript\n// Exporter DTOs n'importe où\nexport { userDto } from '../../src/dto/user.dto.js';  // ❌ Utiliser index.js\n\n// Mélanger DTOs et logique métier\nexport const userDtoWithPermissions = (user, permissions) => { ... } // ❌ Logique\n\n// Utiliser snake_case en frontend\nconst username = user.user_name;  // ❌ Utiliser user.username\n\n// Créer des champs ad-hoc\nreturn { ...userDto(user), customField: 'value' };  // ❌ Contrat violé\n\n// Exposer champs sensibles\nreturn { ...userDto(user), password: user.password };  // ❌ Security\n```\n\n---\n\n## 📞 Support & Escalade\n\n**Question sur SILC?**\n→ Consulter: SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md\n\n**DTO non existant?**\n→ Créer nouveau fichier dans cascade/src/dto/ + ajouter export dans index.js\n\n**Besoin de modifier un DTO?**\n→ Documenter dans SILC → Modifier DTO → Tester → Commit\n\n**Violation détectée?**\n→ Créer issue: \"SILC violation: [détails]\"\n\n---\n\n## 🎓 Ressources\n\n**Fichiers clés:**\n- `SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md` - Contrat officiel\n- `cascade/src/dto/index.js` - Export central (point d'entrée)\n- `cascade/src/dto/*.dto.js` - Implémentations individuelles\n\n**Documentation SPOFE:**\n- Conventions v2.2\n- Architecture diagram\n- API contracts (Postman)\n\n---\n\n**SILC v1.0 est maintenant EN VIGUEUR**\n\nTous les développements SPOFE doivent respecter ce contrat.\n\n---\n\n*Guide généré: 27 janvier 2026*  \n*SPOFE Inter-Layer Contract (SILC) v1.0*\n"