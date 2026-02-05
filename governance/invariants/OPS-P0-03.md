# 🛡️ INVARIANT OPÉRATIONNEL OPS-P0-03

## Cohérence Double-Écriture

---

### **📋 IDENTIFICATION**

| Champ | Valeur |
|-------|--------|
| **Identifiant** | `OPS-P0-03` |
| **Nom** | Cohérence double-écriture |
| **Version** | `1.0` |
| **Statut** | `CONSTITUTIONNEL` |
| **Création** | `2026-02-05` |
| **Auteur** | `SPOFE Governance Team` |

---

### **🎯 DÉFINITION FORMELLE**

**Énoncé formel :**

> En phase transitoire de double-écriture, MySQL et PostgreSQL doivent contenir exactement le même nombre de faits. Toute divergence entre les deux bases de données constitue une violation immédiate de la légitimité du système.

---

### **🔍 PORTÉE ET CONTEXTE**

| Aspect | Description |
|--------|-------------|
| **Système** | MySQL (legacy) ↔ PostgreSQL (constitutionnel) |
| **Tables concernées** | `events` (MySQL) ↔ `domain_events` (PostgreSQL) |
| **Période de validité** | `PHASE DOUBLE-ÉCRITURE UNIQUEMENT` |
| **Niveau de criticité** | `BLOQUANT` |
| **Tolérance** | `0 divergence` |

---

### **✅ CONDITIONS DE VALIDITÉ**

#### **Condition Principale - Égalité des Compteurs**
```bash
# Nombre d'événements identique
PG_COUNT=$(psql "$PG_URL" -t -c "SELECT count(*) FROM domain_events;")
MYSQL_COUNT=$(mysql "$MYSQL_URL" -e "SELECT count(*) FROM events;" -s -N)

# Test d'égalité stricte
if [ "$PG_COUNT" != "$MYSQL_COUNT" ]; then
    echo "VIOLATION: PG=$PG_COUNT, MySQL=$MYSQL_COUNT"
    exit 1
fi
# Résultat attendu : Égalité parfaite
```

#### **Condition Secondaire - Dernier Hash Cohérent**
```sql
-- PostgreSQL dernier hash
SELECT current_hash FROM domain_events 
ORDER BY sequence DESC LIMIT 1;

-- MySQL dernier hash (si disponible)
SELECT event_hash FROM events 
ORDER BY created_at DESC LIMIT 1;
-- Résultat attendu : Hashs identiques
```

#### **Condition Tertiaire - Ordre Chronologique**
```sql
-- Ordre des événements préservé
WITH pg_events AS (
  SELECT 
    event_type,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at) as order_rank
  FROM domain_events
  ORDER BY created_at
  LIMIT 10
)
SELECT COUNT(*) - COUNT(CASE WHEN sequence = order_rank THEN 1 END)
FROM pg_events;
-- Résultat attendu : 0 (pas de désordre)
```

---

### **🧪 MÉCANISMES DE PREUVE**

#### **Preuve Principale**
- **Script** : `03_double_write_check.sh`
- **Type** : `VALIDATION CONTINUE`
- **Exécution** : `./03_double_write_check.sh --continuous`
- **Fréquence** : `Toutes les 30 secondes`
- **Résultat attendu** : `PASS continu`

#### **Preuve de Convergence**
```bash
# Test événement de propagation
create_test_event() {
    local test_response=$(curl -s -X POST "$API_URL/api/events" \
        -H "Content-Type: application/json" \
        -d '{"aggregateId": "test-'$(date +%s)'", "eventType": "TEST"}')
    
    # Vérifier propagation dans les deux bases
    # Résultat attendu : Présent dans MySQL ET PostgreSQL
}
```

#### **Preuve d'Intégrité Transactionnelle**
```sql
-- Validation transaction PostgreSQL
SELECT check_ledger_integrity();

-- Validation cohérence MySQL
SELECT COUNT(*) FROM events 
WHERE event_hash IS NULL OR event_hash = '';
-- Résultat attendu : 0 événement invalide
```

---

### **⏰ MOMENTS DE VÉRIFICATION**

| Phase | Action | Critère |
|-------|--------|---------|
| **DÉBUT DOUBLE-ÉCRITURE** | Validation initiale | ✅ Compteurs égaux |
| **PENDING DOUBLE-ÉCRITURE** | Surveillance continue | ✅ Monitoring actif |
| **TEST ÉVÉNEMENTS** | Validation propagation | ✅ Convergence OK |
| **PRÉ-BASCULE** | Validation finale | ✅ 0 divergence |
| **POST-BASCULE** | Plus applicable | ⚠️ Invariant retiré |

---

### **🚨 GESTION DES VIOLATIONS**

