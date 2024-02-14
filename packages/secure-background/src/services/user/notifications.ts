import type { Blockchain } from "@coral-xyz/common";

import type { SecureNotificationBase } from "../../types/transports";

export const SECURE_USER_NOTIFICATIONS_NAMES = [
  "NOTIFICATION_USER_UPDATED",
  "NOTIFICATION_KEYRING_STORE_UNLOCKED",
] as const;

export type SECURE_USER_NOTIFICATIONS =
  (typeof SECURE_USER_NOTIFICATIONS_NAMES)[number];

export type NOTIFICATION_USER_UPDATED =
  SecureNotificationBase<"NOTIFICATION_USER_UPDATED">;

export type NOTIFICATION_KEYRING_STORE_UNLOCKED =
  SecureNotificationBase<"NOTIFICATION_KEYRING_STORE_UNLOCKED">;
