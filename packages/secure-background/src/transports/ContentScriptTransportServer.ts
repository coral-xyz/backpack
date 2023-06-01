import type { ChannelServer } from "@coral-xyz/common";
import {
  // CHANNEL_SECURE_BACKGROUND_REQUEST,
  ChannelContentScript,
} from "@coral-xyz/common";
const CHANNEL_SECURE_BACKGROUND_REQUEST = "";

import type { TransportServer } from "../types";

export class ContentScriptTransportServer implements TransportServer {
  private server: ChannelServer;

  constructor() {
    this.server = ChannelContentScript.server(
      CHANNEL_SECURE_BACKGROUND_REQUEST
    );
  }

  public setListener = () => {
    this.server.handler(async (message, sender) => {
      console.log("PCA", "BACKEND_SERVER_EVENT", message, sender);
    });
    return () => {
      // currently not possible to destroy ChannelServer.
    };
  };
}
