# 🎯 Guide Rapide - Nouvelles Fonctionnalités 2FA

**Pour:** Utilisateurs finaux et support technique  
**Durée de lecture:** 5 minutes  
**Mise à jour:** 24 janvier 2026

---

## 🎮 Commandes Rapides

### Contrôles en Haut à Droite

```
┌─────────────────────┐
│  👁️   🌙   🤖     │
└─────────────────────┘
```

| Icône | Fonction | Touche |
|-------|----------|--------|
| 👁️ | Mode confidentiel | Cliquer |
| 🌙 | Dark mode | Cliquer |
| 🤖 | Voir fonctionnalités | Cliquer |

### Clavier

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Alt+1` | ← Authenticator |
| `Ctrl+Alt+2` | ← SMS |
| `Ctrl+Alt+3` | ← Email |
| `Ctrl+Enter` | Vérifier code |
| `Ctrl+V` | Coller code |

---

## 💡 Astuces d'Utilisation

### Astuce 1: Mode Confidentiel en Public
**Situation:** Vous êtes dans un lieu public, quelqu'un pourrait voir votre écran

**Solution:**
1. Cliquez l'icône 👁️ en haut à droite
2. Les chiffres du code s'affichent comme `•••••`
3. Vous pouvez entrer votre code en toute confiance
4. Cliquez 👁️ de nouveau pour réafficher les chiffres

### Astuce 2: Dark Mode pour la Nuit
**Situation:** Vous vous connectez tard, l'écran bleu vous éblouit

**Solution:**
1. Cliquez l'icône 🌙 en haut à droite
2. L'interface passe en thème sombre
3. Votre préférence est sauvegardée pour les prochaines fois
4. Cliquez 🌙 pour revenir au mode clair

### Astuce 3: Raccourci Clavier Méthodes
**Situation:** Vous préférez SMS mais Authenticator est sélectionné

**Solution:**
1. Appuyez sur `Ctrl+Alt+2` (SMS)
2. La méthode change instantanément
3. Attendez la réception du code
4. Entrez le code comme d'habitude

### Astuce 4: Coller un Code Complet
**Situation:** Vous avez copié votre code, ne voulez pas le retaper

**Solution:**
1. Appuyez sur `Ctrl+V` dans le premier champ
2. Les 5 chiffres se remplissent automatiquement
3. Message de confirmation: "Code collé avec succès"
4. Vérification automatique dans 1 seconde

### Astuce 5: Voir l'État des Intelligences
**Situation:** Vous voulez savoir quels assistants sont actifs

**Solution:**
1. Cliquez l'icône 🤖 en haut à droite
2. Une boîte s'affiche avec tous les assistants actifs
3. Chaque ligne montre une capacité intelligente
4. Cliquez 🤖 de nouveau pour refermer

---

## 🚨 Messages Système Décryptés

### Messages Verts ✅

| Message | Signification | Action |
|---------|---------------|--------|
| "✅ Code vérifié avec succès!" | Connexion réussie | Attendez redirection |
| "Code collé avec succès!" | Collage détecté | Vérification auto commence |
| "Méthode changée: SMS" | Raccourci clavier | Nouveau code sera envoyé |

### Messages Bleus ℹ️

| Message | Signification | Action |
|---------|---------------|--------|
| "⚠️ Connexion lente détectée" | Débit <1 Mbps | Soyez patient, attendre 1-2s extra |
| "💡 Méthode préférée détectée" | SPOFE se souvient | Changement auto dans 3s |
| "⚠️ Nouvelle localisation" | Connexion depuis nouveau lieu | Normal (voyages, déplacements) |

### Messages Rouges ❌

| Message | Signification | Action |
|---------|---------------|--------|
| "Code incorrect" | Code faux | Vérifiez votre source |
| "Séquence trop simple" | Code 12345 rejeté | Entrez un code aléatoire |
| "⚠️ Plusieurs tentatives échouées" | 3+ erreurs | Contactez support ou réessayez dans 5min |

---

## 🔍 Scénarios Courants

### Scénario 1: "J'ai oublié mon téléphone"
**Problème:** Code Authenticator inaccessible  
**Solution:**
1. Cliquez bouton "SMS" ou "Email"
2. Attendez le code par SMS/Email
3. Entrez-le comme d'habitude
4. ✅ Connecté sans téléphone!

**Si ça ne marche pas:**
1. Cliquez "Retour à la connexion"
2. Contactez le support technique
3. Support peut vous envoyer un code de secours

### Scénario 2: "Les codes ne correspondent pas"
**Problème:** Vous entrez le code exact mais ça dit "incorrect"  
**Cause possible:** Décalage de temps sur votre téléphone  
**Solution:**
1. Ouvrez Authenticator sur votre téléphone
2. Notez le code affiché
3. Attendez 2-3 secondes
4. Entrez le NOUVEAU code
5. Si ça fonctionne: codes changent toutes les 30s

### Scénario 3: "J'ai perdu mes codes de secours"
**Problème:** Vous n'avez plus accès à vos 5 codes de sauvegarde  
**Solution:**
1. Cliquez "Retour à la connexion"
2. Allez dans "Paramètres de compte"
3. Section "Sécurité" → "Codes de secours"
4. Cliquez "Générer nouveaux codes"
5. Sauvegardez-les quelque part de sûr (password manager)

---

## 🛡️ Conseils Sécurité

### ✅ Bonnes Pratiques

| À Faire | Pourquoi |
|---------|---------|
| Utiliser mode confidentiel en public | Éviter que quelqu'un voie votre code |
| Sauvegarder codes de secours | Accès de secours si téléphone perdu |
| Utiliser authenticator app | Plus sûr que SMS (moins d'interception) |
| Vérifier URL avant connexion | Éviter les faux sites (phishing) |
| Attendre 2-3s entre tentatives | Codes changent toutes les 30s |

### ❌ À Éviter

| À Éviter | Pourquoi |
|----------|---------|
| Partager votre code 2FA | Quelqu'un d'autre pourrait vous voler le compte |
| Utiliser code déjà utilisé | Code a expiré après 30s |
| Coller code SMS après délai | Code peut avoir expiré |
| Donner codes de secours à quelqu'un | C'est un accès de secours au compte |
| Rester connecté en public | Autre personne peut accéder au compte |

---

## ❓ FAQ - Questions Fréquentes

**Q: Dark mode est sauvegardé?**  
A: Oui, vos préférences sont sauvegardées automatiquement. Prochaine connexion = même thème.

**Q: Que fait le bouton 🤖?**  
A: Affiche la liste de tous les assistants intelligents qui vous aident (détection de connexion lente, codes de secours, etc.).

**Q: Mode confidentiel cache vraiment mon code?**  
A: Oui, les chiffres s'affichent comme `•••••` au lieu de vrais chiffres.

**Q: Si je fais Ctrl+V, ça envoie le code directement?**  
A: Non, ça remplissait juste les 5 champs. Vous devez cliquer "Vérifier" ou attendre 1s (auto-vérification).

**Q: Où sont stockées mes préférences?**  
A: Dans votre navigateur (localStorage). Stockage local = sûr, personne d'autre ne peut y accéder.

**Q: Mon téléphone me suggère un code, c'est normal?**  
A: Oui! iOS/Android détectent les codes 2FA. Vous pouvez tapoter la suggestion ou entrer manuellement.

**Q: Les codes de secours sont stockés où?**  
A: Pour l'instant en localStorage du navigateur. À l'avenir: stockage sécurisé sur serveur.

**Q: Que se passe-t-il si j'efface mon cache/cookies?**  
A: Vos préférences (dark mode, codes de secours) sont réinitialisées. Vos identifiants de connexion sont aussi supprimés = reconnexion requise.

---

## 📞 Support Technique

### Si quelque chose ne fonctionne pas:

**Étape 1: Rafraîchir la page**
```
Appuyez sur F5 ou Ctrl+R
Attendez 2 secondes
```

**Étape 2: Vider le cache**
```
Windows: Ctrl+Shift+Del
Mac: Cmd+Shift+Delete
Safari: Cmd+Y (historique)
```

**Étape 3: Essayer une autre méthode**
```
Si Authenticator ne fonctionne pas → essayez SMS
Si SMS ne fonctionne pas → essayez Email
```

**Étape 4: Contactez le support**
```
Email: support@spofe.sn
Téléphone: +221 XXXX XXXX
Chat: www.spofe.sn/help
```

### Infos à donner au support:

```
- Navigateur utilisé (Chrome, Firefox, Safari, etc.)
- Système d'exploitation (Windows, Mac, Linux, iOS, Android)
- Erreur exacte affichée
- Étapes pour reproduire le problème
- Capture d'écran si possible
```

---

## 🎓 Glossaire

| Terme | Explication |
|-------|------------|
| **2FA** | 2 Factor Authentication - Authentification à deux facteurs |
| **Authenticator** | App comme Google Authenticator, Microsoft Authenticator |
| **TOTP** | Time-based One-Time Password - Code qui change toutes les 30s |
| **Code de secours** | 5 codes alternatifs si vous perdez votre téléphone |
| **Confidentiel** | Mode où les chiffres sont masqués |
| **Dark mode** | Interface sombre pour réduire la fatigue oculaire |
| **localStorage** | Stockage de données dans votre navigateur |
| **Raccourci clavier** | Touche rapide pour exécuter une action |

---

## 🎯 Checklist Première Connexion

- [ ] Lire ce guide (5 min)
- [ ] Activer 2FA (Authenticator, SMS ou Email)
- [ ] Générer et sauvegarder codes de secours
- [ ] Tester avec un vrai code 2FA
- [ ] Essayer raccourci clavier Ctrl+Alt+2
- [ ] Activer dark mode et sauvegarder
- [ ] Revenir à clair pour vérifier persistence
- [ ] ✅ Terminé!

---

## 📊 Résumé des Nouvelles Features

| Feature | Bénéfice | Activation |
|---------|----------|-----------|
| Mode confidentiel | Sécurité en public | 👁️ bouton |
| Dark mode | Moins d'éblouissement | 🌙 bouton |
| Détection connexion lente | Alerte préventive | Auto |
| Suggestion méthode | Moins de clics | Auto |
| Codes de secours | Accès de secours | Auto |
| Raccourcis clavier | Connexion rapide | Ctrl+Alt+ |
| Coller code | Pas de retape | Ctrl+V |
| Affichage assistants | Transparence | 🤖 bouton |

---

**Version:** 1.0  
**Mise à jour:** 24 janvier 2026  
**Prochaine révision:** Mars 2026

