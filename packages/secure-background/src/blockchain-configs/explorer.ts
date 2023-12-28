import { EthereumExplorer } from "./ethereum/explorer";
import { SolanaCluster } from "./solana/cluster";
import { SolanaExplorer } from "./solana/explorer";

export function explorerUrl(
  base: string,
  tx: string,
  connectionUrl: string
): string {
  switch (base) {
    case EthereumExplorer.ETHERSCAN:
      return join(EthereumExplorer.ETHERSCAN, `tx/${tx}`);
    case SolanaExplorer.SOLANA_EXPLORER:
      return join(
        SolanaExplorer.SOLANA_EXPLORER,
        `tx/${tx}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLSCAN:
      return join(
        SolanaExplorer.SOLSCAN,
        `tx/${tx}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_BEACH:
      return join(
        SolanaExplorer.SOLANA_BEACH,
        `transaction/${tx}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_FM:
      return join(
        SolanaExplorer.SOLANA_FM,
        `tx/${tx}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.XRAY:
      return join(
        SolanaExplorer.XRAY,
        `tx/${tx}${clusterSuffix(base, connectionUrl)}`
      );
    default:
      throw new Error("unknown explorer base");
  }
}
// returns explorer url to explore addresses
export function exploreAddressUrl(
  base: string,
  address: string,
  connectionUrl: string
): string {
  switch (base) {
    case EthereumExplorer.ETHERSCAN:
      return join(EthereumExplorer.ETHERSCAN, `address/${address}`);
    case SolanaExplorer.SOLANA_EXPLORER:
      return join(
        SolanaExplorer.SOLANA_EXPLORER,
        `address/${address}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLSCAN:
      return join(
        SolanaExplorer.SOLSCAN,
        `account/${address}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_BEACH:
      return join(
        SolanaExplorer.SOLANA_BEACH,
        `address/${address}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_FM:
      return join(
        SolanaExplorer.SOLANA_FM,
        `address/${address}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.XRAY:
      return join(
        SolanaExplorer.XRAY,
        `account/${address}${clusterSuffix(base, connectionUrl)}`
      );
    default:
      throw new Error("unknown explorer base");
  }
}

export function explorerCompressedNftUrl(address: string): string {
  return `https://xray.helius.xyz/token/${address}`;
}

// Returns the explorer url to display the given nft.
export function explorerNftUrl(
  base: string,
  nft: string,
  connectionUrl: string
): string {
  switch (base) {
    case EthereumExplorer.ETHERSCAN:
      return join(EthereumExplorer.ETHERSCAN, `address/${nft}`);
    case SolanaExplorer.SOLANA_EXPLORER:
      return join(
        SolanaExplorer.SOLANA_EXPLORER,
        `address/${nft}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLSCAN:
      return join(
        SolanaExplorer.SOLSCAN,
        `address/${nft}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_BEACH:
      return join(
        SolanaExplorer.SOLANA_BEACH,
        `address/${nft}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_FM:
      return join(
        SolanaExplorer.SOLANA_FM,
        `address/${nft}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.XRAY:
      return join(
        SolanaExplorer.XRAY,
        `token/${nft}${clusterSuffix(base, connectionUrl)}`
      );
    default:
      throw new Error("unknown explorer base");
  }
}

/**
 * Returns the cluster search params required by each explorer.
 */
function clusterSuffix(base: string, connectionUrl: string): string {
  switch (base) {
    case SolanaExplorer.SOLANA_EXPLORER:
    case SolanaExplorer.SOLSCAN:
    case SolanaExplorer.SOLANA_FM:
    case SolanaExplorer.SOLANA_BEACH:
    case SolanaExplorer.XRAY:
      switch (connectionUrl) {
        case SolanaCluster.MAINNET:
          return "?cluster=mainnet";
        case SolanaCluster.DEVNET:
          return "?cluster=devnet";
        default:
          return `?cluster=custom&customUrl=${encodeURIComponent(
            connectionUrl
          )}`;
      }
    default:
      throw new Error("unknown explorer base");
  }
}

const join = (...args: Array<string>) => args.join("/");
