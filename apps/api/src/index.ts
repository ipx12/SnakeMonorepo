import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { auth, initDb } from './auth';
import { taskRouter } from './routes/task.routes';
import { adminRouter } from './routes/admin.routes';

dotenv.config();

const app = new Hono();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

// CORS configuration
app.use(
  '*',
  cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// Mount Better Auth BEFORE other routes
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw));

// Health check endpoint for container readiness and liveness probes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
});

// Application API Routers
app.route('/api/tasks', taskRouter);
app.route('/api/admin', adminRouter);

// Global Error Handler
app.onError((err, c) => {
  console.error('Unhandled API Error:', err);
  return c.json({
    message: err.message || 'Internal Server Error',
  }, 500);
});

if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    const apiServer = serve(
      {
        fetch: app.fetch,
        port: PORT,
      },
      (info) => {
        console.log(`Server is running on http://localhost:${info.port}`);
      }
    );

    const gracefulShutdownHandler = (signalName: string) => {
      console.log(`[API] Received ${signalName}, shutting down gracefully...`);
      apiServer.close(() => {
        console.log('[API] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdownHandler('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdownHandler('SIGINT'));
  });
}

export { app };
