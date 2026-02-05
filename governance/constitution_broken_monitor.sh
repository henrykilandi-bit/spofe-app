#!/usr/bin/env bash
set -e

# 🚨 MODE CONSTITUTION BROKEN - Le système sait qu'il n'a plus le droit d'exister normalement
# Mode: "le système sait qu'il n'a plus le droit d'exister normalement" activé
# Dernier mécanisme de maturité constitutionnelle

# Configuration
SCRIPT_DIR="$(dirname "$0")"
GOVERNANCE_DIR="$(dirname "$SCRIPT_DIR")"
BROKEN_STATE_DIR="$GOVERNANCE_DIR/constitution_broken"
EVENTS_DIR="$GOVERNANCE_DIR/events"
AUDIT_DIR="$GOVERNANCE_DIR/audit"

# Configuration DB
PG_HOST="${SPOFE_DB_HOST:-localhost}"
PG_PORT="${SPOFE_DB_PORT:-5432}"
PG_USER="${SPOFE_DB_USER:-spofe_user}"
PG_DB="${SPOFE_DB_NAME:-spofe}"
PG_URL="postgresql://$PG_USER@$PG_HOST:$PG_PORT/$PG_DB"

# Timestamp formaté
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_SHORT=$(date +"%Y%m%d_%H%M%S")
EVENT_ID="CONSTITUTION_EVENT_$DATE_SHORT"

# États système possibles
SYSTEM_STATE_LEGITIMATE="LEGITIMATE"
SYSTEM_STATE_BROKEN="CONSTITUTION_BROKEN"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo "🚨 $1"
    echo "$(printf '=%.0s' {1..70})"
}

print_critical() {
    echo -e "${RED}🚨 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_broken() {
    echo -e "${PURPLE}🚨 CONSTITUTION BROKEN: $1${NC}"
}

print_guardian() {
    echo -e "${CYAN}🛡️ GUARDIAN: $1${NC}"
}

# Création des répertoires
mkdir -p "$BROKEN_STATE_DIR"
mkdir -p "$EVENTS_DIR"
mkdir -p "$AUDIT_DIR"

# Fonction pour obtenir l'état système actuel
get_system_state() {
    local state_file="$BROKEN_STATE_DIR/current_system_state"
    
    if [ -f "$state_file" ]; then
        cat "$state_file"
    else
        echo "$SYSTEM_STATE_LEGITIMATE"
    fi
}

# Fonction pour définir l'état système
set_system_state() {
    local new_state="$1"
    local reason="$2"
    local evidence="$3"
    
    local state_file="$BROKEN_STATE_DIR/current_system_state"
    local previous_state=$(get_system_state)
    
    if [ "$previous_state" = "$new_state" ]; then
        return 0
    fi
    
    # Écriture de l'état
    echo "$new_state" > "$state_file"
    
    # Génération de l'événement de gouvernance
    local event_type
    if [ "$new_state" = "$SYSTEM_STATE_BROKEN" ]; then
        event_type="CONSTITUTION_BROKEN_ENTERED"
        print_critical "🚨 ENTRÉE EN MODE CONSTITUTION BROKEN"
    else
        event_type="CONSTITUTION_RESTORED"
        print_success "✅ RESTAURATION CONSTITUTIONNELLE"
    fi
    
    # Création de l'événement dans le ledger
    create_governance_event "$event_type" "$reason" "$evidence"
    
    # Audit de l'événement
    audit_state_change "$previous_state" "$new_state" "$reason" "$evidence"
    
    print_broken "État système: $previous_state → $new_state"
    print_broken "Raison: $reason"
    print_broken "Preuve: $evidence"
}

# Fonction pour créer un événement de gouvernance dans le ledger
create_governance_event() {
    local event_type="$1"
    local reason="$2"
    local evidence="$3"
    
    print_guardian "🛡️ CRÉATION ÉVÉNEMENT DE GOUVERNANCE"
    
    local event_data=$(cat << EOF
{
  "governance_event": {
    "event_id": "$EVENT_ID",
    "event_type": "$event_type",
    "timestamp": "$TIMESTAMP",
    "system_state": "$(get_system_state)",
    "reason": "$reason",
    "evidence": "$evidence",
    "guardian": "constitution_broken_monitor",
    "constitutional_level": "P0",
    "irreversible": true,
    "ledger_entry": true
  }
}
EOF
)
    
    # Sauvegarde de l'événement
    local event_file="$EVENTS_DIR/governance_event_$EVENT_ID.json"
    echo "$event_data" > "$event_file"
    
    # Ancrage dans PostgreSQL (si disponible)
    if command -v psql >/dev/null 2>&1; then
        local event_hash=$(echo "$event_data" | sha256sum | awk '{print $1}')
        
        psql "$PG_URL" -c "
            INSERT INTO governance_events (
                event_id,
                event_type,
                event_data,
                event_hash,
                timestamp,
                constitutional_level
            ) VALUES (
                '$EVENT_ID',
                '$event_type',
                '\$event_data',
                '$event_hash',
                '$TIMESTAMP',
                'P0'
            );
        " 2>/dev/null || print_warning "Ancrage PostgreSQL non disponible"
    fi
    
    print_guardian "Événement créé: $EVENT_ID"
    echo "$event_file"
}

