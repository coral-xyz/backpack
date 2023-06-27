import { BLOCKCHAIN_COMMON } from "./blockchains";
import type { Preferences } from "./types";
import { Blockchain } from "./types";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
export const DEFAULT_AGGREGATE_WALLETS = false;
export const DEFAULT_AUTO_LOCK_INTERVAL_SECS = 15 * 60;

export function defaultPreferences(): Preferences {
  const data = Object.fromEntries(
    new Map(
      Object.keys(BLOCKCHAIN_COMMON).map((blockchain) => [
        blockchain,
        BLOCKCHAIN_COMMON[blockchain].PreferencesDefault,
      ])
    )
  );
  // @ts-ignore
  return {
    autoLockSettings: {
      seconds: DEFAULT_AUTO_LOCK_INTERVAL_SECS,
      option: undefined,
    },
    approvedOrigins: [],
    darkMode: DEFAULT_DARK_MODE,
    developerMode: DEFAULT_DEVELOPER_MODE,
    aggregateWallets: DEFAULT_AGGREGATE_WALLETS,
    ...data,
  } as Preferences;
}
