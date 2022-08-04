export const SolanaCluster = {
  MAINNET: "https://solana-api.projectserum.com",
  DEVNET: "https://api.devnet.solana.com",
  LOCALNET: "http://localhost:8899",

  DEFAULT:
    process.env.DEFAULT_SOLANA_CONNECTION_URL ||
    "https://solana-api.projectserum.com",
};
