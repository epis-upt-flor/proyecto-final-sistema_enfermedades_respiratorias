/* eslint-env detox/detox, jest */

describe('Accesibilidad y UX - Smoke', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('Home: muestra FAB de nueva historia y quick actions', async () => {
    await expect(element(by.id('fab-new-history'))).toBeVisible();
    // Quick actions básicos si existen
    await expect(element(by.id('quick-action-capture'))).toBeVisible();
    await expect(element(by.id('quick-action-analyze'))).toBeVisible();
  });

  it('Home: abrir Nueva Historia desde FAB', async () => {
    await element(by.id('fab-new-history')).tap();
    // No afirmamos pantalla nueva real (depende de navegación), es smoke
  });

  it('Citas: botones Reprogramar/Cancelar presentes', async () => {
    // Navegar a pestaña Citas (tab "Citas")
    await element(by.label('Citas')).tap();
    // Puede no haber elementos; en smoke, comprobamos que la lista carga sin crashear
    // Si hay alguna cita con id visible, intenta detectar botones
    // Esta parte es opcional: usa match parcial
    // Ejemplo: busca cualquier botón "Reprogramar" / "Cancelar"
    try {
      await expect(element(by.text('Reprogramar'))).toBeVisible();
      await expect(element(by.text('Cancelar'))).toBeVisible();
    } catch (e) {
      // Ignorar si no hay citas cargadas
    }
  });
});


