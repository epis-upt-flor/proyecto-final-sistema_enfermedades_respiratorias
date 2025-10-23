#!/bin/bash

# RespiCare MongoDB Restore Script
# This script restores a MongoDB backup

set -e

# Configuration
BACKUP_DIR="/backups"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USERNAME="${MONGO_USERNAME:-admin}"
MONGO_PASSWORD="${MONGO_PASSWORD}"
MONGO_DB="${MONGO_DB:-respicare}"

# Check if backup file is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

echo "========================================="
echo "Starting MongoDB Restore"
echo "========================================="
echo "Date: $(date)"
echo "Database: $MONGO_DB"
echo "Backup file: $BACKUP_FILE"
echo "========================================="

# Extract backup
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_DIR/$BACKUP_FILE" -C "$TEMP_DIR"

# Find the backup directory
BACKUP_PATH=$(find "$TEMP_DIR" -type d -name "backup_*" | head -n 1)

if [ -z "$BACKUP_PATH" ]; then
    echo "Error: Could not find backup directory in archive"
    rm -rf "$TEMP_DIR"
    exit 1
fi

# Ask for confirmation
echo "WARNING: This will overwrite the current database!"
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled"
    rm -rf "$TEMP_DIR"
    exit 0
fi

# Restore using mongorestore
mongorestore \
    --host="$MONGO_HOST" \
    --port="$MONGO_PORT" \
    --username="$MONGO_USERNAME" \
    --password="$MONGO_PASSWORD" \
    --authenticationDatabase=admin \
    --db="$MONGO_DB" \
    --drop \
    "$BACKUP_PATH/$MONGO_DB"

# Cleanup
rm -rf "$TEMP_DIR"

echo "========================================="
echo "Restore completed successfully"
echo "========================================="

