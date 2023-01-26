// TLD constants
export const ETH_TLD = "eth";
export const SOL_TLD = "sol";

// IPFS and IPNS prefix constants to be queried in the domain content
export const ipnsOrIpfsPrefix = ["ipns=", "ipfs=", "ipfs://", "ipns://"];

export const ipAddressRegex =
  /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Some public IPFS Gateway URLs (https://ipfs.github.io/public-gateway-checker/)
 */
export const IPFSGateways: string[] = [
  "4everland.io",
  "dweb.link",
  "infura-ipfs.io",
  "cf-ipfs.com",
  "astyanax.io",
  "ipfs.io",
  "cloudflare-ipfs.com",
  "gateway.pinata.cloud",
];

export enum PREFIX {
  IPFS = "/ipfs/",
  IPNS = "/ipns/",
}
export const DEFAULT_GATEWAY: string = IPFSGateways[0];

export const supportedDomains: string[] = ["sol", "eth"];

// Url regex patterns for most popular search engines: Google, Bing and DuckDuckGo.
export const urlPatterns: string[] = [
  "^[^:]+://www\\.google(\\.[a-z]{2,3}){1,2}/search\\?q=.*",
  "^[^:]+://www\\.bing\\.com/search\\?q=.*",
  "^[^:]+://duckduckgo\\.com/\\?q=.*",
];

export { DEFAULT_SOLANA_CLUSTER } from "../../../../packages/common/src/solana/cluster";
