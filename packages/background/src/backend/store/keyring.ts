import type { Blockchain, BlockchainKeyringJson } from "@coral-xyz/common";
import { getLogger } from "@coral-xyz/common";

import type { SecretPayload } from "../keyring/crypto";
import * as crypto from "../keyring/crypto";

import { migrate_0_2_0_510 } from "./migrations/migrate_0_2_0_510";
import { migrate_0_2_0_2408 } from "./migrations/migrate_0_2_0_2408";
import { LocalStorageDb } from "./db";
import { getMigration, setMigration } from "./migrations";

const KEY_KEYRING_STORE = "keyring-store";

const logger = getLogger("background/store/keyring");

/**
 * Persistent model for the keyring store json. This is encrypted and decrypted
 * before reading to/from local storage.
 */
export type KeyringStoreJson = {
  users: {
    [uuid: string]: UserKeyringJson;
  };
  lastUsedTs: number;
};

export type UserKeyringJson = {
  uuid: string;
  username: string;
  activeBlockchain: Blockchain;
  mnemonic?: string;
  blockchains: {
    [blockchain: string]: BlockchainKeyringJson;
  };
};

// The keyring store should only ever be accessed through this method.
export async function getKeyringStore(
  uuid: string,
  password: string
): Promise<KeyringStoreJson> {
  const json = await getKeyringStore_NO_MIGRATION(password);

  await runMigrationsIfNeeded(json, uuid, password);

  return json;
}

export async function getKeyringStore_NO_MIGRATION(password: string) {
  const ciphertextPayload = await getKeyringCiphertext();
  if (ciphertextPayload === undefined || ciphertextPayload === null) {
    throw new Error("keyring store not found on disk");
  }
  const plaintext = await crypto.decrypt(ciphertextPayload, password);
  const json = JSON.parse(plaintext);
  return json;
}

async function runMigrationsIfNeeded(
  json: KeyringStoreJson,
  uuid: string,
  password: string
) {
  const lastMigration = await getMigration();
  if (lastMigration !== undefined && lastMigration?.state !== "end") {
    logger.error("a previous migration failed, please re-install Backpack");
    throw new Error("migration failed, please re-install Backpack");
  }

  if ((await getMigration()) === undefined) {
    logger.debug("running migration 510");
    await setMigration({
      build: 510,
      state: "start",
    });
    await migrate_0_2_0_510(uuid, password);
    await setMigration({
      build: 510,
      state: "end",
    });
    logger.debug("migration 510 was a success");
  }
  if ((await getMigration())?.build === 510) {
    logger.debug("running migration 2408");
    await setMigration({
      build: 2408,
      state: "start",
    });
    await migrate_0_2_0_2408(json);
    await setMigration({
      build: 2408,
      state: "end",
    });
    logger.debug("migration 2408 was a success");
  }
}

export async function setKeyringStore(
  json: KeyringStoreJson,
  password: string
): Promise<void> {
  const plaintext = JSON.stringify(json);
  const ciphertext = await crypto.encrypt(plaintext, password!);
  await setKeyringCiphertext(ciphertext);
}

// Never call this externally. Only exported for migrations.
export async function getKeyringCiphertext(): Promise<SecretPayload> {
  return await LocalStorageDb.get(KEY_KEYRING_STORE);
}

async function setKeyringCiphertext(ciphertext: SecretPayload) {
  await LocalStorageDb.set(KEY_KEYRING_STORE, ciphertext);
}

export async function doesCiphertextExist(): Promise<boolean> {
  const ciphertext = await getKeyringCiphertext();
  return ciphertext !== undefined && ciphertext !== null;
}
