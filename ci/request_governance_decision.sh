#!/usr/bin/env bash
# 🏛️ Governance Decision Requester
# Le CI demande une décision au Guardian de gouvernance
# Mode "le pipeline cesse d'être un signal, il devient un fait constitutionnel"

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Variables d'environnement requises
: "${GOVERNANCE_URL:?Variable GOVERNANCE_URL requise}"
: "${TARGET_ENV:?Variable TARGET_ENV requise}"
: "${GITHUB_RUN_ID:?Variable GITHUB_RUN_ID requise}"
: "${CI_LEGITIMACY_REPORT_FILE:?Variable CI_LEGITIMACY_REPORT_FILE requise}"

# Configuration du Guardian
GUARDIAN_TIMEOUT="${GUARDANCE_TIMEOUT:-30}"
GUARDIAN_RETRY_COUNT="${GUARDIAN_RETRY_COUNT:-3}"
GUARDIAN_RETRY_DELAY="${GUARDANCE_RETRY_DELAY:-5}"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Fonctions d'affichage
print_header() {
    echo "🏛️ $1"
    echo "$(printf '=%.0s' {1..70})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_constitution() {
    echo -e "${PURPLE}🏛️ $1${NC}"
}

print_ci() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Fonction pour vérifier que le Guardian est disponible
check_guardian_availability() {
    print_info "Vérification de la disponibilité du Guardian..."
    
    local attempt=1
    while [ $attempt -le $GUARDIAN_RETRY_COUNT ]; do
        if curl -s --max-time "$GUARDIAN_TIMEOUT" \
            "$GOVERNANCE_URL/health" >/dev/null 2>&1; then
            print_success "Guardian disponible (tentative $attempt/$GUARDIAN_RETRY_COUNT)"
            return 0
        fi
        
        print_warning "Guardian indisponible (tentative $attempt/$GUARDIAN_RETRY_COUNT)"
        if [ $attempt -lt $GUARDIAN_RETRY_COUNT ]; then
            echo "Attente de $GUARDIAN_RETRY_DELAY secondes..."
            sleep "$GUARDIAN_RETRY_DELAY"
        fi
        ((attempt++))
    done
    
    print_error "❌ Guardian indisponible après $GUARDIAN_RETRY_COUNT tentatives"
    return 1
}

# Fonction pour valider le rapport de légitimité
validate_legitimacy_report() {
    local report_file="$1"
    
    print_info "Validation du rapport de légitimité..."
    
    # Vérifier que le fichier existe
    if [ ! -f "$report_file" ]; then
        print_error "Rapport de légitimité non trouvé: $report_file"
        return 1
    fi
    
    # Vérifier que le fichier est un JSON valide
    if ! jq empty "$report_file" 2>/dev/null; then
        print_error "Rapport de légitimité JSON invalide"
        return 1
    fi
    
    # Vérifier les champs critiques
    local required_fields=(
        "type"
        "pipeline.run_id"
        "pipeline.commit"
        "environment.target"
        "claims.overall_status"
        "validity.ttl_minutes"
    )
    
    for field in "${required_fields[@]}"; do
        if ! jq -e ".$field" "$report_file" >/dev/null 2>&1; then
            print_error "Champ requis manquant dans le rapport: $field"
            return 1
        fi
    done
    
    # Vérifier que le run_id correspond
    local report_run_id
    report_run_id=$(jq -r '.pipeline.run_id' "$report_file")
    if [ "$report_run_id" != "$GITHUB_RUN_ID" ]; then
        print_error "Run_id mismatch dans le rapport: $report_run_id vs $GITHUB_RUN_ID"
        return 1
    fi
    
    print_success "Rapport de légitimité validé"
    return 0
}

# Fonction pour construire le payload de la requête
build_request_payload() {
    local report_file="$1"
    
    print_info "Construction du payload de requête..."
    
    # Lire et valider le rapport
    local report_content
    report_content=$(jq '.' "$report_file")
    
    # Construire le payload
    local payload
    payload=$(jq -n \
        --arg action "CI_EVALUATION" \
        --arg environment "$TARGET_ENV" \
        --argjson ci_report "$report_content" \
        --arg requested_by "github_actions" \
        --arg domain_event_id "ci_event_$GITHUB_RUN_ID" \
        '{
            "action": $action,
            "environment": $environment,
            "ci_report": $ci_report,
            "requested_by": $requested_by,
            "domain_event_id": $domain_event_id
        }')
    
    echo "$payload"
}

