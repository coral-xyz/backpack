import type { SecureEventBase } from "../../types";

// Add new events here and in: ../../events.ts

export type SECURE_UI_EVENTS = "SECURE_UI_APPROVE_SIGN_MESSAGE";

export interface SECURE_UI_APPROVE_SIGN_MESSAGE
  extends SecureEventBase<"SECURE_UI_APPROVE_SIGN_MESSAGE"> {
  request: {
    message: string;
    publicKey: string;
    displayOptions?: {
      popup: boolean;
    };
  };
  response: {
    approved: boolean;
  };
}
