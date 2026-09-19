import { betterAuth } from 'better-auth';
import { Kysely } from 'kysely';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { DatabaseSchema } from '@snake/types';
import { runMigrationsToLatest } from './migrator';
import { seedDemoUser } from './seed';

export const db = new Kysely<DatabaseSchema>({
  dialect: new LibsqlDialect({
    url: process.env.DATABASE_URL || 'file:sqlite.db',
  }),
});

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
        input: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || 'default_secret_key_change_in_production_123',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
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

