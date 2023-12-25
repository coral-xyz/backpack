import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type SECURE_LEDGER_EVENTS =
  | "LEDGER_SVM_SIGN_MESSAGE"
  | "LEDGER_SVM_SIGN_TX"
  | "LEDGER_EVM_SIGN_MESSAGE"
  | "LEDGER_EVM_SIGN_TX";

export interface LEDGER_SVM_SIGN_MESSAGE
  extends SecureEventBase<"LEDGER_SVM_SIGN_MESSAGE"> {
  request: {
    derivationPath: string;
    message: string;
  };
  uiResponse: {
    signature: string;
  };
}

export interface LEDGER_SVM_SIGN_TX
  extends SecureEventBase<"LEDGER_SVM_SIGN_TX"> {
  request: {
    derivationPath: string;
    txMessage: string;
  };
  uiResponse: {
    signature: string;
  };
}

export interface LEDGER_EVM_SIGN_TX
  extends SecureEventBase<"LEDGER_EVM_SIGN_TX"> {
  request: {
    derivationPath: string;
    txHex: string;
  };
  uiResponse: {
    signedTxHex: string;
  };
}

export interface LEDGER_EVM_SIGN_MESSAGE
  extends SecureEventBase<"LEDGER_EVM_SIGN_MESSAGE"> {
  request: {
    derivationPath: string;
    message58: string;
  };
  uiResponse: {
    signatureHex: string;
  };
}
