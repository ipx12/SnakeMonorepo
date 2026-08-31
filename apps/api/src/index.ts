import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { toNodeHandler } from 'better-auth/node';
import { auth, initDb } from './auth';
import { taskRouter } from './routes/task.routes';
import { adminRouter } from './routes/admin.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

// Mount Better Auth BEFORE express.json() so raw request stream is preserved
app.all('/api/auth/*', toNodeHandler(auth));

// Middleware for parsing JSON and cookies
app.use(express.json());
app.use(cookieParser());

// Application API Routers
app.use('/api/tasks', taskRouter);
app.use('/api/admin', adminRouter);

// Global Error Handler
app.use((unhandledError: any, _httpRequest: Request, httpResponse: Response, _nextMiddleware: NextFunction) => {
  console.error('Unhandled API Error:', unhandledError);
  httpResponse.status(500).json({
    message: unhandledError?.message || 'Internal Server Error',
  });
});

if (process.env.NODE_ENV !== 'test') {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  });
}

export { app };