# Fonction pour envoyer la requête au Guardian
send_governance_request() {
    local payload="$1"
    local attempt=1
    
    print_constitution "Envoi de la requête au Guardian de gouvernance..."
    echo "URL: $GOVERNANCE_URL/governance/authorize"
    echo "Environment: $TARGET_ENV"
    echo "Run ID: $GITHUB_RUN_ID"
    echo ""
    
    print_ci "Payload envoyé:"
    echo "$payload" | jq .
    echo ""
    
    while [ $attempt -le $GUARDIAN_RETRY_COUNT ]; do
        print_info "Tentative $attempt/$GUARDIAN_RETRY_COUNT..."
        
        # Envoyer la requête
        local response
        response=$(curl -s \
            --max-time "$GUARDANCE_TIMEOUT" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "$payload" \
            "$GOVERNANCE_URL/governance/authorize" 2>/dev/null || echo '{"error":"curl_failed"}')
        
        # Vérifier la réponse
        if [ "$response" = '{"error":"curl_failed"}' ]; then
            print_warning "Échec de la requête curl (tentative $attempt/$GUARDIAN_RETRY_COUNT)"
            if [ $attempt -lt $GUARDIAN_RETRY_COUNT ]; then
                echo "Attente de $GUARDIAN_RETRY_DELAY secondes..."
                sleep "$GUARDIAN_RETRY_DELAY"
            fi
            ((attempt++))
            continue
        fi
        
        # Parser la réponse
        local decision
        decision=$(echo "$response" | jq -r '.decision' 2>/dev/null || echo "UNKNOWN")
        local reason
        reason=$(echo "$response" | jq -r '.reason' 2>/dev/null || echo "Parse error")
        
        print_constitution "Réponse du Guardian (tentative $attempt):"
        echo "$response" | jq . 2>/dev/null || echo "$response"
        echo ""
        
        if [ "$decision" != "UNKNOWN" ]; then
            # Réponse valide reçue
            echo "$response"
            return 0
        fi
        
        # Réponse invalide
        print_warning "Réponse invalide du Guardian (tentative $attempt/$GUARDIAN_RETRY_COUNT)"
        if [ $attempt -lt $GUARDIAN_RETRY_COUNT ]; then
            echo "Attente de $GUARDIAN_RETRY_DELAY secondes..."
            sleep "$GUARDIAN_RETRY_DELAY"
        fi
        ((attempt++))
    done
    
    print_error "❌ Échec après $GUARDIAN_RETRY_COUNT tentatives"
    return 1
}

# Fonction pour traiter la décision du Guardian
process_governance_decision() {
    local response="$1"
    
    print_constitution "Traitement de la décision du Guardian..."
    
    # Extraire les informations
    local decision
    local reason
    local request_id
    
    decision=$(echo "$response" | jq -r '.decision' 2>/dev/null || echo "UNKNOWN")
    reason=$(echo "$response" | jq -r '.reason' 2>/dev/null || echo "Parse error")
    request_id=$(echo "$response" | jq -r '.request_id' 2>/dev/null || echo "N/A")
    
    echo "Décision: $decision"
    echo "Raison: $reason"
    echo "Request ID: $request_id"
    echo ""
    
    # Traiter selon la décision
    case "$decision" in
        "ALLOW")
            print_success "✅ GOVERNANCE ALLOWED"
            print_success "Raison: $reason"
            print_constitution "Le CI est maintenant constitutionnellement légitime"
            
            # Exporter les variables pour les étapes suivantes
            export GOVERNANCE_DECISION="$decision"
            export GOVERNANCE_REASON="$reason"
            export GOVERNANCE_REQUEST_ID="$request_id"
            
            return 0
            ;;
        "DENY")
            print_error "❌ GOVERNANCE DENIED"
            print_error "Raison: $reason"
            print_constitution "Le CI est constitutionnellement illégitime"
            
            # Exporter les variables pour le débogage
            export GOVERNANCE_DECISION="$decision"
            export GOVERNANCE_REASON="$reason"
            export GOVERNANCE_REQUEST_ID="$request_id"
            
            return 1
            ;;
        *)
            print_error "❌ DÉCISION INCONNUE: $decision"
            print_error "Réponse complète: $response"
            return 1
            ;;
    esac
}

