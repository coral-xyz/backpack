import type { SecretPayload } from "../keyring/crypto";
import { LocalStorageDb } from "./db";

const KEY_KEYRING_STORE = "keyring-store";

/**
 * Persist model for the encrypted keyring.
 */
export type EncryptedKeyring = SecretPayload;

export async function getEncryptedKeyring(): Promise<EncryptedKeyring> {
  return await LocalStorageDb.get(KEY_KEYRING_STORE);
}

export async function setEncryptedKeyring(ciphertext: EncryptedKeyring) {
  await LocalStorageDb.set(KEY_KEYRING_STORE, ciphertext);
}
