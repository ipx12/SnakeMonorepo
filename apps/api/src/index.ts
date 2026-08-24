import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth, db } from './auth';
import { UserRole } from './roles';

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

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

// Helper to get session from Express request
const getAuthSession = async (req: express.Request) => {
  try {
    return await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
  } catch (e) {
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

// CRUD Routes

// GET /api/tasks - Read user's tasks
app.get('/api/tasks', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const userId = session.user.id;
  try {
    const rawRows = await db.selectFrom('task').selectAll().where('userId', '=', userId).execute();
    let userTasks = rawRows.map(mapRowToTask);

    // If user has no tasks yet, seed initial default tasks for them into SQLite
    if (userTasks.length === 0) {
      const defaultTasks: Task[] = [
        {
          id: Math.random().toString(36).substring(2, 9),
          title: 'Welcome to your Task Dashboard',
          description: 'This is your private task list. Add, edit or complete your items.',
          completed: false,
          userId: userId,
          createdAt: new Date().toISOString(),
        },
        {
          id: Math.random().toString(36).substring(2, 9),
          title: 'Explore User Roles',
          description: `Your account role is '${(session.user as any).role || UserRole.User}'.`,
          completed: true,
          userId: userId,
          createdAt: new Date().toISOString(),
        },
      ];

      for (const taskRecord of defaultTasks) {
        await db
          .insertInto('task')
          .values({
            id: taskRecord.id,
            title: taskRecord.title,
            description: taskRecord.description,
            completed: taskRecord.completed ? 1 : 0,
            userId: taskRecord.userId,
            createdAt: taskRecord.createdAt,
          })
          .execute();
      }

      userTasks = defaultTasks;
    }

    res.json(userTasks);
  } catch (caughtError: any) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: caughtError.message });
  }
});

// GET /api/tasks/:id - Read one task
app.get('/api/tasks/:id', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  try {
    const row = await db.selectFrom('task').selectAll().where('id', '=', req.params.id).executeTakeFirst();
    if (!row) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = mapRowToTask(row);
    const userRole = (session.user as any).role;
    if (task.userId !== session.user.id && userRole !== UserRole.Admin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch task', error: error.message });
  }
});

// POST /api/tasks - Create task
app.post('/api/tasks', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newTask: Task = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    description: description || '',
    completed: false,
    userId: session.user.id,
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
        userId: newTask.userId,
        createdAt: newTask.createdAt,
      })
      .execute();

    res.status(201).json(newTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

// PUT /api/tasks/:id - Update task
app.put('/api/tasks/:id', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  try {
    const existingRow = await db.selectFrom('task').selectAll().where('id', '=', req.params.id).executeTakeFirst();
    if (!existingRow) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const existingTask = mapRowToTask(existingRow);
    const userRole = (session.user as any).role;
    if (existingTask.userId !== session.user.id && userRole !== UserRole.Admin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, description, completed } = req.body;
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
      .where('id', '=', req.params.id)
      .execute();

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
});

// DELETE /api/tasks/:id - Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  try {
    const existingRow = await db.selectFrom('task').selectAll().where('id', '=', req.params.id).executeTakeFirst();
    if (!existingRow) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const existingTask = mapRowToTask(existingRow);
    const userRole = (session.user as any).role;
    if (existingTask.userId !== session.user.id && userRole !== UserRole.Admin) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await db.deleteFrom('task').where('id', '=', req.params.id).execute();

    res.json(existingTask);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { app };

