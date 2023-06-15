import { BACKPACK_CONFIG_VERSION, getLogger } from "@coral-xyz/common";

import type { SecureDB, SecureStore } from "../../SecureStore";
import type { SecretPayload } from "../crypto";

import { migrate_0_2_0_510 } from "./migrate_0_2_0_510";
import { migrate_0_2_0_2408 } from "./migrate_0_2_0_2408";

const logger = getLogger("background/migrations");

/**
 * Entrypoint to migrations. This function itself is idempotent. However,
 * we make no guarantee that the migration itself succeeds. If it does not,
 * we will detect it and throw an error, in which case it's expected for the
 * user to reonboard.
 *
 * Steps to add a new migration:
 *
 *   - update the LATEST_MIGRATION_BUILD number
 *   - append a new `runMigration` function in the block of code below,
 *     with the migration build number dependent on the previous one.
 */
export async function runMigrationsIfNeeded(
  userInfo: {
    uuid: string;
    password: string;
  },
  store: SecureStore,
  db: SecureDB,
  unsafeGetKeyringCiphertext: () => Promise<SecretPayload>
) {
  try {
    await _runMigrationsIfNeeded(
      userInfo,
      store,
      db,
      unsafeGetKeyringCiphertext
    );
  } catch (err) {
    // Note: the UI currently assumes this string format.
    throw new Error(`migration failed: ${err.toString()}`);
  }
}

async function _runMigrationsIfNeeded(
  userInfo: {
    uuid: string;
    password: string;
  },
  store: SecureStore,
  db: SecureDB,
  unsafeGetKeyringCiphertext: () => Promise<SecretPayload>
) {
  const LATEST_MIGRATION_BUILD = 2408; // Update this everytime a migration is added.
  const lastMigration = await getMigration(db);

  logger.debug("starting migrations with last migration", lastMigration);
  if (BACKPACK_CONFIG_VERSION === "development") {
    const migrationLog = await getMigrationLog(db);
    logger.debug("migration log:", migrationLog);
  }

  //
  // If we've already migrated to the latest build, then exit.
  //
  if (
    lastMigration?.state === "finalized" &&
    lastMigration?.build === LATEST_MIGRATION_BUILD
  ) {
    logger.debug("already migrated, early exit");
    return;
  }

  //
  // If a migration step terminated early, then we're in a corrupt state, so
  // exit with an error.
  //
  if (lastMigration !== undefined && lastMigration?.state === "start") {
    throw new Error("migration failed, please re-install Backpack");
  }

  logger.debug("running all migrations");

  //
  // Execute all migrations, if needed.
  //
  // Note that the conditional for the first migration is unique because
  // there was not previously a migration storage field. And so we hack together
  // the condition with fields we know to be true. All other migrations
  // are simply dependent on the last migration being the previous one.
  //
  if (
    lastMigration === undefined &&
    (await store.getWalletData_DEPRECATED()) !== undefined
  ) {
    await runMigration(510, db, async () => {
      await migrate_0_2_0_510(userInfo, store, unsafeGetKeyringCiphertext);
    });
  }
  if ((await getMigration(db))?.build === 510) {
    await runMigration(2408, db, async () => {
      await migrate_0_2_0_2408(userInfo, store);
    });
  }

  //
  // Set the last migration as finalized.
  //
  const finalMigration = await getMigration(db);
  if (
    finalMigration === undefined ||
    finalMigration?.build !== LATEST_MIGRATION_BUILD ||
    finalMigration?.state !== "finalized"
  ) {
    await setMigration(
      {
        build: LATEST_MIGRATION_BUILD,
        state: "finalized",
      },
      db
    );
  }

  if (BACKPACK_CONFIG_VERSION === "development") {
    const migrationLog = await getMigrationLog(db);
    logger.debug("migration log:", migrationLog);
  }
  logger.debug("migration success");
}

async function runMigration(
  build: number,
  db: SecureDB,
  fn: () => Promise<void>
) {
  logger.debug(`running migration ${build}`);
  await setMigration(
    {
      build,
      state: "start",
    },
    db
  );
  await fn();
  await setMigration(
    {
      build,
      state: "end",
    },
    db
  );
  logger.debug(`migration ${build} was a success`);
}

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

type Migration = {
  build: number;
  state: "start" | "end" | "finalized";
};

async function getMigration(db: SecureDB): Promise<Migration | undefined> {
  const data = await db.get(STORE_MIGRATION_KEY);
  return data;
}

async function setMigration(m: Migration, db: SecureDB) {
  await db.set(STORE_MIGRATION_KEY, m);
  await pushMigrationLog(m, db);
}

async function getMigrationLog(
  db: SecureDB
): Promise<Array<Migration> | undefined> {
  return await db.get(STORE_MIGRATION_LOG_KEY);
}

async function pushMigrationLog(m: Migration, db: SecureDB) {
  let log = await getMigrationLog(db);
  if (log === undefined) {
    log = [];
  }
  log.push(m);
  await db.set(STORE_MIGRATION_LOG_KEY, log);
}
