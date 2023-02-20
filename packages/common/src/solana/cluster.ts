export const DEFAULT_SOLANA_CLUSTER = "https://swr.xnfts.dev/rpc-proxy/";
export const SolanaCluster = {
  MAINNET: DEFAULT_SOLANA_CLUSTER,
  DEVNET: "https://api.devnet.solana.com",
  LOCALNET: "http://localhost:8899",

  DEFAULT: process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER,
};
