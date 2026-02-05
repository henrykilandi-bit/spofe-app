# 🛡️ INVARIANT OPÉRATIONNEL OPS-P0-05

## Capacité d'Écriture Légitime Post-Bascule

---

### **📋 IDENTIFICATION**

| Champ | Valeur |
|-------|--------|
| **Identifiant** | `OPS-P0-05` |
| **Nom** | Capacité d'écriture légitime post-bascule |
| **Version** | `1.0` |
| **Statut** | `CONSTITUTIONNEL` |
| **Création** | `2026-02-05` |
| **Auteur** | `SPOFE Governance Team` |

---

### **🎯 DÉFINITION FORMELLE**

**Énoncé formel :**

> Immédiatement après bascule, le système doit démontrer sa capacité à écrire un nouvel événement de manière légitime uniquement via le ledger constitutionnel PostgreSQL. Cette écriture doit générer automatiquement son hash cryptographique et maintenir l'intégrité de la chaîne.

---

### **🔍 PORTÉE ET CONTEXTE**

| Aspect | Description |
|--------|-------------|
| **Système** | PostgreSQL (source unique de vérité) |
| **API cible** | `POST /api/events` |
| **Table concernée** | `domain_events` |
| **Période de validité** | `IMMÉDIATEMENT POST-BASCULE` |
| **Niveau de criticité** | `BLOQUANT` |
| **Mode** | `VALIDATION CAPACITÉ` |

---

### **✅ CONDITIONS DE VALIDITÉ**

#### **Condition Principale - Création Événement**
```bash
# Création événement de test via API
test_response=$(curl -s -X POST "$API_URL/api/events" \
    -H "Content-Type: application/json" \
    -d '{
        "aggregateId": "post-switch-test-'$(date +%s)'",
        "aggregateType": "smoke_test",
        "eventType": "POST_SWITCH_TEST",
        "payload": {"test": "capacity", "timestamp": "'$(date -Iseconds)'"}
    }')

# Validation réponse
event_id=$(echo "$test_response" | jq -r '.eventId // "ERROR"')
if [ "$event_id" = "ERROR" ]; then
    echo "VIOLATION: Event creation failed"
    exit 1
fi
# Résultat attendu : eventId valide retourné
```

#### **Condition Secondaire - Persistance PostgreSQL**
```sql
-- Vérifier événement persisté
SELECT COUNT(*) as event_found
FROM domain_events 
WHERE aggregate_id LIKE '%post-switch-test%'
  AND event_type = 'POST_SWITCH_TEST';
-- Résultat attendu : 1 (exactement)
```

#### **Condition Tertiaire - Hash Automatique**
```sql
-- Vérifier hash généré automatiquement
SELECT current_hash, LENGTH(current_hash) as hash_length
FROM domain_events 
WHERE aggregate_id LIKE '%post-switch-test%'
  AND event_type = 'POST_SWITCH_TEST'
ORDER BY created_at DESC
LIMIT 1;
-- Résultat attendu : hash SHA-256 de 64 caractères
```

#### **Condition Quaternaire - Intégrité Chaîne Maintenue**
```sql
-- Validation intégrité après nouvel événement
SELECT check_ledger_integrity() as chain_integrity;
-- Résultat attendu : true
```

#### **Condition Quinaire - Séquence Continue**
```sql
-- Vérifier continuité séquence
WITH sequence_check AS (
    SELECT 
        sequence,
        ROW_NUMBER() OVER (ORDER BY sequence) as expected_seq
    FROM domain_events
),
gaps AS (
    SELECT COUNT(*) as gap_count
    FROM sequence_check
    WHERE sequence != expected_seq
)
SELECT gap_count FROM gaps;
-- Résultat attendu : 0 (pas de trou)
```

---

### **🧪 MÉCANISMES DE PREUVE**

#### **Preuve Principale**
- **Script** : `05_post_switch_smoke_test.sh`
- **Type** : `VALIDATION CAPACITÉ COMPLÈTE`
- **Exécution** : `./05_post_switch_smoke_test.sh --detailed`
- **Résultat attendu** : `PASS complet`

#### **Preuve de Propagation**
```bash
# Test propagation événement
wait_for_propagation() {
    local test_id="$1"
    local max_wait=10
    local wait_count=0
    
    while [ $wait_count -lt $max_wait ]; do
        local count=$(psql "$PG_URL" -t -c "
            SELECT COUNT(*) FROM domain_events 
            WHERE aggregate_id = '$test_id';
        ")
        
        if [ "$count" -gt 0 ]; then
            echo "Event propagated in ${wait_count}s"
            return 0
        fi
        
        sleep 1
        ((wait_count++))
    done
    
    echo "Propagation timeout"
    return 1
}
```

#### **Preuve de Performance**
```bash
# Test performance écriture
performance_test() {
    local start_time=$(date +%s%N)
    
    # Créer 5 événements
    for i in {1..5}; do
        curl -s -X POST "$API_URL/api/events" \
            -H "Content-Type: application/json" \
            -d "{\"aggregateId\": \"perf-test-$i\", \"eventType\": \"PERF_TEST\"}" \
            >/dev/null
    done
    
    local end_time=$(date +%s%N)
    local duration=$(( (end_time - start_time) / 1000000 ))
    
    echo "5 events written in ${duration}ms"
    # Résultat attendu : < 5000ms
}
```

---

### **⏰ MOMENTS DE VÉRIFICATION**

