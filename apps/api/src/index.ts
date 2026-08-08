import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { toNodeHandler, fromNodeHeaders } from 'better-auth/node';
import { auth, db } from './auth';

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

// In-memory data store for items
interface Item {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt: string;
}

let items: Item[] = [];

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

// Admin Routes
// GET /api/admin/users - Read all registered users in system (Admin only)
app.get('/api/admin/users', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const userRole = (session.user as any).role;
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }

  try {
    const users = await db.selectFrom('user').selectAll().execute();
    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      emailVerified: Boolean(u.emailVerified),
      image: u.image || null,
      role: u.role || 'user',
      createdAt: typeof u.createdAt === 'number' ? new Date(u.createdAt).toISOString() : u.createdAt,
      updatedAt: typeof u.updatedAt === 'number' ? new Date(u.updatedAt).toISOString() : u.updatedAt,
    }));
    res.json(formattedUsers);
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// CRUD Routes

// GET /api/items - Read user's tasks
app.get('/api/items', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const userId = session.user.id;
  let userItems = items.filter((i) => i.userId === userId);

  // If user has no tasks yet, seed initial default tasks for them
  if (userItems.length === 0) {
    const defaultTasks: Item[] = [
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
        description: `Your account role is '${(session.user as any).role || 'user'}'.`,
        completed: true,
        userId: userId,
        createdAt: new Date().toISOString(),
      },
    ];
    items.push(...defaultTasks);
    userItems = defaultTasks;
  }

  res.json(userItems);
});

// GET /api/items/:id - Read one
app.get('/api/items/:id', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const item = items.find((i) => i.id === req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const userRole = (session.user as any).role;
  if (item.userId !== session.user.id && userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  res.json(item);
});

// POST /api/items - Create
app.post('/api/items', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const newItem: Item = {
    id: Math.random().toString(36).substring(2, 9),
    title,
    description: description || '',
    completed: false,
    userId: session.user.id,
    createdAt: new Date().toISOString(),
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT /api/items/:id - Update
app.put('/api/items/:id', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const itemIndex = items.findIndex((i) => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const userRole = (session.user as any).role;
  if (items[itemIndex].userId !== session.user.id && userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { title, description, completed } = req.body;
  const updatedItem = {
    ...items[itemIndex],
    title: title !== undefined ? title : items[itemIndex].title,
    description: description !== undefined ? description : items[itemIndex].description,
    completed: completed !== undefined ? completed : items[itemIndex].completed,
  };

  items[itemIndex] = updatedItem;
  res.json(updatedItem);
});

// DELETE /api/items/:id - Delete
app.delete('/api/items/:id', async (req, res) => {
  const session = await getAuthSession(req);
  if (!session?.user) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const itemIndex = items.findIndex((i) => i.id === req.params.id);
  if (itemIndex === -1) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const userRole = (session.user as any).role;
  if (items[itemIndex].userId !== session.user.id && userRole !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const deletedItem = items.splice(itemIndex, 1)[0];
  res.json(deletedItem);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
