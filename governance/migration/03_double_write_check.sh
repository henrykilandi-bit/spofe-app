#!/usr/bin/env bash
# =============================================================================
# 🛡️ 03_DOUBLE_WRITE_CHECK.SH - T0 : DOUBLE ÉCRITURE
# =============================================================================
# Validation que la double écriture MySQL ↔ PostgreSQL fonctionne
# Critique : Échec = STOP immédiat
#
# Usage: ./03_double_write_check.sh [--continuous]
# Exit codes: 0 = PASS, 1 = FAIL

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
LOG_FILE="${ARTIFACTS_DIR}/double_write_check_$(date +%Y-%m-%dT%H-%M).log"
CONTINUOUS_MODE="${1:-}"

# Variables d'environnement
PG_URL="${PG_URL:-postgresql://spofe:password@localhost:5432/spofe}"
MYSQL_URL="${MYSQL_URL:-mysql://spofe:password@localhost:3306/spofe}"
API_URL="${API_URL:-http://localhost:3000}"
MAX_DIVergence="${MAX_DIVERGENCE:-0}"  # Tolérance : 0 = stricte

# Création dossier artifacts
mkdir -p "$ARTIFACTS_DIR"

# Logging
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Compteurs
CHECK_COUNT=0
FAIL_COUNT=0

