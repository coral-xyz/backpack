import type { KeyringStore } from "@coral-xyz/background";

import type { SECURE_SVM_EVENTS } from "./VMs/svm/events";
import { SVMService } from "./VMs/svm/service";
import type {
  SecureEvent,
  SecureResponse,
  TransportClient,
  TransportHandler,
  TransportServer,
} from "./types";

const mockTransportServer: TransportServer<SecureEvent> = {
  setListener: (handler: TransportHandler<SecureEvent>) => () => {},
};
const mockUIClient: TransportClient<SecureEvent> = {
  request: () =>
    Promise.resolve(null as unknown as SecureResponse<SecureEvent>),
};

export const clients = {
  SecureUserClient: undefined,
  SecureSVMClient: undefined,
  SecureEVMClient: undefined,
};

type Config = {
  isMobile: boolean;
};

export function startSecureService(config: Config, keyringStore: KeyringStore) {
  if (config.isMobile) {
    const MobileUIClient = mockUIClient;
    const MobileTransportServer = mockTransportServer;

    new SVMService(
      MobileTransportServer as TransportServer<SECURE_SVM_EVENTS>,
      MobileUIClient as TransportClient<SECURE_SVM_EVENTS>,
      keyringStore
    );
  } else {
    const WebUIClient = mockUIClient;
    const ExtensionTransportServer = mockTransportServer;
    const BrowserUITransportServer = mockTransportServer;

    new SVMService(
      ExtensionTransportServer as TransportServer<SECURE_SVM_EVENTS>,
      WebUIClient as TransportClient<SECURE_SVM_EVENTS>,
      keyringStore
    );

    new SVMService(
      BrowserUITransportServer as TransportServer<SECURE_SVM_EVENTS>,
      WebUIClient as TransportClient<SECURE_SVM_EVENTS>,
      keyringStore
    );
  }
}
