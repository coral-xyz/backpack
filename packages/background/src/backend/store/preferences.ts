import type { Preferences } from "@coral-xyz/common";

import { LocalStorageDb } from "./db";

const STORE_KEY_WALLET_DATA = "wallet-data";

export async function getWalletDataForUser(uuid: string): Promise<Preferences> {
  const data = await LocalStorageDb.get(key(uuid));
  if (data === undefined) {
    throw new Error("wallet data is undefined");
  }
  return data;
}

export async function setWalletDataForUser(uuid: string, data?: Preferences) {
  await LocalStorageDb.set(key(uuid), data);
}

function key(uuid: string): string {
  return `${STORE_KEY_WALLET_DATA}_${uuid}`;
}

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
export const DEFAULT_AGGREGATE_WALLETS = false;
