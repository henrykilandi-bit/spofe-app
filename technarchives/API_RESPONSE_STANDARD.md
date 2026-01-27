# API RESPONSE STANDARD - SPOFE Application

**Version**: 1.0  
**Date**: 2026-01-18  
**Status**: ✅ Standard Officiel

---

## 🎯 Objectif

Définir un format de réponse API **unique et cohérent** pour toutes les requêtes HTTP, éliminant les incohérences et garantissant la prévisibilité du système.

---

## 📋 Format Standard

### 1. Réponse de Succès

**Tous les endpoints qui réussissent** doivent utiliser ce format :

```json
{
  "success": true,
  "message": "Description de l'opération réussie",
  "data": {
    // Données métier (objet, tableau, valeur primitive)
  }
}
```

**Règles** :
- `success` : **TOUJOURS** `true` pour un succès
- `message` : Description claire de l'action (ex: "Utilisateur créé", "Connexion réussie")
- `data` : Contient les données retournées (peut être `null` si aucune donnée)

**Status HTTP** : 200 (OK), 201 (Created), 204 (No Content)

---

### 2. Réponse d'Erreur

**Tous les endpoints qui échouent** doivent utiliser ce format :

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "errors": {
    // Détails optionnels sur les erreurs de validation
    "field1": "Message d'erreur spécifique",
    "field2": "Message d'erreur spécifique"
  }
}
```

**Règles** :
- `success` : **TOUJOURS** `false` pour une erreur
- `message` : Message global d'erreur (ex: "Échec de la connexion", "Validation échouée")
- `errors` : **OPTIONNEL** - Détails de validation (clé = champ, valeur = message)

**Status HTTP** : 400, 401, 403, 404, 409, 500, etc.

---

## 🛠️ Utilitaires response.js

### Imports Requis

```javascript
import { success, error, badRequest, unauthorized, forbidden, notFound } from '../utils/response.js';
```

---

### Fonctions Disponibles

#### 1. `success(res, data, statusCode, message)`

**Usage** : Toutes les réponses réussies

```javascript
success(res, { user: userData }, 200, 'Utilisateur créé avec succès');
success(res, { items: [] }, 200, 'Liste récupérée');
success(res, null, 204, 'Suppression effectuée'); // Pas de data
```

**Paramètres** :
- `res` : Objet response Express
- `data` : Données à retourner (objet, tableau, null)
- `statusCode` : Code HTTP (défaut: 200)
- `message` : Message descriptif (défaut: "Opération réussie")

**Retour** :
```json
{
  "success": true,
  "message": "Message personnalisé",
  "data": { ... }
}
```

---

#### 2. `error(res, message, statusCode, errors)`

**Usage** : Erreurs génériques

```javascript
error(res, 'Erreur serveur interne', 500);
error(res, 'Opération interdite', 403);
error(res, 'Ressource introuvable', 404);
```

**Paramètres** :
- `res` : Objet response Express
- `message` : Message d'erreur
- `statusCode` : Code HTTP (défaut: 500)
- `errors` : Objet d'erreurs détaillées (optionnel)

**Retour** :
```json
{
  "success": false,
  "message": "Message d'erreur",
  "errors": { ... } // Si fourni
}
```

---

#### 3. `badRequest(res, message, errors)`

**Usage** : Erreurs de validation (400)

```javascript
badRequest(res, 'Données invalides', {
  email: 'Email déjà utilisé',
  password: 'Mot de passe trop court'
});
```

**Équivalent à** : `error(res, message, 400, errors)`

---

#### 4. `unauthorized(res, message)`

**Usage** : Authentification requise (401)

```javascript
unauthorized(res, 'Token expiré');
unauthorized(res, 'Authentification requise');
```

**Équivalent à** : `error(res, message, 401)`

---

#### 5. `forbidden(res, message)`

**Usage** : Accès interdit (403)

```javascript
forbidden(res, 'Permissions insuffisantes');
forbidden(res, 'Vous ne pouvez pas modifier cet utilisateur');
```

**Équivalent à** : `error(res, message, 403)`

---

#### 6. `notFound(res, message)`

**Usage** : Ressource introuvable (404)

```javascript
notFound(res, 'Utilisateur introuvable');
notFound(res, 'Document non trouvé');
```

**Équivalent à** : `error(res, message, 404)`

---

## 📐 Règles de Conformité

### ✅ À FAIRE

1. **Toujours importer** les utilitaires `response.js` dans chaque controller
2. **Toujours utiliser** `success()` pour les réponses réussies
3. **Toujours utiliser** les fonctions d'erreur appropriées (`unauthorized`, `badRequest`, etc.)
4. **Toujours inclure** un message descriptif
5. **Toujours envelopper** les données dans un objet `data`

### ❌ À ÉVITER

1. ❌ **JAMAIS** utiliser `res.json()` ou `res.status().json()` directement
2. ❌ **JAMAIS** retourner un format personnalisé (`{ token: ... }`, `{ user: ... }`)
3. ❌ **JAMAIS** omettre le champ `success`
4. ❌ **JAMAIS** mélanger les formats (parfois `data`, parfois objet direct)
5. ❌ **JAMAIS** dupliquer manuellement le format standard

---

## 🔍 Exemples Complets

### Exemple 1 : Inscription Utilisateur (Success)

```javascript
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // ... logique métier ...

    const user = await User.create({ username, email, hashedPassword });
    const token = generateToken(user);

    // ✅ CORRECT : Utilise success() avec data enveloppée
    success(res, { user, token }, 201, 'Utilisateur enregistré avec succès');
    
    // ❌ INCORRECT : Format direct
    // res.status(201).json({ user, token });
    
  } catch (error) {
    next(error);
  }
};
```

---

### Exemple 2 : Login (Error - Credentials Invalides)

```javascript
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // ✅ CORRECT : Utilise unauthorized()
      return unauthorized(res, 'Email ou mot de passe incorrect');
      
      // ❌ INCORRECT : Format direct
      // return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ... suite logique ...
    
  } catch (error) {
    next(error);
  }
};
```

---

### Exemple 3 : Validation Échouée (Error 400)

```javascript
export const createAccount = async (req, res, next) => {
  try {
    const { accountNumber, label } = req.body;
    
    const existing = await Account.findOne({ where: { accountNumber } });
    if (existing) {
      // ✅ CORRECT : Utilise badRequest() avec errors
      return badRequest(res, 'Validation échouée', {
        accountNumber: 'Ce numéro de compte existe déjà'
      });
      
      // ❌ INCORRECT : Format direct
      // return res.status(400).json({ 
      //   error: 'Account exists',
      //   field: 'accountNumber' 
      // });
    }

    // ... suite logique ...
    
  } catch (error) {
    next(error);
  }
};
```

---

### Exemple 4 : Ressource Non Trouvée (Error 404)

```javascript
export const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) {
      // ✅ CORRECT : Utilise notFound()
      return notFound(res, 'Utilisateur introuvable');
      
      // ❌ INCORRECT : Format direct
      // return res.status(404).json({ message: 'User not found' });
    }

    // ✅ CORRECT : Succès avec data
    success(res, { user }, 200, 'Utilisateur récupéré');
    
  } catch (error) {
    next(error);
  }
};
```

---

## 🚨 Exceptions Autorisées

### AUCUNE Exception

**Tous les endpoints** doivent respecter le format standard, **sans exception**.

**Raison** : 
- Cohérence frontend/backend
- Tests simplifiés
- Documentation automatique
- Maintenance facilitée

---

## 📊 État de Conformité Actuel

**Basé sur l'analyse du 2026-01-18** :

| Controller | Endpoints | Conformes | Non-Conformes | Taux |
|------------|-----------|-----------|---------------|------|
| user.controller.js | 5 | 5 ✅ | 0 | 100% ✅ |
| auth.controller.js | 5 | 0 | 5 ❌ | 0% ❌ |
| auth-advanced.controller.js | 9 | 0 | 9 ❌ | 0% ❌ |

**Total** : 6/19 endpoints conformes (31.6%)

**Objectif Phase 2** : **100% de conformité** (19/19)

---

## 🔧 Checklist de Migration

Pour chaque controller non-conforme :

- [ ] Importer les utilitaires : `import { success, error, ... } from '../utils/response.js'`
- [ ] Remplacer tous les `res.json()` par `success(res, data, statusCode, message)`
- [ ] Remplacer tous les `res.status(4xx).json()` par les fonctions appropriées :
  - [ ] 400 → `badRequest(res, message, errors)`
  - [ ] 401 → `unauthorized(res, message)`
  - [ ] 403 → `forbidden(res, message)`
  - [ ] 404 → `notFound(res, message)`
  - [ ] 500 → `error(res, message, 500)`
- [ ] Vérifier que `data` est toujours enveloppé (pas d'objet direct)
- [ ] Tester tous les endpoints (succès + erreurs)
- [ ] Mettre à jour les tests unitaires si nécessaire

---

## 📚 Références

- **Code** : `cascade/src/utils/response.js`
- **Modèle de référence** : `cascade/src/controllers/user.controller.js` (100% conforme)
- **Documentation API** : À créer avec Swagger (Phase 3)

---

## ✅ Validation

Un endpoint est considéré **conforme** si :

1. ✅ Import de `response.js` présent
2. ✅ Aucun `res.json()` ou `res.status().json()` direct
3. ✅ Succès utilise `success(res, data, statusCode, message)`
4. ✅ Erreurs utilisent les fonctions appropriées (`unauthorized`, `badRequest`, etc.)
5. ✅ Format retourné correspond exactement au standard

---

**Dernière mise à jour** : 2026-01-18  
**Auteur** : Équipe Dev SPOFE  
**Validation** : ✅ Standard Officiel Phase 2
