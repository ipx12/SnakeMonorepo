import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import { app } from './app';
import { initDb } from './auth';

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

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
