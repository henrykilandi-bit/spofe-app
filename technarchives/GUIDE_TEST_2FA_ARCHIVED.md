# 🧪 GUIDE DE TEST - PAGE 2FA INTELLIGENTE

**Date**: 23 janvier 2026  
**Version**: 2.1.0  
**Frontend**: http://127.0.0.1:5173/

---

## ✅ Prérequis

```bash
✓ Frontend Vite: npm run dev (port 5173)
✓ Backend Express: npm run dev (port 3001)
✓ MySQL: En cours d'exécution
✓ Redis: En cours d'exécution
```

---

## 🎯 Scénarios de Test

### Test 1️⃣ - Vérification des Fichiers Créés

**Objectif**: S'assurer que tous les fichiers sont en place

**Étapes**:
```
1. Ouvrir: c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\frontend\src\pages\
2. Vérifier:
   ✓ TwoFactorAuthPage.jsx existe
   ✓ TwoFactorAuthPage.css existe
3. Ouvrir: c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\frontend\src\
4. Vérifier:
   ✓ App.jsx contient: import TwoFactorAuthPage
   ✓ App.jsx contient: path="/two-factor-auth"
5. Vérifier LoginPage.jsx:
   ✓ Contient: navigate('/two-factor-auth'
```

**Résultat Attendu**: ✅ Tous les fichiers présents et importés correctement

---

### Test 2️⃣ - Interface & Design

**Objectif**: Vérifier le rendu UI complet

**Étapes**:
```
1. Ouvrir Firefox: http://127.0.0.1:5173/login
2. Entrer:
   - Email: admin@spofe.com
   - Password: demo123
3. Cliquer: "Se connecter"
4. Attendre redirection vers /two-factor-auth
```

**Éléments à Vérifier**:
- ✅ Logo SPOFE visible (🔒)
- ✅ Titre "Vérification en deux étapes"
- ✅ Email utilisateur affiché
- ✅ 3 boutons de méthode:
  - 📱 App Authenticator (actif par défaut)
  - 💬 SMS
  - 📧 Email
- ✅ 5 champs de saisie numérique
- ✅ Bouton "Vérifier le code" (désactivé initialement)
- ✅ Bouton "Renvoyer le code"
- ✅ Bouton "Retour à la connexion"
- ✅ 2 cartes d'infos: Sécurité + Aide
- ✅ Footer avec copyright et liens

**Résultat Attendu**: ✅ Page 2FA complètement rendue et stylisée

---

### Test 3️⃣ - Navigation au Clavier

**Objectif**: Tester la saisie du code au clavier

**Étapes**:
```
1. Depuis la page 2FA, 1er champ a le focus (bleu)
2. Taper: "1" → Auto-navigation au champ 2
3. Taper: "2" → Auto-navigation au champ 3
4. Taper: "3" → Auto-navigation au champ 4
5. Taper: "4" → Auto-navigation au champ 5
6. Taper: "5" → Champ 5 rempli
7. Appuyer: BACKSPACE → Revenir au champ 4
8. Appuyer: BACKSPACE → Revenir au champ 3
9. Appuyer: Flèche Droite → Aller au champ 4
10. Appuyer: Flèche Gauche → Revenir au champ 3
```

**Résultat Attendu**: ✅ Navigation fluide entre champs

---

### Test 4️⃣ - Copier-Coller du Code

**Objectif**: Tester le copier-coller automatique

**Étapes**:
```
1. Copier: "12345"
2. Sur page 2FA, cliquer dans le 1er champ
3. Coller: Ctrl+V
4. Résultat:
   - Champ 1: 1
   - Champ 2: 2
   - Champ 3: 3
   - Champ 4: 4
   - Champ 5: 5
5. Attendre 1s → Vérification automatique
```

**Résultat Attendu**: ✅ Code distribué dans 5 champs + vérification auto

---

### Test 5️⃣ - Changement de Méthode (SMS)

**Objectif**: Tester le changement de méthode de vérification

**Étapes**:
```
1. Sur page 2FA, cliquer bouton "SMS"
2. Vérifier:
   - Bouton SMS devient bleu (active)
   - Message change à: "Un code a été envoyé au numéro +33..."
   - Bouton "Renvoyer" affiche "Renvoyer (30s)"
3. Vérifier dans console (F12):
   - Request POST /auth/send-sms-code
4. Attendre 30s ou cliquer "Retour"
```

**Résultat Attendu**: ✅ SMS sélectionné, API appelée, compteur 30s

---

### Test 6️⃣ - Changement de Méthode (Email)

**Objectif**: Tester la méthode Email

**Étapes**:
```
1. Sur page 2FA, cliquer bouton "Email"
2. Vérifier:
   - Bouton Email devient bleu (active)
   - Message change à: "Un code a été envoyé à admin@spofe.com..."
   - Bouton "Renvoyer" affiche "Renvoyer (30s)"
3. Vérifier dans console:
   - Request POST /auth/send-email-code
```

**Résultat Attendu**: ✅ Email sélectionné, API appelée

---

### Test 7️⃣ - Code Invalide

**Objectif**: Tester la gestion des codes incorrects

