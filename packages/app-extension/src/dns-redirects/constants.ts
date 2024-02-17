import { Blockchain } from "@coral-xyz/common";

// TLD constants
export const ETH_TLD = "eth";
export const SOL_TLD = "sol";

export const TldToNetworkMapping = {
  [ETH_TLD]: Blockchain.ETHEREUM,
  [SOL_TLD]: Blockchain.SOLANA,
};

export const supportedDomains: string[] = [SOL_TLD, ETH_TLD];

// Prefix constants to be queried in the domain content
export const ipnsOrIpfsPrefix = ["ipns=", "ipfs=", "ipfs://", "ipns://"];
export const arweavePrefix = "arw://";
export const shadowDrivePrefix = "shdw://";

// Custom prefixes to resolve. Add your custom prefix here.
export const customPrefixes: Record<string, string> = {
  arweave: arweavePrefix,
  shadowDrive: shadowDrivePrefix,
};

export const allPrefixes: string[] = [
  ...ipnsOrIpfsPrefix,
  ...Object.values(customPrefixes),
];

export const ipAddressRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export enum PREFIX {
  IPFS = "/ipfs/",
  IPNS = "/ipns/",
}

// Url regex patterns for most popular search engines: Google, Bing and DuckDuckGo.
export const urlPatterns: string[] = [
  "^[^:]+://www\\.google(\\.[a-z]{2,3}){1,2}/search\\?q=.*",
  "^[^:]+://www\\.bing\\.com/search\\?q=.*",
  "^[^:]+://duckduckgo\\.com/\\?q=.*",
];

// Re-exporting for convenience
export { DEFAULT_IPFS_GATEWAYS } from "@coral-xyz/common";
export {
  DEFAULT_GATEWAY,
  DEFAULT_SOLANA_CLUSTER,
} from "@coral-xyz/secure-background/legacyCommon";
