import type { Commitment } from "@solana/web3.js";
import { LocalStorageDb } from "./db";

const STORE_KEY_WALLET_DATA = "wallet-data";

/**
 * Persistent model for user preferences.
 */
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

export async function getWalletData(): Promise<WalletData> {
  const data = await LocalStorageDb.get(STORE_KEY_WALLET_DATA);
  if (data === undefined) {
    throw new Error("wallet data is undefined");
  }
  return data;
}

export async function setWalletData(data: WalletData) {
  await LocalStorageDb.set(STORE_KEY_WALLET_DATA, data);
}

export const DEFAULT_LOCK_INTERVAL_SECS = 15 * 60;
