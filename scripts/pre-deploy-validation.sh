#!/usr/bin/env bash
set -e

# 🛡️ PRÉ-DÉPLOYEMENT - VALIDATION CONSTITUTIONNELLE COMPLÈTE
# Version: 1.0
# Objectif: Validation complète avant déploiement en production
# Mode: No Proof → No Deploy

# Configuration
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GOVERNANCE_DIR="$PROJECT_ROOT/governance"
BUILD_PROOF_DIR="$GOVERNANCE_DIR/build-proof"
VALIDATION_REPORT="$PROJECT_ROOT/artifacts/pre-deploy-validation-$(date +%Y%m%d-%H%M%S).json"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions d'affichage
print_header() {
    echo "🛡️ $1"
    echo "$(printf '=%.0s' {1..70})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Initialisation du rapport
init_validation_report() {
    cat > "$VALIDATION_REPORT" << EOF
{
  "pre_deploy_validation": {
    "timestamp": "$(date -Iseconds)",
    "script_version": "1.0",
    "project_root": "$PROJECT_ROOT",
    "environment": "production",
    "status": "RUNNING",
    "checks": {
      "total": 0,
      "passed": 0,
      "failed": 0,
      "skipped": 0
    },
    "categories": {
      "build_proof": {"status": "PENDING", "checks": []},
      "security": {"status": "PENDING", "checks": []},
      "infrastructure": {"status": "PENDING", "checks": []},
      "compliance": {"status": "PENDING", "checks": []}
    },
    "conclusion": "PENDING",
    "deployment_approval": false
  }
}
EOF
}

# Mise à jour du rapport
update_report() {
    local jq_path="$1"
    local value="$2"
    
    if command -v jq >/dev/null 2>&1; then
        jq "$jq_path = $value" "$VALIDATION_REPORT" > "$VALIDATION_REPORT.tmp" && mv "$VALIDATION_REPORT.tmp" "$VALIDATION_REPORT"
    fi
}

# Ajout d'une vérification au rapport
add_check() {
    local category="$1"
    local name="$2"
    local status="$3"
    local message="$4"
    
    if command -v jq >/dev/null 2>&1; then
        jq ".categories.$category.checks += [{\"name\": \"$name\", \"status\": \"$status\", \"message\": \"$message\", \"timestamp\": \"$(date -Iseconds)\"}]" "$VALIDATION_REPORT" > "$VALIDATION_REPORT.tmp" && mv "$VALIDATION_REPORT.tmp" "$VALIDATION_REPORT"
    fi
    
    # Mise à jour des compteurs
    if command -v jq >/dev/null 2>&1; then
        case "$status" in
            "PASSED")
                jq '.checks.passed += 1 | .checks.total += 1' "$VALIDATION_REPORT" > "$VALIDATION_REPORT.tmp" && mv "$VALIDATION_REPORT.tmp" "$VALIDATION_REPORT"
                ;;
            "FAILED")
                jq '.checks.failed += 1 | .checks.total += 1' "$VALIDATION_REPORT" > "$VALIDATION_REPORT.tmp" && mv "$VALIDATION_REPORT.tmp" "$VALIDATION_REPORT"
                ;;
            "SKIPPED")
                jq '.checks.skipped += 1 | .checks.total += 1' "$VALIDATION_REPORT" > "$VALIDATION_REPORT.tmp" && mv "$VALIDATION_REPORT.tmp" "$VALIDATION_REPORT"
                ;;
        esac
    fi
}

