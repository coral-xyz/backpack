import type { BlockchainKeyringJson } from "@coral-xyz/common";

import type { SecretPayload } from "../keyring/crypto";
import * as crypto from "../keyring/crypto";

import { LocalStorageDb } from "./db";

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
  mnemonic?: string;
  blockchains: {
    [key: string]: BlockchainKeyringJson;
  };
};

// The keyring store should only ever be accessed through this method.
export async function getKeyringStore(
  password: string
): Promise<KeyringStoreJson> {
  const ciphertextPayload = await getKeyringCiphertext();
  if (ciphertextPayload === undefined || ciphertextPayload === null) {
    throw new Error("keyring store not found on disk");
  }
  const plaintext = await crypto.decrypt(ciphertextPayload, password);
  const json = JSON.parse(plaintext);

  if (json.usernames) {
    return json;
  }

  //
  // Migrate user from single username -> multi username account management.
  //
  // TODO.

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

async function getKeyringCiphertext(): Promise<SecretPayload> {
  return await LocalStorageDb.get(KEY_KEYRING_STORE);
}

async function setKeyringCiphertext(ciphertext: SecretPayload) {
  await LocalStorageDb.set(KEY_KEYRING_STORE, ciphertext);
}

export async function doesCiphertextExist(): Promise<boolean> {
  const ciphertext = await getKeyringCiphertext();
  return ciphertext !== undefined && ciphertext !== null;
}
