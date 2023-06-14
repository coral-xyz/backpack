import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEvent,
  SecureRequest,
  SecureResponseType,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";
import { RequestResponder } from "packages/secure-background/src/transports/RequestResponder";

export class FromExtensionTransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureResponseType = SecureResponseType.response
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

      new RequestResponder<T, R>({
        request: message.data,
        handler,
        onResponse: (response) => {
          chrome.runtime
            .sendMessage({
              channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
              data: response,
            })
            .catch((error) => {
              console.error("PCA", error);
            });
        },
      });
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  };
}