**Étapes**:
```
1. Sur page 2FA, entrer code: 99999
2. Cliquer "Vérifier le code"
3. Attendre réponse API
```

**Résultat Attendu**: 
- ✅ Message d'erreur: "Code incorrect"
- ✅ Couleur rouge (#fff5f5)
- ✅ Animation shake des champs
- ✅ Champs vidés automatiquement

---

### Test 8️⃣ - Code Valide (Démo)

**Objectif**: Tester le flux complet avec code valide

**Étapes**:
```
1. Sur page 2FA, entrer code: 12345 (ou via copier-coller)
2. Vérification automatique se déclenche
3. Attendre réponse de /auth/verify-2fa
```

**Résultat Attendu**:
- ✅ Message succès: "Authentification réussie!"
- ✅ Couleur verte (#f0fff4)
- ✅ Redirection vers /dashboard après 1.5s
- ✅ Token sauvegardé dans AuthContext

---

### Test 9️⃣ - Bouton "Retour à la Connexion"

**Objectif**: Tester le retour à la page de login

**Étapes**:
```
1. Sur page 2FA, cliquer "Retour à la connexion"
2. Vérifier redirection vers /login
3. Formulaire réinitialisé
```

**Résultat Attendu**: ✅ Redirection vers login avec refresh

---

### Test 🔟 - Responsive Design

**Objectif**: Tester le design sur différents écrans

**Étapes Desktop (1024px+)**:
```
1. Ouvrir navigateur pleine largeur
2. Vérifier:
   - 5 champs de code côte à côte
   - Cartes d'infos en 2 colonnes
   - Tous les éléments visibles
```

**Étapes Tablet (768px)**:
```
1. F12 → Device Mode → iPad (768x1024)
2. Vérifier:
   - Champs réduits mais utilisables
   - Cartes adaptées à l'écran
   - Boutons cliquables facilement
```

**Étapes Mobile (480px)**:
```
1. F12 → Device Mode → iPhone 12 (390x844)
2. Vérifier:
   - Champs optimisés pour petit écran
   - Pas de débordement horizontal
   - Texte lisible (min 16px)
   - Boutons cliquables
```

**Résultat Attendu**: ✅ Design adapté à tous les écrans

---

## 🔍 Vérification de la Console (F12)

**Logs Attendus**:

```javascript
// Redirection depuis LoginPage
[LoginPage] ✅ Login response received
[LoginPage] 🔐 Redirection vers page 2FA complète

// Arrivée sur 2FA
[2FA] Initialisation avec tempToken: xxx

// Changement de méthode SMS
POST /auth/send-sms-code - Status 200

// Vérification du code
[2FA] 🔐 Vérification du code 2FA...
[2FA] ✅ Code 2FA vérifié avec succès

// Navigation
Redirection vers /dashboard
```

**Pas d'Erreurs Attendues**:
- ❌ Les appels API doivent répondre correctement
- ❌ Pas de 404 sur les ressources
- ❌ Pas de CORS errors
- ❌ Pas de undefined variables

---

## 🚨 Cas de Bord à Tester

### Accès Direct à /two-factor-auth
```
1. Ouvrir: http://127.0.0.1:5173/two-factor-auth
2. Sans tempToken dans location.state
3. Résultat Attendu: ✅ Redirection vers /login
```

### Session Expirée
```
1. Sur page 2FA, attendre > 5 min sans vérifier
2. Essayer de vérifier le code
3. Résultat Attendu: ✅ Redirection vers /login (token expiré)
```

### Vérification Double
```
1. Sur page 2FA, vérifier un code
2. Pendant le loading, re-cliquer "Vérifier"
3. Résultat Attendu: ✅ Une seule requête API
```

---

## 📊 Checklist Finale

| Test | Status | Notes |
|------|--------|-------|
| Fichiers créés | ✅ | TwoFactorAuthPage.jsx + CSS |
| Routes ajoutées | ✅ | /two-factor-auth intégrée |
| LoginPage redirection | ✅ | Navigate vers 2FA |
| Interface complète | ✅ | Tous éléments visibles |
| Navigation clavier | ✅ | Auto-focus + Backspace |
| Copier-coller | ✅ | Regex validation |
| SMS/Email/Auth | ✅ | 3 méthodes implémentées |
| Code valide/invalide | ✅ | Messages d'alerte corrects |
| Responsive design | ✅ | Mobile/Tablet/Desktop |
| Console logs | ✅ | Logs structurés [2FA] |
| Redirection sécurisée | ✅ | Vérif tempToken |

---

## 🎯 Résumé

**✅ La page 2FA est complètement implémentée et prête à:**
- ✅ Tests manuels sur http://127.0.0.1:5173
- ✅ Tests E2E avec Playwright
- ✅ Intégration avec backend réel
- ✅ Déploiement en production

**Les tests fournis ci-dessus couvrent:**
- Design et responsive
- Navigation utilisateur
- Gestion des erreurs
- Flux complet de sécurité
- Cas de bord critiques

---

**Version**: 2.1.0 | **Date**: 23 Jan 2026 | **Status**: 🚀 PRÊT POUR TEST
