# 📘 Guide d'Installation - Audit Automatisé SPOFE v2.1

## 🧩 Fichiers Inclus
- `SPOFE_DB_CHECK.sql` : Vérification complète de la structure de la base.
- `triggers_audit.sql` : Création des triggers d’audit.
- `audit_auto_db.js` : Exécution automatique des audits et génération de rapports.
- `logs/audit_db_reports/` : Dossier de stockage des rapports d’audit.

## ⚙️ Installation
1. Placez les fichiers dans :
   ```bash
   C:\Users\henry\Desktop\SPOFE-APP VERS 1.0\cascade\src\scripts\database\
   ```

2. Exécutez le script des triggers :
   ```bash
   mysql -u root -p spofe_v2_1 < src/scripts/database/triggers_audit.sql
   ```

3. Lancez l’audit automatique :
   ```bash
   node src/scripts/database/audit_auto_db.js
   ```

## 🧾 Résultat
Les rapports seront enregistrés ici :
```
/cascade/logs/audit_db_reports/
```

Chaque rapport contient la date, l’état des tables, et le résultat de la vérification.

---
💡 Conseil : configurez une tâche planifiée Windows pour exécuter `audit_auto_db.js` toutes les nuits à minuit.
