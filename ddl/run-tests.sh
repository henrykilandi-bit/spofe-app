#!/usr/bin/env bash
# ==================================================================================
# SPOFE SQL Non-Regression Tests — CI Execution Script
# Exécute tous les tests de non-régression en séquence
# Sortie: exit 0 si tous les tests passent, exit 1 sinon
# ==================================================================================

set -e  # Exit on first error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TESTS_DIR="${SCRIPT_DIR}/ddl/tests"
LOG_DIR="${SCRIPT_DIR}/.test-logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${LOG_DIR}/spofe_tests_${TIMESTAMP}.log"

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Créer répertoire de logs
mkdir -p "${LOG_DIR}"

# ==================================================================================
# Fonctions utilitaires
# ==================================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "${LOG_FILE}"
}

log_success() {
    echo -e "${GREEN}[✓ PASS]${NC} $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo -e "${RED}[✗ FAIL]${NC} $1" | tee -a "${LOG_FILE}"
}

log_warning() {
    echo -e "${YELLOW}[⚠ WARN]${NC} $1" | tee -a "${LOG_FILE}"
}

# ==================================================================================
# Vérifications préalables
# ==================================================================================

echo "🧪 SPOFE SQL Non-Regression Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee "${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

# Vérifier que les fichiers de test existent
if [ ! -d "${TESTS_DIR}" ]; then
    log_error "Tests directory not found: ${TESTS_DIR}"
    exit 1
fi

log_info "Tests directory: ${TESTS_DIR}"
log_info "Log file: ${LOG_FILE}"

# Vérifier que psql est disponible
if ! command -v psql &> /dev/null; then
    log_error "psql command not found. Please install PostgreSQL client."
    exit 1
fi

log_success "PostgreSQL client found"

# ==================================================================================
# Configuration PostgreSQL
# ==================================================================================

# Récupérer les paramètres de connexion ou utiliser les defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-spofe}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-spofe_secure_pwd_2026}"

log_info "PostgreSQL Host: ${DB_HOST}:${DB_PORT}"
log_info "Database: ${DB_NAME}"
log_info "User: ${DB_USER}"

# ==================================================================================
# Test de connexion
# ==================================================================================

echo "" | tee -a "${LOG_FILE}"
log_info "Testing connection to PostgreSQL..."

if PGPASSWORD="${DB_PASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -c "SELECT version();" &> /dev/null; then
    log_success "PostgreSQL connection successful"
else
    log_error "Cannot connect to PostgreSQL"
    exit 1
fi

# ==================================================================================
# Exécution des tests
# ==================================================================================

echo "" | tee -a "${LOG_FILE}"
echo "Running test suites..." | tee -a "${LOG_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"

TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Array des fichiers de test (dans l'ordre d'exécution)
TEST_FILES=(
    "01_immutability.sql"
    "02_decision_chain.sql"
    "03_process_registry.sql"
    "04_audit.sql"
    "05_read_model.sql"
)

for test_file in "${TEST_FILES[@]}"; do
    test_path="${TESTS_DIR}/${test_file}"
    
    if [ ! -f "${test_path}" ]; then
        log_warning "Test file not found: ${test_path}"
        continue
    fi
    
    echo "" | tee -a "${LOG_FILE}"
    log_info "Executing: ${test_file}"
    
    # Créer un fichier de sortie pour chaque test
    test_output="${LOG_DIR}/${test_file%.sql}_${TIMESTAMP}.out"
    
    # Exécuter le test
    if PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        -v ON_ERROR_STOP=1 \
        -f "${test_path}" \
        > "${test_output}" 2>&1; then
        
        log_success "${test_file} completed"
        ((PASSED_TESTS++))
        
        # Afficher les résultats importants du test
        if grep -q "✓ PASS" "${test_output}"; then
            grep "✓ PASS\|✅" "${test_output}" | head -5 | sed 's/^/    /' | tee -a "${LOG_FILE}"
        fi
    else
        log_error "${test_file} failed"
        ((FAILED_TESTS++))
        
        # Afficher les erreurs
        tail -20 "${test_output}" | tee -a "${LOG_FILE}"
    fi
    
    ((TOTAL_TESTS++))
done

# ==================================================================================
# Résumé des résultats
# ==================================================================================

echo "" | tee -a "${LOG_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"
echo "Test Results Summary" | tee -a "${LOG_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"

echo "Total test suites: ${TOTAL_TESTS}" | tee -a "${LOG_FILE}"
log_success "Passed: ${PASSED_TESTS}"
if [ ${FAILED_TESTS} -gt 0 ]; then
    log_error "Failed: ${FAILED_TESTS}"
else
    log_success "Failed: ${FAILED_TESTS}"
fi

echo "" | tee -a "${LOG_FILE}"
log_info "Detailed logs: ${LOG_FILE}"
echo "" | tee -a "${LOG_FILE}"

# ==================================================================================
# Exit code
# ==================================================================================

if [ ${FAILED_TESTS} -eq 0 ] && [ ${TOTAL_TESTS} -gt 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"
    echo -e "${GREEN}✅ ALL TESTS PASSED — Architecture is SAFE${NC}" | tee -a "${LOG_FILE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"
    echo -e "${RED}❌ TESTS FAILED — Architecture violations detected${NC}" | tee -a "${LOG_FILE}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${LOG_FILE}"
    exit 1
fi
