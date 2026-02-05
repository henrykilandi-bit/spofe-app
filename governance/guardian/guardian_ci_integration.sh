#!/usr/bin/env bash
# 🛡️ Guardian CI Integration - Intégration CI/CD pour le Guardian de gouvernance
# Mode "la légitimité devient un état système exécutable"

set -e

# Configuration
SCRIPT_DIR="$(dirname "$0")"
GOVERNANCE_DIR="$(dirname "$SCRIPT_DIR")"
GUARDIAN_DIR="$SCRIPT_DIR"

# Configuration du Guardian API
GUARDIAN_URL="${GUARDIAN_URL:-http://localhost:8080}"
GUARDIAN_TIMEOUT="${GUARDIAN_TIMEOUT:-30}"

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
    echo "🛡️ $1"
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

print_guardian() {
    echo -e "${PURPLE}🛡️ $1${NC}"
}

print_ci() {
    echo -e "${CYAN}🔄 $1${NC}"
}

# Fonction pour vérifier que le Guardian est disponible
check_guardian_health() {
    print_info "Vérification de la santé du Guardian..."
    
    if curl -s --max-time "$GUARDIAN_TIMEOUT" "$GUARDIAN_URL/health" >/dev/null 2>&1; then
        print_success "Guardian disponible et en bonne santé"
        return 0
    else
        print_error "Guardian indisponible ou en mauvaise santé"
        return 1
    fi
}

# Fonction pour créer un événement de domaine
create_domain_event() {
    local event_type="$1"
    local payload="$2"
    local source="${3:-CI_SYSTEM}"
    
    print_info "Création de l'événement de domaine: $event_type"
    
    # Simuler la création d'un événement (en pratique, cela viendrait de la DB)
    local event_id="domain_event_$(date +%s)_$(shuf -i 1000-9999 -n 1)"
    
    echo "$event_id"
}

# Fonction pour demander l'autorisation au Guardian
request_authorization() {
    local action="$1"
    local environment="$2"
    local domain_event_id="$3"
    local requested_by="${4:-ci}"
    
    print_guardian "Demande d'autorisation au Guardian..."
    echo "Action: $action"
    echo "Environment: $environment"
    echo "Domain Event ID: $domain_event_id"
    echo "Requested by: $requested_by"
    echo ""
    
    # Construire le payload
    local payload=$(cat << EOF
{
  "action": "$action",
  "environment": "$environment",
  "domain_event_id": "$domain_event_id",
  "requested_by": "$requested_by"
}
EOF
)
    
    print_info "Payload envoyé au Guardian:"
    echo "$payload" | jq . 2>/dev/null || echo "$payload"
    echo ""
    
    # Envoyer la requête au Guardian
    local response=$(curl -s \
        --max-time "$GUARDIAN_TIMEOUT" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$GUARDIAN_URL/governance/authorize" 2>/dev/null || echo '{"error":"curl_failed"}')
    
    if [ -z "$response" ] || [ "$response" = '{"error":"curl_failed"}' ]; then
        print_error "Impossible de contacter le Guardian"
        return 1
    fi
    
    # Parser la réponse
    local decision=$(echo "$response" | jq -r '.decision' 2>/dev/null || echo "UNKNOWN")
    local reason=$(echo "$response" | jq -r '.reason' 2>/dev/null || echo "Parse error")
    
    print_guardian "Réponse du Guardian:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    echo ""
    
    if [ "$decision" = "ALLOW" ]; then
        print_success "✅ AUTORISATION ACCORDÉE"
        print_success "Raison: $reason"
        return 0
    else
        print_error "❌ AUTORISATION REFUSÉE"
        print_error "Raison: $reason"
        return 1
    fi
}

# Fonction pour vérifier le statut de gouvernance
check_governance_status() {
    print_info "Vérification du statut de gouvernance..."
    
    local response=$(curl -s \
        --max-time "$GUARDIAN_TIMEOUT" \
        "$GUARDIAN_URL/governance/status" 2>/dev/null || echo '{"error":"curl_failed"}')
    
    if [ -z "$response" ] || [ "$response" = '{"error":"curl_failed"}' ]; then
        print_error "Impossible de récupérer le statut de gouvernance"
        return 1
    fi
    
    print_guardian "Statut de gouvernance actuel:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    echo ""
    
    local system_status=$(echo "$response" | jq -r '.system_status' 2>/dev/null || echo "UNKNOWN")
    
    if [ "$system_status" = "HEALTHY" ]; then
        print_success "Système constitutionnellement sain"
        return 0
    else
        print_warning "Système constitutionnellement compromis"
        return 1
    fi
}

# Fonction pour vérifier un événement spécifique
verify_domain_event() {
    local domain_event_id="$1"
    
    print_info "Vérification de l'événement: $domain_event_id"
    
    local response=$(curl -s \
        --max-time "$GUARDIAN_TIMEOUT" \
        "$GUARDIAN_URL/governance/verify/$domain_event_id" 2>/dev/null || echo '{"error":"curl_failed"}')
    
    if [ -z "$response" ] || [ "$response" = '{"error":"curl_failed"}' ]; then
        print_error "Impossible de vérifier l'événement"
        return 1
    fi
    
    print_guardian "Vérification de l'événement:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    echo ""
    
    local has_p0_proof=$(echo "$response" | jq -r '.has_p0_proof' 2>/dev/null || echo "false")
    
    if [ "$has_p0_proof" = "true" ]; then
        print_success "L'événement a une preuve P0 valide"
        return 0
    else
        print_warning "L'événement n'a pas de preuve P0"
        return 1
    fi
}

# Fonction principale d'intégration CI
ci_integration() {
    local action="$1"
    local environment="$2"
    
    print_header "🔄 INTÉGRATION CI/CD - GUARDIAN DE GOUVERNANCE"
    echo "Action: $action"
    echo "Environment: $environment"
    echo "Guardian URL: $GUARDIAN_URL"
    echo ""
    
    # 1. Vérifier que le Guardian est disponible
    if ! check_guardian_health; then
        print_error "Le Guardian n'est pas disponible - Arrêt du pipeline"
        exit 1
    fi
    
    # 2. Vérifier le statut de gouvernance
    check_governance_status
    
    # 3. Créer l'événement de domaine approprié
    local domain_event_id
    case "$action" in
        "DEPLOY")
            domain_event_id=$(create_domain_event "DEPLOYMENT_REQUESTED" "{\"environment\":\"$environment\"}")
            ;;
        "MIGRATE")
            domain_event_id=$(create_domain_event "MIGRATION_STARTED" "{\"environment\":\"$environment\"}")
            ;;
        "CONFIG")
            domain_event_id=$(create_domain_event "CONFIG_CHANGE_REQUESTED" "{\"environment\":\"$environment\"}")
            ;;
        *)
            print_error "Action non reconnue: $action"
            exit 1
            ;;
    esac
    
    print_success "Événement de domaine créé: $domain_event_id"
    
    # 4. Demander l'autorisation au Guardian
    if request_authorization "$action" "$environment" "$domain_event_id" "ci"; then
        print_success "✅ PIPELINE AUTORISÉ - Continuer le déploiement"
        
        # 5. Simuler l'action (en pratique, le déploiement continuerait ici)
        print_ci "Exécution de l'action: $action"
        echo "🔄 Simulation du déploiement/migration/configuration..."
        sleep 2
        print_success "✅ Action complétée avec succès"
        
    else
        print_error "❌ PIPELINE BLOQUÉ - Déploiement refusé par le Guardian"
        print_error "Le système refuse d'évoluer pour des raisons constitutionnelles"
        exit 1
    fi
    
    # 6. Vérification finale
    print_info "Vérification finale de l'événement..."
    verify_domain_event "$domain_event_id"
    
    print_success "🎉 Intégration CI/CD terminée avec succès"
}

