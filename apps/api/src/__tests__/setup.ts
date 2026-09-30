import { runMigrationsToLatest } from '../migrator';
import { db } from '../auth';
import { beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';

beforeAll(async () => {
  await runMigrationsToLatest(db);
});

afterAll(async () => {
  await db.destroy();
  if (process.env.NODE_ENV === 'test' && fs.existsSync('test.db')) {
    try {
      fs.unlinkSync('test.db');
    } catch {
      // Ignore if locked
    }
  }
});
