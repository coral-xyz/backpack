import { LocalStorageDb } from "../db";

/**
 * Stores the build number for the last migration.
 */

const STORE_MIGRATION_KEY = "last-migration";

export type Migration = {
  build: number;
  state: "start" | "end";
};

export async function getMigration(): Promise<Migration | undefined> {
  const data = await LocalStorageDb.get(STORE_MIGRATION_KEY);
  return data;
}

export async function setMigration(m: Migration) {
  await LocalStorageDb.set(STORE_MIGRATION_KEY, m);
}
