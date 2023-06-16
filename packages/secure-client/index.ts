// Secure Background Client Types
export * from "@coral-xyz/secure-background/types";

// Transports
export { FromContentScriptTransportReceiver } from "./src/transports/FromContentScriptTransportReceiver";
export { FromContentScriptTransportSender } from "./src/transports/FromContentScriptTransportSender";
export { FromExtensionTransportReceiver } from "./src/transports/FromExtensionTransportReceiver";
export { FromExtensionTransportSender } from "./src/transports/FromExtensionTransportSender";
export { ToSecureUITransportReceiver } from "./src/transports/ToSecureUITransportReceiver";
export { ToSecureUITransportSender } from "./src/transports/ToSecureUITransportSender";
export {
  combineTransportReceivers,
  mockTransportReceiver,
  mockTransportSender,
} from "@coral-xyz/secure-background/clients";

//Clients
export { SolanaClient } from "./src/clients/SolanaClient";

// UI
// split into separate entrypoint so @coral-xyz/provider-injection's esbuild doesn't have to deal with it.
// -> @coral-xyz/secure-client/ui
