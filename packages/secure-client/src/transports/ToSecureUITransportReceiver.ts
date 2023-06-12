import {
  CHANNEL_SECURE_BACKGROUND_RESPONSE,
  CHANNEL_SECURE_UI_REQUEST,
  CHANNEL_SECURE_UI_RESPONSE,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/clients";

export class ToSecureUITransportReceiver<X extends SECURE_EVENTS>
  implements TransportReceiver<X>
{
  constructor(private port: chrome.runtime.Port) {}

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
          .catch((error) =>
            this.sendResponse(request, {
              name: request.name,
              error,
            } as SecureResponse<T>)
          )
      );
    };
    this.port.onMessage.addListener(listener);
    return () => {
      this.port.onMessage.removeListener(listener);
    };
  };

  private sendResponse = (
    request: SecureRequest<X>,
    response: SecureResponse<X>
  ) => {
    console.log("PCA", "SEND_RESPONSE", request, response);
    this.port.postMessage({
      channel: CHANNEL_SECURE_UI_RESPONSE,
      data: {
        ...response,
        id: request.id,
      },
    });
  };
}
