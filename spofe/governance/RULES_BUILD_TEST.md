# RULES_BUILD_TEST.md

**Version:** 1.1.0  
**Statut:** OFFICIEL  
**Applicabilité:** Immédiate  
**Opposabilité:** Contractuelle  

## 🎯 OBJECTIF

Définir les règles SPOFE pour distinguer formellement les **rapports de diagnostic** des **preuves exécutables opposables** dans le processus de validation technique.

## 🚫 RÈGLE FONDAMENTALE : NON-SUBSTITUABILITÉ

**Un rapport de diagnostic NE PEUT PAS être utilisé comme BUILD_PROOF SPOFE.**

### ❌ INTERDIT
- Utiliser un fichier .md de diagnostic comme preuve de production
- Présenter des "métriques" sans exécution contrôlée
- Valider un module sur la base d'un rapport statique
- Contourner la validation technique par documentation

### ✅ AUTORISÉ
- Utiliser les diagnostics pour l'investigation et le debugging
- Générer des rapports de développement et de monitoring
- Documenter l'état technique à des fins d'analyse
- Compléter les BUILD_PROOF par des métriques contextuelles

## 🏗️ BUILD_PROOF SPOFE - DÉFINITION CONTRACTUELLE

### Artefact officiel et exclusif pour validation GO PROD

Un BUILD_PROOF SPOFE valide DOIT :

1. **✅ Être généré par exécution automatique**
   - Script reproductible : `generate-build-proof.ts`
   - Validation en temps réel des métriques
   - Tests exécutés et résultats vérifiés

2. **✅ Contenir des preuves d'exécution**
   - Compilation TypeScript : 0 erreur (`npx tsc --noEmit`)
   - Tests unitaires : résultats d'exécution Jest
   - Architecture SPOFE : vérification des couches
   - Configuration : validation des fichiers critiques

3. **✅ Être daté et traçable**
   - Timestamp de génération
   - Version du module validé
   - Environnement d'exécution
   - Hash Git du commit validé

4. **✅ Fournir un statut binaire**
   - 🟢 SUCCESS : Module prêt pour production
   - 🔴 ERROR : Blockers critiques détectés
   - 🟡 WARNING : Améliorations recommandées

## 📊 RAPPORTS DE DIAGNOSTIC - UTILISATION LÉGITIME

### Outils d'analyse et d'investigation (NON opposables)

Les rapports de diagnostic peuvent :

1. **🔍 Analyser l'état du code**
   - Détecter les problèmes techniques
   - Documenter les erreurs rencontrées
   - Proposer des pistes d'amélioration

2. **📈 Fournir des métriques contextuelles**
   - Nombre de fichiers TypeScript
   - Couverture de tests estimée
   - Architecture et structure détectée

3. **🗂️ Documenter les investigations**
   - Historique des erreurs résolues
   - Évolution de la qualité technique
   - Traçabilité des corrections

## 🔒 CHAÎNE DE VALIDATION OFFICIELLE

### Séquence obligatoire pour validation GO PROD

1. **Phase de développement**
   - Rapports de diagnostic autorisés pour debugging
   - Investigation libre des problèmes techniques

2. **Phase de stabilisation** 
   - Correction des erreurs identifiées
   - Validation incrémentale par diagnostic

3. **Phase de validation contractuelle**
   - ⚠️ SEUL le BUILD_PROOF SPOFE est opposable
   - Exécution de `npm run build-proof`
   - Statut GO PROD basé uniquement sur le résultat

4. **Phase de production**
   - Déploiement autorisé seulement si BUILD_PROOF = SUCCESS
   - Traçabilité complete maintenue

## 🎮 RESPONSABILITÉS

### Développeurs
- Utiliser les diagnostics pour analyser et corriger
- Exécuter le BUILD_PROOF avant toute demande de validation
- Ne jamais substituer diagnostic et BUILD_PROOF

### Architectes/Tech Leads  
- Valider uniquement sur BUILD_PROOF SUCCESS
- Rejeter toute validation basée sur diagnostic
- Maintenir la rigueur de la chaîne officielle

### DevOps/Release Management
- Intégrer BUILD_PROOF dans les pipelines CI/CD
- Bloquer les déploiements sans BUILD_PROOF valide
- Maintenir la traçabilité des validations

## 🚨 VIOLATIONS ET SANCTIONS

### Cas de violation
- Utilisation d'un diagnostic comme BUILD_PROOF
- Validation GO PROD sans BUILD_PROOF SUCCESS  
- Contournement de la chaîne officielle
- Documentation trompeuse sur l'état technique

### Conséquences
- ⛔ Rejet immédiat de la demande de validation
- 📋 Audit technique obligatoire du module
- 🔄 Re-validation complète requise
- 📢 Communication à l'équipe sur la violation

## 🔄 MISE À JOUR ET ÉVOLUTION

### Versioning de ce document
- **v1.0.0** : Règles initiales SPOFE
- **v1.1.0** : Clarification diagnostic vs BUILD_PROOF (CURRENT)
- Futures versions : évolution contrôlée et documentée

### Processus de modification
1. Proposition via branche `governance/*`
2. Review technique et métier
3. Validation architecturale  
4. Mise à jour officielle avec traçabilité Git

---

**Document officiel SPOFE - Non modifiable sans processus gouvernance**  
**Dernière mise à jour : 2026-02-02**
