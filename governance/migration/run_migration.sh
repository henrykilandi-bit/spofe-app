#!/usr/bin/env bash
# =============================================================================
-- 🛡️ RUN_MIGRATION.SH - ORCHESTRATEUR PRINCIPAL
-- =============================================================================
-- Orchestration complète de la migration constitutionnelle
-- Mode "exécutable, prouvable, audit-ready"
--
-- Usage: ./run_migration.sh [phase] [options]
-- Phases: pre-check | double-write | switch | post-switch | full | status | rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ARTIFACTS_DIR="${SCRIPT_DIR}/artifacts"
CURRENT_RUN_DIR="${ARTIFACTS_DIR}/run-$(date +%Y-%m-%dT%H-%M)"
LOCK_FILE="${ARTIFACTS_DIR}/migration.lock"

# Variables d'environnement
PG_URL="${PG_URL:-postgresql://spofe:password@localhost:5432/spofe}"
MYSQL_URL="${MYSQL_URL:-mysql://spofe:password@localhost:3306/spofe}"
API_URL="${API_URL:-http://localhost:3000}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"

# Création dossiers
mkdir -p "$ARTIFACTS_DIR" "$CURRENT_RUN_DIR"

# Logging
LOG_FILE="${CURRENT_RUN_DIR}/migration.log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# État global
MIGRATION_PHASE=""
START_TIME=$(date +%s)
EXIT_CODE=0

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_phase() {
    echo -e "\n${BLUE}🔄 PHASE: $1${NC}"
    echo "========================================"
}

send_alert() {
    local message="$1"
    local level="${2:-INFO}"
    
    if [[ -n "$ALERT_WEBHOOK" ]] && command -v curl >/dev/null 2>&1; then
        local emoji="ℹ️"
        case "$level" in
            "CRITICAL") emoji="🚨" ;;
            "WARNING") emoji="⚠️" ;;
            "SUCCESS") emoji="✅" ;;
        esac
        
        curl -X POST "$ALERT_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"text\":\"$emoji $message\"}" \
            >/dev/null 2>&1 || true
    fi
}

check_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local lock_pid=$(cat "$LOCK_FILE")
        if kill -0 "$lock_pid" 2>/dev/null; then
            log_error "Migration already running (PID: $lock_pid)"
            exit 1
        else
            log_warning "Removing stale lock file"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    echo $$ > "$LOCK_FILE"
}

cleanup() {
    rm -f "$LOCK_FILE"
}

trap cleanup EXIT

# Sauvegarder état Git
save_git_state() {
    local git_file="${CURRENT_RUN_DIR}/git_commit.txt"
    
    if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
        {
            echo "Commit: $(git rev-parse HEAD)"
            echo "Branch: $(git rev-parse --abbrev-ref HEAD)"
            echo "Status: $(git status --porcelain | wc -l) files modified"
            echo "Timestamp: $(date)"
        } > "$git_file"
        
        log_info "Git state saved to $git_file"
    else
        echo "No Git repository detected" > "$git_file"
    fi
}

# Phase 1: Pré-vol (T-24h)
run_pre_check() {
    log_phase "PRE-CHECK (T-24h)"
    
    log_info "Running environment validation..."
    if ! bash "$SCRIPT_DIR/00_env_check.sh"; then
        log_error "Environment check failed"
        return 1
    fi
    
    log_info "Running database immutability validation..."
    if ! psql "$PG_URL" -f "$SCRIPT_DIR/01_db_immutability.sql"; then
        log_error "Database immutability check failed"
        return 1
    fi
    
    log_info "Running hash chain integrity validation..."
    if ! psql "$PG_URL" -f "$SCRIPT_DIR/02_hash_chain_integrity.sql"; then
        log_error "Hash chain integrity check failed"
        return 1
    fi
    
    log_success "Pre-check completed successfully"
    return 0
}

# Phase 2: Double écriture (T0)
run_double_write() {
    log_phase "DOUBLE WRITE ACTIVATION (T0)"
    
    log_info "Starting double write validation..."
    
    # Démarrer monitoring continu en arrière-plan
    local monitor_pid
    bash "$SCRIPT_DIR/03_double_write_check.sh" --continuous &
    monitor_pid=$!
    
    echo "$monitor_pid" > "${CURRENT_RUN_DIR}/double_write_monitor.pid"
    
    log_info "Double write monitoring started (PID: $monitor_pid)"
    log_info "Monitor running for observation period..."
    
    # Attendre période d'observation (configurable)
    local observation_time="${OBSERVATION_TIME:-300}"  # 5 minutes par défaut
    log_info "Observation period: ${observation_time}s"
    
    sleep "$observation_time"
    
    # Arrêter monitoring
    if kill -0 "$monitor_pid" 2>/dev/null; then
        kill "$monitor_pid"
        wait "$monitor_pid" 2>/dev/null || true
    fi
    
    rm -f "${CURRENT_RUN_DIR}/double_write_monitor.pid"
    
    # Validation finale
    log_info "Running final double write validation..."
    if ! bash "$SCRIPT_DIR/03_double_write_check.sh"; then
        log_error "Final double write validation failed"
        return 1
    fi
    
    log_success "Double write phase completed successfully"
    return 0
}

