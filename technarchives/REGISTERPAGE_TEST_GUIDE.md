# Guide de Test - RegisterPage Implementation

**Date:** 24 Janvier 2026  
**Cible:** Vérification complète de l'implémentation intelligente  
**Durée estimée:** 30-45 minutes  

---

## 🚀 Démarrage des Services

### 1. Arrêter tous les services actuels

```powershell
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✓ Tous les services Node.js arrêtés"
```

### 2. Vérifier la base de données MySQL

```powershell
# Vérifier que MySQL est accessible
curl http://localhost:3306 -v -ErrorAction SilentlyContinue

# Ou depuis PowerShell:
Test-NetConnection localhost -Port 3306
```

### 3. Démarrer le Backend

```powershell
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\cascade"
npm run dev
```

**Attendu:**
```
[timestamp] Server running on http://localhost:3001
Database connected successfully
Redis cache initialized
```

### 4. Démarrer le Frontend (nouvel terminal)

```powershell
cd "c:\Users\henry\Desktop\SPOFE-APP VERS 1.0\frontend"
npm run dev
```

**Attendu:**
```
VITE v4.x.x ready in xxxx ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## ✅ Test 1: Interface Visuelle - Sélecteur de Rôle

### Actions:
1. Naviguer vers `http://localhost:5173/register`
2. Remplir étape 1 (email, username, password)
3. Cliquer sur "Suivant →"
4. Observer l'étape 2

### Vérifications:

**✓ Présence du sélecteur de rôle**
- [ ] Dropdown visible avec label "Profil utilisateur *"
- [ ] Icon User avant le label
- [ ] 3 options visibles: Utilisateur Standard, Super Utilisateur, Consultant

**✓ Valeur par défaut**
- [ ] Sélection vide au départ (-- Sélectionner un profil --)
- [ ] Message d'erreur après validation sans sélection

**✓ Comportement du badge**
- [ ] Badge n'apparaît pas si aucune sélection
- [ ] Au sélection "Utilisateur Standard": Badge vert "👤 Standard" apparaît
- [ ] Au sélection "Consultant": Badge bleu "👔 Consultant" apparaît
- [ ] Au sélection "Super Utilisateur": Badge jaune "⚙️ Super Utilisateur" apparaît

**✓ Animation du badge**
- [ ] Badge glisse vers le bas (animation slide-down)
- [ ] Durée ~0.3 secondes
- [ ] Transitions fluides

---

## ✅ Test 2: Champs Consultant - Affichage Conditionnel

### Actions:
1. Dans le formulaire étape 2
2. Sélectionner "Consultant" dans le dropdown

### Vérifications:

**✓ Affichage de la section consultant**
- [ ] Section "Informations Consultant" apparaît après Téléphone
- [ ] Border dashed gris autour de la section
- [ ] Fond légèrement grisé (bg-secondary)
- [ ] Animation fade-in progressive

**✓ Présence des 4 champs**
- [ ] SIRET: input text avec placeholder "12345678901234"
- [ ] Spécialités: textarea avec placeholder descriptif
- [ ] Tarif horaire: input number avec unité "XOF"
- [ ] Expérience: input number avec label "années"

**✓ Disparition au changement**
- [ ] Sélectionner "Utilisateur Standard"
- [ ] Section "Informations Consultant" disparaît
- [ ] Sélectionner "Consultant" à nouveau
- [ ] Section réapparaît avec les données conservées (state management)

---

## ✅ Test 3: Validation des Champs Consultant

### Test 3.1: SIRET Validation

**Cas 1: SIRET vide avec rôle consultant**
- [ ] Sélectionner "Consultant"
- [ ] Laisser SIRET vide
- [ ] Cliquer "Créer mon compte"
- [ ] Erreur: "SIRET requis pour les consultants"

**Cas 2: SIRET moins de 14 chiffres**
- [ ] Entrer "123456789"
- [ ] Blur du champ
- [ ] Erreur: "SIRET doit contenir 14 chiffres"

**Cas 3: SIRET avec lettres**
- [ ] Entrer "1234567890ABC4"
- [ ] Erreur: "SIRET doit contenir 14 chiffres"

