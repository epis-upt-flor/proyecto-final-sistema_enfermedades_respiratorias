#!/bin/bash

# RespiCare Testing Script
# Ejecuta todas las pruebas del sistema RespiCare

set -e  # Exit on any error

echo "🏥 RespiCare Testing Suite"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run AI Services tests
test_ai_services() {
    print_status "Testing AI Services (Python/FastAPI)..."
    
    if [ ! -d "ai-services" ]; then
        print_error "AI Services directory not found!"
        return 1
    fi
    
    cd ai-services
    
    # Check if Python is available
    if ! command_exists python3; then
        print_error "Python 3 is not installed!"
        cd ..
        return 1
    fi
    
    # Check if pytest is available
    if ! command_exists pytest; then
        print_warning "pytest not found, installing..."
        pip install pytest pytest-asyncio pytest-cov
    fi
    
    # Run tests with coverage
    if pytest tests/ --cov=. --cov-report=term-missing --cov-report=html -v; then
        print_success "AI Services tests passed!"
        cd ..
        return 0
    else
        print_error "AI Services tests failed!"
        cd ..
        return 1
    fi
}

# Function to run Backend API tests
test_backend_api() {
    print_status "Testing Backend API (Node.js/TypeScript)..."
    
    if [ ! -d "backend" ]; then
        print_error "Backend directory not found!"
        return 1
    fi
    
    cd backend
    
    # Check if Node.js is available
    if ! command_exists node; then
        print_error "Node.js is not installed!"
        cd ..
        return 1
    fi
    
    # Check if npm is available
    if ! command_exists npm; then
        print_error "npm is not installed!"
        cd ..
        return 1
    fi
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_warning "Installing dependencies..."
        npm install
    fi
    
    # Run tests with coverage
    if npm test -- --coverage; then
        print_success "Backend API tests passed!"
        cd ..
        return 0
    else
        print_error "Backend API tests failed!"
        cd ..
        return 1
    fi
}

# Function to run Web Frontend tests
test_web_frontend() {
    print_status "Testing Web Frontend (React/TypeScript)..."
    
    if [ ! -d "web" ]; then
        print_error "Web Frontend directory not found!"
        return 1
    fi
    
    cd web
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_warning "Installing dependencies..."
        npm install
    fi
    
    # Run tests with coverage
    if npm test -- --coverage --watchAll=false; then
        print_success "Web Frontend tests passed!"
        cd ..
        return 0
    else
        print_error "Web Frontend tests failed!"
        cd ..
        return 1
    fi
}

# Function to run Mobile App tests
test_mobile_app() {
    print_status "Testing Mobile App (React Native)..."
    
    if [ ! -d "mobile/RespiCare-Mobile" ]; then
        print_error "Mobile App directory not found!"
        return 1
    fi
    
    cd mobile/RespiCare-Mobile
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        print_warning "Installing dependencies..."
        npm install
    fi
    
    # Run tests with coverage
    if npm test -- --coverage --watchAll=false; then
        print_success "Mobile App tests passed!"
        cd ../..
        return 0
    else
        print_error "Mobile App tests failed!"
        cd ../..
        return 1
    fi
}

# Function to run integration tests
test_integration() {
    print_status "Running Integration Tests..."
    
    # Check if Docker is available for integration tests
    if ! command_exists docker; then
        print_warning "Docker not found, skipping integration tests"
        return 0
    fi
    
    # Start services with Docker Compose
    if docker-compose up -d; then
        print_status "Services started, waiting for them to be ready..."
        sleep 30
        
        # Test AI Services health
        if curl -f http://localhost:8000/api/v1/health >/dev/null 2>&1; then
            print_success "AI Services is healthy"
        else
            print_error "AI Services health check failed"
            docker-compose down
            return 1
        fi
        
        # Test Backend API health
        if curl -f http://localhost:3001/api/v1/health >/dev/null 2>&1; then
            print_success "Backend API is healthy"
        else
            print_error "Backend API health check failed"
            docker-compose down
            return 1
        fi
        
        # Run integration tests
        print_status "Running API integration tests..."
        
        # Test symptom analysis endpoint
        if curl -X POST http://localhost:8000/api/v1/symptom-analyzer/analyze \
           -H "Content-Type: application/json" \
           -d '{"patient_id":"test","symptoms":[{"symptom":"tos","severity":"moderate"}],"context":"test"}' \
           -f >/dev/null 2>&1; then
            print_success "Integration tests passed!"
        else
            print_error "Integration tests failed!"
            docker-compose down
            return 1
        fi
        
        # Stop services
        docker-compose down
        print_success "Integration tests completed successfully!"
        return 0
    else
        print_error "Failed to start services for integration tests"
        return 1
    fi
}

