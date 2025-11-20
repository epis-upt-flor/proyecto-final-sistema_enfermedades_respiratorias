# 🎤 Guía: Funcionalidades de Audio en el Chatbot

## 📋 Funcionalidades Disponibles

El chatbot móvil ahora soporta dos tipos de análisis de audio:

### 1. 🫁 Análisis de Tos
Analiza grabaciones de audio para detectar y clasificar tos, proporcionando:
- **Detección de tos**: Identifica si hay tos en el audio
- **Severidad**: Clasifica como leve, moderada o severa
- **Características**: Describe el tipo de tos detectada
- **Recomendaciones médicas**: Sugerencias basadas en el análisis
- **Nivel de urgencia**: Indica si requiere atención médica

### 2. 🎤 Transcripción y Análisis
Convierte voz a texto para personas que no pueden escribir:
- **Transcripción de voz**: Convierte el audio a texto
- **Análisis automático**: Analiza el texto transcrito con el chatbot
- **Accesibilidad**: Facilita el uso para personas con dificultades para escribir

## 🚀 Cómo Usar

### Análisis de Tos

1. **Grabar audio**:
   - Presiona el botón 🎤 para iniciar la grabación
   - Tose o graba el audio que quieres analizar
   - Presiona ⏹ para detener la grabación

2. **Seleccionar opción**:
   - Aparecerá un modal con opciones
   - Selecciona "🫁 Analizar Tos"

3. **Ver resultados**:
   - El sistema analizará el audio
   - Mostrará el análisis con severidad, características y recomendaciones
   - El chatbot proporcionará información médica adicional

### Transcripción y Análisis

1. **Grabar mensaje**:
   - Presiona el botón 🎤 para iniciar la grabación
   - Habla tu consulta o mensaje
   - Presiona ⏹ para detener

2. **Seleccionar opción**:
   - Selecciona "🎤 Transcribir y Analizar"

3. **Resultado**:
   - El audio se transcribirá a texto
   - El texto se enviará automáticamente al chatbot
   - Recibirás la respuesta del asistente médico

## 🔧 Configuración Técnica

### Endpoints de AI Services

Los endpoints están configurados en `constants/config.ts`:

```typescript
AUDIO_ANALYSIS: {
  COUGH: `${AI_SERVICE_URL}/api/v1/audio/cough`,
  TRANSCRIBE: `${AI_SERVICE_URL}/api/v1/audio/transcribe`,
}
```

### Servicios

- **audioService.ts**: Maneja el análisis de audio y transcripción
- **chatbotService.ts**: Integra el análisis de audio con el chatbot

## 📝 Notas Importantes

### Análisis de Tos
- **Estado actual**: Implementación básica con análisis heurístico
- **Mejora futura**: Integrar modelo ML entrenado para detección de tos
- **Limitaciones**: El análisis actual es básico y debe mejorarse con un modelo real

### Transcripción de Voz
- **Estado actual**: Placeholder - requiere configuración de servicio
- **Opciones futuras**:
  - OpenAI Whisper API
  - Google Speech-to-Text
  - Azure Speech Services
  - Modelo Whisper local

## 🛠️ Implementación Futura

### Para Análisis de Tos Avanzado:
1. Entrenar modelo ML con datos de tos
2. Analizar características de frecuencia
3. Clasificar tipo de tos (seca, productiva, etc.)
4. Integrar con modelos de diagnóstico

### Para Transcripción:
1. Configurar servicio de speech-to-text
2. Agregar soporte multiidioma
3. Mejorar precisión de transcripción
4. Agregar corrección automática

## 🐛 Solución de Problemas

### El análisis de tos no funciona
- Verifica que el servicio de IA esté corriendo
- Revisa los logs del backend
- Asegúrate de que el audio se grabó correctamente

### La transcripción no funciona
- Actualmente es un placeholder
- Necesita configuración de servicio de speech-to-text
- Por ahora, escribe tu mensaje manualmente

## 📚 Referencias

- [Documentación de Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
- [API de Audio Analysis](./README_CHATBOT.md)

---

**¡Las funcionalidades de audio están listas para usar!** 🎉

