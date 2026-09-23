import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { serve } from '@hono/node-server';
import type { Server } from 'http';
import { app } from '../index';
import { db } from '../auth';

let server: Server;
beforeAll(() => {
  server = serve({ fetch: app.fetch, port: 0 }) as Server;
});

afterAll(() => {
  return new Promise((resolve) => {
    server.close(() => resolve(undefined));
  });
});

// Mock auth session helper for supertest endpoints while keeping real DB
vi.mock('../auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../auth')>();
  return {
    ...actual,
    auth: {
      api: {
        getSession: vi.fn().mockImplementation(async ({ headers }: { headers: Headers }) => {
          const authHeader = headers.get('authorization');
          if (authHeader === 'Bearer mock-user-token') {
            return {
              user: {
                id: 'user-test-123',
                name: 'Test User',
                email: 'test@example.com',
                role: 'user',
              },
            };
          }
          if (authHeader === 'Bearer mock-other-user-token') {
            return {
              user: {
                id: 'user-other-456',
                name: 'Other User',
                email: 'other@example.com',
                role: 'user',
              },
            };
          }
          if (authHeader === 'Bearer mock-admin-token') {
            return {
              user: {
                id: 'admin-test-999',
                name: 'Admin User',
                email: 'admin@example.com',
                role: 'admin',
              },
            };
          }
          return null;
        }),
      },
    },
  };
});

