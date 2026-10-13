import { runMigrationsToLatest, rollbackMigration } from '../migrator';
import { db } from '../auth';

const executeCliMigration = async () => {
  const targetAction = process.argv[2] || 'up';

  try {
    if (targetAction === 'down') {
      console.log('[CLI Migrations] Rolling back the latest migration...');
      await rollbackMigration(db);
    } else {
      console.log('[CLI Migrations] Applying pending migrations to latest...');
      await runMigrationsToLatest(db);
    }
    console.log('[CLI Migrations] Migration process completed successfully.');
    await db.destroy();
    process.exit(0);
  } catch (executionError) {
    console.error('[CLI Migrations] Migration failed:', executionError);
    await db.destroy();
    process.exit(1);
  }
};

executeCliMigration();
