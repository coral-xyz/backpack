import type { Commitment } from "@solana/web3.js";
import { BrowserRuntimeCommon } from "@coral-xyz/common";

const KEY_WALLET_DATA = "wallet-data";

// Persistent metadata for the UI shared across all networks.
export type WalletData = {
  autoLockSecs: number;
  approvedOrigins: Array<string>;
  darkMode: boolean;
  solana: SolanaData;
};

type SolanaData = {
  explorer: string;
  commitment: Commitment;
};

export class LocalStorageDb {
  static async get(key: string): Promise<any> {
    return await BrowserRuntimeCommon.getLocalStorage(key);
  }

  static async set(key: string, value: any): Promise<void> {
    await BrowserRuntimeCommon.setLocalStorage(key, value);
  }

  static async reset(): Promise<void> {
    await BrowserRuntimeCommon.clearLocalStorage();
  }
}

export async function getWalletData(): Promise<WalletData> {
  const data = await LocalStorageDb.get(KEY_WALLET_DATA);
  if (data === undefined) {
    throw new Error("wallet data is undefined");
  }
  return data;
}

export async function setWalletData(data: WalletData) {
  await LocalStorageDb.set(KEY_WALLET_DATA, data);
}
