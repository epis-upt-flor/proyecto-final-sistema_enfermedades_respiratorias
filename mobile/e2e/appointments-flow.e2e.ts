/* eslint-env detox/detox, jest */

/**
 * E2E Tests for Appointments Flow
 */

describe('Appointments Flow E2E', () => {
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

  describe('View Appointments', () => {
    it('should navigate to appointments screen', async () => {
      await element(by.id('appointments-tab')).tap();
      await expect(element(by.id('appointments-screen'))).toBeVisible();
    });

    it('should display list of appointments', async () => {
      await element(by.id('appointments-tab')).tap();
      await waitFor(element(by.id('appointment-list')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should display appointment details', async () => {
      await element(by.id('appointments-tab')).tap();
      await element(by.id('appointment-item-0')).tap();

      await expect(element(by.id('appointment-detail-screen'))).toBeVisible();
      await expect(element(by.id('appointment-date'))).toBeVisible();
      await expect(element(by.id('appointment-doctor'))).toBeVisible();
    });
  });

  describe('Create Appointment', () => {
    it('should open create appointment form', async () => {
      await element(by.id('appointments-tab')).tap();
      await element(by.id('create-appointment-button')).tap();

      await expect(element(by.id('create-appointment-screen'))).toBeVisible();
    });

    it('should create new appointment', async () => {
      await element(by.id('appointments-tab')).tap();
      await element(by.id('create-appointment-button')).tap();

      // Select date
      await element(by.id('date-picker')).tap();
      await element(by.text('15')).tap(); // Select day 15
      await element(by.id('confirm-date-button')).tap();

      // Select time
      await element(by.id('time-picker')).tap();
      await element(by.text('10:00')).tap();
      await element(by.id('confirm-time-button')).tap();

      // Select doctor
      await element(by.id('doctor-selector')).tap();
      await element(by.text('Dr. Test')).tap();

      // Submit
      await element(by.id('create-appointment-submit-button')).tap();

      // Wait for success
      await waitFor(element(by.text(/cita creada/i)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Edit Appointment', () => {
    it('should edit existing appointment', async () => {
      await element(by.id('appointments-tab')).tap();
      await element(by.id('appointment-item-0')).tap();
      await element(by.id('edit-appointment-button')).tap();

      await expect(element(by.id('edit-appointment-screen'))).toBeVisible();

      // Change date
      await element(by.id('date-picker')).tap();
      await element(by.text('20')).tap();
      await element(by.id('confirm-date-button')).tap();

      // Save
      await element(by.id('save-appointment-button')).tap();

      await waitFor(element(by.text(/cita actualizada/i)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Cancel Appointment', () => {
    it('should cancel appointment', async () => {
      await element(by.id('appointments-tab')).tap();
      await element(by.id('appointment-item-0')).tap();
      await element(by.id('cancel-appointment-button')).tap();

      // Confirm cancellation
      await element(by.id('confirm-cancel-button')).tap();

      await waitFor(element(by.text(/cita cancelada/i)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Appointment Reminders', () => {
    it('should set appointment reminder', async () => {
      await element(by.id('appointments-tab')).tap();
      await element(by.id('appointment-item-0')).tap();
      await element(by.id('set-reminder-button')).tap();

      // Select reminder time
      await element(by.id('reminder-time-selector')).tap();
      await element(by.text('1 hora antes')).tap();
      await element(by.id('confirm-reminder-button')).tap();

      await waitFor(element(by.text(/recordatorio configurado/i)))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
});

