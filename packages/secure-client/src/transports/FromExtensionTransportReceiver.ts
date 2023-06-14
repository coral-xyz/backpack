import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEvent,
  SecureRequest,
  SecureResponse,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";

export class FromExtensionTransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportReceiver<T, R>
{
  constructor() {}

  public setHandler = (handler: TransportHandler<T, R>) => {
    const listener = async (message: {
      channel: string;
      data: SecureRequest<T>;
    }) => {
      if (message.channel !== CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST) {
        return;
      }

      const handled = handler(message.data);

      if (!handled) {
        return;
      }

      handled
        .then((result) => {
          return chrome.runtime.sendMessage({
            channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
            data: {
              ...result,
              name: message.data.name,
              id: message.data.id,
            },
          });
        })
        .catch((error) => {
          console.error("PCA", error);
          return chrome.runtime.sendMessage({
            channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
            data: {
              name: message.data.name,
              id: message.data.id,
              error,
            },
          });
        });
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  };
}
