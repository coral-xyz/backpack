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
import type EventEmitter from "eventemitter3";
import { v4 } from "uuid";

const logger = getLogger("secure-background LocalTransportSender");

export class LocalTransportSender<
  X extends SECURE_EVENTS,
  R extends SecureResponseType = "response"
> implements TransportSender<X, R>
{
  private responseQueue: TransportQueuedRequest<X, R>[] = [];
  private channels: { request: string; response: string } = {
    request: "LOCAL_BACKGROUND_REQUEST",
    response: "LOCAL_BACKGROND_RESPONSE",
  };

  constructor(
    private origin: SecureEventOrigin,
    private emitter: EventEmitter,
    channels?: { request: string; response: string }
  ) {
    if (channels) {
      this.channels = channels;
    }
    emitter.addListener(
      this.channels.response,
      this.responseHandler.bind(this)
    );
  }

  private responseHandler = (event: SecureResponse<X, R>) => {
    const request = this.getRequest(event.id);
    if (request) {
      logger.debug("Response", event);
      request.resolve(event);
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

        this.emitter.emit(this.channels.request, requestWithId);
      }
    );
  };
}
