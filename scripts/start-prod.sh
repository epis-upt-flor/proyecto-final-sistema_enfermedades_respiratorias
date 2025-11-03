#!/bin/bash

# RespiCare Production Start Script

set -e

echo "========================================="
echo "Starting RespiCare Production Environment"
echo "========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with production configuration."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
REQUIRED_VARS="MONGO_USERNAME MONGO_PASSWORD JWT_SECRET OPENAI_API_KEY"
for var in $REQUIRED_VARS; do
    if [ -z "${!var}" ]; then
        echo "ERROR: Required environment variable $var is not set"
        exit 1
    fi
done

# Create necessary directories
mkdir -p backups/mongodb
mkdir -p mongodb/init
mkdir -p nginx/ssl
mkdir -p certbot/conf
mkdir -p certbot/www

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Build services
echo "Building services..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Start services
echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Initialize database
echo "Initializing database..."
bash scripts/init-db.sh || echo "Database may already be initialized"

# Run health check
echo "Running health check..."
bash scripts/healthcheck.sh

# Create first backup
echo "Creating initial backup..."
docker exec respicare-backup-prod /backup.sh

echo ""
echo "========================================="
echo "Production environment is ready!"
echo "========================================="
echo ""
echo "Services:"
echo "  - Application: https://your-domain.com"
echo "  - Backend API: https://your-domain.com/api"
echo ""
echo "Management:"
echo "  - View logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.prod.yml down"
echo "  - Backup database: docker exec respicare-backup-prod /backup.sh"
echo ""
echo "========================================="

