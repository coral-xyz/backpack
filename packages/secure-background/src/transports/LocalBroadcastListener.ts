import {
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  getLogger,
  isValidEventOrigin,
} from "@coral-xyz/common";
import type EventEmitter from "eventemitter3";

import type { TransportBroadcastListener } from "../../types";
import type {
  SECURE_NOTIFICATIONS,
  SecureNotification,
} from "../notifications";

const logger = getLogger("secure-backend LocalBroadcastListener");

export class LocalBroadcastListener<
  T extends SECURE_NOTIFICATIONS = SECURE_NOTIFICATIONS,
> implements TransportBroadcastListener<T>
{
  private listeners: Array<(notification: SecureNotification<T>) => void> = [];

  constructor(
    emitter: EventEmitter,
    private channel: string = CHANNEL_SECURE_BACKGROUND_NOTIFICATION
  ) {
    emitter.addListener("SECURE_LOCAL_BROADCAST", this.listener.bind(this));
  }

  private listener = (
    event: Event & {
      channel: string;
      data: SecureNotification<T>;
    }
  ) => {
    if (event.channel !== this.channel) {
      return;
    }

    logger.debug(event.channel, event.data);

    this.listeners.forEach((listener) => {
      listener(event.data);
    });
  };

  public addListener = (
    newListener: (notification: SecureNotification<T>) => void
  ) => {
    this.listeners.push(newListener);

    return () => {
      const index = this.listeners.findIndex(
        (listener) => listener === newListener
      );
      this.listeners.splice(index, 1);
    };
  };
}
