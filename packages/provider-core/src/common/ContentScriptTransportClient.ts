import {
  CHANNEL_SECURE_BACKGROUND_REQUEST,
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
} from "@coral-xyz/common";
import type {
  TransportClient,
  TransportClientRequest,
} from "@coral-xyz/secure-background/src/types";

import { RequestManager } from "../request-manager";

export class ContentScriptTransportClient implements TransportClient {
  private client: RequestManager;

  constructor() {
    this.client = new RequestManager(
      CHANNEL_SECURE_BACKGROUND_REQUEST,
      CHANNEL_SECURE_BACKGROUND_RESPONSE
    );
  }

  public request: TransportClientRequest = async (request) => {
    return this.client
      .request({
        method: "ContentScriptTransportClientRequest",
        params: [request],
      })
      .then((response) => {
        return response;
      })
      .catch((e) => {
        console.error(e);
      });
  };
}
