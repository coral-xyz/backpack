import type { Blockchain } from "@coral-xyz/common";
import type { SolanaSignInInput } from "@solana/wallet-standard-features";

import type { SecureEventBase, SerializableJson } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_SVM_EVENTS =
  | "SECURE_SVM_SIGN_MESSAGE"
  | "SECURE_SVM_SIGN_TX"
  | "SECURE_SVM_SIGN_ALL_TX"
  | "SECURE_SVM_SIGN_IN"
  | "SECURE_SVM_DISCONNECT"
  | "SECURE_SVM_CONNECT";

export interface SECURE_SVM_SIGN_MESSAGE
  extends SecureEventBase<"SECURE_SVM_SIGN_MESSAGE"> {
  request: {
    message: string;
    publicKey: string;
    uuid?: string;
  };
  response: {
    signedMessage: string;
  };
  uiResponse: {
    confirmed: true;
  };
}

export interface SECURE_SVM_CONNECT
  extends SecureEventBase<"SECURE_SVM_CONNECT"> {
  request: {
    blockchain: Blockchain;
    silent?: boolean;
  };
  response: {
    publicKey: string;
    connectionUrl: string;
  };
}

export interface SECURE_SVM_SIGN_IN
  extends SecureEventBase<"SECURE_SVM_SIGN_IN"> {
  request: {
    blockchain: Blockchain;
    input?: SolanaSignInInput;
  };
  uiOptions: {
    publicKey: string;
    message: string;
  };
  uiResponse: {
    confirmed: true;
  };
  response: {
    signedMessage: string;
    signature: string;
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
    uuid?: string;
    disableTxMutation?: boolean;
  };
  uiResponse: {
    confirmed: true;
    tx: string;
  };
  response: {
    signature: string;
    signedTx: string;
  };
  uiOptions: { type: "ANY" };
}

export interface SECURE_SVM_SIGN_ALL_TX
  extends SecureEventBase<"SECURE_SVM_SIGN_ALL_TX"> {
  request: {
    publicKey: string;
    txs: string[];
    uuid?: string;
    disableTxMutation?: boolean;
  };
  uiResponse: {
    confirmed: true;
    txs: string[];
  };
  response: {
    signatures: Array<{
      signature: string;
      signedTx: string;
    }>;
  };
}
