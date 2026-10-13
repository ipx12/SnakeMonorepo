import { seedDemoUser } from '../seed';
import { db } from '../auth';

const executeCliSeed = async () => {
  try {
    console.log('[CLI Seed] Seeding demo admin account...');
    await seedDemoUser(db);
    console.log('[CLI Seed] Seeding completed.');
    await db.destroy();
    process.exit(0);
  } catch (seedError) {
    console.error('[CLI Seed] Seeding failed:', seedError);
    await db.destroy();
    process.exit(1);
  }
};

executeCliSeed();
