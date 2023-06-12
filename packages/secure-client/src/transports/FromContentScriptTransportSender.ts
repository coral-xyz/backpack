import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  InjectedRequestManager,
} from "@coral-xyz/common";
import type {
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/clients";

export class FromContentScriptTransportSender implements TransportSender {
  private client: InjectedRequestManager;

  constructor() {
    this.client = new InjectedRequestManager(
      CHANNEL_SECURE_BACKGROUND_REQUEST,
      CHANNEL_SECURE_BACKGROUND_RESPONSE
    );
  }

  public send: TransportSend = async (request) => {
    return this.client
      .request({
        method: "ContentScriptTransportSenderRequest",
        params: [request],
      })
      .then((response) => {
        return response;
      })
      .catch((e) => {
        return {
          name: request.name,
          error: e,
        };
      });
  };
}