# Phase 3: Bascule finale
run_switch() {
    log_phase "FINAL SWITCH (T+X)"
    
    log_warning "This action will switch MySQL to read-only mode"
    log_warning "Type 'CONFIRM' to proceed or 'ABORT' to cancel"
    
    read -p "> " confirmation
    
    if [[ "$confirmation" != "CONFIRM" ]]; then
        log_error "Switch aborted by user"
        return 1
    fi
    
    log_info "Setting MySQL to read-only..."
    
    # Passage MySQL en read-only
    if ! mysql "$MYSQL_URL" -e "SET GLOBAL read_only = ON;"; then
        log_error "Failed to set MySQL read-only"
        return 1
    fi
    
    if ! mysql "$MYSQL_URL" -e "SET GLOBAL super_read_only = ON;"; then
        log_error "Failed to set MySQL super_read-only"
        return 1
    fi
    
    log_info "Validating MySQL read-only status..."
    if ! mysql "$MYSQL_URL" -f "$SCRIPT_DIR/04_mysql_read_only.sql"; then
        log_error "MySQL read-only validation failed"
        return 1
    fi
    
    log_success "Switch completed successfully"
    return 0
}

# Phase 4: Post-bascule
run_post_switch() {
    log_phase "POST-SWITCH VALIDATION"
    
    log_info "Running post-switch smoke tests..."
    if ! bash "$SCRIPT_DIR/05_post_switch_smoke_test.sh" --detailed; then
        log_error "Post-switch validation failed"
        return 1
    fi
    
    log_success "Post-switch validation completed successfully"
    return 0
}

# Migration complète
run_full_migration() {
    log_phase "FULL CONSTITUTIONAL MIGRATION"
    
    local phases=("pre-check" "double-write" "switch" "post-switch")
    local current_phase_index=0
    
    for phase in "${phases[@]}"; do
        log_info "Starting phase: $phase"
        MIGRATION_PHASE="$phase"
        
        case "$phase" in
            "pre-check")
                if ! run_pre_check; then
                    log_error "Pre-check phase failed"
                    return 1
                fi
                ;;
            "double-write")
                if ! run_double_write; then
                    log_error "Double-write phase failed"
                    return 1
                fi
                ;;
            "switch")
                if ! run_switch; then
                    log_error "Switch phase failed"
                    return 1
                fi
                ;;
            "post-switch")
                if ! run_post_switch; then
                    log_error "Post-switch phase failed"
                    return 1
                fi
                ;;
        esac
        
        ((current_phase_index++))
        log_success "Phase $phase completed (${current_phase_index}/${#phases[@]})"
        
        # Sauvegarder état après chaque phase
        echo "$phase" > "${CURRENT_RUN_DIR}/completed_phase.txt"
    done
    
    log_success "Full migration completed successfully"
    return 0
}

# Statut migration
show_status() {
    log_phase "MIGRATION STATUS"
    
    echo "Current directory: $CURRENT_RUN_DIR"
    echo "Lock file: $([ -f "$LOCK_FILE" ] && echo "EXISTS ($(cat "$LOCK_FILE"))" || echo "NONE")"
    echo ""
    
    # Dernier run
    local last_run
    last_run=$(ls -1t "$ARTIFACTS_DIR"/run-* 2>/dev/null | head -1 || echo "NONE")
    
    if [[ "$last_run" != "NONE" ]]; then
        echo "Last run: $last_run"
        
        if [[ -f "$last_run/completed_phase.txt" ]]; then
            echo "Last completed phase: $(cat "$last_run/completed_phase.txt)"
        fi
        
        if [[ -f "$last_run/migration.log" ]]; then
            echo "Last log entries:"
            tail -10 "$last_run/migration.log"
        fi
    else
        echo "No previous runs found"
    fi
    
    # État actuel des bases de données
    echo ""
    echo "Database status:"
    
    local pg_count mysql_count
    pg_count=$(psql "$PG_URL" -t -c "SELECT count(*) FROM domain_events;" 2>/dev/null | tr -d ' ' || echo "ERROR")
    mysql_count=$(mysql "$MYSQL_URL" -e "SELECT count(*) FROM events;" -s -N 2>/dev/null || echo "ERROR")
    
    echo "  PostgreSQL events: $pg_count"
    echo "  MySQL events: $mysql_count"
    
    # État read-only MySQL
    local read_only_status
    read_only_status=$(mysql "$MYSQL_URL" -e "SELECT @@global.read_only;" -s -N 2>/dev/null || echo "ERROR")
    echo "  MySQL read-only: $read_only_status"
}

