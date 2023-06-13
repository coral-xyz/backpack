import type { SECURE_SVM_EVENTS } from "./src/services/svm/events";
import { SVMService } from "./src/services/svm/server";
import type { SECURE_USER_EVENTS } from "./src/services/user/events";
import { UserService } from "./src/services/user/server";
import type { LocalStorageDb } from "./src/store/db";
import type { KeyringStore } from "./src/store/keyring";
import { combineTransportReceivers } from "./src/transports/combineTransportReceivers";
import {
  mockTransportReceiver,
  mockTransportSender,
} from "./src/transports/mockTransports";
import type {
  TransportReceiver,
  TransportSender,
} from "./src/types/transports";

// Secure Service
export function startSecureService(
  interfaces: {
    backendNotificationClient: TransportSender;
    secureUIClient: TransportSender;
    secureServer: TransportReceiver;
    secureStorage: LocalStorageDb;
  },
  keyringStore: KeyringStore
) {
  const localClient = mockTransportSender;
  const localServer = mockTransportReceiver;
  const combinedServer = combineTransportReceivers(
    interfaces.secureServer,
    localServer
  );

  new SVMService({
    secureServer: combinedServer as TransportReceiver<SECURE_SVM_EVENTS>,
    keyringStore: keyringStore,
    secureUIClient: interfaces.secureUIClient,
  });
  new UserService({
    secureServer: combinedServer as TransportReceiver<SECURE_USER_EVENTS>,
    keyringStore: keyringStore,
    secureUIClient: interfaces.secureUIClient,
  });
}
