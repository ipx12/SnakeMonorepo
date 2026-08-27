import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { randomUUID } from 'node:crypto';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth, db } from './auth';
import { UserRole, type Task, type AdminUsersResponse } from '@snake/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Mount Better Auth BEFORE express.json() so request body stream is preserved
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json());
app.use(cookieParser());

// Helper to get session from Express request
const getAuthSession = async (request: Request) => {
  try {
    return await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
  } catch {
    return null;
  }
};

// Helper to map DB row to Task
const mapRowToTask = (row: any): Task => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  completed: Boolean(row.completed),
  userId: row.userId,
  createdAt: row.createdAt,
});

// Reusable Authentication Middlewares
interface AuthenticatedRequest extends Request {
  userSession?: NonNullable<Awaited<ReturnType<typeof getAuthSession>>>;
}

const requireAuth = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  const session = await getAuthSession(request);
  if (!session?.user) {
    return response.status(401).json({ message: 'Authentication required. Please sign in.' });
  }
  request.userSession = session;
  next();
};

const requireAdmin = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction
) => {
  const session = await getAuthSession(request);
  if (!session?.user) {
    return response.status(401).json({ message: 'Authentication required. Please sign in.' });
  }
  const userRole = (session.user as { role?: string }).role;
  if (userRole !== UserRole.Admin) {
    return response.status(403).json({ message: 'Forbidden. Admin access required.' });
  }
  request.userSession = session;
  next();
};

// CRUD Routes

// GET /api/tasks - Read user's tasks
app.get('/api/tasks', requireAuth, async (request: AuthenticatedRequest, response: Response) => {
  const userId = request.userSession!.user.id;
  try {
    const rawRows = await db.selectFrom('task').selectAll().where('userId', '=', userId).execute();
    let userTasks = rawRows.map(mapRowToTask);

    // If user has no tasks yet, seed initial default tasks in a single batch insert
    if (userTasks.length === 0) {
      const userRole = (request.userSession!.user as { role?: string }).role || UserRole.User;
      const defaultTasks: Task[] = [
        {
          id: randomUUID(),
          title: 'Welcome to your Task Dashboard',
          description: 'This is your private task list. Add, edit or complete your items.',
          completed: false,
          userId: userId,
          createdAt: new Date().toISOString(),
        },
        {
          id: randomUUID(),
          title: 'Explore User Roles',
          description: `Your account role is '${userRole}'.`,
          completed: true,
          userId: userId,
          createdAt: new Date().toISOString(),
        },
      ];

      // Single optimized batch insert
      await db
        .insertInto('task')
        .values(
          defaultTasks.map((taskItem) => ({
            id: taskItem.id,
            title: taskItem.title,
            description: taskItem.description,
            completed: taskItem.completed ? 1 : 0,
            userId: taskItem.userId!,
            createdAt: taskItem.createdAt,
          }))
        )
        .execute();

      userTasks = defaultTasks;
    }

    response.json(userTasks);
  } catch (caughtError: any) {
    response.status(500).json({ message: 'Failed to fetch tasks', error: caughtError.message });
  }
});

