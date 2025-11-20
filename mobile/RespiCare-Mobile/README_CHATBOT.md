# 🤖 Chatbot Médico - RespiCare Mobile

## 📱 Funcionalidades

El chatbot médico en la aplicación móvil permite:

### ✅ Mensajes de Texto
- Envía consultas médicas en lenguaje natural
- Recibe respuestas inteligentes del servicio de IA
- Analiza síntomas y proporciona recomendaciones

### 📷 Análisis de Imágenes
- Selecciona imágenes de la galería
- Toma fotos con la cámara
- Analiza imágenes médicas usando visión por computador
- Integra el análisis de imagen con el contexto de la conversación

### 🎤 Grabación de Voz
- Graba mensajes de voz
- Convierte voz a texto (en desarrollo)
- Envía transcripciones al chatbot

## 🚀 Uso

### 1. Acceder al Chatbot
- Abre la aplicación móvil
- Navega a la pestaña "Chatbot" en la barra inferior

### 2. Enviar Mensaje de Texto
1. Escribe tu consulta en el campo de texto
2. Presiona "Enviar" o el botón de envío
3. Espera la respuesta del asistente médico

### 3. Enviar Imagen
1. Presiona el botón 📷 para seleccionar de la galería
2. O presiona 📸 para tomar una foto
3. La imagen se mostrará en la vista previa
4. Escribe un mensaje opcional describiendo la imagen
5. Presiona "Enviar"

### 4. Grabar Voz
1. Presiona el botón 🎤 para iniciar la grabación
2. Habla tu consulta
3. Presiona ⏹ para detener la grabación
4. El audio se procesará (en desarrollo)

## 🔗 Integración con AI Services

El chatbot se conecta con:
- **Endpoint de Chat**: `/api/v1/analyze` (ai-services)
- **Endpoint de Imágenes**: `/api/v1/ml/advanced/image` (ai-services)

### Configuración

Las URLs se configuran en `constants/config.ts`:
```typescript
CHATBOT: {
  ANALYZE: `${AI_SERVICE_URL}/api/v1/analyze`,
  TEST: `${AI_SERVICE_URL}/api/v1/test`,
},
IMAGE_ANALYSIS: {
  ANALYZE: `${AI_SERVICE_URL}/api/v1/ml/advanced/image`,
},
```

## 📋 Características

### Niveles de Urgencia
El chatbot detecta automáticamente el nivel de urgencia:
- 🚨 **CRITICAL** - Emergencia médica
- ⚠️ **HIGH** - Atención urgente (2 horas)
- ⚡ **MEDIUM** - Atención prioritaria (24 horas)
- ✅ **LOW** - Monitoreo regular

### Detección de Síntomas
- Cuenta automática de síntomas detectados
- Categorización de síntomas
- Recomendaciones personalizadas

### Historial de Conversación
- Mantiene contexto de la conversación (últimos 10 mensajes)
- Sesión persistente
- Historial guardado localmente

## 🛠️ Instalación de Dependencias

Si faltan dependencias, instala:

```bash
cd mobile/RespiCare-Mobile
npm install expo-image-picker expo-av expo-file-system
```

## ⚙️ Permisos Requeridos

La aplicación solicita automáticamente:
- **Cámara**: Para tomar fotos
- **Galería**: Para seleccionar imágenes
- **Micrófono**: Para grabación de voz

## 🔧 Desarrollo

### Estructura de Archivos
```
mobile/RespiCare-Mobile/
├── app/(tabs)/
│   └── chatbot.tsx          # Pantalla principal del chatbot
├── services/
│   └── chatbotService.ts    # Servicio de comunicación con AI
└── constants/
    └── config.ts            # Configuración de endpoints
```

### Servicio de Chatbot
El servicio `chatbotService.ts` maneja:
- Comunicación con el backend
- Gestión de sesiones
- Historial de conversación
- Análisis de imágenes

### Componente de Chat
El componente `chatbot.tsx` incluye:
- Interfaz de chat
- Manejo de imágenes
- Grabación de voz
- Visualización de urgencia

## 📝 Notas Importantes

1. **Transcripción de Voz**: La funcionalidad de voz a texto está en desarrollo. Por ahora, se puede grabar pero requiere integración con un servicio de speech-to-text.

2. **Análisis de Imágenes**: Las imágenes se convierten a base64 y se envían al servicio de IA para análisis.

3. **Conexión**: Asegúrate de que el servicio de IA esté corriendo y accesible desde tu dispositivo/emulador.

4. **Autenticación**: El chatbot funciona con o sin autenticación, pero se recomienda estar autenticado para mejor experiencia.

## 🐛 Solución de Problemas

### El chatbot no responde
- Verifica que `ai-services` esté corriendo
- Revisa la configuración de URLs en `.env`
- Verifica los logs del servicio

### Las imágenes no se envían
- Verifica permisos de cámara/galería
- Revisa que `expo-file-system` esté instalado
- Verifica el tamaño de la imagen (puede ser muy grande)

### La grabación de voz no funciona
- Verifica permisos de micrófono
- Asegúrate de que `expo-av` esté instalado
- La transcripción requiere servicio adicional

## 🎯 Próximas Mejoras

- [ ] Integración completa de speech-to-text
- [ ] Soporte para múltiples imágenes
- [ ] Visualización de análisis de imágenes en el chat
- [ ] Exportar conversaciones
- [ ] Compartir resultados con médicos

---

**¡El chatbot está listo para usar!** 🎉

