import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
  getLogger,
} from "@coral-xyz/common";
import { TransportResponder } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureRequestType,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";

const logger = getLogger("secure-ui FromExtensionTransportReceiver");

export class FromExtensionTransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS,
  R extends SecureRequestType = undefined
> implements TransportReceiver<T, R>
{
  constructor() {}

  public setHandler = (handler: TransportHandler<T, R>) => {
    const listener = async (message: {
      channel: string;
      data: SecureRequest<T, R>;
    }) => {
      if (message.channel !== CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST) {
        return;
      }

      new TransportResponder<T, R>({
        request: message.data,
        handler,
        onResponse: (response) => {
          globalThis.chrome.runtime
            .sendMessage({
              channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
              data: response,
            })
            .catch((error) => {
              logger.error(error);
            });
        },
      });
    };
    globalThis.chrome?.runtime?.onMessage.addListener(listener);
    return () => {
      globalThis.chrome?.runtime?.onMessage.removeListener(listener);
    };
  };
}
