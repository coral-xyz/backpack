import type { SecureEventBase } from "../../types/transports";

// Also add new events to: ../../events.ts

export type LEDGER_EVENTS = "LEDGER_SVM_SIGN_MESSAGE" | "LEDGER_SVM_SIGN_TX";

export interface LEDGER_SVM_SIGN_MESSAGE
  extends SecureEventBase<"LEDGER_SVM_SIGN_MESSAGE"> {
  request: SecureEventBase<"SECURE_SVM_SIGN_MESSAGE">["request"];
  uiResponse: SecureEventBase<"SECURE_SVM_SIGN_MESSAGE">["response"];
}

export interface LEDGER_SVM_SIGN_TX
  extends SecureEventBase<"LEDGER_SVM_SIGN_TX"> {
  request: SecureEventBase<"SECURE_SVM_SIGN_TX">["request"];
  uiResponse: SecureEventBase<"SECURE_SVM_SIGN_TX">["response"];
}
