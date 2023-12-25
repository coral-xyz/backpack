// import via `@coral-xyz/secure-clients`

// util
export { safeClientResponse } from "./src/background-clients/safeClientResponse";

// Configs
export {
  getAllBlockchainConfigs,
  getBlockchainConfig,
  getEnabledBlockchainConfigs,
} from "./src/blockchain-configs/blockchains";

// Clients
export { NotificationsClient } from "./src/background-clients/NotificationsClient";
export { EVMClient } from "./src/services/evm/client";
export { SVMClient } from "./src/services/svm/client";
export { UserClient } from "./src/services/user/client";

// Transports
export { combineTransportReceivers } from "./src/transports/combineTransportReceivers";
export { FromContentScriptTransportReceiver } from "./src/transports/FromContentScriptTransportReceiver";
export { FromContentScriptTransportSender } from "./src/transports/FromContentScriptTransportSender";
export { FromExtensionTransportReceiver } from "./src/transports/FromExtensionTransportReceiver";
export { FromExtensionTransportSender } from "./src/transports/FromExtensionTransportSender";
export { FromMobileAppTransportReceiver } from "./src/transports/FromMobileAppTransportReceiver";
export { FromMobileAppTransportSender } from "./src/transports/FromMobileAppTransportSender";
export { LocalTransportReceiver } from "./src/transports/LocalTransportReceiver";
export { LocalTransportSender } from "./src/transports/LocalTransportSender";
export { NotificationBackgroundBroadcaster } from "./src/transports/NotificationBackgroundBroadcaster";
export { NotificationContentScriptBroadcastListener } from "./src/transports/NotificationContentScriptBroadcastListener";
export { NotificationExtensionBroadcastListener } from "./src/transports/NotificationExtensionBroadcastListener";
export { NotificationMobileBroadcastListener } from "./src/transports/NotificationMobileBroadcastListener";
export { ToMobileAppSecureUITransportReceiver } from "./src/transports/ToMobileAppSecureUITransportReceiver";
export { ToMobileAppSecureUITransportSender } from "./src/transports/ToMobileAppSecureUITransportSender";
export { ToMobileAppTransportReceiver } from "./src/transports/ToMobileAppTransportReceiver";
export {
  MOBILE_APP_TRANSPORT_SENDER_EVENTS,
  ToMobileAppTransportSender,
} from "./src/transports/ToMobileAppTransportSender";
export { ToSecureUITransportReceiver } from "./src/transports/ToSecureUITransportReceiver";
export { ToSecureUITransportSender } from "./src/transports/ToSecureUITransportSender";
export { TransportResponder } from "./src/transports/TransportResponder";

// Types
// split into separate entrypiont app-extension & app-mobile dont have to deal with node dependencies
// -> @coral-xyz/secure-background/types
