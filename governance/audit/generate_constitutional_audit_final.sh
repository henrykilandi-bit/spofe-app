#!/usr/bin/env bash
set -e

# 📊 GÉNÉRATION RAPPORT AUDIT CONSTITUTIONNEL FINAL
# Mode "audit = fait prouvé, traçable, opposable" activé
# Version finale liée aux domain_events

# Configuration
SCRIPT_DIR="$(dirname "$0")"
GOVERNANCE_DIR="$(dirname "$SCRIPT_DIR")"
AUDIT_DIR="$GOVERNANCE_DIR/audit/reports"
BUILD_PROOF_DIR="$GOVERNANCE_DIR/build-proof"
KEYS_DIR="$BUILD_PROOF_DIR/keys"

# Configuration DB
PG_HOST="${SPOFE_DB_HOST:-localhost}"
PG_PORT="${SPOFE_DB_PORT:-5432}"
PG_USER="${SPOFE_DB_USER:-spofe_user}"
PG_DB="${SPOFE_DB_NAME:-spofe}"
PG_URL="postgresql://$PG_USER@$PG_HOST:$PG_PORT/$PG_DB"

# Timestamp formaté
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_SHORT=$(date +"%Y%m%d_%H%M%S")
REPORT_ID="AUDIT_REPORT_$DATE_SHORT"

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
    echo "📊 $1"
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

print_audit() {
    echo -e "${PURPLE}📊 $1${NC}"
}

print_fact() {
    echo -e "${CYAN}📋 $1${NC}"
}

# Création des répertoires
mkdir -p "$AUDIT_DIR"
mkdir -p "$KEYS_DIR"

# Fonction pour exécuter une requête PostgreSQL
execute_query() {
    local query="$1"
    local description="$2"
    
    if [ -n "$description" ]; then
        print_info "Exécution: $description"
    fi
    
    if command -v psql >/dev/null 2>&1; then
        psql "$PG_URL" -t -c "$query" 2>/dev/null || {
            print_error "Erreur lors de l'exécution de la requête"
            echo "Query: $query"
            return 1
        }
    else
        print_warning "PostgreSQL non disponible - simulation"
        echo "Query: $query"
        return 0
    fi
}

