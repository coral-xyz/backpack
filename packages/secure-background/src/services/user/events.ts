import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_USER_EVENTS = "SECURE_USER_UNLOCK_KEYRING";

export interface SECURE_USER_UNLOCK_KEYRING
  extends SecureEventBase<"SECURE_USER_UNLOCK_KEYRING"> {
  request: {
    uuid?: string;
    password?: string;
  };
  response: {
    unlocked: boolean;
  };
}
