# Frontend Build Production - Test

## Objectif
Tester le frontend en mode production (build + serveur statique) sans Vite dev server.

## Étapes

### 1. Build production
```bash
cd frontend
npm run build
```

**Résultat attendu** :
- Dossier `dist/` créé
- Assets optimisés (JS/CSS minifiés)
- `index.html` généré
- Aucune erreur de build

### 2. Servir build avec serveur statique

**Option A : http-server (recommandé)**
```bash
# Installer globalement (une fois)
npm install -g http-server

# Servir depuis dist/
cd dist
http-server -p 8080 -c-1
```

**Option B : serve (alternative)**
```bash
# Installer globalement
npm install -g serve

# Servir
serve -s dist -p 8080
```

**Option C : Python (si disponible)**
```bash
cd dist
python -m http.server 8080
```

### 3. Accéder à l'application

URL : http://localhost:8080

**Tests à effectuer** :
- [ ] Page login s'affiche
- [ ] Aucune erreur console JavaScript
- [ ] Assets chargés (CSS, images, fonts)
- [ ] Variables d'environnement injectées (VITE_API_URL)
- [ ] Routing fonctionne (React Router)
- [ ] Login fonctionnel (appel API backend)

### 4. Vérifier variables d'environnement

Ouvrir console navigateur :
```javascript
console.log(import.meta.env.VITE_API_URL)
// Doit afficher: http://localhost:3001/api (ou valeur .env)
```

⚠️ **IMPORTANT** : Les variables `VITE_*` sont injectées au **moment du build**, pas au runtime.

### 5. Vérifier appels API

Dans Network tab (F12), vérifier :
- [ ] Requêtes vers `http://localhost:3001/api/*`
- [ ] Headers CORS présents
- [ ] Status 200 (ou 401 si non authentifié)

## Résultat attendu

✅ **Frontend fonctionne sans Vite dev server**
✅ **Aucune dépendance au hot reload**
✅ **Build optimisé et production-ready**
✅ **Variables env correctement injectées**

## Troubleshooting

### Problème : Page blanche
**Cause** : Base path incorrecte
**Solution** : 
```javascript
// vite.config.js
export default {
  base: '/' // Ou chemin spécifique
}
```

### Problème : 404 sur routes (ex: /dashboard)
**Cause** : SPA routing non configuré
**Solution** : Serveur doit renvoyer `index.html` pour toutes les routes
```bash
# http-server avec fallback
http-server dist -p 8080 --proxy http://localhost:8080? -c-1
```

### Problème : API calls échouent
**Cause** : VITE_API_URL incorrecte
**Solution** : 
```bash
# Rebuild avec bonne URL
VITE_API_URL=http://localhost:3001/api npm run build
```

## Checklist finale

- [ ] Build réussit sans erreur
- [ ] Assets optimisés (taille < 5 MB total)
- [ ] Application s'affiche sur serveur statique
- [ ] Login fonctionne
- [ ] Navigation fonctionne
- [ ] API calls fonctionnent
- [ ] Aucune erreur console
- [ ] Performance acceptable (Lighthouse > 80)
