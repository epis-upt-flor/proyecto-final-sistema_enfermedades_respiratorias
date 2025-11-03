#!/bin/bash

# RespiCare Stop Script

set -e

ENV=${1:-dev}

if [ "$ENV" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    echo "Stopping production environment..."
else
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "Stopping development environment..."
fi

# Stop services
docker-compose -f $COMPOSE_FILE down

echo "Services stopped successfully!"

