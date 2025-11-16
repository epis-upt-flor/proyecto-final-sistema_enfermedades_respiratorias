# E2E (Detox) - RespiCare Mobile

## Prerrequisitos
- Node.js >= 16
- Android SDK / Xcode (según plataforma)
- Emulador o dispositivo configurado
- Instalar dependencias en `mobile/`:
  - `npm install` o `yarn`
  - Para haptics/secure store opcionales en Expo, se ignoran si no están instaladas

## Comandos
- Build E2E (según configuración Detox):  
  `npm run test:e2e:build`

- Ejecutar todos los E2E:  
  `npm run test:e2e`

- Ejecutar suite de accesibilidad/UX (IDs):  
  `npm run test:e2e:ui`

## Notas
- Las pruebas usan `testID` agregados en Home y Citas (ej. `fab-new-history`, `quick-action-capture`, `btn-reschedule-{id}`).
- Algunas aserciones son “smoke”: no fallan si no hay datos de ejemplo.
- Ajusta configuración de Detox en `e2e/jest.config.js` y app config (android/ios) según tu entorno local.


