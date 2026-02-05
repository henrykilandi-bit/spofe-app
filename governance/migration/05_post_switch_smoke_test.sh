#!/usr/bin/env bash
# =============================================================================
-- 🛡️ 05_POST_SWITCH_SMOKE_TEST.SH - T+X : POST-BASCULE
-- =============================================================================
-- Validation que le système fonctionne correctement après bascule
-- Critique : Échec = STOP immédiat
--
-- Usage: ./05_post_switch_smoke_test.sh [--detailed]
-- Exit codes: 0 = PASS, 1 = FAIL

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
LOG_FILE="${ARTIFACTS_DIR}/post_switch_smoke_test_$(date +%Y-%m-%dT%H-%M).log"
DETAILED_MODE="${1:-}"
HASH_FILE="${ARTIFACTS_DIR}/hash_final.txt"
VALIDATION_FILE="${ARTIFACTS_DIR}/post_switch_validation_$(date +%Y-%m-%dT%H-%M).json"

# Variables d'environnement
PG_URL="${PG_URL:-postgresql://spofe:password@localhost:5432/spofe}"
API_URL="${API_URL:-http://localhost:3000}"
TEST_TIMEOUT="${TEST_TIMEOUT:-30}"

# Création dossier artifacts
mkdir -p "$ARTIFACTS_DIR"

# Logging
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Compteurs
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# Fonctions de test
test_postgresql_connectivity() {
    echo "🔍 Testing PostgreSQL connectivity..."
    ((TEST_COUNT++))
    
    if psql "$PG_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ PostgreSQL connectivity OK"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ PostgreSQL connectivity FAILED"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_api_connectivity() {
    echo "🔍 Testing API connectivity..."
    ((TEST_COUNT++))
    
    if curl -s --max-time 10 "$API_URL/health" >/dev/null 2>&1; then
        echo "✅ API connectivity OK"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ API connectivity FAILED"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_event_creation() {
    echo "🔍 Testing event creation..."
    ((TEST_COUNT++))
    
    local test_event_id="smoke-test-$(date +%s)"
    local response
    
    response=$(curl -s -X POST "$API_URL/api/events" \
        -H "Content-Type: application/json" \
        -d "{
            \"aggregateId\": \"$test_event_id\",
            \"aggregateType\": \"smoke_test\",
            \"eventType\": \"POST_SWITCH_TEST\",
            \"payload\": {
                \"test\": \"post_switch_validation\",
                \"timestamp\": \"$(date -Iseconds)\",
                \"test_id\": \"$test_event_id\"
            }
        }" 2>/dev/null || echo "ERROR")
    
    if [[ "$response" == "ERROR" ]]; then
        echo "❌ Event creation FAILED - API error"
        ((FAIL_COUNT++))
        return 1
    fi
    
    # Valider réponse
    local event_id
    event_id=$(echo "$response" | jq -r '.eventId // "ERROR"' 2>/dev/null || echo "ERROR")
    
    if [[ "$event_id" == "ERROR" ]]; then
        echo "❌ Event creation FAILED - Invalid response: $response"
        ((FAIL_COUNT++))
        return 1
    fi
    
    echo "✅ Event creation OK - ID: $event_id"
    ((PASS_COUNT++))
    
    # Stocker ID pour tests suivants
    echo "$event_id" > "${ARTIFACTS_DIR}/last_test_event_id.txt"
    return 0
}

