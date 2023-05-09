import { EthereumExplorer } from "./ethereum";
import { SolanaCluster, SolanaExplorer } from "./solana";

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

// Returns the explorer url to display the given nft.
export function explorerNftUrl(
  base: string,
  nft: any,
  connectionUrl: string
): string {
  switch (base) {
    case EthereumExplorer.ETHERSCAN:
      return join(
        EthereumExplorer.ETHERSCAN,
        `address/${nft.contractAddress.toString()}`
      );
    case SolanaExplorer.SOLANA_EXPLORER:
      return join(
        SolanaExplorer.SOLANA_EXPLORER,
        `address/${nft.mint.toString()}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLSCAN:
      return join(
        SolanaExplorer.SOLSCAN,
        `address/${nft.mint.toString()}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_BEACH:
      return join(
        SolanaExplorer.SOLANA_BEACH,
        `address/${nft.mint.toString()}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.SOLANA_FM:
      return join(
        SolanaExplorer.SOLANA_FM,
        `address/${nft.mint.toString()}${clusterSuffix(base, connectionUrl)}`
      );
    case SolanaExplorer.XRAY:
      return join(
        SolanaExplorer.XRAY,
        `token/${nft.mint.toString()}${clusterSuffix(base, connectionUrl)}`
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
