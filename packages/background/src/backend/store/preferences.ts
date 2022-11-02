import type { Commitment } from "@solana/web3.js";
import type { Blockchain } from "@coral-xyz/common";
import { LocalStorageDb } from "./db";

const STORE_KEY_WALLET_DATA = "wallet-data";

/**
 * Persistent model for user preferences.
 */
export type WalletData = {
  username?: string;
  autoLockSecs: number;
  approvedOrigins: Array<string>;
  enabledBlockchains: Array<Blockchain>;
  darkMode: boolean;
  developerMode: boolean;
  solana: SolanaData;
  ethereum?: EthereumData;
};

type SolanaData = {
  explorer: string;
  commitment: Commitment;
  cluster: string;
};

type EthereumData = {
  explorer?: string;
  connectionUrl?: string;
  chainId?: string;
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
export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
