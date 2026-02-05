#!/usr/bin/env bash
set -e

# 🛡️ GÉNÉRATION CLÉS BUILD_PROOF OPS - Ed25519
# Version: 1.0
# Objectif: Générer paire de clés asymétriques pour signature BUILD_PROOF

# Configuration
KEY_DIR="$(dirname "$0")/keys"
PRIVATE_KEY_FILE="$KEY_DIR/build_proof_private.key"
PUBLIC_KEY_FILE="$KEY_DIR/build_proof_public.key"
KEY_ID="SPOFE_GOVERNANCE_KEY_01"

echo "🔐 Génération des clés BUILD_PROOF OPS"
echo "=================================="
echo ""

# Création du répertoire des clés
mkdir -p "$KEY_DIR"
echo "📁 Répertoire des clés: $KEY_DIR"

# Vérification si les clés existent déjà
if [ -f "$PRIVATE_KEY_FILE" ] && [ -f "$PUBLIC_KEY_FILE" ]; then
    echo "⚠️  Les clés existent déjà:"
    echo "   - Clé privée: $PRIVATE_KEY_FILE"
    echo "   - Clé publique: $PUBLIC_KEY_FILE"
    echo ""
    read -p "Voulez-vous régénérer les clés ? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "✅ Génération annulée - clés existantes conservées"
        exit 0
    fi
    
    # Sauvegarde des anciennes clés
    BACKUP_DIR="$KEY_DIR/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp "$PRIVATE_KEY_FILE" "$BACKUP_DIR/"
    cp "$PUBLIC_KEY_FILE" "$BACKUP_DIR/"
    echo "📦 Anciennes clés sauvegardées dans: $BACKUP_DIR"
fi

# Génération de la clé privée Ed25519
echo "🔑 Génération clé privée Ed25519..."
openssl genpkey -algorithm ed25519 -out "$PRIVATE_KEY_FILE"
chmod 600 "$PRIVATE_KEY_FILE"
echo "✅ Clé privée générée: $PRIVATE_KEY_FILE"

# Génération de la clé publique
echo "🔓 Génération clé publique..."
openssl pkey -in "$PRIVATE_KEY_FILE" -pubout -out "$PUBLIC_KEY_FILE"
chmod 644 "$PUBLIC_KEY_FILE"
echo "✅ Clé publique générée: $PUBLIC_KEY_FILE"

# Affichage des informations sur les clés
echo ""
echo "📊 Informations sur les clés:"
echo "=================================="

# Informations clé privée
echo "🔑 Clé privée:"
openssl pkey -in "$PRIVATE_KEY_FILE" -text -noout | grep -E "(Private-Key|pub:)" || true

# Informations clé publique
echo ""
echo "🔓 Clé publique:"
openssl pkey -in "$PUBLIC_KEY_FILE" -pubin -text -noout | grep -E "(Public-Key|pub:)" || true

# Empreinte de la clé publique
PUB_KEY_HASH=$(openssl pkey -in "$PUBLIC_KEY_FILE" -pubin -outform DER | sha256sum | awk '{print $1}')
echo "🔐 Empreinte SHA-256 clé publique: $PUB_KEY_HASH"

# Création du fichier de métadonnées
METADATA_FILE="$KEY_DIR/key_metadata.yaml"
cat > "$METADATA_FILE" << EOF
# 🛡️ MÉTADONNÉES CLÉS BUILD_PROOF OPS
key_id: "$KEY_ID"
algorithm: "ed25519"
created_at: "$(date -Iseconds)"
key_files:
  private_key: "build_proof_private.key"
  public_key: "build_proof_public.key"
public_key_hash: "$PUB_KEY_HASH"
security:
  private_key_permissions: "600 (owner read/write only)"
  public_key_permissions: "644 (owner/group/others read)"
  backup_enabled: true
  rotation_possible: true
usage:
  purpose: "BUILD_PROOF OPS signature"
  scope: "Constitutional migration governance"
  non_repudiation: true
  integrity_guarantee: true
EOF

echo "✅ Métadonnées créées: $METADATA_FILE"

# Instructions de sécurité
echo ""
echo "🔒 INSTRUCTIONS DE SÉCURITÉ:"
echo "=================================="
echo "1. 🔐 NE JAMAIS COMMITTER la clé privée dans Git"
echo "2. 📦 La clé privée doit être stockée de manière sécurisée (HSM, vault, etc.)"
echo "3. 🔓 La clé publique peut être partagée et commitée"
echo "4. 🔄 Rotation des clés possible en cas de compromission"
echo "5. 📋 Conserver une sauvegarde sécurisée de la clé privée"
echo ""

# Vérification finale
echo "🧪 Vérification finale:"
if [ -f "$PRIVATE_KEY_FILE" ] && [ -f "$PUBLIC_KEY_FILE" ]; then
    echo "✅ Paire de clés générée avec succès"
    echo "✅ Prêt pour signature BUILD_PROOF OPS"
else
    echo "❌ Erreur: Génération des clés échouée"
    exit 1
fi

echo ""
echo "🎯 Étape suivante:"
echo "./sign_build_proof.sh BUILD_PROOF_OPS_P0_01.yaml [fichiers_additionnels...]"
echo ""
