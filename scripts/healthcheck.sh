#!/bin/bash

# RespiCare Health Check Script
# This script checks the health of all services

set -e

echo "========================================="
echo "RespiCare Health Check"
echo "========================================="
echo "Date: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local service_url=$2
    
    echo -n "Checking $service_name... "
    
    if curl -f -s -o /dev/null -w "%{http_code}" "$service_url" | grep -q "200"; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        return 1
    fi
}

# Function to check MongoDB
check_mongodb() {
    echo -n "Checking MongoDB... "
    
    if docker exec respicare-mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        return 1
    fi
}

# Function to check Redis
check_redis() {
    echo -n "Checking Redis... "
    
    if docker exec respicare-redis redis-cli ping | grep -q "PONG"; then
        echo -e "${GREEN}OK${NC}"
        return 0
    else
        echo -e "${RED}FAILED${NC}"
        return 1
    fi
}

# Check all services
FAILED=0

check_mongodb || FAILED=$((FAILED + 1))
check_redis || FAILED=$((FAILED + 1))
check_service "Backend API" "http://localhost:3001/api/health" || FAILED=$((FAILED + 1))
check_service "AI Services" "http://localhost:8000/api/v1/health" || FAILED=$((FAILED + 1))
check_service "Nginx" "http://localhost/health" || FAILED=$((FAILED + 1))

echo ""
echo "========================================="

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All services are healthy!${NC}"
    exit 0
else
    echo -e "${RED}$FAILED service(s) failed health check${NC}"
    exit 1
fi

