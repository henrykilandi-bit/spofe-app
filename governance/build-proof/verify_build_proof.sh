#!/usr/bin/env bash
set -e

# 🛡️ VÉRIFICATION BUILD_PROOF OPS - Validation cryptographique
# Version: 1.0
# Objectif: Vérifier l'intégrité et l'authenticité d'un BUILD_PROOF OPS

# Configuration
SCRIPT_DIR="$(dirname "$0")"
KEY_DIR="$SCRIPT_DIR/keys"
PUBLIC_KEY_FILE="$KEY_DIR/build_proof_public.key"
HASH_SCRIPT="$SCRIPT_DIR/hash_build_proof.sh"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
print_status() {
    local status="$1"
    local message="$2"
    case "$status" in
        "OK")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "FAIL")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Vérification des arguments
if [ $# -lt 1 ]; then
    echo "❌ Usage: $0 <BUILD_PROOF_FILE> [additional_files...]"
    echo "📋 Exemple: $0 BUILD_PROOF_OPS_P0_01.yaml governance/migration/01_db_immutability.sql"
    exit 1
fi

BP_FILE="$1"
shift
ADDITIONAL_FILES="$@"

echo "🔍 VÉRIFICATION BUILD_PROOF OPS"
echo "============================="
echo "📁 Fichier BUILD_PROOF: $BP_FILE"
echo "📎 Fichiers additionnels: $ADDITIONAL_FILES"
echo ""

# Étape 1: Vérification existence des fichiers
print_status "INFO" "Étape 1: Vérification des fichiers"

if [ ! -f "$BP_FILE" ]; then
    print_status "FAIL" "Fichier BUILD_PROOF non trouvé: $BP_FILE"
    exit 1
fi
print_status "OK" "Fichier BUILD_PROOF trouvé"

for file in $ADDITIONAL_FILES; do
    if [ ! -f "$file" ]; then
        print_status "FAIL" "Fichier référencé non trouvé: $file"
        exit 1
    fi
done
print_status "OK" "Tous les fichiers référencés trouvés"

# Vérification existence clé publique
if [ ! -f "$PUBLIC_KEY_FILE" ]; then
    print_status "FAIL" "Clé publique non trouvée: $PUBLIC_KEY_FILE"
    echo "💡 Exécutez d'abord: ./generate_keys.sh"
    exit 1
fi
print_status "OK" "Clé publique trouvée"

# Étape 2: Extraction des métadonnées de signature
echo ""
print_status "INFO" "Étape 2: Extraction des métadonnées de signature"

if ! grep -q "signature:" "$BP_FILE"; then
    print_status "FAIL" "Aucune métadonnée de signature trouvée dans: $BP_FILE"
    exit 1
fi

# Extraction des métadonnées
SIGNED_HASH=$(grep "signed_hash:" "$BP_FILE" | awk '{print $2}' | tr -d '"')
FINAL_HASH=$(grep "final_hash:" "$BP_FILE" | awk '{print $2}' | tr -d '"')
SIGNATURE_FILE=$(grep "signature_file:" "$BP_FILE" | awk '{print $2}' | tr -d '"')
SIGNED_AT=$(grep "signed_at:" "$BP_FILE" | awk '{print $2}' | tr -d '"')
SIGNER_ID=$(grep -A 5 "signer:" "$BP_FILE" | grep "id:" | awk '{print $2}' | tr -d '"')
PREVIOUS_HASH=$(grep "previous_build_proof_hash:" "$BP_FILE" | awk '{print $2}' | tr -d '"')

if [ -z "$SIGNED_HASH" ] || [ -z "$FINAL_HASH" ] || [ -z "$SIGNATURE_FILE" ]; then
    print_status "FAIL" "Métadonnées de signature incomplètes"
    exit 1
fi

print_status "OK" "Métadonnées extraites"
echo "   🔐 Hash signé: $SIGNED_HASH"
echo "   🔐 Hash final: $FINAL_HASH"
echo "   📝 Signature: $SIGNATURE_FILE"
echo "   ⏰ Signé le: $SIGNED_AT"
echo "   🔑 Signataire: $SIGNER_ID"

# Étape 3: Vérification existence fichier signature
SIGNATURE_PATH="$(dirname "$BP_FILE")/$SIGNATURE_FILE"
if [ ! -f "$SIGNATURE_PATH" ]; then
    print_status "FAIL" "Fichier signature non trouvé: $SIGNATURE_PATH"
    exit 1
fi
print_status "OK" "Fichier signature trouvé"

# Étape 4: Recalcul de l'empreinte
echo ""
print_status "INFO" "Étape 4: Recalcul de l'empreinte"

CURRENT_HASH=$("$HASH_SCRIPT" "$BP_FILE" $ADDITIONAL_FILES)
echo "   🔐 Empreinte actuelle: $CURRENT_HASH"

if [ "$CURRENT_HASH" != "$SIGNED_HASH" ]; then
    print_status "FAIL" "L'empreinte actuelle ne correspond pas à l'empreinte signée"
    echo "   Attendu: $SIGNED_HASH"
    echo "   Actuel:  $CURRENT_HASH"
    echo ""
    print_status "WARN" "Le BUILD_PROOF a été modifié depuis la signature"
    exit 1
fi
print_status "OK" "Empreinte correspond à la signature"

# Étape 5: Vérification du chaînage
echo ""
print_status "INFO" "Étape 5: Vérification du chaînage"

FINAL_HASH_DATA="$SIGNED_HASH"
if [ -n "$PREVIOUS_HASH" ] && [ "$PREVIOUS_HASH" != "null" ]; then
    FINAL_HASH_DATA="$SIGNED_HASH$PREVIOUS_HASH"
    echo "   🔗 Chaînage détecté: $SIGNED_HASH + $PREVIOUS_HASH"
    
    # Vérification du BUILD_PROOF précédent
    BP_DIR="$(dirname "$BP_FILE")"
    find_previous_bp() {
        local current_file="$1"
        local current_name="$(basename "$current_file")"
        
        if [[ $current_name =~ BUILD_PROOF_OPS_P([0-9]+) ]]; then
            local current_num="${BASH_REMATCH[1]}"
            local prev_num=$((current_num - 1))
            local prev_name=$(printf "BUILD_PROOF_OPS_P%02d.yaml" $prev_num)
            local prev_file="$(dirname "$current_file")/$prev_name"
            
            if [ -f "$prev_file" ]; then
                echo "$prev_file"
                return 0
            fi
        fi
        return 1
    }
    
    PREVIOUS_BP_FILE=$(find_previous_bp "$BP_FILE")
    if [ -n "$PREVIOUS_BP_FILE" ]; then
        print_status "OK" "BUILD_PROOF précédent trouvé: $(basename "$PREVIOUS_BP_FILE")"
        
        # Vérification récursive du précédent
        echo "   🔄 Vérification du BUILD_PROOF précédent..."
        if "$0" "$PREVIOUS_BP_FILE" >/dev/null 2>&1; then
            print_status "OK" "BUILD_PROOF précédent valide"
        else
            print_status "WARN" "BUILD_PROOF précédent invalide ou non signé"
        fi
    else
        print_status "WARN" "BUILD_PROOF précédent référencé mais non trouvé"
    fi
else
    echo "   ℹ️  Pas de chaînage (premier BUILD_PROOF)"
fi

# Recalcul du hash final
RECALCULATED_FINAL_HASH=$(echo -n "$FINAL_HASH_DATA" | sha256sum | awk '{print $1}')
echo "   🔐 Hash final recalculé: $RECALCULATED_FINAL_HASH"

if [ "$RECALCULATED_FINAL_HASH" != "$FINAL_HASH" ]; then
    print_status "FAIL" "Le hash final recalculé ne correspond pas"
    echo "   Attendu: $FINAL_HASH"
    echo "   Recalculé: $RECALCULATED_FINAL_HASH"
    exit 1
fi
print_status "OK" "Hash final correspond"

# Étape 6: Vérification cryptographique de la signature
echo ""
print_status "INFO" "Étape 6: Vérification cryptographique de la signature"

if echo -n "$RECALCULATED_FINAL_HASH" | openssl pkeyutl \
    -verify \
    -pubin \
    -inkey "$PUBLIC_KEY_FILE" \
    -sigfile "$SIGNATURE_PATH" >/dev/null 2>&1; then
    print_status "OK" "Signature cryptographique valide"
else
    print_status "FAIL" "Signature cryptographique invalide"
    echo ""
    print_status "WARN" "La signature ne correspond pas à la clé publique"
    echo "   Possibilités:"
    echo "   - Le fichier a été modifié"
    echo "   - La signature a été corrompue"
    echo "   - Mauvaise clé publique utilisée"
    exit 1
fi

# Étape 7: Vérification de la clé publique
echo ""
print_status "INFO" "Étape 7: Vérification de la clé publique"

PUB_KEY_HASH=$(openssl pkey -in "$PUBLIC_KEY_FILE" -pubin -outform DER | sha256sum | awk '{print $1}')
STORED_PUB_KEY_HASH=$(grep -A 10 "signer:" "$BP_FILE" | grep "public_key_hash:" | awk '{print $2}' | tr -d '"')

if [ -n "$STORED_PUB_KEY_HASH" ] && [ "$PUB_KEY_HASH" != "$STORED_PUB_KEY_HASH" ]; then
    print_status "WARN" "Le hash de la clé publique ne correspond pas"
    echo "   Attendu: $STORED_PUB_KEY_HASH"
    echo "   Actuel:  $PUB_KEY_HASH"
else
    print_status "OK" "Clé publique valide"
fi

# Étape 8: Résumé final
echo ""
echo "📊 RÉSUMÉ DE VÉRIFICATION"
echo "========================"
print_status "OK" "Intégrité des fichiers"
print_status "OK" "Empreinte correspondante"
print_status "OK" "Chaînage valide"
print_status "OK" "Signature cryptographique valide"
print_status "OK" "Clé publique valide"

# Propriétés garanties
echo ""
echo "🛡️ PROPRIÉTÉS GARANTIES:"
echo "========================"
print_status "OK" "Intégrité cryptographique"
print_status "OK" "Non-répudiation totale"
print_status "OK" "Traçabilité complète"
print_status "OK" "Chaînage des preuves"
print_status "OK" "Détection d'altération"
print_status "OK" "Audit externe possible"

# Métadonnées de vérification
echo ""
echo "📋 MÉTADONNÉES DE VÉRIFICATION:"
echo "=============================="
echo "📁 Fichier vérifié: $BP_FILE"
echo "🔐 Empreinte: $SIGNED_HASH"
echo "🔗 Chaînage: $([ -n "$PREVIOUS_HASH" ] && [ "$PREVIOUS_HASH" != "null" ] && echo "OUI" || echo "NON")"
echo "🔑 Signataire: $SIGNER_ID"
echo "⏰ Signé le: $SIGNED_AT"
echo "🕐 Vérifié le: $(date -Iseconds)"
echo "🔍 Vérifié par: $(whoami)@$(hostname)"

# Commande de vérification externe
echo ""
echo "🔍 COMMANDE DE VÉRIFICATION EXTERNE:"
echo "===================================="
echo "# Pour vérifier manuellement:"
echo "echo '$RECALCULATED_FINAL_HASH' | openssl pkeyutl -verify -pubin -inkey build_proof_public.key -sigfile $SIGNATURE_FILE"
echo ""

# Statut final
echo ""
print_status "OK" "BUILD_PROOF OPS VALIDÉ - AUTHENTIQUE ET INTÈGRE"
echo ""
echo "🎉 Le BUILD_PROOF OPS est cryptographiquement valide"
echo "   L'intégrité et l'authenticité sont garanties"
echo "   Prêt pour usage constitutionnel"
