// Transports & UserClient & blockchain configs
export * from "@coral-xyz/secure-background/clients";

// Clients
export { createBlockchainClient } from "./src/createBlockchainClient";
export { EthereumClient } from "./src/EthereumClient/EthereumClient";
export {
  getAssetProof,
  SolanaAssetData,
  SolanaAssetKind,
  SolanaClient,
} from "./src/SolanaClient/SolanaClient";

// Utils
export * from "./src/_utils/derivationPathPattern";

// Types
// split into separate entrypiont app-extension & app-mobile dont have to deal with node dependencies
// -> @coral-xyz/secure-client/types

// Secure Service
// split into separate entrypoint so @coral-xyz/provider-injection's esbuild doesn't have to deal with it.
// -> @coral-xyz/secure-client/service
