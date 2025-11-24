# 🔥 FORZAR CAMBIOS DE DISEÑO

Si no ves los cambios después de limpiar caché, sigue estos pasos:

## 1. DETENER TODO
```bash
# Presiona Ctrl+C en todas las terminales que tengan el servidor corriendo
```

## 2. ELIMINAR CACHÉS COMPLETAMENTE
```bash
cd mobile/RespiCare-Mobile

# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install

# Limpiar caché de Metro
rm -rf .expo
rm -rf node_modules/.cache

# En Windows PowerShell:
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .expo
npm install
```

## 3. REINICIAR CON CACHÉ LIMPIO
```bash
npm run web:clear
```

## 4. EN EL NAVEGADOR
1. Abre DevTools (F12)
2. Clic derecho en el botón de recargar
3. Selecciona "Vaciar caché y volver a cargar de manera forzada"

## 5. SI AÚN NO FUNCIONA
Abre en modo incógnito:
- Chrome/Edge: Ctrl+Shift+N
- Firefox: Ctrl+Shift+P

Luego ve a: http://localhost:8083

## CAMBIOS APLICADOS:
✅ Colores: #0e1621 → #0f172a (fondo)
✅ Colores: #17212b → #1e293b (cards)
✅ Colores: #3390ec → #14b8a6 (botones/acentos)
✅ Colores: #b1bbc4 → #94a3b8 (texto secundario)
✅ Border radius: 12px → 24px
✅ Todos los componentes actualizados

