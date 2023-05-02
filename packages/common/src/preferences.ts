import { DEFAULT_IPFS_GATEWAYS } from "./constants";
import { EthereumConnectionUrl, EthereumExplorer } from "./ethereum";
import { SolanaCluster, SolanaExplorer } from "./solana";
import type { Preferences } from "./types";
import { Blockchain } from "./types";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
export const DEFAULT_AGGREGATE_WALLETS = false;
export const DEFAULT_AUTO_LOCK_INTERVAL_SECS = 15 * 60;
export const DEFAULT_GATEWAY = DEFAULT_IPFS_GATEWAYS[0];
export const DEFAULT_ENABLED_WEB_DNS_RESOLUTION_NETWORKS = Object.values(
  Blockchain
).reduce((acc, blockchain) => {
  acc[blockchain] = false;
  return acc;
}, {} as Record<Blockchain, boolean>);

export function defaultPreferences(): Preferences {
  return {
    autoLockSettings: {
      seconds: DEFAULT_AUTO_LOCK_INTERVAL_SECS,
      option: undefined,
    },
    approvedOrigins: [],
    darkMode: DEFAULT_DARK_MODE,
    developerMode: DEFAULT_DEVELOPER_MODE,
    websiteDNSResolution: {
      ipfsGateway: DEFAULT_GATEWAY,
      supportedWebDNSNetwork: DEFAULT_ENABLED_WEB_DNS_RESOLUTION_NETWORKS,
    },
    aggregateWallets: DEFAULT_AGGREGATE_WALLETS,
    solana: {
      explorer: SolanaExplorer.DEFAULT,
      cluster: SolanaCluster.DEFAULT,
      commitment: "confirmed",
    },
    ethereum: {
      explorer: EthereumExplorer.DEFAULT,
      connectionUrl: EthereumConnectionUrl.DEFAULT,
      chainId: "", // TODO(peter) default chainId?
    },
  };
}
