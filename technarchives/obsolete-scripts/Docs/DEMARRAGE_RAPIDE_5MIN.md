# ⚡ DÉMARRAGE RAPIDE - 5 MINUTES

**Objectif**: Mettre en place surveillance en 5 minutes  
**Prérequis**: Node.js + NPM installés

---

## 🎯 EN 5 MINUTES (VERSION ULTRA-RAPIDE)

### ✅ Étape 1: Test (1 min)
```bash
bash TEST_RAPIDE_SURVEILLANCE.sh
# Vérifie que tout est en place
```

### ✅ Étape 2: Première surveillance (1 min)
```bash
cd cascade
npm run monitor:critical
# Exécute les 32 vérifications
```

### ✅ Étape 3: Voir le rapport (1 min)
```bash
tail -100 logs/surveillance.log
# Affiche résultats
```

### ✅ Étape 4: Cronjob (1 min)
```bash
crontab -e
# Ajouter cette ligne:
# 0 * * * * cd /chemin/vers/cascade && npm run monitor:critical
```

### ✅ Étape 5: Documenter (1 min)
```bash
# Lire cette page:
cat ../SURVEILLANCE_1PAGE_RESUME.md
# Imprimer et afficher
```

---

## 📋 RÉSUMÉ 32 FICHIERS

**À surveiller:**
- 7 fichiers Configuration
- 6 fichiers Base de Données
- 5 fichiers Sécurité
- 7 fichiers Middleware
- 4 fichiers Modèles ORM
- 3 fichiers Logs

**Comment?**
- Cronjob: `0 * * * * npm run monitor:critical`
- Slack: Notifications automatiques
- Grafana: Dashboard temps réel

---

## 🚀 COMMANDES ESSENTIELLES

```bash
# Surveillance immédiate
npm run monitor:critical

# Vérifier BD + surveillance
npm run sync:db

# Test rapide
bash TEST_RAPIDE_SURVEILLANCE.sh

# Voir alertes
grep "ALERT\|CRITICAL" cascade/logs/surveillance.log
```

---

## 📚 DOCUMENTATION

| Fichier | Durée | Utilité |
|---------|-------|---------|
| SURVEILLANCE_1PAGE_RESUME.md | 5 min | À lire en priorité |
| FICHIERS_CRITIQUES_A_SURVEILLER.md | 15 min | Référence complète |
| GUIDE_IMPLEMENTATION_SURVEILLANCE.md | 30 min | Déploiement complet |

---

## ✨ PRÊT!

Vous avez maintenant:
✅ 32 fichiers surveillés
✅ Alertes automatiques
✅ Diagnostique rapide
✅ Production ready

**Prochaine étape**: Lire documentation complète

---

**Version**: 2.1.0  
**Status**: ✅ GO!
