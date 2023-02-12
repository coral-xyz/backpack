import { LocalStorageDb } from "../db";

/**
 * Migrations are setup with two pieces of data.
 *
 * 1) The latest migration. This stores the build number for the last migration
 *    alongside its state.
 * 2) A linear log of all migrations ever executed for this local client.
 *    This is provided mostly for debugging purposes, as it maintains a
 *    history of all migration state transitions.
 */

const STORE_MIGRATION_KEY = "last-migration";
const STORE_MIGRATION_LOG_KEY = "migration-log";

export type Migration = {
  build: number;
  state: "start" | "end" | "finalized";
};

export async function getMigration(): Promise<Migration | undefined> {
  const data = await LocalStorageDb.get(STORE_MIGRATION_KEY);
  return data;
}

export async function setMigration(m: Migration) {
  await LocalStorageDb.set(STORE_MIGRATION_KEY, m);
  await pushMigrationLog(m);
}

async function getMigrationLog(): Promise<Array<Migration> | undefined> {
  return await LocalStorageDb.get(STORE_MIGRATION_LOG_KEY);
}

async function pushMigrationLog(m: Migration) {
  let log = await getMigrationLog();
  if (log === undefined) {
    log = [];
  }
  log.push(m);
  await LocalStorageDb.set(STORE_MIGRATION_LOG_KEY, m);
}