# Fonction pour auditer les changements d'état
audit_state_change() {
    local previous_state="$1"
    local new_state="$2"
    local reason="$3"
    local evidence="$4"
    
    local audit_data=$(cat << EOF
{
  "constitution_state_audit": {
    "audit_id": "$EVENT_ID",
    "timestamp": "$TIMESTAMP",
    "previous_state": "$previous_state",
    "new_state": "$new_state",
    "reason": "$reason",
    "evidence": "$evidence",
    "monitor_process": "constitution_broken_monitor",
    "constitutional_invariants": [
      "GOV-P0-BROKEN-01: Refus global",
      "GOV-P0-BROKEN-02: Sortie par preuve uniquement",
      "GOV-P0-BROKEN-03: Mémoire de la rupture"
    ],
    "impact_assessment": {
      "deployments_blocked": $([ "$new_state" = "$SYSTEM_STATE_BROKEN" ] && echo "true" || echo "false"),
      "migrations_blocked": $([ "$new_state" = "$SYSTEM_STATE_BROKEN" ] && echo "true" || echo "false"),
      "critical_changes_blocked": $([ "$new_state" = "$SYSTEM_STATE_BROKEN" ] && echo "true" || echo "false"),
      "read_only_access": "true"
    }
  }
}
EOF
)
    
    # Sauvegarde de l'audit
    local audit_file="$AUDIT_DIR/constitution_state_audit_$EVENT_ID.json"
    echo "$audit_data" > "$audit_file"
    
    print_guardian "Audit créé: $audit_file"
}

