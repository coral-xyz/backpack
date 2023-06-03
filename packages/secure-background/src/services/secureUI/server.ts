import { Blockchain } from "@coral-xyz/common";

import type { KeyringStore } from "../../localstore/keyring";
import type {
  TransportHandler,
  TransportReceiver,
  TransportRemoveListener,
  TransportSender,
} from "../../types";

import type {
  SECURE_UI_APPROVE_SIGN_MESSAGE,
  SECURE_UI_EVENTS,
} from "./events";

export class UIService {
  public destroy: TransportRemoveListener;
  private secureUIClient: TransportSender<any>;
  private keyringStore: KeyringStore;

  constructor(interfaces: {
    secureServer: TransportReceiver<SECURE_UI_EVENTS>;
    keyringStore: KeyringStore;
    secureUIClient: TransportSender<any>;
  }) {
    this.keyringStore = interfaces.keyringStore;
    this.secureUIClient = interfaces.secureUIClient;
    this.destroy = interfaces.secureServer.setHandler(
      this.eventHandler.bind(this)
    );
  }

  private eventHandler: TransportHandler<SECURE_UI_EVENTS> = (request) => {
    switch (request.name) {
      case "SECURE_UI_APPROVE_SIGN_MESSAGE":
        return this.handleApproveSignMessage(request);
    }
  };

  private handleApproveSignMessage: TransportHandler<SECURE_UI_APPROVE_SIGN_MESSAGE> =
    async ({ request }) => {
      return {
        name: "SECURE_UI_APPROVE_SIGN_MESSAGE",
        response: {
          approved: true,
        },
      };
    };
}