# Function to generate coverage report
generate_coverage_report() {
    print_status "Generating Coverage Report..."
    
    # Create coverage directory
    mkdir -p coverage-reports
    
    # Copy coverage reports from each module
    if [ -d "ai-services/htmlcov" ]; then
        cp -r ai-services/htmlcov coverage-reports/ai-services-coverage
        print_success "AI Services coverage report copied"
    fi
    
    if [ -d "backend/coverage" ]; then
        cp -r backend/coverage coverage-reports/backend-coverage
        print_success "Backend API coverage report copied"
    fi
    
    if [ -d "web/coverage" ]; then
        cp -r web/coverage coverage-reports/web-coverage
        print_success "Web Frontend coverage report copied"
    fi
    
    if [ -d "mobile/RespiCare-Mobile/coverage" ]; then
        cp -r mobile/RespiCare-Mobile/coverage coverage-reports/mobile-coverage
        print_success "Mobile App coverage report copied"
    fi
    
    # Generate summary
    cat > coverage-reports/summary.md << EOF
# RespiCare Coverage Report

Generated on: $(date)

## Module Coverage Summary

### AI Services (Python/FastAPI)
- Target: 85%
- Status: Check htmlcov/index.html

### Backend API (Node.js/TypeScript)
- Target: 80%
- Status: Check coverage/lcov-report/index.html

### Web Frontend (React/TypeScript)
- Target: 70%
- Status: Check coverage/lcov-report/index.html

### Mobile App (React Native)
- Target: 70%
- Status: Check coverage/lcov-report/index.html

## Running Tests

\`\`\`bash
# Run all tests
./scripts/test-all.sh

# Run specific module tests
./scripts/test-all.sh --ai-services
./scripts/test-all.sh --backend
./scripts/test-all.sh --web
./scripts/test-all.sh --mobile
\`\`\`
EOF
    
    print_success "Coverage report generated in coverage-reports/"
}

# Function to show help
show_help() {
    echo "RespiCare Testing Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --ai-services    Run only AI Services tests"
    echo "  --backend        Run only Backend API tests"
    echo "  --web            Run only Web Frontend tests"
    echo "  --mobile         Run only Mobile App tests"
    echo "  --integration    Run only integration tests"
    echo "  --coverage       Generate coverage report"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Run all tests"
    echo "  $0 --ai-services            # Run only AI Services tests"
    echo "  $0 --backend --web          # Run Backend and Web tests"
    echo "  $0 --coverage               # Generate coverage report"
}

# Main execution
main() {
    local ai_services=false
    local backend=false
    local web=false
    local mobile=false
    local integration=false
    local coverage=false
    local help=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --ai-services)
                ai_services=true
                shift
                ;;
            --backend)
                backend=true
                shift
                ;;
            --web)
                web=true
                shift
                ;;
            --mobile)
                mobile=true
                shift
                ;;
            --integration)
                integration=true
                shift
                ;;
            --coverage)
                coverage=true
                shift
                ;;
            --help)
                help=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Show help if requested
    if [ "$help" = true ]; then
        show_help
        exit 0
    fi
    
    # If no specific tests are requested, run all
    if [ "$ai_services" = false ] && [ "$backend" = false ] && [ "$web" = false ] && [ "$mobile" = false ] && [ "$integration" = false ] && [ "$coverage" = false ]; then
        ai_services=true
        backend=true
        web=true
        mobile=true
        integration=true
        coverage=true
    fi
    
    # Track overall success
    local overall_success=true
    
    # Run requested tests
    if [ "$ai_services" = true ]; then
        if ! test_ai_services; then
            overall_success=false
        fi
    fi
    
    if [ "$backend" = true ]; then
        if ! test_backend_api; then
            overall_success=false
        fi
    fi
    
    if [ "$web" = true ]; then
        if ! test_web_frontend; then
            overall_success=false
        fi
    fi
    
    if [ "$mobile" = true ]; then
        if ! test_mobile_app; then
            overall_success=false
        fi
    fi
    
    if [ "$integration" = true ]; then
        if ! test_integration; then
            overall_success=false
        fi
    fi
    
    if [ "$coverage" = true ]; then
        generate_coverage_report
    fi
    
    # Final result
    echo ""
    echo "=========================="
    if [ "$overall_success" = true ]; then
        print_success "All tests completed successfully! 🎉"
        exit 0
    else
        print_error "Some tests failed! ❌"
        exit 1
    fi
}

# Run main function with all arguments
main "$@"
