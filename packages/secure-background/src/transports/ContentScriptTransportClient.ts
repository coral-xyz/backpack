// import {
//   CHANNEL_SECURE_BACKGROUND_REQUEST,
//   CHANNEL_SECURE_BACKGROUND_RESPONSE,
//   RequestManager,
// } from "@coral-xyz/common";

import type { TransportClient, TransportClientRequest } from "../types";

export class ContentScriptTransportClient implements TransportClient {
  // private client: RequestManager;

  constructor() {
    // this.client = new RequestManager(
    //   CHANNEL_SECURE_BACKGROUND_REQUEST,
    //   CHANNEL_SECURE_BACKGROUND_RESPONSE
    // );
  }

  public request: TransportClientRequest = async (request) => {
    throw "NOT implemented";
    // return this.client
    //   .request({
    //     method: "ContentScriptTransportClientRequest",
    //     params: [request],
    //   })
    //   .then((response) => {
    //     return response;
    //   });
  };
}
