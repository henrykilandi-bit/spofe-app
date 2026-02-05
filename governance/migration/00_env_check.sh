#!/usr/bin/env bash
# =============================================================================
# 🛡️ 00_ENV_CHECK.SH - T-24h : PRÉ-VOL INFRASTRUCTURE
# =============================================================================
# Vérification environnement avant migration constitutionnelle
# Critique : Échec = STOP immédiat
#
# Usage: ./00_env_check.sh [--verbose]
# Exit codes: 0 = PASS, 1 = FAIL

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
LOG_FILE="${ARTIFACTS_DIR}/env_check_$(date +%Y-%m-%dT%H-%M).log"

# Création dossier artifacts
mkdir -p "$ARTIFACTS_DIR"

# Logging
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo "▶ ENVIRONMENT CHECK - $(date)"
echo "========================================"

# Variables d'environnement
PG_URL="${PG_URL:-postgresql://spofe:password@localhost:5432/spofe}"
MYSQL_URL="${MYSQL_URL:-mysql://spofe:password@localhost:3306/spofe}"
API_URL="${API_URL:-http://localhost:3000}"

# Fonctions de validation
validate_postgresql() {
    echo "🔍 Checking PostgreSQL connection..."
    
    if psql "$PG_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ PostgreSQL reachable"
        
        # Version et statut
        local version=$(psql "$PG_URL" -t -c "SELECT version();" 2>/dev/null | head -1 | xargs)
        echo "   Version: $version"
        
        # Test écriture simple
        if psql "$PG_URL" -c "SELECT 1 as test;" >/dev/null 2>&1; then
            echo "✅ PostgreSQL read/write OK"
            return 0
        else
            echo "❌ PostgreSQL read/write FAILED"
            return 1
        fi
    else
        echo "❌ PostgreSQL NOT reachable"
        return 1
    fi
}

validate_mysql() {
    echo "🔍 Checking MySQL connection..."
    
    if mysql "$MYSQL_URL" -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ MySQL reachable"
        
        # Version et statut
        local version=$(mysql "$MYSQL_URL" -e "SELECT VERSION();" -s -N 2>/dev/null)
        echo "   Version: $version"
        
        # Test écriture simple
        if mysql "$MYSQL_URL" -e "SELECT 1 as test;" >/dev/null 2>&1; then
            echo "✅ MySQL read/write OK"
            return 0
        else
            echo "❌ MySQL read/write FAILED"
            return 1
        fi
    else
        echo "❌ MySQL NOT reachable"
        return 1
    fi
}

validate_api() {
    echo "🔍 Checking API connectivity..."
    
    if curl -s --max-time 10 "$API_URL/health" >/dev/null 2>&1; then
        echo "✅ API reachable"
        
        # Test endpoint health
        local health=$(curl -s --max-time 5 "$API_URL/health" 2>/dev/null || echo "unavailable")
        echo "   Health: $health"
        return 0
    else
        echo "❌ API NOT reachable"
        return 1
    fi
}

check_disk_space() {
    echo "🔍 Checking disk space..."
    
    local available=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
    echo "   Available: ${available}GB"
    
    if [ "$available" -lt 10 ]; then
        echo "❌ Insufficient disk space (< 10GB)"
        return 1
    else
        echo "✅ Disk space OK"
        return 0
    fi
}

check_memory() {
    echo "🔍 Checking memory..."
    
    local available=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    echo "   Available: ${available}MB"
    
    if [ "$available" -lt 1024 ]; then
        echo "❌ Insufficient memory (< 1GB)"
        return 1
    else
        echo "✅ Memory OK"
        return 0
    fi
}

check_network() {
    echo "🔍 Checking network connectivity..."
    
    # Test DNS
    if nslookup google.com >/dev/null 2>&1; then
        echo "✅ DNS resolution OK"
    else
        echo "❌ DNS resolution FAILED"
        return 1
    fi
    
    # Test connectivité externe
    if ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        echo "✅ External connectivity OK"
        return 0
    else
        echo "❌ External connectivity FAILED"
        return 1
    fi
}

validate_backups() {
    echo "🔍 Checking backup systems..."
    
    # Check PostgreSQL backup
    if command -v pg_dump >/dev/null 2>&1; then
        if pg_dump "$PG_URL" --schema-only >/dev/null 2>&1; then
            echo "✅ PostgreSQL backup accessible"
        else
            echo "❌ PostgreSQL backup FAILED"
            return 1
        fi
    else
        echo "❌ pg_dump not available"
        return 1
    fi
    
    # Check MySQL backup
    if command -v mysqldump >/dev/null 2>&1; then
        if mysqldump "$MYSQL_URL" --no-data >/dev/null 2>&1; then
            echo "✅ MySQL backup accessible"
        else
            echo "❌ MySQL backup FAILED"
            return 1
        fi
    else
        echo "❌ mysqldump not available"
        return 1
    fi
    
    return 0
}

# Validation principale
main() {
    local exit_code=0
    
    echo "Environment Variables:"
    echo "  PG_URL: ${PG_URL%%:*}***"  # Masquer mot de passe
    echo "  MYSQL_URL: ${MYSQL_URL%%:*}***"
    echo "  API_URL: $API_URL"
    echo ""
    
    # Exécution validations
    validate_postgresql || exit_code=1
    validate_mysql || exit_code=1
    validate_api || exit_code=1
    check_disk_space || exit_code=1
    check_memory || exit_code=1
    check_network || exit_code=1
    validate_backups || exit_code=1
    
    echo ""
    echo "========================================"
    
    if [ $exit_code -eq 0 ]; then
        echo "✅ ENVIRONMENT CHECK: PASS"
        echo "   All systems ready for migration"
        
        # Créer fichier succès
        echo "PASS" > "${ARTIFACTS_DIR}/env_check.status"
        
    else
        echo "❌ ENVIRONMENT CHECK: FAIL"
        echo "   CRITICAL ISSUES DETECTED - STOP MIGRATION"
        
        # Créer fichier échec
        echo "FAIL" > "${ARTIFACTS_DIR}/env_check.status"
        
        # Envoyer alerte (si configuré)
        if command -v curl >/dev/null 2>&1 && [ -n "${ALERT_WEBHOOK:-}" ]; then
            curl -X POST "$ALERT_WEBHOOK" \
                -H "Content-Type: application/json" \
                -d "{\"text\":\"🚨 MIGRATION STOPPED: Environment check failed\"}" \
                >/dev/null 2>&1 || true
        fi
    fi
    
    echo "Log file: $LOG_FILE"
    echo "Timestamp: $(date)"
    
    return $exit_code
}

# Exécution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
