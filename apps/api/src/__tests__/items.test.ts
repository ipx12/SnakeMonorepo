import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';
import { db } from '../auth';

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

  it('should return 401 Unauthorized for unauthenticated GET /api/tasks', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Authentication required');
  });

  it('should seed and return default tasks for authenticated GET /api/tasks in database', async () => {
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0].userId).toBe('user-test-123');

    // Verify default tasks were written to SQLite DB
    const dbRows = await db.selectFrom('task').selectAll().where('userId', '=', 'user-test-123').execute();
    expect(dbRows.length).toBe(response.body.length);
  });

  it('should create a new task in SQLite via POST /api/tasks and persist it', async () => {
    const newTaskPayload = {
      title: 'Write Unit Tests with Vitest',
      description: 'Cover API endpoints with supertest',
    };

    const postResponse = await request(app)
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
    const getResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token');

    expect(getResponse.status).toBe(200);
    const foundTask = getResponse.body.find((taskItem: any) => taskItem.id === createdTaskId);
    expect(foundTask).toBeDefined();
    expect(foundTask.title).toBe(newTaskPayload.title);
  });

  it('should update and delete task in SQLite database', async () => {
    // 1. Create task
    const createRes = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send({ title: 'Task to update and delete' });
    const taskId = createRes.body.id;

    // 2. Update task in SQLite
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-user-token')
      .send({ completed: true, title: 'Updated task title' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.completed).toBe(true);
    expect(updateRes.body.title).toBe('Updated task title');

    const dbRowUpdated = await db.selectFrom('task').selectAll().where('id', '=', taskId).executeTakeFirst();
    expect(dbRowUpdated?.completed).toBe(1);

    // 3. Delete task from SQLite
    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', 'Bearer mock-user-token');

    expect(deleteRes.status).toBe(200);

    const dbRowDeleted = await db.selectFrom('task').selectAll().where('id', '=', taskId).executeTakeFirst();
    expect(dbRowDeleted).toBeUndefined();
  });

  it('should return 400 Bad Request when creating task without title', async () => {
    const invalidTaskPayload = {
      description: 'Missing title property',
    };

    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', 'Bearer mock-user-token')
      .send(invalidTaskPayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Title is required');
  });

  it('should return 401 Unauthorized for unauthenticated GET /api/admin/users', async () => {
    const response = await request(app).get('/api/admin/users');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Authentication required');
  });

  it('should return 403 Forbidden for non-admin user accessing GET /api/admin/users', async () => {
    const response = await request(app)
      .get('/api/admin/users')
      .set('Authorization', 'Bearer mock-user-token');

    expect(response.status).toBe(403);
    expect(response.body.message).toContain('Forbidden');
  });

  it('should return 200 OK with paginated list of users and metadata for admin user', async () => {
    const response = await request(app)
      .get('/api/admin/users?page=1&limit=10')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('users');
    expect(response.body).toHaveProperty('pagination');
    expect(Array.isArray(response.body.users)).toBe(true);
    expect(response.body.users.length).toBe(2);
    expect(response.body.pagination.totalCount).toBe(2);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.totalPages).toBe(1);

    const adminUserRecord = response.body.users.find((userRecord: any) => userRecord.id === 'admin-test-999');
    expect(adminUserRecord).toBeDefined();
    expect(adminUserRecord.email).toBe('admin@example.com');
    expect(adminUserRecord.role).toBe('admin');
  });

  it('should filter users with search parameter on GET /api/admin/users', async () => {
    const response = await request(app)
      .get('/api/admin/users?search=admin-test')
      .set('Authorization', 'Bearer mock-admin-token');

    expect(response.status).toBe(200);
    expect(response.body.users.length).toBe(1);
    expect(response.body.users[0].id).toBe('admin-test-999');
    expect(response.body.pagination.totalCount).toBe(1);
  });
});

