#!/bin/bash

# SPOFE - Script de backup automatique
# Usage: ./backup.sh

set -e

BACKUP_DIR="/var/backups/spofe"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔒 SPOFE Backup - $TIMESTAMP"
echo "==============================="

# Créer le répertoire de backup
mkdir -p "$BACKUP_DIR"

# Backup de la base de données MySQL
echo "📦 Backup de la base de données..."
docker-compose exec -T mysql mysqldump \
    -u root \
    -p${MYSQL_ROOT_PASSWORD} \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    ${MYSQL_DATABASE} | gzip > "$BACKUP_DIR/mysql_${TIMESTAMP}.sql.gz"

echo "✅ Base de données sauvegardée: mysql_${TIMESTAMP}.sql.gz"

# Backup de Redis
echo "📦 Backup de Redis..."
docker-compose exec -T redis redis-cli --rdb /data/dump.rdb SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb "$BACKUP_DIR/redis_${TIMESTAMP}.rdb"

echo "✅ Redis sauvegardé: redis_${TIMESTAMP}.rdb"

# Backup des logs
echo "📦 Backup des logs..."
tar -czf "$BACKUP_DIR/logs_${TIMESTAMP}.tar.gz" -C ./cascade logs/

echo "✅ Logs sauvegardés: logs_${TIMESTAMP}.tar.gz"

# Backup des volumes Docker (optionnel)
echo "📦 Backup des volumes Docker..."
docker run --rm \
    -v spofe_mysql_data:/data \
    -v "$BACKUP_DIR":/backup \
    alpine tar czf /backup/volume_mysql_${TIMESTAMP}.tar.gz -C /data .

echo "✅ Volumes sauvegardés"

# Nettoyage des anciens backups
echo "🧹 Nettoyage des backups de plus de $RETENTION_DAYS jours..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.rdb" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Vérifier l'espace disque
DISK_USAGE=$(df -h "$BACKUP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
echo "💾 Utilisation disque backup: ${DISK_USAGE}%"

if [ "$DISK_USAGE" -gt 80 ]; then
    echo "⚠️  ATTENTION: Espace disque faible (${DISK_USAGE}%)"
fi

# Calculer la taille totale des backups
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "📊 Taille totale des backups: $TOTAL_SIZE"

echo "✨ Backup terminé avec succès!"
