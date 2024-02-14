import {
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
} from "@coral-xyz/common";

import type { SecureNotification } from "../notifications";
import type { TransportBroadcaster } from "../types/transports";

export class NotificationsClient {
  constructor(private client: TransportBroadcaster) {}

  public pause(lockName: string, force?: boolean) {
    this.client.pause(lockName, force);
  }
  public resume(lockName: string) {
    this.client.resume(lockName);
  }

  public userUpdated() {
    return this.client.broadcast({
      name: "NOTIFICATION_USER_UPDATED",
      // @ts-ignore
      // error: (new Error()).stack
    });
  }

  public keyringUnlocked() {
    return this.client.broadcast({
      name: "NOTIFICATION_KEYRING_STORE_UNLOCKED",
      // @ts-ignore
      // error: (new Error()).stack
    });
  }
}
