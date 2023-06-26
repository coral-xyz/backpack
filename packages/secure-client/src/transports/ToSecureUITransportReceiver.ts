import {
  CHANNEL_SECURE_UI_REQUEST,
  CHANNEL_SECURE_UI_RESPONSE,
  getLogger,
} from "@coral-xyz/common";
import { TransportResponder } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  SecureResponseType,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";

const logger = getLogger("secure-client ToSecureUITransportReceiver");

export class ToSecureUITransportReceiver<
  X extends SECURE_EVENTS,
  R extends SecureResponseType = "response"
> implements TransportReceiver<X, R>
{
  constructor(private port: chrome.runtime.Port) {}

  public setHandler = (handler: TransportHandler<X, R>) => {
    const listener = (message: {
      channel: string;
      data: SecureRequest<X>[];
    }) => {
      if (message.channel !== CHANNEL_SECURE_UI_REQUEST) {
        return;
      }

      message.data.forEach((request) => {
        new TransportResponder({
          request,
          handler,
          onResponse: (result) => {
            this.sendResponse(request, result);
          },
        });
      });
    };
    this.port.onMessage.addListener(listener);
    return () => {
      this.port.onMessage.removeListener(listener);
    };
  };

  private sendResponse = (
    request: SecureRequest<X>,
    response: SecureResponse<X, R>
  ) => {
    try {
      this.port.postMessage({
        channel: CHANNEL_SECURE_UI_RESPONSE,
        data: {
          ...response,
          id: request.id,
        },
      });
    } catch (e) {
      logger.error(e);
    }
  };
}