**Cas 4: SIRET valide (14 chiffres)**
- [ ] Entrer "12345678901234"
- [ ] Pas d'erreur
- [ ] Champ accepte la valeur

### Test 3.2: Spécialités Validation

**Cas 1: Spécialités vides avec rôle consultant**
- [ ] Sélectionner "Consultant"
- [ ] Laisser Spécialités vide
- [ ] Cliquer "Créer mon compte"
- [ ] Erreur: "Spécialités requises"

**Cas 2: Spécialités dépassant 500 caractères**
- [ ] Entrer 501+ caractères
- [ ] Blur du champ
- [ ] Erreur: "Maximum 500 caractères"
- [ ] Compteur affiche "501/500"

**Cas 3: Spécialités valides**
- [ ] Entrer "Comptabilité générale, audit interne"
- [ ] Pas d'erreur
- [ ] Compteur affiche "35/500"

### Test 3.3: Tarif Horaire Validation

**Cas 1: Tarif vide avec rôle consultant**
- [ ] Sélectionner "Consultant"
- [ ] Laisser Tarif vide
- [ ] Cliquer "Créer mon compte"
- [ ] Erreur: "Tarif horaire requis"

**Cas 2: Tarif négatif**
- [ ] Entrer "-1000"
- [ ] Erreur: "Tarif doit être un nombre positif"

**Cas 3: Tarif zéro**
- [ ] Entrer "0"
- [ ] Pas d'erreur (valide)

**Cas 4: Tarif valide**
- [ ] Entrer "50000"
- [ ] Pas d'erreur

**Cas 5: Tarif avec décimales**
- [ ] Entrer "50000.50"
- [ ] Pas d'erreur
- [ ] Conversion correcte en float

### Test 3.4: Expérience Validation

**Cas 1: Expérience optionnelle**
- [ ] Sélectionner "Consultant"
- [ ] Laisser Expérience vide
- [ ] Cliquer "Créer mon compte"
- [ ] Pas d'erreur (optionnel)

**Cas 2: Expérience négative**
- [ ] Entrer "-1"
- [ ] Erreur: "Expérience doit être entre 0 et 80 ans"

**Cas 3: Expérience supérieure à 80**
- [ ] Entrer "81"
- [ ] Erreur: "Expérience doit être entre 0 et 80 ans"

**Cas 4: Expérience valide (0-80)**
- [ ] Entrer "15"
- [ ] Pas d'erreur

---

## ✅ Test 4: Messages Personnalisés

### Actions:
1. Remplir complètement le formulaire pour chaque rôle
2. Observer les messages informatifs et d'approbation

### Vérifications:

**Utilisateur Standard:**
- [ ] Hint sous le dropdown: "Accès standard aux outils comptables de base"
- [ ] Message d'approbation: "Votre inscription a été soumise pour approbation..."
- [ ] Message de succès: "Bienvenue ! Votre compte a été créé avec succès."

**Consultant:**
- [ ] Hint sous le dropdown: "Vous accédez aux outils de gestion de projets et de facturation"
- [ ] Section "Informations Consultant" avec sous-titre
- [ ] Message d'approbation: "Votre demande d'adhésion en tant que consultant a été soumise..."
- [ ] Message de succès: "Bienvenue ! Votre profil consultant a été créé avec succès."

**Super Utilisateur:**
- [ ] Hint sous le dropdown: "Accès complet aux outils de gestion et d'administration"
- [ ] Message d'approbation: "Votre demande d'accès en tant que super utilisateur..."
- [ ] Message de succès: "Bienvenue ! Vous avez accès à tous les outils de gestion."

---

## ✅ Test 5: Intégration Backend

### Test 5.1: Enregistrement Utilisateur Standard

**Données:**
```
Email: utilisateur@test.com
Username: utilisateur_test
Password: Test@12345
Prénom: Jean
Nom: Dupont
Téléphone: +221 77 123 45 67
Rôle: Utilisateur Standard
```

**Vérifications:**
- [ ] Inscription réussie → Redirection /login
- [ ] Message notification positive
- [ ] Vérifier en base: `SELECT * FROM users WHERE email='utilisateur@test.com';`
- [ ] Colonne `role` = 'utilisateur'
- [ ] Colonnes consultant vides (siret, specialites, tarif_horaire, experience_years)

