import { type Kysely, sql } from 'kysely';

export async function up(database: Kysely<unknown>): Promise<void> {
  // Ensure SQLite concurrency settings
  await sql`PRAGMA journal_mode = WAL;`.execute(database);
  await sql`PRAGMA busy_timeout = 5000;`.execute(database);

  // 1. User table (Better Auth core)
  await database.schema
    .createTable('user')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull().unique())
    .addColumn('emailVerified', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('image', 'text')
    .addColumn('role', 'text', (col) => col.notNull().defaultTo('user'))
    .addColumn('createdAt', 'integer', (col) => col.notNull())
    .addColumn('updatedAt', 'integer', (col) => col.notNull())
    .execute();

  // 2. Session table (Better Auth sessions)
  await database.schema
    .createTable('session')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('expiresAt', 'integer', (col) => col.notNull())
    .addColumn('token', 'text', (col) => col.notNull().unique())
    .addColumn('createdAt', 'integer', (col) => col.notNull())
    .addColumn('updatedAt', 'integer', (col) => col.notNull())
    .addColumn('ipAddress', 'text')
    .addColumn('userAgent', 'text')
    .addColumn('userId', 'text', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .execute();

  // 3. Account table (Better Auth authentication providers & passwords)
  await database.schema
    .createTable('account')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('accountId', 'text', (col) => col.notNull())
    .addColumn('providerId', 'text', (col) => col.notNull())
    .addColumn('userId', 'text', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('accessToken', 'text')
    .addColumn('refreshToken', 'text')
    .addColumn('idToken', 'text')
    .addColumn('accessTokenExpiresAt', 'integer')
    .addColumn('refreshTokenExpiresAt', 'integer')
    .addColumn('scope', 'text')
    .addColumn('password', 'text')
    .addColumn('createdAt', 'integer', (col) => col.notNull())
    .addColumn('updatedAt', 'integer', (col) => col.notNull())
    .execute();

  // 4. Verification table (Better Auth email/token verification)
  await database.schema
    .createTable('verification')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('identifier', 'text', (col) => col.notNull())
    .addColumn('value', 'text', (col) => col.notNull())
    .addColumn('expiresAt', 'integer', (col) => col.notNull())
    .addColumn('createdAt', 'integer')
    .addColumn('updatedAt', 'integer')
    .execute();

  // 5. Task table (Application tasks)
  await database.schema
    .createTable('task')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('completed', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('userId', 'text', (col) =>
      col.notNull().references('user.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'text', (col) => col.notNull())
    .execute();

  // 6. Performance indices for foreign keys and lookup queries
  await database.schema
    .createIndex('idx_session_userId')
    .ifNotExists()
    .on('session')
    .column('userId')
    .execute();

  await database.schema
    .createIndex('idx_task_userId')
    .ifNotExists()
    .on('task')
    .column('userId')
    .execute();
}

export async function down(database: Kysely<unknown>): Promise<void> {
  await database.schema.dropIndex('idx_task_userId').ifExists().execute();
  await database.schema.dropIndex('idx_session_userId').ifExists().execute();
  await database.schema.dropTable('task').ifExists().execute();
  await database.schema.dropTable('verification').ifExists().execute();
  await database.schema.dropTable('account').ifExists().execute();
  await database.schema.dropTable('session').ifExists().execute();
  await database.schema.dropTable('user').ifExists().execute();
}