describe('Tasks API Endpoints Integration & Database Persistence', () => {
  beforeEach(async () => {
    // Clean tasks table before each test to ensure test isolation
    try {
      await db.deleteFrom('task').execute();
      await db.deleteFrom('user').execute();
    } catch {
      // Table will be created by initDb
    }

    // Insert mock users to satisfy FOREIGN KEY constraint on task.userId
    const now = Date.now();
    await db
      .insertInto('user')
      .values([
        {
          id: 'user-test-123',
          name: 'Test User',
          email: 'test@example.com',
          emailVerified: 1,
          role: 'user',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'user-other-456',
          name: 'Other User',
          email: 'other@example.com',
          emailVerified: 1,
          role: 'user',
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'admin-test-999',
          name: 'Admin User',
          email: 'admin@example.com',
          emailVerified: 1,
          role: 'admin',
          createdAt: now,
          updatedAt: now,
        },
      ])
      .execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it('should return 200 OK with status ok on GET /api/health', async () => {
    const healthResponse = await request(server).get('/api/health');
    expect(healthResponse.status).toBe(200);
    expect(healthResponse.body.status).toBe('ok');
    expect(healthResponse.body).toHaveProperty('timestamp');
  });

  it('should return 401 Unauthorized for unauthenticated GET /api/tasks', async () => {
    const response = await request(server).get('/api/tasks');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Authentication required');
  });

  it('should return an empty array for authenticated GET /api/tasks in database when no tasks exist', async () => {
    const response = await request(server)
      .get('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);

    // Verify tasks are empty in SQLite DB
    const dbRows = await db.selectFrom('task').selectAll().where('userId', '=', 'user-test-123').execute();
    expect(dbRows.length).toBe(0);
  });

  it('should create a new task in SQLite via POST /api/tasks and persist it', async () => {
    const newTaskPayload = {
      title: 'Write Unit Tests with Vitest',
      description: 'Cover API endpoints with supertest',
    };

    const postResponse = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send(newTaskPayload);

    expect(postResponse.status).toBe(201);
    expect(postResponse.body.title).toBe(newTaskPayload.title);
    expect(postResponse.body.description).toBe(newTaskPayload.description);
    expect(postResponse.body.completed).toBe(false);
    expect(postResponse.body.userId).toBe('user-test-123');

    const createdTaskId = postResponse.body.id;

    // Verify task is persisted directly in SQLite database
    const dbRecord = await db.selectFrom('task').selectAll().where('id', '=', createdTaskId).executeTakeFirst();
    expect(dbRecord).toBeDefined();
    expect(dbRecord?.title).toBe(newTaskPayload.title);

    // Verify task is retrieved on subsequent GET request
    const getResponse = await request(server)
      .get('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token');

    expect(getResponse.status).toBe(200);
    const foundTask = getResponse.body.find((taskItem: any) => taskItem.id === createdTaskId);
    expect(foundTask).toBeDefined();
    expect(foundTask.title).toBe(newTaskPayload.title);
  });

  it('should return single task on GET /api/tasks/:id for owner', async () => {
    const createRes = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'Single Task Test' });
    const taskId = createRes.body.id;

    const singleTaskResponse = await request(server)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-user-token');

    expect(singleTaskResponse.status).toBe(200);
    expect(singleTaskResponse.body.id).toBe(taskId);
    expect(singleTaskResponse.body.title).toBe('Single Task Test');
  });

  it('should return 404 on GET /api/tasks/:id when task does not exist', async () => {
    const nonExistentResponse = await request(server)
      .get('/api/tasks/non-existent-task-id')
      .set('Authorization', 'Bearer mock-user-token');

    expect(nonExistentResponse.status).toBe(404);
    expect(nonExistentResponse.body.message).toBe('Task not found');
  });

  it('should return 403 Forbidden on GET /api/tasks/:id when another user accesses private task', async () => {
    const createRes = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'User 1 Private Task' });
    const taskId = createRes.body.id;

    const forbiddenResponse = await request(server)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-other-user-token');

    expect(forbiddenResponse.status).toBe(403);
    expect(forbiddenResponse.body.message).toBe('Forbidden');
  });

  it('should allow admin to retrieve any user task on GET /api/tasks/:id', async () => {
    const createRes = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'User Task Inspected by Admin' });
    const taskId = createRes.body.id;

    const adminResponse = await request(server)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-admin-token');

    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body.id).toBe(taskId);
    expect(adminResponse.body.title).toBe('User Task Inspected by Admin');
  });

  it('should update and delete task in SQLite database for owner', async () => {
    // 1. Create task
    const createRes = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'Task to update and delete' });
    const taskId = createRes.body.id;

    // 2. Update task in SQLite
    const updateRes = await request(server)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-user-token')
      .send({ completed: true, title: 'Updated task title' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.completed).toBe(true);
    expect(updateRes.body.title).toBe('Updated task title');

    const dbRowUpdated = await db.selectFrom('task').selectAll().where('id', '=', taskId).executeTakeFirst();
    expect(dbRowUpdated?.completed).toBe(1);

    // 3. Delete task from SQLite
    const deleteRes = await request(server)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-user-token');

    expect(deleteRes.status).toBe(200);

    const dbRowDeleted = await db.selectFrom('task').selectAll().where('id', '=', taskId).executeTakeFirst();
    expect(dbRowDeleted).toBeUndefined();
  });

  it('should return 403 Forbidden when another user attempts to update or delete a task', async () => {
    const createRes = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'Owner Task' });
    const taskId = createRes.body.id;

    // Unauthorized update attempt
    const updateAttempt = await request(server)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-other-user-token')
      .send({ title: 'Hacked Title' });
    expect(updateAttempt.status).toBe(403);
    expect(updateAttempt.body.message).toBe('Forbidden');

    // Unauthorized delete attempt
    const deleteAttempt = await request(server)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-other-user-token');
    expect(deleteAttempt.status).toBe(403);
    expect(deleteAttempt.body.message).toBe('Forbidden');
  });

  it('should allow admin to update and delete any user task', async () => {
    const createRes = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'User Task for Admin Override' });
    const taskId = createRes.body.id;

    // Admin updates task
    const adminUpdate = await request(server)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-admin-token')
      .send({ title: 'Admin Overridden Title' });
    expect(adminUpdate.status).toBe(200);
    expect(adminUpdate.body.title).toBe('Admin Overridden Title');

    // Admin deletes task
    const adminDelete = await request(server)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-admin-token');
    expect(adminDelete.status).toBe(200);
  });

  it('should return 404 when updating or deleting a non-existent task', async () => {
    const updateResponse = await request(server)
      .put('/api/tasks/missing-task-id')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'New Title' });
    expect(updateResponse.status).toBe(404);
    expect(updateResponse.body.message).toBe('Task not found');

    const deleteResponse = await request(server)
      .delete('/api/tasks/missing-task-id')
      .set('Authorization', 'Bearer mock-user-token');
    expect(deleteResponse.status).toBe(404);
    expect(deleteResponse.body.message).toBe('Task not found');
  });

  it('should return 400 Bad Request when creating task without title', async () => {
    const invalidTaskPayload = {
      description: 'Missing title property',
    };

    const response = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send(invalidTaskPayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Title is required');
  });

  it('should return 401 Unauthorized for unauthenticated GET /api/admin/users', async () => {
    const response = await request(server).get('/api/admin/users');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Authentication required');
  });

  it('should return 403 Forbidden for non-admin user accessing GET /api/admin/users', async () => {
    const response = await request(server)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer mock-user-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Forbidden');
  });

  it('should return 200 OK with paginated list of users and metadata for admin user', async () => {
    const response = await request(server)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBe(3);
    expect(response.body.pagination.totalCount).toBe(3);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.totalPages).toBe(1);

    const adminUserRecord = response.body.users.find((userRecord: any) => userRecord.id === 'admin-test-999');
    expect(adminUserRecord).toBeDefined();
    expect(adminUserRecord.email).toBe('admin@example.com');
    expect(adminUserRecord.role).toBe('admin');
  });

  it('should filter users with search parameter on GET /api/admin/users', async () => {
    const response = await request(server)
      .get('/api/admin/users?search=admin-test')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(response.status).toBe(200);
    expect(response.body.users.length).toBe(1);
    expect(response.body.users[0].id).toBe('admin-test-999');
    expect(response.body.pagination.totalCount).toBe(1);
  });

  it('should return 400 Bad Request when updating task with empty title via Zod validation', async () => {
    const createResponse = await request(server)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'Valid Task' });

    const createdTaskId = createResponse.body.id;

    const invalidUpdateResponse = await request(server)
      .put(`/api/tasks/${createdTaskId}`)
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: '' });

    expect(invalidUpdateResponse.status).toBe(400);
    expect(invalidUpdateResponse.body.message).toContain('Title cannot be empty');
  });
});
