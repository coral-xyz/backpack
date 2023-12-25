import {
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  getLogger,
} from "@coral-xyz/common";
import type { TransportBroadcastListener } from "@coral-xyz/secure-background/types";

import type {
  SECURE_NOTIFICATIONS,
  SecureNotification,
} from "../notifications";

const logger = getLogger(
  "secure-background NotificationExtensionBroadcastListener"
);

export class NotificationExtensionBroadcastListener<
  T extends SECURE_NOTIFICATIONS = SECURE_NOTIFICATIONS
> implements TransportBroadcastListener<T>
{
  private listeners: Array<(notification: SecureNotification<T>) => void> = [];

  constructor() {
    globalThis.chrome?.runtime?.onMessage.addListener(this.listener.bind(this));
  }

  private listener = (message: {
    channel: string;
    data: SecureNotification<T>;
  }) => {
    if (message.channel !== CHANNEL_SECURE_BACKGROUND_NOTIFICATION) {
      return;
    }

    logger.debug(message.data.name, message.data);

    this.listeners.forEach((listener) => {
      listener(message.data);
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
