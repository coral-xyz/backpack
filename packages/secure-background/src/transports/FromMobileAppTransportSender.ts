import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
  getLogger,
  postMessageFromAppToHiddenBackgroundWebView,
} from "@coral-xyz/common";
import type {
  SECURE_EVENTS,
  SecureEvent,
  SecureEventOrigin,
  SecureRequest,
  SecureRequestType,
  SecureResponse,
  TransportQueuedRequest,
  TransportSend,
  TransportSender,
  TransportSendRequest,
} from "@coral-xyz/secure-background/types";
import EventEmitter from "eventemitter3";
import { v4 } from "uuid";

const logger = getLogger("secure-ui FromMobileAppTransportSender");

export const MOBILE_APP_TRANSPORT_SENDER_EVENTS = new EventEmitter();

export class FromMobileAppTransportSender<
  X extends SECURE_EVENTS,
  R extends SecureRequestType = undefined
> implements TransportSender<X, R>
{
  private responseQueue: TransportQueuedRequest<X, R>[] = [];
  private origin: SecureEventOrigin;
  private forwardOrigin: boolean;

  constructor(init: { origin: SecureEventOrigin; forwardOrigin?: boolean }) {
    this.origin = init.origin;
    this.forwardOrigin = !!init.forwardOrigin;

    MOBILE_APP_TRANSPORT_SENDER_EVENTS.on(
      "message",
      this.responseHandler.bind(this)
    );
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
      logger.debug("Response", JSON.stringify(message.data));

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

    return queuedRequest ?? null;
  };

  public send: TransportSend<X, R> = <T extends X = X, C extends R = R>(
    request: TransportSendRequest<T, C>
  ) => {
    return new Promise<SecureResponse<T, C>>(
      (resolve: (response: SecureResponse<T, C>) => void) => {
        const requestWithId = {
          ...request,
          origin:
            request.origin &&
            (this.forwardOrigin ||
              //@ts-ignore request.origin.context exists since checked above
              (request.origin as SecureEvent<T>["origin"]).context ===
                "browser")
              ? request.origin
              : this.origin,
          id: (request as any).id || v4(),
        } as SecureRequest<T, C>;

        logger.debug("Request", requestWithId);

        this.responseQueue.push({
          request: requestWithId,
          resolve,
          // this is safe to cast because constraint: <T extends X = X, C extends R = R>
        } as unknown as TransportQueuedRequest<X, R>);

        try {
          postMessageFromAppToHiddenBackgroundWebView({
            channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
            data: requestWithId,
          });
        } catch (e) {
          const request = this.getRequest(requestWithId.id);
          const response = {
            name: requestWithId.name,
            id: requestWithId.id,
            error: e,
          } as SecureResponse<T, C>;

          if (request) {
            logger.debug("Response", response);
            return request.resolve(response);
          } else {
            logger.error("No queued request found", response);
          }
        }
      }
    );
  };
}
