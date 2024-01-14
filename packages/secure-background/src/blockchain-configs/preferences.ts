import type {
  Blockchain,
  BlockchainPreferences,
  Preferences,
} from "@coral-xyz/common";

import { getEnabledBlockchainConfigs } from "./blockchains";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
export const DEFAULT_AGGREGATE_WALLETS = false;
export const DEFAULT_AUTO_LOCK_INTERVAL_SECS = 10 * 60;

export function defaultPreferences(): Preferences {
  const blockchains = Object.fromEntries(
    Object.entries(getEnabledBlockchainConfigs()).map<
      [Blockchain, BlockchainPreferences]
    >(([blockchain, config]) => [
      blockchain as Blockchain,
      config.PreferencesDefault,
    ])
  );
  // @ts-ignore
  return {
    autoLockSettings: {
      seconds: DEFAULT_AUTO_LOCK_INTERVAL_SECS,
    },
    approvedOrigins: [],
    darkMode: true, //DEFAULT_DARK_MODE,
    developerMode: DEFAULT_DEVELOPER_MODE,
    aggregateWallets: DEFAULT_AGGREGATE_WALLETS,
    blockchains: {
      ...blockchains,
    },
  } as Preferences;
}
