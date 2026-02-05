#!/usr/bin/env bash
# 🏛️ Constitutional Health Check - SPOFE v2.1.0
# Validation intelligente de l'état révolutionnaire

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

print_header() {
    echo -e "${PURPLE}🏛️ $1${NC}"
    echo "$(printf '=%.0s' {1..70})"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Variables globales pour le score
TOTAL_CHECKS=0
PASSED_CHECKS=0

check_component() {
    local name="$1"
    local file_path="$2"
    local expected_lines="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [[ -f "$file_path" ]]; then
        local actual_lines=$(wc -l < "$file_path")
        if [[ $actual_lines -ge $expected_lines ]]; then
            print_success "$name: $actual_lines lignes (≥ $expected_lines attendues)"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
            return 0
        else
            print_warning "$name: $actual_lines lignes (< $expected_lines attendues)"
            return 1
        fi
    else
        print_error "$name: Fichier manquant ($file_path)"
        return 1
    fi
}

check_constitutional_components() {
    print_header "VALIDATION COMPOSANTS RÉVOLUTIONNAIRES"
    
    # Composants principaux de la révolution
    check_component "CI Legitimacy Generator" \
        "ci/generate_ci_legitimacy_report.sh" 300
        
    check_component "Guardian Governance Extended" \
        "governance/guardian/governance_guardian.py" 600
        
    check_component "CI Legitimacy Workflow" \
        ".github/workflows/ci-legitimacy-state.yml" 500
        
    check_component "Governance Decision Requester" \
        "governance/scripts/request_governance_decision.sh" 400
        
    echo ""
}

check_database_constitutional() {
    print_header "VALIDATION INFRASTRUCTURE CONSTITUTIONNELLE"
    
    # Vérifier la structure PostgreSQL constitutionnelle
    if command -v psql >/dev/null 2>&1; then
        print_info "PostgreSQL CLI disponible"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "PostgreSQL CLI non disponible (test limité)"
    fi
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    # Vérifier les scripts de schema
    check_component "Schema Constitutional Current" \
        "SCHEMA_BASE_DE_DONNEES_ACTUEL.sql" 50
        
    check_component "Schema SPOFE v2.1 Complete" \
        "schema_spofe_v2_1_complete.sql" 100
        
    echo ""
}

check_build_proof_system() {
    print_header "VALIDATION SYSTÈME BUILD_PROOF"
    
    # BUILD_PROOF global orchestrator
    check_component "BUILD_PROOF Orchestrator" \
        "tools/build-proof-global/orchestrator.ts" 100
        
    # BUILD_PROOF files principaux
    local build_proof_count=0
    for file in BUILD_PROOF_*.json; do
        if [[ -f "$file" ]]; then
            build_proof_count=$((build_proof_count + 1))
        fi
    done
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [[ $build_proof_count -ge 5 ]]; then
        print_success "BUILD_PROOF files: $build_proof_count trouvés (≥ 5)"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        print_warning "BUILD_PROOF files: $build_proof_count trouvés (< 5)"
    fi
    
    echo ""
}

check_frontend_integration() {
    print_header "VALIDATION INTÉGRATION FRONTEND"
    
    # Components Workflow
    check_component "Workflow Approval UI" \
        "frontend/src/components/WorkflowApprovalUI.jsx" 100
        
    check_component "useWorkflow Hook" \
        "frontend/src/hooks/useWorkflow.js" 250
        
    check_component "Approval Detail Page" \
        "frontend/src/pages/approval-detail.jsx" 100
        
    echo ""
}

check_guardian_architecture() {
    print_header "VALIDATION ARCHITECTURE GUARDIAN"
    
    # Guardian v4 binding
    check_component "Guardian v4 Adapter" \
        "src/infrastructure/guardian/GuardianV4Adapter.ts" 50
        
    check_component "Guardian Port Interface" \
        "src/infrastructure/guardian/GuardianPort.ts" 20
        
    check_component "Constitutional Transaction Adapter" \
        "src/application/transaction/ConstitutionalTransactionManagerAdapter.ts" 100
        
    echo ""
}

check_documentation_completeness() {
    print_header "VALIDATION DOCUMENTATION RÉVOLUTIONNAIRE"
    
    # Documentation principale
    check_component "Rapport Révolution CI" \
        "RAPPORT_REVOLUTION_CI_CONSTITUTIONNEL_2026.md" 700
        
    check_component "Matrice Industrialisation" \
        "MATRICE_INDUSTRIALISATION_SPOFE_2026.md" 200
        
    check_component "Documentation Architecture" \
        "SPOFE_ARCHITECTURE_DOCUMENTATION.md" 500
        
    echo ""
}

check_ci_workflow_configuration() {
    print_header "VALIDATION CONFIGURATION CI"
    
    # Package.json scripts
    if [[ -f "package.json" ]]; then
        local guardian_scripts=$(grep -c "guardian" package.json || echo "0")
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        if [[ $guardian_scripts -gt 5 ]]; then
            print_success "Guardian scripts dans package.json: $guardian_scripts"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            print_warning "Guardian scripts dans package.json: $guardian_scripts (< 5)"
        fi
    fi
    
    # TypeScript configuration
    check_component "TypeScript Base Config" \
        "tsconfig.base.json" 10
        
    check_component "TypeScript AGA Config" \
        "tsconfig.aga.json" 5
        
    echo ""
}

generate_constitutional_status() {
    print_header "STATUT CONSTITUTIONNEL SPOFE"
    
    local success_rate=$((PASSED_CHECKS * 100 / TOTAL_CHECKS))
    
    echo "📊 RÉSULTATS DE LA VALIDATION CONSTITUTIONNELLE"
    echo ""
    echo "Total des vérifications : $TOTAL_CHECKS"
    echo "Vérifications réussies  : $PASSED_CHECKS"
    echo "Taux de succès         : $success_rate%"
    echo ""
    
    if [[ $success_rate -ge 90 ]]; then
        print_success "🏛️ SPOFE CONSTITUTIONNELLEMENT OPÉRATIONNEL"
        echo -e "${GREEN}Révolution CI constitutionnelle CONFIRMÉE${NC}"
        return 0
    elif [[ $success_rate -ge 75 ]]; then
        print_warning "🔧 SPOFE RÉVOLUTION EN COURS"
        echo -e "${YELLOW}Optimisations mineures requises${NC}"
        return 1
    else
        print_error "❌ RÉVOLUTION CONSTITUTIONNELLE INCOMPLÈTE"
        echo -e "${RED}Actions correctives majeures requises${NC}"
        return 2
    fi
}

print_next_actions() {
    echo ""
    print_header "ACTIONS RECOMMANDÉES"
    echo ""
    echo "🔧 Actions immédiates :"
    echo "  1. Exécuter tests complets : npm run test"
    echo "  2. Générer BUILD_PROOF : npm run build-proof"
    echo "  3. Tester workflow CI : git push (déclencher pipeline)"
    echo ""
    echo "📋 Actions de suivi :"
    echo "  1. Monitoring quotidien : ./tools/daily-monitor.sh"
    echo "  2. Audit constitutionnel : ./governance/audit/generate.sh"
    echo "  3. Validation Guardian : python governance/guardian/test.py"
    echo ""
}

# Fonction principale
main() {
    cd "$PROJECT_ROOT"
    
    echo -e "${PURPLE}"
    echo "🏛️ CONSTITUTIONAL HEALTH CHECK - SPOFE v2.1.0"
    echo "📅 $(date '+%Y-%m-%d %H:%M:%S')"
    echo "🎯 Validation de la révolution constitutionnelle"
    echo -e "${NC}"
    echo ""
    
    # Exécution des vérifications
    check_constitutional_components
    check_database_constitutional  
    check_build_proof_system
    check_frontend_integration
    check_guardian_architecture
    check_documentation_completeness
    check_ci_workflow_configuration
    
    # Génération du statut final
    local exit_code
    generate_constitutional_status
    exit_code=$?
    
    print_next_actions
    
    echo ""
    echo -e "${PURPLE}🏛️ \"Le pipeline n'est plus un signal. C'est un fait constitutionnel.\"${NC}"
    echo ""
    
    exit $exit_code
}

# Exécution si appelé directement
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi