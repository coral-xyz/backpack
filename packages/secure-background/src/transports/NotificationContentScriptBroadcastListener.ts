import {
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  getLogger,
  isValidEventOrigin,
} from "@coral-xyz/common";
import type { TransportBroadcastListener } from "@coral-xyz/secure-background/types";

import type {
  SECURE_NOTIFICATIONS,
  SecureNotification,
} from "../notifications";

const logger = getLogger(
  "secure-backend NotificationContentScriptBroadcastListener"
);

export class NotificationContentScriptBroadcastListener<
  T extends SECURE_NOTIFICATIONS = SECURE_NOTIFICATIONS
> implements TransportBroadcastListener<T>
{
  private listeners: Array<(notification: SecureNotification<T>) => void> = [];

  constructor() {
    window.addEventListener("message", this.listener.bind(this));
  }

  private listener = (event: {
    data: {
      channel: string;
      data: SecureNotification<T>;
    };
  }) => {
    if (!isValidEventOrigin(event)) {
      return;
    }
    if (event.data.channel !== CHANNEL_SECURE_BACKGROUND_NOTIFICATION) {
      return;
    }

    logger.debug(event.data.data.name, event.data.data);

    this.listeners.forEach((listener) => {
      listener(event.data.data);
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
