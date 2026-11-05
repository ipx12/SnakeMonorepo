import { DatabaseSchema } from '@snake/types';
import { sql, type Kysely } from 'kysely';
import { db, auth } from './auth';

export const seedDemoUser = async (databaseInstance?: Kysely<DatabaseSchema>): Promise<void> => {
  const targetDatabase = databaseInstance || db;
  try {
    const existingUserResult = await sql<{ id: string }>`
      SELECT id FROM user WHERE email = 'demo@watermelon.ui'
    `.execute(targetDatabase);

    if (!existingUserResult.rows.length) {
      await auth.api.signUpEmail({
        body: {
          email: 'demo@watermelon.ui',
          password: 'password123',
          name: 'Demo Admin',
        },
      });
      await sql`
        UPDATE user SET role = 'admin' WHERE email = 'demo@watermelon.ui'
      `.execute(targetDatabase);
      console.log('[Database Seed] Created demo admin user (demo@watermelon.ui / password123).');
    } else {
      await sql`
        UPDATE user SET role = 'admin' WHERE email = 'demo@watermelon.ui'
      `.execute(targetDatabase);
      console.log('[Database Seed] Verified demo admin user role.');
    }
  } catch (seedError) {
    console.error('[Database Seed] Failed to seed demo user:', seedError);
  }
};
