#!/usr/bin/env bash
# 🏛️ Governance Decision Requester - SPOFE v2.1.0
# Interface constitutionnelle pour demandes d'autorisation Guardian
# Mode "État CI persistant dans ledger immutable"

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
GOVERNANCE_ROOT="$(dirname "$SCRIPT_DIR")"

# Variables par défaut
DEFAULT_ENV="production"
DEFAULT_GOVERNANCE_URL="http://localhost:3333"
DEFAULT_TIMEOUT="30"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Fonctions d'affichage
print_header() {
    echo -e "${PURPLE}🏛️ $1${NC}"
    echo "$(printf '=%.0s' {1..70})"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_constitution() { echo -e "${PURPLE}🏛️ $1${NC}"; }

# Fonction d'aide
show_help() {
    cat << EOF
🏛️ GOVERNANCE DECISION REQUESTER - SPOFE v2.1.0

USAGE:
    $0 [OPTIONS] --action ACTION --entity-type TYPE --entity-id ID

DESCRIPTION:
    Interface constitutionnelle pour demander une autorisation Guardian.
    Génère un événement constitutionnel immutable dans le ledger.

OPTIONS:
    --action ACTION           Action demandée (CREATE, UPDATE, DELETE, APPROVE)
    --entity-type TYPE        Type d'entité (journal_entry, purchase, expense, etc.)
    --entity-id ID           ID de l'entité concernée
    --ci-report FILE         Rapport CI de légitimité (mode CI constitutionnel)
    --ci-mode               Mode spécial CI constitutionnel
    --environment ENV        Environnement cible (default: $DEFAULT_ENV)
    --governance-url URL     URL Guardian API (default: $DEFAULT_GOVERNANCE_URL)
    --timeout SECONDS        Timeout en secondes (default: $DEFAULT_TIMEOUT)
    --context FILE          Fichier JSON de contexte additionnel
    --user-id USER          ID utilisateur (pour audit)
    --dry-run               Simulation sans exécution
    --verbose               Affichage verbose
    --help                  Afficher cette aide

MODES RÉVOLUTIONNAIRES:
    1. Mode Standard:
       $0 --action CREATE --entity-type journal_entry --entity-id 12345
    
    2. Mode CI Constitutionnel:
       $0 --ci-mode --ci-report /tmp/ci_report.json
       
    3. Mode avec contexte:
       $0 --action UPDATE --entity-type purchase --entity-id 678 --context data.json

EXEMPLES:
    # Demande d'autorisation standard
    $0 --action CREATE --entity-type journal_entry --entity-id 12345
    
    # Mode CI constitutionnel (révolution)
    $0 --ci-mode --ci-report /tmp/ci_legitimacy_report.json
    
    # Simulation
    $0 --action DELETE --entity-type expense --entity-id 999 --dry-run

RÉSULTAT:
    - ALLOW: Autorisation accordée (état persistant dans ledger)
    - DENY: Refus avec raison détaillée
    - ERROR: Erreur technique (Guardian inaccessible, etc.)

EXIT CODES:
    0 = ALLOW (autorisation accordée)
    1 = DENY (refus constitutionnel)
    2 = ERROR (erreur technique)
EOF
}

# Variables globales
ACTION=""
ENTITY_TYPE=""
ENTITY_ID=""
CI_REPORT_FILE=""
CI_MODE=false
ENVIRONMENT="$DEFAULT_ENV"
GOVERNANCE_URL="$DEFAULT_GOVERNANCE_URL"
TIMEOUT="$DEFAULT_TIMEOUT"
CONTEXT_FILE=""
USER_ID=""
DRY_RUN=false
VERBOSE=false

# Analyse des paramètres
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --action)
                ACTION="$2"
                shift 2
                ;;
            --entity-type)
                ENTITY_TYPE="$2"
                shift 2
                ;;
            --entity-id)
                ENTITY_ID="$2"
                shift 2
                ;;
            --ci-report)
                CI_REPORT_FILE="$2"
                shift 2
                ;;
            --ci-mode)
                CI_MODE=true
                shift
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --governance-url)
                GOVERNANCE_URL="$2"
                shift 2
                ;;
            --timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            --context)
                CONTEXT_FILE="$2"
                shift 2
                ;;
            --user-id)
                USER_ID="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                print_error "Option inconnue: $1"
                echo "Utiliser --help pour l'aide"
                exit 2
                ;;
        esac
    done
}