# Fonction pour générer le rapport d'audit
generate_audit_report() {
    local report_file="$1"
    
    print_header "📊 GÉNÉRATION RAPPORT AUDIT CONSTITUTIONNEL"
    echo "Report ID: $REPORT_ID"
    echo "Timestamp: $TIMESTAMP"
    echo "Fichier: $report_file"
    echo ""
    
    # 1. Obtenir l'horodatage de la base de données
    print_fact "Étape 1: Horodatage constitutionnel (DB)"
    local db_timestamp=$(execute_query "
        SELECT to_char(now(), 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') as db_time;
    " "Horodatage DB" | xargs)
    
    if [ -z "$db_timestamp" ]; then
        db_timestamp="$TIMESTAMP"
    fi
    
    print_success "Horodatage DB: $db_timestamp"
    
    # 2. Obtenir les séquences de domain_events
    print_fact "Étape 2: Détermination périmètre d'audit"
    local scope_data=$(execute_query "
        SELECT 
            COALESCE(MIN(sequence), 0) as min_seq,
            COALESCE(MAX(sequence), 0) as max_seq,
            COUNT(*) as total_events
        FROM domain_events;
    " "Périmètre domain_events")
    
    local min_seq=$(echo "$scope_data" | awk 'NR==1 {print $1}')
    local max_seq=$(echo "$scope_data" | awk 'NR==1 {print $2}')
    local total_events=$(echo "$scope_data" | awk 'NR==1 {print $3}')
    
    print_success "Périmètre: séquences $min_seq à $max_seq ($total_events événements)"
    
    # 3. Récupérer les faits critiques audités
    print_fact "Étape 3: Extraction faits critiques audités"
    local critical_facts=$(execute_query "
        SELECT 
            e.id as domain_event_id,
            e.event_type,
            e.sequence,
            e.current_hash as event_hash,
            b.build_proof_id,
            b.level as proof_level,
            b.current_anchor_hash,
            CASE 
                WHEN b.id IS NOT NULL THEN 'PROVEN'
                ELSE 'UNPROVEN'
            END as legitimacy_status
        FROM domain_events e
        LEFT JOIN build_proof_anchors b 
            ON b.domain_event_id = e.id 
            AND b.level = 'P0_CONSTITUTIONAL'
        WHERE e.event_type IN (
            'DEPLOYMENT_REQUESTED',
            'MIGRATION_STARTED',
            'MIGRATION_COMPLETED',
            'CONFIG_CHANGE_REQUESTED',
            'CONSTITUTION_BROKEN_ENTERED',
            'CONSTITUTION_RESTORED'
        )
        ORDER BY e.sequence;
    " "Extraction faits critiques")
    
    # 4. Analyser les résultats
    print_fact "Étape 4: Analyse légitimité"
    local facts_checked=$(echo "$critical_facts" | grep -c "^[^[:space:]]" || echo "0")
    local facts_without_proof=$(echo "$critical_facts" | grep "UNPROVEN" | wc -l || echo "0")
    
    print_success "Faits vérifiés: $facts_checked"
    print_success "Faits sans preuve: $facts_without_proof"
    
    # 5. Déterminer la conclusion (binaire)
    local conclusion_status
    if [ "$facts_without_proof" -gt 0 ]; then
        conclusion_status="ILLEGITIMATE"
        print_error "Conclusion: ILLEGITIMATE ($facts_without_proof faits sans preuve)"
    else
        conclusion_status="LEGITIMATE"
        print_success "Conclusion: LEGITIMATE (tous les faits sont prouvés)"
    fi
    
    # 6. Générer le JSON du rapport
    print_fact "Étape 6: Génération JSON du rapport"
    
    # Construire le tableau des faits audités
    local facts_json="["
    local first_fact=true
    
    if [ -n "$critical_facts" ]; then
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                local event_id=$(echo "$line" | awk '{print $1}')
                local event_type=$(echo "$line" | awk '{print $2}')
                local sequence=$(echo "$line" | awk '{print $3}')
                local event_hash=$(echo "$line" | awk '{print $4}')
                local proof_id=$(echo "$line" | awk '{print $5}')
                local proof_level=$(echo "$line" | awk '{print $6}')
                local anchor_hash=$(echo "$line" | awk '{print $7}')
                local legitimacy=$(echo "$line" | awk '{print $8}')
                
                if [ "$first_fact" = true ]; then
                    first_fact=false
                else
                    facts_json="$facts_json,"
                fi
                
                facts_json="$facts_json{
                  \"domain_event_id\": \"$event_id\",
                  \"event_type\": \"$event_type\",
                  \"sequence\": $sequence,
                  \"hash\": \"$event_hash\""
                
                if [ "$legitimacy" = "PROVEN" ]; then
                    facts_json="$facts_json,
                  \"proof\": {
                    \"build_proof_id\": \"$proof_id\",
                    \"level\": \"$proof_level\",
                    \"anchor_hash\": \"$anchor_hash\"
                  }"
                else
                    facts_json="$facts_json,
                  \"proof\": null"
                fi
                
                facts_json="$facts_json,
                  \"legitimacy_status\": \"$legitimacy\"
                }"
            fi
        done <<< "$critical_facts"
    fi
    
    facts_json="$facts_json]"
    
    # Créer le rapport JSON complet
    local audit_report_json=$(cat << EOF
{
  "audit_type": "SYSTEM_LEGITIMACY_REPORT",
  "generated_at_db": "$db_timestamp",
  "report_id": "$REPORT_ID",
  
  "scope": {
    "domain_events_from_sequence": $min_seq,
    "domain_events_to_sequence": $max_seq,
    "total_domain_events": $total_events
  },
  
  "facts_audited": $facts_json,
  
  "summary": {
    "facts_checked": $facts_checked,
    "facts_without_proof": $facts_without_proof,
    "legitimacy_score": $(( facts_checked > 0 ? (facts_checked - facts_without_proof) * 100 / facts_checked : 0 ))
  },
  
  "conclusion": {
    "status": "$conclusion_status",
    "rule": "OPS-P0-AUDIT-01: Binary legitimacy assessment",
    "threshold": "All critical facts must have P0 proofs"
  },
  
  "metadata": {
    "generated_by": "generate_constitutional_audit_final.sh",
    "constitution_level": "P0",
    "linked_to_domain_events": true,
    "verifiable": true,
    "reproducible": true
  }
}
EOF
)
    
    # 7. Sauvegarder le rapport JSON
    echo "$audit_report_json" > "$report_file"
    print_success "Rapport JSON sauvegardé: $report_file"
    
    # 8. Calculer le hash du rapport
    print_fact "Étape 7: Calcul hash du rapport"
    local report_hash=$(sha256sum "$report_file" | awk '{print $1}')
    echo "$report_hash" > "${report_file}.hash"
    print_success "Hash rapport: $report_hash"
    
    # 9. Signer le rapport (si clé disponible)
    print_fact "Étape 8: Signature du rapport"
    if [ -f "$KEYS_DIR/build_proof_private.key" ]; then
        # Hash du rapport pour signature
        openssl dgst -sha256 -binary "$report_file" > "${report_file}.digest"
        
        # Signature
        openssl pkeyutl \
            -sign \
            -inkey "$KEYS_DIR/build_proof_private.key" \
            -in "${report_file}.digest" \
            -out "${report_file}.sig" 2>/dev/null || {
            print_warning "Signature OpenSSL échouée, tentative avec Ed25519"
            # Tentative avec Ed25519 si disponible
            if command -v ssh-keygen >/dev/null 2>&1; then
                ssh-keygen -Y sign -n spofe-audit -f "$KEYS_DIR/build_proof_private.key" "$report_file" > "${report_file}.sig" 2>/dev/null || {
                    print_warning "Signature Ed25519 échouée"
                }
            fi
        }
        
        # Nettoyer le fichier temporaire
        rm -f "${report_file}.digest"
        
        if [ -f "${report_file}.sig" ]; then
            print_success "Rapport signé: ${report_file}.sig"
        else
            print_warning "Échec de la signature du rapport"
        fi
    else
        print_warning "Clé privée non trouvée: $KEYS_DIR/build_proof_private.key"
        print_info "Génération de la clé de signature..."
        "$BUILD_PROOF_DIR/generate_keys.sh" >/dev/null 2>&1 || true
    fi
    
    # 10. Afficher le résumé
    echo ""
    print_audit "📊 RÉSUMÉ RAPPORT AUDIT CONSTITUTIONNEL"
    echo "Report ID: $REPORT_ID"
    echo "Horodatage DB: $db_timestamp"
    echo "Périmètre: $min_seq → $max_seq"
    echo "Faits vérifiés: $facts_checked"
    echo "Faits sans preuve: $facts_without_proof"
    echo "Conclusion: $conclusion_status"
    echo "Hash: $report_hash"
    
    if [ -f "${report_file}.sig" ]; then
        echo "Signature: ✅"
    else
        echo "Signature: ❌"
    fi
    
    return 0
}

# Fonction pour ancrer le rapport d'audit dans le ledger (option P0++)
anchor_audit_report() {
    local report_file="$1"
    local report_hash="$2"
    local conclusion_status="$3"
    
    print_header "⛓️ ANCRAGE RAPPORT DANS LEDGER (P0++)"
    
    if [ ! -f "$report_file" ]; then
        print_error "Fichier de rapport non trouvé: $report_file"
        return 1
    fi
    
    # Créer un domain_event pour le rapport d'audit
    print_fact "Création domain_event pour le rapport"
    local event_type="AUDIT_REPORT_GENERATED"
    local event_data=$(cat << EOF
{
  "report_id": "$REPORT_ID",
  "report_hash": "$report_hash",
  "conclusion_status": "$conclusion_status",
  "generated_at": "$TIMESTAMP",
  "constitution_level": "P0"
}
EOF
)
    
    # Utiliser le script d'ancrage avec événement
    if [ -f "$GOVERNANCE_DIR/build-proof/anchor_proof_with_event.sh" ]; then
        print_info "Ancrage du rapport avec liaison événement..."
        
        # Créer l'événement et ancrer la preuve
        "$GOVERNANCE_DIR/build-proof/anchor_proof_with_event.sh" create_event_and_anchor_proof \
            "$event_type" \
            "$event_data" \
            "BUILD_PROOF_AUDIT_P0_$DATE_SHORT" \
            "CONSTITUTIONAL_AUDIT" \
            "P0_CONSTITUTIONAL" \
            "$report_hash" \
            "$(if [ -f "${report_file}.sig" ]; then sha256sum "${report_file}.sig" | awk '{print $1}'; else echo "NO_SIGNATURE"; fi)" \
            "AUDIT_SYSTEM"
        
        if [ $? -eq 0 ]; then
            print_success "✅ Rapport ancré dans le ledger"
            print_success "🔄 Le système s'auto-audite maintenant"
        else
            print_warning "⚠️ Échec de l'ancrage du rapport"
        fi
    else
        print_warning "Script d'ancrage non disponible"
    fi
}

# Fonction pour valider un rapport existant
validate_audit_report() {
    local report_file="$1"
    
    print_header "🔍 VALIDATION RAPPORT AUDIT"
    echo "Fichier: $report_file"
    echo ""
    
    if [ ! -f "$report_file" ]; then
        print_error "Fichier de rapport non trouvé: $report_file"
        return 1
    fi
    
    # 1. Valider le hash
    print_fact "Validation hash du rapport"
    local expected_hash=$(sha256sum "$report_file" | awk '{print $1}')
    local stored_hash=""
    
    if [ -f "${report_file}.hash" ]; then
        stored_hash=$(cat "${report_file}.hash")
    fi
    
    if [ "$expected_hash" = "$stored_hash" ]; then
        print_success "Hash valide: $expected_hash"
    else
        print_error "Hash invalide: attendu=$stored_hash, calculé=$expected_hash"
        return 1
    fi
    
    # 2. Valider la signature (si présente)
    if [ -f "${report_file}.sig" ] && [ -f "$KEYS_DIR/build_proof_public.key" ]; then
        print_fact "Validation signature du rapport"
        
        # Préparer le hash pour vérification
        echo "$expected_hash" | tr -d '\n' > "${report_file}.hash.verify"
        
        # Vérification avec OpenSSL
        if openssl pkeyutl \
            -verify \
            -inkey "$KEYS_DIR/build_proof_public.key" \
            -pubin \
            -in "${report_file}.hash.verify" \
            -sigfile "${report_file}.sig" >/dev/null 2>&1; then
            print_success "Signature valide"
        else
            # Tentative avec Ed25519
            if command -v ssh-keygen >/dev/null 2>&1; then
                if ssh-keygen -Y verify -n spofe-audit -f "$KEYS_DIR/build_proof_public.key" -s "${report_file}.sig" "$report_file" >/dev/null 2>&1; then
                    print_success "Signature Ed25519 valide"
                else
                    print_warning "Signature invalide"
                fi
            else
                print_warning "Impossible de vérifier la signature"
            fi
        fi
        
        rm -f "${report_file}.hash.verify"
    else
        print_info "Signature non disponible pour validation"
    fi
    
    # 3. Valider le contenu JSON
    print_fact "Validation structure JSON"
    if command -v jq >/dev/null 2>&1; then
        if jq empty "$report_file" 2>/dev/null; then
            print_success "Structure JSON valide"
            
            # Extraire et afficher les informations clés
            local audit_type=$(jq -r '.audit_type' "$report_file")
            local generated_at=$(jq -r '.generated_at_db' "$report_file")
            local conclusion=$(jq -r '.conclusion.status' "$report_file")
            local facts_checked=$(jq -r '.summary.facts_checked' "$report_file")
            local facts_without_proof=$(jq -r '.summary.facts_without_proof' "$report_file")
            
            echo ""
            print_audit "📊 CONTENU RAPPORT:"
            echo "Type: $audit_type"
            echo "Généré: $generated_at"
            echo "Conclusion: $conclusion"
            echo "Faits vérifiés: $facts_checked"
            echo "Faits sans preuve: $facts_without_proof"
            
        else
            print_error "Structure JSON invalide"
            return 1
        fi
    else
        print_warning "jq non disponible, impossible de valider le JSON"
    fi
    
    return 0
}

# Fonction pour comparer deux rapports
compare_audit_reports() {
    local report1="$1"
    local report2="$2"
    
    print_header "📊 COMPARAISON RAPPORTS AUDIT"
    echo "Rapport 1: $report1"
    echo "Rapport 2: $report2"
    echo ""
    
    if [ ! -f "$report1" ] || [ ! -f "$report2" ]; then
        print_error "Un des fichiers de rapport n'existe pas"
        return 1
    fi
    
    if command -v jq >/dev/null 2>&1; then
        local conclusion1=$(jq -r '.conclusion.status' "$report1")
        local conclusion2=$(jq -r '.conclusion.status' "$report2")
        local time1=$(jq -r '.generated_at_db' "$report1")
        local time2=$(jq -r '.generated_at_db' "$report2")
        local score1=$(jq -r '.summary.legitimacy_score' "$report1")
        local score2=$(jq -r '.summary.legitimacy_score' "$report2")
        
        print_fact "COMPARAISON:"
        echo "Période: $time1 → $time2"
        echo "Conclusion 1: $conclusion1 (score: $score1%)"
        echo "Conclusion 2: $conclusion2 (score: $score2%)"
        echo ""
        
        if [ "$conclusion1" = "$conclusion2" ]; then
            print_success "✅ Conclusions identiques"
        else
            print_warning "⚠️ Conclusions différentes: $conclusion1 → $conclusion2"
        fi
        
        local score_diff=$((score2 - score1))
        if [ $score_diff -gt 0 ]; then
            print_success "✅ Amélioration du score: +$score_diff%"
        elif [ $score_diff -lt 0 ]; then
            print_warning "⚠️ Dégradation du score: $score_diff%"
        else
            print_info "Score stable: $score1%"
        fi
    else
        print_warning "jq non disponible, comparaison limitée"
    fi
}

# Fonction principale
main() {
    local action="$1"
    
    case "$action" in
        "generate")
            local report_file="$AUDIT_DIR/audit_report_${DATE_SHORT}.json"
            generate_audit_report "$report_file"
            
            # Ancrer le rapport si demandé
            if [ "$2" = "--anchor" ]; then
                local report_hash=$(cat "${report_file}.hash")
                local conclusion=$(jq -r '.conclusion.status' "$report_file" 2>/dev/null || echo "UNKNOWN")
                anchor_audit_report "$report_file" "$report_hash" "$conclusion"
            fi
            ;;
        "validate")
            local report_file="$2"
            if [ -z "$report_file" ]; then
                # Prendre le plus récent
                report_file=$(ls -t "$AUDIT_DIR"/audit_report_*.json 2>/dev/null | head -1)
            fi
            validate_audit_report "$report_file"
            ;;
        "compare")
            local report1="$2"
            local report2="$3"
            if [ -z "$report1" ] || [ -z "$report2" ]; then
                # Prendre les deux plus récents
                local reports=($(ls -t "$AUDIT_DIR"/audit_report_*.json 2>/dev/null | head -2))
                report1="${reports[0]}"
                report2="${reports[1]}"
            fi
            compare_audit_reports "$report1" "$report2"
            ;;
        "demo")
            print_header "📊 DÉMONSTRATION AUDIT CONSTITUTIONNEL"
            
            # Générer un rapport de démonstration
            local demo_report="$AUDIT_DIR/demo_audit_report_${DATE_SHORT}.json"
            generate_audit_report "$demo_report"
            
            # Valider le rapport généré
            echo ""
            validate_audit_report "$demo_report"
            
            # Comparer avec le rapport précédent si disponible
            local previous_report=$(ls -t "$AUDIT_DIR"/audit_report_*.json 2>/dev/null | head -2 | tail -1)
            if [ -n "$previous_report" ] && [ "$previous_report" != "$demo_report" ]; then
                echo ""
                compare_audit_reports "$previous_report" "$demo_report"
            fi
            ;;
        *)
            echo "Usage: $0 {generate|validate|compare|demo}"
            echo ""
            echo "Commandes:"
            echo "  generate [--anchor] - Générer un rapport d'audit constitutionnel"
            echo "  validate [file]    - Valider un rapport existant"
            echo "  compare [file1] [file2] - Comparer deux rapports"
            echo "  demo              - Démonstration complète"
            echo ""
            echo "Exemples:"
            echo "  $0 generate --anchor"
            echo "  $0 validate"
            echo "  $0 compare"
            exit 1
            ;;
    esac
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
