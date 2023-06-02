import type { ChannelServer } from "@coral-xyz/common";
import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  ChannelContentScript,
} from "@coral-xyz/common";

import type { TransportServer } from "../types";

export class ContentScriptTransportServer implements TransportServer {
  private server: ChannelServer;

  constructor() {
    this.server = ChannelContentScript.server(
      CHANNEL_SECURE_BACKGROUND_REQUEST
    );
  }

  public setListener = (handler) => {
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
