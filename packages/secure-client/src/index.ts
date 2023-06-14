// Secure Background Client Types
export * from "@coral-xyz/secure-background/types";

// Transports
export { FromContentScriptTransportReceiver } from "./transports/FromContentScriptTransportReceiver";
export { FromContentScriptTransportSender } from "./transports/FromContentScriptTransportSender";
export { FromExtensionTransportReceiver } from "./transports/FromExtensionTransportReceiver";
export { FromExtensionTransportSender } from "./transports/FromExtensionTransportSender";
export { ToSecureUITransportReceiver } from "./transports/ToSecureUITransportReceiver";
export { ToSecureUITransportSender } from "./transports/ToSecureUITransportSender";
export {
  combineTransportReceivers,
  mockTransportReceiver,
  mockTransportSender,
} from "@coral-xyz/secure-background/clients";

//Clients
export { SolanaClient } from "./clients/SolanaClient";

//UI
export { SecureUI } from "./SecureUI/SecureUI";