# Vérification 1: BUILD_PROOF Constitutionnel
validate_build_proof() {
    print_header "VÉRIFICATION BUILD_PROOF CONSTITUTIONNEL"
    
    local category="build_proof"
    local all_passed=true
    
    # Vérification de la politique
    print_info "Vérification de la politique de gouvernance..."
    if [ -f "$GOVERNANCE_DIR/policy.yml" ]; then
        print_success "Politique de gouvernance présente"
        add_check "$category" "governance_policy" "PASSED" "Politique de gouvernance trouvée"
    else
        print_failure "Politique de gouvernance manquante"
        add_check "$category" "governance_policy" "FAILED" "Politique de gouvernance manquante"
        all_passed=false
    fi
    
    # Vérification des clés cryptographiques
    print_info "Vérification des clés cryptographiques..."
    local public_key="$BUILD_PROOF_DIR/keys/build_proof_public.key"
    if [ -f "$public_key" ]; then
        print_success "Clé publique présente"
        add_check "$category" "cryptographic_keys" "PASSED" "Clé publique trouvée"
    else
        print_failure "Clé publique manquante"
        add_check "$category" "cryptographic_keys" "FAILED" "Clé publique manquante"
        all_passed=false
    fi
    
    # Vérification des BUILD_PROOF requis
    print_info "Vérification des BUILD_PROOF requis..."
    local required_proofs=(
        "BUILD_PROOF_OPS_P0_01.yaml"
        "BUILD_PROOF_OPS_P0_02.yaml"
        "BUILD_PROOF_OPS_P0_03.yaml"
        "BUILD_PROOF_OPS_P0_04.yaml"
        "BUILD_PROOF_OPS_P0_05.yaml"
        "BUILD_PROOF_ATTACK_P0_DB_01.yaml"
    )
    
    local missing_proofs=()
    for proof in "${required_proofs[@]}"; do
        if [ -f "$BUILD_PROOF_DIR/$proof" ]; then
            print_success "BUILD_PROOF présent: $proof"
        else
            print_failure "BUILD_PROOF manquant: $proof"
            missing_proofs+=("$proof")
        fi
    done
    
    if [ ${#missing_proofs[@]} -eq 0 ]; then
        add_check "$category" "required_proofs" "PASSED" "Tous les BUILD_PROOF requis sont présents"
    else
        add_check "$category" "required_proofs" "FAILED" "BUILD_PROOF manquants: ${missing_proofs[*]}"
        all_passed=false
    fi
    
    # Vérification des signatures
    print_info "Vérification des signatures des BUILD_PROOF..."
    local unsigned_proofs=()
    
    for proof_file in "$BUILD_PROOF_DIR"/BUILD_PROOF_*.yaml; do
        if [ -f "$proof_file" ]; then
            local proof_name=$(basename "$proof_file" .yaml)
            local signature_file=$(yq '.signature.signature_file' "$proof_file" 2>/dev/null || echo "")
            
            if [ -n "$signature_file" ] && [ -f "$(dirname "$proof_file")/$signature_file" ]; then
                print_success "Signature présente: $proof_name"
            else
                print_warning "Signature manquante: $proof_name"
                unsigned_proofs+=("$proof_name")
            fi
        fi
    done
    
    if [ ${#unsigned_proofs[@]} -eq 0 ]; then
        add_check "$category" "proof_signatures" "PASSED" "Toutes les signatures présentes"
    else
        add_check "$category" "proof_signatures" "FAILED" "Signatures manquantes: ${unsigned_proofs[*]}"
        all_passed=false
    fi
    
    # Exécution du script de vérification
    print_info "Exécution de la vérification BUILD_PROOF..."
    if [ -f "$GOVERNANCE_DIR/verify_build_proof.sh" ]; then
        if "$GOVERNANCE_DIR/verify_build_proof.sh"; then
            print_success "Vérification BUILD_PROOF réussie"
            add_check "$category" "verification_script" "PASSED" "Script de vérification exécuté avec succès"
        else
            print_failure "Vérification BUILD_PROOF échouée"
            add_check "$category" "verification_script" "FAILED" "Script de vérification échoué"
            all_passed=false
        fi
    else
        print_failure "Script de vérification manquant"
        add_check "$category" "verification_script" "FAILED" "Script de vérification manquant"
        all_passed=false
    fi
    
    # Mise à jour du statut de la catégorie
    if [ "$all_passed" = true ]; then
        update_report ".categories.build_proof.status" "\"PASSED\""
        print_success "Catégorie BUILD_PROOF: ✅ VALIDÉE"
        return 0
    else
        update_report ".categories.build_proof.status" "\"FAILED\""
        print_failure "Catégorie BUILD_PROOF: ❌ ÉCHOUÉE"
        return 1
    fi
}

# Vérification 2: Sécurité
validate_security() {
    print_header "VÉRIFICATION SÉCURITÉ"
    
    local category="security"
    local all_passed=true
    
    # Vérification des variables d'environnement
    print_info "Vérification des variables d'environnement critiques..."
    local critical_vars=("JWT_SECRET" "DB_PASSWORD" "ENCRYPTION_KEY")
    local missing_vars=()
    
    for var in "${critical_vars[@]}"; do
        if [ -n "${!var}" ]; then
            print_success "Variable présente: $var"
        else
            print_warning "Variable manquante: $var"
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        add_check "$category" "environment_variables" "PASSED" "Variables critiques présentes"
    else
        add_check "$category" "environment_variables" "WARNING" "Variables manquantes: ${missing_vars[*]}"
    fi
    
    # Vérification des permissions
    print_info "Vérification des permissions des fichiers sensibles..."
    local sensitive_files=(
        "$BUILD_PROOF_DIR/keys/build_proof_private.key"
        "$GOVERNANCE_DIR/policy.yml"
    )
    
    for file in "${sensitive_files[@]}"; do
        if [ -f "$file" ]; then
            local perms=$(stat -c "%a" "$file" 2>/dev/null || echo "unknown")
            if [[ "$file" == *"private.key" && "$perms" == "600" ]]; then
                print_success "Permissions correctes: $file ($perms)"
            elif [[ "$file" != *"private.key" && "$perms" =~ ^[64][4][4]$ ]]; then
                print_success "Permissions correctes: $file ($perms)"
            else
                print_warning "Permissions suspectes: $file ($perms)"
                add_check "$category" "file_permissions" "WARNING" "Permissions suspectes: $file ($perms)"
            fi
        fi
    done
    
    # Vérification des dépendances
    print_info "Vérification des dépendances de sécurité..."
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        if command -v npm >/dev/null 2>&1; then
            cd "$PROJECT_ROOT"
            if npm audit --audit-level=high >/dev/null 2>&1; then
                print_success "Aucune vulnérabilité haute détectée"
                add_check "$category" "dependency_security" "PASSED" "Aucune vulnérabilité haute"
            else
                print_warning "Vulnérabilités détectées"
                add_check "$category" "dependency_security" "WARNING" "Vulnérabilités détectées"
            fi
        fi
    fi
    
    # Mise à jour du statut de la catégorie
    if [ "$all_passed" = true ]; then
        update_report ".categories.security.status" "\"PASSED\""
        print_success "Catégorie Sécurité: ✅ VALIDÉE"
    else
        update_report ".categories.security.status" "\"WARNING\""
        print_warning "Catégorie Sécurité: ⚠️ AVERTISSEMENTS"
    fi
    
    return 0
}

# Vérification 3: Infrastructure
validate_infrastructure() {
    print_header "VÉRIFICATION INFRASTRUCTURE"
    
    local category="infrastructure"
    local all_passed=true
    
    # Vérification de la connexion base de données
    print_info "Vérification de la connexion base de données..."
    if command -v psql >/dev/null 2>&1; then
        if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
            print_success "Connexion base de données réussie"
            add_check "$category" "database_connection" "PASSED" "Base de données accessible"
        else
            print_failure "Connexion base de données échouée"
            add_check "$category" "database_connection" "FAILED" "Base de données inaccessible"
            all_passed=false
        fi
    else
        print_warning "Client PostgreSQL non disponible"
        add_check "$category" "database_connection" "SKIPPED" "Client PostgreSQL non disponible"
    fi
    
    # Vérification de l'espace disque
    print_info "Vérification de l'espace disque..."
    local available_space=$(df / | awk 'NR==2 {print $4}')
    local required_space=1048576  # 1GB en KB
    
    if [ "$available_space" -gt "$required_space" ]; then
        print_success "Espace disque suffisant: $((available_space / 1024))MB"
        add_check "$category" "disk_space" "PASSED" "Espace disque suffisant"
    else
        print_failure "Espace disque insuffisant: $((available_space / 1024))MB"
        add_check "$category" "disk_space" "FAILED" "Espace disque insuffisant"
        all_passed=false
    fi
    
    # Mise à jour du statut de la catégorie
    if [ "$all_passed" = true ]; then
        update_report ".categories.infrastructure.status" "\"PASSED\""
        print_success "Catégorie Infrastructure: ✅ VALIDÉE"
    else
        update_report ".categories.infrastructure.status" "\"FAILED\""
        print_failure "Catégorie Infrastructure: ❌ ÉCHOUÉE"
        return 1
    fi
    
    return 0
}

# Vérification 4: Conformité
validate_compliance() {
    print_header "VÉRIFICATION CONFORMITÉ"
    
    local category="compliance"
    local all_passed=true
    
    # Vérification de la documentation
    print_info "Vérification de la documentation requise..."
    local required_docs=(
        "README.md"
        "governance/policy.yml"
        "governance/build-proof/README.md"
    )
    
    local missing_docs=()
    for doc in "${required_docs[@]}"; do
        if [ -f "$PROJECT_ROOT/$doc" ]; then
            print_success "Documentation présente: $doc"
        else
            print_warning "Documentation manquante: $doc"
            missing_docs+=("$doc")
        fi
    done
    
    if [ ${#missing_docs[@]} -eq 0 ]; then
        add_check "$category" "documentation" "PASSED" "Documentation requise présente"
    else
        add_check "$category" "documentation" "WARNING" "Documentation manquante: ${missing_docs[*]}"
    fi
    
    # Vérification des logs
    print_info "Vérification de la configuration des logs..."
    if [ -f "$PROJECT_ROOT/src/config/logging.js" ] || [ -f "$PROJECT_ROOT/src/config/logger.js" ]; then
        print_success "Configuration des logs présente"
        add_check "$category" "logging_configuration" "PASSED" "Configuration des logs trouvée"
    else
        print_warning "Configuration des logs manquante"
        add_check "$category" "logging_configuration" "WARNING" "Configuration des logs manquante"
    fi
    
    # Mise à jour du statut de la catégorie
    if [ "$all_passed" = true ]; then
        update_report ".categories.compliance.status" "\"PASSED\""
        print_success "Catégorie Conformité: ✅ VALIDÉE"
    else
        update_report ".categories.compliance.status" "\"WARNING\""
        print_warning "Catégorie Conformité: ⚠️ AVERTISSEMENTS"
    fi
    
    return 0
}

# Décision finale de déploiement
make_deployment_decision() {
    print_header "DÉCISION FINALE DE DÉPLOIEMENT"
    
    # Comptage des catégories échouées
    local failed_categories=()
    
    for category in build_proof security infrastructure compliance; do
        local status=$(jq -r ".categories.$category.status" "$VALIDATION_REPORT")
        if [ "$status" = "FAILED" ]; then
            failed_categories+=("$category")
        fi
    done
    
    # Statistiques finales
    local total_checks=$(jq '.checks.total' "$VALIDATION_REPORT")
    local passed_checks=$(jq '.checks.passed' "$VALIDATION_REPORT")
    local failed_checks=$(jq '.checks.failed' "$VALIDATION_REPORT")
    local skipped_checks=$(jq '.checks.skipped' "$VALIDATION_REPORT")
    
    echo "📊 RÉSULTATS DE LA VALIDATION:"
    echo "   - Total vérifications: $total_checks"
    echo "   - Réussies: $passed_checks"
    echo "   - Échouées: $failed_checks"
    echo "   - Ignorées: $skipped_checks"
    echo "   - Taux de réussite: $(( passed_checks * 100 / total_checks ))%"
    echo ""
    
    # Décision
    if [ ${#failed_categories[@]} -eq 0 ]; then
        update_report ".conclusion" "\"PASSED\""
        update_report ".deployment_approval" "true"
        
        print_success "✅ VALIDATION PRÉ-DÉPLOIEMENT RÉUSSIE"
        echo ""
        print_success "DÉPLOIEMENT AUTORISÉ"
        echo "   - Légitimité constitutionnelle: ✅ MAINTENUE"
        echo "   - Sécurité: ✅ VALIDÉE"
        echo "   - Infrastructure: ✅ PRÊTE"
        echo "   - Conformité: ✅ RESPECTÉE"
        echo ""
        print_success "🚀 LANCEZ LE DÉPLOIEMENT"
        return 0
    else
        update_report ".conclusion" "\"FAILED\""
        update_report ".deployment_approval" "false"
        
        print_failure "❌ VALIDATION PRÉ-DÉPLOIEMENT ÉCHOUÉE"
        echo ""
        print_failure "DÉPLOIEMENT BLOQUÉ"
        echo "   - Catégories échouées: ${failed_categories[*]}"
        echo ""
        print_failure "🛑 CORRIGEZ LES PROBLÈMES AVANT DE DÉPLOYER"
        return 1
    fi
}

# Fonction principale
main() {
    print_header "VALIDATION PRÉ-DÉPLOIEMENT CONSTITUTIONNELLE"
    echo "Mode: No Proof → No Deploy"
    echo "Timestamp: $(date -Iseconds)"
    echo "Environment: Production"
    echo ""
    
    # Initialisation
    mkdir -p "$(dirname "$VALIDATION_REPORT")"
    init_validation_report
    
    # Exécution des validations
    local validation_results=()
    
    # BUILD_PROOF (bloquant)
    if validate_build_proof; then
        validation_results+=("BUILD_PROOF:PASSED")
    else
        validation_results+=("BUILD_PROOF:FAILED")
    fi
    
    # Sécurité (avertissement)
    if validate_security; then
        validation_results+=("SECURITY:PASSED")
    else
        validation_results+=("SECURITY:WARNING")
    fi
    
    # Infrastructure (bloquant)
    if validate_infrastructure; then
        validation_results+=("INFRASTRUCTURE:PASSED")
    else
        validation_results+=("INFRASTRUCTURE:FAILED")
    fi
    
    # Conformité (avertissement)
    if validate_compliance; then
        validation_results+=("COMPLIANCE:PASSED")
    else
        validation_results+=("COMPLIANCE:WARNING")
    fi
    
    # Décision finale
    echo ""
    echo "📋 RÉSUMÉ DES VALIDATIONS:"
    for result in "${validation_results[@]}"; do
        IFS=':' read -r category status <<< "$result"
        case "$status" in
            "PASSED")
                print_success "$category: ✅"
                ;;
            "FAILED")
                print_failure "$category: ❌"
                ;;
            "WARNING")
                print_warning "$category: ⚠️"
                ;;
        esac
    done
    echo ""
    
    # Décision finale
    if make_deployment_decision; then
        echo ""
        echo "📊 Rapport détaillé: $VALIDATION_REPORT"
        exit 0
    else
        echo ""
        echo "📊 Rapport détaillé: $VALIDATION_REPORT"
        exit 1
    fi
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