### Test 5.2: Enregistrement Consultant

**Données:**
```
Email: consultant@test.com
Username: consultant_test
Password: Test@12345
Prénom: Marie
Nom: Martin
Téléphone: +221 77 234 56 78
Rôle: Consultant
SIRET: 12345678901234
Spécialités: Comptabilité générale, audit fiscal
Tarif horaire: 75000
Expérience: 12
```

**Vérifications:**
- [ ] Inscription réussie
- [ ] Message notification: "Votre profil consultant a été créé..."
- [ ] Vérifier en base:
  ```sql
  SELECT email, role, siret, specialites, tarif_horaire, experience_years 
  FROM users 
  WHERE email='consultant@test.com';
  ```
- [ ] role = 'consultant'
- [ ] siret = '12345678901234'
- [ ] specialites = 'Comptabilité générale, audit fiscal'
- [ ] tarif_horaire = 75000
- [ ] experience_years = 12

### Test 5.3: Enregistrement Super Utilisateur

**Données:**
```
Email: super@test.com
Username: super_test
Password: Test@12345
Prénom: Admin
Nom: Principal
Téléphone: +221 77 345 67 89
Rôle: Super Utilisateur
```

**Vérifications:**
- [ ] Inscription réussie
- [ ] Message notification: "Vous avez accès à tous les outils..."
- [ ] Vérifier en base:
  ```sql
  SELECT email, role FROM users WHERE email='super@test.com';
  ```
- [ ] role = 'super_utilisateur'
- [ ] Colonnes consultant NULL (pas requises)

---

## ✅ Test 6: Workflow d'Approbation

### Cas: Consultant avec groupe (requiresApproval = true)

**Actions:**
1. Obtenir un token d'invitation avec groupeId
2. S'inscrire en tant que consultant avec ce token
3. Vérifier la création de pending_role_approvals

**Vérifications:**
- [ ] Message d'approbation personnalisé
- [ ] Redirection vers /login avec message contextuel
- [ ] Vérifier en base:
  ```sql
  SELECT * FROM pending_role_approvals 
  WHERE email='consultant@test.com';
  ```
- [ ] Status = 'pending'
- [ ] requested_role = 'consultant'
- [ ] consultant_info contient siret, specialites, tarif_horaire

---

## ✅ Test 7: Responsive Design

### Testé sur différents breakpoints:

**Desktop (1024px+)**
- [ ] Tous les éléments visibles et espacés correctement
- [ ] Badge rôle à droite du select
- [ ] Section consultant bien alignée

**Tablet (768px - 1023px)**
- [ ] Form-row: Passe à 1 colonne
- [ ] Tout reste lisible

**Mobile (< 768px)**
- [ ] Boutons empilés verticalement
- [ ] Inputs prennent 100% largeur
- [ ] Text réduit proportionnellement
- [ ] Badge toujours visible

---

## ✅ Test 8: Validation HTML5

Ouvrir la console browser (F12) et vérifier:

**Attributs requis:**
- [ ] Tous les inputs `required` ont `aria-required="true"`
- [ ] Labels liés via `htmlFor`
- [ ] Inputs ont `type` approprié

**Validation:**
- [ ] SIRET: `maxLength="14"`, `inputMode="numeric"`
- [ ] Tarif: `type="number"`, `min="0"`, `step="1000"`
- [ ] Expérience: `type="number"`, `min="0"`, `max="80"`
- [ ] Spécialités: `maxLength="500"`

---

## ✅ Test 9: Gestion des Erreurs

### Cas 1: Erreur Réseau

**Actions:**
1. Arrêter le serveur backend
2. Tenter une inscription
3. Observer le comportement

**Vérifications:**
- [ ] Message d'erreur: "Impossible de contacter le serveur"
- [ ] Pas de crash frontend
- [ ] Bouton reste cliquable après erreur

### Cas 2: Email Déjà Utilisé

**Actions:**
1. Inscrire utilisateur_1
2. Tenter d'inscrire avec même email
3. Observer les vérifications

**Vérifications:**
- [ ] Check-email affiche XCircle après 500ms
- [ ] Erreur: "Cet email est déjà utilisé"
- [ ] Bouton soumission désactivé

