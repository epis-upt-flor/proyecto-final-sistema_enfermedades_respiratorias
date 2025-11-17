/* eslint-env detox/detox, jest */

/**
 * E2E Tests for Symptom Analysis Flow
 */

describe('Symptom Analysis Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Login first
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('login-button')).tap();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  describe('Text Input Analysis', () => {
    it('should navigate to symptom analysis screen', async () => {
      await element(by.id('analyze-symptoms-button')).tap();
      await expect(element(by.id('symptom-analysis-screen'))).toBeVisible();
    });

    it('should input symptoms via text', async () => {
      await element(by.id('analyze-symptoms-button')).tap();
      await element(by.id('symptom-text-input')).typeText('Tengo tos y fiebre');
      await element(by.id('analyze-button')).tap();

      // Wait for analysis results
      await waitFor(element(by.id('analysis-results')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should display analysis results', async () => {
      await element(by.id('analyze-symptoms-button')).tap();
      await element(by.id('symptom-text-input')).typeText('Tos persistente');
      await element(by.id('analyze-button')).tap();

      await waitFor(element(by.id('analysis-results')))
        .toBeVisible()
        .withTimeout(10000);

      await expect(element(by.id('diagnosis-card'))).toBeVisible();
      await expect(element(by.id('risk-level'))).toBeVisible();
      await expect(element(by.id('recommendations'))).toBeVisible();
    });
  });

  describe('Voice Input Analysis', () => {
    it('should record voice input', async () => {
      await element(by.id('analyze-symptoms-button')).tap();
      await element(by.id('voice-input-button')).tap();

      // Wait for recording to start
      await waitFor(element(by.id('recording-indicator')))
        .toBeVisible()
        .withTimeout(2000);

      // Stop recording
      await element(by.id('stop-recording-button')).tap();

      // Wait for transcription
      await waitFor(element(by.id('transcribed-text')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should analyze voice input', async () => {
      await element(by.id('analyze-symptoms-button')).tap();
      await element(by.id('voice-input-button')).tap();
      await element(by.id('stop-recording-button')).tap();

      await waitFor(element(by.id('transcribed-text')))
        .toBeVisible()
        .withTimeout(5000);

      await element(by.id('analyze-button')).tap();

      await waitFor(element(by.id('analysis-results')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Symptom Selection', () => {
    it('should select symptoms from list', async () => {
      await element(by.id('analyze-symptoms-button')).tap();
      await element(by.id('select-symptoms-button')).tap();

      // Select symptoms
      await element(by.text('Tos')).tap();
      await element(by.text('Fiebre')).tap();
      await element(by.text('Dificultad respiratoria')).tap();

      await element(by.id('confirm-selection-button')).tap();
      await element(by.id('analyze-button')).tap();

      await waitFor(element(by.id('analysis-results')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });

  describe('Analysis History', () => {
    it('should view analysis history', async () => {
      await element(by.id('analysis-history-button')).tap();
      await expect(element(by.id('analysis-history-screen'))).toBeVisible();
    });

    it('should view previous analysis details', async () => {
      await element(by.id('analysis-history-button')).tap();
      await element(by.id('analysis-item-0')).tap();

      await expect(element(by.id('analysis-detail-screen'))).toBeVisible();
      await expect(element(by.id('diagnosis-card'))).toBeVisible();
    });
  });
});