# Validation des paramètres
validate_arguments() {
    if [[ "$CI_MODE" == false ]]; then
        if [[ -z "$ACTION" || -z "$ENTITY_TYPE" || -z "$ENTITY_ID" ]]; then
            print_error "En mode standard, --action, --entity-type et --entity-id sont requis"
            echo "Utiliser --help pour l'aide"
            exit 2
        fi
    else
        if [[ -n "$CI_REPORT_FILE" && ! -f "$CI_REPORT_FILE" ]]; then
            print_error "Fichier CI report introuvable: $CI_REPORT_FILE"
            exit 2
        fi
    fi
    
    if [[ -n "$CONTEXT_FILE" && ! -f "$CONTEXT_FILE" ]]; then
        print_error "Fichier contexte introuvable: $CONTEXT_FILE"
        exit 2
    fi
}

# Construction de la requête JSON
build_request_json() {
    local temp_file="/tmp/governance_request_$$.json"
    local current_time=$(date -Iseconds)
    
    if [[ "$CI_MODE" == true ]]; then
        # Mode CI constitutionnel révolutionnaire
        cat > "$temp_file" << EOF
{
  "requestId": "ci_$(date +%s)_$(shuf -i 1000-9999 -n 1)",
  "requestType": "GOVERNANCE_CI_LEGITIMACY",
  "timestamp": "$current_time",
  "environment": "$ENVIRONMENT",
  "ciMode": true,
  "constitutionalContext": {
    "ciReport": $(if [[ -n "$CI_REPORT_FILE" ]]; then cat "$CI_REPORT_FILE"; else echo "null"; fi),
    "pipeline": {
      "runId": "${GITHUB_RUN_ID:-local_$(date +%s)}",
      "sha": "${GITHUB_SHA:-local}",
      "ref": "${GITHUB_REF:-refs/heads/main}",
      "actor": "${GITHUB_ACTOR:-$USER}"
    },
    "legitimacyRequired": true,
    "ttlMinutes": 30
  },
  "auditTrail": {
    "userId": "$USER_ID",
    "source": "governance_decision_requester",
    "version": "2.1.0"
  }
}
EOF
    else
        # Mode standard
        cat > "$temp_file" << EOF
{
  "requestId": "std_$(date +%s)_$(shuf -i 1000-9999 -n 1)",
  "requestType": "GOVERNANCE_DECISION",
  "timestamp": "$current_time",
  "environment": "$ENVIRONMENT",
  "action": "$ACTION",
  "entityType": "$ENTITY_TYPE", 
  "entityId": "$ENTITY_ID",
  "context": $(if [[ -n "$CONTEXT_FILE" ]]; then cat "$CONTEXT_FILE"; else echo "{}"; fi),
  "auditTrail": {
    "userId": "$USER_ID",
    "source": "governance_decision_requester",
    "version": "2.1.0"
  }
}
EOF
    fi
    
    echo "$temp_file"
}

