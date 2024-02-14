import {
  CHANNEL_SECURE_BACKGROUND_NOTIFICATION,
  getLogger,
  isValidEventOrigin,
} from "@coral-xyz/common";

import type { TransportBroadcastListener } from "../../types";
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

  private listener = (
    event: Event & {
      data: {
        type: string;
        detail: SecureNotification<T>;
      };
    }
  ) => {
    if (!isValidEventOrigin(event)) {
      return;
    }
    if (event.data.type !== CHANNEL_SECURE_BACKGROUND_NOTIFICATION) {
      return;
    }

    logger.debug(event.data.type, event.data.detail);

    this.listeners.forEach((listener) => {
      listener(event.data.detail);
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
