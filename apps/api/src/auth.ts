import { betterAuth } from 'better-auth';
import { Kysely, sql } from 'kysely';
import { LibsqlDialect } from '@libsql/kysely-libsql';
import { DatabaseSchema } from '@snake/types';

export const db = new Kysely<DatabaseSchema>({
  dialect: new LibsqlDialect({
    url: 'file:sqlite.db',
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
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
});

// Auto-initialize required Better Auth tables and seed demo user in SQLite
export async function initDb() {
  try {
    // Enable WAL mode for better concurrency and prevent SQLITE_BUSY
    await sql`PRAGMA journal_mode = WAL;`.execute(db);
    await sql`PRAGMA busy_timeout = 5000;`.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        emailVerified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
    `.execute(db);

    try {
      await sql`ALTER TABLE user ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`.execute(db);
    } catch {
      // Column already exists
    }

    await sql`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        expiresAt INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        ipAddress TEXT,
        userAgent TEXT,
        userId TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      );
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        accountId TEXT NOT NULL,
        providerId TEXT NOT NULL,
        userId TEXT NOT NULL,
        accessToken TEXT,
        refreshToken TEXT,
        idToken TEXT,
        accessTokenExpiresAt INTEGER,
        refreshTokenExpiresAt INTEGER,
        scope TEXT,
        password TEXT,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      );
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expiresAt INTEGER NOT NULL,
        createdAt INTEGER,
        updatedAt INTEGER
      );
    `.execute(db);

    await sql`
      CREATE TABLE IF NOT EXISTS task (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER NOT NULL DEFAULT 0,
        userId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
      );
    `.execute(db);

    // Performance indices for foreign keys and queries
    await sql`CREATE INDEX IF NOT EXISTS idx_task_userId ON task(userId);`.execute(db);
    await sql`CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);`.execute(db);

    // Migration helper: copy any rows from legacy 'item' table to 'task' if 'item' exists
    try {
      await sql`INSERT OR IGNORE INTO task SELECT * FROM item`.execute(db);
    } catch {
      // Legacy item table does not exist or already migrated
    }

    console.log('[Better Auth] Database schema and performance indices verified successfully.');

    // Seed demo user if it doesn't exist yet
    const existingUser = await sql`SELECT id FROM user WHERE email = 'demo@watermelon.ui'`.execute(db);
    if (!existingUser.rows.length) {
      await auth.api.signUpEmail({
        body: {
          email: 'demo@watermelon.ui',
          password: 'password123',
          name: 'Demo Admin',
          role: 'admin',
        },
      });
      console.log('[Better Auth] Pre-created demo admin user (demo@watermelon.ui / password123).');
    } else {
      await sql`UPDATE user SET role = 'admin' WHERE email = 'demo@watermelon.ui'`.execute(db);
    }
  } catch (err) {
    console.error('[Better Auth] Failed to initialize database schema or seed demo user:', err);
  }
}