# Fonction de démonstration
demo() {
    print_header "🛡️ DÉMONSTRATION GUARDIAN DE GOUVERNANCE"
    
    # 1. Vérifier la santé du Guardian
    if ! check_guardian_health; then
        print_error "Le Guardian n'est pas disponible"
        print_info "Démarrez le Guardian avec: python3 guardian_api.py"
        exit 1
    fi
    
    # 2. Afficher le statut actuel
    check_governance_status
    
    # 3. Scénario 1: Déploiement en staging (devrait réussir)
    echo ""
    print_ci "📋 Scénario 1: Déploiement en staging"
    if request_authorization "DEPLOY" "staging" "demo_event_001" "demo"; then
        print_success "✅ Scénario 1 réussi"
    else
        print_warning "⚠️ Scénario 1 bloqué (normal si pas de preuve P0)"
    fi
    
    # 4. Scénario 2: Déploiement en production (plus strict)
    echo ""
    print_ci "📋 Scénario 2: Déploiement en production"
    if request_authorization "DEPLOY" "production" "demo_event_002" "demo"; then
        print_success "✅ Scénario 2 réussi"
    else
        print_warning "⚠️ Scénario 2 bloqué (normal si pas de preuve P0 ou audit récent)"
    fi
    
    # 5. Scénario 3: Migration de base de données
    echo ""
    print_ci "📋 Scénario 3: Migration de base de données"
    if request_authorization "MIGRATE" "production" "demo_event_003" "demo"; then
        print_success "✅ Scénario 3 réussi"
    else
        print_warning "⚠️ Scénario 3 bloqué (normal si pas de preuve P0)"
    fi
    
    print_success "🎉 Démonstration terminée"
}

# Fonction d'aide
show_help() {
    echo "Usage: $0 {ci|demo|status|verify|health}"
    echo ""
    echo "Commandes:"
    echo "  ci <action> <environment> - Intégration CI/CD complète"
    echo "  demo                       - Démonstration des fonctionnalités"
    echo "  status                     - Vérifier le statut de gouvernance"
    echo "  verify <event_id>          - Vérifier un événement spécifique"
    echo "  health                     - Vérifier la santé du Guardian"
    echo ""
    echo "Actions possibles: DEPLOY, MIGRATE, CONFIG"
    echo "Environments possibles: staging, production"
    echo ""
    echo "Variables d'environnement:"
    echo "  GUARDIAN_URL - URL du Guardian API (default: http://localhost:8080)"
    echo "  GUARDIAN_TIMEOUT - Timeout en secondes (default: 30)"
    echo ""
    echo "Exemples:"
    echo "  $0 ci DEPLOY staging"
    echo "  $0 ci MIGRATE production"
    echo "  $0 demo"
    echo "  $0 status"
}

# Point d'entrée
main() {
    local command="$1"
    
    case "$command" in
        "ci")
            if [ $# -lt 3 ]; then
                echo "Usage: $0 ci <action> <environment>"
                exit 1
            fi
            ci_integration "$2" "$3"
            ;;
        "demo")
            demo
            ;;
        "status")
            check_governance_status
            ;;
        "verify")
            if [ $# -lt 2 ]; then
                echo "Usage: $0 verify <domain_event_id>"
                exit 1
            fi
            verify_domain_event "$2"
            ;;
        "health")
            check_guardian_health
            ;;
        *)
            show_help
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale si le script est appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