# Envoi de la requête au Guardian
send_governance_request() {
    local request_file="$1"
    local response_file="/tmp/governance_response_$$.json"
    
    if [[ "$VERBOSE" == true ]]; then
        print_info "Requête JSON:"
        cat "$request_file" | jq -C . || cat "$request_file"
        echo ""
    fi
    
    if [[ "$DRY_RUN" == true ]]; then
        print_warning "MODE DRY-RUN: Simulation sans envoi"
        cat "$request_file" | jq . || cat "$request_file"
        return 0
    fi
    
    print_info "Envoi requête Guardian: $GOVERNANCE_URL"
    
    # Requête HTTP avec timeout
    local http_status
    http_status=$(curl -s -w "%{http_code}" \
        -X POST \
        --max-time "$TIMEOUT" \
        -H "Content-Type: application/json" \
        -H "User-Agent: SPOFE-Governance-Requester/2.1.0" \
        -d @"$request_file" \
        "$GOVERNANCE_URL/api/governance/decision" \
        -o "$response_file" 2>/dev/null)
    
    local curl_exit=$?
    
    if [[ $curl_exit -ne 0 ]]; then
        print_error "Erreur réseau (curl exit: $curl_exit)"
        return 2
    fi
    
    if [[ "$VERBOSE" == true ]]; then
        print_info "HTTP Status: $http_status"
        print_info "Réponse Guardian:"
        cat "$response_file" | jq -C . 2>/dev/null || cat "$response_file"
        echo ""
    fi
    
    case "$http_status" in
        200)
            local decision=$(jq -r '.decision // "UNKNOWN"' "$response_file" 2>/dev/null || echo "UNKNOWN")
            case "$decision" in
                "ALLOW")
                    print_success "✅ AUTORISATION ACCORDÉE"
                    print_constitution "État constitutionnel persisté dans ledger"
                    if [[ "$VERBOSE" == true ]]; then
                        jq -r '.reason // "Aucune raison spécifiée"' "$response_file" 2>/dev/null || true
                    fi
                    return 0
                    ;;
                "DENY")
                    print_error "❌ REFUS CONSTITUTIONNEL"
                    local reason=$(jq -r '.reason // "Aucune raison spécifiée"' "$response_file" 2>/dev/null || echo "Raison indisponible")
                    print_warning "Raison: $reason"
                    return 1
                    ;;
                *)
                    print_error "Décision inconnue: $decision"
                    return 2
                    ;;
            esac
            ;;
        400)
            print_error "Requête invalide (400)"
            if [[ "$VERBOSE" == true ]]; then
                cat "$response_file"
            fi
            return 2
            ;;
        403)
            print_error "Accès refusé (403)"
            return 2
            ;;
        404)
            print_error "Guardian API introuvable (404)"
            return 2
            ;;
        500)
            print_error "Erreur interne Guardian (500)"
            if [[ "$VERBOSE" == true ]]; then
                cat "$response_file"
            fi
            return 2
            ;;
        *)
            print_error "Code HTTP inattendu: $http_status"
            return 2
            ;;
    esac
}

# Nettoyage des fichiers temporaires
cleanup() {
    rm -f /tmp/governance_request_$$.json
    rm -f /tmp/governance_response_$$.json
}

# Main function
main() {
    trap cleanup EXIT
    
    print_header "GOVERNANCE DECISION REQUESTER v2.1.0"
    
    parse_arguments "$@"
    validate_arguments
    
    if [[ "$VERBOSE" == true ]]; then
        print_info "Configuration:"
        echo "  Mode CI: $CI_MODE"
        echo "  Action: $ACTION"
        echo "  Entity: $ENTITY_TYPE/$ENTITY_ID"
        echo "  Environment: $ENVIRONMENT"
        echo "  Governance URL: $GOVERNANCE_URL"
        echo "  Timeout: $TIMEOUT s"
        echo ""
    fi
    
    local request_file
    request_file=$(build_request_json)
    
    local result
    send_governance_request "$request_file"
    result=$?
    
    case $result in
        0)
            print_constitution "🏛️ Décision constitutionnelle: AUTORISATION ACCORDÉE"
            ;;
        1)
            print_constitution "🏛️ Décision constitutionnelle: REFUS"
            ;;
        2)
            print_error "🏛️ Erreur technique dans le processus constitutionnel"
            ;;
    esac
    
    exit $result
}

# Check des dépendances
check_dependencies() {
    local missing=false
    
    if ! command -v curl >/dev/null 2>&1; then
        print_error "curl est requis mais non installé"
        missing=true
    fi
    
    if ! command -v jq >/dev/null 2>&1; then
        print_warning "jq recommandé pour un meilleur affichage JSON"
    fi
    
    if [[ "$missing" == true ]]; then
        exit 2
    fi
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    check_dependencies
    main "$@"
fi