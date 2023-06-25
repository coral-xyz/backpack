import type {
  SecureRequest,
  SecureResponse,
  TransportSender,
} from "../../types/transports";

import type { SECURE_LEDGER_EVENTS } from "./events";

export class LedgerClient {
  constructor(
    private client: TransportSender<SECURE_LEDGER_EVENTS, "uiResponse">
  ) {}

  public svmSignTransaction(
    request: SecureRequest<"LEDGER_SVM_SIGN_TX">["request"],
    uiOptions?: SecureRequest<"LEDGER_SVM_SIGN_TX">["uiOptions"]
  ): Promise<SecureResponse<"LEDGER_SVM_SIGN_TX", "uiResponse">> {
    return this.client
      .send({
        name: "LEDGER_SVM_SIGN_TX",
        request,
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }

  public svmSignMessage(
    request: SecureRequest<"LEDGER_SVM_SIGN_MESSAGE">["request"],
    uiOptions?: SecureRequest<"LEDGER_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<SecureResponse<"LEDGER_SVM_SIGN_MESSAGE", "uiResponse">> {
    return this.client
      .send({
        name: "LEDGER_SVM_SIGN_MESSAGE",
        request,
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }
}