| Phase | Action | Critère |
|-------|--------|---------|
| **IMMÉDIATEMENT POST-BASCULE** | Validation capacité | ✅ Écriture réussie |
| **5 MINUTES POST** | Validation continue | ✅ Maintien capacité |
| **PRODUCTION** | Surveillance écriture | ✅ Monitoring actif |
| **LONG TERME** | Validation périodique | ✅ Système opérationnel |

---

### **🚨 GESTION DES VIOLATIONS**

#### **Détection de Violation**
```bash
# Test complet de capacité
run_capacity_test() {
    echo "Testing post-switch capacity..."
    
    # 1. Création événement
    if ! create_test_event; then
        echo "🚨 VIOLATION OPS-P0-05 : Event creation failed"
        return 1
    fi
    
    # 2. Persistance
    if ! validate_persistence; then
        echo "🚨 VIOLATION OPS-P0-05 : Event not persisted"
        return 1
    fi
    
    # 3. Hash automatique
    if ! validate_hash_generation; then
        echo "🚨 VIOLATION OPS-P0-05 : Hash not generated"
        return 1
    fi
    
    # 4. Intégrité chaîne
    if ! validate_chain_integrity; then
        echo "🚨 VIOLATION OPS-P0-05 : Chain integrity broken"
        return 1
    fi
    
    echo "✅ OPS-P0-05 : Capacity validated"
    return 0
}
```

#### **Conséquences**
- **Immédiat** : `SYSTÈME BLOQUÉ OU COMPROMIS`
- **Migration** : `ÉCHEC`
- **Opérationnel** : `INDISPONIBLE`
- **Action requise** : `Investigation + Correction`

#### **Procédure d'Urgence**
1. **Analyser les logs** PostgreSQL et application
2. **Vérifier la connectivité** API ↔ PostgreSQL
3. **Valider les triggers** de défense
4. **Tester manuellement** l'insertion SQL
5. **Corriger la configuration** si nécessaire
6. **Re-valider la capacité** après correction

---

### **🔗 INTÉGRATION SYSTÈME**

#### **Dépendances**
- **Prérequis** : `OPS-P0-01` (Immutabilité)
- **Dépend de** : `OPS-P0-02` (Intégrité chaîne)
- **Dépend de** : `OPS-P0-04` (Read-only MySQL)

#### **Interface Technique**
```typescript
interface PostSwitchCapacityValidation {
  invariantId: 'OPS-P0-05';
  status: 'PASS' | 'FAIL' | 'WARNING';
  proof: string;
  timestamp: Date;
  details: {
    eventCreated: boolean;
    eventPersisted: boolean;
    hashGenerated: boolean;
    chainIntegrity: boolean;
    sequenceContinuity: boolean;
    writeLatency: number;
    finalHash: string;
  };
}
```

---

### **📊 MÉTRIQUES DE SURVEILLANCE**

| Métrique | Seuil | Action |
|----------|-------|--------|
| **Création événement** | `SUCCESS` | ✅ Normal |
| **Persistance** | `< 5s` | ✅ OK |
| **Hash généré** | `SHA-256` | ✅ Normal |
| **Intégrité chaîne** | `true` | ✅ OK |
| **Latence écriture** | `< 1000ms` | ✅ OK |
| **Validation script** | `PASS` | ✅ OK |

---

### **🔐 GARANTIES CONSTITUTIONNELLES**

#### **Garantie de Capacité**
- **Écriture fonctionnelle** : Le système peut écrire légitimement
- **Hash automatique** : PostgreSQL génère les preuves
- **Intégrité maintenue** : Chaîne cryptographique préservée

#### **Garantie Opérationnelle**
- **Validation immédiate** : Test post-bascule réussi
- **Performance acceptable** : Latence dans limites
- **Monitoring continu** : Surveillance écriture

---

### **📋 CHECKLIST DE CONFORMITÉ**

- [ ] **Script `05_post_switch_smoke_test.sh`** exécuté avec succès
- [ ] **Événement créé** via API
- [ ] **Événement persisté** dans PostgreSQL
- [ ] **Hash SHA-256** généré automatiquement
- [ ] **Intégrité chaîne** maintenue
- [ ] **Séquence continue** sans trou
- [ ] **Latence écriture** acceptable
- [ ] **API endpoints** fonctionnels

---

### **🔄 HISTORIQUE DES VERSIONS**

| Version | Date | Modifications | Auteur |
|---------|------|---------------|--------|
| `1.0` | `2026-02-05` | Création invariant capacité | SPOFE Gov Team |
| | | Formalisation validation complète | |
| | | Intégration tests performance | |

---

### **🎯 CRITÈRE DE SUCCÈS**

**L'invariant OPS-P0-05 est valide lorsque :**

1. ✅ **Événement créé** avec succès via API
2. ✅ **Persistance** confirmée dans PostgreSQL
3. ✅ **Hash SHA-256** généré automatiquement
4. ✅ **Intégrité chaîne** maintenue
5. ✅ **Séquence continue** préservée
6. ✅ **Performance** dans limites acceptables
7. ✅ **Système opérationnel** post-bascule

---

## **🏆 CONCLUSION**

**OPS-P0-05 garantit la capacité opérationnelle du système post-bascule.**

Le système démontre sa capacité à écrire de manière légitime uniquement via le ledger constitutionnel, avec génération automatique des preuves cryptographiques et maintien de l'intégrité.

**Le système acquiert une propriété de capacité d'écriture légitime et prouvable.**

---

*Invariant constitutionnel OPS-P0-05 - Version 1.0*  
*SPOFE Governance Team - 5 Février 2026*  
*Protégé par validation capacité - Preuve par écriture fonctionnelle*
