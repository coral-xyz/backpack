import type { ChannelServer } from "@coral-xyz/common";
import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  ChannelContentScript,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";

export class FromContentScriptTransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportReceiver<T, R>
{
  private server: ChannelServer;

  constructor() {
    this.server = ChannelContentScript.server(
      CHANNEL_SECURE_BACKGROUND_REQUEST
    );
  }

  public setHandler = (handler: TransportHandler<T, R>) => {
    this.server.handler((message) => {
      const handled = handler(message?.data?.params?.[0]);

      if (!handled) return null;

      return handled
        .then((result) => [result])
        .catch((error) => [{ name: message.data.params[0].name, error }]);
    });
    return () => {
      // currently not possible to destroy ChannelServer.
    };
  };
}
