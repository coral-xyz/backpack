import type { SecureEvent } from "../../types/events";
import type {
  SecureRequest,
  SecureResponse,
  TransportSender,
} from "../../types/transports";
import type { SECURE_SVM_SIGN_MESSAGE } from "../svm/events";

export class SVMClient {
  constructor(private client: TransportSender) {}

  public signMessage(
    request: SecureRequest<"SECURE_SVM_SIGN_MESSAGE">["request"],
    uiOptions?: SecureRequest<"SECURE_SVM_SIGN_MESSAGE">["uiOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_MESSAGE">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_MESSAGE",
        request,
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }

  public signTransaction(
    request: SecureRequest<"SECURE_SVM_SIGN_TX">["request"],
    uiOptions?: SecureRequest<"SECURE_SVM_SIGN_TX">["uiOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_TX">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_TX",
        request,
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }

  public signAllTransactions(
    request: SecureRequest<"SECURE_SVM_SIGN_ALL_TX">["request"],
    uiOptions?: SecureRequest<"SECURE_SVM_SIGN_ALL_TX">["uiOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_ALL_TX">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_ALL_TX",
        request,
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }

  public connect(
    request: SecureEvent<"SECURE_SVM_CONNECT">["request"] = {},
    uiOptions?: SecureEvent<"SECURE_SVM_CONNECT">["uiOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_CONNECT">> {
    return this.client
      .send({
        name: "SECURE_SVM_CONNECT",
        request: request,
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }

  public disconnect(
    request?: SecureEvent<"SECURE_SVM_DISCONNECT">["request"],
    uiOptions?: SecureEvent<"SECURE_SVM_DISCONNECT">["uiOptions"]
  ): Promise<SecureResponse<"SECURE_SVM_DISCONNECT">> {
    return this.client
      .send({
        name: "SECURE_SVM_DISCONNECT",
        request: request ?? {},
        uiOptions,
      })
      .then((response) => {
        return response;
      });
  }
}