// GET /api/tasks/:id - Read one task
app.get('/api/tasks/:id', requireAuth, async (request: AuthenticatedRequest, response: Response) => {
  try {
    const row = await db.selectFrom('task').selectAll().where('id', '=', request.params.id).executeTakeFirst();
    if (!row) {
      return response.status(404).json({ message: 'Task not found' });
    }

    const task = mapRowToTask(row);
    const userRole = (request.userSession!.user as { role?: string }).role;
    if (task.userId !== request.userSession!.user.id && userRole !== UserRole.Admin) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    response.json(task);
  } catch (error: any) {
    response.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

// POST /api/tasks - Create task
app.post('/api/tasks', requireAuth, async (request: AuthenticatedRequest, response: Response) => {
  const { title, description } = request.body;
  if (!title) {
    return response.status(400).json({ message: 'Title is required' });
  }

  const newTask: Task = {
    id: randomUUID(),
    title,
    description: description || '',
    completed: false,
    userId: request.userSession!.user.id,
    createdAt: new Date().toISOString(),
  };

  try {
    await db
      .insertInto('task')
      .values({
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        completed: 0,
        userId: newTask.userId!,
        createdAt: newTask.createdAt,
      })
      .execute();

    response.status(201).json(newTask);
  } catch (error: any) {
    response.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', requireAuth, async (request: AuthenticatedRequest, response: Response) => {
  try {
    const existingRow = await db.selectFrom('task').selectAll().where('id', '=', request.params.id).executeTakeFirst();
    if (!existingRow) {
      return response.status(404).json({ message: 'Task not found' });
    }

    const existingTask = mapRowToTask(existingRow);
    const userRole = (request.userSession!.user as { role?: string }).role;
    if (existingTask.userId !== request.userSession!.user.id && userRole !== UserRole.Admin) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    const { title, description, completed } = request.body;
    const updatedTask: Task = {
      ...existingTask,
      title: title !== undefined ? title : existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      completed: completed !== undefined ? completed : existingTask.completed,
    };

    await db
      .updateTable('task')
      .set({
        title: updatedTask.title,
        description: updatedTask.description,
        completed: updatedTask.completed ? 1 : 0,
      })
      .where('id', '=', request.params.id)
      .execute();

    response.json(updatedTask);
  } catch (error: any) {
    response.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

// GET /api/admin/users - Read paginated & searchable list of users (Admin only)
app.get('/api/admin/users', requireAdmin, async (request: AuthenticatedRequest, response: Response) => {
  try {
    const requestedPage = Math.max(1, parseInt(request.query.page as string, 10) || 1);
    const requestedLimit = Math.max(1, Math.min(100, parseInt(request.query.limit as string, 10) || 10));
    const searchQuery = typeof request.query.search === 'string' ? request.query.search.trim() : '';

    let baseQuery = db.selectFrom('user');
    let countQuery = db.selectFrom('user');

    if (searchQuery) {
      const searchPattern = `%${searchQuery}%`;
      baseQuery = baseQuery.where((expressionBuilder) =>
        expressionBuilder.or([
          expressionBuilder('name', 'like', searchPattern),
          expressionBuilder('email', 'like', searchPattern),
          expressionBuilder('role', 'like', searchPattern),
          expressionBuilder('id', 'like', searchPattern),
        ])
      );
      countQuery = countQuery.where((expressionBuilder) =>
        expressionBuilder.or([
          expressionBuilder('name', 'like', searchPattern),
          expressionBuilder('email', 'like', searchPattern),
          expressionBuilder('role', 'like', searchPattern),
          expressionBuilder('id', 'like', searchPattern),
        ])
      );
    }

    const totalCountResult = await countQuery
      .select((expressionBuilder) => expressionBuilder.fn.count<number>('id').as('count'))
      .executeTakeFirst();
    const totalCount = Number(totalCountResult?.count || 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / requestedLimit));
    const offset = (requestedPage - 1) * requestedLimit;

    const rawUsers = await baseQuery
      .selectAll()
      .limit(requestedLimit)
      .offset(offset)
      .execute();

    const formattedUsers = rawUsers.map((userRow: any) => ({
      id: userRow.id,
      name: userRow.name || '',
      email: userRow.email,
      emailVerified: Boolean(userRow.emailVerified),
      image: userRow.image || null,
      role: userRow.role || UserRole.User,
      createdAt: typeof userRow.createdAt === 'number' ? new Date(userRow.createdAt).toISOString() : userRow.createdAt,
      updatedAt: typeof userRow.updatedAt === 'number' ? new Date(userRow.updatedAt).toISOString() : userRow.updatedAt,
    }));

    const paginatedResponse: AdminUsersResponse = {
      users: formattedUsers,
      pagination: {
        page: requestedPage,
        limit: requestedLimit,
        totalCount,
        totalPages,
      },
    };

    response.json(paginatedResponse);
  } catch (caughtError: any) {
    response.status(500).json({ message: 'Failed to fetch users list', error: caughtError.message });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', requireAuth, async (request: AuthenticatedRequest, response: Response) => {
  try {
    const existingRow = await db.selectFrom('task').selectAll().where('id', '=', request.params.id).executeTakeFirst();
    if (!existingRow) {
      return response.status(404).json({ message: 'Task not found' });
    }

    const existingTask = mapRowToTask(existingRow);
    const userRole = (request.userSession!.user as { role?: string }).role;
    if (existingTask.userId !== request.userSession!.user.id && userRole !== UserRole.Admin) {
      return response.status(403).json({ message: 'Forbidden' });
    }

    await db.deleteFrom('task').where('id', '=', request.params.id).execute();

    response.json(existingTask);
  } catch (error: any) {
    response.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { app };


