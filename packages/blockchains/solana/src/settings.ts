export const DEFAULT_SOLANA_CLUSTER = "https://solana-rpc.xnfts.dev";

export const SolanaExplorer = {
  SOLANA_EXPLORER: "https://explorer.solana.com",
  SOLSCAN: "https://solscan.io",
  SOLANA_BEACH: "https://solanabeach.io",
  SOLANA_FM: "https://solana.fm",
  DEFAULT: "https://solscan.io",
};

export const SolanaCluster = {
  MAINNET: DEFAULT_SOLANA_CLUSTER,
  DEVNET: "https://api.devnet.solana.com",
  LOCALNET: "http://localhost:8899",
  DEFAULT: process.env.DEFAULT_SOLANA_CONNECTION_URL || DEFAULT_SOLANA_CLUSTER,
};

export const DefaultSettings = {
  explorer: SolanaExplorer.DEFAULT,
  connectionUrl: SolanaCluster.DEFAULT,
  commitment: "confirmed",
};
