#!/bin/bash

# SPOFE - Script de restauration
# Usage: ./restore.sh [backup_file]

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Usage: ./restore.sh <backup_file.sql.gz>"
    echo ""
    echo "Backups disponibles:"
    ls -lh /var/backups/spofe/*.sql.gz 2>/dev/null || echo "Aucun backup trouvé"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Fichier de backup introuvable: $BACKUP_FILE"
    exit 1
fi

echo "⚠️  ATTENTION: Cette opération va écraser la base de données actuelle!"
read -p "Êtes-vous sûr de vouloir continuer? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Opération annulée"
    exit 0
fi

echo "🔄 Restauration en cours..."

# Arrêter le backend pour éviter les connexions
echo "🛑 Arrêt du backend..."
docker-compose stop backend

# Restaurer la base de données
echo "📥 Restauration de la base de données..."
gunzip < "$BACKUP_FILE" | docker-compose exec -T mysql mysql \
    -u root \
    -p${MYSQL_ROOT_PASSWORD} \
    ${MYSQL_DATABASE}

echo "✅ Base de données restaurée"

# Redémarrer le backend
echo "🚀 Redémarrage du backend..."
docker-compose start backend

# Attendre que le backend soit prêt
echo "⏳ Attente du backend..."
sleep 10

# Health check
if curl -f http://localhost:3001/health &> /dev/null; then
    echo "✅ Backend opérationnel"
else
    echo "❌ Le backend ne répond pas"
    exit 1
fi

echo "✨ Restauration terminée avec succès!"
