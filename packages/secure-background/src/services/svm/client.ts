import type { SecureEvent } from "../../events";
import type {
  SecureRequest,
  SecureRequestOptions,
  SecureResponse,
  TransportSender,
} from "../../types/transports";

export class SVMClient {
  constructor(private client: TransportSender) {}

  public signMessage(
    request: SecureRequest<"SECURE_SVM_SIGN_MESSAGE">["request"],
    options: SecureRequestOptions<"SECURE_SVM_SIGN_MESSAGE"> = {}
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_MESSAGE">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_MESSAGE",
        request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public signTransaction(
    request: SecureRequest<"SECURE_SVM_SIGN_TX">["request"],
    options: SecureRequestOptions<"SECURE_SVM_SIGN_TX"> = {}
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_TX">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_TX",
        request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public signAllTransactions(
    request: SecureRequest<"SECURE_SVM_SIGN_ALL_TX">["request"],
    options: SecureRequestOptions<"SECURE_SVM_SIGN_ALL_TX"> = {}
  ): Promise<SecureResponse<"SECURE_SVM_SIGN_ALL_TX">> {
    return this.client
      .send({
        name: "SECURE_SVM_SIGN_ALL_TX",
        request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public connect(
    request: SecureEvent<"SECURE_SVM_CONNECT">["request"],
    options: SecureRequestOptions<"SECURE_SVM_CONNECT"> = {}
  ): Promise<SecureResponse<"SECURE_SVM_CONNECT">> {
    return this.client
      .send({
        name: "SECURE_SVM_CONNECT",
        request: request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public disconnect(
    request: SecureEvent<"SECURE_SVM_DISCONNECT">["request"] = {},
    options: SecureRequestOptions<"SECURE_SVM_DISCONNECT"> = {}
  ): Promise<SecureResponse<"SECURE_SVM_DISCONNECT">> {
    return this.client
      .send({
        name: "SECURE_SVM_DISCONNECT",
        request: request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }

  public previewPublicKeys(
    request: SecureRequest<"SECURE_SVM_PREVIEW_PUBLIC_KEYS">["request"],
    options: SecureRequestOptions<"SECURE_SVM_PREVIEW_PUBLIC_KEYS"> = {}
  ): Promise<SecureResponse<"SECURE_SVM_PREVIEW_PUBLIC_KEYS">> {
    return this.client
      .send({
        name: "SECURE_SVM_PREVIEW_PUBLIC_KEYS",
        request,
        ...options,
      })
      .then((response) => {
        return response;
      });
  }
}
