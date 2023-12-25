export const DEFAULT_SOLANA_CLUSTER = "https://swr.xnftdata.com/rpc-proxy/";
export const SolanaCluster = {
  MAINNET: DEFAULT_SOLANA_CLUSTER,
  DEVNET: "https://api.devnet.solana.com",
  DEFAULT: process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER,
};
