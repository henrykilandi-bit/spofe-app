# 🚨 Runbook Incident - Module Budget

**Version**: 1.0  
**Date**: 30 janvier 2026  
**Équipe**: DevOps + Backend

---

## 🎯 Objectif

Ce runbook décrit les procédures d'incident pour le module Budget en production.

---

## 📋 Incidents Critiques

### 1. Guardian rejette toutes les commandes

**Symptômes:**
- `budget_guardian_rejections_total` > 90%
- Logs: `GUARDIAN_VIOLATION`

**Diagnostic:**
```bash
# Vérifier les logs Guardian
kubectl logs -l app=spofe-budget --tail=100 | grep GUARDIAN_VIOLATION

# Vérifier les métriques
curl http://localhost:9090/metrics | grep budget_guardian
```

**Actions:**
1. Vérifier les invariants récemment modifiés
2. Rollback si nécessaire
3. Activer le mode read-only

**Commande rollback:**
```bash
kubectl rollout undo deployment/spofe-budget
```

---

### 2. Fuite cross-tenant (RLS bypass)

**Symptômes:**
- `budget_rls_violations_total` > 0
- Logs: `TENANT_ISOLATION_BREACH`

**Diagnostic:**
```sql
-- Vérifier les policies RLS
SELECT * FROM pg_policies WHERE tablename = 'budget_objectif';

-- Vérifier les connexions sans tenant_id
SELECT pid, usename, application_name, state
FROM pg_stat_activity
WHERE query NOT LIKE '%app.tenant_id%';
```

**Actions IMMÉDIATES:**
1. **KILL SWITCH**: Désactiver le module
2. Bloquer toutes les écritures
3. Audit complet des accès

**Kill switch:**
```sql
UPDATE system_flags SET is_enabled = false WHERE flag_key = 'budget_module_enabled';
```

---

### 3. Performance dégradée (p95 > 2s)

**Symptômes:**
- `budget_command_duration_seconds` p95 > 2s
- Timeouts côté client

**Diagnostic:**
```sql
-- Requêtes lentes
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query LIKE '%budget%'
ORDER BY duration DESC;
```

**Actions:**
1. Vérifier les index manquants
2. Analyser les plans d'exécution
3. Augmenter les ressources si nécessaire

---

### 4. Read-models désynchronisés

**Symptômes:**
- Écarts entre `rm_cashflow_projection` et données réelles
- Alertes utilisateurs

**Diagnostic:**
```sql
-- Vérifier la cohérence
SELECT COUNT(*) FROM budget_cashflow_projection_entries;
SELECT COUNT(*) FROM rm_cashflow_projection;
```

**Actions:**
1. Refresh matérialisé (si applicable)
2. Recalcul des vues
3. Vérifier les triggers

---

## 🔧 Commandes Utiles

### Mode Read-Only
```sql
-- Activer
REVOKE INSERT, UPDATE, DELETE ON budget_objectif FROM app_user;

-- Désactiver
GRANT INSERT, UPDATE ON budget_objectif TO app_user;
```

### Vérification RLS
```sql
-- Tester isolation tenant
SET app.tenant_id = 'TENANT_A';
SELECT COUNT(*) FROM budget_objectif; -- Doit retourner uniquement TENANT_A

SET app.tenant_id = 'TENANT_B';
SELECT COUNT(*) FROM budget_objectif; -- Doit retourner uniquement TENANT_B
```

### Monitoring
```bash
# Métriques Prometheus
curl http://localhost:9090/api/v1/query?query=budget_commands_total

# Logs en temps réel
kubectl logs -f -l app=spofe-budget
```

---

## 📞 Contacts

- **On-call Backend**: +33 X XX XX XX XX
- **DevOps Lead**: +33 X XX XX XX XX
- **Security Team**: security@spofe.com

---

## 📚 Références

- `MODULE_BUDGET_CONTRACT.md`
- `CONFORMITE_100_PLAN.md`
- Grafana: https://grafana.spofe.com/d/budget
- Prometheus: https://prometheus.spofe.com

---

**Dernière mise à jour**: 30 janvier 2026
