// Transports
export { BackendNotificationBroadcaster } from "./src/transports/BackendNotificationBroadcaster";
export { FromContentScriptTransportReceiver } from "./src/transports/FromContentScriptTransportReceiver";
export { FromContentScriptTransportSender } from "./src/transports/FromContentScriptTransportSender";
export { FromExtensionTransportReceiver } from "./src/transports/FromExtensionTransportReceiver";
export { FromExtensionTransportSender } from "./src/transports/FromExtensionTransportSender";
export { ToSecureUITransportReceiver } from "./src/transports/ToSecureUITransportReceiver";
export { ToSecureUITransportSender } from "./src/transports/ToSecureUITransportSender";
export {
  combineTransportReceivers,
  LocalTransportReceiver,
  LocalTransportSender,
} from "@coral-xyz/secure-background/clients";

//Clients
export { SolanaClient } from "./src/clients/SolanaClient";

// Types
// split into separate entrypiont app-extension & app-mobile dont have to deal with node dependencies
// -> @coral-xyz/secure-client/types

// Secure UI
// split into separate entrypoint so @coral-xyz/provider-injection's esbuild doesn't have to deal with it.
// -> @coral-xyz/secure-client/ui

// Secure Service
// split into separate entrypoint so @coral-xyz/provider-injection's esbuild doesn't have to deal with it.
// -> @coral-xyz/secure-client/service
