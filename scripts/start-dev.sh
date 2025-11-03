#!/bin/bash

# RespiCare Development Start Script

set -e

echo "========================================="
echo "Starting RespiCare Development Environment"
echo "========================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from example..."
    cp env.example .env
    echo "Please edit .env file with your configuration before continuing."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Create necessary directories
mkdir -p backups/mongodb
mkdir -p mongodb/init
mkdir -p nginx/ssl
mkdir -p certbot/conf
mkdir -p certbot/www

# Pull latest images
echo "Pulling latest Docker images..."
docker-compose -f docker-compose.dev.yml pull

# Build services
echo "Building services..."
docker-compose -f docker-compose.dev.yml build

# Start services
echo "Starting services..."
docker-compose -f docker-compose.dev.yml up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Run health check
echo "Running health check..."
bash scripts/healthcheck.sh || true

echo ""
echo "========================================="
echo "Development environment is ready!"
echo "========================================="
echo ""
echo "Services:"
echo "  - Backend API: http://localhost:3001"
echo "  - AI Services: http://localhost:8000"
echo "  - MongoDB Express: http://localhost:8081"
echo "  - Redis Commander: http://localhost:8082"
echo ""
echo "Commands:"
echo "  - View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "  - Stop services: docker-compose -f docker-compose.dev.yml down"
echo "  - Restart service: docker-compose -f docker-compose.dev.yml restart <service>"
echo ""
echo "========================================="

