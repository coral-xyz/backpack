import type { LocalStorageDb } from "./localstore/db";
import type { KeyringStore } from "./localstore/keyring";
import type { SECURE_SVM_EVENTS } from "./services/svm/events";
import { SVMService } from "./services/svm/server";
import type {
  SecureEvent,
  SecureResponse,
  TransportClient,
  TransportHandler,
  TransportServer,
} from "./types";

export const mockTransportServer: TransportServer<SecureEvent> = {
  setListener: (handler: TransportHandler<SecureEvent>) => () => {},
};
export const mockTransportClient: TransportClient<SecureEvent> = {
  request: () =>
    Promise.resolve(null as unknown as SecureResponse<SecureEvent>),
};

export const clients = {
  SecureUserClient: undefined,
  SecureSVMClient: undefined,
  SecureEVMClient: undefined,
};

///////////////////////////////////////////////////////////////////////////////
// LEGACY EXPORTS
// These exports need to be removed in future but are required for now
// to enable /background/* (mostly /backend/core) to continue to work.
export * from "./legacyExport";
///////////////////////////////////////////////////////////////////////////////

export function startSecureService(
  interfaces: {
    backendNotificationClient: TransportClient<SecureEvent>;
    secureUIClient: TransportClient<SecureEvent>;
    secureServer: TransportServer<SecureEvent>;
    secureStorage: LocalStorageDb;
  },
  keyringStore: KeyringStore
) {
  const localClient = mockTransportClient;
  const localServer = mockTransportServer;
  const combinedServer = combineTransportServers(
    interfaces.secureServer,
    localServer
  );

  new SVMService({
    secureServer: combinedServer as TransportServer<SECURE_SVM_EVENTS>,
    keystoreClient: localClient,
    secureUIClient:
      interfaces.secureUIClient as TransportClient<SECURE_SVM_EVENTS>,
  });
}

function combineTransportServers<T extends SecureEvent>(
  ...servers: TransportServer<T>[]
): TransportServer<T> {
  return {
    setListener: (listener) => {
      const removeListeners = servers.map((server) =>
        server.setListener(listener)
      );
      return () => {
        removeListeners.forEach((removeListener) => removeListener());
      };
    },
  };
}