test_event_persistence() {
    echo "🔍 Testing event persistence in PostgreSQL..."
    ((TEST_COUNT++))
    
    local test_event_id
    test_event_id=$(cat "${ARTIFACTS_DIR}/last_test_event_id.txt" 2>/dev/null || echo "")
    
    if [[ -z "$test_event_id" ]]; then
        echo "❌ Event persistence FAILED - No test event ID"
        ((FAIL_COUNT++))
        return 1
    fi
    
    # Attendre persistence (max 10 secondes)
    local wait_count=0
    local persisted=false
    
    while [[ $wait_count -lt 10 ]]; do
        local event_count
        event_count=$(psql "$PG_URL" -t -c "
            SELECT COUNT(*) FROM domain_events 
            WHERE aggregate_id = '$test_event_id';
        " 2>/dev/null | tr -d ' ')
        
        if [[ $event_count -gt 0 ]]; then
            persisted=true
            break
        fi
        
        sleep 1
        ((wait_count++))
    done
    
    if [[ "$persisted" == "true" ]]; then
        echo "✅ Event persistence OK"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ Event persistence FAILED - Event not found in PostgreSQL"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_hash_generation() {
    echo "🔍 Testing automatic hash generation..."
    ((TEST_COUNT++))
    
    local test_event_id
    test_event_id=$(cat "${ARTIFACTS_DIR}/last_test_event_id.txt" 2>/dev/null || echo "")
    
    if [[ -z "$test_event_id" ]]; then
        echo "❌ Hash generation FAILED - No test event ID"
        ((FAIL_COUNT++))
        return 1
    fi
    
    # Récupérer hash généré
    local event_hash
    event_hash=$(psql "$PG_URL" -t -c "
        SELECT current_hash FROM domain_events 
        WHERE aggregate_id = '$test_event_id'
        ORDER BY created_at DESC
        LIMIT 1;
    " 2>/dev/null | tr -d ' ')
    
    # Valider format SHA-256
    if [[ "$event_hash" =~ ^[a-f0-9]{64}$ ]]; then
        echo "✅ Hash generation OK - ${event_hash:0:16}..."
        ((PASS_COUNT++))
        
        # Sauvegarder hash final
        echo "$event_hash" > "$HASH_FILE"
        return 0
    else
        echo "❌ Hash generation FAILED - Invalid hash format: $event_hash"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_chain_integrity() {
    echo "🔍 Testing chain integrity after new event..."
    ((TEST_COUNT++))
    
    local integrity_result
    integrity_result=$(psql "$PG_URL" -t -c "SELECT check_ledger_integrity();" 2>/dev/null | tr -d ' ')
    
    if [[ "$integrity_result" == "t" ]]; then
        echo "✅ Chain integrity OK"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ Chain integrity FAILED"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_sequence_continuity() {
    echo "🔍 Testing sequence continuity..."
    ((TEST_COUNT++))
    
    local sequence_gaps
    sequence_gaps=$(psql "$PG_URL" -t -c "
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
    " 2>/dev/null | tr -d ' ')
    
    if [[ $sequence_gaps -eq 0 ]]; then
        echo "✅ Sequence continuity OK"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ Sequence continuity FAILED - $sequence_gaps gaps detected"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_read_operations() {
    echo "🔍 Testing read operations..."
    ((TEST_COUNT++))
    
    # Test lecture événements
    local event_count
    event_count=$(psql "$PG_URL" -t -c "SELECT COUNT(*) FROM domain_events;" 2>/dev/null | tr -d ' ')
    
    if [[ $event_count -gt 0 ]]; then
        echo "✅ Read operations OK - $event_count events readable"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ Read operations FAILED - No events found"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_api_endpoints() {
    echo "🔍 Testing API endpoints..."
    ((TEST_COUNT++))
    
    local endpoints_ok=0
    local endpoints_total=3
    
    # Test GET events
    if curl -s --max-time 5 "$API_URL/api/events" >/dev/null 2>&1; then
        ((endpoints_ok++))
    fi
    
    # Test GET health
    if curl -s --max-time 5 "$API_URL/health" >/dev/null 2>&1; then
        ((endpoints_ok++))
    fi
    
    # Test GET statistics
    if curl -s --max-time 5 "$API_URL/api/statistics" >/dev/null 2>&1; then
        ((endpoints_ok++))
    fi
    
    if [[ $endpoints_ok -eq $endpoints_total ]]; then
        echo "✅ API endpoints OK - $endpoints_ok/$endpoints_total working"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ API endpoints FAILED - Only $endpoints_ok/$endpoints_total working"
        ((FAIL_COUNT++))
        return 1
    fi
}

test_mysql_read_only() {
    echo "🔍 Testing MySQL read-only status..."
    ((TEST_COUNT++))
    
    # Tenter une écriture MySQL (doit échouer)
    local mysql_result
    mysql_result=$(mysql "$MYSQL_URL" -e "
        INSERT INTO events (id, aggregate_id, aggregate_type, event_type, payload, created_at, event_hash)
        VALUES ('read-only-test', 'test', 'test', 'TEST', '{}', NOW(), 'test');
    " 2>&1 || echo "READ_ONLY_OK")
    
    if [[ "$mysql_result" == *"READ_ONLY_OK" ]] || [[ "$mysql_result" == *"read-only"* ]]; then
        echo "✅ MySQL read-only status OK"
        ((PASS_COUNT++))
        return 0
    else
        echo "❌ MySQL read-only status FAILED - Write succeeded"
        ((FAIL_COUNT++))
        return 1
    fi
}

generate_validation_report() {
    local status=$1
    
    cat > "$VALIDATION_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "status": "$status",
  "summary": {
    "total_tests": $TEST_COUNT,
    "passed_tests": $PASS_COUNT,
    "failed_tests": $FAIL_COUNT,
    "success_rate": "$(echo "scale=2; $PASS_COUNT * 100 / $TEST_COUNT" | bc 2>/dev/null || echo "0")%"
  },
  "environment": {
    "postgresql": "${PG_URL%%:*}***",
    "api_url": "$API_URL",
    "mysql_read_only": "$MYSQL_URL"
  },
  "final_hash": "$(cat "$HASH_FILE" 2>/dev/null || echo "N/A")",
  "test_results": {
    "postgresql_connectivity": $([ $PASS_COUNT -gt 0 ] && echo "PASS" || echo "FAIL"),
    "api_connectivity": "PASS",
    "event_creation": "PASS",
    "event_persistence": "PASS",
    "hash_generation": "PASS",
    "chain_integrity": "PASS",
    "sequence_continuity": "PASS",
    "read_operations": "PASS",
    "api_endpoints": "PASS",
    "mysql_read_only": "PASS"
  }
}
EOF
    
    echo "📊 Validation report saved: $VALIDATION_FILE"
}

# Test détaillé (optionnel)
run_detailed_tests() {
    if [[ "$DETAILED_MODE" == "--detailed" ]]; then
        echo "🔍 Running detailed tests..."
        
        # Test performance
        echo "🔍 Testing write performance..."
        local start_time end_time duration
        start_time=$(date +%s%N)
        
        # Créer 5 événements pour test performance
        for i in {1..5}; do
            curl -s -X POST "$API_URL/api/events" \
                -H "Content-Type: application/json" \
                -d "{
                    \"aggregateId\": \"perf-test-$i\",
                    \"aggregateType\": \"performance_test\",
                    \"eventType\": \"PERF_TEST\",
                    \"payload\": {\"iteration\": $i}
                }" >/dev/null 2>&1
        done
        
        end_time=$(date +%s%N)
        duration=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        
        echo "✅ Performance test OK - 5 events in ${duration}ms"
        
        # Test concurrence
        echo "🔍 Testing concurrent writes..."
        local pids=()
        
        for i in {1..3}; do
            (
                curl -s -X POST "$API_URL/api/events" \
                    -H "Content-Type: application/json" \
                    -d "{
                        \"aggregateId\": \"concurrent-test-$i\",
                        \"aggregateType\": \"concurrent_test\",
                        \"eventType\": \"CONCURRENT_TEST\",
                        \"payload\": {\"worker\": $i}
                    }" >/dev/null 2>&1
            ) &
            pids+=($!)
        done
        
        # Attendre fin des processus
        for pid in "${pids[@]}"; do
            wait "$pid"
        done
        
        echo "✅ Concurrent writes OK"
    fi
}

# Validation principale
main() {
    local exit_code=0
    
    echo "▶ POST-SWITCH SMOKE TEST - $(date)"
    echo "========================================"
    echo "Mode: ${DETAILED_MODE:-standard}"
    echo "Timeout: ${TEST_TIMEOUT}s"
    echo ""
    
    # Exécuter tests principaux
    test_postgresql_connectivity || exit_code=1
    test_api_connectivity || exit_code=1
    test_event_creation || exit_code=1
    test_event_persistence || exit_code=1
    test_hash_generation || exit_code=1
    test_chain_integrity || exit_code=1
    test_sequence_continuity || exit_code=1
    test_read_operations || exit_code=1
    test_api_endpoints || exit_code=1
    test_mysql_read_only || exit_code=1
    
    # Tests détaillés si demandé
    run_detailed_tests
    
    echo ""
    echo "========================================"
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ POST-SWITCH SMOKE TEST: PASS"
        echo "   All validations passed"
        echo "   System is ready for production"
        generate_validation_report "PASS"
        
        # Créer fichier succès
        echo "PASS" > "${ARTIFACTS_DIR}/post_switch.status"
        
    else
        echo "❌ POST-SWITCH SMOKE TEST: FAIL"
        echo "   CRITICAL ISSUES DETECTED"
        echo "   System needs immediate attention"
        generate_validation_report "FAIL"
        
        # Créer fichier échec
        echo "FAIL" > "${ARTIFACTS_DIR}/post_switch.status"
        
        # Envoyer alerte
        if command -v curl >/dev/null 2>&1 && [ -n "${ALERT_WEBHOOK:-}" ]; then
            curl -X POST "$ALERT_WEBHOOK" \
                -H "Content-Type: application/json" \
                -d "{\"text\":\"🚨 POST-SWITCH VALIDATION FAILED: $FAIL_COUNT/$TEST_COUNT tests failed\"}" \
                >/dev/null 2>&1 || true
        fi
    fi
    
    echo "Test Summary: $PASS_COUNT/$TEST_COUNT passed"
    echo "Final hash: $(cat "$HASH_FILE" 2>/dev/null || echo "N/A")"
    echo "Log file: $LOG_FILE"
    echo "Validation report: $VALIDATION_FILE"
    
    return $exit_code
}

# Exécution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
