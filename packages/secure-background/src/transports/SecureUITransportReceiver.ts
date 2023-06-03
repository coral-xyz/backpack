import {
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  CHANNEL_SECURE_UI_REQUEST,
  CHANNEL_SECURE_UI_RESPONSE,
} from "@coral-xyz/common";
import { v4 } from "uuid";

import type { SECURE_EVENTS } from "../events";
import type {
  SecureRequest,
  SecureResponse,
  TransportHandler,
  TransportReceiver,
} from "../types";

export class SecureUITransportReceiver<X extends SECURE_EVENTS>
  implements TransportReceiver<X>
{
  private port: chrome.runtime.Port;

  constructor() {
    // Send connect event to background script to open channel.
    // add unique name so background can identify the popup.
    this.port = chrome.runtime.connect({ name: v4() });
  }

  public setHandler = <T extends X>(handler: TransportHandler<T>) => {
    const listener = (message: {
      channel: string;
      data: SecureRequest<T>[];
    }) => {
      if (message.channel !== CHANNEL_SECURE_UI_REQUEST) {
        return;
      }
      console.log("PCA message received", message.data);
      message.data.forEach((request) =>
        handler(request)
          .then((result) => this.sendResponse(request, result))
          .catch((error) => this.sendResponse(request, null, error))
      );
    };
    this.port.onMessage.addListener(listener);
    return () => {
      this.port.onMessage.removeListener(listener);
    };
  };

  private sendResponse = (
    request: SecureRequest<X>,
    response: SecureResponse<X> | null,
    error?: any
  ) => {
    console.log("PCA", "SEND_RESPONSE", request, response, error);
    this.port.postMessage({
      channel: CHANNEL_SECURE_UI_RESPONSE,
      data: {
        ...response,
        id: request.id,
        error,
      },
    });
  };
}
