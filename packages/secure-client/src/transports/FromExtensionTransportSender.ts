import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureResponse,
  TransportHandler,
  TransportSend,
  TransportSender,
} from "@coral-xyz/secure-background/clients";
import { v4 } from "uuid";

type QueuedRequest = {
  request: SecureRequest;
  resolve: (resonse: SecureResponse) => void;
};

export class FromExtensionTransportSender<X extends SECURE_EVENTS>
  implements TransportSender<X>
{
  private responseQueue: QueuedRequest[] = [];

  constructor() {
    chrome.runtime.onMessage.addListener(this.responseHandler.bind(this));
  }

  private responseHandler = (message: {
    channel: string;
    data: SecureResponse<X>;
  }) => {
    if (message.channel !== CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE) {
      return;
    }
    const request = this.getRequest(message.data.id);
    request?.resolve(message.data);
  };

  private getRequest = (
    id: string | number | undefined
  ): QueuedRequest | null => {
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

  public send: TransportSend<X> = <T extends X>(request) => {
    return new Promise<SecureResponse<T>>(
      (resolve: (response: SecureResponse<T>) => void) => {
        const requestWithId: SecureRequest<T> & { id: string } = {
          ...request,
          id: v4(),
        };

        console.log("PCA FromExtensionTransportSender Request", request);

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
            return request?.resolve({
              name: requestWithId.name,
              error: e,
            } as SecureResponse<T>);
          });
      }
    );
  };
}
