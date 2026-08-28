import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { db } from '../auth';
import { UserRole } from '@snake/types';
import * as taskService from '../services/task.service';
import * as adminService from '../services/admin.service';

describe('Backend Services Unit Tests', () => {
  const mockUserId = 'service-test-user-1';
  const mockAdminId = 'service-test-admin-1';

  beforeEach(async () => {
    try {
      await db.deleteFrom('task').execute();
      await db.deleteFrom('user').execute();
    } catch {
      // Table will be created by initDb
    }

    const currentTimestamp = Date.now();
    await db
      .insertInto('user')
      .values([
        {
          id: mockUserId,
          name: 'Regular Developer',
          email: 'developer@example.com',
          emailVerified: 1,
          role: 'user',
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        },
        {
          id: mockAdminId,
          name: 'Lead Administrator',
          email: 'lead.admin@example.com',
          emailVerified: 1,
          role: 'admin',
          createdAt: currentTimestamp,
          updatedAt: currentTimestamp,
        },
      ])
      .execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('Task Service', () => {
    it('should seed default tasks when a user has no tasks', async () => {
      const userTasksList = await taskService.getTasksForUser(mockUserId, UserRole.User);
      expect(userTasksList.length).toBe(2);
      expect(userTasksList[0].userId).toBe(mockUserId);
      expect(userTasksList[0].title).toBe('Welcome to your Task Dashboard');
    });

    it('should create and retrieve a task by ID', async () => {
      const createdTask = await taskService.createTask(mockUserId, {
        title: 'New Feature Implementation',
        description: 'Implement unit testing for services',
      });

      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe('New Feature Implementation');
      expect(createdTask.completed).toBe(false);

      const retrievedTask = await taskService.getTaskById(createdTask.id);
      expect(retrievedTask).not.toBeNull();
      expect(retrievedTask?.title).toBe('New Feature Implementation');
    });

    it('should update an existing task fields correctly', async () => {
      const createdTask = await taskService.createTask(mockUserId, {
        title: 'Original Title',
        description: 'Original Description',
      });

      const updatedTask = await taskService.updateTask(createdTask, {
        title: 'Updated Title',
        completed: true,
      });

      expect(updatedTask.title).toBe('Updated Title');
      expect(updatedTask.description).toBe('Original Description');
      expect(updatedTask.completed).toBe(true);

      const reFetchedTask = await taskService.getTaskById(createdTask.id);
      expect(reFetchedTask?.completed).toBe(true);
      expect(reFetchedTask?.title).toBe('Updated Title');
    });

    it('should delete a task from the database', async () => {
      const createdTask = await taskService.createTask(mockUserId, {
        title: 'Task to Delete',
        description: 'Will be removed',
      });

      await taskService.deleteTask(createdTask.id);

      const postDeleteTask = await taskService.getTaskById(createdTask.id);
      expect(postDeleteTask).toBeNull();
    });

    it('should correctly map raw database row to Task model', () => {
      const rawDatabaseRow = {
        id: 'task-uuid-123',
        title: 'Mapped Task',
        description: 'Row description',
        completed: 1,
        userId: mockUserId,
        createdAt: '2026-08-28T12:00:00.000Z',
      };

      const mappedTask = taskService.mapRowToTask(rawDatabaseRow);
      expect(mappedTask.completed).toBe(true);
      expect(mappedTask.id).toBe('task-uuid-123');
      expect(mappedTask.description).toBe('Row description');
    });
  });

  describe('Admin Service', () => {
    it('should return paginated users with correct pagination metadata', async () => {
      const paginatedUsersResult = await adminService.getAdminUsersPaginated({
        page: 1,
        limit: 10,
      });

      expect(paginatedUsersResult.users.length).toBe(2);
      expect(paginatedUsersResult.pagination.totalCount).toBe(2);
      expect(paginatedUsersResult.pagination.totalPages).toBe(1);
      expect(paginatedUsersResult.pagination.page).toBe(1);
    });

    it('should filter users by search term across name and email', async () => {
      const searchResult = await adminService.getAdminUsersPaginated({
        search: 'lead.admin',
      });

      expect(searchResult.users.length).toBe(1);
      expect(searchResult.users[0].email).toBe('lead.admin@example.com');
      expect(searchResult.pagination.totalCount).toBe(1);
    });
  });
});
