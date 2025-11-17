#!/usr/bin/env node
/**
 * Script para generar reportes de cobertura por módulo
 * Uso: node scripts/generate-coverage-report.js
 */

const fs = require('fs');
const path = require('path');

// Colores para output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
};

// Función para obtener cobertura de un archivo
function getCoverage(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const ext = path.extname(filePath);
    
    if (ext === '.json') {
      // Archivo JSON de cobertura (Jest)
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const total = data.total;
      
      if (!total) return null;
      
      const covered = 
        (total.lines?.covered || 0) +
        (total.statements?.covered || 0) +
        (total.functions?.covered || 0) +
        (total.branches?.covered || 0);
      
      const all = 
        (total.lines?.total || 0) +
        (total.statements?.total || 0) +
        (total.functions?.total || 0) +
        (total.branches?.total || 0);
      
      return all > 0 ? (covered / all * 100).toFixed(1) : null;
    } else if (ext === '.xml') {
      // Archivo XML de cobertura (Python/pytest)
      const content = fs.readFileSync(filePath, 'utf8');
      const match = content.match(/line-rate="([0-9.]+)"/);
      if (match) {
        return (parseFloat(match[1]) * 100).toFixed(1);
      }
    }
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error.message);
  }
  
  return null;
}

// Función para imprimir resultado con color
function printResult(module, coverage, target, found) {
  if (!found) {
    console.log(`${colors.yellow}⚠ Archivo de cobertura no encontrado${colors.reset}`);
    return;
  }
  
  const cov = parseFloat(coverage);
  const tgt = parseFloat(target);
  
  if (cov >= tgt) {
    console.log(`${colors.green}✓ Cobertura: ${coverage}% (Objetivo: ${target}%)${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Cobertura: ${coverage}% (Objetivo: ${target}%)${colors.reset}`);
  }
}

// Generar reporte
console.log('📊 Generando Reporte de Cobertura por Módulo');
console.log('==============================================\n');

// Backend
console.log('🔵 Backend API');
console.log('-------------');
const backendCov = getCoverage('backend/coverage/coverage-final.json');
printResult('Backend', backendCov, '80', backendCov !== null);
console.log('');

// Web Frontend
console.log('🟢 Web Frontend');
console.log('--------------');
const webCov = getCoverage('web/coverage/coverage-final.json');
printResult('Web', webCov, '70', webCov !== null);
console.log('');

// Mobile
console.log('📱 Mobile App');
console.log('-------------');
const mobileCov = getCoverage('mobile/coverage/coverage-final.json');
printResult('Mobile', mobileCov, '70', mobileCov !== null);
console.log('');

// AI Services
console.log('🤖 AI Services');
console.log('-------------');
const aiCov = getCoverage('ai-services/coverage.xml');
printResult('AI Services', aiCov, '70', aiCov !== null);
console.log('');

// Resumen
console.log('📈 Resumen General');
console.log('==================\n');

const coverages = [backendCov, webCov, mobileCov, aiCov].filter(c => c !== null);
const targets = [80, 70, 70, 70];

if (coverages.length > 0) {
  const total = coverages.reduce((sum, cov) => sum + parseFloat(cov), 0);
  const avg = (total / coverages.length).toFixed(1);
  
  console.log(`Cobertura Promedio: ${avg}%`);
  console.log('');
  
  if (parseFloat(avg) >= 75) {
    console.log(`${colors.green}✓ Cobertura global dentro del objetivo${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Cobertura global por debajo del objetivo${colors.reset}`);
  }
} else {
  console.log(`${colors.yellow}⚠ No se encontraron archivos de cobertura${colors.reset}`);
}

console.log('');
console.log('📄 Reportes HTML disponibles en:');
console.log('  - Backend: backend/coverage/index.html');
console.log('  - Web: web/coverage/index.html');
console.log('  - Mobile: mobile/coverage/index.html');
console.log('  - AI Services: ai-services/htmlcov/index.html');
console.log('');
console.log('✅ Reporte generado exitosamente');

