import {
  NOTIFICATION_KEYRING_STORE_LOCKED,
  NOTIFICATION_KEYRING_STORE_UNLOCKED,
} from "@coral-xyz/common";

import type { SecureNotification } from "../notifications";
import type { TransportBroadcaster } from "../types/transports";

export class NotificationsClient {
  constructor(private client: TransportBroadcaster) {}

  public userUpdated() {
    return this.client.broadcast({
      name: "NOTIFICATION_USER_UPDATED",
    });
  }

  // public keyringLocked() {
  //   return this.client.broadcast({
  //     name: NOTIFICATION_KEYRING_STORE_LOCKED,
  //   });
  // }

  // public keyringUnlocked(
  //   data: SecureNotification<"NOTIFICATION_KEYRING_STORE_UNLOCKED">["data"]
  // ) {
  //   return this.client.broadcast({
  //     name: NOTIFICATION_KEYRING_STORE_UNLOCKED,
  //     data,
  //   });
  // }
}
