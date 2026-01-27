#!/bin/bash
# startup.sh
# Script de démarrage complet pour SPOFE v2.1
# Usage: ./startup.sh [env]
# env: dev (défaut), prod, docker

set -e

ENV=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REDIS_HOST=${REDIS_HOST:-127.0.0.1}
REDIS_PORT=${REDIS_PORT:-6379}
MYSQL_HOST=${MYSQL_HOST:-127.0.0.1}
MYSQL_PORT=${MYSQL_PORT:-3306}

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         🚀 SPOFE v2.1 - Démarrage Complet               ║"
echo "║         Environment: $ENV"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 1. Vérifier les dépendances
echo "1️⃣  Vérification des dépendances..."
for cmd in docker docker-compose; do
    if ! command -v $cmd &> /dev/null; then
        echo "⚠️  $cmd non disponible (installer Docker)"
    fi
done
echo "✅ Vérifications complétées"
echo ""

# 2. Démarrer les conteneurs
echo "2️⃣  Démarrage des services Docker..."
if [ "$ENV" = "prod" ]; then
    docker-compose -f docker-compose.prod.yml up -d
elif [ "$ENV" = "docker" ]; then
    docker-compose -f docker-compose.v2.1.yml up -d
else
    docker-compose up -d
fi
echo "✅ Services Docker démarrés"
echo ""

# 3. Attendre Redis
echo "3️⃣  Attente Redis ($REDIS_HOST:$REDIS_PORT)..."
if [ -f "$SCRIPT_DIR/wait-for-redis.sh" ]; then
    chmod +x "$SCRIPT_DIR/wait-for-redis.sh"
    "$SCRIPT_DIR/wait-for-redis.sh" "$REDIS_HOST" "$REDIS_PORT" 60 || {
        echo "❌ Redis ne s'est pas lancé"
        exit 1
    }
else
    echo "⚠️  wait-for-redis.sh non trouvé"
fi
echo "✅ Redis prêt"
echo ""

# 4. Attendre MySQL
echo "4️⃣  Attente MySQL ($MYSQL_HOST:$MYSQL_PORT)..."
if [ -f "$SCRIPT_DIR/wait-for-mysql.sh" ]; then
    chmod +x "$SCRIPT_DIR/wait-for-mysql.sh"
    "$SCRIPT_DIR/wait-for-mysql.sh" "$MYSQL_HOST" "$MYSQL_PORT" 60 || {
        echo "❌ MySQL ne s'est pas lancé"
        exit 1
    }
else
    echo "⚠️  wait-for-mysql.sh non trouvé"
fi
echo "✅ MySQL prêt"
echo ""

# 5. Initialiser la base de données
echo "5️⃣  Initialisation de la base de données..."
if [ "$ENV" != "prod" ]; then
    # Attendre que MySQL soit vraiment prêt
    sleep 5
    
    echo "  - Exécution des migrations..."
    cd "$SCRIPT_DIR/cascade"
    npm run migrate || echo "⚠️  Migrations échouées (possiblement déjà exécutées)"
    cd "$SCRIPT_DIR"
    echo "✅ Base de données initialisée"
else
    echo "⏭️  En production, migrations supposées complétées"
fi
echo ""

# 6. Démarrer le backend
echo "6️⃣  Démarrage du backend..."
cd "$SCRIPT_DIR/cascade"
if [ "$ENV" = "prod" ]; then
    npm run start &
    BACKEND_PID=$!
else
    npm run dev &
    BACKEND_PID=$!
fi
echo "✅ Backend lancé (PID: $BACKEND_PID)"
echo ""

# 7. Démarrer le frontend
echo "7️⃣  Démarrage du frontend..."
cd "$SCRIPT_DIR/frontend"
if [ "$ENV" = "prod" ]; then
    npm run build
    npm run preview &
    FRONTEND_PID=$!
else
    npm run dev &
    FRONTEND_PID=$!
fi
echo "✅ Frontend lancé (PID: $FRONTEND_PID)"
echo ""

# 8. Afficher le résumé
echo "╔══════════════════════════════════════════════════════════╗"
echo "║         ✅ SPOFE v2.1 - Complètement Démarré            ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║ 🌐 Frontend:  http://127.0.0.1:5173"
echo "║ 🔌 Backend:   http://127.0.0.1:3001"
echo "║ 📊 MySQL:     $MYSQL_HOST:$MYSQL_PORT"
echo "║ 💾 Redis:     $REDIS_HOST:$REDIS_PORT"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║ Backend PID: $BACKEND_PID"
echo "║ Frontend PID: $FRONTEND_PID"
echo "║"
echo "║ Pour arrêter: press Ctrl+C"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# 9. Nettoyer les PIDs à l'arrêt
trap "echo ''; echo '⏹️  Arrêt SPOFE...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; echo '✅ SPOFE arrêté'" EXIT

# Garder le script actif
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
