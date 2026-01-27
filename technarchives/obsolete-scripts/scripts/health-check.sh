#!/bin/bash

# SPOFE - Script de monitoring
# Vérifie la santé de tous les services

set -e

echo "🏥 SPOFE Health Check"
echo "===================="

ERRORS=0

# Fonction pour vérifier un service
check_service() {
    SERVICE=$1
    URL=$2
    EXPECTED=$3
    
    echo -n "Vérification $SERVICE... "
    
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || echo "000")
    
    if [ "$RESPONSE" == "$EXPECTED" ]; then
        echo "✅ OK ($RESPONSE)"
    else
        echo "❌ ERREUR ($RESPONSE)"
        ERRORS=$((ERRORS + 1))
    fi
}

# Vérifier les conteneurs Docker
echo -e "\n📦 Status des conteneurs:"
docker-compose ps

# Health checks HTTP
echo -e "\n🌐 Health checks HTTP:"
check_service "Backend API" "http://localhost:3001/health" "200"
check_service "Frontend" "http://localhost/health" "200"
check_service "Prometheus" "http://localhost:9090/-/healthy" "200"
check_service "Grafana" "http://localhost:3000/api/health" "200"

# Vérifier MySQL
echo -ne "\n🗄️  Vérification MySQL... "
if docker-compose exec -T mysql mysqladmin ping -h localhost --silent 2>/dev/null; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
    ERRORS=$((ERRORS + 1))
fi

# Vérifier Redis
echo -n "🔴 Vérification Redis... "
if docker-compose exec -T redis redis-cli ping 2>/dev/null | grep -q PONG; then
    echo "✅ OK"
else
    echo "❌ ERREUR"
    ERRORS=$((ERRORS + 1))
fi

# Statistiques des ressources
echo -e "\n💻 Utilisation des ressources:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Espace disque
echo -e "\n💾 Espace disque:"
df -h | grep -E "Filesystem|/$|/var"

# Résumé
echo -e "\n📊 Résumé:"
if [ $ERRORS -eq 0 ]; then
    echo "✅ Tous les services fonctionnent correctement"
    exit 0
else
    echo "❌ $ERRORS erreur(s) détectée(s)"
    exit 1
fi
