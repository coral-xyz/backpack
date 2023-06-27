import type { EclipseData, EthereumData,SolanaData } from "../";
import { EthereumConnectionUrl } from "../ethereum/connection-url";
import { EthereumExplorer } from "../ethereum/explorer";
import { SolanaCluster } from "../solana/cluster";
import { SolanaExplorer } from "../solana/explorer";
import { Blockchain  } from "../";

export const BLOCKCHAIN_COMMON: Record<
  Blockchain,
  {
    PreferencesDefault: SolanaData | EclipseData | EthereumData;
  }
> = {
  [Blockchain.ETHEREUM]: {
    PreferencesDefault: {
      explorer: EthereumExplorer.DEFAULT,
      connectionUrl: EthereumConnectionUrl.DEFAULT,
      chainId: "", // TODO(peter) default chainId?
    },
  },
  [Blockchain.SOLANA]: {
    PreferencesDefault: {
      explorer: SolanaExplorer.DEFAULT,
      cluster: SolanaCluster.DEFAULT,
      commitment: "confirmed",
    },
  },
  [Blockchain.ECLIPSE]: {
    PreferencesDefault: {
      explorer: "https://api.injective.eclipsenetwork.xyz:8899/",
      cluster: SolanaCluster.DEFAULT,
      commitment: "confirmed",
    },
  },
};
