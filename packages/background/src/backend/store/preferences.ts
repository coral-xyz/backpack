import type { BlockchainSettings } from "@coral-xyz/blockchain-common";
import { defaultSettingsForBlockchain } from "@coral-xyz/blockchain-common";
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
} & {
  [key in Blockchain]?: BlockchainSettings;
};

export async function getWalletData(): Promise<WalletData> {
  const data = await LocalStorageDb.get(STORE_KEY_WALLET_DATA);
  if (data === undefined) {
    throw new Error("wallet data is undefined");
  }
  // Migrating Solana `cluster` to `connectionUrl`
  if (data.solana && "cluster" in data.solana) {
    data.solana.connectionUrl = data.solana.cluster;
    delete data.cluster;
  }
  // Ensure default settings exist for all enabled blockchains
  if (data.enabledBlockchains) {
    for (const blockchain of data.enabledBlockchains) {
      if (!data[blockchain])
        data[blockchain] = defaultSettingsForBlockchain(
          blockchain as Blockchain
        );
    }
  }
  return data;
}

export async function setWalletData(data: WalletData) {
  await LocalStorageDb.set(STORE_KEY_WALLET_DATA, data);
}

export const DEFAULT_LOCK_INTERVAL_SECS = 15 * 60;
export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
