#!/bin/bash

# RespiCare MongoDB Backup Script
# This script creates automated backups of the MongoDB database

set -e

# Configuration
BACKUP_DIR="/backups"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USERNAME="${MONGO_USERNAME:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD}"
MONGO_DB="${MONGO_DB:-respicare}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${MONGO_DB}_${TIMESTAMP}"
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"

echo "========================================="
echo "Starting MongoDB Backup"
echo "========================================="
echo "Date: $(date)"
echo "Database: $MONGO_DB"
echo "Backup location: $BACKUP_PATH"
echo "========================================="

# Create backup using mongodump
mongodump \
    --host="$MONGO_HOST" \
    --port="$MONGO_PORT" \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    --db="$MONGO_DB" \
    --out="$BACKUP_PATH"

# Compress backup
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
rm -rf "$BACKUP_NAME"

echo "Backup completed: ${BACKUP_NAME}.tar.gz"

# Calculate backup size
BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
echo "Backup size: $BACKUP_SIZE"

# Remove old backups
echo "========================================="
echo "Cleaning old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_DIR" -name "backup_*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
echo "Cleanup completed"

# List current backups
echo "========================================="
echo "Current backups:"
ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backups found"

echo "========================================="
echo "Backup process finished successfully"
echo "========================================="

