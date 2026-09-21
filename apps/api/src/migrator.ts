import { Migrator, type Migration, type MigrationProvider } from 'kysely/migration';
import type { Kysely } from 'kysely';
import { db } from './auth';
import * as migration001 from './migrations/001_initial_schema';

/**
 * Static registry of all migrations.
 * This guarantees reliable execution across operating systems (preventing Windows ESM path issues),
 * provides compile-time TypeScript type safety, and works out of the box in both tsx and compiled dist.
 */
export const migrations: Record<string, Migration> = {
  '001_initial_schema': migration001,
};

export class StaticMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return migrations;
  }
}

export const createMigrator = (databaseInstance?: Kysely<any>) => {
  const targetDatabase = databaseInstance || db;
  return new Migrator({
    db: targetDatabase,
    provider: new StaticMigrationProvider(),
  });
};

export const runMigrationsToLatest = async (databaseInstance?: Kysely<any>): Promise<void> => {
  const migrator = createMigrator(databaseInstance);
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((migrationResult) => {
    if (migrationResult.status === 'Success') {
      console.log(`[Kysely Migrator] Migration "${migrationResult.migrationName}" applied successfully.`);
    } else if (migrationResult.status === 'Error') {
      console.error(`[Kysely Migrator] Migration "${migrationResult.migrationName}" failed.`);
    }
  });

  if (error) {
    console.error('[Kysely Migrator] Failed to apply migrations to latest:', error);
    throw error;
  }
};

export const rollbackMigration = async (databaseInstance?: Kysely<any>): Promise<void> => {
  const migrator = createMigrator(databaseInstance);
  const { error, results } = await migrator.migrateDown();

  results?.forEach((migrationResult) => {
    if (migrationResult.status === 'Success') {
      console.log(`[Kysely Migrator] Reverted migration "${migrationResult.migrationName}".`);
    } else if (migrationResult.status === 'Error') {
      console.error(`[Kysely Migrator] Failed to revert "${migrationResult.migrationName}".`);
    }
  });

  if (error) {
    console.error('[Kysely Migrator] Rollback error:', error);
    throw error;
  }
};
