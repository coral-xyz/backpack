import type { BlockchainPreferences, Preferences } from "@coral-xyz/common";
import { Blockchain, DEFAULT_IPFS_GATEWAYS } from "@coral-xyz/common";
import { getEnabledBlockchainConfigs } from "./blockchains";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
export const DEFAULT_AGGREGATE_WALLETS = false;
export const DEFAULT_AUTO_LOCK_INTERVAL_SECS = 10 * 60;
export const DEFAULT_GATEWAY = DEFAULT_IPFS_GATEWAYS[0];
export const DEFAULT_ENABLED_WEB_DNS_RESOLUTION_NETWORKS = Object.values(
  Blockchain
).reduce((acc, blockchain) => {
  // disable all by default
  acc[blockchain] = false;
  return acc;
}, {} as Record<Blockchain, boolean>);

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
    webDnsResolutionGateway: {
      ipfsGateway: DEFAULT_GATEWAY,
      supportedWebDNSNetwork: DEFAULT_ENABLED_WEB_DNS_RESOLUTION_NETWORKS,
    },
  } as Preferences;
}
