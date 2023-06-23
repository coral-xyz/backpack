import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  InjectedRequestManager,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/types";

export class FromContentScriptTransportSender<
  X extends SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportSender<X, R>
{
  private client: InjectedRequestManager;

  constructor() {
    this.client = new InjectedRequestManager(
      CHANNEL_SECURE_BACKGROUND_REQUEST,
      CHANNEL_SECURE_BACKGROUND_RESPONSE
    );
  }

  public send = async <C extends R = R, T extends X = X>(
    request: SecureRequest<T>
  ): Promise<SecureResponse<T, C>> => {
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
