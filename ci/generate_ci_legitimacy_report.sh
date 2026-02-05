#!/usr/bin/env bash
# 🏛️ CI Legitimacy Report Generator
# Transforme le rapport CI en événement constitutionnel
# Mode "le pipeline cesse d'être un signal, il devient un fait constitutionnel"

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Variables d'environnement requises
: "${SPOFE_DB_URL:?Variable SPOFE_DB_URL requise}"
: "${TARGET_ENV:?Variable TARGET_ENV requise}"
: "${GITHUB_RUN_ID:?Variable GITHUB_RUN_ID requise}"
: "${GITHUB_SHA:?Variable GITHUB_SHA requise}"
: "${GITHUB_REF:?Variable GITHUB_REF requise}"
: "${GOVERNANCE_URL:?Variable GOVERNANCE_URL requise}"

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

# Fonction pour obtenir le temps de la base de données
get_db_time() {
    local db_time
    db_time=$(psql "$SPOFE_DB_URL" -t -c "SELECT now();" | tr -d ' ')
    echo "$db_time"
}

# Fonction pour vérifier les BUILD_PROOF P0
check_build_proofs() {
    print_info "Vérification des BUILD_PROOF P0..."
    
    local count
    count=$(psql "$SPOFE_DB_URL" -t -c "
        SELECT COUNT(*) 
        FROM build_proof_anchors 
        WHERE level = 'P0_CONSTITUTIONAL' 
        AND created_at > NOW() - INTERVAL '1 hour';
    " | tr -d ' ')
    
    if [ "$count" -gt 0 ]; then
        print_success "BUILD_PROOF P0 trouvés: $count"
        echo "PASS"
    else
        print_warning "Aucun BUILD_PROOF P0 récent trouvé"
        echo "FAIL"
    fi
}

# Fonction pour vérifier l'état constitutionnel
check_constitution_state() {
    print_info "Vérification de l'état constitutionnel..."
    
    local broken_count
    broken_count=$(psql "$SPOFE_DB_URL" -t -c "
        SELECT COUNT(*)
        FROM domain_events
        WHERE event_type = 'CONSTITUTION_BROKEN_ENTERED'
        AND NOT EXISTS (
            SELECT 1 FROM domain_events
            WHERE event_type = 'CONSTITUTION_RESTORED'
            AND sequence > (
                SELECT MAX(sequence)
                FROM domain_events
                WHERE event_type = 'CONSTITUTION_BROKEN_ENTERED'
            )
        );
    " | tr -d ' ')
    
    if [ "$broken_count" -eq 0 ]; then
        print_success "État constitutionnel: SAIN"
        echo "HEALTHY"
    else
        print_error "État constitutionnel: BRISÉ"
        echo "BROKEN"
    fi
}

# Fonction pour vérifier l'audit récent
check_audit_freshness() {
    print_info "Vérification de la fraîcheur de l'audit..."
    
    local audit_age
    audit_age=$(psql "$SPOFE_DB_URL" -t -c "
        SELECT EXTRACT(EPOCH FROM (NOW() - MAX(timestamp)))
        FROM domain_events
        WHERE event_type = 'AUDIT_REPORT_GENERATED'
        AND payload->>'conclusion'->>'status' = 'LEGITIMATE';
    " | tr -d ' ')
    
    if [ -n "$audit_age" ] && [ "$(echo "$audit_age < 3600" | bc -l)" -eq 1 ]; then
        print_success "Audit récent trouvé (${audit_age}s)"
        echo "FRESH"
    else
        print_warning "Audit trop ancien ou manquant"
        echo "STALE"
    fi
}

# Fonction pour générer le rapport de légitimité CI
generate_legitimacy_report() {
    print_header "🏛️ GÉNÉRATION RAPPORT LÉGITIMITÉ CI"
    
    # Obtenir le temps de la base de données
    local db_time
    db_time=$(get_db_time)
    print_info "Temps DB: $db_time"
    
    # Effectuer les vérifications
    local build_proof_status
    local constitution_status
    local audit_status
    
    build_proof_status=$(check_build_proofs)
    constitution_status=$(check_constitution_state)
    audit_status=$(check_audit_freshness)
    
    # Déterminer le statut global
    local overall_status="LEGITIMATE"
    local issues=()
    
    if [ "$build_proof_status" = "FAIL" ]; then
        overall_status="ILLEGITIMATE"
        issues+=("BUILD_PROOF manquants")
    fi
    
    if [ "$constitution_status" = "BROKEN" ]; then
        overall_status="ILLEGITIMATE"
        issues+=("Constitution brisée")
    fi
    
    if [ "$audit_status" = "STALE" ]; then
        overall_status="ILLEGITIMATE"
        issues+=("Audit expiré")
    fi
    
    # Obtenir le dernier anchor hash
    local latest_anchor
    latest_anchor=$(psql "$SPOFE_DB_URL" -t -c "
        SELECT current_anchor_hash
        FROM build_proof_anchors
        ORDER BY sequence DESC
        LIMIT 1;
    " | tr -d ' ')
    
    # Générer le rapport JSON
    local report_file="ci_legitimacy_report_${GITHUB_RUN_ID}.json"
    
    cat <<EOF > "$report_file"
{
  "type": "CI_LEGITIMACY_REPORT",
  "pipeline": {
    "provider": "github-actions",
    "run_id": "$GITHUB_RUN_ID",
    "commit": "$GITHUB_SHA",
    "branch": "$GITHUB_REF",
    "repository": "$GITHUB_REPOSITORY"
  },
  "environment": {
    "target": "$TARGET_ENV",
    "generated_at_db": "$db_time"
  },
  "claims": {
    "build_proof_p0": "$build_proof_status",
    "constitution_state": "$constitution_status",
    "audit_freshness": "$audit_status",
    "overall_status": "$overall_status"
  },
  "based_on": {
    "latest_anchor_hash": "$latest_anchor",
    "db_timestamp": "$db_time"
  },
  "issues": [$(printf '"%s",' "${issues[@]}" | sed 's/,$//')],
  "validity": {
    "ttl_minutes": 30,
    "expires_at": "$(date -d "$db_time + 30 minutes" -Iseconds 2>/dev/null || date -u -v+30M -Iseconds 2>/dev/null || echo "$db_time")"
  },
  "metadata": {
    "generated_by": "ci_legitimacy_report_generator",
    "generator_version": "1.0.0",
    "script_path": "$SCRIPT_DIR/generate_ci_legitimacy_report.sh"
  }
}
EOF
    
    print_constitution "Rapport de légitimité généré: $report_file"
    print_ci "Statut global: $overall_status"
    
    if [ "$overall_status" = "ILLEGITIMATE" ]; then
        print_warning "Issues détectées:"
        for issue in "${issues[@]}"; do
            echo "  - $issue"
        done
    fi
    
    echo "$report_file"
}

# Fonction pour signer le rapport (optionnel)
sign_report() {
    local report_file="$1"
    
    print_info "Signature du rapport de légitimité..."
    
    # Vérifier si la clé privée est disponible
    if [ -f "$PROJECT_ROOT/governance/build-proof/keys/build_proof_private.key" ]; then
        # Calculer le hash du rapport
        local hash_file="${report_file%.json}.hash"
        sha256sum "$report_file" > "$hash_file"
        
        # Signer le hash
        local sig_file="${report_file%.json}.sig"
        openssl pkeyutl \
            -sign \
            -inkey "$PROJECT_ROOT/governance/build-proof/keys/build_proof_private.key" \
            -in "$hash_file" \
            -out "$sig_file" 2>/dev/null || {
            print_warning "Signature échouée (OpenSSL non disponible ou clé invalide)"
            return 1
        }
        
        print_success "Rapport signé: $sig_file"
        return 0
    else
        print_warning "Clé privée non trouvée, rapport non signé"
        return 1
    fi
}

# Fonction pour valider le rapport généré
validate_report() {
    local report_file="$1"
    
    print_info "Validation du rapport généré..."
    
    # Vérifier que le fichier est un JSON valide
    if ! jq empty "$report_file" 2>/dev/null; then
        print_error "Rapport JSON invalide"
        return 1
    fi
    
    # Vérifier les champs requis
    local required_fields=(
        "type"
        "pipeline.provider"
        "pipeline.run_id"
        "pipeline.commit"
        "environment.target"
        "claims.overall_status"
        "validity.ttl_minutes"
    )
    
    for field in "${required_fields[@]}"; do
        if ! jq -e ".$field" "$report_file" >/dev/null 2>&1; then
            print_error "Champ requis manquant: $field"
            return 1
        fi
    done
    
    # Vérifier le format du run_id
    local run_id
    run_id=$(jq -r '.pipeline.run_id' "$report_file")
    if [ "$run_id" != "$GITHUB_RUN_ID" ]; then
        print_error "Run_id mismatch: $run_id vs $GITHUB_RUN_ID"
        return 1
    fi
    
    print_success "Rapport validé avec succès"
    return 0
}

# Fonction principale
main() {
    local action="${1:-generate}"
    
    case "$action" in
        "generate")
            print_header "🏛️ CI LEGITIMACY REPORT GENERATOR"
            echo "Target Environment: $TARGET_ENV"
            echo "GitHub Run ID: $GITHUB_RUN_ID"
            echo "GitHub Commit: $GITHUB_SHA"
            echo "GitHub Branch: $GITHUB_REF"
            echo ""
            
            # Générer le rapport
            local report_file
            report_file=$(generate_legitimacy_report)
            
            # Valider le rapport
            if validate_report "$report_file"; then
                # Signer le rapport (optionnel)
                sign_report "$report_file" || true
                
                print_success "🏛️ Rapport de légitimité CI généré avec succès"
                echo "Fichier: $report_file"
                
                # Exporter le chemin pour les autres scripts
                export CI_LEGITIMACY_REPORT_FILE="$report_file"
            else
                print_error "❌ Échec de la validation du rapport"
                exit 1
            fi
            ;;
        "validate")
            local report_file="${2:-}"
            if [ -z "$report_file" ]; then
                print_error "Usage: $0 validate <report_file>"
                exit 1
            fi
            
            if validate_report "$report_file"; then
                print_success "✅ Rapport valide"
            else
                print_error "❌ Rapport invalide"
                exit 1
            fi
            ;;
        "help")
            echo "Usage: $0 {generate|validate|help}"
            echo ""
            echo "Commands:"
            echo "  generate  - Génère le rapport de légitimité CI"
            echo "  validate  - Valide un rapport existant"
            echo "  help      - Affiche cette aide"
            echo ""
            echo "Environment variables:"
            echo "  SPOFE_DB_URL     - URL de connexion PostgreSQL"
            echo "  TARGET_ENV       - Environnement cible"
            echo "  GITHUB_RUN_ID    - ID du run GitHub Actions"
            echo "  GITHUB_SHA       - SHA du commit"
            echo "  GITHUB_REF       - Référence Git"
            echo "  GOVERNANCE_URL   - URL du Guardian API"
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
