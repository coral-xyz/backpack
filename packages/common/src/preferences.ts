import { DEFAULT_IPFS_GATEWAYS } from "./constants";
import { EthereumConnectionUrl, EthereumExplorer } from "./ethereum";
import { SolanaCluster, SolanaExplorer } from "./solana";
import type { Blockchain, Preferences } from "./types";

export const DEFAULT_DARK_MODE = false;
export const DEFAULT_DEVELOPER_MODE = false;
export const DEFAULT_AGGREGATE_WALLETS = false;
export const DEFAULT_AUTO_LOCK_INTERVAL_SECS = 15 * 60;
export const DEFAULT_GATEWAY = DEFAULT_IPFS_GATEWAYS[0];

export function defaultPreferences(): Preferences {
  return {
    autoLockSettings: {
      seconds: DEFAULT_AUTO_LOCK_INTERVAL_SECS,
      option: undefined,
    },
    approvedOrigins: [],
    darkMode: DEFAULT_DARK_MODE,
    developerMode: DEFAULT_DEVELOPER_MODE,
    ipfsGateway: DEFAULT_GATEWAY,
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
