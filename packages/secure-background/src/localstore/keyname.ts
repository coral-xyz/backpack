import { LocalStorageDb } from "./db";

const KEY_KEYNAME_STORE = "keyname-store";

/**
 * Persistent model for the naming of wallet keys.
 */
export type Keyname = {
  [publicKeyStr: string]: string;
};

export async function setKeyname(publicKey: string, name: string) {
  let keynames = await LocalStorageDb.get(key());
  if (!keynames) {
    keynames = {};
  }
  keynames[publicKey] = name;
  await LocalStorageDb.set(KEY_KEYNAME_STORE, keynames);
}

export async function getKeyname(publicKey: string): Promise<string> {
  const names = await LocalStorageDb.get(key());
  const name = names[publicKey];
  if (!name) {
    throw Error(`unable to find name for key: ${publicKey.toString()}`);
  }
  return name;
}

function key() {
  return `${KEY_KEYNAME_STORE}`;
}

export const DefaultKeyname = {
  defaultDerived(index: number): string {
    return `Wallet ${index}`;
  },
  defaultImported(index: number): string {
    return `Imported Wallet ${index}`;
  },
  defaultLedger(index: number): string {
    return `Ledger ${index}`;
  },
};