### Cas 3: Username Déjà Pris

**Actions:**
1. Inscrire utilisateur_1
2. Tenter d'inscrire avec même username
3. Observer les vérifications

**Vérifications:**
- [ ] Check-username affiche XCircle après 500ms
- [ ] Erreur: "Ce nom d'utilisateur est déjà pris"
- [ ] Bouton soumission désactivé

---

## 📋 Checklist Complète

```
AFFICHAGE (Sélecteur de Rôle):
☐ Dropdown visible
☐ 3 options présentes
☐ Badge apparaît/disparaît correctement
☐ Animation slide-down
☐ Couleurs distinctes par rôle

AFFICHAGE (Champs Consultant):
☐ Section apparaît au sélection "Consultant"
☐ Section disparaît aux autres sélections
☐ 4 champs présents (SIRET, Spécialités, Tarif, Expérience)
☐ Styling: Border dashed, fond grisé
☐ Animation fade-in

VALIDATION:
☐ Role: Obligatoire
☐ SIRET: 14 chiffres si consultant
☐ Spécialités: Obligatoires, max 500 chars si consultant
☐ Tarif: Positif, obligatoire si consultant
☐ Expérience: 0-80, optionnel si consultant

MESSAGES:
☐ Hints contextualisés par rôle
☐ Messages d'approbation personnalisés
☐ Messages de succès personnalisés
☐ Messages d'erreur clairs

BACKEND:
☐ Role envoyé au backend
☐ Champs consultant sérialisés correctly
☐ Données sauvegardées en base
☐ Workflow d'approbation fonctionne

RESPONSIVE:
☐ Desktop: Tout visible
☐ Tablet: Adaptée
☐ Mobile: Utilisable

ACCESSIBILITÉ:
☐ Labels liés aux inputs
☐ Validation claire
☐ Messages d'erreur visibles
☐ Pas d'erreurs console
```

---

## 🐛 Dépannage

### Problème: Section consultant n'apparaît pas

**Causes possibles:**
1. État `role` n'a pas été mis à jour
2. Condition `formData.role === 'consultant'` invalide
3. CSS ne charge pas

**Solutions:**
```javascript
// Vérifier dans console:
console.log('formData.role:', formData.role); // Doit afficher "consultant"
console.log('Condition:', formData.role === 'consultant'); // Doit être true
```

### Problème: Validation consultant toujours échoue

**Causes possibles:**
1. `validateForm()` pas appelée correctement
2. Erreurs set mais jamais supprimées
3. Validation regex incorrecte

**Solutions:**
```javascript
// Dans handleSubmit, avant axios.post:
console.log('Erreurs:', errors);
console.log('Valid:', validateForm());
console.log('Payload:', JSON.stringify(payload, null, 2));
```

### Problème: Backend reçoit null pour champs consultant

**Causes possibles:**
1. Spread operator ne fonctionne pas
2. Conversion parseInt/parseFloat échoue
3. Backend n'accepte pas les champs

**Solutions:**
```javascript
// Vérifier dans Network tab (F12):
// Payload sent: {"role":"consultant","siret":"...","specialites":"..."}
// Réponse: Vérifier status 200 vs 400
```

---

## 📝 Rapport de Test

Après avoir complété tous les tests, créer un rapport:

```markdown
# Rapport de Test RegisterPage

**Date:** [date]
**Testeur:** [nom]
**Environnement:** Local (Backend 3001, Frontend 5173)

## Résumé
- Tests exécutés: [nombre]
- Tests réussis: [nombre]
- Tests échoués: [nombre]
- Taux de réussite: [%]

## Tests Détaillés
### ✅ Test 1: Interface Visuelle
[Résultats]

### ✅ Test 2: Champs Consultant
[Résultats]

...

## Problèmes Identifiés
[Lister les problèmes rencontrés et solutions appliquées]

## Recommandations
[Suggestions d'amélioration]

**Statut Global:** ✅ APPROUVÉ / ⚠️ À REVOIR / ❌ BLOCANT
```

---

**Guide Créé:** 24 Janvier 2026  
**Validité:** Pour tout test en environnement local  
**Support:** Consulter REGISTERPAGE_IMPLEMENTATION_COMPLETE.md pour détails