# Fonction pour vérifier les BUILD_PROOF P0
check_build_proof_p0() {
    print_guardian "🛡️ VÉRIFICATION BUILD_PROOF P0"
    
    local failed_proofs=()
    
    # Vérification des BUILD_PROOF P0
    local build_proof_dir="$GOVERNANCE_DIR/build-proof"
    if [ -d "$build_proof_dir" ]; then
        for yaml_file in "$build_proof_dir"/*.yaml; do
            if [ -f "$yaml_file" ]; then
                local level=$(grep -E "^\s*level:" "$yaml_file" | awk '{print $2}' | tr -d "'" | tr -d '"' || echo "UNKNOWN")
                local status=$(grep -E "^\s*status:" "$yaml_file" | awk '{print $2}' | tr -d "'" | tr -d '"' || echo "UNKNOWN")
                local proof_id=$(grep -E "^\s*build_proof_id:" "$yaml_file" | awk '{print $2}' | tr -d "'" | tr -d '"' || echo "UNKNOWN")
                
                if [ "$level" = "P0_CONSTITUTIONAL" ] && [ "$status" != "CERTIFIED" ]; then
                    failed_proofs+=("$proof_id:$status")
                fi
            fi
        done
    fi
    
    # Vérification en base de données
    if command -v psql >/dev/null 2>&1; then
        local db_failed=$(psql "$PG_URL" -t -c "
            SELECT build_proof_id || ':' || COALESCE(status, 'MISSING')
            FROM build_proof_anchors 
            WHERE level = 'P0_CONSTITUTIONAL' 
            AND (status != 'CERTIFIED' OR status IS NULL);
        " | xargs || echo "")
        
        if [ -n "$db_failed" ]; then
            IFS=$'\n' read -r -d '' -a db_array <<< "$db_failed"
            failed_proofs+=("${db_array[@]}")
        fi
    fi
    
    if [ ${#failed_proofs[@]} -gt 0 ]; then
        print_critical "BUILD_PROOF P0 INVALIDES:"
        for proof in "${failed_proofs[@]}"; do
            echo "   - $proof"
        done
        return 1
    else
        print_success "Tous les BUILD_PROOF P0 sont valides"
        return 0
    fi
}

# Fonction pour vérifier les signatures de preuves
check_proof_signatures() {
    print_guardian "🛡️ VÉRIFICATION SIGNATURES DE PREUVES"
    
    local invalid_signatures=()
    
    # Vérification des signatures BUILD_PROOF
    local build_proof_dir="$GOVERNANCE_DIR/build-proof"
    if [ -d "$build_proof_dir" ]; then
        for yaml_file in "$build_proof_dir"/*.yaml; do
            if [ -f "$yaml_file" ]; then
                local signature_file="${yaml_file%.yaml}.sig"
                if [ ! -f "$signature_file" ]; then
                    local proof_id=$(grep -E "^\s*build_proof_id:" "$yaml_file" | awk '{print $2}' | tr -d "'" | tr -d '"' || echo "UNKNOWN")
                    invalid_signatures+=("$proof_id:MISSING_SIGNATURE")
                fi
            fi
        done
    fi
    
    if [ ${#invalid_signatures[@]} -gt 0 ]; then
        print_critical "SIGNATURES INVALIDES:"
        for signature in "${invalid_signatures[@]}"; do
            echo "   - $signature"
        done
        return 1
    else
        print_success "Toutes les signatures sont valides"
        return 0
    fi
}

# Fonction pour vérifier la continuité des chaînes
check_chain_continuity() {
    print_guardian "🛡️ VÉRIFICATION CONTINUITÉ CHAÎNES"
    
    local chain_breaks=()
    
    # Vérification de la chaîne du ledger
    if command -v psql >/dev/null 2>&1; then
        local ledger_breaks=$(psql "$PG_URL" -t -c "
            SELECT 'LEDGER_BREAK: Sequence gap detected'
            FROM (
                SELECT sequence, 
                       LAG(sequence) OVER (ORDER BY sequence) as prev_seq
                FROM domain_events
            ) t 
            WHERE prev_seq IS NOT NULL 
            AND sequence != prev_seq + 1
            LIMIT 1;
        " | xargs || echo "")
        
        if [ -n "$ledger_breaks" ]; then
            chain_breaks+=("$ledger_breaks")
        fi
        
        # Vérification de la chaîne BUILD_PROOF
        local bp_breaks=$(psql "$PG_URL" -t -c "
            SELECT 'BUILD_PROOF_BREAK: Anchor chain gap detected'
            FROM (
                SELECT sequence, 
                       LAG(sequence) OVER (ORDER BY sequence) as prev_seq
                FROM build_proof_anchors
            ) t 
            WHERE prev_seq IS NOT NULL 
            AND sequence != prev_seq + 1
            LIMIT 1;
        " | xargs || echo "")
        
        if [ -n "$bp_breaks" ]; then
            chain_breaks+=("$bp_breaks")
        fi
    fi
    
    if [ ${#chain_breaks[@]} -gt 0 ]; then
        print_critical "RUPTURES DE CHAÎNE DÉTECTÉES:"
        for break in "${chain_breaks[@]}"; do
            echo "   - $break"
        done
        return 1
    else
        print_success "Continuité des chaînes vérifiée"
        return 0
    fi
}

# Fonction pour vérifier les rapports CI/CD
check_ci_legitimacy_reports() {
    print_guardian "🛡️ VÉRIFICATION RAPPORTS CI/CD LÉGITIMITÉ"
    
    local illegitimate_reports=()
    
    # Vérification des rapports CI/CD récents
    local ci_reports_dir="$GOVERNANCE_DIR/../ci/reports"
    if [ -d "$ci_reports_dir" ]; then
        local latest_report=$(find "$ci_reports_dir" -name "legitimacy_report-*.json" -mtime -7 | sort | tail -1)
        if [ -f "$latest_report" ]; then
            local report_status=$(jq -r '.spoof_ci_legitimacy_report.legitimacy.status' "$latest_report" 2>/dev/null || echo "UNKNOWN")
            if [ "$report_status" = "ILLEGITIMATE" ]; then
                illegitimate_reports+=("CI_REPORT:$latest_report")
            fi
        fi
    fi
    
    if [ ${#illegitimate_reports[@]} -gt 0 ]; then
        print_critical "RAPPORTS CI/CD ILLÉGITIMES:"
        for report in "${illegitimate_reports[@]}"; do
            echo "   - $report"
        done
        return 1
    else
        print_success "Aucun rapport CI/CD illégitime détecté"
        return 0
    fi
}

# Fonction pour vérifier les déclencheurs temporels
check_temporal_triggers() {
    print_guardian "🛡️ VÉRIFICATION DÉCLENCHEURS TEMPORELS"
    
    local temporal_violations=()
    
    # Vérification de l'âge de l'audit pour la production
    local audit_dir="$GOVERNANCE_DIR/audit/reports"
    if [ -d "$audit_dir" ]; then
        local latest_audit=$(find "$audit_dir" -name "audit-*.json" | sort | tail -1)
        if [ -f "$latest_audit" ]; then
            local audit_time=$(stat -c %Y "$latest_audit" 2>/dev/null || stat -f %m "$latest_audit" 2>/dev/null)
            local current_time=$(date +%s)
            local age_hours=$(((current_time - audit_time) / 3600))
            
            # Limite de 24 heures pour l'audit
            if [ $age_hours -gt 24 ]; then
                temporal_violations+=("AUDIT_TOO_OLD:${age_hours}h")
            fi
        fi
    fi
    
    if [ ${#temporal_violations[@]} -gt 0 ]; then
        print_critical "VIOLATIONS TEMPORELLES:"
        for violation in "${temporal_violations[@]}"; do
            echo "   - $violation"
        done
        return 1
    else
        print_success "Aucune violation temporelle détectée"
        return 0
    fi
}

# Fonction principale de monitoring
monitor_constitutional_state() {
    print_header "🚨 MONITORING ÉTAT CONSTITUTIONNEL"
    echo "Timestamp: $TIMESTAMP"
    echo "État actuel: $(get_system_state)"
    echo ""
    
    local violations=()
    local current_state=$(get_system_state)
    
    # Si déjà en mode BROKEN, vérifier si on peut sortir
    if [ "$current_state" = "$SYSTEM_STATE_BROKEN" ]; then
        print_broken "SYSTÈME DÉJÀ EN MODE CONSTITUTION BROKEN"
        print_broken "Vérification des conditions de sortie..."
        
        # Pour sortir, TOUT doit être valide
        if check_build_proof_p0 && \
           check_proof_signatures && \
           check_chain_continuity && \
           check_ci_legitimacy_reports && \
           check_temporal_triggers; then
            
            # Génération d'un nouvel audit
            print_guardian "Génération d'un nouvel audit constitutionnel..."
            if [ -f "$GOVERNANCE_DIR/audit/generate_constitutional_audit.sh" ]; then
                "$GOVERNANCE_DIR/audit/generate_constitutional_audit.sh" >/dev/null 2>&1 || true
            fi
            
            # Sortie du mode BROKEN
            local audit_hash=""
            local latest_audit=$(find "$GOVERNANCE_DIR/audit/reports" -name "audit-*.json" -mtime -1 | sort | tail -1)
            if [ -f "$latest_audit" ]; then
                audit_hash=$(sha256sum "$latest_audit" | awk '{print $1}')
            fi
            
            set_system_state "$SYSTEM_STATE_LEGITIMATE" "All constitutional requirements restored" "audit_report:$audit_hash"
            return 0
        else
            print_broken "Conditions de sortie non remplies - Maintien en mode CONSTITUTION BROKEN"
            return 1
        fi
    fi
    
    # Vérification des déclencheurs (UN SEUL suffit pour entrer en mode BROKEN)
    
    # 1. BUILD_PROOF P0 invalides
    if ! check_build_proof_p0; then
        violations+=("BUILD_PROOF_P0_INVALID")
    fi
    
    # 2. Signatures invalides
    if ! check_proof_signatures; then
        violations+=("PROOF_SIGNATURES_INVALID")
    fi
    
    # 3. Ruptures de chaîne
    if ! check_chain_continuity; then
        violations+=("CHAIN_CONTINUITY_BROKEN")
    fi
    
    # 4. Rapports CI/CD illégitimes
    if ! check_ci_legitimacy_reports; then
        violations+=("CI_REPORTS_ILLLEGITIMATE")
    fi
    
    # 5. Violations temporelles
    if ! check_temporal_triggers; then
        violations+=("TEMPORAL_VIOLATIONS")
    fi
    
    # Décision finale
    if [ ${#violations[@]} -gt 0 ]; then
        local violation_list=$(IFS=','; echo "${violations[*]}")
        print_critical "🚨 DÉCLENCHEURS CONSTITUTION BROKEN DÉTECTÉS:"
        for violation in "${violations[@]}"; do
            echo "   - $violation"
        done
        echo ""
        print_critical "ACTIVATION DU MODE CONSTITUTION BROKEN"
        
        set_system_state "$SYSTEM_STATE_BROKEN" "Constitutional violations detected" "$violation_list"
        return 1
    else
        print_success "✅ AUCUNE VIOLATION CONSTITUTIONNELLE DÉTECTÉE"
        print_success "SYSTÈME CONSTITUTIONNELLEMENT LÉGITIME"
        return 0
    fi
}

# Fonction pour vérifier si une action est autorisée
is_action_allowed() {
    local action="$1"
    local current_state=$(get_system_state)
    
    case "$current_state" in
        "$SYSTEM_STATE_LEGITIMATE")
            return 0
            ;;
        "$SYSTEM_STATE_BROKEN")
            case "$action" in
                "deploy"|"migration"|"infra_switch"|"critical_config_change"|"manual_override")
                    print_critical "🚨 ACTION INTERDITE - MODE CONSTITUTION BROKEN"
                    print_critical "Action: $action"
                    print_critical "État: $current_state"
                    return 1
                    ;;
                "read_only"|"report_generation"|"audit"|"guided_remediation")
                    print_warning "⚠️  ACTION LIMITÉE - MODE CONSTITUTION BROKEN"
                    print_warning "Action: $action autorisée en lecture seule"
                    return 0
                    ;;
                *)
                    print_critical "🚨 ACTION INCONNUE - MODE CONSTITUTION BROKEN"
                    return 1
                    ;;
            esac
            ;;
        *)
            print_critical "🚨 ÉTAT SYSTÈME INCONNU: $current_state"
            return 1
            ;;
    esac
}

# Fonction pour afficher l'état système
display_system_state() {
    local current_state=$(get_system_state)
    
    print_header "🚨 ÉTAT SYSTÈME CONSTITUTIONNEL"
    
    case "$current_state" in
        "$SYSTEM_STATE_LEGITIMATE")
            echo -e "${GREEN}✅ SYSTÈME CONSTITUTIONNELLEMENT LÉGITIME${NC}"
            echo ""
            echo "Actions autorisées:"
            echo "  ✅ Déploiement"
            echo "  ✅ Migration"
            echo "  ✅ Changements de configuration"
            echo "  ✅ Toutes les opérations normales"
            ;;
        "$SYSTEM_STATE_BROKEN")
            echo -e "${RED}🚨 MODE CONSTITUTION BROKEN ACTIF${NC}"
            echo ""
            echo "Actions INTERDITES:"
            echo "  ❌ Déploiement (tous environnements)"
            echo "  ❌ Migration"
            echo "  ❌ Bascule infrastructure"
            echo "  ❌ Modification configuration critique"
            echo "  ❌ Override manuel"
            echo ""
            echo "Actions AUTORISÉES:"
            echo "  ✅ Lecture (READ-ONLY)"
            echo "  ✅ Génération de rapports"
            echo "  ✅ Audit"
            echo "  ✅ Remédiation guidée"
            echo ""
            echo -e "${PURPLE}👉 Le système ne disparaît pas, il se fige intelligemment${NC}"
            ;;
    esac
    
    echo ""
    echo "Dernière vérification: $(date)"
    echo "Fichier d'état: $BROKEN_STATE_DIR/current_system_state"
}

# Fonction principale
main() {
    local action="$1"
    
    case "$action" in
        "monitor")
            monitor_constitutional_state
            ;;
        "check")
            local action_to_check="$2"
            is_action_allowed "$action_to_check"
            ;;
        "state")
            display_system_state
            ;;
        "force_broken")
            local reason="$2"
            print_warning "⚠️  FORÇAGE MANUEL DU MODE CONSTITUTION BROKEN"
            set_system_state "$SYSTEM_STATE_BROKEN" "Manual override: $reason" "manual_intervention"
            ;;
        "force_restore")
            local reason="$2"
            local evidence="$3"
            print_warning "⚠️  FORÇAGE MANUEL DE LA RESTAURATION"
            set_system_state "$SYSTEM_STATE_LEGITIMATE" "Manual restore: $reason" "$evidence"
            ;;
        *)
            echo "Usage: $0 {monitor|check|state|force_broken|force_restore} [args]"
            echo ""
            echo "Commandes:"
            echo "  monitor                    - Vérifier l'état constitutionnel"
            echo "  check <action>            - Vérifier si une action est autorisée"
            echo "  state                     - Afficher l'état système actuel"
            echo "  force_broken <reason>     - Forcer l'entrée en mode BROKEN"
            echo "  force_restore <reason>    - Forcer la sortie du mode BROKEN"
            echo ""
            echo "Actions: deploy, migration, infra_switch, critical_config_change, manual_override"
            exit 1
            ;;
    esac
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
