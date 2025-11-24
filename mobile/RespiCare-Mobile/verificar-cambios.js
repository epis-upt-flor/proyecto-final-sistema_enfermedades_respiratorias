// Script para verificar que los cambios estén aplicados
const fs = require('fs');
const path = require('path');

const colorsViejos = ['#0e1621', '#17212b', '#3390ec', '#b1bbc4', '#1e2732', '#708499', '#182229'];
const colorNuevo = '#14b8a6';
const fondoNuevo = '#0f172a';
const cardNuevo = '#1e293b';

function buscarColoresViejos(dir) {
  const archivos = fs.readdirSync(dir);
  let encontrados = [];
  
  archivos.forEach(archivo => {
    const rutaCompleta = path.join(dir, archivo);
    const stat = fs.statSync(rutaCompleta);
    
    if (stat.isDirectory() && !archivo.includes('node_modules') && !archivo.includes('.expo')) {
      encontrados = encontrados.concat(buscarColoresViejos(rutaCompleta));
    } else if (archivo.endsWith('.tsx') || archivo.endsWith('.ts')) {
      const contenido = fs.readFileSync(rutaCompleta, 'utf8');
      colorsViejos.forEach(color => {
        if (contenido.includes(color)) {
          encontrados.push({ archivo: rutaCompleta, color });
        }
      });
    }
  });
  
  return encontrados;
}

const appDir = path.join(__dirname, 'app');
const componentesDir = path.join(__dirname, 'components');

console.log('🔍 Buscando colores antiguos...\n');

const encontrados = [
  ...buscarColoresViejos(appDir),
  ...buscarColoresViejos(componentesDir)
];

if (encontrados.length > 0) {
  console.log('❌ Se encontraron colores antiguos:');
  encontrados.forEach(({ archivo, color }) => {
    console.log(`   ${archivo}: ${color}`);
  });
  process.exit(1);
} else {
  console.log('✅ No se encontraron colores antiguos. Todos los cambios están aplicados!');
  console.log(`\n🎨 Colores nuevos aplicados:`);
  console.log(`   Primario: ${colorNuevo}`);
  console.log(`   Fondo: ${fondoNuevo}`);
  console.log(`   Cards: ${cardNuevo}`);
}

