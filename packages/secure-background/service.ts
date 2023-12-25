import EventEmitter from "eventemitter3";

import { EVMService } from "./src/services/evm/server";
import type { SECURE_SVM_EVENTS } from "./src/services/svm/events";
import { SVMService } from "./src/services/svm/server";
import type { SECURE_USER_EVENTS } from "./src/services/user/events";
import { UserService } from "./src/services/user/server";
import type { KeyringStore } from "./src/store/KeyringStore/KeyringStore";
import type { SecureDB } from "./src/store/SecureStore";
import { SecureStore } from "./src/store/SecureStore";
import { combineTransportReceivers } from "./src/transports/combineTransportReceivers";
import { LocalTransportReceiver } from "./src/transports/LocalTransportReceiver";
import { LocalTransportSender } from "./src/transports/LocalTransportSender";
import type {
  TransportBroadcaster,
  TransportReceiver,
  TransportSender,
} from "./src/types/transports";
import type { SECURE_EVENTS, SECURE_EVM_EVENTS } from "./types";

// Secure Service
export function startSecureService(
  interfaces: {
    notificationBroadcaster: TransportBroadcaster;
    secureUIClient: TransportSender<SECURE_EVENTS, "ui">;
    secureServer: TransportReceiver<SECURE_EVENTS>;
    secureDB: SecureDB;
  },
  keyringStore: KeyringStore
) {
  const emitter = new EventEmitter();
  const localServer = new LocalTransportReceiver(emitter);
  const localSender = new LocalTransportSender({
    origin: {
      name: "Backpack",
      address: "secure-background-service",
      context: "background",
    },
    forwardOrigin: true,
    emitter,
  });
  const combinedServer = combineTransportReceivers(
    interfaces.secureServer,
    localServer
  );
  const secureStore = new SecureStore(interfaces.secureDB);

  new SVMService({
    secureReceiver: combinedServer as TransportReceiver<SECURE_SVM_EVENTS>,
    secureSender: localSender,
    keyringStore: keyringStore,
    secureUISender: interfaces.secureUIClient,
  });
  new EVMService({
    secureReceiver: combinedServer as TransportReceiver<SECURE_EVM_EVENTS>,
    secureSender: localSender,
    keyringStore: keyringStore,
    secureUISender: interfaces.secureUIClient,
  });
  new UserService({
    secureServer: combinedServer as TransportReceiver<SECURE_USER_EVENTS>,
    notificationBroadcaster: interfaces.notificationBroadcaster,
    keyringStore: keyringStore,
    secureStore: secureStore,
    secureUIClient: interfaces.secureUIClient,
  });
}
