import type { ChannelServer } from "@coral-xyz/common";
import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  ChannelContentScript,
} from "@coral-xyz/common";
import { TransportResponder } from "@coral-xyz/secure-background/clients";
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
      return new Promise((resolve) => {
        new TransportResponder({
          request: message?.data?.params?.[0],
          handler,
          onResponse: (response) => resolve([response]),
        });
      });
    });
    return () => {
      // currently not possible to destroy ChannelServer.
    };
  };
}
