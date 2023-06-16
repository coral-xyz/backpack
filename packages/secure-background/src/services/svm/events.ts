import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_SVM_EVENTS =
  | "SECURE_SVM_SIGN_MESSAGE"
  | "SECURE_SVM_SIGN_TX"
  | "SECURE_SVM_SIGN_ALL_TX"
  | "SECURE_SVM_SAY_HELLO";

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

export interface SECURE_SVM_SAY_HELLO
  extends SecureEventBase<"SECURE_SVM_SAY_HELLO"> {
  request: {
    name: string;
  };
  response: {
    message: string;
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