# Fonction pour vérifier l'état CI écrit dans le ledger
verify_ci_state_written() {
    local request_id="$1"
    
    print_info "Vérification de l'état CI écrit dans le ledger..."
    
    # Attendre un peu que l'état soit écrit
    sleep 2
    
    # Vérifier que l'état a été écrit
    local state_check
    state_check=$(psql "$SPOFE_DB_URL" -t -c "
        SELECT payload->>'state'
        FROM domain_events
        WHERE event_type = 'GOVERNANCE_CI_STATE_SET'
        AND payload->>'request_id' = '$request_id'
        ORDER BY sequence DESC
        LIMIT 1;
    " 2>/dev/null | tr -d ' ')
    
    if [ "$state_check" = "CI_LEGITIMATE" ]; then
        print_success "État CI écrit dans le ledger: $state_check"
        return 0
    elif [ "$state_check" = "CI_ILLEGITIMATE" ]; then
        print_warning "État CI écrit dans le ledger: $state_check"
        return 1
    else
        print_warning "État CI non trouvé dans le ledger (request_id: $request_id)"
        return 1
    fi
}

# Fonction principale
main() {
    local action="${1:-request}"
    
    case "$action" in
        "request")
            print_header "🏛️ GOVERNANCE DECISION REQUESTER"
            echo "Target Environment: $TARGET_ENV"
            echo "GitHub Run ID: $GITHUB_RUN_ID"
            echo "Guardian URL: $GOVERNANCE_URL"
            echo "CI Report: $CI_LEGITIMACY_REPORT_FILE"
            echo ""
            
            # 1. Vérifier la disponibilité du Guardian
            if ! check_guardian_availability; then
                print_error "❌ Guardian indisponible - Arrêt du pipeline"
                exit 1
            fi
            
            # 2. Valider le rapport de légitimité
            if ! validate_legitimacy_report "$CI_LEGITIMACY_REPORT_FILE"; then
                print_error "❌ Rapport de légitimité invalide - Arrêt du pipeline"
                exit 1
            fi
            
            # 3. Construire le payload
            local payload
            payload=$(build_request_payload "$CI_LEGITIMACY_REPORT_FILE")
            
            # 4. Envoyer la requête au Guardian
            local response
            if ! response=$(send_governance_request "$payload"); then
                print_error "❌ Échec de la communication avec le Guardian"
                exit 1
            fi
            
            # 5. Traiter la décision
            if process_governance_decision "$response"; then
                # 6. Vérifier l'état écrit (optionnel)
                local request_id
                request_id=$(echo "$response" | jq -r '.request_id' 2>/dev/null || echo "")
                if [ -n "$request_id" ] && [ "$request_id" != "null" ]; then
                    verify_ci_state_written "$request_id" || true
                fi
                
                print_success "🏛️ CI LÉGITIMITÉ ACCORDÉE - Continuer le pipeline"
            else
                print_error "❌ CI LÉGITIMITÉ REFUSÉE - Arrêt du pipeline"
                exit 1
            fi
            ;;
        "validate")
            local report_file="${2:-$CI_LEGITIMACY_REPORT_FILE}"
            if [ -z "$report_file" ]; then
                print_error "Usage: $0 validate <report_file>"
                exit 1
            fi
            
            if validate_legitimacy_report "$report_file"; then
                print_success "✅ Rapport valide"
            else
                print_error "❌ Rapport invalide"
                exit 1
            fi
            ;;
        "check")
            print_info "Vérification de la disponibilité du Guardian..."
            if check_guardian_availability; then
                print_success "✅ Guardian disponible"
            else
                print_error "❌ Guardian indisponible"
                exit 1
            fi
            ;;
        "help")
            echo "Usage: $0 {request|validate|check|help}"
            echo ""
            echo "Commands:"
            echo "  request   - Demande une décision au Guardian (défaut)"
            echo "  validate  - Valide un rapport de légitimité"
            echo "  check     - Vérifie la disponibilité du Guardian"
            echo "  help      - Affiche cette aide"
            echo ""
            echo "Environment variables:"
            echo "  GOVERNANCE_URL               - URL du Guardian API"
            echo "  TARGET_ENV                  - Environnement cible"
            echo "  GITHUB_RUN_ID               - ID du run GitHub Actions"
            echo "  CI_LEGITIMACY_REPORT_FILE   - Fichier du rapport de légitimité"
            echo "  GUARDIAN_TIMEOUT            - Timeout en secondes (défaut: 30)"
            echo "  GUARDIAN_RETRY_COUNT        - Nombre de tentatives (défaut: 3)"
            echo "  GUARDIAN_RETRY_DELAY        - Délai entre tentatives (défaut: 5)"
            echo ""
            echo "SPOFE_DB_URL est requise pour la vérification du ledger"
            ;;
        *)
            print_error "Action inconnue: $action"
            echo "Utilisez '$0 help' pour voir les commandes disponibles"
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale si le script est appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
