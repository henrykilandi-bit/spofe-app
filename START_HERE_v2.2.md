# 🚀 START HERE - Documentation SPOFE v2.2

**Bienvenue!** Cette page vous guide vers la bonne documentation.

---

## 🎯 Que voulez-vous faire?

### 👨‍💻 Je veux développer la page RegisterPage

**Lire d'abord:**
1. [`REGISTERPAGE_DOCUMENTATION_v2.2.md`](REGISTERPAGE_DOCUMENTATION_v2.2.md) - Guide complet (10 sections)
2. [`frontend/src/pages/RegisterPage.jsx`](frontend/src/pages/RegisterPage.jsx) - Code source

**Durée estimée:** 20-30 minutes

---

### 🔧 Je veux intégrer le backend

**Lire:**
1. [`REGISTERPAGE_DOCUMENTATION_v2.2.md` → Section "Guide intégration backend"`](REGISTERPAGE_DOCUMENTATION_v2.2.md#guide-intégration-backend)
2. [`cascade/QUICK_START.md`](cascade/QUICK_START.md) - Structure backend

**Tâches:**
- [ ] Mettre à jour schéma User (ajouter 6 colonnes)
- [ ] Créer/mettre à jour endpoints `/api/auth/register`
- [ ] Ajouter validations type_consultant
- [ ] Tester avec tous les rôles

**Durée estimée:** 2-3 heures

---

### ✅ Je veux tester l'application

**Lire:**
1. [`REGISTERPAGE_DOCUMENTATION_v2.2.md` → Section "Déploiement et tests"`](REGISTERPAGE_DOCUMENTATION_v2.2.md#déploiement-et-tests)

**Checklist test:**
```
- [ ] Formulaire s'affiche (2 étapes)
- [ ] Validation email/username en temps réel
- [ ] Force mot de passe visible
- [ ] Tous les 4 rôles disponibles
- [ ] Consultant: tous les 8 champs visibles
- [ ] Super Consultant: type consultant visible
- [ ] 195 pays disponibles (+ RDC)
- [ ] Région change selon pays sélectionné
- [ ] Tarif horaire sans devise
- [ ] Responsive design (mobile/tablet/desktop)
```

**Durée estimée:** 1-2 heures

---

### 📚 Je veux comprendre l'historique

**Consulter:**
1. [`technarchives/INDEX_ARCHIVES.md`](technarchives/INDEX_ARCHIVES.md)
2. Fichiers v2.1 dans `technarchives/` (DO NOT USE - informationnel seulement)

**Note:** Ces fichiers ne sont PAS à utiliser pour le développement courant!

---

### 🔍 Je cherche quelque chose de spécifique

**Navigation rapide:**

| Je cherche | Aller à |
|-----------|---------|
| Vue d'ensemble | [v2.2 - Vue d'ensemble](REGISTERPAGE_DOCUMENTATION_v2.2.md#vue-densemble) |
| Champs du formulaire | [v2.2 - Champs](REGISTERPAGE_DOCUMENTATION_v2.2.md#champs-de-formulaire) |
| Les 4 rôles | [v2.2 - Rôles](REGISTERPAGE_DOCUMENTATION_v2.2.md#systèmes-de-rôles) |
| Validation | [v2.2 - Validation](REGISTERPAGE_DOCUMENTATION_v2.2.md#validation-et-gestion-derreurs) |
| API Backend | [v2.2 - Backend](REGISTERPAGE_DOCUMENTATION_v2.2.md#guide-intégration-backend) |
| Déploiement | [v2.2 - Déploiement](REGISTERPAGE_DOCUMENTATION_v2.2.md#déploiement-et-tests) |
| Index doc | [DOCUMENTATION_INDEX_v2.2.md](DOCUMENTATION_INDEX_v2.2.md) |
| Archives | [technarchives/INDEX_ARCHIVES.md](technarchives/INDEX_ARCHIVES.md) |

---

## 🔑 Concepts clés v2.2

### 4 Rôles distincts
- **Utilisateur** (👤) - Admin compagnies
- **Super Utilisateur** (👑) - Admin groupe
- **Consultant** (💼) - Bailleurs, Investisseurs, Associés
- **Super Consultant** (🎓) - Coachs, Mentors, Auditeurs

### Champs conditionnels
Consultant & Super Consultant requièrent:
- Adresse
- Pays (195 pays du monde, dont RDC)
- Type consultant (options différentes par rôle)
- Spécialités
- Tarif horaire (sans devise)
- Expérience (années)

### Nouvelles features v2.2
✅ Champ type consultant pour Consultant ET Super Consultant  
✅ 195 pays (pas juste WAEMU)  
✅ Région dynamique selon pays sélectionné  
✅ Tarif sans devise XOF  
✅ Adresse/Pays au lieu de SIRET  

---

## 📂 Structure fichiers

```
SPOFE-APP/
├── 📖 REGISTERPAGE_DOCUMENTATION_v2.2.md ← LIRE D'ABORD
├── 📖 DOCUMENTATION_INDEX_v2.2.md ← NAVIGATION
├── 📖 DOCUMENTATION_UPDATE_SUMMARY_v2.2.md ← RÉSUMÉ CHANGES
├── 📖 START_HERE.md ← VOUS ÊTES ICI
│
├── frontend/
│   └── src/pages/
│       ├── RegisterPage.jsx ← CODE PRINCIPAL
│       └── RegisterPage.css ← STYLES
│
├── cascade/
│   ├── src/
│   │   ├── models/user.model.js ← À METTRE À JOUR
│   │   ├── controllers/auth.controller.js ← À METTRE À JOUR
│   │   └── routes/auth.routes.js
│   └── QUICK_START.md
│
└── technarchives/
    ├── INDEX_ARCHIVES.md ← Fichiers obsolètes (informatif)
    └── (18 fichiers ancienne version)
```

---

## ⚡ Quick Links

| Besoin | Lien |
|--------|------|
| Documentation complète | [REGISTERPAGE_DOCUMENTATION_v2.2.md](REGISTERPAGE_DOCUMENTATION_v2.2.md) |
| Index et navigation | [DOCUMENTATION_INDEX_v2.2.md](DOCUMENTATION_INDEX_v2.2.md) |
| Résumé changements | [DOCUMENTATION_UPDATE_SUMMARY_v2.2.md](DOCUMENTATION_UPDATE_SUMMARY_v2.2.md) |
| Code source frontend | [RegisterPage.jsx](frontend/src/pages/RegisterPage.jsx) |
| Styles frontend | [RegisterPage.css](frontend/src/pages/RegisterPage.css) |
| Backend quick start | [cascade/QUICK_START.md](cascade/QUICK_START.md) |
| Archives/Historique | [technarchives/INDEX_ARCHIVES.md](technarchives/INDEX_ARCHIVES.md) |

---

## ✅ Étapes recommandées

### Pour un nouveau développeur (30 min)
1. Lire cette page (5 min)
2. Lire `REGISTERPAGE_DOCUMENTATION_v2.2.md` (20 min)
3. Consulter `frontend/src/pages/RegisterPage.jsx` (5 min)

### Pour intégration backend (3 heures)
1. Lire guide intégration backend v2.2 (30 min)
2. Mettre à jour base de données (30 min)
3. Mettre à jour User model (30 min)
4. Créer/tester endpoints (60 min)
5. Tests de validation (30 min)

### Pour tests complets (2 heures)
1. Lire section déploiement v2.2 (20 min)
2. Lancer serveur frontend (5 min)
3. Tester tous les rôles (40 min)
4. Tester responsive design (20 min)
5. Documentation de bugs (35 min)

---

## 🆘 Problèmes courants

### Je trouve plusieurs fichiers RegisterPage
**Solution:** Utiliser ONLY `REGISTERPAGE_DOCUMENTATION_v2.2.md`  
Les autres fichiers dans `technarchives/` sont obsolètes (informationnel seulement)

### Le frontend ne s'affiche pas
**Solution:**
```bash
cd frontend
npm install
npm run dev
# Accéder à http://127.0.0.1:5173/register
```

### Le champ type_consultant n'apparaît pas
**Solution:** Rafraîchir Firefox (Ctrl+F5)  
Les fichiers CSS/JS sont mis en cache

### Je ne sais pas quels champs ajouter au backend
**Solution:** Consulter [v2.2 - Payload d'enregistrement](REGISTERPAGE_DOCUMENTATION_v2.2.md#payload-denregistrement)

---

## 📞 Support

**Questions?** Consulter:
- [`DOCUMENTATION_INDEX_v2.2.md`](DOCUMENTATION_INDEX_v2.2.md) - Navigation
- [`REGISTERPAGE_DOCUMENTATION_v2.2.md`](REGISTERPAGE_DOCUMENTATION_v2.2.md) - Réponses détaillées
- Code source: `frontend/src/pages/RegisterPage.jsx`

**Bug trouvé?** Créer issue avec:
- Reproduction steps
- Rôle testé
- Navigateur
- Résolution écran

---

**Version**: 2.2  
**Date**: 24 janvier 2026  
**Statut**: Production  
**Mainteneur**: Équipe développement SPOFE

👉 **NEXT:** Ouvrir [`REGISTERPAGE_DOCUMENTATION_v2.2.md`](REGISTERPAGE_DOCUMENTATION_v2.2.md)
