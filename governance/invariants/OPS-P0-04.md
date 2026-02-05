# 🛡️ INVARIANT OPÉRATIONNEL OPS-P0-04

## Read-Only Effectif de MySQL

---

### **📋 IDENTIFICATION**

| Champ | Valeur |
|-------|--------|
| **Identifiant** | `OPS-P0-04` |
| **Nom** | Read-only effectif de MySQL |
| **Version** | `1.0` |
| **Statut** | `CONSTITUTIONNEL` |
| **Création** | `2026-02-05` |
| **Auteur** | `SPOFE Governance Team` |

---

### **🎯 DÉFINITION FORMELLE**

**Énoncé formel :**

> Post-bascule, MySQL ne doit accepter aucune écriture métier. Toute tentative d'opération `INSERT`, `UPDATE`, `DELETE` sur les tables métier doit échouer. MySQL devient une source de lecture historique uniquement, tandis que PostgreSQL reste la seule source d'écriture légitime.

---

### **🔍 PORTÉE ET CONTEXTE**

| Aspect | Description |
|--------|-------------|
| **Système** | MySQL (source historique) |
| **Tables concernées** | `events` et toutes tables métier |
| **Période de validité** | `POST-BASCULE UNIQUEMENT` |
| **Niveau de criticité** | `BLOQUANT` |
| **Mode** | `READ-ONLY + SUPER-READ-ONLY` |

---

### **✅ CONDITIONS DE VALIDITÉ**

#### **Condition Principale - Variables Globales**
```sql
-- MySQL doit être en read-only
SELECT @@global.read_only = 1 as read_only_enabled;
SELECT @@global.super_read_only = 1 as super_read_only_enabled;
-- Résultat attendu : true pour les deux
```

#### **Condition Secondaire - Insert Refusé**
```sql
-- Toute tentative INSERT doit échouer
INSERT INTO events (
    id, aggregate_id, aggregate_type, event_type, payload, created_at, event_hash
) VALUES (
    'read-only-test', 'test', 'test', 'TEST', '{}', NOW(), 'test'
);
-- Résultat attendu : ERROR (read-only mode)
```

#### **Condition Tertiaire - Update Refusé**
```sql
-- Toute tentative UPDATE doit échouer
UPDATE events SET payload = '{"test": "read_only"}' WHERE id = 'non-existent';
-- Résultat attendu : ERROR (read-only mode)
```

#### **Condition Quaternaire - Delete Refusé**
```sql
-- Toute tentative DELETE doit échouer
DELETE FROM events WHERE id = 'non-existent';
-- Résultat attendu : ERROR (read-only mode)
```

#### **Condition Quinaire - Create/Drop Refusé**
```sql
-- Création table doit échouer
CREATE TABLE read_only_test (id VARCHAR(36));
-- Résultat attendu : ERROR (read-only mode)

-- Suppression table doit échouer
DROP TABLE IF EXISTS read_only_test;
-- Résultat attendu : ERROR (read-only mode)
```

---

### **🧪 MÉCANISMES DE PREUVE**

#### **Preuve Principale**
- **Script** : `04_mysql_read_only.sql`
- **Type** : `VALIDATION ÉTAT`
- **Exécution** : `mysql "$MYSQL_URL" -f 04_mysql_read_only.sql`
- **Résultat attendu** : `Lectures OK, écritures ERROR`

#### **Preuve de Connexions**
```sql
-- Analyse connexions actives
SELECT 
    'WRITING_CONNECTIONS' as metric,
    COUNT(*) as writing_connections,
    GROUP_CONCAT(DISTINCT USER) as writing_users
FROM INFORMATION_SCHEMA.PROCESSLIST 
WHERE COMMAND IN ('Insert', 'Update', 'Delete', 'Create', 'Drop', 'Alter');
-- Résultat attendu : 0 écriture en cours
```

#### **Preuve de Statistiques**
```sql
-- Statistiques actuelles (lecture seule)
SELECT 
    COUNT(*) as total_events,
    MIN(created_at) as first_event,
    MAX(created_at) as last_event
FROM events;
-- Résultat attendu : Lecture réussie
```

---

### **⏰ MOMENTS DE VÉRIFICATION**

| Phase | Action | Critère |
|-------|--------|---------|
| **PRÉ-BASCULE** | Validation préparation | ⚠️ MySQL writable |
| **BASCULE** | Activation read-only | ✅ Variables = 1 |
| **POST-BASCULE** | Validation immédiate | ✅ Écritures refusées |
| **PRODUCTION** | Surveillance continue | ✅ Aucune écriture |
| **LONG TERME** | Validation périodique | ✅ Maintien read-only |

---

### **🚨 GESTION DES VIOLATIONS**

