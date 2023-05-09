import { Blockchain } from "@coral-xyz/common";
// TLD constants
export const ETH_TLD = "eth";
export const SOL_TLD = "sol";

export const DomainNetwork = {
  [ETH_TLD]: Blockchain.ETHEREUM,
  [SOL_TLD]: Blockchain.SOLANA,
};

export const supportedDomains: string[] = [SOL_TLD, ETH_TLD];

// IPFS and IPNS prefix constants to be queried in the domain content
export const ipnsOrIpfsPrefix = ["ipns=", "ipfs=", "ipfs://", "ipns://"];

export const ipAddressRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export enum PREFIX {
  IPFS = "/ipfs/",
  IPNS = "/ipns/",
}

// Custom prefixes to resolve
export const arweavePrefix = "arw://";
export const shadowDrivePrefix = "shdw://";
export const customPrefixes = [arweavePrefix, shadowDrivePrefix];

export const allPrefixes = [
  ...ipnsOrIpfsPrefix,
  arweavePrefix,
  shadowDrivePrefix,
];

// Url regex patterns for most popular search engines: Google, Bing and DuckDuckGo.
export const urlPatterns: string[] = [
  "^[^:]+://www\\.google(\\.[a-z]{2,3}){1,2}/search\\?q=.*",
  "^[^:]+://www\\.bing\\.com/search\\?q=.*",
  "^[^:]+://duckduckgo\\.com/\\?q=.*",
];

export {
  DEFAULT_GATEWAY,
  DEFAULT_IPFS_GATEWAYS,
  DEFAULT_SOLANA_CLUSTER,
} from "@coral-xyz/common";
