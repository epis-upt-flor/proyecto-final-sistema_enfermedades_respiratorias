/* eslint-env detox/detox, jest */

/**
 * E2E Tests for Authentication Flow
 */

describe('Authentication Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Login Flow', () => {
    it('should display login screen', async () => {
      await expect(element(by.id('login-screen'))).toBeVisible();
      await expect(element(by.id('email-input'))).toBeVisible();
      await expect(element(by.id('password-input'))).toBeVisible();
      await expect(element(by.id('login-button'))).toBeVisible();
    });

    it('should login successfully with valid credentials', async () => {
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();

      // Wait for navigation to home
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error with invalid credentials', async () => {
      await element(by.id('email-input')).typeText('wrong@example.com');
      await element(by.id('password-input')).typeText('wrongpassword');
      await element(by.id('login-button')).tap();

      await waitFor(element(by.text(/credenciales inválidas/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should navigate to registration screen', async () => {
      await element(by.id('register-link')).tap();
      await expect(element(by.id('register-screen'))).toBeVisible();
    });
  });

  describe('Registration Flow', () => {
    beforeEach(async () => {
      await element(by.id('register-link')).tap();
    });

    it('should register new user', async () => {
      await element(by.id('name-input')).typeText('New User');
      await element(by.id('email-input')).typeText('newuser@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('password123');
      await element(by.id('register-button')).tap();

      // Wait for navigation to home
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate password match', async () => {
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('confirm-password-input')).typeText('different');
      await element(by.id('register-button')).tap();

      await waitFor(element(by.text(/las contraseñas no coinciden/i)))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Logout Flow', () => {
    beforeEach(async () => {
      // Login first
      await element(by.id('email-input')).typeText('test@example.com');
      await element(by.id('password-input')).typeText('password123');
      await element(by.id('login-button')).tap();
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should logout successfully', async () => {
      await element(by.id('profile-tab')).tap();
      await element(by.id('logout-button')).tap();

      // Confirm logout
      await element(by.id('confirm-logout-button')).tap();

      // Should return to login screen
      await waitFor(element(by.id('login-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
});

