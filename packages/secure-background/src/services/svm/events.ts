import type { SecureEventBase } from "../../types/transports";

// Add new events here and in: ../../events.ts

export type SECURE_SVM_EVENTS =
  | "SECURE_SVM_SIGN_MESSAGE"
  | "SECURE_SVM_SIGN_TX"
  | "SECURE_SVM_SIGN_ALL_TX";

export interface SECURE_SVM_SIGN_MESSAGE
  extends SecureEventBase<"SECURE_SVM_SIGN_MESSAGE"> {
  request: {
    message: string;
    publicKey: string;
  };
  response: {
    singedMessage: string;
  };
}

export interface SECURE_SVM_SIGN_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_TX"> {
  request: {
    publicKey: string;
    tx: string;
  };
  response: {
    signedTx: string;
  };
}

export interface SECURE_SVM_SIGN_ALL_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_ALL_TX"> {
  request: {
    publicKey: string;
    tx: string[];
  };
  response: {
    signedTx: string[];
  };
}
