import { LocalStorageDb } from "./db";

const KEY_KEYNAME_STORE = "keyname-store";

/**
 * Persistent model for the naming of wallet keys.
 */
export type Keyname = {
  [pubkeyStr: string]: string;
};

export async function setKeyname(pubkey: string, name: string) {
  let keynames = await LocalStorageDb.get(KEY_KEYNAME_STORE);
  if (!keynames) {
    keynames = {};
  }
  keynames[pubkey] = name;
  await LocalStorageDb.set(KEY_KEYNAME_STORE, keynames);
}

export async function getKeyname(pubkey: string): Promise<string> {
  const names = await LocalStorageDb.get(KEY_KEYNAME_STORE);
  const name = names[pubkey];
  if (!name) {
    throw new Error(`unable to find name for key: ${pubkey.toString()}`);
  }
  return name;
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
