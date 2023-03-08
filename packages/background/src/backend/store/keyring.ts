import type { Blockchain, BlockchainKeyringJson } from "@coral-xyz/common";

import type { SecretPayload } from "../keyring/crypto";
import * as crypto from "../keyring/crypto";

import { LocalStorageDb } from "./db";
import { runMigrationsIfNeeded } from "./migrations";

const KEY_KEYRING_STORE = "keyring-store";

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
//
// Note: this method reserves the right to mutate `userInfo`. This is required
//       for example, for the 510 migration, where a UUID doesn't exist and
//       so the migration needs to get and fetch it--and set it on the
//       `userInfo` object for use elsewhere.
export async function getKeyringStore(userInfo: {
  uuid: string;
  password: string;
}): Promise<KeyringStoreJson> {
  await runMigrationsIfNeeded(userInfo);
  const json = await getKeyringStore_NO_MIGRATION(userInfo.password);
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
