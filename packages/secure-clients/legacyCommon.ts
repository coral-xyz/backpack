// Do not export new blockchains / blockchain internals here.
// Make necessary data available via [Blockchain]Client
// and export the client from ./index.ts.
// Only access blockchain data via its client.
export * from "./src/EthereumClient/ethereum";
export * from "./src/SolanaClient/solana";
