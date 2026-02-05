#!/usr/bin/env bash
set -e

# 🔗 ANCRAGE BUILD_PROOF AVEC DOMAIN_EVENT - PREUVE ↔ FAIT INDISSOCIABLES
# Mode: "preuve ↔ fait : indissociables" activé
# Passage de "preuves à côté des faits" à "preuves attachées aux faits"

# Configuration
SCRIPT_DIR="$(dirname "$0")"
GOVERNANCE_DIR="$(dirname "$SCRIPT_DIR")"
MIGRATION_DIR="$GOVERNANCE_DIR/migration"

# Configuration DB
PG_HOST="${SPOFE_DB_HOST:-localhost}"
PG_PORT="${SPOFE_DB_PORT:-5432}"
PG_USER="${SPOFE_DB_USER:-spofe_user}"
PG_DB="${SPOFE_DB_NAME:-spofe}"
PG_URL="postgresql://$PG_USER@$PG_HOST:$PG_PORT/$PG_DB"

# Timestamp formaté
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
DATE_SHORT=$(date +"%Y%m%d_%H%M%S")

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
    echo "🔗 $1"
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

print_link() {
    echo -e "${PURPLE}🔗 $1${NC}"
}

print_fact() {
    echo -e "${CYAN}📋 $1${NC}"
}

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

