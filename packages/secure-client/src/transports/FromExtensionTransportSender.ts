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
} from "@coral-xyz/secure-background/types";
import { v4 } from "uuid";

type QueuedRequest<
  X extends SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> = {
  request: SecureRequest;
  resolve: (resonse: SecureResponse<X, R>) => void;
};

export class FromExtensionTransportSender<
  X extends SECURE_EVENTS,
  R extends "response" | "confirmation" = "response"
> implements TransportSender<X, R>
{
  private responseQueue: QueuedRequest<X, R>[] = [];

  constructor() {
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

    console.log("PCA FromExtensionTransportSender response Received", message);

    request?.resolve(message.data);
  };

  private getRequest = (
    id: string | number | undefined
  ): QueuedRequest<X, R> | null => {
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

  public send = <C extends R = R, T extends X = X>(
    request: SecureRequest<T>
  ) => {
    return new Promise<SecureResponse<T, C>>(
      (resolve: (response: SecureResponse<T, C>) => void) => {
        const requestWithId: SecureRequest<T> & { id: string } = {
          ...request,
          id: v4(),
        };

        console.log(
          "PCA FromExtensionTransportSender send Request",
          request,
          CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST
        );

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
            console.error("PCA", e);
            const request = this.getRequest(requestWithId.id);
            return request?.resolve({
              name: requestWithId.name,
              error: e,
            } as SecureResponse<T, C>);
          });
      }
    );
  };
}
