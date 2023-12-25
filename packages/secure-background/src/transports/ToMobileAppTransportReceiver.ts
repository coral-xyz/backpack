import {
  CHANNEL_SECURE_BACKGROUND_EXTENSION_REQUEST,
  CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
  getLogger,
  postMessageFromAppToBrowserWebView,
} from "@coral-xyz/common";
import { TransportResponder } from "@coral-xyz/secure-background/clients";
import type {
  SECURE_EVENTS,
  SecureRequest,
  SecureRequestType,
  TransportHandler,
  TransportReceiver,
} from "@coral-xyz/secure-background/types";
import EventEmitter from "eventemitter3";

export const MOBILE_APP_TRANSPORT_RECEIVER_EVENTS = new EventEmitter();

const logger = getLogger("secure-ui ToMobileAppTransportReceiver");

export class ToMobileAppTransportReceiver<
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
          try {
            postMessageFromAppToBrowserWebView({
              channel: CHANNEL_SECURE_BACKGROUND_EXTENSION_RESPONSE,
              data: response,
            });
          } catch (err) {
            logger.error(String(err));
          }
        },
      });
    };
    MOBILE_APP_TRANSPORT_RECEIVER_EVENTS.on("message", listener);
    return () => {
      MOBILE_APP_TRANSPORT_RECEIVER_EVENTS.off("message", listener);
    };
  };
}
