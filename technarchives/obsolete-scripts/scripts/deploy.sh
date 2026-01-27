#!/bin/bash

# SPOFE - Script de déploiement en production
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR/.."

echo "🚀 Déploiement SPOFE - Environnement: $ENVIRONMENT"
echo "================================================"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifications préalables
check_requirements() {
    echo -e "${YELLOW}📋 Vérification des prérequis...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker n'est pas installé${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
        exit 1
    fi
    
    if [ ! -f "$PROJECT_ROOT/.env.$ENVIRONMENT" ]; then
        echo -e "${RED}❌ Fichier .env.$ENVIRONMENT manquant${NC}"
        echo "Copier .env.production.example vers .env.$ENVIRONMENT et configurer"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Prérequis OK${NC}"
}

# Backup de la base de données
backup_database() {
    echo -e "${YELLOW}💾 Backup de la base de données...${NC}"
    
    BACKUP_DIR="$PROJECT_ROOT/backups"
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/spofe_$(date +%Y%m%d_%H%M%S).sql"
    
    if docker-compose ps mysql | grep -q "Up"; then
        docker-compose exec -T mysql mysqldump \
            -u root \
            -p${MYSQL_ROOT_PASSWORD} \
            ${MYSQL_DATABASE} > "$BACKUP_FILE"
        
        echo -e "${GREEN}✅ Backup créé: $BACKUP_FILE${NC}"
    else
        echo -e "${YELLOW}⚠️  Base de données non démarrée, pas de backup${NC}"
    fi
}

# Build des images Docker
build_images() {
    echo -e "${YELLOW}🔨 Build des images Docker...${NC}"
    
    cd "$PROJECT_ROOT"
    
    docker-compose --env-file ".env.$ENVIRONMENT" build --no-cache
    
    echo -e "${GREEN}✅ Images buildées${NC}"
}

# Démarrage des services
start_services() {
    echo -e "${YELLOW}🚀 Démarrage des services...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Copier le fichier d'environnement
    cp ".env.$ENVIRONMENT" .env
    
    # Démarrer les services
    docker-compose up -d
    
    echo -e "${GREEN}✅ Services démarrés${NC}"
}

# Health checks
health_check() {
    echo -e "${YELLOW}🏥 Vérification de la santé des services...${NC}"
    
    MAX_RETRIES=30
    RETRY_DELAY=2
    
    # Check MySQL
    echo "Vérification MySQL..."
    for i in $(seq 1 $MAX_RETRIES); do
        if docker-compose exec -T mysql mysqladmin ping -h localhost --silent; then
            echo -e "${GREEN}✅ MySQL OK${NC}"
            break
        fi
        
        if [ $i -eq $MAX_RETRIES ]; then
            echo -e "${RED}❌ MySQL timeout${NC}"
            exit 1
        fi
        
        sleep $RETRY_DELAY
    done
    
    # Check Redis
    echo "Vérification Redis..."
    for i in $(seq 1 $MAX_RETRIES); do
        if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
            echo -e "${GREEN}✅ Redis OK${NC}"
            break
        fi
        
        if [ $i -eq $MAX_RETRIES ]; then
            echo -e "${RED}❌ Redis timeout${NC}"
            exit 1
        fi
        
        sleep $RETRY_DELAY
    done
    
    # Check Backend
    echo "Vérification Backend..."
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f http://localhost:3001/health &> /dev/null; then
            echo -e "${GREEN}✅ Backend OK${NC}"
            break
        fi
        
        if [ $i -eq $MAX_RETRIES ]; then
            echo -e "${RED}❌ Backend timeout${NC}"
            docker-compose logs backend
            exit 1
        fi
        
        sleep $RETRY_DELAY
    done
    
    # Check Frontend
    echo "Vérification Frontend..."
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f http://localhost/health &> /dev/null; then
            echo -e "${GREEN}✅ Frontend OK${NC}"
            break
        fi
        
        if [ $i -eq $MAX_RETRIES ]; then
            echo -e "${RED}❌ Frontend timeout${NC}"
            exit 1
        fi
        
        sleep $RETRY_DELAY
    done
    
    echo -e "${GREEN}✅ Tous les services sont opérationnels${NC}"
}

# Afficher les logs
show_logs() {
    echo -e "${YELLOW}📋 Derniers logs:${NC}"
    docker-compose logs --tail=50
}

# Afficher le statut
show_status() {
    echo -e "${YELLOW}📊 Statut des services:${NC}"
    docker-compose ps
    
    echo -e "\n${YELLOW}🔗 URLs d'accès:${NC}"
    echo "  Frontend: http://localhost"
    echo "  Backend API: http://localhost:3001"
    echo "  Grafana: http://localhost:3000 (admin/admin)"
    echo "  Prometheus: http://localhost:9090"
}

# Menu principal
main() {
    check_requirements
    
    echo -e "\n${YELLOW}Que souhaitez-vous faire?${NC}"
    echo "1) Déploiement complet (backup + build + start)"
    echo "2) Build seulement"
    echo "3) Start seulement"
    echo "4) Health check"
    echo "5) Afficher les logs"
    echo "6) Afficher le statut"
    echo "7) Stop tous les services"
    echo "8) Restart tous les services"
    
    read -p "Choix [1-8]: " choice
    
    case $choice in
        1)
            backup_database
            build_images
            start_services
            health_check
            show_status
            ;;
        2)
            build_images
            ;;
        3)
            start_services
            health_check
            show_status
            ;;
        4)
            health_check
            ;;
        5)
            show_logs
            ;;
        6)
            show_status
            ;;
        7)
            echo -e "${YELLOW}🛑 Arrêt des services...${NC}"
            docker-compose down
            echo -e "${GREEN}✅ Services arrêtés${NC}"
            ;;
        8)
            echo -e "${YELLOW}🔄 Redémarrage des services...${NC}"
            docker-compose restart
            health_check
            echo -e "${GREEN}✅ Services redémarrés${NC}"
            ;;
        *)
            echo -e "${RED}Choix invalide${NC}"
            exit 1
            ;;
    esac
    
    echo -e "\n${GREEN}✨ Terminé!${NC}"
}

# Trap pour nettoyer en cas d'erreur
trap 'echo -e "${RED}❌ Erreur détectée${NC}"; docker-compose logs --tail=100' ERR

main