#### **Détection de Violation**
```bash
# Vérification variables read-only
read_only_status=$(mysql "$MYSQL_URL" -e "SELECT @@global.read_only;" -s -N)
super_read_only=$(mysql "$MYSQL_URL" -e "SELECT @@global.super_read_only;" -s -N)

if [ "$read_only_status" != "1" ] || [ "$super_read_only" != "1" ]; then
    echo "🚨 VIOLATION OPS-P0-04 : MySQL not in read-only mode"
    echo "read_only=$read_only_status, super_read_only=$super_read_only"
    exit 1
fi

# Test écriture (doit échouer)
if mysql "$MYSQL_URL" -e "INSERT INTO events (id) VALUES ('test');" 2>/dev/null; then
    echo "🚨 VIOLATION OPS-P0-04 : MySQL write succeeded"
    exit 1
fi
```

#### **Conséquences**
- **Immédiat** : `STOP MIGRATION`
- **Bascule** : `INVALIDE`
- **Risque** : `FORK de vérité`
- **État système** : `ILLÉGITIME`
- **Action requise** : `Restauration read-only`

#### **Procédure d'Urgence**
1. **Identifier la cause** de la perte read-only
2. **Arrêter immédiatement** l'application
3. **Restaurer read-only** : `SET GLOBAL read_only = ON`
4. **Activer super_read-only** : `SET GLOBAL super_read_only = ON`
5. **Valider l'état** avec script de test
6. **Analyser les écritures** non autorisées
7. **Reprendre migration** après validation

---

### **🔗 INTÉGRATION SYSTÈME**

#### **Dépendances**
- **Prérequis** : `OPS-P0-03` (Cohérence double-écriture)
- **Dépend de** : Bascule réussie vers PostgreSQL
- **Prépare** : `OPS-P0-05` (Capacité d'écriture PostgreSQL)

#### **Interface Technique**
```typescript
interface MySQLReadOnlyValidation {
  invariantId: 'OPS-P0-04';
  status: 'PASS' | 'FAIL' | 'WARNING';
  proof: string;
  timestamp: Date;
  details: {
    readOnlyEnabled: boolean;
    superReadOnlyEnabled: boolean;
    writingConnections: number;
    lastWriteAttempt: Date | null;
    totalEvents: number;
  };
}
```

---

### **📊 MÉTRIQUES DE SURVEILLANCE**

| Métrique | Seuil | Action |
|----------|-------|--------|
| **@@global.read_only** | `= 1` | ✅ Normal |
| **@@global.super_read_only** | `= 1` | ✅ Normal |
| **Connexions écriture** | `= 0` | ✅ Normal |
| **Tentatives écriture** | `> 0` | 📊 Log |
| **Validation script** | `PASS` | ✅ OK |

---

### **🔐 GARANTIES CONSTITUTIONNELLES**

#### **Garantie d'Unicité**
- **Source unique** : PostgreSQL devient seule source d'écriture
- **Non-fork** : Impossible d'avoir deux vérités divergentes
- **Historique préservé** : MySQL reste lisible mais non modifiable

#### **Garantie Opérationnelle**
- **Validation continue** : Surveillance de l'état read-only
- **Détection immédiate** : Alerte sur toute écriture
- **Restauration automatique** : Retour à l'état sécurisé

---

### **📋 CHECKLIST DE CONFORMITÉ**

- [ ] **Script `04_mysql_read_only.sql`** exécuté avec succès
- [ ] **`@@global.read_only = 1`** activé
- [ ] **`@@global.super_read_only = 1`** activé
- [ ] **INSERT/UPDATE/DELETE** refusés
- [ ] **CREATE/DROP TABLE** refusés
- [ ] **Aucune connexion** en écriture active
- [ ] **Monitoring read-only** configuré
- [ ] **Procédure restauration** documentée

---

### **🔄 HISTORIQUE DES VERSIONS**

| Version | Date | Modifications | Auteur |
|---------|------|---------------|--------|
| `1.0` | `2026-02-05` | Création invariant read-only | SPOFE Gov Team |
| | | Formalisation protection fork | |
| | | Intégration surveillance continue | |

---

### **🎯 CRITÈRE DE SUCCÈS**

**L'invariant OPS-P0-04 est valide lorsque :**

1. ✅ **Variables globales** read-only activées
2. ✅ **Toutes écritures** métier refusées
3. ✅ **Lectures** fonctionnent normalement
4. ✅ **Aucune connexion** en écriture active
5. ✅ **Monitoring** état read-only opérationnel
6. ✅ **PostgreSQL** seule source d'écriture

---

## **🏆 CONCLUSION**

**OPS-P0-04 garantit l'unicité de la source de vérité post-bascule.**

MySQL devient une **archive immuable** tandis que PostgreSQL reste la seule source d'écriture légitime. Toute tentative d'écriture dans MySQL est immédiatement bloquée, prévenant tout fork de vérité.

**Le système acquiert une propriété d'unicité de source de vérité.**

---

*Invariant constitutionnel OPS-P0-04 - Version 1.0*  
*SPOFE Governance Team - 5 Février 2026*  
*Protégé par read-only MySQL - Preuve par blocage écritures*
