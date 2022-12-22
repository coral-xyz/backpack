import type { Blockchain } from "@coral-xyz/common";
import type { Commitment } from "@solana/web3.js";

import { LocalStorageDb } from "./db";

const STORE_KEY_WALLET_DATA = "wallet-data";

/**
 * Persistent model for user preferences.
 *
 * Note: this data is not encrypted on the client.
 */

// Legacy types. Don't use these.
type DeprecatedWalletDataDoNotUse = {
  username?: string;
  autoLockSecs?: number; // Used in releases <=0.4.0
};

export type WalletData = {
  autoLockSettings: {
    seconds?: number;
    option?: string;
  };
  approvedOrigins: Array<string>;
  enabledBlockchains: Array<Blockchain>;
  darkMode: boolean;
  developerMode: boolean;
  solana: SolanaData;
  ethereum?: EthereumData;
} & DeprecatedWalletDataDoNotUse;

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

export async function getWalletDataForUser(uuid: string): Promise<WalletData> {
  const data = await LocalStorageDb.get(key(uuid));
  if (data === undefined) {
    throw new Error("wallet data is undefined");
  }
  return data;
}

export async function setWalletDataForUser(uuid: string, data?: WalletData) {
  await LocalStorageDb.set(key(uuid), data);
}

function key(uuid: string): string {
  return `${STORE_KEY_WALLET_DATA}_${uuid}`;
}

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
