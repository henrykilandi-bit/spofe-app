#!/bin/bash
# verify-wait-for-scripts.sh
# Script de vérification des fichiers wait-for

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Vérification des Scripts Wait-For v2.1                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FILES_OK=0
FILES_TOTAL=10

# Vérifier chaque fichier
check_file() {
    local file=$1
    local description=$2
    
    if [ -f "$SCRIPT_DIR/$file" ]; then
        local size=$(ls -lh "$SCRIPT_DIR/$file" | awk '{print $5}')
        echo "✅ $file ..................... $size"
        FILES_OK=$((FILES_OK + 1))
    else
        echo "❌ $file ..................... MANQUANT"
    fi
}

echo "📦 Vérification des fichiers scripts:"
echo ""
check_file "wait-for-redis.sh" "Script bash Redis"
check_file "wait-for-mysql.sh" "Script bash MySQL"
check_file "wait-for-redis.ps1" "Script PowerShell Redis"
check_file "wait-for-mysql.ps1" "Script PowerShell MySQL"
check_file "startup.sh" "Script démarrage bash"
check_file "startup.ps1" "Script démarrage PowerShell"
echo ""

echo "📚 Vérification de la documentation:"
echo ""
check_file "WAIT_FOR_SCRIPTS_README.md" "Guide détaillé"
check_file "WAIT_FOR_SCRIPTS_SUMMARY.md" "Résumé livraison"
check_file "DOCKER_COMPOSE_WAIT_FOR_INTEGRATION.md" "Integration Docker"
check_file "SPOFE_WAITFOR_COMPLETE.md" "Vue d'ensemble complète"
echo ""

# Résumé
echo "╔══════════════════════════════════════════════════════════╗"
if [ $FILES_OK -eq $FILES_TOTAL ]; then
    echo "║   ✅ TOUS LES FICHIERS SONT PRÉSENTS ($FILES_OK/$FILES_TOTAL)     ║"
    echo "║                                                              ║"
    echo "║   Status: ✅ LIVRAISON COMPLÈTE                             ║"
else
    echo "║   ⚠️  $FILES_OK/$FILES_TOTAL fichiers trouvés"
    echo "║   Il manque $(($FILES_TOTAL - $FILES_OK)) fichier(s)"
fi
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Vérifier la syntaxe des scripts Bash
echo "🔍 Vérification de la syntaxe Bash:"
for file in wait-for-redis.sh wait-for-mysql.sh startup.sh; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        if bash -n "$SCRIPT_DIR/$file" 2>/dev/null; then
            echo "  ✅ $file: syntaxe correcte"
        else
            echo "  ❌ $file: erreur de syntaxe"
        fi
    fi
done
echo ""

# Vérifier les permissions
echo "🔐 Vérification des permissions:"
for file in wait-for-redis.sh wait-for-mysql.sh startup.sh; do
    if [ -f "$SCRIPT_DIR/$file" ]; then
        if [ -x "$SCRIPT_DIR/$file" ]; then
            echo "  ✅ $file: exécutable"
        else
            echo "  ℹ️  $file: non exécutable (run: chmod +x $file)"
        fi
    fi
done
echo ""

# Vérifier les variables d'environnement
echo "🌍 Vérification des variables d'environnement:"
echo "  REDIS_HOST: ${REDIS_HOST:-127.0.0.1}"
echo "  REDIS_PORT: ${REDIS_PORT:-6379}"
echo "  MYSQL_HOST: ${MYSQL_HOST:-127.0.0.1}"
echo "  MYSQL_PORT: ${MYSQL_PORT:-3306}"
echo ""

# Test rapide
echo "🧪 Test rapide (optionnel):"
echo "  Pour tester Redis:"
echo "    ./wait-for-redis.sh"
echo "  Pour tester MySQL:"
echo "    ./wait-for-mysql.sh"
echo "  Pour démarrage complet:"
echo "    ./startup.sh dev"
echo ""

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   ✅ Vérification Terminée                               ║"
echo "╚══════════════════════════════════════════════════════════╝"
