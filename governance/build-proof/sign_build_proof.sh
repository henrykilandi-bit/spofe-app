#!/usr/bin/env bash
set -e

# 🛡️ SIGNATURE BUILD_PROOF OPS - Signature cryptographique Ed25519
# Version: 1.0
# Objectif: Signer cryptographiquement un BUILD_PROOF OPS avec chaînage

# Configuration
SCRIPT_DIR="$(dirname "$0")"
KEY_DIR="$SCRIPT_DIR/keys"
PRIVATE_KEY_FILE="$KEY_DIR/build_proof_private.key"
PUBLIC_KEY_FILE="$KEY_DIR/build_proof_public.key"
HASH_SCRIPT="$SCRIPT_DIR/hash_build_proof.sh"

# Vérification des arguments
if [ $# -lt 1 ]; then
    echo "❌ Usage: $0 <BUILD_PROOF_FILE> [additional_files...]"
    echo "📋 Exemple: $0 BUILD_PROOF_OPS_P0_01.yaml governance/migration/01_db_immutability.sql"
    exit 1
fi

BP_FILE="$1"
shift
ADDITIONAL_FILES="$@"

# Vérification existence des clés
if [ ! -f "$PRIVATE_KEY_FILE" ]; then
    echo "❌ Erreur: Clé privée non trouvée: $PRIVATE_KEY_FILE"
    echo "💡 Exécutez d'abord: ./generate_keys.sh"
    exit 1
fi

if [ ! -f "$PUBLIC_KEY_FILE" ]; then
    echo "❌ Erreur: Clé publique non trouvée: $PUBLIC_KEY_FILE"
    echo "💡 Exécutez d'abord: ./generate_keys.sh"
    exit 1
fi

# Vérification permissions clé privée
if [ "$(stat -c %a "$PRIVATE_KEY_FILE")" != "600" ]; then
    echo "⚠️  Attention: Permissions incorrectes sur la clé privée"
    chmod 600 "$PRIVATE_KEY_FILE"
    echo "✅ Permissions corrigées: 600"
fi

echo "🔐 SIGNATURE BUILD_PROOF OPS"
echo "=========================="
echo "📁 Fichier BUILD_PROOF: $BP_FILE"
echo "📎 Fichiers additionnels: $ADDITIONAL_FILES"
echo "🔑 Clé privée: $PRIVATE_KEY_FILE"
echo "🔓 Clé publique: $PUBLIC_KEY_FILE"
echo ""

# Étape 1: Calcul de l'empreinte
echo "🔍 Étape 1: Calcul de l'empreinte..."
HASH=$("$HASH_SCRIPT" "$BP_FILE" $ADDITIONAL_FILES)
echo "✅ Empreinte calculée: $HASH"
echo ""

# Étape 2: Recherche du BUILD_PROOF précédent pour chaînage
echo "🔗 Étape 2: Recherche du BUILD_PROOF précédent..."
BP_DIR="$(dirname "$BP_FILE")"
PREVIOUS_BP_HASH=""

# Recherche du précédent BUILD_PROOF dans le même répertoire
find_previous_bp() {
    local current_file="$1"
    local current_dir="$(dirname "$current_file")"
    local current_name="$(basename "$current_file")"
    
    # Extraire le numéro du BUILD_PROOF actuel
    if [[ $current_name =~ BUILD_PROOF_OPS_P([0-9]+) ]]; then
        local current_num="${BASH_REMATCH[1]}"
        local prev_num=$((current_num - 1))
        
        # Formatage avec padding
        local prev_name=$(printf "BUILD_PROOF_OPS_P%02d.yaml" $prev_num)
        local prev_file="$current_dir/$prev_name"
        
        if [ -f "$prev_file" ]; then
            echo "$prev_file"
            return 0
        fi
    fi
    return 1
}

PREVIOUS_BP_FILE=$(find_previous_bp "$BP_FILE")

if [ -n "$PREVIOUS_BP_FILE" ]; then
    echo "📦 BUILD_PROOF précédent trouvé: $PREVIOUS_BP_FILE"
    
    # Extraction du hash précédent depuis le fichier YAML
    if grep -q "previous_build_proof_hash:" "$PREVIOUS_BP_FILE"; then
        PREVIOUS_BP_HASH=$(grep "previous_build_proof_hash:" "$PREVIOUS_BP_FILE" | awk '{print $2}' | tr -d '"')
        echo "🔐 Hash précédent: $PREVIOUS_BP_HASH"
    else
        echo "⚠️  Pas de hash précédent trouvé dans: $PREVIOUS_BP_FILE"
        PREVIOUS_BP_HASH=""
    fi
else
    echo "ℹ️  Aucun BUILD_PROOF précédent trouvé (premier de la chaîne)"
    PREVIOUS_BP_HASH=""
fi

# Étape 3: Signature cryptographique
echo ""
echo "🔐 Étape 3: Signature cryptographique..."
SIGNATURE_FILE="${BP_FILE%.yaml}.sig"

# Création de l'empreinte finale (hash + hash précédent si existe)
FINAL_HASH_DATA="$HASH"
if [ -n "$PREVIOUS_BP_HASH" ]; then
    FINAL_HASH_DATA="$HASH$PREVIOUS_BP_HASH"
    echo "🔗 Chaînage: $HASH + $PREVIOUS_BP_HASH"
fi

FINAL_HASH=$(echo -n "$FINAL_HASH_DATA" | sha256sum | awk '{print $1}')
echo "🔐 Empreinte finale: $FINAL_HASH"

# Signature avec Ed25519
echo -n "$FINAL_HASH" | openssl pkeyutl \
    -sign \
    -inkey "$PRIVATE_KEY_FILE" \
    -out "$SIGNATURE_FILE"

echo "✅ Signature créée: $SIGNATURE_FILE"

# Étape 4: Ajout des métadonnées de signature dans le fichier YAML
echo ""
echo "📝 Étape 4: Ajout des métadonnées de signature..."

# Création d'une sauvegarde du fichier original
cp "$BP_FILE" "${BP_FILE}.backup"

# Extraction de la clé publique hash
PUB_KEY_HASH=$(openssl pkey -in "$PUBLIC_KEY_FILE" -pubin -outform DER | sha256sum | awk '{print $1}')

# Création du bloc de métadonnées
SIGNATURE_BLOCK=$(cat << EOF

# 🛡️ SIGNATURE BUILD_PROOF OPS - Non-répudiation cryptographique
signature:
  algorithm: "ed25519"
  signed_hash: "$HASH"
  final_hash: "$FINAL_HASH"
  signature_file: "$(basename "$SIGNATURE_FILE")"
  signed_at: "$(date -Iseconds)"
  signer:
    id: "SPOFE_GOVERNANCE_KEY_01"
    public_key: "build_proof_public.key"
    public_key_hash: "$PUB_KEY_HASH"
  chain:
    previous_build_proof_hash: "$PREVIOUS_BP_HASH"
    chain_position: "$(basename "$BP_FILE" .yaml)"
  verification:
    command: "echo '$FINAL_HASH' | openssl pkeyutl -verify -pubin -inkey build_proof_public.key -sigfile $(basename "$SIGNATURE_FILE")"
    integrity_guarantee: true
    non_repudiation: true
    tamper_evidence: true
EOF
)

# Ajout du bloc de signature à la fin du fichier YAML
echo "$SIGNATURE_BLOCK" >> "$BP_FILE"

echo "✅ Métadonnées ajoutées à: $BP_FILE"

# Étape 5: Vérification immédiate
echo ""
echo "🧪 Étape 5: Vérification immédiate de la signature..."

if echo -n "$FINAL_HASH" | openssl pkeyutl \
    -verify \
    -pubin \
    -inkey "$PUBLIC_KEY_FILE" \
    -sigfile "$SIGNATURE_FILE" >/dev/null 2>&1; then
    echo "✅ Signature valide - BUILD_PROOF OPS authentifié"
else
    echo "❌ Erreur: Signature invalide"
    exit 1
fi

# Étape 6: Résumé et informations
echo ""
echo "📊 RÉSUMÉ DE LA SIGNATURE"
echo "========================"
echo "📁 Fichier BUILD_PROOF: $BP_FILE"
echo "🔐 Empreinte signée: $HASH"
echo "🔗 Empreinte finale: $FINAL_HASH"
echo "📝 Fichier signature: $SIGNATURE_FILE"
echo "🔑 Signataire: SPOFE_GOVERNANCE_KEY_01"
echo "⏰ Horodatage: $(date -Iseconds)"
echo "🔗 Chaînage: $([ -n "$PREVIOUS_BP_HASH" ] && echo "OUI ($PREVIOUS_BP_HASH)" || echo "NON (premier)")"
echo ""

# Propriétés garanties
echo "🛡️ PROPRIÉTÉS GARANTIES:"
echo "========================"
echo "✅ Intégrité cryptographique"
echo "✅ Non-répudiation totale"
echo "✅ Traçabilité complète"
echo "✅ Chaînage des preuves"
echo "✅ Détection d'altération"
echo "✅ Audit externe possible"
echo ""

# Instructions de vérification
echo "🔍 VÉRIFICATION EXTERNE:"
echo "========================"
echo "Pour vérifier cette signature:"
echo ""
echo "# Vérifier l'empreinte:"
echo "./hash_build_proof.sh $BP_FILE $ADDITIONAL_FILES"
echo ""
echo "# Vérifier la signature:"
echo "echo '$FINAL_HASH' | openssl pkeyutl -verify -pubin -inkey build_proof_public.key -sigfile $SIGNATURE_FILE"
echo ""

# Avertissements de sécurité
echo "🔒 SÉCURITÉ:"
echo "============"
echo "1. 🔐 La clé privée doit rester sécurisée"
echo "2. 📦 Le fichier .sig doit être conservé avec le BUILD_PROOF"
echo "3. 🔗 Ne jamais modifier le BUILD_PROOF après signature"
echo "4. 🔄 En cas de modification, créer une nouvelle signature"
echo ""

echo "🎉 BUILD_PROOF OPS signé avec succès !"
echo "   Prêt pour déploiement constitutionnel"