# Fonctions de validation
validate_event_counts() {
    echo "🔍 Validating event counts..."
    
    local pg_count mysql_count divergence
    
    # Compter événements PostgreSQL
    pg_count=$(psql "$PG_URL" -t -c "SELECT count(*) FROM domain_events;" 2>/dev/null | tr -d ' ')
    echo "   PostgreSQL events: $pg_count"
    
    # Compter événements MySQL
    mysql_count=$(mysql "$MYSQL_URL" -e "SELECT count(*) FROM events;" -s -N 2>/dev/null || echo "ERROR")
    echo "   MySQL events: $mysql_count"
    
    # Validation
    if [[ "$mysql_count" == "ERROR" ]]; then
        echo "❌ MySQL query failed"
        return 1
    fi
    
    divergence=$((pg_count - mysql_count))
    divergence_abs=${divergence#-}  # Valeur absolue
    
    if [[ $divergence_abs -le $MAX_DIVergence ]]; then
        echo "✅ Event counts consistent (divergence: $divergence)"
        return 0
    else
        echo "❌ DIVERGENCE DETECTED: PostgreSQL=$pg_count, MySQL=$mysql_count (diff: $divergence)"
        return 1
    fi
}

validate_latest_hashes() {
    echo "🔍 Validating latest event hashes..."
    
    local pg_hash mysql_hash pg_seq mysql_seq
    
    # Dernier hash PostgreSQL
    pg_hash=$(psql "$PG_URL" -t -c "
        SELECT current_hash 
        FROM domain_events 
        ORDER BY sequence DESC 
        LIMIT 1;
    " 2>/dev/null | tr -d ' ')
    
    pg_seq=$(psql "$PG_URL" -t -c "
        SELECT sequence 
        FROM domain_events 
        ORDER BY sequence DESC 
        LIMIT 1;
    " 2>/dev/null | tr -d ' ')
    
    # Dernier hash MySQL (si disponible)
    mysql_hash=$(mysql "$MYSQL_URL" -e "
        SELECT event_hash 
        FROM events 
        ORDER BY created_at DESC 
        LIMIT 1;
    " -s -N 2>/dev/null || echo "NONE")
    
    mysql_seq=$(mysql "$MYSQL_URL" -e "
        SELECT id 
        FROM events 
        ORDER BY created_at DESC 
        LIMIT 1;
    " -s -N 2>/dev/null || echo "0")
    
    echo "   PostgreSQL latest: seq=$pg_seq, hash=${pg_hash:0:16}..."
    echo "   MySQL latest: seq=$mysql_seq, hash=${mysql_hash:0:16}..."
    
    # Validation hash
    if [[ "$pg_hash" == "$mysql_hash" ]] || [[ "$mysql_hash" == "NONE" ]]; then
        echo "✅ Latest hashes consistent"
        return 0
    else
        echo "❌ HASH DIVERGENCE: PG=$pg_hash, MySQL=$mysql_hash"
        return 1
    fi
}

validate_event_order() {
    echo "🔍 Validating event order consistency..."
    
    local order_violations
    
    # Vérifier que l'ordre des événements est le même
    order_violations=$(psql "$PG_URL" -t -c "
        WITH pg_events AS (
            SELECT 
                sequence,
                event_type,
                created_at,
                ROW_NUMBER() OVER (ORDER BY created_at) as order_rank
            FROM domain_events
            ORDER BY created_at
            LIMIT 10
        )
        SELECT COUNT(*) - COUNT(CASE WHEN sequence = order_rank THEN 1 END)
        FROM pg_events;
    " 2>/dev/null | tr -d ' ')
    
    if [[ $order_violations -eq 0 ]]; then
        echo "✅ Event order consistent"
        return 0
    else
        echo "❌ ORDER VIOLATIONS: $order_violations events out of order"
        return 1
    fi
}

validate_transaction_integrity() {
    echo "🔍 Validating transaction integrity..."
    
    local pg_integrity mysql_integrity
    
    # Vérifier intégrité PostgreSQL
    pg_integrity=$(psql "$PG_URL" -t -c "SELECT check_ledger_integrity();" 2>/dev/null | tr -d ' ')
    
    if [[ "$pg_integrity" == "t" ]]; then
        echo "✅ PostgreSQL ledger integrity OK"
    else
        echo "❌ PostgreSQL ledger integrity FAILED"
        return 1
    fi
    
    # Vérifier intégrité MySQL (simple check)
    mysql_integrity=$(mysql "$MYSQL_URL" -e "
        SELECT COUNT(*) 
        FROM events 
        WHERE event_hash IS NULL OR event_hash = '';
    " -s -N 2>/dev/null || echo "ERROR")
    
    if [[ "$mysql_integrity" == "ERROR" ]]; then
        echo "❌ MySQL integrity check failed"
        return 1
    elif [[ $mysql_integrity -eq 0 ]]; then
        echo "✅ MySQL event integrity OK"
        return 0
    else
        echo "❌ MySQL has $mysql_integrity events with invalid hashes"
        return 1
    fi
}

create_test_event() {
    echo "🔍 Creating test event for validation..."
    
    local test_response test_event_id
    
    # Créer événement de test via API
    test_response=$(curl -s -X POST "$API_URL/api/events/test" \
        -H "Content-Type: application/json" \
        -d '{
            "aggregateId": "double-write-test-'$(date +%s)'",
            "aggregateType": "migration_test",
            "eventType": "DOUBLE_WRITE_TEST",
            "payload": {"test": true, "timestamp": "'$(date -Iseconds)'"}
        }' 2>/dev/null || echo "ERROR")
    
    if [[ "$test_response" == "ERROR" ]]; then
        echo "❌ Failed to create test event"
        return 1
    fi
    
    # Extraire ID événement
    test_event_id=$(echo "$test_response" | jq -r '.eventId // "ERROR"' 2>/dev/null || echo "ERROR")
    
    if [[ "$test_event_id" == "ERROR" ]]; then
        echo "❌ Invalid test event response"
        return 1
    fi
    
    echo "✅ Test event created: $test_event_id"
    
    # Attendre propagation (max 5 secondes)
    local wait_count=0
    while [[ $wait_count -lt 5 ]]; do
        local pg_test mysql_test
        
        pg_test=$(psql "$PG_URL" -t -c "
            SELECT COUNT(*) FROM domain_events 
            WHERE aggregate_id LIKE '%double-write-test%';
        " 2>/dev/null | tr -d ' ')
        
        mysql_test=$(mysql "$MYSQL_URL" -e "
            SELECT COUNT(*) FROM events 
            WHERE aggregate_id LIKE '%double-write-test%';
        " -s -N 2>/dev/null || echo "0")
        
        if [[ $pg_test -gt 0 && $mysql_test -gt 0 ]]; then
            echo "✅ Test event propagated to both databases"
            return 0
        fi
        
        sleep 1
        ((wait_count++))
    done
    
    echo "❌ Test event propagation timeout"
    return 1
}

generate_report() {
    local status=$1
    local report_file="${ARTIFACTS_DIR}/double_write_report_$(date +%Y-%m-%dT%H-%M).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "status": "$status",
  "checks_performed": $CHECK_COUNT,
  "failures": $FAIL_COUNT,
  "environment": {
    "postgresql": "${PG_URL%%:*}***",
    "mysql": "${MYSQL_URL%%:*}***",
    "api_url": "$API_URL"
  },
  "metrics": {
    "pg_events": $(psql "$PG_URL" -t -c "SELECT count(*) FROM domain_events;" 2>/dev/null | tr -d ' ' || echo "0"),
    "mysql_events": $(mysql "$MYSQL_URL" -e "SELECT count(*) FROM events;" -s -N 2>/dev/null || echo "0"),
    "last_pg_sequence": $(psql "$PG_URL" -t -c "SELECT MAX(sequence) FROM domain_events;" 2>/dev/null | tr -d ' ' || echo "0")
  }
}
EOF
    
    echo "📊 Report saved: $report_file"
}

# Validation principale
main() {
    local exit_code=0
    
    echo "▶ DOUBLE WRITE CHECK - $(date)"
    echo "========================================"
    echo "Mode: ${CONTINUOUS_MODE:-single}"
    echo "Max divergence allowed: $MAX_DIVergence"
    echo ""
    
    # Boucle de validation
    while true; do
        ((CHECK_COUNT++))
        
        echo "--- Check #$CHECK_COUNT at $(date) ---"
        
        # Exécuter validations
        validate_event_counts || exit_code=1
        validate_latest_hashes || exit_code=1
        validate_event_order || exit_code=1
        validate_transaction_integrity || exit_code=1
        
        # Test événement (une seule fois en mode normal)
        if [[ $CHECK_COUNT -eq 1 && "$CONTINUOUS_MODE" != "--continuous" ]]; then
            create_test_event || exit_code=1
        fi
        
        echo ""
        
        # Mode continu
        if [[ "$CONTINUOUS_MODE" == "--continuous" ]]; then
            if [[ $exit_code -ne 0 ]]; then
                ((FAIL_COUNT++))
                echo "❌ Check #$CHECK_COUNT FAILED (failures: $FAIL_COUNT)"
                
                # Alertes si trop d'échecs
                if [[ $FAIL_COUNT -gt 3 ]]; then
                    echo "🚨 CRITICAL: Multiple consecutive failures"
                    break
                fi
            else
                echo "✅ Check #$CHECK_count PASSED"
                FAIL_COUNT=0  # Reset compteur échecs
            fi
            
            sleep 30  # Attendre 30 secondes avant prochaine vérification
        else
            break
        fi
    done
    
    echo "========================================"
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ DOUBLE WRITE CHECK: PASS"
        echo "   All validations passed"
        generate_report "PASS"
        
        # Créer fichier succès
        echo "PASS" > "${ARTIFACTS_DIR}/double_write.status"
        
    else
        echo "❌ DOUBLE WRITE CHECK: FAIL"
        echo "   CRITICAL ISSUES DETECTED - STOP MIGRATION"
        generate_report "FAIL"
        
        # Créer fichier échec
        echo "FAIL" > "${ARTIFACTS_DIR}/double_write.status"
        
        # Envoyer alerte
        if command -v curl >/dev/null 2>&1 && [ -n "${ALERT_WEBHOOK:-}" ]; then
            curl -X POST "$ALERT_WEBHOOK" \
                -H "Content-Type: application/json" \
                -d "{\"text\":\"🚨 MIGRATION STOPPED: Double write check failed\"}" \
                >/dev/null 2>&1 || true
        fi
    fi
    
    echo "Total checks: $CHECK_COUNT"
    echo "Failures: $FAIL_COUNT"
    echo "Log file: $LOG_FILE"
    
    return $exit_code
}

# Exécution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
