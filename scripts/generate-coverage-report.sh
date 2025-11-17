#!/bin/bash
# Script para generar reportes de cobertura por módulo
# Uso: ./scripts/generate-coverage-report.sh

set -e

echo "📊 Generando Reporte de Cobertura por Módulo"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para obtener cobertura de un archivo
get_coverage() {
    local file=$1
    if [ -f "$file" ]; then
        if [[ "$file" == *.xml ]]; then
            # Para archivos XML de cobertura (Python)
            grep -oP 'line-rate="\K[0-9.]+' "$file" | head -1 | awk '{printf "%.1f", $1 * 100}'
        elif [[ "$file" == *.json ]]; then
            # Para archivos JSON de cobertura (Jest)
            node -e "const data = require('./$file'); const total = data.total; const covered = total.lines.covered + total.statements.covered + total.functions.covered + total.branches.covered; const all = total.lines.total + total.statements.total + total.functions.total + total.branches.total; console.log((covered / all * 100).toFixed(1));" 2>/dev/null || echo "0.0"
        elif [[ "$file" == *.info ]]; then
            # Para archivos LCOV
            lcov --summary "$file" 2>&1 | grep -oP 'lines\.*:\s*\K[0-9.]+' | head -1 || echo "0.0"
        else
            echo "0.0"
        fi
    else
        echo "0.0"
    fi
}

# Reporte de Backend
echo "🔵 Backend API"
echo "-------------"
BACKEND_COV_FILE="backend/coverage/coverage-final.json"
if [ -f "$BACKEND_COV_FILE" ]; then
    BACKEND_COV=$(get_coverage "$BACKEND_COV_FILE")
    if (( $(echo "$BACKEND_COV >= 80" | bc -l) )); then
        echo -e "${GREEN}✓ Cobertura: ${BACKEND_COV}% (Objetivo: 80%)${NC}"
    else
        echo -e "${RED}✗ Cobertura: ${BACKEND_COV}% (Objetivo: 80%)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Archivo de cobertura no encontrado${NC}"
fi
echo ""

# Reporte de Web Frontend
echo "🟢 Web Frontend"
echo "--------------"
WEB_COV_FILE="web/coverage/coverage-final.json"
if [ -f "$WEB_COV_FILE" ]; then
    WEB_COV=$(get_coverage "$WEB_COV_FILE")
    if (( $(echo "$WEB_COV >= 70" | bc -l) )); then
        echo -e "${GREEN}✓ Cobertura: ${WEB_COV}% (Objetivo: 70%)${NC}"
    else
        echo -e "${RED}✗ Cobertura: ${WEB_COV}% (Objetivo: 70%)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Archivo de cobertura no encontrado${NC}"
fi
echo ""

# Reporte de Mobile
echo "📱 Mobile App"
echo "-------------"
MOBILE_COV_FILE="mobile/coverage/coverage-final.json"
if [ -f "$MOBILE_COV_FILE" ]; then
    MOBILE_COV=$(get_coverage "$MOBILE_COV_FILE")
    if (( $(echo "$MOBILE_COV >= 70" | bc -l) )); then
        echo -e "${GREEN}✓ Cobertura: ${MOBILE_COV}% (Objetivo: 70%)${NC}"
    else
        echo -e "${RED}✗ Cobertura: ${MOBILE_COV}% (Objetivo: 70%)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Archivo de cobertura no encontrado${NC}"
fi
echo ""

# Reporte de AI Services
echo "🤖 AI Services"
echo "-------------"
AI_COV_FILE="ai-services/coverage.xml"
if [ -f "$AI_COV_FILE" ]; then
    AI_COV=$(get_coverage "$AI_COV_FILE")
    if (( $(echo "$AI_COV >= 70" | bc -l) )); then
        echo -e "${GREEN}✓ Cobertura: ${AI_COV}% (Objetivo: 70%)${NC}"
    else
        echo -e "${RED}✗ Cobertura: ${AI_COV}% (Objetivo: 70%)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Archivo de cobertura no encontrado${NC}"
fi
echo ""

# Resumen
echo "📈 Resumen General"
echo "=================="
echo ""

# Calcular promedio (simplificado)
TOTAL=0
COUNT=0

if [ -f "$BACKEND_COV_FILE" ]; then
    BACKEND_COV=$(get_coverage "$BACKEND_COV_FILE")
    TOTAL=$(echo "$TOTAL + $BACKEND_COV" | bc)
    COUNT=$((COUNT + 1))
fi

if [ -f "$WEB_COV_FILE" ]; then
    WEB_COV=$(get_coverage "$WEB_COV_FILE")
    TOTAL=$(echo "$TOTAL + $WEB_COV" | bc)
    COUNT=$((COUNT + 1))
fi

if [ -f "$MOBILE_COV_FILE" ]; then
    MOBILE_COV=$(get_coverage "$MOBILE_COV_FILE")
    TOTAL=$(echo "$TOTAL + $MOBILE_COV" | bc)
    COUNT=$((COUNT + 1))
fi

if [ -f "$AI_COV_FILE" ]; then
    AI_COV=$(get_coverage "$AI_COV_FILE")
    TOTAL=$(echo "$TOTAL + $AI_COV" | bc)
    COUNT=$((COUNT + 1))
fi

if [ $COUNT -gt 0 ]; then
    AVG=$(echo "scale=1; $TOTAL / $COUNT" | bc)
    echo -e "Cobertura Promedio: ${AVG}%"
    echo ""
    
    if (( $(echo "$AVG >= 75" | bc -l) )); then
        echo -e "${GREEN}✓ Cobertura global dentro del objetivo${NC}"
    else
        echo -e "${RED}✗ Cobertura global por debajo del objetivo${NC}"
    fi
else
    echo -e "${YELLOW}⚠ No se encontraron archivos de cobertura${NC}"
fi

echo ""
echo "📄 Reportes HTML disponibles en:"
echo "  - Backend: backend/coverage/index.html"
echo "  - Web: web/coverage/index.html"
echo "  - Mobile: mobile/coverage/index.html"
echo "  - AI Services: ai-services/htmlcov/index.html"
echo ""
echo "✅ Reporte generado exitosamente"

