import type { Blockchain } from "@coral-xyz/common";

import type { SecureNotificationBase } from "../../types/transports";

export const SECURE_USER_NOTIFICATIONS_NAMES = [
  "NOTIFICATION_USER_UPDATED",
  "NOTIFICATION_KEYRING_STORE_UNLOCKED",
  "NOTIFICATION_KEYRING_STORE_LOCKED",
] as const;
export type SECURE_USER_NOTIFICATIONS =
  (typeof SECURE_USER_NOTIFICATIONS_NAMES)[number];

export type NOTIFICATION_KEYRING_STORE_LOCKED =
  SecureNotificationBase<"NOTIFICATION_KEYRING_STORE_LOCKED">;

export type NOTIFICATION_USER_UPDATED =
  SecureNotificationBase<"NOTIFICATION_USER_UPDATED">;

export interface NOTIFICATION_KEYRING_STORE_UNLOCKED
  extends SecureNotificationBase<"NOTIFICATION_KEYRING_STORE_UNLOCKED"> {
  data: {
    activeUser: {
      username: string;
      uuid: string;
    };
    blockchainActiveWallets: Partial<Record<Blockchain, string>>;
    ethereumConnectionUrl: string;
    ethereumChainId: string;
    solanaConnectionUrl: string;
    solanaCommitment: string;
  };
}
