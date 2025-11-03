/**
 * Unit tests for Authentication Controller
 */

import request from 'supertest';
import { app } from '../../src/index';
import { testUtils } from '../../tests/setup';
import User from '../../src/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

describe('Auth Controller', () => {
  beforeEach(async () => {
    await testUtils.cleanTestData();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = testUtils.generateTestUser();

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.data.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      const userData = testUtils.generateTestUser();
      
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to create user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should validate email format', async () => {
      const userData = testUtils.generateTestUser({ email: 'invalid-email' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should validate password strength', async () => {
      const userData = testUtils.generateTestUser({ password: '123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test user
      const userData = testUtils.generateTestUser();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should not login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login with invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should not login unverified user', async () => {
      // Create unverified user
      const userData = testUtils.generateTestUser({ email: 'unverified@example.com' });
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: false
      });

      const loginData = {
        email: 'unverified@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Please verify your email');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });

      // Generate refresh token
      refreshToken = jwt.sign(
        { userId: user._id, type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should not refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should not refresh with expired refresh token', async () => {
      // Create expired refresh token
      const expiredToken = jwt.sign(
        { userId: 'test-user-id', type: 'refresh' },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });

      authToken = testUtils.generateTestToken();
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('logged out');
    });

    it('should not logout without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should not logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;
    let userId: string;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });

      userId = user._id.toString();
      authToken = testUtils.generateTestToken({ userId });
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user._id).toBe(userId);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should not get user without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('No token provided');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      const userData = testUtils.generateTestUser();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });
    });

    it('should send password reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'test@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    it('should not reveal if email does not exist', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      const userData = testUtils.generateTestUser();
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true
      });

      // Generate reset token
      resetToken = jwt.sign(
        { email: 'test@example.com', type: 'password-reset' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );
    });

    it('should reset password with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'newpassword123'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset successfully');
    });

    it('should not reset password with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'newpassword123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired token');
    });

    it('should validate new password strength', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });
  });
});
