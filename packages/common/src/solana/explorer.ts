import { SolanaCluster } from "./cluster";

export const SolanaExplorer = {
  SOLANA_EXPLORER: "https://explorer.solana.com",
  SOLSCAN: "https://solscan.io",
  SOLANA_BEACH: "https://solanabeach.io",
  SOLANA_FM: "https://solana.fm",

  DEFAULT: "https://solscan.io",
};

export function explorerUrl(base: string, tx: string, cluster: string): string {
  switch (base) {
    case SolanaExplorer.SOLANA_EXPLORER:
      return join(
        SolanaExplorer.SOLANA_EXPLORER,
        `tx/${tx}${clusterSuffix(base, cluster)}`
      );
    case SolanaExplorer.SOLSCAN:
      return join(
        SolanaExplorer.SOLSCAN,
        `tx/${tx}${clusterSuffix(base, cluster)}`
      );
    case SolanaExplorer.SOLANA_BEACH:
      return join(
        SolanaExplorer.SOLANA_BEACH,
        `transaction/${tx}${clusterSuffix(base, cluster)}`
      );
    case SolanaExplorer.SOLANA_FM:
      return join(
        SolanaExplorer.SOLANA_FM,
        `tx/${tx}${clusterSuffix(base, cluster)}`
      );
    default:
      throw new Error("unknown explorer base");
  }
}

/**
 * Returns the cluster search params required by each explorer.
 */
function clusterSuffix(base: string, cluster: string): string {
  switch (base) {
    case SolanaExplorer.SOLANA_EXPLORER:
    case SolanaExplorer.SOLSCAN:
    case SolanaExplorer.SOLANA_FM:
    case SolanaExplorer.SOLANA_BEACH:
      switch (cluster) {
        case SolanaCluster.MAINNET:
          return "?cluster=mainnet";
        case SolanaCluster.DEVNET:
          return "?cluster=devnet";
        case SolanaCluster.LOCALNET:
          return "?cluster=localnet";
        default:
          return `?cluster=custom&${encodeURIComponent(base)}`;
      }
    default:
      throw new Error("unknown explorer base");
  }
}

const join = (...args: Array<string>) => args.join("/");
