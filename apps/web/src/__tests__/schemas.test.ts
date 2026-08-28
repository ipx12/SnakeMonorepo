import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  registerSchema,
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
  adminUsersQuerySchema,
  UserRole,
} from '@snake/types';

describe('Shared Zod Schemas Validation Tests', () => {
  describe('Login Schema', () => {
    it('should validate valid email and password', () => {
      const validPayload = {
        email: 'user@watermelon.ui',
        password: 'password123',
      };
      const parseResult = loginSchema.safeParse(validPayload);
      expect(parseResult.success).toBe(true);
    });

    it('should fail on invalid email format', () => {
      const invalidPayload = {
        email: 'invalid-email-format',
        password: 'password123',
      };
      const parseResult = loginSchema.safeParse(invalidPayload);
      expect(parseResult.success).toBe(false);
    });

    it('should fail on password shorter than 6 characters', () => {
      const invalidPayload = {
        email: 'user@watermelon.ui',
        password: '123',
      };
      const parseResult = loginSchema.safeParse(invalidPayload);
      expect(parseResult.success).toBe(false);
    });
  });

  describe('Register Schema', () => {
    it('should validate matching passwords and valid fields', () => {
      const validPayload = {
        name: 'Alex Developer',
        email: 'alex@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        role: UserRole.User,
      };
      const parseResult = registerSchema.safeParse(validPayload);
      expect(parseResult.success).toBe(true);
    });

    it('should fail when passwords do not match', () => {
      const mismatchedPayload = {
        name: 'Alex Developer',
        email: 'alex@example.com',
        password: 'securePassword123',
        confirmPassword: 'differentPassword456',
        role: UserRole.User,
      };
      const parseResult = registerSchema.safeParse(mismatchedPayload);
      expect(parseResult.success).toBe(false);
      if (!parseResult.success) {
        expect(parseResult.error.issues[0].message).toBe('Passwords do not match');
      }
    });

    it('should fail when name is empty or too short', () => {
      const shortNamePayload = {
        name: 'A',
        email: 'alex@example.com',
        password: 'securePassword123',
        confirmPassword: 'securePassword123',
        role: UserRole.User,
      };
      const parseResult = registerSchema.safeParse(shortNamePayload);
      expect(parseResult.success).toBe(false);
    });
  });

  describe('Task Schemas', () => {
    it('should validate valid task creation payload and trim title', () => {
      const validCreatePayload = {
        title: '  Finish feature tests  ',
        description: 'Ensure 100% test coverage',
      };
      const parseResult = createTaskSchema.safeParse(validCreatePayload);
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.title).toBe('Finish feature tests');
      }
    });

    it('should fail task creation without title', () => {
      const emptyTitlePayload = {
        title: '',
      };
      const parseResult = createTaskSchema.safeParse(emptyTitlePayload);
      expect(parseResult.success).toBe(false);
    });

    it('should validate partial updates for task', () => {
      const validUpdatePayload = {
        completed: true,
      };
      const parseResult = updateTaskSchema.safeParse(validUpdatePayload);
      expect(parseResult.success).toBe(true);
    });

    it('should validate taskId path parameter', () => {
      const validIdParam = { id: 'task-12345' };
      const parseResult = taskIdParamSchema.safeParse(validIdParam);
      expect(parseResult.success).toBe(true);

      const invalidIdParam = { id: '' };
      const invalidParseResult = taskIdParamSchema.safeParse(invalidIdParam);
      expect(invalidParseResult.success).toBe(false);
    });
  });

  describe('Admin Users Query Schema', () => {
    it('should apply defaults for missing page and limit', () => {
      const parseResult = adminUsersQuerySchema.safeParse({});
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.page).toBe(1);
        expect(parseResult.data.limit).toBe(10);
        expect(parseResult.data.search).toBe('');
      }
    });

    it('should coerce string numbers to numeric integers', () => {
      const parseResult = adminUsersQuerySchema.safeParse({
        page: '3',
        limit: '25',
        search: 'john',
      });
      expect(parseResult.success).toBe(true);
      if (parseResult.success) {
        expect(parseResult.data.page).toBe(3);
        expect(parseResult.data.limit).toBe(25);
        expect(parseResult.data.search).toBe('john');
      }
    });

    it('should fail when limit exceeds maximum allowed value of 100', () => {
      const parseResult = adminUsersQuerySchema.safeParse({
        limit: '500',
      });
      expect(parseResult.success).toBe(false);
    });
  });
});
