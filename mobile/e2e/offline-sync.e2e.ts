/**
 * Tests E2E para Sincronización Offline
 * Usando Detox para pruebas end-to-end en dispositivos reales/emuladores
 * 
 * Para ejecutar estos tests:
 * 1. Instalar Detox: npm install -g detox-cli
 * 2. Configurar emulador/dispositivo
 * 3. Ejecutar: detox test e2e/offline-sync.e2e.ts
 */

describe('Offline Sync E2E', () => {
  beforeAll(async () => {
    // Configurar dispositivo antes de los tests
    await device.launchApp();
  });

  beforeEach(async () => {
    // Limpiar estado antes de cada test
    await device.reloadReactNative();
  });

  describe('Sincronización de Datos', () => {
    it('debe guardar datos localmente cuando está offline', async () => {
      // Simular modo offline
      await device.setNetworkCondition('OFFLINE');

      // Navegar a pantalla de captura de datos
      await element(by.id('data-capture-button')).tap();

      // Llenar formulario de historia médica
      await element(by.id('patient-name-input')).typeText('Test Patient');
      await element(by.id('diagnosis-input')).typeText('Bronquitis');
      
      // Guardar
      await element(by.id('save-button')).tap();

      // Verificar que se guardó localmente (mensaje de confirmación offline)
      await expect(element(by.text('Guardado localmente'))).toBeVisible();

      // Verificar que aparece en lista offline
      await element(by.id('offline-data-tab')).tap();
      await expect(element(by.text('Test Patient'))).toBeVisible();
    });

    it('debe sincronizar automáticamente cuando vuelve la conexión', async () => {
      // Asegurar que hay datos pendientes
      await device.setNetworkCondition('OFFLINE');
      
      // Crear datos offline (similar al test anterior)
      await element(by.id('data-capture-button')).tap();
      await element(by.id('patient-name-input')).typeText('Sync Test Patient');
      await element(by.id('save-button')).tap();

      // Simular vuelta de conexión
      await device.setNetworkCondition('ONLINE');

      // Verificar que inicia sincronización automática
      await waitFor(element(by.text('Sincronizando...'))).toBeVisible().withTimeout(5000);

      // Verificar que se completa la sincronización
      await waitFor(element(by.text('Sincronización completada'))).toBeVisible().withTimeout(10000);

      // Verificar que los datos aparecen en la lista principal
      await element(by.id('medical-histories-tab')).tap();
      await expect(element(by.text('Sync Test Patient'))).toBeVisible();
    });

    it('debe mostrar estado de sincronización correctamente', async () => {
      await element(by.id('offline-data-tab')).tap();

      // Verificar que muestra estado de conexión
      const connectivityStatus = await element(by.id('connectivity-status'));
      await expect(connectivityStatus).toBeVisible();

      // Verificar que muestra número de items pendientes
      await device.setNetworkCondition('OFFLINE');
      // ... crear datos offline ...
      
      const pendingCount = await element(by.id('pending-sync-count'));
      await expect(pendingCount).toHaveText(/\d+/);
    });
  });

  describe('Análisis Offline', () => {
    it('debe analizar síntomas usando análisis local cuando está offline', async () => {
      await device.setNetworkCondition('OFFLINE');

      // Navegar a análisis de síntomas
      await element(by.id('ai-analysis-tab')).tap();

      // Seleccionar síntomas
      await element(by.text('Tos seca')).tap();
      await element(by.text('Fiebre')).tap();

      // Iniciar análisis
      await element(by.id('analyze-button')).tap();

      // Verificar que muestra análisis (debe ser local)
      await waitFor(element(by.text('Análisis de IA'))).toBeVisible().withTimeout(5000);
      
      // Verificar que muestra indicador de modo offline
      await expect(element(by.text('Modo Offline'))).toBeVisible();
    });

    it('debe guardar análisis localmente cuando está offline', async () => {
      await device.setNetworkCondition('OFFLINE');

      // Realizar análisis (similar al test anterior)
      await element(by.id('ai-analysis-tab')).tap();
      await element(by.text('Tos seca')).tap();
      await element(by.id('analyze-button')).tap();

      // Esperar a que termine el análisis
      await waitFor(element(by.text('Análisis completado'))).toBeVisible().withTimeout(5000);

      // Verificar que se guardó localmente
      await element(by.id('offline-data-tab')).tap();
      await element(by.id('symptom-analyses-section')).tap();
      await expect(element(by.id('saved-analysis-item'))).toBeVisible();
    });
  });

  describe('Manejo de Errores de Sincronización', () => {
    it('debe manejar errores de servidor durante sincronización', async () => {
      // Crear datos offline
      await device.setNetworkCondition('OFFLINE');
      // ... crear datos ...

      // Simular vuelta de conexión pero con servidor que falla
      await device.setNetworkCondition('ONLINE');
      
      // Simular error del servidor (requeriría mock del servidor)
      // Por ahora verificamos que el sistema maneja el error

      // Verificar que muestra mensaje de error
      await waitFor(element(by.text(/Error al sincronizar/i))).toBeVisible().withTimeout(5000);

      // Verificar que los datos siguen en cola
      await element(by.id('offline-data-tab')).tap();
      await expect(element(by.id('pending-item'))).toBeVisible();
    });

    it('debe reintentar sincronización después de error', async () => {
      // Configurar datos pendientes
      // ...

      // Simular conexión restablecida
      await device.setNetworkCondition('ONLINE');

      // Verificar que reintenta automáticamente
      await waitFor(element(by.text('Reintentando sincronización...'))).toBeVisible().withTimeout(5000);
    });
  });

  describe('Transición Online/Offline', () => {
    it('debe cambiar UI cuando cambia estado de conexión', async () => {
      // Estado online inicial
      await expect(element(by.id('online-indicator'))).toBeVisible();

      // Cambiar a offline
      await device.setNetworkCondition('OFFLINE');
      await waitFor(element(by.id('offline-indicator'))).toBeVisible().withTimeout(2000);

      // Volver a online
      await device.setNetworkCondition('ONLINE');
      await waitFor(element(by.id('online-indicator'))).toBeVisible().withTimeout(2000);
    });

    it('debe sincronizar datos acumulados al volver online', async () => {
      // Crear múltiples items offline
      await device.setNetworkCondition('OFFLINE');
      
      for (let i = 1; i <= 3; i++) {
        await element(by.id('data-capture-button')).tap();
        await element(by.id('patient-name-input')).typeText(`Patient ${i}`);
        await element(by.id('save-button')).tap();
        await element(by.id('back-button')).tap();
      }

      // Verificar que hay 3 items pendientes
      await element(by.id('offline-data-tab')).tap();
      await expect(element(by.id('pending-sync-count'))).toHaveText('3');

      // Volver online
      await device.setNetworkCondition('ONLINE');

      // Verificar que sincroniza todos los items
      await waitFor(element(by.text('3 items sincronizados'))).toBeVisible().withTimeout(15000);
    });
  });
});

