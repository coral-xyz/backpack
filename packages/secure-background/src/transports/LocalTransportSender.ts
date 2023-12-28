import { getLogger } from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEventOrigin,
  SecureRequest,
  SecureRequestType,
  SecureResponse,
  TransportQueuedRequest,
  TransportSend,
  TransportSender,
  TransportSendRequest,
} from "@coral-xyz/secure-background/types";
import type EventEmitter from "eventemitter3";
import { v4 } from "uuid";

const logger = getLogger("secure-background LocalTransportSender");

export class LocalTransportSender<
  X extends SECURE_EVENTS,
  R extends SecureRequestType = undefined
> implements TransportSender<X, R>
{
  private responseQueue: TransportQueuedRequest<X, R>[] = [];
  private channels: { request: string; response: string } = {
    request: "LOCAL_BACKGROUND_REQUEST",
    response: "LOCAL_BACKGROND_RESPONSE",
  };
  private origin: SecureEventOrigin;
  private emitter: EventEmitter;
  private forwardOrigin: boolean;

  constructor(init: {
    origin: SecureEventOrigin;
    emitter: EventEmitter;
    forwardOrigin?: boolean;
    channels?: { request: string; response: string };
  }) {
    if (init.channels) {
      this.channels = init.channels;
    }
    this.origin = init.origin;
    this.emitter = init.emitter;
    this.forwardOrigin = !!init.forwardOrigin;

    this.emitter.addListener(
      this.channels.response,
      this.responseHandler.bind(this)
    );
  }

  private responseHandler = (event: SecureResponse<X, R>) => {
    const request = this.getRequest(event.id);
    if (request) {
      logger.debug("Response", event);
      request.resolve(event);
    } else {
      logger.error("No queued request found.", event);
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

    return queuedRequest ?? null;
  };

  public send: TransportSend<X, R> = <T extends X = X, C extends R = R>(
    request: TransportSendRequest<T, C>
  ) => {
    return new Promise<SecureResponse<T, C>>(
      (resolve: (response: SecureResponse<T, C>) => void) => {
        const requestWithId = {
          ...request,
          origin: !this.forwardOrigin
            ? this.origin
            : request.origin ?? this.origin,
          id: v4(),
        } as SecureRequest<T, C>;

        logger.debug("Request", requestWithId);
        this.responseQueue.push({
          request: requestWithId,
          resolve,
          // this is safe to cast because constraint: <T extends X = X, C extends R = R>
        } as unknown as TransportQueuedRequest<X, R>);

        this.emitter.emit(this.channels.request, requestWithId);
      }
    );
  };
}
