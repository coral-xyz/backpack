import type { SECURE_SVM_EVENTS } from "./src/services/svm/events";
import { SVMService } from "./src/services/svm/server";
import type { SECURE_USER_EVENTS } from "./src/services/user/events";
import { UserService } from "./src/services/user/server";
import type { KeyringStore } from "./src/store/keyring";
import type { SecureDB } from "./src/store/SecureStore";
import { extensionDB, SecureStore } from "./src/store/SecureStore";
import { combineTransportReceivers } from "./src/transports/combineTransportReceivers";
import {
  mockTransportReceiver,
  mockTransportSender,
} from "./src/transports/mockTransports";
import type {
  TransportReceiver,
  TransportSender,
} from "./src/types/transports";
import type { SECURE_EVENTS } from "./types";

// Secure Service
export function startSecureService(
  interfaces: {
    backendNotificationClient: TransportSender;
    secureUIClient: TransportSender<SECURE_EVENTS, "confirmation">;
    secureServer: TransportReceiver<SECURE_EVENTS, "response">;
    secureDB: SecureDB;
  },
  keyringStore: KeyringStore
) {
  const localClient = mockTransportSender;
  const localServer = mockTransportReceiver;
  const combinedServer = combineTransportReceivers(
    interfaces.secureServer,
    localServer
  );
  const secureStore = new SecureStore(interfaces.secureDB);

  new SVMService({
    secureReceiver: combinedServer as TransportReceiver<SECURE_SVM_EVENTS>,
    keyringStore: keyringStore,
    secureUISender: interfaces.secureUIClient,
  });
  new UserService({
    secureServer: combinedServer as TransportReceiver<SECURE_USER_EVENTS>,
    keyringStore: keyringStore,
    secureUIClient: interfaces.secureUIClient,
  });
}
