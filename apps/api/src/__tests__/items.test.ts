import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../index';

// Mock auth module session helper for supertest endpoints
vi.mock('../auth', () => {
  return {
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
    db: {
      selectFrom: vi.fn(),
    },
  };
});

describe('Items API Endpoints Integration', () => {
  it('should return 401 Unauthorized for unauthenticated GET /api/items', async () => {
    const response = await request(app).get('/api/items');
    expect(response.status).toBe(401);
    expect(response.body.message).toContain('Authentication required');
  });

  it('should return default items for authenticated GET /api/items', async () => {
    const response = await request(app)
      .get('/api/items')
      .set('Authorization', 'Bearer mock-user-token');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('title');
    expect(response.body[0].userId).toBe('user-test-123');
  });

  it('should create a new task item via POST /api/items', async () => {
    const newTaskPayload = {
      title: 'Write Unit Tests with Vitest',
      description: 'Cover API endpoints with supertest',
    };

    const response = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer mock-user-token')
      .send(newTaskPayload);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe(newTaskPayload.title);
    expect(response.body.description).toBe(newTaskPayload.description);
    expect(response.body.completed).toBe(false);
    expect(response.body.userId).toBe('user-test-123');
  });

  it('should return 400 Bad Request when creating item without title', async () => {
    const invalidTaskPayload = {
      description: 'Missing title property',
    };

    const response = await request(app)
      .post('/api/items')
      .set('Authorization', 'Bearer mock-user-token')
      .send(invalidTaskPayload);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Title is required');
  });
});
