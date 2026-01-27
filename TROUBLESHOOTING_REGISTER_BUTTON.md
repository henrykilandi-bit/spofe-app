# 🔍 CHECKLIST - Pourquoi le bouton "Créer mon compte" ne fonctionne pas

## ✅ ÉTAPES À VÉRIFIER (Ordre d'importance)

### 1️⃣ VÉRIFIER LE BACKEND (CRITIQUE)
```bash
# Vérifier que le backend est lancé
cd cascade
npm run dev

# Attendez: "Server running on http://localhost:3001"

# Si erreur, lancez d'abord:
npm install
```

**Signes que le backend fonctionne:**
- ✅ Page affiche "Server running on http://localhost:3001"
- ✅ Pas de messages d'erreur rouge
- ✅ Logs affichés en continu

---

### 2️⃣ VÉRIFIER LE FICHIER .env.local (CRITIQUE)
```bash
# Créer le fichier s'il manque:
cd frontend

# Windows:
echo VITE_API_URL=http://localhost:3001/api > .env.local

# Linux/Mac:
echo "VITE_API_URL=http://localhost:3001/api" > .env.local

# Vérifier le contenu:
cat .env.local
# Résultat attendu:
# VITE_API_URL=http://localhost:3001/api
```

---

### 3️⃣ VÉRIFIER LE FRONTEND
```bash
cd frontend

# Tuer l'instance existante (Ctrl+C dans terminal)

# Relancer:
npm run dev

# Attendez: "Local: http://localhost:5173"
```

**Signes que le frontend fonctionne:**
- ✅ Page chargée sans erreurs rouges
- ✅ RegisterPage-Extended visible
- ✅ Formulaire affiche tous les champs

---

### 4️⃣ OUVRIR LA CONSOLE DU NAVIGATEUR (CRUCIAL)
```
1. Ouvrir la page http://localhost:5173/register
2. Appuyez sur: F12 (ou Ctrl+Shift+I)
3. Allez à: Console (onglet)
4. Cherchez les erreurs ROUGES
5. Lisez le message d'erreur
```

**Erreurs couantes et solutions:**

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Cannot POST /api/auth/register" | Backend pas lancé | Lancez: cd cascade && npm run dev |
| "ERR_CONNECTION_REFUSED" | Backend port 3001 occupé | Tuer le processus sur port 3001 |
| "CORS error" | Frontend ne peut pas appeler backend | Vérifier CORS_ORIGIN dans cascade/.env |
| "undefined is not a function" | Erreur dans le code React | Vérifier RegisterPage-Extended.jsx |
| "Cannot read property 'VITE_API_URL'" | .env.local manquant | Créer frontend/.env.local |

---

### 5️⃣ VÉRIFIER LA BASE DE DONNÉES
```bash
# Vérifier que MySQL est lancé dans XAMPP

# Vérifier la base existe:
# Windows (XAMPP):
"C:\xampp\mysql\bin\mysql" -u root -e "SHOW DATABASES;" | find "spofe_v2_1"

# Linux/Mac:
mysql -u root -e "SHOW DATABASES;" | grep spofe_v2_1

# Résultat attendu:
# spofe_v2_1
```

---

### 6️⃣ TESTER MANUELLEMENT L'API
```bash
# Ouvrir PowerShell ou Terminal

# Test de connexion:
curl http://localhost:3001/api/health

# Résultat attendu:
# {"status":"ok"}

# Test d'enregistrement:
$payload = @{
    username = "test_user_$(Get-Random)"
    email = "test_$(Get-Random)@example.com"
    password = "TestPass123!"
    prenom = "Test"
    nom = "User"
    role = "utilisateur"
} | ConvertTo-Json

curl -X POST http://localhost:3001/api/auth/register `
  -H "Content-Type: application/json" `
  -Body $payload

# Résultat attendu (HTTP 201):
# {"success":true,"data":{"user":{...},...}}
```

---

## 🐛 DEBUG AVANCÉ

### Ajouter des logs au formulaire
Éditer `frontend/src/pages/RegisterPage-Extended.jsx` et ajouter:

```javascript
const handleSubmit = async (e) => {
    console.log('🔴 DEBUG: handleSubmit déclenché'); // ← AJOUTER
    e.preventDefault();
    
    console.log('🔴 DEBUG: Données du formulaire:', formData); // ← AJOUTER
    console.log('🔴 DEBUG: API URL:', import.meta.env.VITE_API_URL); // ← AJOUTER
    
    // ... reste du code
    
    try {
        console.log('🔴 DEBUG: Envoi POST vers:', `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/register`); // ← AJOUTER
        
        const response = await axios.post(
            ...
        );
        
        console.log('🔴 DEBUG: Réponse reçue:', response.data); // ← AJOUTER
        
    } catch (error) {
        console.log('🔴 DEBUG: ERREUR:', error); // ← AJOUTER
        // ... reste du code
    }
};
```

Puis, dans la Console (F12), vous verrez tous les logs DEBUG et saurez exactement où ça s'arrête.

---

## 📋 CHECKLIST FINALE

- [ ] Backend lancé (`npm run dev` dans cascade/)
- [ ] Frontend lancé (`npm run dev` dans frontend/)
- [ ] Fichier `.env.local` existe dans frontend/
- [ ] VITE_API_URL=http://localhost:3001/api dans .env.local
- [ ] MySQL/XAMPP lancé et base spofe_v2_1 existe
- [ ] Console du navigateur (F12) vérififiée - pas d'erreurs rouges
- [ ] Formulaire RegisterPage-Extended visible et rempli
- [ ] Bouton "Créer mon compte" visible
- [ ] Clique sur le bouton → Page affiche "Inscription en cours..."
- [ ] Notification affichée (succès ou erreur)

---

## 🎯 PROCHAINES ÉTAPES

Si vous avez toujours des problèmes après cette checklist:

1. **Partagez l'erreur exacte** de la Console (F12)
2. **Confirmez** que backend et frontend sont lancés
3. **Vérifiez** que le fichier .env.local existe

Je pourrai alors diagnostiquer précisément le problème !

