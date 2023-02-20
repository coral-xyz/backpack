import type {
  DeprecatedWalletDataDoNotUse,
  Preferences,
} from "@coral-xyz/common";

import { LocalStorageDb } from "./db";

const STORE_KEY_WALLET_DATA = "wallet-data";

export async function getWalletDataForUser(uuid: string): Promise<Preferences> {
  const data = await LocalStorageDb.get(key(uuid));
  if (data === undefined) {
    throw new Error(`wallet data for user ${uuid} is undefined`);
  }
  return data;
}

export async function setWalletDataForUser(uuid: string, data?: Preferences) {
  await LocalStorageDb.set(key(uuid), data);
}

export async function getWalletData_DEPRECATED(): Promise<
  DeprecatedWalletDataDoNotUse | undefined
> {
  const data = await LocalStorageDb.get(STORE_KEY_WALLET_DATA);
  return data;
}

export async function setWalletData_DEPRECATED(
  data: undefined | DeprecatedWalletDataDoNotUse
) {
  await LocalStorageDb.set(STORE_KEY_WALLET_DATA, data);
}

function key(uuid: string): string {
  return `${STORE_KEY_WALLET_DATA}_${uuid}`;
}
