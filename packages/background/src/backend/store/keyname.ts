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
    // TODO figure out why name for wallet disappeared
    console.warn(`unable to find name for key: ${publicKey.toString()}`);
    return "";
  }
  return name;
}

function key() {
  return `${KEY_KEYNAME_STORE}`;
}

export const DefaultKeyname = {
  defaultDerived(accountIndex: number): string {
    return `Wallet ${accountIndex + 1}`;
  },
  defaultImported(accountIndex: number): string {
    return `Imported Wallet ${accountIndex + 1}`;
  },
  defaultLedger(accountIndex: number): string {
    return `Ledger ${accountIndex + 1}`;
  },
};
