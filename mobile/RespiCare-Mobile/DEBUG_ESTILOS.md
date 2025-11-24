# 🔍 DEBUG: Verificar Estilos Aplicados

## ✅ Cambios Forzados Aplicados:

1. **Fondo forzado**: `#0f172a` en TODAS las pantallas
2. **Modo oscuro forzado**: `isDark = true` en todas las pantallas
3. **Colores hardcodeados**: Todos los colores están directamente en los estilos

## 🧪 Para Verificar en el Navegador:

### 1. Abre DevTools (F12)
### 2. Ve a la pestaña "Console"
### 3. Ejecuta estos comandos:

```javascript
// Verificar fondo del body
console.log('Fondo body:', window.getComputedStyle(document.body).backgroundColor);

// Cambiar fondo manualmente para ver si funciona
document.body.style.backgroundColor = '#0f172a';

// Buscar elementos con colores viejos
const elementos = document.querySelectorAll('*');
elementos.forEach(el => {
  const bg = window.getComputedStyle(el).backgroundColor;
  if (bg.includes('rgb(14, 22, 33)') || bg.includes('#0e1621')) {
    console.log('Elemento con color viejo encontrado:', el, bg);
  }
});
```

### 4. Ve a la pestaña "Elements" o "Inspector"
- Busca el elemento `<body>` o el contenedor principal
- Verifica que el `background-color` sea `#0f172a` o `rgb(15, 23, 42)`

## 🎯 Si NO ves `#0f172a`:

1. **React Native Web puede estar usando estilos diferentes**
2. **Puede haber un CSS global sobrescribiendo**
3. **El servidor puede no estar recargando los cambios**

## 🔧 Solución Temporal:

Si nada funciona, agrega esto al inicio de `app/_layout.tsx`:

```typescript
useEffect(() => {
  if (Platform.OS === 'web') {
    // Forzar estilos en web
    const style = document.createElement('style');
    style.textContent = `
      body { background-color: #0f172a !important; }
      * { box-sizing: border-box; }
    `;
    document.head.appendChild(style);
  }
}, []);
```

