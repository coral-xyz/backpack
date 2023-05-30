import { LocalStorageDb } from "./db";

const KEY_IS_COLD_STORE = "is-cold-store";

/**
 * Persistent model for the naming of wallet keys.
 */
export type IsColdKeys = {
  [publicKeyStr: string]: boolean;
};

export async function setIsCold(publicKey: string, isCold?: boolean) {
  let keynames = await LocalStorageDb.get(key());
  if (!keynames) {
    keynames = {};
  }
  keynames[publicKey] = isCold;
  await LocalStorageDb.set(KEY_IS_COLD_STORE, keynames);
}

export async function getIsCold(publicKey: string): Promise<boolean> {
  const isColdKeys = await LocalStorageDb.get(key());
  const isCold = isColdKeys?.[publicKey];
  if (!isCold) {
    return false;
  }
  return isCold;
}

function key() {
  return `${KEY_IS_COLD_STORE}`;
}
