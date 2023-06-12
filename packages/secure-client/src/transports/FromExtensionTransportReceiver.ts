import { CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST } from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEvent,
  SecureRequest,
  SecureResponse,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/clients";

export class FromExtensionTransportReceiver<
  T extends SECURE_EVENTS = SECURE_EVENTS
> implements TransportReceiver<T>
{
  constructor() {}

  public setHandler = (handler) => {
    const listener = async (
      message: {
        channel: string;
        data: SecureRequest<T>;
      },
      _sender,
      response: (respones) => void
    ) => {
      if (message.channel !== CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST) {
        return;
      }
      handler(message.data)
        .then((result) => response(result))
        .catch((error: any) =>
          response({
            name: message.data.name,
            error,
          } as SecureResponse<T>)
        );
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => {
      chrome.runtime.onMessage.removeListener(listener);
    };
  };
}
