import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './auth';
import { taskRouter } from './routes/task.routes';
import { adminRouter } from './routes/admin.routes';

/**
 * Main Hono application instance for Snake API.
 * Configured with CORS, Better Auth endpoint, health check, and modular business routers.
 */
export const app = new Hono();

// CORS configuration supporting local development, configured frontend URL, and Cloudflare domains
app.use(
  '*',
  cors({
    origin: (requestOrigin: string) => {
      const configuredFrontendUrl = process.env.FRONTEND_URL;
      if (configuredFrontendUrl && requestOrigin === configuredFrontendUrl) {
        return requestOrigin;
      }
      if (
        !requestOrigin ||
        requestOrigin.startsWith('http://localhost:') ||
        requestOrigin.startsWith('http://127.0.0.1:') ||
        requestOrigin.endsWith('.pages.dev') ||
        requestOrigin.endsWith('.workers.dev')
      ) {
        return requestOrigin;
      }
      return configuredFrontendUrl || 'http://localhost:3000';
    },
    credentials: true,
  })
);

// Mount Better Auth BEFORE other routes
app.on(['POST', 'GET'], '/api/auth/**', (context) => auth.handler(context.req.raw));

// Health check endpoint for container readiness, worker verification, and liveness probes
app.get('/api/health', (context) => {
  return context.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
});

// Application API Routers
app.route('/api/tasks', taskRouter);
app.route('/api/admin', adminRouter);

// Global Error Handler
app.onError((error, context) => {
  console.error('Unhandled API Error:', error);
  return context.json(
    {
      message: error.message || 'Internal Server Error',
    },
    500
  );
});
