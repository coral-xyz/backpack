import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
  getLogger,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEventOrigin,
  SecureRequest,
  SecureResponse,
  SecureResponseType,
  TransportQueuedRequest,
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/types";
import { v4 } from "uuid";

const logger = getLogger("secure-client FromExtensionTransportSender");

export class FromExtensionTransportSender<
  X extends SECURE_EVENTS,
  R extends SecureResponseType = "response"
> implements TransportSender<X, R>
{
  private responseQueue: TransportQueuedRequest<X, R>[] = [];

  constructor(private origin: SecureEventOrigin) {
    chrome.runtime.onMessage.addListener(this.responseHandler.bind(this));
  }

  private responseHandler = (message: {
    channel: string;
    data: SecureResponse<X, R>;
  }) => {
    if (message.channel !== CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE) {
      return;
    }
    const request = this.getRequest(message.data.id);

    if (request) {
      logger.debug("Response", message.data);

      request.resolve(message.data);
    }
  };

  private getRequest = (
    id: string | number | undefined
  ): TransportQueuedRequest<X, R> | null => {
    if (id === undefined) {
      return null;
    }
    // find waiting request in responseQueue
    const index = this.responseQueue.findIndex(
      (queuedResponse) => queuedResponse.request.id === id
    );
    if (index < 0) {
      return null;
    }
    // remove request from queue
    const queuedRequest = this.responseQueue[index];
    this.responseQueue.splice(index, 1);

    return queuedRequest;
  };

  public send: TransportSend<X, R> = <C extends R = R, T extends X = X>(
    request: SecureRequest<T>
  ) => {
    return new Promise<SecureResponse<T, C>>(
      (resolve: (response: SecureResponse<T, C>) => void) => {
        const requestWithId: SecureRequest<T> & { id: string } = {
          ...request,
          origin: this.origin,
          id: v4(),
        };

        logger.debug("Request", requestWithId);

        this.responseQueue.push({
          request: requestWithId,
          resolve,
        });

        chrome.runtime
          .sendMessage({
            channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
            data: requestWithId,
          })
          .catch((e) => {
            const request = this.getRequest(requestWithId.id);

            if (request) {
              const response = {
                name: requestWithId.name,
                id: requestWithId.id,
                error: e,
              } as SecureResponse<T, C>;
              logger.debug("Response", response);
              return request.resolve(response);
            }
          });
      }
    );
  };
}
