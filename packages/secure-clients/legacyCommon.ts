// Do not export new blockchains / blockchain internals here.
// Make necessary data available via [Blockchain]Client
// and export the client from ./index.ts.

export { confirmTransaction } from "./src/SolanaClient/utils/confirmTransaction";

// Only access blockchain data via its client.
export * from "./src/EthereumClient/ethereum";
export {
  Solana,
  type SolanaContext,
  SolanaProvider,
} from "./src/SolanaClient/solanaLegacy";
export * from "./src/SolanaClient/solanaLegacy/programs";
export {
  deserializeLegacyTransaction as solanaDeserializeLegacyTransaction,
  deserializeTransaction as solanaDeserializeTransaction,
} from "./src/SolanaClient/utils/transaction-helpers";
