import type { ChannelServer } from "@coral-xyz/common";
import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  ChannelContentScript,
} from "@coral-xyz/common";

import type { TransportReceiver } from "../types";

export class ContentScriptTransportReceiver implements TransportReceiver {
  private server: ChannelServer;

  constructor() {
    this.server = ChannelContentScript.server(
      CHANNEL_SECURE_BACKGROUND_REQUEST
    );
  }

  public setHandler = (handler) => {
    this.server.handler(async (message) => {
      return handler(message.data.params[0])
        .then((result) => [result])
        .catch((error) => [undefined, error]);
    });
    return () => {
      // currently not possible to destroy ChannelServer.
    };
  };
}
