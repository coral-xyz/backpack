import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_SVM_EVENTS =
  | "SECURE_SVM_SIGN_MESSAGE"
  | "SECURE_SVM_SIGN_TX"
  | "SECURE_SVM_SIGN_ALL_TX"
  | "SECURE_SVM_DISCONNECT"
  | "SECURE_SVM_CONNECT";

export interface SECURE_SVM_SIGN_MESSAGE
  extends SecureEventBase<"SECURE_SVM_SIGN_MESSAGE"> {
  request: {
    message: string;
    publicKey: string;
  };
  response: {
    singedMessage: string;
  };
  uiResponse: {
    confirmed: true;
  };
}

export interface SECURE_SVM_CONNECT
  extends SecureEventBase<"SECURE_SVM_CONNECT"> {
  request: {};
  response: {
    publicKey: string;
    connectionUrl: string;
  };
}
export interface SECURE_SVM_DISCONNECT
  extends SecureEventBase<"SECURE_SVM_DISCONNECT"> {
  request: {};
  response: {
    disconnected: true;
  };
}

export interface SECURE_SVM_SIGN_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_TX"> {
  request: {
    publicKey: string;
    tx: string;
  };
  response: {
    signature: string;
  };
}

export interface SECURE_SVM_SIGN_ALL_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_ALL_TX"> {
  request: {
    publicKey: string;
    txs: string[];
  };
  response: {
    signatures: string[];
  };
}
