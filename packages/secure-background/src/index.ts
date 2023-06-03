import type { LocalStorageDb } from "./localstore/db";
import type { KeyringStore } from "./localstore/keyring";
import type { SECURE_UI_EVENTS } from "./services/secureUI/events";
import type { SECURE_SVM_EVENTS } from "./services/svm/events";
import { SVMService } from "./services/svm/server";
import { combineTransportReceivers } from "./transports/combineTransportReceivers";
import type { SECURE_EVENTS } from "./events";
import type { TransportReceiver, TransportSender } from "./types";

export const mockTransportReceiver: TransportReceiver = {
  setHandler: () => () => {},
};
export const mockTransportSender: TransportSender = {
  send: () => Promise.resolve(null as never),
};

///////////////////////////////////////////////////////////////////////////////
// LEGACY EXPORTS
// These exports need to be removed in future but are required for now
// to enable /background/* (mostly /backend/core) to continue to work.
export * from "./legacyExport";
///////////////////////////////////////////////////////////////////////////////

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
}