#### **Détection de Violation**
```bash
# Surveillance continue avec seuil zéro
while true; do
    pg_count=$(psql "$PG_URL" -t -c "SELECT count(*) FROM domain_events;")
    mysql_count=$(mysql "$MYSQL_URL" -e "SELECT count(*) FROM events;" -s -N)
    
    divergence=$((pg_count - mysql_count))
    if [ $divergence -ne 0 ]; then
        echo "🚨 VIOLATION OPS-P0-03 : Divergence $divergence détectée"
        send_alert "Double write divergence detected: $divergence"
        break
    fi
    sleep 30
done
```

#### **Conséquences**
- **Immédiat** : `STOP DOUBLE-ÉCRITURE`
- **Migration** : `ROLLBACK vers phase précédente`
- **Investigation** : `Analyse logs des deux bases`
- **Action requise** : `Synchronisation manuelle`

#### **Procédure d'Urgence**
1. **Arrêter immédiatement** la double-écriture
2. **Isoler les divergences** identifiées
3. **Analyser la chronologie** des écritures
4. **Synchroniser manuellement** si possible
5. **Reprendre double-écriture** après validation
6. **Échouer si non-résolvable** → rollback complet

---

### **🔗 INTÉGRATION SYSTÈME**

#### **Dépendances**
- **Prérequis** : `OPS-P0-01` (Immutabilité PostgreSQL)
- **Dépend de** : `OPS-P0-02` (Intégrité chaîne)
- **Prépare** : `OPS-P0-04` (Read-only MySQL)

#### **Interface Technique**
```typescript
interface DoubleWriteValidation {
  invariantId: 'OPS-P0-03';
  status: 'PASS' | 'FAIL' | 'WARNING';
  proof: string;
  timestamp: Date;
  details: {
    pgEventCount: number;
    mysqlEventCount: number;
    divergence: number;
    lastPgHash: string;
    lastMysqlHash: string;
    propagationDelay: number;
  };
}
```

---

### **📊 MÉTRIQUES DE SURVEILLANCE**

| Métrique | Seuil | Action |
|----------|-------|--------|
| **Divergence compteur** | `= 0` | ✅ Normal |
| **Délai propagation** | `< 5s` | ✅ OK |
| **Hashs cohérents** | `100%` | ✅ Normal |
| **Échecs écriture** | `= 0` | ✅ OK |
| **Validation continue** | `ACTIVE` | ✅ Monitoring |

---

### **🔐 GARANTIES CONSTITUTIONNELLES**

#### **Garantie de Convergence**
- **Égalité stricte** : Zéro tolérance de divergence
- **Propagation garantie** : Chaque événement dans les deux bases
- **Ordre préservé** : Chronologie identique

#### **Garantie Opérationnelle**
- **Surveillance continue** : Monitoring 24/7
- **Détection immédiate** : Alerte sur toute divergence
- **Rollback automatique** : Retour à état stable

---

### **📋 CHECKLIST DE CONFORMITÉ**

- [ ] **Script `03_double_write_check.sh`** en mode continu
- [ ] **Compteurs événements** identiques (PG = MySQL)
- [ ] **Dernier hash** cohérent entre les deux bases
- [ ] **Propagation test** événement < 5 secondes
- [ ] **Monitoring alertes** configuré
- [ ] **Procédure rollback** documentée
- [ ] **Logs synchronisation** analysés

---

### **🔄 HISTORIQUE DES VERSIONS**

| Version | Date | Modifications | Auteur |
|---------|------|---------------|--------|
| `1.0` | `2026-02-05` | Création invariant double-écriture | SPOFE Gov Team |
| | | Formalisation surveillance continue | |
| | | Intégration mécanismes de rollback | |

---

### **🎯 CRITÈRE DE SUCCÈS**

**L'invariant OPS-P0-03 est valide lorsque :**

1. ✅ **Compteurs événements** parfaitement égaux
2. ✅ **Dernier hash** identique dans les deux bases
3. ✅ **Propagation** des nouveaux événements < 5s
4. ✅ **Ordre chronologique** préservé
5. ✅ **Monitoring continu** opérationnel
6. ✅ **Aucune divergence** détectée

---

## **🏆 CONCLUSION**

**OPS-P0-03 garantit la convergence parfaite pendant la transition.**

La double-écriture devient une **preuve de synchronisation** où MySQL et PostgreSQL maintiennent une vérité identique. Toute divergence déclenche un arrêt immédiat pour préserver la légitimité du système.

**La transition devient une migration sans perte de vérité.**

---

*Invariant constitutionnel OPS-P0-03 - Version 1.0*  
*SPOFE Governance Team - 5 Février 2026*  
*Protégé par surveillance continue - Preuve par convergence stricte*
