#!/usr/bin/env bash
set -e

# 🛡️ HASH BUILD_PROOF OPS - Calcul d'empreinte cryptographique
# Version: 1.0
# Objectif: Calculer SHA-256 de l'ensemble BUILD_PROOF + scripts + artefacts

# Vérification des arguments
if [ $# -lt 1 ]; then
    echo "❌ Usage: $0 <BUILD_PROOF_FILE> [additional_files...]"
    echo "📋 Exemple: $0 BUILD_PROOF_OPS_P0_01.yaml governance/migration/01_db_immutability.sql"
    exit 1
fi

BP_FILE="$1"
shift
ADDITIONAL_FILES="$@"

# Vérification existence du fichier principal
if [ ! -f "$BP_FILE" ]; then
    echo "❌ Erreur: Fichier BUILD_PROOF non trouvé: $BP_FILE"
    exit 1
fi

# Vérification existence des fichiers additionnels
for file in $ADDITIONAL_FILES; do
    if [ ! -f "$file" ]; then
        echo "❌ Erreur: Fichier référencé non trouvé: $file"
        exit 1
    fi
done

# Construction de la liste ordonnée des fichiers à hasher
FILES_TO_HASH="$BP_FILE $ADDITIONAL_FILES"

# Affichage des fichiers traités
echo "🔍 Calcul d'empreinte BUILD_PROOF OPS"
echo "📁 Fichier principal: $BP_FILE"
echo "📎 Fichiers additionnels:"
for file in $ADDITIONAL_FILES; do
    echo "   - $file"
done
echo ""

# Calcul de l'empreinte SHA-256
HASH=$(cat $FILES_TO_HASH | sha256sum | awk '{print $1}')

# Affichage du résultat
echo "✅ Empreinte calculée:"
echo "🔐 SHA-256: $HASH"
echo ""

# Export pour utilisation par d'autres scripts
export BUILD_PROOF_HASH="$HASH"

# Affichage des métadonnées
echo "📊 Métadonnées:"
echo "   - Nombre de fichiers: $(echo $FILES_TO_HASH | wc -w)"
echo "   - Taille totale: $(cat $FILES_TO_HASH | wc -c) octets"
echo "   - Timestamp: $(date -Iseconds)"
echo ""

# Retour du hash pour utilisation programmation
echo "$HASH"