# Rollback configuration
run_rollback() {
    log_phase "ROLLBACK CONFIGURATION"
    
    log_warning "This will rollback configuration changes (not data)"
    log_warning "Type 'CONFIRM' to proceed or 'ABORT' to cancel"
    
    read -p "> " confirmation
    
    if [[ "$confirmation" != "CONFIRM" ]]; then
        log_error "Rollback aborted by user"
        return 1
    fi
    
    log_info "Reactivating MySQL write access..."
    
    # Réactiver écriture MySQL
    if ! mysql "$MYSQL_URL" -e "SET GLOBAL read_only = OFF;"; then
        log_error "Failed to disable MySQL read-only"
        return 1
    fi
    
    if ! mysql "$MYSQL_URL" -e "SET GLOBAL super_read_only = OFF;"; then
        log_error "Failed to disable MySQL super_read-only"
        return 1
    fi
    
    log_success "Rollback completed successfully"
    return 0
}

# Génération rapport final
generate_final_report() {
    local report_file="${CURRENT_RUN_DIR}/final_report.json"
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    
    cat > "$report_file" << EOF
{
  "migration": {
    "timestamp": "$(date -Iseconds)",
    "duration_seconds": $duration,
    "phase": "$MIGRATION_PHASE",
    "status": "$([ $EXIT_CODE -eq 0 ] && echo "SUCCESS" || echo "FAILED")",
    "exit_code": $EXIT_CODE
  },
  "environment": {
    "postgresql": "${PG_URL%%:*}***",
    "mysql": "${MYSQL_URL%%:*}***",
    "api_url": "$API_URL"
  },
  "artifacts": {
    "log_file": "$LOG_FILE",
    "git_state": "${CURRENT_RUN_DIR}/git_commit.txt",
    "final_hash": "${ARTIFACTS_DIR}/hash_final.txt"
  },
  "validation": {
    "pre_check": "$([ -f "${ARTIFACTS_DIR}/env_check.status" ] && cat "${ARTIFACTS_DIR}/env_check.status" || echo "NOT_RUN")",
    "double_write": "$([ -f "${ARTIFACTS_DIR}/double_write.status" ] && cat "${ARTIFACTS_DIR}/double_write.status" || echo "NOT_RUN")",
    "post_switch": "$([ -f "${ARTIFACTS_DIR}/post_switch.status" ] && cat "${ARTIFACTS_DIR}/post_switch.status" || echo "NOT_RUN")"
  }
}
EOF
    
    log_info "Final report saved: $report_file"
}

# Affichage usage
show_usage() {
    cat << EOF
Usage: $0 [PHASE] [OPTIONS]

PHASES:
  pre-check      Run T-24h pre-flight checks
  double-write   Activate and validate double write mode
  switch         Switch MySQL to read-only (FINAL SWITCH)
  post-switch    Run post-switch validation
  full           Run complete migration (all phases)
  status         Show current migration status
  rollback       Rollback configuration changes

OPTIONS:
  --help         Show this help
  --dry-run      Show what would be done without executing
  --force        Skip confirmations (DANGEROUS)

ENVIRONMENT VARIABLES:
  PG_URL         PostgreSQL connection string
  MYSQL_URL      MySQL connection string
  API_URL        API base URL
  ALERT_WEBHOOK  Webhook for alerts
  OBSERVATION_TIME  Double write observation time (seconds)

EXAMPLES:
  $0 pre-check                    # Run pre-checks only
  $0 full                         # Run complete migration
  $0 status                       # Show current status
  $0 rollback                     # Rollback changes

EOF
}

# Main
main() {
    local phase="${1:-}"
    local dry_run="${2:-}"
    
    # Vérifier lock
    check_lock
    
    # Sauvegarder état Git
    save_git_state
    
    # En-tête
    echo "🛡️ CONSTITUTIONAL MIGRATION ORCHESTRATOR"
    echo "========================================"
    echo "Timestamp: $(date)"
    echo "Run directory: $CURRENT_RUN_DIR"
    echo "Phase: ${phase:-FULL}"
    echo ""
    
    # Validation environnement
    if [[ -z "$PG_URL" || -z "$MYSQL_URL" || -z "$API_URL" ]]; then
        log_error "Missing required environment variables"
        log_error "Set PG_URL, MYSQL_URL, and API_URL"
        exit 1
    fi
    
    # Exécuter phase demandée
    case "$phase" in
        "pre-check")
            run_pre_check
            ;;
        "double-write")
            run_double_write
            ;;
        "switch")
            run_switch
            ;;
        "post-switch")
            run_post_switch
            ;;
        "full")
            run_full_migration
            ;;
        "status")
            show_status
            ;;
        "rollback")
            run_rollback
            ;;
        "--help"|"help"|"")
            show_usage
            exit 0
            ;;
        *)
            log_error "Unknown phase: $phase"
            show_usage
            exit 1
            ;;
    esac
    
    EXIT_CODE=$?
    
    # Rapport final
    generate_final_report
    
    # Notification finale
    if [[ $EXIT_CODE -eq 0 ]]; then
        log_success "Migration completed successfully!"
        send_alert "Constitutional migration completed successfully" "SUCCESS"
    else
        log_error "Migration failed!"
        send_alert "Constitutional migration failed" "CRITICAL"
    fi
    
    echo ""
    echo "Duration: $(( ($(date +%s) - START_TIME) / 60 )) minutes"
    echo "Artifacts: $CURRENT_RUN_DIR"
    echo "Log file: $LOG_FILE"
    
    return $EXIT_CODE
}

# Exécution
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
