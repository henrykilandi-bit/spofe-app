# 🚀 SILC v1.0 — QUICK START (5 MINUTES)

## Ce que vous avez reçu

```
✅ CONTRAT INTER-COUCHES OFFICIEL SPOFE (SILC) v1.0
✅ 11 DTOs RÉELS & PRÊTS À UTILISER  
✅ GUIDE D'IMPLÉMENTATION COMPLET
✅ EXEMPLES + BEST PRACTICES
```

---

## 📂 Fichiers à connaître

```
Racine du projet:
├── SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md  ← Lire d'abord (30 min)
├── SILC_v1.0_GUIDE_IMPLEMENTATION.md        ← Puis impl (5-7h)
└── SILC_v1.0_SUMMARY.txt                    ← Récap (cette page)

Backend:
└── cascade/src/dto/
    ├── user.dto.js
    ├── company.dto.js
    ├── role.dto.js
    ├── group.dto.js
    ├── journalEntry.dto.js
    ├── journalEntryLine.dto.js
    ├── chartOfAccount.dto.js
    ├── accountBalance.dto.js
    ├── auditTrail.dto.js
    ├── securityEvent.dto.js
    └── index.js  ← IMPORT D'ICI!
```

---

## ⚡ En 30 secondes

**SILC = Contrat qui définit comment les données circulent:**

```
Database                Backend              Frontend
(snake_case)   →    (camelCase DTOs)   →   (camelCase state)
user_id       userDto(user)     →      userDto.id
company_id    companyDto        →      companyDto.id
```

---

## 💻 Utilisation immédiate

### Dans un controller:

```javascript
import { userDto, userDtoArray } from '../dto/index.js';

// ✅ CORRECT
res.json({
  success: true,
  data: userDto(user),
  meta: { timestamp: new Date().toISOString() }
});

// ✅ CORRECT (collection)
res.json({
  success: true,
  data: userDtoArray(users),
  meta: { count: users.length }
});

// ❌ INCORRECT
res.json(user);  // Jamais!
```

### Dans un composant React:

```javascript
import { mapUser } from '@/mappers/user.mapper';

// API response
const response = await fetch('/api/users/1').then(r => r.json());

// Mapper la réponse
const user = mapUser(response.data);

// Utiliser (100% camelCase)
<p>{user.companyId}</p>
<p>{user.firstName}</p>
```

---

## 🎯 3 ÉTAPES CRITIQUES

### 1️⃣ Dans les controllers (CRITICAL)

```javascript
// Ajouter import en haut
import { userDto, companyDto, journalEntryDtoArray } from '../dto/index.js';

// Remplacer TOUS les res.json()
res.json({
  success: true,
  data: userDto(user),
  meta: { timestamp: new Date().toISOString() }
});
```

### 2️⃣ Dans les routes API

**Tester que chaque endpoint retourne:**

```json
{
  "success": true,
  "data": { /* DTO en camelCase */ },
  "meta": { "timestamp": "ISO-8601" }
}
```

### 3️⃣ Dans le frontend

```javascript
// Créer mappers
export const mapUser = (apiResponse) => ({
  id: apiResponse.id,
  companyId: apiResponse.companyId,
  // ... etc
});

// Utiliser dans React
const user = mapUser(response.data);
```

---

## ✅ Checklist rapide

- [ ] Lire SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md (30 min)
- [ ] Importer DTOs dans controllers
- [ ] Remplacer res.json(user) par res.json({ success, data: userDto(user), meta })
- [ ] Tester API avec Postman/curl
- [ ] Créer mappers frontend
- [ ] Ajouter ISO-8601 timestamps partout
- [ ] Aucun snake_case en frontend
- [ ] Tests passent
- [ ] Commit & done!

---

## 🔥 Le plus important

```
👉 UN CHAMP = UN CONTRAT

Si vous ajoutez un champ:
1. Documenter dans SILC
2. Ajouter dans DTO
3. Exporter dans index.js
4. Utiliser dans controller
5. Mapper en frontend

❌ JAMAIS ad-hoc fields!
```

---

## 📞 Besoin d'aide?

**Erreur: "userDto is not defined"**
```javascript
// Ajouter import
import { userDto } from '../dto/index.js';
```

**Erreur: "user_id undefined en frontend"**
```javascript
// C'est companyId pas company_id!
<p>{user.companyId}</p>
```

**DTO manquant?**
- Créer fichier dans cascade/src/dto/{entity}.dto.js
- Exporter dans cascade/src/dto/index.js
- Utiliser comme les autres

---

## 📚 Ressources

- **Contrat complet:** SILC_v1.0_SPOFE_INTER-LAYER_CONTRACT.md
- **Guide pas-à-pas:** SILC_v1.0_GUIDE_IMPLEMENTATION.md  
- **DTOs:** cascade/src/dto/*.dto.js
- **Point d'entrée:** cascade/src/dto/index.js

---

## 🎊 C'est tout!

SILC v1.0 est OFFICIEL.

Tous les développements SPOFE doivent le respecter.

**Durée totale implémentation: 5-7 heures**

**Bénéfices: Stabilité, maintenabilité, zéro-divergence** 

---

*SILC v1.0 - 27 janvier 2026*
