import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../lib/schemas/auth';
import { UserRole } from '@snake/types';

describe('Auth Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login credentials successfully', () => {
      const validLoginInput = {
        email: 'user@watermelon.ui',
        password: 'password123',
      };

      const validationResult = loginSchema.safeParse(validLoginInput);
      expect(validationResult.success).toBe(true);
      if (validationResult.success) {
        expect(validationResult.data.email).toBe(validLoginInput.email);
      }
    });

    it('should fail validation when email is invalid', () => {
      const invalidEmailInput = {
        email: 'not-an-email',
        password: 'password123',
      };

      const validationResult = loginSchema.safeParse(invalidEmailInput);
      expect(validationResult.success).toBe(false);
    });

    it('should fail validation when password is too short', () => {
      const shortPasswordInput = {
        email: 'user@watermelon.ui',
        password: '123',
      };

      const validationResult = loginSchema.safeParse(shortPasswordInput);
      expect(validationResult.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate valid registration input successfully', () => {
      const validRegisterInput = {
        name: 'Jane Doe',
        email: 'jane@watermelon.ui',
        password: 'password123',
        confirmPassword: 'password123',
        role: UserRole.User,
      };

      const validationResult = registerSchema.safeParse(validRegisterInput);
      expect(validationResult.success).toBe(true);
    });

    it('should fail validation when password and confirmPassword do not match', () => {
      const mismatchedPasswordInput = {
        name: 'Jane Doe',
        email: 'jane@watermelon.ui',
        password: 'password123',
        confirmPassword: 'differentPassword456',
        role: UserRole.User,
      };

      const validationResult = registerSchema.safeParse(mismatchedPasswordInput);
      expect(validationResult.success).toBe(false);
      if (!validationResult.success) {
        const confirmPasswordError = validationResult.error.issues.find(
          (issue) => issue.path.includes('confirmPassword')
        );
        expect(confirmPasswordError?.message).toBe('Passwords do not match');
      }
    });
  });
});
