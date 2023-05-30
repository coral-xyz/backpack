import type { SecureEvent } from "../../types";

export type SECURE_EVM_EVENTS = SECURE_EVM_SIGN_MESSAGE | SECURE_EVM_SIGN_TX;

export interface SECURE_EVM_SIGN_MESSAGE extends SecureEvent {
  name: "SECURE_EVM_SIGN_MESSAGE";
  request: {
    message: string;
    publicKey: string;
  };
  response: {
    singedMessage: string;
  };
}

export interface SECURE_EVM_SIGN_TX extends SecureEvent {
  name: "SECURE_EVM_SIGN_TX";
  request: {
    publicKey: string;
    tx: string;
  };
  response: {
    signedTx: string;
  };
}