# Fonction pour créer un domain_event
create_domain_event() {
    local event_type="$1"
    local event_data="$2"
    local source="$3"
    
    print_fact "📋 CRÉATION DOMAIN_EVENT"
    echo "Type: $event_type"
    echo "Source: $source"
    echo "Timestamp: $TIMESTAMP"
    
    # Génération de l'ID d'événement
    local event_id=$(uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())")
    
    # Calcul du hash de l'événement
    local event_hash=$(echo -n "${event_type}${event_data}${TIMESTAMP}" | sha256sum | awk '{print $1}')
    
    # Récupération de la séquence
    local sequence=$(execute_query "
        SELECT COALESCE(MAX(sequence), 0) + 1 FROM domain_events;
    " "Récupération séquence événement")
    
    # Insertion de l'événement
    local insert_query="
        INSERT INTO domain_events (
            id,
            event_type,
            event_data,
            current_hash,
            sequence,
            timestamp,
            source
        ) VALUES (
            '$event_id',
            '$event_type',
            '\$event_data',
            '$event_hash',
            $sequence,
            '$TIMESTAMP',
            '$source'
        ) RETURNING id, current_hash;
    "
    
    if command -v psql >/dev/null 2>&1; then
        local result=$(psql "$PG_URL" -t -c "$insert_query" 2>/dev/null)
        if [ $? -eq 0 ]; then
            local returned_id=$(echo "$result" | head -1 | xargs)
            local returned_hash=$(echo "$result" | tail -1 | xargs)
            
            print_success "Domain_event créé: $returned_id"
            print_success "Hash: $returned_hash"
            
            echo "$returned_id|$returned_hash"
            return 0
        else
            print_error "Échec de la création du domain_event"
            return 1
        fi
    else
        # Simulation
        print_success "Domain_event simulé: $event_id"
        print_success "Hash simulé: $event_hash"
        echo "$event_id|$event_hash"
        return 0
    fi
}

# Fonction pour ancrer une BUILD_PROOF à un événement
anchor_build_proof_to_event() {
    local build_proof_id="$1"
    local build_proof_type="$2"
    local level="$3"
    local build_proof_hash="$4"
    local signature_hash="$5"
    local domain_event_id="$6"
    local domain_event_hash="$7"
    local source="$8"
    
    print_link "🔗 ANCRAGE BUILD_PROOF À ÉVÉNEMENT"
    echo "BUILD_PROOF: $build_proof_id"
    echo "Type: $build_proof_type"
    echo "Level: $level"
    echo "Event ID: $domain_event_id"
    echo "Source: $source"
    echo "Timestamp: $TIMESTAMP"
    
    # Récupération du hash précédent
    local previous_hash=$(execute_query "
        SELECT current_anchor_hash FROM build_proof_anchors 
        ORDER BY sequence DESC LIMIT 1;
    " "Récupération hash précédent")
    
    # Calcul du hash de l'ancre
    local anchor_hash_data="${build_proof_id}${build_proof_type}${level}${build_proof_hash}${signature_hash}${domain_event_id}${domain_event_hash}${source}${previous_hash}${TIMESTAMP}"
    local current_anchor_hash=$(echo -n "$anchor_hash_data" | sha256sum | awk '{print $1}')
    
    # Récupération de la séquence
    local sequence=$(execute_query "
        SELECT COALESCE(MAX(sequence), 0) + 1 FROM build_proof_anchors;
    " "Récupération séquence ancre")
    
    # Insertion de l'ancre
    local insert_query="
        INSERT INTO build_proof_anchors (
            build_proof_id,
            build_proof_type,
            level,
            build_proof_hash,
            signature_hash,
            current_anchor_hash,
            previous_anchor_hash,
            domain_event_id,
            domain_event_hash,
            sequence,
            timestamp,
            source
        ) VALUES (
            '$build_proof_id',
            '$build_proof_type',
            '$level',
            '$build_proof_hash',
            '$signature_hash',
            '$current_anchor_hash',
            '$previous_hash',
            '$domain_event_id',
            '$domain_event_hash',
            $sequence,
            '$TIMESTAMP',
            '$source'
        ) RETURNING id;
    "
    
    if command -v psql >/dev/null 2>&1; then
        local anchor_id=$(psql "$PG_URL" -t -c "$insert_query" 2>/dev/null | xargs)
        if [ $? -eq 0 ]; then
            print_success "BUILD_PROOF ancré: $anchor_id"
            print_success "Anchor hash: $current_anchor_hash"
            return 0
        else
            print_error "Échec de l'ancrage de la BUILD_PROOF"
            return 1
        fi
    else
        # Simulation
        local anchor_id=$(uuidgen 2>/dev/null || python3 -c "import uuid; print(uuid.uuid4())")
        print_success "BUILD_PROOF ancré (simulé): $anchor_id"
        print_success "Anchor hash (simulé): $current_anchor_hash"
        return 0
    fi
}

# Fonction pour créer un événement et ancrer une preuve (transactionnelle)
create_event_and_anchor_proof() {
    local event_type="$1"
    local event_data="$2"
    local build_proof_id="$3"
    local build_proof_type="$4"
    local level="$5"
    local build_proof_hash="$6"
    local signature_hash="$7"
    local source="$8"
    
    print_header "🔗 CRÉATION ÉVÉNEMENT + ANCRAGE PREUVE (TRANSACTIONNEL)"
    
    # Étape 1: Créer le domain_event
    print_fact "Étape 1: Création du domain_event"
    local event_result=$(create_domain_event "$event_type" "$event_data" "$source")
    
    if [ $? -ne 0 ]; then
        print_error "Échec de la création du domain_event"
        return 1
    fi
    
    local domain_event_id=$(echo "$event_result" | cut -d'|' -f1)
    local domain_event_hash=$(echo "$event_result" | cut -d'|' -f2)
    
    # Étape 2: Ancrer la BUILD_PROOF
    print_link "Étape 2: Ancrage de la BUILD_PROOF"
    if anchor_build_proof_to_event "$build_proof_id" "$build_proof_type" "$level" "$build_proof_hash" "$signature_hash" "$domain_event_id" "$domain_event_hash" "$source"; then
        print_success "✅ Preuve attachée au fait avec succès"
        echo ""
        print_fact "Résumé de la liaison:"
        echo "  Événement: $event_type"
        echo "  Event ID: $domain_event_id"
        echo "  BUILD_PROOF: $build_proof_id"
        echo "  Level: $level"
        echo "  Timestamp: $TIMESTAMP"
        echo ""
        print_link "🔗 Relation preuve ↔ fait : indissociable"
        return 0
    else
        print_error "Échec de l'ancrage de la BUILD_PROOF"
        return 1
    fi
}

# Fonction pour valider l'intégrité fait-preuve
validate_fact_proof_integrity() {
    print_header "🔍 VALIDATION INTÉGRITÉ FAIT-PREUVE"
    
    # Validation 1: Événements critiques sans preuves
    print_fact "Validation 1: Événements critiques sans preuves"
    local critical_unproven=$(execute_query "
        SELECT COUNT(*) FROM unproven_critical_events;
    " "Comptage événements critiques non prouvés")
    
    if [ "$critical_unproven" = "0" ]; then
        print_success "✅ Tous les événements critiques ont des preuves"
    else
        print_warning "⚠️  $critical_unproven événements critiques sans preuves"
        
        # Afficher les événements non prouvés
        execute_query "
            SELECT event_type, timestamp, violation 
            FROM unproven_critical_events 
            ORDER BY timestamp DESC LIMIT 5;
        " "Liste des événements critiques non prouvés"
    fi
    
    # Validation 2: Cohérence des hashes
    print_fact "Validation 2: Cohérence des hashes événement-preuve"
    local hash_violations=$(execute_query "
        SELECT COUNT(*) FROM validate_event_proof_hash_consistency();
    " "Comptage violations de hash")
    
    if [ "$hash_violations" = "0" ]; then
        print_success "✅ Tous les hashes événement-preuve sont cohérents"
    else
        print_warning "⚠️  $hash_violations violations de hash détectées"
    fi
    
    # Validation 3: Score de légitimité
    print_fact "Validation 3: Score de légitimité global"
    local legitimacy_score=$(execute_query "
        SELECT legitimacy_score FROM validate_fact_proof_integrity();
    " "Calcul score légitimité")
    
    if [ -n "$legitimacy_score" ]; then
        local score_num=$(echo "$legitimacy_score" | awk '{printf "%.0f", $1}')
        
        if [ "$score_num" -ge 95 ]; then
            print_success "✅ Score de légitimité: $legitimacy_score% (Excellent)"
        elif [ "$score_num" -ge 80 ]; then
            print_warning "⚠️  Score de légitimité: $legitimacy_score% (Acceptable)"
        else
            print_error "❌ Score de légitimité: $legitimacy_score% (Critique)"
        fi
    else
        print_warning "Score de légitimité non calculable"
    fi
}

# Fonction pour afficher la chaîne fait-preuve
show_fact_proof_chain() {
    local limit="${1:-10}"
    
    print_header "🔗 CHAÎNE FAIT → PREUVE"
    
    print_fact "Affichage des $limit dernières liaisons fait-preuve:"
    echo ""
    
    execute_query "
        SELECT 
            e.sequence as event_seq,
            e.event_type,
            SUBSTRING(e.timestamp::TEXT, 1, 19) as event_time,
            b.build_proof_id,
            b.level as proof_level,
            CASE 
                WHEN b.sequence = e.sequence THEN 'IMMEDIATE'
                WHEN b.sequence = e.sequence + 1 THEN 'CONSECUTIVE'
                ELSE 'DELAYED'
            END as timing,
            EXTRACT(EPOCH FROM (b.timestamp - e.timestamp)) as delay_sec
        FROM domain_events e
        INNER JOIN build_proof_anchors b ON b.domain_event_id = e.id
        ORDER BY e.sequence DESC
        LIMIT $limit;
    " "Récupération chaîne fait-preuve"
}

# Fonction pour migrer les ancrages existants
migrate_existing_anchors() {
    print_header "🔄 MIGRATION ANCRAGES EXISTANTS"
    
    print_warning "Cette opération va lier les ancrages existants à des événements de migration"
    echo "Cela garantit que toutes les preuves ont un fait associé"
    echo ""
    
    read -p "Continuer la migration? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Migration annulée"
        return 0
    fi
    
    if command -v psql >/dev/null 2>&1; then
        local result=$(psql "$PG_URL" -t -c "SELECT * FROM migrate_existing_anchors_to_event_linked();" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            local migrated=$(echo "$result" | head -1 | xargs)
            local failed=$(echo "$result" | tail -1 | xargs)
            
            print_success "Migration terminée:"
            echo "  Ancres migrées: $migrated"
            echo "  Échecs: $failed"
        else
            print_error "Échec de la migration"
        fi
    else
        print_warning "PostgreSQL non disponible - simulation de migration"
        print_success "Migration simulée: 5 ancrages migrées, 0 échecs"
    fi
}

# Fonction principale
main() {
    local action="$1"
    
    case "$action" in
        "anchor")
            local build_proof_id="$2"
            local build_proof_type="$3"
            local level="$4"
            local build_proof_hash="$5"
            local signature_hash="$6"
            local event_type="$7"
            local event_data="$8"
            
            if [ $# -lt 8 ]; then
                print_error "Usage: $0 anchor <build_proof_id> <type> <level> <hash> <signature> <event_type> <event_data>"
                exit 1
            fi
            
            create_event_and_anchor_proof "$event_type" "$event_data" "$build_proof_id" "$build_proof_type" "$level" "$build_proof_hash" "$signature_hash" "MANUAL"
            ;;
        "validate")
            validate_fact_proof_integrity
            ;;
        "chain")
            local limit="${2:-10}"
            show_fact_proof_chain "$limit"
            ;;
        "migrate")
            migrate_existing_anchors
            ;;
        "demo")
            print_header "🔗 DÉMONSTRATION LIAISON FAIT-PREUVE"
            
            # Exemple 1: Déploiement
            print_fact "Exemple 1: Déploiement avec preuve opérationnelle"
            create_event_and_anchor_proof \
                "DEPLOYMENT_REQUESTED" \
                '{"service": "api-gateway", "version": "1.2.3", "environment": "production"}' \
                "BUILD_PROOF_OPS_P0_01" \
                "OPERATIONAL_INVARIANT" \
                "P0_CONSTITUTIONAL" \
                "abc123def456789012345678901234567890123456789012345678901234567890" \
                "def789abc123012345678901234567890123456789012345678901234567890abc" \
                "DEMO"
            
            echo ""
            
            # Exemple 2: Audit
            print_fact "Exemple 2: Audit constitutionnel"
            create_event_and_anchor_proof \
                "CONSTITUTIONAL_AUDIT_REQUESTED" \
                '{"audit_type": "P0_CONSTITUTIONAL", "scope": "full_system", "requested_by": "guardian"}' \
                "BUILD_PROOF_AUDIT_P0_01" \
                "CONSTITUTIONAL_AUDIT" \
                "P0_CONSTITUTIONAL" \
                "456789abc123012345678901234567890123456789012345678901234567890def" \
                "789abc123def456789012345678901234567890123456789012345678901234567" \
                "DEMO"
            
            echo ""
            validate_fact_proof_integrity
            ;;
        *)
            echo "Usage: $0 {anchor|validate|chain|migrate|demo}"
            echo ""
            echo "Commandes:"
            echo "  anchor <bp_id> <type> <level> <hash> <sig> <event_type> <event_data>"
            echo "      - Ancrer une BUILD_PROOF à un événement"
            echo "  validate - Valider l'intégrité fait-preuve"
            echo "  chain [limit] - Afficher la chaîne fait-preuve"
            echo "  migrate - Migrer les ancrages existants"
            echo "  demo - Démonstration de la liaison fait-preuve"
            echo ""
            echo "Exemples:"
            echo "  $0 demo"
            echo "  $0 validate"
            echo "  $0 chain 5"
            exit 1
            ;;
    esac
}

# Point d'entrée
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
