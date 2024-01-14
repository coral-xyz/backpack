import type {
  SecureRequest,
  SecureRequestOptions,
  SecureResponse,
  TransportSender,
} from "../../types/transports";

import type { SECURE_LEDGER_EVENTS } from "./events";

export class LedgerClient {
  constructor(private client: TransportSender<SECURE_LEDGER_EVENTS, "ui">) {}

  public svmSignTransaction(
    request: SecureRequest<"LEDGER_SVM_SIGN_TX">["request"],
    options: SecureRequestOptions<"LEDGER_SVM_SIGN_TX", "ui">
  ): Promise<SecureResponse<"LEDGER_SVM_SIGN_TX", "ui">> {
    return this.client
      .send({
        name: "LEDGER_SVM_SIGN_TX",
        request,
        uiOptions: {},
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public svmSignMessage(
    request: SecureRequest<"LEDGER_SVM_SIGN_MESSAGE">["request"],
    options: SecureRequestOptions<"LEDGER_SVM_SIGN_MESSAGE", "ui">
  ): Promise<SecureResponse<"LEDGER_SVM_SIGN_MESSAGE", "ui">> {
    return this.client
      .send({
        name: "LEDGER_SVM_SIGN_MESSAGE",
        request,
        uiOptions: {},
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public evmSignMessage(
    request: SecureRequest<"LEDGER_EVM_SIGN_MESSAGE">["request"],
    options: SecureRequestOptions<"LEDGER_EVM_SIGN_MESSAGE", "ui">
  ): Promise<SecureResponse<"LEDGER_EVM_SIGN_MESSAGE", "ui">> {
    return this.client
      .send({
        name: "LEDGER_EVM_SIGN_MESSAGE",
        request,
        uiOptions: {},
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public evmSignTransaction(
    request: SecureRequest<"LEDGER_EVM_SIGN_TX">["request"],
    options: SecureRequestOptions<"LEDGER_EVM_SIGN_TX", "ui">
  ): Promise<SecureResponse<"LEDGER_EVM_SIGN_TX", "ui">> {
    return this.client
      .send({
        name: "LEDGER_EVM_SIGN_TX",
        request,
        uiOptions: {},
        ...options,
      })
      .then((response) => {
        return response;
      });
  }
}
