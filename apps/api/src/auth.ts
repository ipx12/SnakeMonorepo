import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { DatabaseSchema } from '@snake/types';
import dotenv from 'dotenv';
import path from 'node:path';
import { runMigrationsToLatest } from './migrator';
import { seedDemoUser } from './seed';

// Safely load environment variables for local Node.js environments
try {
  dotenv.config();
  if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
    dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  }
} catch {
  // Dotenv loading is not required in Cloudflare Workers edge environment
}

// In automated test environments, use isolated local SQLite database to prevent
// remote Turso network latency, rate limits, and parallel test data collisions.
const isTestEnvironment = process.env.NODE_ENV === 'test';
const databaseUrl = isTestEnvironment
  ? 'file:test.db'
  : (process.env.DATABASE_URL || 'file:sqlite.db');

export const db = new Kysely<DatabaseSchema>({
  dialect: new LibsqlDialect({
    url: databaseUrl,
    authToken: isTestEnvironment ? undefined : process.env.TURSO_AUTH_TOKEN,
  }),
});

if (process.env.NODE_ENV === 'production' && !process.env.BETTER_AUTH_SECRET) {
  throw new Error('[Security] BETTER_AUTH_SECRET environment variable is required in production.');
}

export const auth = betterAuth({
  database: {
    db: db,
    type: 'sqlite',
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'default_secret_key_change_in_production_123',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    'https://snake-web.ipx12.workers.dev',
  ],
});

/**
 * Initialize database schema via Kysely Migrator and seed initial demo data.
 */
export async function initDb(): Promise<void> {
  try {
    await runMigrationsToLatest(db);
    await seedDemoUser(db);
    console.log('[Database Init] Migrations applied and demo user verified.');
    } catch (error) {
    console.error('[Database Init] Failed to run migrations or seed database:', error);
    throw error;
  }
}

