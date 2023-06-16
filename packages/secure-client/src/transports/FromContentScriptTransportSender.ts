import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  InjectedRequestManager,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEventOrigin,
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/types";

export class FromContentScriptTransportSender<
  X extends SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportSender<X, R>
{
  private client: InjectedRequestManager;

  constructor(private origin: SecureEventOrigin) {
    this.client = new InjectedRequestManager(
      CHANNEL_SECURE_BACKGROUND_REQUEST,
      CHANNEL_SECURE_BACKGROUND_RESPONSE
    );
  }

  public send: TransportSend<X, R> = async (request) => {
    return this.client
      .request({
        method: "ContentScriptTransportSenderRequest",
        params: [{ ...request, origin: this.origin }],
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
